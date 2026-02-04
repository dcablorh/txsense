
export interface SuiTransactionBlockResponse {
  digest: string;
  transaction?: {
    data: {
      messageVersion: string;
      transaction: {
        kind: string;
        inputs: any[];
        transactions: any[];
      };
      sender: string;
      gasData: {
        payment: { objectId: string; version: number; digest: string }[];
        owner: string;
        price: string;
        budget: string;
      };
    };
  };
  effects?: {
    status: { status: 'success' | 'failure'; error?: string };
    gasUsed: {
      computationCost: string;
      storageCost: string;
      storageRebate: string;
      nonRefundableStorageFee: string;
    };
    executedEpoch: string;
  };
  balanceChanges?: {
    owner: { AddressOwner: string } | { ObjectOwner: string } | string;
    coinType: string;
    amount: string;
  }[];
  objectChanges?: {
    type: 'published' | 'transferred' | 'deleted' | 'wrapped' | 'created' | 'mutated';
    sender: string;
    owner: { AddressOwner: string } | { ObjectOwner: string } | string;
    objectType: string;
    objectId: string;
    version: string;
    digest: string;
  }[];
  events?: any[];
  timestampMs?: string;
  checkpoint?: string;
}

export interface CoinMetadata {
  id: string;
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  iconUrl?: string;
}

export interface InvolvedParty {
  address: string;
  role: string;
  label?: string;
}

export interface ExplanationResult {
  raw: SuiTransactionBlockResponse;
  summary: string;
  technicalPlayByPlay: string;
  mermaidCode?: string;
  protocol?: string;
  actionType?: string;
  coinMetadata: Record<string, CoinMetadata>;
  involvedParties?: InvolvedParty[];
}

export interface PackageExplanationResult {
  packageId: string;
  summary: string;
  modules: string[];
  capabilities: string[];
}

export interface KnownPackage {
  id: string;
  name: string;
}

export type InputType = 'transaction' | 'package' | 'unknown';
