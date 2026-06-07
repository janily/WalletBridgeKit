import { beforeEach, describe, expect, it } from 'vitest';
import { getWalletState, resetWalletState, setWalletState } from './wallet-store';

describe('wallet store', () => {
  beforeEach(() => {
    resetWalletState();
  });

  it('starts disconnected after reset', () => {
    expect(getWalletState().status).toBe('disconnected');
    expect(getWalletState().accounts).toEqual([]);
  });

  it('sets connection state', () => {
    setWalletState({
      status: 'connected',
      address: '0xabc',
      accounts: ['0xabc'],
      chainId: 8453,
      walletType: 'metamask',
    });

    expect(getWalletState()).toMatchObject({
      status: 'connected',
      address: '0xabc',
      chainId: 8453,
      walletType: 'metamask',
    });
  });

  it('cleans wallet data on reset', () => {
    setWalletState({
      status: 'connected',
      address: '0xabc',
      accounts: ['0xabc'],
      lastConnectedWallet: 'metamask',
    });

    resetWalletState();

    expect(getWalletState().address).toBeUndefined();
    expect(getWalletState().lastConnectedWallet).toBeUndefined();
  });
});
