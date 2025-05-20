# Core Layer

This directory contains the core domain model and business logic of the Naval Auction Assistant.

## Purpose

The core layer is the heart of the application, containing domain entities, business rules, and service interfaces. It doesn't depend on any other layer and represents the "inside" of the clean architecture pattern.

## Contents

- `domain/`: Domain entities and value objects
  - Data structures that represent core business concepts
  - Entities contain both data and behavior related to the domain
- `interfaces/`: Service interfaces
  - Defines contracts (interfaces) for services used by the core
  - These interfaces are implemented in the infrastructure layer
- `services/`: Domain services
  - Implements core business logic
  - Orchestrates domain entities to achieve business goals
  - Uses dependency injection to depend on interfaces, not concrete implementations

## Design Principles

1. **Zero External Dependencies**: The core layer should have no dependencies on external frameworks or libraries
2. **Domain-Driven Design**: Focus on accurate modeling of the business domain
3. **Dependency Inversion**: Depend on abstractions, not concrete implementations
4. **Pure Business Logic**: Only business logic lives here; no UI, database, or framework code
