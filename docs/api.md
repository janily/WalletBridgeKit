# API

## Provider

```text
import { supportedChains } from '@zeroone/walletbridgekit';

<WalletBridgeProvider
  config={{
    appName: 'ZeroOne App',
    chains: supportedChains,
    autoReconnect: true,
    defaultChainId: 8453,
    walletConnectProjectId: 'YOUR_PROJECT_ID',
  }}
>
  <App />
</WalletBridgeProvider>
```

`supportedChains` 内置 Ethereum、Base 和 Sepolia 测试网。Sepolia 的 chain ID 为 `11155111`。

## Hooks

### useWallet

返回全局钱包状态：

```text
const {
  status,
  address,
  accounts,
  chainId,
  balance,
  walletType,
  isSwitchingChain,
  error,
} = useWallet();
```

### useConnect

```text
const { connectors, connect, isConnecting } = useConnect();
await connect('metamask');
```

### useDisconnect

```text
const { disconnect, isDisconnecting } = useDisconnect();
await disconnect();
```

### useSwitchChain

```text
const { switchChain, isSwitchingChain, error } = useSwitchChain();
await switchChain(8453);
await switchChain(11155111);
```

### useBalance

```text
const { balance, refreshBalance, isLoading } = useBalance();
await refreshBalance();
```

## UI Components

```text
<WalletConnectButton />
<WalletModal open={open} onOpenChange={setOpen} />
<ChainSwitcher />
<WalletStatus />
```
