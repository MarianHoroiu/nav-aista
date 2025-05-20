# Popup UI

This directory contains the popup user interface for the browser extension.

## Purpose

The popup UI provides a user interface that appears when the extension icon is clicked. It enables users to:

- Manage company profiles
- Configure search preferences
- View saved auctions
- Access extension settings
- View notifications and alerts

## Contents

- `pages/`: Popup pages
  - Main popup page
  - Settings page
  - Profile management page
  - Saved auctions page
- `state/`: Popup state management
  - State management hooks
  - Context providers
  - Local storage integration

## Technical Notes

- Built with React for component-based UI
- Uses React hooks for state management
- Styled with Tailwind CSS
- Communicates with background service via messaging
- Has limited size and should be designed for efficiency

## Design Principles

1. **Responsive Design**: Adapt to different screen sizes within popup constraints
2. **Progressive Disclosure**: Show most important information first with options to see more
3. **Efficient Rendering**: Optimize for fast initial load and reflows
4. **Consistent Design**: Follow the extension's design system
5. **Accessibility**: Ensure keyboard navigation and screen reader support
