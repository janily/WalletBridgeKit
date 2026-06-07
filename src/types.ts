export type WalletType = 'metamask' | 'coinbase' | 'walletconnect' | 'mobile-app';

export type WalletConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnecting'
  | 'disconnected'
  | 'error';

export type WalletEventName = 'chainChanged' | 'accountsChanged' | 'connect' | 'disconnect' | 'message';

export type WalletEventHandler = (...args: unknown[]) => void;

export interface Eip1193Provider {
  request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: Eip1193Provider[];
}

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
  iconUrl?: string;
}

export interface WalletBalance {
  value: bigint;
  formatted: string;
  symbol: string;
  decimals: number;
}

export interface WalletConnection {
  address: string;
  accounts: string[];
  chainId: number;
  provider: Eip1193Provider;
  walletType: WalletType;
  balance?: WalletBalance;
}

export type WalletBridgeErrorCode =
  | 'WALLET_NOT_FOUND'
  | 'USER_REJECTED'
  | 'UNSUPPORTED_CHAIN'
  | 'CHAIN_NOT_CONFIGURED'
  | 'SWITCH_CHAIN_FAILED'
  | 'ADD_CHAIN_FAILED'
  | 'CONNECT_FAILED'
  | 'DISCONNECT_FAILED'
  | 'RECONNECT_FAILED'
  | 'BALANCE_FETCH_FAILED'
  | 'PROVIDER_UNAVAILABLE';

export interface WalletBridgeError {
  code: WalletBridgeErrorCode;
  message: string;
  cause?: unknown;
  walletType?: WalletType;
  chainId?: number;
}

export interface WalletConnector {
  id: WalletType;
  name: string;
  icon?: string;
  installed?: boolean;

  detect(): boolean | Promise<boolean>;
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  reconnect?(): Promise<WalletConnection | null>;
  switchChain(chainId: number, chain?: ChainConfig): Promise<void>;
  addChain?(chain: ChainConfig): Promise<void>;
  getProvider(): Eip1193Provider | null;
  getBalance(address: string, chainId: number): Promise<WalletBalance>;
  on(event: WalletEventName, handler: WalletEventHandler): void;
  off(event: WalletEventName, handler: WalletEventHandler): void;
}

export interface WalletBridgeConfig {
  appName: string;
  chains: ChainConfig[];
  autoReconnect?: boolean;
  defaultChainId?: number;
  walletConnectProjectId?: string;
  connectors?: WalletConnector[];
  enableAutoAddChain?: boolean;
  walletConnectShowQrModal?: boolean;
}

export interface WalletState {
  status: WalletConnectionStatus;
  address?: string;
  accounts: string[];
  chainId?: number;
  balance?: WalletBalance;
  walletType?: WalletType;
  connectorId?: WalletType;
  provider?: Eip1193Provider;
  isSwitchingChain: boolean;
  error?: WalletBridgeError;
  lastConnectedWallet?: WalletType;
  lastChainId?: number;
}
