/**
 * PostCSS configuration for processing styles in the extension
 */

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-preset-env')({
      // Target browsers
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'not dead'],
      // Use stage 2 features + custom properties
      stage: 2,
      features: {
        'custom-properties': true,
        'nesting-rules': true,
      },
    }),
  ],
};
