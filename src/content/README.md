# Content Scripts

This directory contains content scripts that interact with web pages.

## Purpose

Content scripts run in the context of web pages and can interact with the DOM. They enable the extension to:

- Analyze and modify auction website pages
- Detect and fill forms
- Extract auction information
- Insert UI overlays and controls

## Contents

- `injection/`: DOM injection utilities
  - UI component injection
  - Form control augmentation
  - Overlay creation
- `observers/`: DOM observation utilities
  - Page mutation observers
  - Form detection
  - Dynamic content handling

## Technical Notes

- Content scripts run in an isolated JavaScript context
- They have access to the page's DOM but not to page scripts' variables
- Communication with the background service uses message passing
- CSS injected by content scripts is isolated from the page's CSS

## Design Principles

1. **Minimal DOM Manipulation**: Modify the DOM only when necessary
2. **Performance Conscious**: Be mindful of performance impact on the website
3. **Graceful Degradation**: Handle cases where the extension cannot function properly
4. **Isolation**: Keep content script functionality isolated and modular
