import { CoinbaseConnector } from '../connectors/coinbase';
import { MetaMaskConnector } from '../connectors/metamask';
import { MobileAppConnector } from '../connectors/mobile-app';
import { WalletConnectConnector } from '../connectors/walletconnect';
import { getWalletState, setWalletState, useWalletStore } from '../store/wallet-store';
import type { ChainConfig, WalletBridgeConfig, WalletConnector, WalletConnection, WalletType } from '../types';
import { findChain, getDefaultChain, isSupportedChain, parseChainId } from './chains';
import { createWalletBridgeError, normalizeProviderError } from './errors';
import { WalletEventManager } from './event-manager';

const LAST_WALLET_KEY = 'walletbridgekit:lastConnectedWallet';
const LAST_CHAIN_KEY = 'walletbridgekit:lastChainId';

export class WalletService {
  readonly connectors: WalletConnector[];
  private currentConnector: WalletConnector | null = null;
  private eventManager = new WalletEventManager();

  constructor(readonly config: WalletBridgeConfig) {
    this.connectors =
      config.connectors ??
      [
        new MetaMaskConnector(),
        new CoinbaseConnector(config),
        new WalletConnectConnector(config),
        new MobileAppConnector(config),
      ];

    if (typeof window !== 'undefined') {
      const lastConnectedWallet = window.localStorage.getItem(LAST_WALLET_KEY) as WalletType | null;
      const lastChainId = window.localStorage.getItem(LAST_CHAIN_KEY);
      setWalletState({
        lastConnectedWallet: lastConnectedWallet ?? undefined,
        lastChainId: lastChainId ? Number(lastChainId) : undefined,
      });
    }
  }

  getConnector(walletType: WalletType): WalletConnector {
    const connector = this.connectors.find((item) => item.id === walletType);
    if (!connector) {
      throw createWalletBridgeError('PROVIDER_UNAVAILABLE', `Connector ${walletType} is not registered.`, {
        walletType,
      });
    }

    return connector;
  }

  getCurrentConnector(): WalletConnector | null {
    return this.currentConnector;
  }

  async connect(walletType: WalletType): Promise<WalletConnection> {
    const connector = this.getConnector(walletType);
    useWalletStore.getState().setConnection({
      status: 'connecting',
      error: undefined,
      walletType,
      connectorId: walletType,
    });

    try {
      const connection = await connector.connect();
      this.currentConnector = connector;
      await this.applyConnection(connection, connector);
      this.persistLastWallet(walletType, connection.chainId);
      return connection;
    } catch (error) {
      const normalized = normalizeProviderError(error, 'CONNECT_FAILED', 'Failed to connect wallet.', {
        walletType,
      });
      useWalletStore.getState().setError(normalized);
      throw normalized;
    }
  }

  async reconnect(walletType?: WalletType): Promise<WalletConnection | null> {
    const targetWallet = walletType ?? getWalletState().lastConnectedWallet;
    if (!targetWallet) {
      return null;
    }

    const connector = this.getConnector(targetWallet);
    if (!connector.reconnect) {
      return null;
    }

    useWalletStore.getState().setConnection({
      status: 'reconnecting',
      error: undefined,
    });

    try {
      const connection = await connector.reconnect();
      if (!connection) {
        useWalletStore.getState().setConnection({ status: 'disconnected' });
        return null;
      }

      this.currentConnector = connector;
      await this.applyConnection(connection, connector);
      this.persistLastWallet(targetWallet, connection.chainId);
      return connection;
    } catch (error) {
      const normalized = normalizeProviderError(error, 'RECONNECT_FAILED', 'Failed to reconnect wallet.', {
        walletType: targetWallet,
      });
      useWalletStore.getState().setError(normalized);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    const connector = this.currentConnector;
    useWalletStore.getState().setConnection({ status: 'disconnecting' });

    try {
      await connector?.disconnect();
      this.eventManager.cleanup();
      this.currentConnector = null;
      this.clearLastWallet();
      useWalletStore.getState().reset();
    } catch (error) {
      const normalized = normalizeProviderError(error, 'DISCONNECT_FAILED', 'Failed to disconnect wallet.', {
        walletType: connector?.id,
      });
      useWalletStore.getState().setError(normalized);
      throw normalized;
    }
  }

  async switchChain(chainId: number): Promise<void> {
    const connector = this.requireCurrentConnector();
    const chain = findChain(this.config.chains, chainId);

    if (!chain) {
      const error = createWalletBridgeError('CHAIN_NOT_CONFIGURED', `Chain ${chainId} is not configured.`, {
        walletType: connector.id,
        chainId,
      });
      useWalletStore.getState().setError(error);
      throw error;
    }

    useWalletStore.getState().setSwitchingChain(true);
    useWalletStore.getState().setError(undefined);

    try {
      await connector.switchChain(chainId, this.config.enableAutoAddChain === false ? undefined : chain);
      useWalletStore.getState().setChainId(chainId);
      this.persistLastWallet(connector.id, chainId);
      await this.refreshBalance();
    } catch (error) {
      const normalized = normalizeProviderError(error, 'SWITCH_CHAIN_FAILED', `Failed to switch to chain ${chainId}.`, {
        walletType: connector.id,
        chainId,
      });
      useWalletStore.getState().setError(normalized);
      throw normalized;
    } finally {
      useWalletStore.getState().setSwitchingChain(false);
    }
  }

  async refreshBalance(): Promise<void> {
    const state = getWalletState();
    const connector = this.currentConnector;
    if (!connector || !state.address || !state.chainId) {
      return;
    }

    try {
      const balance = await connector.getBalance(state.address, state.chainId);
      useWalletStore.getState().setBalance(balance);
    } catch (error) {
      useWalletStore.getState().setError(
        normalizeProviderError(error, 'BALANCE_FETCH_FAILED', 'Failed to fetch wallet balance.', {
          walletType: connector.id,
          chainId: state.chainId,
        }),
      );
    }
  }

  getDefaultChain(): ChainConfig | undefined {
    return getDefaultChain(this.config.chains, this.config.defaultChainId);
  }

  private async applyConnection(connection: WalletConnection, connector: WalletConnector): Promise<void> {
    useWalletStore.getState().setConnection({
      status: 'connected',
      address: connection.address,
      accounts: connection.accounts,
      chainId: connection.chainId,
      walletType: connection.walletType,
      connectorId: connector.id,
      provider: connection.provider,
      error: undefined,
      lastConnectedWallet: connector.id,
      lastChainId: connection.chainId,
    });

    this.bindEvents(connector);
    await this.refreshBalance();

    if (!isSupportedChain(this.config.chains, connection.chainId)) {
      useWalletStore.getState().setError(
        createWalletBridgeError('UNSUPPORTED_CHAIN', `Chain ${connection.chainId} is not supported.`, {
          walletType: connector.id,
          chainId: connection.chainId,
        }),
      );
    }
  }

  private bindEvents(connector: WalletConnector): void {
    this.eventManager.bind(connector, {
      chainChanged: async (chainId) => {
        const parsedChainId = parseChainId(chainId as string | number);
        useWalletStore.getState().setChainId(parsedChainId);
        this.persistLastWallet(connector.id, parsedChainId);

        if (!isSupportedChain(this.config.chains, parsedChainId)) {
          useWalletStore.getState().setError(
            createWalletBridgeError('UNSUPPORTED_CHAIN', `Chain ${parsedChainId} is not supported.`, {
              walletType: connector.id,
              chainId: parsedChainId,
            }),
          );
          return;
        }

        useWalletStore.getState().setError(undefined);
        await this.refreshBalance();
      },
      accountsChanged: async (accountsValue) => {
        const accounts = Array.isArray(accountsValue) ? (accountsValue as string[]) : [];
        if (accounts.length === 0) {
          await this.disconnect();
          return;
        }

        useWalletStore.getState().setConnection({
          address: accounts[0],
          accounts,
          status: 'connected',
          error: undefined,
        });
        await this.refreshBalance();
      },
      disconnect: async () => {
        await this.disconnect();
      },
    });
  }

  private requireCurrentConnector(): WalletConnector {
    if (!this.currentConnector) {
      throw createWalletBridgeError('PROVIDER_UNAVAILABLE', 'No wallet is currently connected.');
    }

    return this.currentConnector;
  }

  private persistLastWallet(walletType: WalletType, chainId?: number): void {
    useWalletStore.getState().setConnection({
      lastConnectedWallet: walletType,
      lastChainId: chainId,
    });

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(LAST_WALLET_KEY, walletType);
    if (chainId) {
      window.localStorage.setItem(LAST_CHAIN_KEY, String(chainId));
    }
  }

  private clearLastWallet(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(LAST_WALLET_KEY);
  }
}
