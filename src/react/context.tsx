import { createContext, useContext } from 'react';
import type { WalletBridgeConfig } from '../types';
import type { WalletService } from '../core/wallet-service';

export interface WalletBridgeContextValue {
  config: WalletBridgeConfig;
  service: WalletService;
}

export const WalletBridgeContext = createContext<WalletBridgeContextValue | null>(null);

export function useWalletBridgeContext(): WalletBridgeContextValue {
  const value = useContext(WalletBridgeContext);
  if (!value) {
    throw new Error('WalletBridgeKit hooks must be used inside WalletBridgeProvider.');
  }

  return value;
}
