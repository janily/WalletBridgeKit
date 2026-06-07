import { useCallback, useMemo } from 'react';
import { useWalletStore } from '../store/wallet-store';
import type { WalletType } from '../types';
import { useWalletBridgeContext } from './context';

export function useWallet() {
  return useWalletStore();
}

export function useConnect() {
  const { service } = useWalletBridgeContext();
  const status = useWalletStore((state) => state.status);

  const connect = useCallback(
    async (walletType: WalletType) => {
      return service.connect(walletType);
    },
    [service],
  );

  return useMemo(
    () => ({
      connect,
      connectors: service.connectors,
      isConnecting: status === 'connecting',
    }),
    [connect, service.connectors, status],
  );
}

export function useDisconnect() {
  const { service } = useWalletBridgeContext();
  const status = useWalletStore((state) => state.status);

  const disconnect = useCallback(async () => {
    await service.disconnect();
  }, [service]);

  return {
    disconnect,
    isDisconnecting: status === 'disconnecting',
  };
}

export function useSwitchChain() {
  const { service } = useWalletBridgeContext();
  const isSwitchingChain = useWalletStore((state) => state.isSwitchingChain);
  const error = useWalletStore((state) => state.error);

  const switchChain = useCallback(
    async (chainId: number) => {
      await service.switchChain(chainId);
    },
    [service],
  );

  return {
    switchChain,
    isSwitchingChain,
    error,
  };
}

export function useBalance() {
  const { service } = useWalletBridgeContext();
  const balance = useWalletStore((state) => state.balance);
  const status = useWalletStore((state) => state.status);

  const refreshBalance = useCallback(async () => {
    await service.refreshBalance();
  }, [service]);

  return {
    balance,
    refreshBalance,
    isLoading: status === 'connecting' || status === 'reconnecting',
  };
}

export function useWalletBridgeConfig() {
  return useWalletBridgeContext().config;
}
