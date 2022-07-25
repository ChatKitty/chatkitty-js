const url = require('@rollup/plugin-url');
const svgr = require('@svgr/rollup');

module.exports = options => ({
  ...options,
  plugins: [ ...options.plugins, url(), svgr()],
});
