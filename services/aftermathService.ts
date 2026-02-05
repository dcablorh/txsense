// Aftermath API for coin metadata

const AFTERMATH_API_URL = "https://aftermath.finance/api/coins/metadata";

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
          iconUrl: metadata.iconUrl || undefined,
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
