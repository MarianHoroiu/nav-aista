# Utilities

This directory contains shared utility functions and helpers used throughout the application.

## Purpose

The utilities directory provides common functionality that is not specific to any domain or feature but is used by multiple parts of the application. This includes helper functions, formatters, validators, and other reusable code.

## Contents

- `dom/`: DOM manipulation utilities
  - Selector helpers
  - Element creation and manipulation
  - Event handling helpers
- `formatter/`: Data formatting utilities
  - Date and time formatting
  - Currency formatting
  - Text formatting
- `validation/`: Validation helpers
  - Input validation
  - Data validation
  - Form validation helpers

## Design Principles

1. **Pure Functions**: Utilities should be pure functions without side effects
2. **Single Responsibility**: Each utility function should do one thing and do it well
3. **Type Safety**: All utilities should be fully typed and type-safe
4. **Testing**: Utilities should be easy to test and have high test coverage
5. **Documentation**: Include clear JSDoc comments explaining purpose and usage
