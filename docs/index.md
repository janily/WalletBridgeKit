# WalletBridgeKit

WalletBridgeKit 是一个面向 React / Next.js 的 EVM 钱包账户 SDK，提供多钱包连接器、Zustand 全局状态、React hooks、基础 UI 组件和 dumi 文档研发环境。

## 安装

```bash
npm install @zeroone/walletbridgekit
```

## Next.js 使用

```text
'use client';

import { WalletBridgeProvider, WalletConnectButton, WalletStatus } from '@zeroone/walletbridgekit';

const chains = [
  {
    id: 8453,
    name: 'Base',
    rpcUrls: ['https://mainnet.base.org'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://basescan.org'],
  },
];

export default function WalletRoot() {
  return (
    <WalletBridgeProvider
      config={{
        appName: 'ZeroOne App',
        autoReconnect: true,
        defaultChainId: 8453,
        walletConnectProjectId: 'YOUR_PROJECT_ID',
        chains,
      }}
    >
      <WalletConnectButton />
      <WalletStatus />
    </WalletBridgeProvider>
  );
}
```

## 核心能力

- MetaMask、Coinbase Wallet、WalletConnect、移动端钱包 App 统一接入。
- Zustand 全局保存地址、账户列表、链 ID、余额、连接状态、错误状态。
- 监听 `chainChanged`，钱包内切链后自动更新全局链 ID。
- 主动 `switchChain` 失败时返回标准化错误并支持 UI 提示。
- 支持自动重连，刷新页面后恢复上一次授权的钱包。

