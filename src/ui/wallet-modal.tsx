import { useMemo } from 'react';
import { useConnect } from '../react/hooks';
import type { WalletType } from '../types';

export interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: (walletType: WalletType) => void | Promise<void>;
  title?: string;
}

export function WalletModal({ open, onOpenChange, onConnect, title = 'Connect wallet' }: WalletModalProps) {
  const { connectors, connect, isConnecting } = useConnect();
  const availableConnectors = useMemo(() => connectors, [connectors]);

  if (!open) {
    return null;
  }

  return (
    <div className="wbk-modal-backdrop" role="presentation" onClick={() => onOpenChange(false)}>
      <div className="wbk-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="wbk-modal-header">
          <h2>{title}</h2>
          <button className="wbk-icon-button" type="button" aria-label="Close wallet modal" onClick={() => onOpenChange(false)}>
            x
          </button>
        </div>
        <div className="wbk-wallet-list">
          {availableConnectors.map((connector) => (
            <button
              className="wbk-wallet-option"
              disabled={isConnecting}
              key={connector.id}
              type="button"
              onClick={async () => {
                await connect(connector.id);
                await onConnect?.(connector.id);
                onOpenChange(false);
              }}
            >
              <span>{connector.name}</span>
              <span className="wbk-wallet-kind">{connector.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
