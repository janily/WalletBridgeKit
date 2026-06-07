import { formatEther } from 'viem';
import { findInjectedProvider, requestProvider } from '../core/provider';
import { toAddEthereumChainParams, toHexChainId, parseChainId } from '../core/chains';
import { createWalletBridgeError, normalizeProviderError } from '../core/errors';
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

export interface InjectedConnectorOptions {
  id: WalletType;
  name: string;
  predicate: (provider: Eip1193Provider) => boolean;
  icon?: string;
}

export class InjectedConnector implements WalletConnector {
  readonly id: WalletType;
  readonly name: string;
  readonly icon?: string;
  protected provider: Eip1193Provider | null = null;
  private readonly predicate: (provider: Eip1193Provider) => boolean;

  constructor(options: InjectedConnectorOptions) {
    this.id = options.id;
    this.name = options.name;
    this.icon = options.icon;
    this.predicate = options.predicate;
  }

  get installed(): boolean {
    return this.detect();
  }

  detect(): boolean {
    return Boolean(this.resolveProvider());
  }

  async connect(): Promise<WalletConnection> {
    const provider = this.resolveProvider();
    if (!provider) {
      throw createWalletBridgeError('WALLET_NOT_FOUND', `${this.name} wallet was not found.`, {
        walletType: this.id,
      });
    }

    try {
      const accounts = await requestProvider<string[]>(provider, 'eth_requestAccounts');
      const chainId = parseChainId(await requestProvider<string>(provider, 'eth_chainId'));
      const address = accounts[0];
      if (!address) {
        throw createWalletBridgeError('CONNECT_FAILED', `${this.name} did not return an account.`, {
          walletType: this.id,
        });
      }

      this.provider = provider;

      return {
        address,
        accounts,
        chainId,
        provider,
        walletType: this.id,
      };
    } catch (error) {
      throw normalizeProviderError(error, 'CONNECT_FAILED', `Failed to connect ${this.name}.`, {
        walletType: this.id,
      });
    }
  }

  async reconnect(): Promise<WalletConnection | null> {
    const provider = this.resolveProvider();
    if (!provider) {
      return null;
    }

    const accounts = await requestProvider<string[]>(provider, 'eth_accounts');
    if (!accounts[0]) {
      return null;
    }

    const chainId = parseChainId(await requestProvider<string>(provider, 'eth_chainId'));
    this.provider = provider;

    return {
      address: accounts[0],
      accounts,
      chainId,
      provider,
      walletType: this.id,
    };
  }

  async disconnect(): Promise<void> {
    this.provider = null;
  }

  async switchChain(chainId: number, chain?: ChainConfig): Promise<void> {
    const provider = this.getRequiredProvider();

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
    const provider = this.getRequiredProvider();

    try {
      await requestProvider(provider, 'wallet_addEthereumChain', [toAddEthereumChainParams(chain)]);
    } catch (error) {
      throw normalizeProviderError(error, 'ADD_CHAIN_FAILED', `Failed to add chain ${chain.id}.`, {
        walletType: this.id,
        chainId: chain.id,
      });
    }
  }

  getProvider(): Eip1193Provider | null {
    return this.provider ?? this.resolveProvider();
  }

  async getBalance(address: string, chainId: number): Promise<WalletBalance> {
    const provider = this.getRequiredProvider();
    const value = BigInt(await requestProvider<string>(provider, 'eth_getBalance', [address, 'latest']));

    return {
      value,
      formatted: formatEther(value),
      symbol: 'ETH',
      decimals: 18,
    };
  }

  on(event: WalletEventName, handler: WalletEventHandler): void {
    this.getProvider()?.on?.(event, handler);
  }

  off(event: WalletEventName, handler: WalletEventHandler): void {
    this.getProvider()?.removeListener?.(event, handler);
  }

  protected resolveProvider(): Eip1193Provider | null {
    return findInjectedProvider(this.predicate);
  }

  protected getRequiredProvider(): Eip1193Provider {
    const provider = this.getProvider();
    if (!provider) {
      throw createWalletBridgeError('PROVIDER_UNAVAILABLE', `${this.name} provider is unavailable.`, {
        walletType: this.id,
      });
    }

    return provider;
  }
}
