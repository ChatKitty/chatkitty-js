const name = 'core';
const srcRoot = `packages/${name}`;

const baseConfig = require('./release.config.js');

module.exports = {
  ...baseConfig,
  pkgRoot: `${srcRoot}`,
  skipTag: true,
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/exec',
      {
        publishCmd: `nx prepare-release ${name} --args="--version=\${nextRelease.version}"`,
      },
    ],
  ],
};
