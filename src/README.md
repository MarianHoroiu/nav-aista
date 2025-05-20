# Naval Auction Assistant: Source Code Architecture

This project follows clean architecture principles with a focus on separation of concerns, module boundaries, and domain-driven design.

## Directory Structure

- **core/**: Domain models, entities, and core business logic
  - `domain/`: Core domain entities and value objects
  - `services/`: Domain services implementing core business logic
  - `interfaces/`: Interface definitions for infrastructure services
- **features/**: Feature-specific modules
  - `auction-search/`: Auction search and form automation
  - `document-analysis/`: Document processing and relevance assessment
  - `profile-management/`: Company profile management
- **infrastructure/**: Technical implementations of core interfaces
  - `api/`: API clients and communication layers
  - `storage/`: Storage implementations (Chrome Storage, IndexedDB)
  - `browser/`: Browser extension specific implementations
- **types/**: Shared TypeScript type definitions
  - `domain/`: Domain-specific type definitions
  - `api/`: API-related type definitions
  - `browser/`: Browser extension type definitions
- **utils/**: Utility functions and helpers
  - `dom/`: DOM manipulation utilities
  - `formatter/`: Data formatting utilities
  - `validation/`: Validation helpers
- **assets/**: Static assets like images and icons

- **components/**: Shared UI components
  - `atoms/`: Basic UI building blocks
  - `molecules/`: Composite components
  - `organisms/`: Complex UI sections
  - `templates/`: Page layout templates
- **background/**: Extension background service
  - `events/`: Event handlers
  - `messaging/`: Message passing infrastructure
- **content/**: Content scripts for website integration
  - `injection/`: DOM injection utilities
  - `observers/`: DOM observation utilities
- **popup/**: Extension popup UI
  - `pages/`: Popup pages
  - `state/`: Popup state management

## Architecture Principles

1. **Dependency Rule**: Dependencies always point inward, with core having no dependencies on outer layers
2. **Boundary Crossing**: Use interfaces to cross architectural boundaries
3. **Domain-Driven Design**: Focus on modeling the domain accurately
4. **Separation of Concerns**: Clear separation between UI, business logic, and infrastructure
5. **Feature Encapsulation**: Features are self-contained with clear boundaries
