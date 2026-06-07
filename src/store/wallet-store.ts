import { create } from 'zustand';
import type { WalletBridgeError, WalletState } from '../types';

export interface WalletStore extends WalletState {
  setStatus: (status: WalletState['status']) => void;
  setConnection: (state: Partial<WalletState>) => void;
  setChainId: (chainId?: number) => void;
  setBalance: (balance?: WalletState['balance']) => void;
  setSwitchingChain: (isSwitchingChain: boolean) => void;
  setError: (error?: WalletBridgeError) => void;
  reset: () => void;
}

export const initialWalletState: WalletState = {
  status: 'idle',
  accounts: [],
  isSwitchingChain: false,
};

export const useWalletStore = create<WalletStore>((set) => ({
  ...initialWalletState,
  setStatus: (status) => set({ status }),
  setConnection: (state) => set({ ...state }),
  setChainId: (chainId) => set({ chainId, lastChainId: chainId }),
  setBalance: (balance) => set({ balance }),
  setSwitchingChain: (isSwitchingChain) => set({ isSwitchingChain }),
  setError: (error) =>
    set((state) => ({
      error,
      status: error ? 'error' : state.status,
    })),
  reset: () =>
    set({
      ...initialWalletState,
      address: undefined,
      balance: undefined,
      chainId: undefined,
      connectorId: undefined,
      error: undefined,
      lastChainId: undefined,
      lastConnectedWallet: undefined,
      provider: undefined,
      walletType: undefined,
      status: 'disconnected',
    }),
}));

export function getWalletState(): WalletStore {
  return useWalletStore.getState();
}

export function setWalletState(state: Partial<WalletState>): void {
  useWalletStore.setState(state);
}

export function resetWalletState(): void {
  useWalletStore.getState().reset();
}
