# WalletBridgeKit 技术需求设计文档

## 1. 文档信息

- 组件名称：WalletBridgeKit
- 组件类型：Web3 钱包账户 SDK + React UI Kit
- 目标形态：可发布的 npm 包
- 适用项目：React / Next.js 项目
- 支持链类型：EVM 链
- 状态管理：Zustand
- 文档版本：v0.1.0

## 2. 背景与目标

当前多个项目需要统一接入 Web3 钱包账户能力，包括 MetaMask、Coinbase Wallet、WalletConnect 以及移动端钱包 App。不同钱包在连接方式、事件回调、网络切换、断连行为、移动端唤起方式上存在差异，业务项目如果分别适配，会产生重复代码和不一致的用户体验。

WalletBridgeKit 的目标是提供一套可复用的钱包账户 SDK，将多钱包接入、账户状态、链状态、余额、自动重连、网络切换、错误提示等能力封装为统一接口，并提供 React Hooks 与可选 UI 组件，方便多个项目快速接入。

## 3. 命名建议

最终推荐名称：WalletBridgeKit

命名理由：

- Wallet：明确组件属于钱包账户接入领域。
- Bridge：表达多钱包、多 provider、多连接方式之间的统一桥接能力。
- Kit：兼具 SDK、Hooks、UI 组件的工具包定位。

备选名称：

- Web3AccountKit
- EVMWalletKit
- OmniWalletKit
- ConnectBridgeKit

## 4. 设计原则

- 多钱包统一：对 MetaMask、Coinbase、WalletConnect、移动端钱包 App 提供统一连接器模型。
- 状态集中：用户地址、链 ID、余额、连接状态、钱包类型统一进入 Zustand store。
- React 友好：提供 Provider、Hooks、可选 UI 组件。
- Next.js 兼容：避免 SSR 阶段访问 `window`，所有浏览器钱包能力延迟到客户端初始化。
- 事件可靠：重点处理 `chainChanged`、`accountsChanged`、`disconnect` 等钱包事件。
- 错误可感知：网络切换失败、钱包未安装、用户拒绝授权、连接断开等场景需要返回标准化错误，并允许 UI 展示提示。
- 可扩展：后续可以新增连接器，不影响已有业务 API。

## 5. 功能范围

### 5.1 必须支持

- 发布为 npm 包，供多个 React / Next.js 项目复用。
- 支持 EVM 钱包连接。
- 支持 MetaMask 浏览器插件。
- 支持 Coinbase Wallet。
- 支持 WalletConnect。
- 支持移动端钱包 App 接入。
- 提供 React Provider。
- 提供 React Hooks。
- 提供基础 UI 组件，例如连接按钮、钱包选择弹窗、网络切换提示。
- 使用 Zustand 管理全局钱包状态。
- 全局存储用户地址、链 ID、余额。
- 支持自动重连。
- 支持网络切换。
- 监听并处理网络切换事件。
- 网络切换失败时返回标准化错误，并允许 UI 提示。

### 5.2 暂不支持

- 非 EVM 链，例如 Solana、Bitcoin。
- 托管式内嵌钱包，例如 Privy、Magic、Web3Auth。
- 复杂交易签名 UI。
- NFT / Token 列表聚合。
- 跨链桥功能。
- 钱包风控或链上合规能力。

## 6. 目标用户与使用场景

目标用户：

- 内部业务前端团队。
- 需要快速接入钱包账户能力的 React / Next.js 项目。
- 需要统一 Web3 登录、账户状态、网络切换体验的应用。

典型场景：

- 用户点击连接钱包。
- 用户选择 MetaMask / Coinbase / WalletConnect / 移动端钱包。
- SDK 建立连接并写入全局账户状态。
- 页面任意组件通过 hooks 读取地址、链 ID、余额。
- 用户在钱包中切换网络，SDK 捕获 `chainChanged` 并同步更新全局状态。
- 业务要求切换到指定链，SDK 调用钱包切链能力。
- 网络切换失败，SDK 返回错误，UI 显示提示。
- 页面刷新后，SDK 自动恢复上一次连接的钱包。

## 7. 整体架构

```txt
Application
  |
  |-- <WalletBridgeProvider />
  |     |
  |     |-- Connector Registry
  |     |     |-- MetaMaskConnector
  |     |     |-- CoinbaseConnector
  |     |     |-- WalletConnectConnector
  |     |     |-- MobileAppConnector
  |     |
  |     |-- Wallet Service
  |     |     |-- connect
  |     |     |-- disconnect
  |     |     |-- reconnect
  |     |     |-- switchChain
  |     |     |-- getBalance
  |     |
  |     |-- Event Manager
  |     |     |-- chainChanged
  |     |     |-- accountsChanged
  |     |     |-- connect
  |     |     |-- disconnect
  |     |
  |     |-- Zustand Store
  |
  |-- Hooks
  |     |-- useWallet
  |     |-- useConnect
  |     |-- useDisconnect
  |     |-- useSwitchChain
  |     |-- useBalance
  |
  |-- UI Components
        |-- WalletConnectButton
        |-- WalletModal
        |-- ChainSwitcher
        |-- WalletStatus
```

## 8. 模块设计

### 8.1 Connector 层

Connector 用于屏蔽不同钱包的连接差异。每一种钱包实现一个独立 Connector。

统一接口：

```text
export interface WalletConnector {
  id: WalletType;
  name: string;
  icon?: string;
  installed?: boolean;

  detect(): boolean | Promise<boolean>;
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  reconnect?(): Promise<WalletConnection | null>;
  switchChain(chainId: number): Promise<void>;
  addChain?(chain: ChainConfig): Promise<void>;
  getProvider(): Eip1193Provider | null;
  getBalance(address: string, chainId: number): Promise<WalletBalance>;
  on(event: WalletEventName, handler: WalletEventHandler): void;
  off(event: WalletEventName, handler: WalletEventHandler): void;
}
```

支持的钱包类型：

```text
export type WalletType =
  | 'metamask'
  | 'coinbase'
  | 'walletconnect'
  | 'mobile-app';
```

### 8.2 状态管理层

使用 Zustand 维护全局状态。

核心状态：

```text
export interface WalletState {
  status: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnecting' | 'disconnected' | 'error';
  address?: string;
  accounts: string[];
  chainId?: number;
  balance?: WalletBalance;
  walletType?: WalletType;
  connectorId?: WalletType;
  provider?: Eip1193Provider;
  isSwitchingChain: boolean;
  error?: WalletBridgeError;
  lastConnectedWallet?: WalletType;
}
```

状态持久化：

- 使用 `localStorage` 保存 `lastConnectedWallet`。
- 可选保存最近一次 `chainId`。
- 不持久化 provider 实例。
- 不持久化余额，刷新后重新拉取。

### 8.3 服务层

Wallet Service 封装业务动作：

- `connect(walletType)`
- `disconnect()`
- `reconnect()`
- `switchChain(chainId)`
- `refreshBalance()`
- `getCurrentConnector()`
- `setPreferredChain(chainId)`

服务层负责调用 connector，并将结果写入 Zustand store。

### 8.4 事件管理层

Event Manager 负责统一注册、注销钱包事件，避免重复监听与内存泄漏。

需要监听的 EIP-1193 事件：

- `chainChanged`
- `accountsChanged`
- `connect`
- `disconnect`
- `message`

其中 `chainChanged` 是关键事件，需要在钱包内网络变化时立刻同步 SDK 状态。

## 9. 网络切换设计

### 9.1 主动切换网络

业务调用：

```text
await switchChain(8453);
```

SDK 流程：

1. 设置 `isSwitchingChain = true`。
2. 校验目标链是否在 SDK 配置中。
3. 调用当前 connector 的 `switchChain(chainId)`。
4. connector 调用 provider 的 `wallet_switchEthereumChain`。
5. 如果钱包返回链不存在错误，且配置允许自动添加链，则调用 `wallet_addEthereumChain`。
6. 切换成功后更新 `chainId`。
7. 刷新余额。
8. 设置 `isSwitchingChain = false`。

### 9.2 钱包内部切换网络

用户在钱包插件或 App 内切换网络时，provider 会触发 `chainChanged`。

SDK 流程：

1. 接收钱包返回的十六进制链 ID，例如 `0x2105`。
2. 转换为十进制链 ID，例如 `8453`。
3. 更新 Zustand store 的 `chainId`。
4. 判断该链是否在支持列表中。
5. 如果支持，则刷新当前地址余额。
6. 如果不支持，写入标准化错误 `UNSUPPORTED_CHAIN`。
7. 通知 UI 展示网络提示。

### 9.3 网络切换失败

失败场景：

- 用户拒绝切换。
- 钱包不支持 `wallet_switchEthereumChain`。
- 目标链未配置。
- 目标链未添加，且自动添加失败。
- WalletConnect 会话链权限不包含目标链。
- 移动端钱包 App 唤起失败或返回超时。

标准错误：

```text
export type WalletBridgeErrorCode =
  | 'WALLET_NOT_FOUND'
  | 'USER_REJECTED'
  | 'UNSUPPORTED_CHAIN'
  | 'CHAIN_NOT_CONFIGURED'
  | 'SWITCH_CHAIN_FAILED'
  | 'ADD_CHAIN_FAILED'
  | 'CONNECT_FAILED'
  | 'DISCONNECT_FAILED'
  | 'RECONNECT_FAILED'
  | 'BALANCE_FETCH_FAILED'
  | 'PROVIDER_UNAVAILABLE';
```

错误对象：

```text
export interface WalletBridgeError {
  code: WalletBridgeErrorCode;
  message: string;
  cause?: unknown;
  walletType?: WalletType;
  chainId?: number;
}
```

## 10. 自动重连设计

自动重连默认开启，可通过配置关闭。

配置：

```text
export interface WalletBridgeConfig {
  autoReconnect?: boolean;
  chains: ChainConfig[];
  defaultChainId?: number;
  walletConnectProjectId?: string;
  appName: string;
}
```

流程：

1. Provider 客户端挂载后读取 `lastConnectedWallet`。
2. 找到对应 connector。
3. 检查钱包是否仍可用。
4. 调用 connector 的 `reconnect()`。
5. 如果重连成功，恢复地址、链 ID、余额。
6. 如果失败，清理连接状态，但保留错误供 UI 使用。

约束：

- SSR 阶段不执行自动重连。
- 用户未授权过的钱包不应强制弹出连接授权。
- 重连失败不应阻塞页面渲染。

## 11. React API 设计

### 11.1 Provider

```text
import { WalletBridgeProvider } from '@zeroone/walletbridgekit';

export function App() {
  return (
    <WalletBridgeProvider
      config={{
        appName: 'ZeroOne App',
        autoReconnect: true,
        defaultChainId: 8453,
        walletConnectProjectId: 'xxx',
        chains: [
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
        ],
      }}
    >
      <YourApp />
    </WalletBridgeProvider>
  );
}
```

### 11.2 Hooks

```text
const {
  status,
  address,
  accounts,
  chainId,
  balance,
  walletType,
  error,
  isSwitchingChain,
} = useWallet();
```

```text
const { connect, connectors, isConnecting } = useConnect();
await connect('metamask');
```

```text
const { disconnect, isDisconnecting } = useDisconnect();
await disconnect();
```

```text
const { switchChain, isSwitchingChain, error } = useSwitchChain();
await switchChain(8453);
```

```text
const { balance, refreshBalance, isLoading } = useBalance();
```

### 11.3 UI 组件

```text
<WalletConnectButton />
<WalletModal />
<ChainSwitcher />
<WalletStatus />
```

UI 组件要求：

- 支持受控和非受控模式。
- 支持自定义主题。
- 支持隐藏默认 UI，仅使用 hooks。
- 网络切换失败时显示错误提示。
- 钱包未安装时提供安装或打开 App 引导。
- 移动端优先展示 App / WalletConnect 入口。

## 12. 链配置模型

```text
export interface ChainConfig {
  id: number;
  name: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
  iconUrl?: string;
}
```

链 ID 处理规则：

- 内部统一使用十进制 number。
- provider 返回十六进制时统一转换。
- 调用 `wallet_switchEthereumChain` 时转换为十六进制。

## 13. 余额设计

```text
export interface WalletBalance {
  value: bigint;
  formatted: string;
  symbol: string;
  decimals: number;
}
```

余额刷新时机：

- 连接成功后。
- `chainChanged` 后。
- `accountsChanged` 后。
- 主动调用 `refreshBalance()`。

余额失败处理：

- 不断开钱包连接。
- 写入 `BALANCE_FETCH_FAILED`。
- UI 可显示余额加载失败。

## 14. 移动端钱包 App 接入

移动端场景需要支持：

- WalletConnect 二维码 / deeplink。
- 钱包 App universal link。
- 钱包 App deeplink。
- 用户从钱包 App 回到浏览器后的状态恢复。

移动端要求：

- 检测当前环境是 iOS / Android / 桌面端。
- 优先展示适合移动端的钱包入口。
- App 唤起失败时 fallback 到 WalletConnect。
- 超时后返回 `CONNECT_FAILED` 或 `PROVIDER_UNAVAILABLE`。

## 15. Next.js 兼容要求

- 包支持 ESM。
- Provider 和 hooks 必须可在 Next.js 客户端组件中使用。
- 不在模块顶层访问 `window`、`document`、`localStorage`。
- UI 组件需要标记客户端使用方式。
- 提供文档说明：

```text
'use client';

import { WalletBridgeProvider } from '@zeroone/walletbridgekit';
```

## 16. 包结构建议

```txt
packages/walletbridgekit
  |
  |-- src
  |   |-- connectors
  |   |   |-- metamask.ts
  |   |   |-- coinbase.ts
  |   |   |-- walletconnect.ts
  |   |   |-- mobile-app.ts
  |   |
  |   |-- core
  |   |   |-- wallet-service.ts
  |   |   |-- event-manager.ts
  |   |   |-- errors.ts
  |   |   |-- chains.ts
  |   |
  |   |-- store
  |   |   |-- wallet-store.ts
  |   |
  |   |-- react
  |   |   |-- provider.tsx
  |   |   |-- hooks.ts
  |   |
  |   |-- ui
  |   |   |-- wallet-connect-button.tsx
  |   |   |-- wallet-modal.tsx
  |   |   |-- chain-switcher.tsx
  |   |   |-- wallet-status.tsx
  |   |
  |   |-- types.ts
  |   |-- index.ts
  |
  |-- package.json
  |-- README.md
  |-- tsconfig.json
```

## 17. 依赖建议

核心依赖：

- `zustand`：全局状态。
- `viem`：EVM RPC、格式化、链工具。
- `@walletconnect/ethereum-provider`：WalletConnect 接入。
- `@coinbase/wallet-sdk`：Coinbase Wallet 接入。

开发依赖：

- `typescript`
- `tsup` 或 `vite`
- `react`
- `react-dom`
- `eslint`
- `vitest`
- `@testing-library/react`

原则：

- `react` 和 `react-dom` 应作为 peerDependencies。
- `zustand` 可作为 dependencies 或 peerDependencies，推荐 dependencies，降低业务接入成本。
- `viem` 可作为 dependencies。

## 18. 验收标准

功能验收：

- 可发布为 npm 包。
- React / Next.js 项目可正常引入。
- 可连接 MetaMask。
- 可连接 Coinbase Wallet。
- 可通过 WalletConnect 连接移动端钱包。
- 可通过移动端钱包 App 入口完成连接或 fallback。
- 连接成功后全局 store 有 `address`、`chainId`、`balance`。
- 任意组件可通过 hooks 读取钱包状态。
- 页面刷新后可自动重连上一次钱包。
- 用户在钱包内切换网络时，SDK 能捕获 `chainChanged` 并更新全局 `chainId`。
- 主动调用 `switchChain` 能发起钱包网络切换。
- 网络切换失败时返回标准化错误，UI 能展示提示。
- 断开连接后清理地址、余额、provider、connector 状态。

兼容性验收：

- SSR 不报 `window is not defined`。
- 多钱包注入环境下可以识别 MetaMask 与 Coinbase。
- 链 ID 十六进制 / 十进制转换正确。
- 用户拒绝连接、拒绝切链时不会造成状态卡死。

测试验收：

- Connector 单元测试。
- Zustand store 状态变更测试。
- `chainChanged` 事件测试。
- `accountsChanged` 事件测试。
- `switchChain` 成功 / 失败测试。
- Provider 挂载与自动重连测试。
- UI 组件基础渲染测试。

## 19. 风险与注意事项

- 不同钱包对 EIP-1193 支持程度不完全一致，需要 connector 层做兼容。
- WalletConnect 的链权限与 session 生命周期需要单独处理。
- 移动端 App 唤起存在浏览器差异，需要设计超时和 fallback。
- 自动重连不能触发强授权弹窗，否则会影响用户体验。
- 多钱包同时注入 `window.ethereum.providers` 时，需要准确识别目标钱包 provider。
- 网络切换后余额刷新可能受 RPC 稳定性影响，需要错误隔离。

## 20. 里程碑建议

### M1：核心 SDK

- 完成类型定义。
- 完成 Zustand store。
- 完成 MetaMask connector。
- 完成 connect / disconnect / switchChain。
- 完成 `chainChanged`、`accountsChanged`、`disconnect` 事件处理。

### M2：多钱包扩展

- 完成 Coinbase connector。
- 完成 WalletConnect connector。
- 完成移动端 App 接入策略。
- 完成自动重连。

### M3：React 与 UI

- 完成 Provider。
- 完成 hooks。
- 完成连接按钮、钱包弹窗、网络切换组件。
- 完成主题与错误提示。

### M4：发布与验证

- 完成 README。
- 完成单元测试。
- 完成 Next.js 示例项目。
- 完成 npm 包构建与发布流程。

