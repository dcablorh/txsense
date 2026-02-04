
import { KnownPackage } from './types';

export const SUI_RPC_URL = 'https://fullnode.mainnet.sui.io:443';

export const KNOWN_PACKAGES: KnownPackage[] = [
  { id: '0x1', name: 'Sui Standard Library' },
  { id: '0x2', name: 'Sui Framework' },
  { id: '0x3', name: 'Sui System' },
  { id: '0x1eab094c502c42b29be2535787f3b610c43666d736780829a295552345e612f0', name: 'Cetus DEX' },
  { id: '0xdee9', name: 'DeepBook' },
  { id: '0xbc3af878b651fd573cf907544ef7656bd8fc910fa095886915994472f2736aba', name: 'Aftermath Finance' },
  { id: '0x48d39f604d57c96365a6e87f7112836254130635293297a79e49a88880d97970', name: 'Scallop Lending' },
  { id: '0x0686483134372f7af61937966f10399564f344f62f8350616b3f79020473922c', name: 'Navi Protocol' },
  { id: '0x153920977232230e9d6b2c62c9339e875f1ec2df887e076722d7159f8c0a9697', name: 'BlueMove' }
];

export const MIST_PER_SUI = 1_000_000_000n;

export const EXPLORER_URL = 'https://suivision.xyz/txblock/';
