# Naval Auction Assistant Extension

Browser extension for monitoring and analyzing naval auctions.

## Development Setup

### Prerequisites

- Node.js (14.x or higher)
- npm (7.x or higher)

### Installation

```bash
# Install dependencies
npm install
```

### Development Workflow

```bash
# Start development server with hot reloading
npm run start

# Watch for changes and rebuild (alternative to start)
npm run watch

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# Type checking
npm run type-check

# Format code
npm run format

# Lint code
npm run lint
```

### Loading the Extension

1. Build the extension: `npm run build:dev`
2. Open Chrome/Edge and navigate to `chrome://extensions` or `edge://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder from this project

## Project Structure

```
├── config/                   # Environment configuration
├── dist/                     # Build output (generated)
├── public/                   # Static files
│   ├── icons/                # Extension icons
│   ├── manifest.json         # Extension manifest
│   ├── options.html          # Options page template
│   └── popup.html            # Popup page template
├── src/                      # Source code
│   ├── background/           # Background scripts
│   ├── components/           # Shared React components
│   ├── content/              # Content scripts
│   ├── options/              # Options page
│   ├── popup/                # Popup page
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── webpack/                  # Webpack configuration modules
│   ├── plugins/              # Custom webpack plugins
│   └── loaders.js            # Webpack loader configurations
├── webpack.common.js         # Common webpack configuration
├── webpack.dev.js            # Development-specific configuration
└── webpack.prod.js           # Production-specific configuration
```

## Features

- Automated form filling for auction searches
- Intelligent selection of options based on company profile
- Technical document analysis for relevance assessment
- Customizable search criteria and filtering
- Browser extension interface with easy-to-use controls

## Architecture

```
Naval Auction Assistant
├── Browser Extension (Primary Interface)
│   ├── Core Components
│   │   ├── Form Auto-filler
│   │   ├── Auction Result Analyzer
│   │   └── Document Analyzer
│   ├── AI Decision Engine
│   │   ├── Profile Matcher
│   │   └── Document Relevance Analyzer
│   ├── UI Components
│   │   ├── Popup Interface
│   │   └── In-page Overlay
│   └── Data Management
│       ├── Company Profile Storage
│       └── Analysis History
└── Companion Service (Analysis Engine)
    ├── Document Processing
    │   ├── Deep NLP Analysis
    │   └── Technical Parameter Extraction
    ├── Advanced AI Models
    │   ├── Requirements Matcher
    │   └── Relevance Scorer
    └── Historical Database
        ├── Auction Archive
        └── Learning Engine
```

## Contributing

Please follow the [conventional commits](https://www.conventionalcommits.org/) standard for all commits.

## License

MIT
