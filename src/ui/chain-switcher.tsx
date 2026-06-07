import { useWalletBridgeConfig, useSwitchChain, useWallet } from '../react/hooks';

export interface ChainSwitcherProps {
  label?: string;
}

export function ChainSwitcher({ label = 'Network' }: ChainSwitcherProps) {
  const config = useWalletBridgeConfig();
  const { chainId } = useWallet();
  const { switchChain, isSwitchingChain, error } = useSwitchChain();

  return (
    <label className="wbk-chain-switcher">
      <span>{label}</span>
      <select
        disabled={isSwitchingChain}
        value={chainId ?? ''}
        onChange={(event) => {
          const nextChainId = Number(event.target.value);
          if (nextChainId) {
            void switchChain(nextChainId);
          }
        }}
      >
        <option value="" disabled>
          Select network
        </option>
        {config.chains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </select>
      {error ? <span className="wbk-error">{error.message}</span> : null}
    </label>
  );
}
