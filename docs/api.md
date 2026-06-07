# API

## Provider

```text
<WalletBridgeProvider
  config={{
    appName: 'ZeroOne App',
    chains,
    autoReconnect: true,
    defaultChainId: 8453,
    walletConnectProjectId: 'YOUR_PROJECT_ID',
  }}
>
  <App />
</WalletBridgeProvider>
```

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

