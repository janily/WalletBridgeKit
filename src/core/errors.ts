import type { WalletBridgeError, WalletBridgeErrorCode, WalletType } from '../types';

const USER_REJECTED_CODES = new Set([4001, '4001', 'ACTION_REJECTED']);

export function createWalletBridgeError(
  code: WalletBridgeErrorCode,
  message: string,
  options: {
    cause?: unknown;
    walletType?: WalletType;
    chainId?: number;
  } = {},
): WalletBridgeError {
  return {
    code,
    message,
    ...options,
  };
}

export function isWalletBridgeError(value: unknown): value is WalletBridgeError {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'code' in value &&
      'message' in value &&
      typeof (value as WalletBridgeError).message === 'string',
  );
}

export function normalizeProviderError(
  error: unknown,
  fallbackCode: WalletBridgeErrorCode,
  fallbackMessage: string,
  options: {
    walletType?: WalletType;
    chainId?: number;
  } = {},
): WalletBridgeError {
  if (isWalletBridgeError(error)) {
    return error;
  }

  const providerError = error as { code?: number | string; message?: string };
  if (USER_REJECTED_CODES.has(providerError?.code ?? '')) {
    return createWalletBridgeError('USER_REJECTED', 'User rejected the wallet request.', {
      cause: error,
      ...options,
    });
  }

  return createWalletBridgeError(fallbackCode, providerError?.message || fallbackMessage, {
    cause: error,
    ...options,
  });
}
