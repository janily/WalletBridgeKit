import type { Eip1193Provider } from '../types';

export type ProviderPredicate = (provider: Eip1193Provider) => boolean;

export function getInjectedProviders(): Eip1193Provider[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const ethereum = (window as Window & { ethereum?: Eip1193Provider }).ethereum;
  if (!ethereum) {
    return [];
  }

  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    return ethereum.providers;
  }

  return [ethereum];
}

export function findInjectedProvider(predicate: ProviderPredicate): Eip1193Provider | null {
  return getInjectedProviders().find(predicate) ?? null;
}

export async function requestProvider<T>(
  provider: Eip1193Provider,
  method: string,
  params?: unknown[] | Record<string, unknown>,
): Promise<T> {
  return provider.request<T>({ method, params });
}
