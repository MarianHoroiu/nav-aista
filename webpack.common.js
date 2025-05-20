/**
 * Common webpack configuration shared between development and production builds
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');

// Import loaders
const loaders = require('./webpack/loaders');

// Determine environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const envPath = isDevelopment
  ? path.resolve(__dirname, 'config/.env.development')
  : path.resolve(__dirname, 'config/.env.production');

module.exports = {
  // Entry points for different parts of the extension
  entry: {
    background: './src/background/index.ts',
    content: './src/content/index.ts',
    popup: './src/popup/index.tsx',
    options: './src/options/index.tsx',
  },

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },

  // Module resolution
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@background': path.resolve(__dirname, 'src/background'),
      '@content': path.resolve(__dirname, 'src/content'),
      '@popup': path.resolve(__dirname, 'src/popup'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
  },

  // Module loaders
  module: {
    rules: [loaders.typescript, loaders.styles, loaders.assets, loaders.html],
  },

  // Plugins
  plugins: [
    // Clean dist folder before each build
    new CleanWebpackPlugin(),

    // Environment variables
    new DotenvWebpackPlugin({
      path: envPath,
      systemvars: true, // Load all system environment variables as well
    }),

    // Copy static assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/manifest.json',
          transform: content => {
            // Allow for environment-specific manifest modifications
            const manifest = JSON.parse(content.toString());
            return JSON.stringify(manifest, null, 2);
          },
        },
        { from: 'public/icons', to: 'icons' },
      ],
    }),

    // Generate HTML files for popup and options
    new HtmlWebpackPlugin({
      template: 'public/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: 'public/options.html',
      filename: 'options.html',
      chunks: ['options'],
      cache: false,
    }),
  ],
};
