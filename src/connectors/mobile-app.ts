import { WalletConnectConnector } from './walletconnect';
import type { WalletBridgeConfig, WalletType } from '../types';

export class MobileAppConnector extends WalletConnectConnector {
  override readonly id: WalletType = 'mobile-app';
  override readonly name = 'Mobile Wallet App';

  constructor(config: WalletBridgeConfig) {
    super({
      ...config,
      walletConnectShowQrModal: false,
    });
  }
}
