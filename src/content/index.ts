/**
 * Content Script
 *
 * This script runs in the context of the e-licitatie.ro website.
 * It can access and modify the DOM of the page.
 */

console.log('Content script loaded');

// Example of using chrome extension API
chrome.runtime.sendMessage({ action: 'contentScriptLoaded' }, response => {
  console.log('Response from background:', response);
});

// Example of DOM manipulation
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
});

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

/**
 * Find all SELECT elements in the document and analyze them
 * Enhanced to work with Kendo UI components and complex DOM structures
 */
function findAllDropdowns() {
  const selectElements = document.querySelectorAll('select');
  console.log(`Found ${selectElements.length} raw select elements`);

  return Array.from(selectElements).map(select => {
    const element = select as HTMLSelectElement;
    const id = element.id;
    const name = element.name;

    // Try to find a label for this dropdown
    let title = '';

    // 1. First check for a label that references this select by ID (standard approach)
    if (id) {
      const labelForId = document.querySelector(`label[for="${id}"]`);
      if (labelForId) {
        title = labelForId.textContent?.trim() || '';
        console.log(`Found label via for attribute: ${title}`);
      }
    }

    // 2. For Kendo UI: Look at the parent container and find nearby label
    if (!title) {
      // Go up to find parent container (typically a div with col-md-* class for layout)
      let parentContainer = select.closest(
        '.col-md-3, .col-md-4, .col-md-6, .col-md-12, .form-group'
      );

      if (parentContainer) {
        // Find a label within this container
        const nearbyLabel = parentContainer.querySelector('label');
        if (nearbyLabel) {
          title = nearbyLabel.textContent?.trim() || '';
          console.log(`Found label in parent container: ${title}`);
        }
      }
    }

    // 3. Try looking at previous sibling elements for labels
    if (!title && select.parentElement) {
      // Go up to parent node first
      let parent = select.parentElement;

      // Try to find a label within siblings
      const findLabelInSiblings = (element: Element): string => {
        if (element.tagName === 'LABEL') {
          return element.textContent?.trim() || '';
        }

        const labelInElement = element.querySelector('label');
        if (labelInElement) {
          return labelInElement.textContent?.trim() || '';
        }

        return '';
      };

      // Start from parent's first child and check each sibling
      let sibling = parent.firstElementChild;
      while (sibling && !title) {
        // Skip the select element itself
        if (sibling !== select && sibling !== select.parentElement) {
          const labelText = findLabelInSiblings(sibling);
          if (labelText) {
            title = labelText;
            console.log(`Found label in sibling: ${title}`);
          }
        }
        sibling = sibling.nextElementSibling;
      }
    }

    // Fallback to name or id if no title found
    if (!title) {
      title = name || id || 'Unnamed Dropdown';
      console.log(`Using fallback title: ${title}`);
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
