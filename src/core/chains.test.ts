import { describe, expect, it } from 'vitest';
import { findChain, isSupportedChain, parseChainId, supportedChains, toAddEthereumChainParams, toHexChainId } from './chains';

const chains = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrls: ['https://eth.llamarpc.com'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 8453,
    name: 'Base',
    rpcUrls: ['https://mainnet.base.org'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
];

describe('chains', () => {
  it('converts decimal chain IDs to hex', () => {
    expect(toHexChainId(8453)).toBe('0x2105');
  });

  it('parses hex and decimal chain IDs', () => {
    expect(parseChainId('0x2105')).toBe(8453);
    expect(parseChainId('8453')).toBe(8453);
    expect(parseChainId(1)).toBe(1);
  });

  it('finds and checks supported chains', () => {
    expect(findChain(chains, 8453)?.name).toBe('Base');
    expect(isSupportedChain(chains, 8453)).toBe(true);
    expect(isSupportedChain(chains, 10)).toBe(false);
  });

  it('includes Sepolia as a supported test network', () => {
    const sepolia = findChain(supportedChains, 11155111);

    expect(sepolia).toMatchObject({
      id: 11155111,
      name: 'Sepolia',
      rpcUrls: ['https://rpc.sepolia.org'],
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    });
    expect(toAddEthereumChainParams(sepolia!)).toMatchObject({
      chainId: '0xaa36a7',
      chainName: 'Sepolia',
    });
  });
});
