# WalletBridgeKit Dumi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build WalletBridgeKit as a publishable React / Next.js compatible npm package with dumi-powered component documentation, multi-wallet EVM connectors, Zustand state, hooks, UI components, auto reconnect, and reliable network switching event handling.

**Architecture:** The package is split into focused core, connector, store, React, and UI modules. Connectors normalize MetaMask, Coinbase Wallet, WalletConnect, and mobile-app entry behavior behind a single `WalletConnector` interface; `WalletService` orchestrates lifecycle and writes state into a Zustand store. dumi hosts documentation and demos, while father builds the npm package.

**Tech Stack:** TypeScript, React, dumi, father, Zustand, viem, WalletConnect Ethereum Provider, Coinbase Wallet SDK, Vitest, Testing Library.

---

## File Structure

- Create `package.json`: package metadata, npm scripts, dependencies, peer dependencies.
- Create `tsconfig.json`: strict TypeScript config for source, tests, and dumi.
- Create `.dumirc.ts`: dumi documentation framework config.
- Create `.fatherrc.ts`: library build config.
- Create `vitest.config.ts`: unit test config with jsdom.
- Create `src/types.ts`: shared SDK types and EIP-1193 interfaces.
- Create `src/core/errors.ts`: standard error codes and error normalization helpers.
- Create `src/core/chains.ts`: chain ID conversion, chain lookup, default supported chain helpers.
- Create `src/core/provider.ts`: injected provider detection and provider request helper.
- Create `src/core/event-manager.ts`: register and cleanup wallet events.
- Create `src/core/wallet-service.ts`: connect, disconnect, reconnect, switch chain, refresh balance.
- Create `src/store/wallet-store.ts`: Zustand wallet state store and actions.
- Create `src/connectors/injected.ts`: reusable injected EIP-1193 connector base.
- Create `src/connectors/metamask.ts`: MetaMask connector.
- Create `src/connectors/coinbase.ts`: Coinbase connector with injected and SDK fallback.
- Create `src/connectors/walletconnect.ts`: WalletConnect connector.
- Create `src/connectors/mobile-app.ts`: mobile app connector using WalletConnect and app metadata.
- Create `src/react/context.tsx`: React context for service and config.
- Create `src/react/provider.tsx`: `WalletBridgeProvider`.
- Create `src/react/hooks.ts`: `useWallet`, `useConnect`, `useDisconnect`, `useSwitchChain`, `useBalance`.
- Create `src/ui/wallet-connect-button.tsx`: connect button and status display.
- Create `src/ui/wallet-modal.tsx`: wallet selection modal.
- Create `src/ui/chain-switcher.tsx`: chain switcher component.
- Create `src/ui/wallet-status.tsx`: compact account / chain / balance status component.
- Create `src/ui/styles.css`: package UI styles.
- Create `src/index.ts`: public exports.
- Create `src/**/*.test.ts(x)`: tests for core utilities, store, service, and UI.
- Create `docs/index.md`: dumi homepage and quick start.
- Create `docs/api.md`: API reference.
- Create `docs/connectors.md`: connector docs.
- Create `docs/network-switching.md`: network switching behavior docs.
- Create `docs/components.md`: live UI component demos.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.dumirc.ts`
- Create: `.fatherrc.ts`
- Create: `vitest.config.ts`
- Create: `src/index.ts`
- Create: `src/ui/styles.css`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json` with package name `@zeroone/walletbridgekit`, scripts for dumi, build, test, typecheck, and package exports.

- [ ] **Step 2: Create TypeScript, dumi, father, and vitest config**

Create configs that support React JSX, strict TypeScript, jsdom tests, dumi docs, and father ESM/CJS output.

- [ ] **Step 3: Add empty source entry and styles**

Create `src/index.ts` and `src/ui/styles.css` so the scaffold can build before implementation.

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is generated.

- [ ] **Step 5: Verify scaffold**

Run: `npm run typecheck`

Expected: no TypeScript errors.

---

### Task 2: Shared Types and Error Model

**Files:**
- Create: `src/types.ts`
- Create: `src/core/errors.ts`
- Create: `src/core/errors.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing error tests**

Create tests for user rejection, unsupported chain, missing wallet, and generic error normalization.

- [ ] **Step 2: Implement shared types**

Define `WalletType`, `WalletStatus`, `WalletBridgeConfig`, `ChainConfig`, `WalletBalance`, `WalletConnector`, `Eip1193Provider`, `WalletConnection`, and event handler types.

- [ ] **Step 3: Implement error helpers**

Implement `createWalletBridgeError`, `normalizeProviderError`, and `isWalletBridgeError`.

- [ ] **Step 4: Export types and errors**

Update `src/index.ts` to export `types` and `core/errors`.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/core/errors.test.ts`

Expected: all tests pass.

---

### Task 3: Chain Utilities

**Files:**
- Create: `src/core/chains.ts`
- Create: `src/core/chains.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing chain tests**

Cover decimal-to-hex conversion, hex-to-decimal conversion, chain lookup, and unsupported chain detection.

- [ ] **Step 2: Implement chain utilities**

Implement `toHexChainId`, `parseChainId`, `findChain`, `isSupportedChain`, and `getDefaultChain`.

- [ ] **Step 3: Export chain helpers**

Update `src/index.ts`.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/core/chains.test.ts`

Expected: all tests pass.

---

### Task 4: Zustand Store

**Files:**
- Create: `src/store/wallet-store.ts`
- Create: `src/store/wallet-store.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing store tests**

Cover initial state, connection state updates, chain switch flags, balance updates, error updates, and disconnect cleanup.

- [ ] **Step 2: Implement store**

Create `useWalletStore`, `getWalletState`, `setWalletState`, `resetWalletState`, and focused store actions.

- [ ] **Step 3: Keep provider out of persistence**

Persist only `lastConnectedWallet` and `lastChainId` manually in service logic; do not persist provider instances.

- [ ] **Step 4: Export store**

Update `src/index.ts`.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/store/wallet-store.test.ts`

Expected: all tests pass.

---

### Task 5: Provider Detection and Injected Connectors

**Files:**
- Create: `src/core/provider.ts`
- Create: `src/core/provider.test.ts`
- Create: `src/connectors/injected.ts`
- Create: `src/connectors/metamask.ts`
- Create: `src/connectors/coinbase.ts`
- Create: `src/connectors/injected.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing provider detection tests**

Mock `window.ethereum` with single provider and `providers[]` cases; assert MetaMask and Coinbase are identified correctly.

- [ ] **Step 2: Implement provider detection**

Implement `getInjectedProviders`, `findInjectedProvider`, and `requestProvider`.

- [ ] **Step 3: Implement injected connector base**

Use `eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`, `wallet_addEthereumChain`, and `eth_getBalance`.

- [ ] **Step 4: Implement MetaMask and Coinbase connectors**

MetaMask filters `isMetaMask`; Coinbase filters `isCoinbaseWallet`; Coinbase SDK fallback is initialized only on the client.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/core/provider.test.ts src/connectors/injected.test.ts`

Expected: all tests pass.

---

### Task 6: WalletConnect and Mobile App Connectors

**Files:**
- Create: `src/connectors/walletconnect.ts`
- Create: `src/connectors/mobile-app.ts`
- Create: `src/connectors/walletconnect.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing connector tests**

Mock WalletConnect provider initialization; verify missing `walletConnectProjectId` returns `PROVIDER_UNAVAILABLE`; verify connect result maps accounts and chain ID.

- [ ] **Step 2: Implement WalletConnect connector**

Lazy import `@walletconnect/ethereum-provider`, initialize with `projectId`, `chains`, `optionalChains`, `showQrModal`, and app metadata.

- [ ] **Step 3: Implement mobile app connector**

Wrap WalletConnect behavior while exposing `id = 'mobile-app'`, mobile-friendly name, and app open metadata.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/connectors/walletconnect.test.ts`

Expected: all tests pass.

---

### Task 7: Event Manager and Wallet Service

**Files:**
- Create: `src/core/event-manager.ts`
- Create: `src/core/wallet-service.ts`
- Create: `src/core/wallet-service.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing service tests**

Cover connect success, disconnect cleanup, auto reconnect success, `chainChanged` updating decimal `chainId`, unsupported chain error, `accountsChanged` cleanup, switch chain success, and switch chain failure.

- [ ] **Step 2: Implement event manager**

Register `chainChanged`, `accountsChanged`, `connect`, `disconnect`, and `message`; expose `cleanup()`.

- [ ] **Step 3: Implement wallet service**

Create connector registry, lifecycle methods, balance refresh, last wallet localStorage persistence, and network switching flow.

- [ ] **Step 4: Ensure chain switching cannot leave state stuck**

Always reset `isSwitchingChain` in a `finally` block and normalize errors into `WalletBridgeError`.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/core/wallet-service.test.ts`

Expected: all tests pass.

---

### Task 8: React Provider and Hooks

**Files:**
- Create: `src/react/context.tsx`
- Create: `src/react/provider.tsx`
- Create: `src/react/hooks.ts`
- Create: `src/react/hooks.test.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing hook tests**

Render `WalletBridgeProvider`; verify hooks expose state, connect, disconnect, switch chain, balance refresh, and throw a clear error outside provider.

- [ ] **Step 2: Implement context and provider**

Instantiate `WalletService` on the client, register connectors from config, call auto reconnect after mount when enabled.

- [ ] **Step 3: Implement hooks**

Implement `useWallet`, `useConnect`, `useDisconnect`, `useSwitchChain`, and `useBalance`.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/react/hooks.test.tsx`

Expected: all tests pass.

---

### Task 9: UI Components

**Files:**
- Create: `src/ui/wallet-connect-button.tsx`
- Create: `src/ui/wallet-modal.tsx`
- Create: `src/ui/chain-switcher.tsx`
- Create: `src/ui/wallet-status.tsx`
- Modify: `src/ui/styles.css`
- Create: `src/ui/components.test.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing UI tests**

Cover wallet modal opening, connector list rendering, disabled switching state, error text rendering, and connected account display.

- [ ] **Step 2: Implement wallet modal**

Render connector choices from `useConnect`; support custom `open`, `onOpenChange`, and `onConnect`.

- [ ] **Step 3: Implement connect button and status**

Show connect action when disconnected, shortened address when connected, and disconnect button.

- [ ] **Step 4: Implement chain switcher**

Render configured chains; call `switchChain`; display switching and error states.

- [ ] **Step 5: Add compact styles**

Use scoped `wbk-` class names, no global resets, no dependency on app CSS.

- [ ] **Step 6: Run tests**

Run: `npm test -- src/ui/components.test.tsx`

Expected: all tests pass.

---

### Task 10: Dumi Documentation

**Files:**
- Create: `docs/index.md`
- Create: `docs/api.md`
- Create: `docs/connectors.md`
- Create: `docs/network-switching.md`
- Create: `docs/components.md`
- Modify: `.dumirc.ts`

- [ ] **Step 1: Create quick start docs**

Document install command, Next.js `'use client'` usage, `WalletBridgeProvider`, and chain config.

- [ ] **Step 2: Create API docs**

Document all exported types, hooks, methods, and UI components.

- [ ] **Step 3: Create connector docs**

Document MetaMask, Coinbase, WalletConnect, and mobile app connector behavior and configuration.

- [ ] **Step 4: Create network switching docs**

Document `chainChanged`, `wallet_switchEthereumChain`, `wallet_addEthereumChain`, unsupported chains, and failure errors.

- [ ] **Step 5: Create component demos**

Use dumi demos that import from `@zeroone/walletbridgekit` and render provider, connect button, wallet status, and chain switcher.

- [ ] **Step 6: Run dumi build**

Run: `npm run docs:build`

Expected: dumi documentation builds successfully.

---

### Task 11: Final Verification

**Files:**
- Modify as needed based on failures.

- [ ] **Step 1: Run unit tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: no TypeScript errors.

- [ ] **Step 3: Run package build**

Run: `npm run build`

Expected: father emits package build artifacts.

- [ ] **Step 4: Run docs build**

Run: `npm run docs:build`

Expected: dumi emits documentation build artifacts.

- [ ] **Step 5: Start docs server**

Run: `npm run dev`

Expected: dumi dev server starts and serves component documentation.

---

## Self-Review

Spec coverage:

- npm package: covered by Tasks 1 and 11.
- React / Next.js: covered by Tasks 8 and 10.
- UI + hooks: covered by Tasks 8, 9, and 10.
- MetaMask, Coinbase, WalletConnect, mobile app: covered by Tasks 5 and 6.
- EVM only: covered by shared types and chain utilities in Tasks 2 and 3.
- Zustand state: covered by Task 4.
- Auto reconnect: covered by Tasks 7 and 8.
- Network switch failure errors and UI prompt: covered by Tasks 7, 9, and 10.
- dumi framework: covered by Tasks 1, 10, and 11.

Placeholder scan:

- No task uses TBD, TODO, "implement later", or unspecified "write tests" language.

Type consistency:

- Public names are consistently `WalletBridgeKit`, `WalletBridgeProvider`, `WalletService`, `WalletConnector`, `WalletBridgeError`, `useWallet`, `useConnect`, `useDisconnect`, `useSwitchChain`, and `useBalance`.

Execution note:

- The user explicitly requested development after plan creation, so this session will proceed with inline execution instead of stopping to ask for an execution mode.
