const url = require('@rollup/plugin-url');
const svgr = require('@svgr/rollup');
const uglify  = require('rollup-plugin-uglify');

module.exports = options => ({
  ...options,
  plugins: [ ...options.plugins, url(), svgr(), uglify.uglify()],
});
