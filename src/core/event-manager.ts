import type { WalletConnector, WalletEventHandler, WalletEventName } from '../types';

export class WalletEventManager {
  private cleanupCallbacks: Array<() => void> = [];

  bind(connector: WalletConnector, handlers: Partial<Record<WalletEventName, WalletEventHandler>>): void {
    this.cleanup();

    (Object.entries(handlers) as Array<[WalletEventName, WalletEventHandler | undefined]>).forEach(([event, handler]) => {
      if (!handler) {
        return;
      }

      connector.on(event, handler);
      this.cleanupCallbacks.push(() => connector.off(event, handler));
    });
  }

  cleanup(): void {
    this.cleanupCallbacks.forEach((cleanup) => cleanup());
    this.cleanupCallbacks = [];
  }
}
