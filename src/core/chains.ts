import type { ChainConfig } from '../types';

export const supportedChains: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrls: ['https://eth.llamarpc.com'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://etherscan.io'],
  },
  {
    id: 8453,
    name: 'Base',
    rpcUrls: ['https://mainnet.base.org'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://basescan.org'],
  },
  {
    id: 11155111,
    name: 'Sepolia',
    rpcUrls: ['https://rpc.sepolia.org'],
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
];

export function toHexChainId(chainId: number): string {
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error(`Invalid chain id: ${chainId}`);
  }

  return `0x${chainId.toString(16)}`;
}

export function parseChainId(chainId: number | string): number {
  if (typeof chainId === 'number') {
    return chainId;
  }

  if (chainId.toLowerCase().startsWith('0x')) {
    return Number.parseInt(chainId, 16);
  }

  return Number.parseInt(chainId, 10);
}

export function findChain(chains: ChainConfig[], chainId: number): ChainConfig | undefined {
  return chains.find((chain) => chain.id === chainId);
}

export function isSupportedChain(chains: ChainConfig[], chainId: number): boolean {
  return Boolean(findChain(chains, chainId));
}

export function getDefaultChain(chains: ChainConfig[], defaultChainId?: number): ChainConfig | undefined {
  if (defaultChainId) {
    return findChain(chains, defaultChainId);
  }

  return chains[0];
}

export function toAddEthereumChainParams(chain: ChainConfig): Record<string, unknown> {
  return {
    chainId: toHexChainId(chain.id),
    chainName: chain.name,
    rpcUrls: chain.rpcUrls,
    nativeCurrency: chain.nativeCurrency,
    blockExplorerUrls: chain.blockExplorerUrls,
  };
}
