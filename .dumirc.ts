import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  theme: {
    '@s-sidebar-width': '320px',
  },
  jsMinifierOptions: {
    target: ['chrome80', 'es2020'],
  },
  themeConfig: {
    name: 'WalletBridgeKit',
    nav: [
      { title: 'API', link: '/api' },
      { title: 'Components', link: '/components' },
      { title: 'Connectors', link: '/connectors' },
      { title: 'Network Switching', link: '/network-switching' },
    ],
    socialLinks: {
      github: 'https://github.com/zeroone/walletbridgekit',
    },
  },
  resolve: {
    atomDirs: [{ type: 'component', dir: 'src/ui' }],
  },
  alias: {
    '@zeroone/walletbridgekit': process.cwd() + '/src',
  },
});
