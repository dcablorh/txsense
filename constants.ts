
import { KnownPackage } from './types';

export const SUI_RPC_URL = 'https://fullnode.mainnet.sui.io:443';

export const KNOWN_PACKAGES: KnownPackage[] = [
  { id: '0x1', name: 'Sui Standard Library' },
  { id: '0x2', name: 'Sui Framework' },
  { id: '0x3', name: 'Sui System' },
  { id: '0x1eab094c502c42b29be2535787f3b610c43666d736780829a295552345e612f0', name: 'Cetus DEX' },
  { id: '0xdee9', name: 'DeepBook' },
  { id: '0xdee9::clob_v2', name: 'DeepBook V2' },
  { id: '0xdee9::clob_v3', name: 'DeepBook V3' },
  { id: '0xbc3af878b651fd573cf907544ef7656bd8fc910fa095886915994472f2736aba', name: 'Aftermath Finance' },
  { id: '0x48d39f604d57c96365a6e87f7112836254130635293297a79e49a88880d97970', name: 'Scallop Lending' },
  { id: '0x0686483134372f7af61937966f10399564f344f62f8350616b3f79020473922c', name: 'Navi Protocol' },
  { id: '0x153920977232230e9d6b2c62c9339e875f1ec2df887e076722d7159f8c0a9697', name: 'BlueMove' },
  { id: '0x714a63a0dba6ca4fbc71c9bc449c5d79f04e43ca0a8f86915467ad00490b439c', name: 'Turbos Finance' },
  { id: '0x217036d0a790f968ef211a76c02452c93bc92801452c42c2ef16b5093557e937', name: 'KriyaDEX' },
  { id: '0x5d4b3023066494aba4c7711d59c639b0ad17a7d451f9db43d50f0653f47a5444', name: 'Wormhole Bridged USDC' },
  { id: '0x2::sui::SUI', name: 'Sui Token' }
];

export const MIST_PER_SUI = 1_000_000_000n;

export const EXPLORER_URL = 'https://suivision.xyz/txblock/';
