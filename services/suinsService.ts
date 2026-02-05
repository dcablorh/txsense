import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

// Single instance of SuiJsonRpcClient
let suiClient: SuiJsonRpcClient | null = null;

const getSuiClient = (): SuiJsonRpcClient => {
  if (!suiClient) {
    suiClient = new SuiJsonRpcClient({
      url: getJsonRpcFullnodeUrl('mainnet'),
      network: 'mainnet',
    });
  }
  return suiClient;
};

// In-memory cache to avoid repeated lookups
const nameCache = new Map<string, string | null>();

/**
 * Resolves a Sui address to its default SuiNS name (reverse lookup).
 * Returns null if no name is registered for the address.
 */
export const resolveSuinsName = async (address: string): Promise<string | null> => {
  if (nameCache.has(address)) {
    return nameCache.get(address) || null;
  }

  try {
    const client = getSuiClient();
    const result = await client.resolveNameServiceNames({ address, limit: 1 });
    const name = result.data?.[0] || null;
    nameCache.set(address, name);
    return name;
  } catch (error) {
    console.error(`SuiNS lookup failed for ${address}:`, error);
    nameCache.set(address, null);
    return null;
  }
};

/**
 * Batch resolve multiple addresses to SuiNS names.
 * Returns a map of address -> name (or null if no name).
 */
export const resolveSuinsNames = async (addresses: string[]): Promise<Map<string, string | null>> => {
  const uniqueAddresses = [...new Set(addresses)];
  const results = new Map<string, string | null>();

  await Promise.all(
    uniqueAddresses.map(async (address) => {
      const name = await resolveSuinsName(address);
      results.set(address, name);
    })
  );

  return results;
};
