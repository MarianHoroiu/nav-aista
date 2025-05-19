# Naval Auction Assistant Browser Plugin

## Architecture Overview

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

## Technology Stack

### Core Technologies

- **JavaScript/TypeScript** - Main development language
- **Browser Extension API** - Using Manifest V3 standard for Chrome/Edge compatibility
- **Node.js** - For companion service components

### Frontend Framework (Extension)

- **React** - For building the popup UI and in-page overlays
- **Tailwind CSS** - For styling components

### Backend & Processing (Companion Service)

- **Express.js** - For RESTful API endpoints
- **MongoDB** (optional) - For storing company profiles and auction history

### Data Management

- **Chrome Storage API** - For storing preferences and basic analysis history
- **IndexedDB** - For caching larger datasets in the extension
- **Mongoose/MongoDB** - For comprehensive data storage in the companion service

## Key Libraries

### Browser Extension Development

- **webextension-polyfill** - For cross-browser compatibility
- **MutationObserver** - To detect dynamic content changes on auction pages

### Form Analysis & Manipulation

- **DOM Manipulation** - Native browser APIs
- **Selector Strategies** - Custom selectors for e-licitatie.ro form elements

### Document Processing

- **PDF.js** - For parsing and extracting text from PDF documents
- **Tesseract.js** (optional) - For OCR on scanned documents
- **SheetJS/xlsx** - For processing Excel documents if needed

### AI & Analysis

- **Natural** - NLP library for initial text analysis in the extension
- **compromise** - For NLP text parsing and entity recognition
- **TensorFlow.js** - For machine learning in the companion service
- **ml.js** - For lightweight machine learning in the extension

### Testing & Quality

- **Jest** - For unit/integration testing
- **Playwright** - For end-to-end testing

### Communication

- **Axios** - For HTTP requests between extension and companion service
- **Socket.io** (optional) - For real-time updates from companion service

## Implementation Notes

1. **Hybrid Architecture**

   - Browser extension as the primary user interface
   - Companion service for intensive processing tasks
   - Secure communication between components

2. **Browser Extension Structure**

   - Background script for persistent operations
   - Content scripts for page interaction with e-licitatie.ro
   - Popup for user interface and settings

3. **Form Auto-filling Strategy**

   - Use DOM selectors to identify form fields on e-licitatie.ro
   - Map company preferences to appropriate form inputs
   - Implement intelligent selection for dropdown options
   - Support both automatic and manual triggering

4. **Document Analysis Pipeline**

   - Initial PDF parsing with PDF.js in the extension
   - Basic text extraction and classification in the extension
   - Deep analysis with advanced NLP in the companion service
   - Relevance scoring against company profile

5. **Profile Management**

   - Store basic company capabilities and preferences in extension storage
   - Comprehensive profile management in companion service
   - Allow customization of matching parameters
   - Save historical analysis for reference and learning

6. **Security Considerations**
   - Restrict permissions to necessary domains (primarily e-licitatie.ro)
   - Local processing when possible to avoid data transmission
   - Encrypted communication between extension and service
   - Clear guidance on data usage for users

## Development Roadmap

1. **Phase 1: Core Extension Framework**

   - Implement basic extension structure
   - Create company profile storage and UI
   - Basic form field detection for e-licitatie.ro

2. **Phase 2: Form Automation**

   - Smart form field mapping for auction search
   - Intelligent option selection for dropdowns
   - Search triggering and result collection

3. **Phase 3: Initial Document Analysis**

   - PDF downloading and basic processing
   - Initial relevance assessment
   - Result highlighting and sorting

4. **Phase 4: Companion Service Development**

   - Set up backend infrastructure
   - Implement document analysis pipeline
   - Create secure communication channels

5. **Phase 5: Advanced AI Integration**
   - Train models on historical selections
   - Implement comprehensive document understanding
   - Develop predictive matching algorithms
   - Continuous learning from user decisions

## Component Details

### Form Auto-filler

The Form Auto-filler component will identify and populate search forms on the auction website according to company preferences. It will:

- Detect form fields using DOM selectors
- Map company preferences to appropriate fields
- Make intelligent selections for dropdown menus
- Trigger searches automatically or on demand

### Auction Result Analyzer

This component will process auction results to identify relevant opportunities:

- Extract data from auction listings
- Score relevance against company profile
- Highlight promising opportunities
- Filter out irrelevant auctions

### Document Analyzer

The Document Analyzer will process technical specifications and requirements:

- Extract text from PDF documents
- Identify key technical details
- Recognize special requirements
- Assess feasibility and relevance to company capabilities

### Profile Matcher

The AI-powered Profile Matcher will:

- Compare auction details with company capabilities
- Evaluate ship types and repair specializations
- Consider tonnage limitations and location preferences
- Generate relevance scores for decision making

### Data Flow

1. User configures company profile
2. Extension activates on auction website
3. Form Auto-filler populates search criteria
4. Results are analyzed and scored
5. User selects promising auctions
6. Document Analyzer processes technical specifications
7. Final recommendations are presented to user
