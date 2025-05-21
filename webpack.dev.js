/**
 * Development-specific webpack configuration
 */

const { merge } = require('webpack-merge');
const ExtensionReloaderPlugin = require('./webpack/plugins/extension-reloader-plugin');
const common = require('./webpack.common.js');
const path = require('path');

// Set NODE_ENV for development
process.env.NODE_ENV = 'development';

module.exports = merge(common, {
  mode: 'development',

  // Enable source maps for debugging
  devtool: 'inline-source-map',

  // Add HMR plugin for development
  plugins: [new ExtensionReloaderPlugin()],

  // Development server configuration (for hot reloading)
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true,
    host: 'localhost', // Use localhost instead of 0.0.0.0
    port: 9000,
    devMiddleware: {
      writeToDisk: true, // Write files to disk so they can be loaded as an extension
    },
    client: {
      overlay: false, // Disable the error overlay
    },
  },

  // Watch for file changes
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000, // Check for changes every second
  },
});
