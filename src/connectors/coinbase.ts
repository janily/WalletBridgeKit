import { InjectedConnector } from './injected';
import type { Eip1193Provider, WalletBridgeConfig } from '../types';

export class CoinbaseConnector extends InjectedConnector {
  private sdkProvider: Eip1193Provider | null = null;

  constructor(private readonly config?: Pick<WalletBridgeConfig, 'appName' | 'chains'>) {
    super({
      id: 'coinbase',
      name: 'Coinbase Wallet',
      predicate: (provider) => Boolean(provider.isCoinbaseWallet),
    });
  }

  protected override resolveProvider(): Eip1193Provider | null {
    return super.resolveProvider() ?? this.sdkProvider;
  }

  override detect(): boolean {
    if (super.detect()) {
      return true;
    }

    return typeof window !== 'undefined';
  }

  override async connect() {
    if (!super.detect() && !this.sdkProvider && typeof window !== 'undefined') {
      const { default: CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk');
      const sdk = new CoinbaseWalletSDK({
        appName: this.config?.appName ?? 'WalletBridgeKit',
      });
      this.sdkProvider = sdk.makeWeb3Provider() as Eip1193Provider;
    }

    return super.connect();
  }
}
