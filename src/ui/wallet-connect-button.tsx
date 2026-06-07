import { useState } from 'react';
import { useDisconnect, useWallet } from '../react/hooks';
import { WalletModal } from './wallet-modal';

export interface WalletConnectButtonProps {
  label?: string;
  connectedLabel?: (address: string) => string;
}

export function WalletConnectButton({
  label = 'Connect Wallet',
  connectedLabel = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`,
}: WalletConnectButtonProps) {
  const [open, setOpen] = useState(false);
  const { address, status } = useWallet();
  const { disconnect, isDisconnecting } = useDisconnect();

  if (address && status === 'connected') {
    return (
      <div className="wbk-status">
        <button className="wbk-button wbk-button-secondary" type="button">
          {connectedLabel(address)}
        </button>
        <button className="wbk-button" disabled={isDisconnecting} type="button" onClick={() => void disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button className="wbk-button" type="button" onClick={() => setOpen(true)}>
        {status === 'connecting' ? 'Connecting...' : label}
      </button>
      <WalletModal open={open} onOpenChange={setOpen} />
    </>
  );
}
