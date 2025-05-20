# Infrastructure Layer

This directory contains the concrete implementations of the interfaces defined in the core layer.

## Purpose

The infrastructure layer is responsible for providing external capabilities to the application, such as storage, messaging, and browser-specific functionality. It implements the interfaces defined in the core layer and serves as the adapter between the core domain and external systems.

## Contents

- `api/`: Interface definitions
  - Contains interfaces that define the contracts for infrastructure services
  - Acts as the boundary between the core and infrastructure layers
- `storage/`: Storage implementations
  - Concrete implementations for storage solutions
  - Includes Chrome Storage API wrapper, IndexedDB access, etc.
- `browser/`: Browser-specific implementations
  - Browser extension API wrappers
  - Web APIs needed for the extension functionality

## Design Principles

1. **Implement Core Interfaces**: Each infrastructure service implements an interface defined in the core layer
2. **External Concerns Only**: This layer should only contain code that deals with external systems and frameworks
3. **Isolation**: Isolate external dependencies to make them easily swappable
4. **Adapter Pattern**: Use the adapter pattern to convert external interfaces to those expected by the core
