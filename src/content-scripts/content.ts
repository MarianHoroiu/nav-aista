import { AnalyzeDropdownsMessage, AnalyzeDropdownsResponse } from '../types/chrome-extension';

import { DOMAnalyzer } from './dom-analyzer';

console.log('Naval Auction Assistant: Content script loaded');

// Function to analyze the page for dropdowns
function analyzePageDropdowns() {
  console.log('Naval Auction Assistant: Analyzing page dropdowns');
  DOMAnalyzer.logDropdownAnalysis();
}

// Run the analysis when the page is fully loaded
if (document.readyState === 'complete') {
  analyzePageDropdowns();
} else {
  window.addEventListener('load', analyzePageDropdowns);
}

// Also add a MutationObserver to detect dynamically added dropdowns
const observer = new MutationObserver(mutations => {
  // Check if any mutations added SELECT elements
  const hasNewSelects = mutations.some(mutation => {
    if (mutation.type === 'childList') {
      return Array.from(mutation.addedNodes).some(node => {
        // Check if the node itself is a SELECT
        if (node instanceof HTMLSelectElement) {
          return true;
        }
        // Check if the node contains SELECT elements
        if (node instanceof HTMLElement) {
          return node.querySelector('select') !== null;
        }
        return false;
      });
    }
    return false;
  });

  // If new SELECT elements were found, re-analyze the page
  if (hasNewSelects) {
    console.log('Naval Auction Assistant: Detected new dropdown elements');
    DOMAnalyzer.logDropdownAnalysis();
  }
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message: AnalyzeDropdownsMessage, _sender, sendResponse) => {
  if (message.action === 'analyzeDropdowns') {
    const dropdowns = DOMAnalyzer.findAllDropdowns();
    sendResponse({ dropdowns: dropdowns } as AnalyzeDropdownsResponse);
    return true; // Indicates we'll respond asynchronously
  }
  return false; // Must return a value for all code paths
});
