# Components

```tsx
import {
  ChainSwitcher,
  WalletBridgeProvider,
  WalletConnectButton,
  WalletStatus,
  supportedChains,
} from '@janily/walletbridgekit';

export default () => (
  <WalletBridgeProvider
    config={{
      appName: 'WalletBridgeKit Demo',
      chains: supportedChains,
      autoReconnect: false,
      defaultChainId: 8453,
      walletConnectProjectId: 'demo-project-id',
    }}
  >
    <div style={{ display: 'grid', gap: 16 }}>
      <WalletConnectButton />
      <ChainSwitcher />
      <WalletStatus />
    </div>
  </WalletBridgeProvider>
);
```
