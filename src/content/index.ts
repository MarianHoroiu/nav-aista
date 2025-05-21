/**
 * Content Script
 *
 * This script runs in the context of the e-licitatie.ro website.
 * It can access and modify the DOM of the page.
 */

import {
  PageType,
  shouldActivate,
  detectPageType,
  determineActiveFeatures,
  reportPageInformation,
} from './detection';
import * as dom from './dom';
import * as observers from './observers';

// Store active observers to clean up when needed
const activeObservers: MutationObserver[] = [];

/**
 * Initialize the content script
 */
function initialize(): void {
  console.log('Naval Auction Assistant content script loaded');

  // Check if we should activate on this page
  if (!shouldActivate()) {
    console.log('Content script not activating on this page');
    return;
  }

  // Report page information to background script
  reportPageInformation();

  // Determine which features should be activated
  const features = determineActiveFeatures();
  console.log('Active features:', features);

  // Set up observers based on page type
  setupObservers();

  // Request preferences from background script
  chrome.runtime.sendMessage({ action: 'getPreferences' }, preferences => {
    if (preferences?.autoFill) {
      console.log('Auto-fill is enabled');
    }
  });

  // Set up event listeners
  setupEventListeners();
}

/**
 * Set up DOM mutation observers based on the page type
 */
function setupObservers(): void {
  const pageInfo = detectPageType();

  // Set up an observer for any page type to detect dynamic changes
  const bodyObserver = observers.createMutationObserver({
    targetNode: document.body,
    onMutation: mutations => {
      // Handle any mutations that affect the page structure
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if we need to refresh page detection
          const currentPageInfo = detectPageType();
          if (currentPageInfo.type !== pageInfo.type) {
            console.log(`Page type changed from ${pageInfo.type} to ${currentPageInfo.type}`);

            // Clean up old observers
            cleanupObservers();

            // Re-initialize with new page type
            initialize();
            return;
          }
        }
      }
    },
  });

  activeObservers.push(bodyObserver);

  // Set up page-specific observers
  switch (pageInfo.type) {
    case PageType.AUCTION_LIST:
      setupAuctionListObservers();
      break;
    case PageType.AUCTION_DETAIL:
      setupAuctionDetailObservers();
      break;
    case PageType.SEARCH:
      setupSearchFormObservers();
      break;
    case PageType.DOCUMENT_VIEW:
      setupDocumentViewObservers();
      break;
    default:
      break;
  }
}

/**
 * Set up observers for auction list pages
 */
function setupAuctionListObservers(): void {
  const auctionObserver = observers.createAuctionListObserver(
    // Callback when a new auction is added
    element => {
      console.log(
        'New auction item detected:',
        dom.getElementText(element.querySelector('h3, .title'))
      );

      // Enhance the auction item with additional functionality
      enhanceAuctionItem(element);
    },
    // Callback when an auction is removed
    element => {
      console.log('Auction item removed:', dom.getElementText(element.querySelector('h3, .title')));
    }
  );

  activeObservers.push(auctionObserver);

  // Also enhance existing auction items
  document.querySelectorAll('.list-group-item, .auction-item').forEach(enhanceAuctionItem);
}

/**
 * Set up observers for auction detail pages
 */
function setupAuctionDetailObservers(): void {
  // Watch for document links
  const documentLinkObserver = observers.createElementObserver(
    'a[href*=".pdf"], a[href*="document-"]',
    element => {
      console.log('Document link detected:', element.getAttribute('href'));

      // Enhance document links
      enhanceDocumentLink(element as HTMLAnchorElement);
    }
  );

  activeObservers.push(documentLinkObserver);
}

/**
 * Set up observers for search form pages
 */
function setupSearchFormObservers(): void {
  const formObserver = observers.createFormObserver('form', (element, attributeName) => {
    if (attributeName === 'value') {
      console.log(
        'Form value changed:',
        element.getAttribute('name'),
        element.getAttribute('value')
      );
    }
  });

  activeObservers.push(formObserver);
}

/**
 * Set up observers for document view pages
 */
function setupDocumentViewObservers(): void {
  // Watch for PDF viewer or iframe changes
  const viewerObserver = observers.createElementObserver(
    '.document-viewer, iframe[src*=".pdf"]',
    _element => {
      console.log('Document viewer content updated');
    }
  );

  activeObservers.push(viewerObserver);
}

/**
 * Set up event listeners for user interactions
 */
function setupEventListeners(): void {
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Content script received message:', message);

    if (message.action === 'analyzeAuctionPage') {
      const auctionData = extractAuctionData();
      sendResponse({ success: true, data: auctionData });
      return true;
    }

    // Handle the analyzeDropdowns message from popup
    if (message.action === 'analyzeDropdowns') {
      console.log('Analyzing dropdowns from popup request');
      const dropdowns = findAllDropdowns();
      console.log('Found dropdowns:', dropdowns);
      sendResponse({ dropdowns: dropdowns });
      return true;
    }

    return true;
  });
}

/**
 * Clean up all active observers
 */
function cleanupObservers(): void {
  activeObservers.forEach(observer => observer.disconnect());
  activeObservers.length = 0;
}

/**
 * Enhance an auction item with additional functionality
 * @param element The auction item element
 */
function enhanceAuctionItem(element: Element): void {
  // Add a class to mark this element as enhanced
  if (element.classList.contains('naista-enhanced')) {
    return;
  }

  element.classList.add('naista-enhanced');

  // Add a button to analyze the auction
  const actionsContainer = element.querySelector('.actions') || element;

  const analyzeButton = document.createElement('button');
  analyzeButton.className = 'btn btn-sm btn-primary naista-analyze-btn';
  analyzeButton.textContent = 'Analyze';
  analyzeButton.style.marginLeft = '5px';

  analyzeButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();

    // Get the auction link
    const auctionLink = element.querySelector('a[href*="procedura-"]') as HTMLAnchorElement;

    if (auctionLink) {
      // Send a message to analyze this auction
      chrome.runtime.sendMessage({
        action: 'analyzeAuction',
        auctionUrl: auctionLink.href,
      });
    }
  });

  actionsContainer.appendChild(analyzeButton);
}

/**
 * Enhance a document link with additional functionality
 * @param element The document link element
 */
function enhanceDocumentLink(element: HTMLAnchorElement): void {
  // Add a class to mark this element as enhanced
  if (element.classList.contains('naista-enhanced')) {
    return;
  }

  element.classList.add('naista-enhanced');

  // Add a download button next to the link
  const downloadButton = document.createElement('button');
  downloadButton.className = 'btn btn-sm btn-info naista-download-btn';
  downloadButton.textContent = 'Download';
  downloadButton.style.marginLeft = '5px';

  downloadButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();

    // Send a message to download this document
    chrome.runtime.sendMessage({
      action: 'downloadDocument',
      documentUrl: element.href,
      documentName: element.textContent || 'document.pdf',
    });
  });

  element.parentNode?.insertBefore(downloadButton, element.nextSibling);
}

/**
 * Extract auction data from the page
 * @returns Auction data object
 */
function extractAuctionData(): Record<string, unknown> {
  const pageInfo = detectPageType();

  // This is a placeholder implementation
  // In a real implementation, this would extract actual data from the DOM
  const pageTitle = document.title;
  const auctionId =
    pageInfo.auctionId || window.location.href.match(/\/([A-Za-z0-9-]+)$/)?.[1] || 'unknown';

  return {
    title: pageTitle,
    id: auctionId,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    pageType: pageInfo.type,
  };
}

/**
 * Find all SELECT elements in the document and analyze them
 * Enhanced to work with Kendo UI components and complex DOM structures
 */
function findAllDropdowns(): Record<string, unknown>[] {
  const selectElements = document.querySelectorAll('select');
  console.log(`Found ${selectElements.length} raw select elements`);

  return Array.from(selectElements).map(select => {
    const element = select as HTMLSelectElement;
    const id = element.id;
    const name = element.name;

    // Try to find a label for this dropdown
    const label = dom.findAssociatedLabel(element);
    let title = label ? dom.getElementText(label) : '';

    // Fallback to name or id if no title found
    if (!title) {
      title = name || id || 'Unnamed Dropdown';
    }

    // Get all options
    const options = Array.from(element.options).map(option => ({
      value: option.value,
      text: option.text,
      selected: option.selected,
    }));

    // Log the found dropdown
    console.log(
      `Analyzed dropdown: ${title} (id: ${id}, name: ${name}, options: ${options.length})`
    );

    return {
      title,
      id,
      name,
      options,
    };
  });
}

// Start initialization when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Clean up observers when the page is unloaded
window.addEventListener('beforeunload', cleanupObservers);
