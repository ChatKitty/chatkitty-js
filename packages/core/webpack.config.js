const { composePlugins, withNx } = require('@nrwl/webpack');

module.exports = composePlugins(withNx(), (config, { _options, _context }) => {
  return {
    ...config,
    output: {
      ...config.output,
      globalObject: 'this',
    },
  };
});
