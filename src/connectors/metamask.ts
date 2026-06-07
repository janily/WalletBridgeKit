import { InjectedConnector } from './injected';

export class MetaMaskConnector extends InjectedConnector {
  constructor() {
    super({
      id: 'metamask',
      name: 'MetaMask',
      predicate: (provider) => Boolean(provider.isMetaMask && !provider.isCoinbaseWallet),
    });
  }
}
