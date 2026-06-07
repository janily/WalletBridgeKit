import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWalletState, resetWalletState } from '../store/wallet-store';
import type {
  ChainConfig,
  Eip1193Provider,
  WalletBalance,
  WalletConnection,
  WalletConnector,
  WalletEventHandler,
  WalletEventName,
  WalletType,
} from '../types';
import { WalletService } from './wallet-service';

const chains: ChainConfig[] = [
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

class MockConnector implements WalletConnector {
  id: WalletType = 'metamask';
  name = 'Mock MetaMask';
  provider: Eip1193Provider = {
    request: vi.fn(),
  };
  handlers = new Map<WalletEventName, WalletEventHandler>();
  chainId = 1;
  accounts = ['0x1234567890abcdef'];
  switchChainMock = vi.fn(async (chainId: number) => {
    this.chainId = chainId;
  });

  detect() {
    return true;
  }

  async connect(): Promise<WalletConnection> {
    return {
      address: this.accounts[0],
      accounts: this.accounts,
      chainId: this.chainId,
      provider: this.provider,
      walletType: this.id,
    };
  }

  async disconnect() {
    this.accounts = [];
  }

  async reconnect() {
    return this.connect();
  }

  async switchChain(chainId: number) {
    await this.switchChainMock(chainId);
  }

  getProvider() {
    return this.provider;
  }

  async getBalance(): Promise<WalletBalance> {
    return {
      value: 1n,
      formatted: '0.000000000000000001',
      symbol: 'ETH',
      decimals: 18,
    };
  }

  on(event: WalletEventName, handler: WalletEventHandler) {
    this.handlers.set(event, handler);
  }

  off(event: WalletEventName) {
    this.handlers.delete(event);
  }

  emit(event: WalletEventName, value: unknown) {
    this.handlers.get(event)?.(value);
  }
}

describe('WalletService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetWalletState();
  });

  it('connects wallet and writes global state', async () => {
    const connector = new MockConnector();
    const service = new WalletService({ appName: 'Test', chains, connectors: [connector] });

    await service.connect('metamask');

    expect(getWalletState()).toMatchObject({
      status: 'connected',
      address: '0x1234567890abcdef',
      chainId: 1,
      walletType: 'metamask',
    });
    expect(getWalletState().balance?.symbol).toBe('ETH');
  });

  it('updates chain state from chainChanged event', async () => {
    const connector = new MockConnector();
    const service = new WalletService({ appName: 'Test', chains, connectors: [connector] });

    await service.connect('metamask');
    connector.emit('chainChanged', '0x2105');

    expect(getWalletState().chainId).toBe(8453);
  });

  it('sets unsupported chain error from chainChanged event', async () => {
    const connector = new MockConnector();
    const service = new WalletService({ appName: 'Test', chains, connectors: [connector] });

    await service.connect('metamask');
    connector.emit('chainChanged', '0x999');

    expect(getWalletState().error?.code).toBe('UNSUPPORTED_CHAIN');
  });

  it('switches chain and clears switching flag', async () => {
    const connector = new MockConnector();
    const service = new WalletService({ appName: 'Test', chains, connectors: [connector] });

    await service.connect('metamask');
    await service.switchChain(8453);

    expect(connector.switchChainMock).toHaveBeenCalledWith(8453);
    expect(getWalletState().chainId).toBe(8453);
    expect(getWalletState().isSwitchingChain).toBe(false);
  });

  it('returns chain not configured for unknown chain', async () => {
    const connector = new MockConnector();
    const service = new WalletService({ appName: 'Test', chains, connectors: [connector] });

    await service.connect('metamask');
    await expect(service.switchChain(10)).rejects.toMatchObject({ code: 'CHAIN_NOT_CONFIGURED' });
  });
});
