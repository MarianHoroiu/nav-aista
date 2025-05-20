# Company Profile Management Feature

This feature module manages company profiles including creation, editing, and storage.

## Purpose

The profile management feature allows users to:

- Create and edit company profiles
- Manage capabilities (ship types, tonnage ranges, repair specializations)
- Configure preferences for auction matching
- Import/export profile data

## Components

- UI Components
  - Profile editor form
  - Capability manager
  - Preferences configurator
- Services
  - Profile validation service
  - Profile storage adapter
- Utilities
  - Profile data transformer
  - Validation functions

## Integration Points

- Uses core domain models:
  - `CompanyProfile` entity
  - `CompanyProfileService` for persistence
- Interfaces with:
  - Chrome Storage (via infrastructure layer)
  - UI components layer for shared UI elements

## Usage

This feature module exports:

1. React components for profile management UI
2. Hooks for profile data access
3. Utilities for profile validation and transformation
