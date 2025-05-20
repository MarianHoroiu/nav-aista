/**
 * Production-specific webpack configuration
 */

const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.js');

// Set NODE_ENV for production
process.env.NODE_ENV = 'production';

module.exports = merge(common, {
  mode: 'production',

  // Disable source maps in production for security and performance
  devtool: false,

  // Production-specific plugins
  plugins: [
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],

  // Optimization settings
  optimization: {
    minimizer: [
      // Minify JavaScript
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            drop_console: true, // Remove console.log statements
          },
        },
        extractComments: false,
      }),
    ],
    // Code splitting configuration
    splitChunks: {
      chunks: 'all',
      name: 'vendor',
      cacheGroups: {
        // Group React and related packages
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-refresh)[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
        },
        // Group other vendor dependencies
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
        },
      },
    },
  },

  // Output configuration
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },

  // Performance hints
  performance: {
    hints: 'warning', // Show warnings for large assets
    maxAssetSize: 512000, // 500kb
    maxEntrypointSize: 512000, // 500kb
  },
});
