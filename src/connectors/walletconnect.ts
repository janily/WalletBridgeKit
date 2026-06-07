import { formatEther } from 'viem';
import { parseChainId, toAddEthereumChainParams, toHexChainId } from '../core/chains';
import { createWalletBridgeError, normalizeProviderError } from '../core/errors';
import { requestProvider } from '../core/provider';
import type {
  ChainConfig,
  Eip1193Provider,
  WalletBalance,
  WalletBridgeConfig,
  WalletConnection,
  WalletConnector,
  WalletEventHandler,
  WalletEventName,
  WalletType,
} from '../types';

export class WalletConnectConnector implements WalletConnector {
  readonly id: WalletType = 'walletconnect';
  readonly name: string = 'WalletConnect';
  protected provider: Eip1193Provider | null = null;

  constructor(protected readonly config: WalletBridgeConfig) {}

  detect(): boolean {
    return typeof window !== 'undefined';
  }

  async connect(): Promise<WalletConnection> {
    const provider = await this.getOrCreateProvider();

    try {
      await requestProvider(provider, 'eth_requestAccounts');
      const accounts = await requestProvider<string[]>(provider, 'eth_accounts');
      const chainId = parseChainId(await requestProvider<string>(provider, 'eth_chainId'));
      const address = accounts[0];
      if (!address) {
        throw createWalletBridgeError('CONNECT_FAILED', 'WalletConnect did not return an account.', {
          walletType: this.id,
        });
      }

      return {
        address,
        accounts,
        chainId,
        provider,
        walletType: this.id,
      };
    } catch (error) {
      throw normalizeProviderError(error, 'CONNECT_FAILED', 'Failed to connect WalletConnect.', {
        walletType: this.id,
      });
    }
  }

  async reconnect(): Promise<WalletConnection | null> {
    const provider = await this.getOrCreateProvider();
    const accounts = await requestProvider<string[]>(provider, 'eth_accounts');
    if (!accounts[0]) {
      return null;
    }

    return {
      address: accounts[0],
      accounts,
      chainId: parseChainId(await requestProvider<string>(provider, 'eth_chainId')),
      provider,
      walletType: this.id,
    };
  }

  async disconnect(): Promise<void> {
    const disconnectable = this.provider as Eip1193Provider & { disconnect?: () => Promise<void> };
    await disconnectable?.disconnect?.();
    this.provider = null;
  }

  async switchChain(chainId: number, chain?: ChainConfig): Promise<void> {
    const provider = await this.getOrCreateProvider();

    try {
      await requestProvider(provider, 'wallet_switchEthereumChain', [{ chainId: toHexChainId(chainId) }]);
    } catch (error) {
      const providerError = error as { code?: number | string };
      if ((providerError.code === 4902 || providerError.code === '4902') && chain) {
        await this.addChain(chain);
        await requestProvider(provider, 'wallet_switchEthereumChain', [{ chainId: toHexChainId(chainId) }]);
        return;
      }

      throw normalizeProviderError(error, 'SWITCH_CHAIN_FAILED', `Failed to switch to chain ${chainId}.`, {
        walletType: this.id,
        chainId,
      });
    }
  }

  async addChain(chain: ChainConfig): Promise<void> {
    const provider = await this.getOrCreateProvider();
    await requestProvider(provider, 'wallet_addEthereumChain', [toAddEthereumChainParams(chain)]);
  }

  getProvider(): Eip1193Provider | null {
    return this.provider;
  }

  async getBalance(address: string): Promise<WalletBalance> {
    const provider = await this.getOrCreateProvider();
    const value = BigInt(await requestProvider<string>(provider, 'eth_getBalance', [address, 'latest']));

    return {
      value,
      formatted: formatEther(value),
      symbol: 'ETH',
      decimals: 18,
    };
  }

  on(event: WalletEventName, handler: WalletEventHandler): void {
    this.provider?.on?.(event, handler);
  }

  off(event: WalletEventName, handler: WalletEventHandler): void {
    this.provider?.removeListener?.(event, handler);
  }

  protected async getOrCreateProvider(): Promise<Eip1193Provider> {
    if (this.provider) {
      return this.provider;
    }

    if (!this.config.walletConnectProjectId) {
      throw createWalletBridgeError('PROVIDER_UNAVAILABLE', 'walletConnectProjectId is required.', {
        walletType: this.id,
      });
    }

    const EthereumProvider = (await import('@walletconnect/ethereum-provider')).default;
    const chainIds = this.config.chains.map((chain) => chain.id);
    const firstChainId = chainIds[0];
    if (!firstChainId) {
      throw createWalletBridgeError('CHAIN_NOT_CONFIGURED', 'At least one chain is required for WalletConnect.', {
        walletType: this.id,
      });
    }

    this.provider = (await EthereumProvider.init({
      projectId: this.config.walletConnectProjectId,
      chains: [firstChainId],
      optionalChains: chainIds as [number, ...number[]],
      showQrModal: this.config.walletConnectShowQrModal ?? true,
      metadata: {
        name: this.config.appName,
        description: `${this.config.appName} wallet connection`,
        url: typeof window === 'undefined' ? 'https://localhost' : window.location.origin,
        icons: [],
      },
    })) as Eip1193Provider;

    return this.provider;
  }
}
