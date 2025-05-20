/**
 * Content Script
 *
 * This script runs in the context of the e-licitatie.ro website.
 * It can access and modify the DOM of the page.
 */

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'analyzeAuctionPage') {
    const auctionData = extractAuctionData();
    sendResponse({ success: true, data: auctionData });
  }
  return true;
});

// Example function to extract auction data from the page
function extractAuctionData() {
  // This is a placeholder implementation
  // In a real implementation, this would extract actual data from the DOM
  const pageTitle = document.title;
  const auctionId = window.location.href.match(/\/([A-Za-z0-9-]+)$/)?.[1] || 'unknown';

  return {
    title: pageTitle,
    id: auctionId,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };
}

// Initialize content script
function initialize() {
  console.log('Naval Auction Assistant content script initialized');

  // Request preferences from background script
  chrome.runtime.sendMessage({ action: 'getPreferences' }, preferences => {
    if (preferences?.autoFill) {
      // Example: Auto-fill functionality would be implemented here
      console.log('Auto-fill is enabled');
    }
  });
}

// Run initialization
initialize();
