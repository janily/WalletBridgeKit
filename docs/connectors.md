# Connectors

WalletBridgeKit 将每类钱包实现为 `WalletConnector`。

## MetaMask

`MetaMaskConnector` 使用浏览器注入的 EIP-1193 provider，并优先从 `window.ethereum.providers` 中识别 `isMetaMask` provider。

## Coinbase Wallet

`CoinbaseConnector` 优先使用注入 provider。未检测到注入 provider 时，在客户端懒加载 `@coinbase/wallet-sdk` 并创建 SDK provider。

## WalletConnect

`WalletConnectConnector` 懒加载 `@walletconnect/ethereum-provider`，需要配置 `walletConnectProjectId`。

```text
{
  appName: 'ZeroOne App',
  walletConnectProjectId: 'YOUR_PROJECT_ID',
  chains,
}
```

## Mobile App

`MobileAppConnector` 基于 WalletConnect，默认关闭 QR modal，用于移动端钱包 App 入口和 deeplink 类场景。业务可以在 UI 层根据环境把它放在更优先的位置。

