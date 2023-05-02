const url = require('@rollup/plugin-url');

module.exports = options => ({
  ...options,
  plugins: [
    url(),
    ...options.plugins
  ],
});
