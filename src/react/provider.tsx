import { type PropsWithChildren, useEffect, useMemo } from 'react';
import { WalletService } from '../core/wallet-service';
import type { WalletBridgeConfig } from '../types';
import { WalletBridgeContext } from './context';

export interface WalletBridgeProviderProps extends PropsWithChildren {
  config: WalletBridgeConfig;
}

export function WalletBridgeProvider({ children, config }: WalletBridgeProviderProps) {
  const service = useMemo(() => new WalletService(config), [config]);

  useEffect(() => {
    if (config.autoReconnect === false) {
      return;
    }

    void service.reconnect();
  }, [config.autoReconnect, service]);

  return <WalletBridgeContext.Provider value={{ config, service }}>{children}</WalletBridgeContext.Provider>;
}
