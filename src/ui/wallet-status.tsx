import { useWallet } from '../react/hooks';

export function WalletStatus() {
  const { address, balance, chainId, error, status, walletType } = useWallet();

  return (
    <div className="wbk-wallet-status">
      <span>Status: {status}</span>
      {walletType ? <span>Wallet: {walletType}</span> : null}
      {address ? <span>Address: {address.slice(0, 6)}...{address.slice(-4)}</span> : null}
      {chainId ? <span>Chain: {chainId}</span> : null}
      {balance ? <span>Balance: {balance.formatted} {balance.symbol}</span> : null}
      {error ? <span className="wbk-error">{error.message}</span> : null}
    </div>
  );
}
