const { composePlugins, withNx } = require('@nrwl/webpack');

const TypescriptDeclarationPlugin = require('typescript-declaration-webpack-plugin');

module.exports = composePlugins(withNx(), (config, { _options, _context }) => {
  return {
    ...config,
    plugins: [
      new TypescriptDeclarationPlugin({
        // Options for TypescriptDeclarationPlugin (see below)
      }),
      ...config.plugins,
    ],
    output: {
      ...config.output,
      globalObject: 'this',
    },
  };
});
