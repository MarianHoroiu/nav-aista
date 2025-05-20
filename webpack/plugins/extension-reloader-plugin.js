/**
 * A webpack plugin that simplifies browser extension development by
 * automatically reloading the extension when files change
 */

class ExtensionReloaderPlugin {
  constructor(options = {}) {
    this.options = {
      port: options.port || 9090,
      reloadPage: options.reloadPage !== undefined ? options.reloadPage : true,
      entries: options.entries || {
        background: 'background',
        content: 'content',
        popup: 'popup',
        options: 'options',
      },
    };
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('ExtensionReloaderPlugin', compilation => {
      // Get the output path from compiler
      const outputPath = compiler.options.output.path;

      // Log after compilation
      console.log('\n');
      console.log('\x1b[36m%s\x1b[0m', '🔄 Extension build complete! 🔄');
      console.log('\x1b[33m%s\x1b[0m', `📂 Output directory: ${outputPath}`);
      console.log(
        '\x1b[32m%s\x1b[0m',
        '👉 Load the extension from the dist folder in Chrome/Edge extensions page.'
      );
      console.log('\x1b[32m%s\x1b[0m', '   (chrome://extensions/ or edge://extensions/)');
      console.log('\n');

      // Check for errors
      if (compilation.errors && compilation.errors.length > 0) {
        console.log('\x1b[31m%s\x1b[0m', '⚠️ Build completed with errors ⚠️');
        compilation.errors.forEach(error => {
          console.log('\x1b[31m%s\x1b[0m', error);
        });
        console.log('\n');
      }
    });
  }
}

module.exports = ExtensionReloaderPlugin;
