/**
 * Webpack loader configurations for different file types
 */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  // TypeScript loader
  typescript: {
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          // Disable React Refresh transforms as they're causing issues
          transpileOnly: isDevelopment,
        },
      },
    ],
  },

  // CSS/SCSS loaders
  styles: {
    test: /\.(css|scss)$/,
    use: [
      // In production, extract CSS to separate files
      // In development, inject CSS into the DOM for HMR
      isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          sourceMap: isDevelopment,
          importLoaders: 2,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: isDevelopment,
          postcssOptions: {
            plugins: [require('postcss-preset-env')()],
          },
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: isDevelopment,
        },
      },
    ],
  },

  // Asset loaders (images, fonts, etc.)
  assets: {
    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
    type: 'asset',
    parser: {
      dataUrlCondition: {
        maxSize: 10 * 1024, // 10kb - inline if smaller
      },
    },
  },

  // HTML loader for template files
  html: {
    test: /\.html$/,
    use: ['html-loader'],
  },
};
