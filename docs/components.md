# Components

```tsx
import { ChainSwitcher, WalletBridgeProvider, WalletConnectButton, WalletStatus } from '@zeroone/walletbridgekit';

const chains = [
  {
    id: 8453,
    name: 'Base',
    rpcUrls: ['https://mainnet.base.org'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://basescan.org'],
  },
  {
    id: 1,
    name: 'Ethereum',
    rpcUrls: ['https://eth.llamarpc.com'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://etherscan.io'],
  },
];

export default () => (
  <WalletBridgeProvider
    config={{
      appName: 'WalletBridgeKit Demo',
      chains,
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
