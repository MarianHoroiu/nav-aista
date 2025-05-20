# Type Definitions

This directory contains TypeScript type definitions and declarations for the application.

## Purpose

The types directory provides shared type definitions that are used across different parts of the application. It ensures type consistency and improves developer experience with better autocompletion and type checking.

## Contents

- `domain/`: Domain-related type definitions
  - Types related to core domain models
  - Shared enums and constants
- `api/`: API-related type definitions
  - Request and response types
  - API client configurations
- `browser/`: Browser-specific type definitions
  - Chrome extension API augmentations
  - DOM-related types
- Module declaration files (.d.ts) for third-party libraries without TypeScript definitions

## Design Principles

1. **Single Source of Truth**: Define each type in only one place
2. **Descriptive Naming**: Use descriptive names that clearly convey the type's purpose
3. **Minimal Dependencies**: Avoid unnecessary dependencies in type definitions
4. **Consistent Structure**: Follow consistent patterns for type definitions
5. **Documentation**: Include JSDoc comments for complex types
