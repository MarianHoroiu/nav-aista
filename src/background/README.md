# Background Service

This directory contains the background service worker for the browser extension.

## Purpose

The background service provides persistent functionality for the extension, handling tasks like:

- Managing extension lifecycle (installation, updates)
- Coordinating messaging between different parts of the extension
- Performing background tasks and monitoring
- Managing extension state

## Contents

- `events/`: Event handlers
  - Installation event handling
  - Update event handling
  - Message event handling
- `messaging/`: Message passing infrastructure
  - Communication with content scripts
  - Communication with popup UI
  - External messaging

## Technical Notes

- Uses the Service Worker model (Manifest V3)
- Persistent state is managed through Chrome Storage
- Uses event-driven architecture
- Follows the mediator pattern for messaging

## Limitations

- Service Workers have limited execution time
- Background context is different from content script context
- No direct DOM access
- Limited API access compared to content scripts
