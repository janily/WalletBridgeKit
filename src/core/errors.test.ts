import { describe, expect, it } from 'vitest';
import { createWalletBridgeError, isWalletBridgeError, normalizeProviderError } from './errors';

describe('errors', () => {
  it('creates wallet bridge errors', () => {
    const error = createWalletBridgeError('UNSUPPORTED_CHAIN', 'Unsupported chain.', {
      walletType: 'metamask',
      chainId: 8453,
    });

    expect(error).toMatchObject({
      code: 'UNSUPPORTED_CHAIN',
      message: 'Unsupported chain.',
      walletType: 'metamask',
      chainId: 8453,
    });
    expect(isWalletBridgeError(error)).toBe(true);
  });

  it('normalizes provider user rejection', () => {
    const error = normalizeProviderError({ code: 4001 }, 'CONNECT_FAILED', 'Failed.');

    expect(error.code).toBe('USER_REJECTED');
  });

  it('uses fallback code for generic errors', () => {
    const error = normalizeProviderError(new Error('Nope'), 'SWITCH_CHAIN_FAILED', 'Switch failed.');

    expect(error.code).toBe('SWITCH_CHAIN_FAILED');
    expect(error.message).toBe('Nope');
  });
});
