# Features Layer

This directory contains feature-specific modules that implement the application's main functionality.

## Purpose

The features layer organizes functionality by business capabilities, with each feature being a self-contained module. Each feature may include its own UI components, business logic, and infrastructure adaptations specific to that feature.

## Contents

- `auction-search/`: Auction search and form automation
  - Form detection and auto-filling
  - Search criteria management
  - Result processing
- `document-analysis/`: Document processing and relevance assessment
  - PDF parsing and extraction
  - Document relevance scoring
  - Technical specification analysis
- `profile-management/`: Company profile management
  - Profile creation and editing
  - Capability management
  - Preference configuration

## Design Principles

1. **Feature Encapsulation**: Each feature should be self-contained and loosely coupled from other features
2. **Vertical Slices**: Features represent complete vertical slices of functionality (UI to infrastructure)
3. **Use Core Services**: Feature-specific logic should use core services and entities
4. **Composition**: Features should be composable, with clear boundaries and well-defined interfaces
