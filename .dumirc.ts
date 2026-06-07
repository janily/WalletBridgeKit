import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  jsMinifierOptions: {
    target: ['chrome80', 'es2020'],
  },
  themeConfig: {
    name: 'WalletBridgeKit',
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
