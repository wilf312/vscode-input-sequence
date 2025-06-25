const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  files: 'test/**/*.test.js',
  version: '1.74.0',
  launchArgs: ['--disable-extensions'],
  mocha: {
    ui: 'tdd',
    timeout: 20000
  }
});