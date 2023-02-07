const url = require('@rollup/plugin-url');
const uglify = require('rollup-plugin-uglify');

module.exports = options => ({
  ...options,
  plugins: [
    url(),
    uglify.uglify(),
    ...options.plugins
  ],
});
