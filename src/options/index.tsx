/**
 * Options Component
 *
 * This is the main entry point for the extension's options page.
 * It will be rendered when the user accesses the extension's options.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

import Options from './Options';
import '../styles/global.scss';

// Initialize the app by rendering the Options component into the DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Options />);
} else {
  console.error('Root element not found');
}
