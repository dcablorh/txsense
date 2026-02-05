// Aftermath API for coin metadata

const AFTERMATH_API_URL = "https://aftermath.finance/api/coins/metadata";

// Fallback icons from CoinGecko CDN for coins Aftermath doesn't cover
const FALLBACK_ICONS: Record<string, string> = {
  "0x2::sui::SUI": "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::SCA": "https://assets.coingecko.com/coins/images/33371/small/scallop.png",
  "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI": "https://assets.coingecko.com/coins/images/33751/small/hasui.png",
  "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN": "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN": "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN": "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
};

// Cache for coin metadata
const coinMetadataCache = new Map<string, AftermathCoinMetadata | null>();

export interface AftermathCoinMetadata {
  name: string;
  symbol: string;
  decimals: number;
  iconUrl?: string;
}

interface AftermathApiResponse {
  decimals: number;
  name: string;
  symbol: string;
  iconUrl: string | null;
}

export const fetchAftermathCoinMetadatas = async (
  coinTypes: string[]
): Promise<Map<string, AftermathCoinMetadata>> => {
  const result = new Map<string, AftermathCoinMetadata>();

  if (coinTypes.length === 0) return result;

  // Check cache first
  const uncachedTypes: string[] = [];
  for (const coinType of coinTypes) {
    if (coinMetadataCache.has(coinType)) {
      const cached = coinMetadataCache.get(coinType);
      if (cached) result.set(coinType, cached);
    } else {
      uncachedTypes.push(coinType);
    }
  }

  if (uncachedTypes.length === 0) return result;

  try {
    const response = await fetch(AFTERMATH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coins: uncachedTypes }),
    });

    if (!response.ok) throw new Error("Failed to fetch from Aftermath API");

    const metadatas: AftermathApiResponse[] = await response.json();

    // API returns array in same order as request
    for (let i = 0; i < uncachedTypes.length; i++) {
      const coinType = uncachedTypes[i];
      const metadata = metadatas[i];

      if (metadata) {
        const data: AftermathCoinMetadata = {
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          iconUrl: metadata.iconUrl || FALLBACK_ICONS[coinType] || undefined,
        };
        coinMetadataCache.set(coinType, data);
        result.set(coinType, data);
      } else {
        coinMetadataCache.set(coinType, null);
      }
    }
  } catch (error) {
    console.error("Failed to fetch Aftermath coin metadatas:", error);
    // On error, mark as null in cache but don't provide fallback data
    for (const coinType of uncachedTypes) {
      coinMetadataCache.set(coinType, null);
    }
  }

  return result;
};
