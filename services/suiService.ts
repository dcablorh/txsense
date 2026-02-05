
import { SUI_RPC_URL } from '../constants';
import { SuiTransactionBlockResponse, InputType, CoinMetadata } from '../types';

// In-memory cache to speed up repeated lookups
const metadataCache = new Map<string, CoinMetadata>();

export const fetchTransactionDetails = async (digest: string): Promise<SuiTransactionBlockResponse> => {
  const response = await fetch(SUI_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getTransactionBlock',
      params: [
        digest,
        {
          showInput: true,
          showEffects: true,
          showObjectChanges: true,
          showBalanceChanges: true,
          showEvents: true
        }
      ]
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch transaction data');
  }
  return data.result;
};

export const fetchCoinMetadata = async (coinType: string): Promise<CoinMetadata | null> => {
  // Return from cache if available
  if (metadataCache.has(coinType)) {
    return metadataCache.get(coinType)!;
  }

  const response = await fetch(SUI_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getCoinMetadata',
      params: [coinType]
    })
  });

  const data = await response.json();
  if (data.result) {
    const meta = { ...data.result, id: coinType };
    metadataCache.set(coinType, meta);
    return meta;
  }
  return null;
};

export const fetchPackageModules = async (packageId: string): Promise<any> => {
  const response = await fetch(SUI_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getNormalizedMoveModulesByPackage',
      params: [packageId]
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch package data');
  }
  return data.result;
};

export const fetchRandomTransactionDigest = async (): Promise<string> => {
  // 1. Get latest checkpoint sequence number
  const latestResponse = await fetch(SUI_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getLatestCheckpointSequenceNumber',
      params: []
    })
  });
  const latestData = await latestResponse.json();
  const latest = parseInt(latestData.result);

  // 2. Pick a random checkpoint from the last 100
  const randomCheckpointSeq = latest - Math.floor(Math.random() * 100);

  // 3. Get transactions for that checkpoint
  const checkpointResponse = await fetch(SUI_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getCheckpoint',
      params: [randomCheckpointSeq.toString()]
    })
  });
  const checkpointData = await checkpointResponse.json();
  const transactions = checkpointData.result.transactions;

  if (!transactions || transactions.length === 0) {
    // Fallback if empty
    return fetchRandomTransactionDigest();
  }

  // 4. Return a random digest from the checkpoint
  return transactions[Math.floor(Math.random() * transactions.length)];
};

export const identifyInput = (input: string): { type: InputType; id: string | null } => {
  const trimmed = input.trim();
  const packageRegex = /^0x[a-fA-F0-9]+$/;
  const digestRegex = /[1-9A-HJ-NP-Za-km-z]{43,45}/;

  let cleanInput = trimmed;
  try {
    if (trimmed.startsWith('http')) {
      const url = new URL(trimmed);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const txIndex = pathParts.findIndex(p => p === 'txblock' || p === 'tx');
      const pkgIndex = pathParts.findIndex(p => p === 'package' || p === 'object');
      
      if (txIndex !== -1 && pathParts[txIndex + 1]) {
        cleanInput = pathParts[txIndex + 1];
      } else if (pkgIndex !== -1 && pathParts[pkgIndex + 1]) {
        cleanInput = pathParts[pkgIndex + 1];
      } else if (pathParts.length > 0) {
        cleanInput = pathParts[pathParts.length - 1];
      }
    }
  } catch (e) {}

  if (packageRegex.test(cleanInput)) {
    return { type: 'package', id: cleanInput };
  }
  
  const digestMatch = cleanInput.match(digestRegex);
  if (digestMatch) {
    return { type: 'transaction', id: digestMatch[0] };
  }

  return { type: 'unknown', id: null };
};
