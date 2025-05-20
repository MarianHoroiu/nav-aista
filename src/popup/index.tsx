/**
 * Popup Component
 *
 * This is the main entry point for the extension's popup UI.
 * It will be rendered when the user clicks on the extension icon.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

import Popup from './Popup';
import '../styles/global.scss';

// Initialize the app by rendering the Popup component into the DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
} else {
  console.error('Root element not found');
}
