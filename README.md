# Naval Auction Intelligence Search Tool Assistant (NAV-AISTA)

A browser extension that assists with naval auction monitoring, form automation, and technical document analysis.

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

## Features

- Automated form filling for auction searches
- Intelligent selection of options based on company profile
- Technical document analysis for relevance assessment
- Customizable search criteria and filtering
- Browser extension interface with easy-to-use controls

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Chrome or Edge browser (for extension development)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-org/naval-auction-assistant.git
   cd nav-aista
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Build the extension:

   ```
   npm run build
   ```

4. Load the extension in Chrome/Edge:
   - Open `chrome://extensions` or `edge://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Development

- `npm run dev` - Start development server with hot-reloading
- `npm run build` - Build production version
- `npm run lint` - Run linting
- `npm run test` - Run tests

## Contributing

Please follow the [conventional commits](https://www.conventionalcommits.org/) standard for all commits.

## License

MIT
