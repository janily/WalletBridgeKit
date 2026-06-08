# Network Switching

网络切换是 WalletBridgeKit 的核心能力之一。

## 主动切链

```text
const { switchChain } = useSwitchChain();
await switchChain(8453);
await switchChain(11155111);
```

SDK 会执行：

1. 校验目标链是否在 `config.chains` 中。
2. 设置 `isSwitchingChain = true`。
3. 调用 provider 的 `wallet_switchEthereumChain`。
4. 如果钱包返回 `4902` 且允许自动添加链，调用 `wallet_addEthereumChain`。
5. 切换成功后更新全局 `chainId` 并刷新余额。
6. 失败时写入 `WalletBridgeError`，UI 可展示错误提示。

## 钱包内切链事件

当用户在钱包插件或 App 内切换网络，provider 会触发 `chainChanged`。

WalletBridgeKit 会：

- 将十六进制链 ID 转成十进制。
- 更新 Zustand store 的 `chainId`。
- 如果链受支持，刷新余额。
- 如果链不受支持，写入 `UNSUPPORTED_CHAIN` 错误。

## 错误码

```text
type WalletBridgeErrorCode =
  | 'USER_REJECTED'
  | 'UNSUPPORTED_CHAIN'
  | 'CHAIN_NOT_CONFIGURED'
  | 'SWITCH_CHAIN_FAILED'
  | 'ADD_CHAIN_FAILED'
  | 'PROVIDER_UNAVAILABLE';
```
