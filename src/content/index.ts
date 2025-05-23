/**
 * Content Script
 *
 * This script runs in the context of the e-licitatie.ro website.
 * It can access and modify the DOM of the page.
 */

import { AutocompleteInputsMessage, TriggerSearchMessage } from '../types/chrome-extension';
import { fillEstimatedValueFrom, fillPublicationDateRange } from '../utils/form-autocompletion';
import { processTargetKendoSelects, getTargetLabels } from '../utils/kendo-select-manager';

import { PageType, shouldActivate, detectPageType, reportPageInformation } from './detection';
import * as dom from './dom';
import * as observers from './observers';

// Store active observers to clean up when needed
const activeObservers: MutationObserver[] = [];

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'analyzeAuctionPage') {
    const auctionData = extractAuctionData();
    sendResponse({ success: true, data: auctionData });
    return true;
  }

  // Handle the analyzeDropdowns message from popup
  if (message.action === 'analyzeDropdowns') {
    try {
      // Use async/await with Promise to handle the asynchronous findAllDropdowns method
      processDropdowns()
        .then(dropdowns => {
          sendResponse({ dropdowns: dropdowns });
        })
        .catch(error => {
          console.error('Content: Error analyzing dropdowns:', error);
          sendResponse({ dropdowns: [] });
        });

      return true; // Indicates we'll respond asynchronously
    } catch (error) {
      console.error('Content: Error analyzing dropdowns:', error);
      sendResponse({ dropdowns: [] });
      return true;
    }
  }

  // Handle the autocompleteInputs message from popup
  if (message.action === 'autocompleteInputs') {
    try {
      console.log('Content: Starting input autocomplete process');
      // Cast message to the proper type
      const autocompleteMessage = message as AutocompleteInputsMessage;
      // Use async/await with Promise to handle asynchronous autocomplete
      autocompleteFormFields(autocompleteMessage.startDate)
        .then(result => {
          sendResponse({ success: true, message: result });
        })
        .catch(error => {
          console.error('Content: Error autocompleting inputs:', error);
          sendResponse({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        });

      return true; // Indicates we'll respond asynchronously
    } catch (error) {
      console.error('Content: Error autocompleting inputs:', error);
      sendResponse({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return true;
    }
  }

  // Handle the triggerSearch message from popup
  if (message.action === 'triggerSearch') {
    try {
      console.log('Content: Starting search trigger process');
      // Cast message to the proper type but no need to store it since we don't use any custom properties
      message as TriggerSearchMessage;
      // Import the triggerSearch function from form-autocompletion
      import('../utils/form-autocompletion')
        .then(async formAutocompletion => {
          try {
            // Call the triggerSearch function that will click the search/filter button
            const result = await formAutocompletion.triggerSearch();
            console.log('Content: Search trigger result:', result);
            sendResponse({
              success: result,
              message: result ? 'Search triggered successfully' : 'Failed to trigger search',
            });
          } catch (error) {
            console.error('Content: Error triggering search:', error);
            sendResponse({
              success: false,
              message: error instanceof Error ? error.message : 'Unknown error during search',
            });
          }
        })
        .catch(error => {
          console.error('Content: Error importing form-autocompletion:', error);
          sendResponse({
            success: false,
            message: 'Failed to load search functionality',
          });
        });

      return true; // Indicates we'll respond asynchronously
    } catch (error) {
      console.error('Content: Error in triggerSearch handler:', error);
      sendResponse({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error in search handler',
      });
      return true;
    }
  }

  return true;
});

/**
 * Autocomplete form fields on the page
 * This function identifies input fields and fills them with appropriate values
 * @param startDate Optional start date for date range fields (format: MM/DD/YYYY)
 * @returns A message indicating the result of the autocomplete operation
 */
async function autocompleteFormFields(startDate?: string): Promise<string> {
  try {
    console.log('Content: Autocomplete process starting...');

    // Step 1: Try to use our specialized ValueInputFiller for the estimated value field
    const estimatedValueFilled = await fillEstimatedValueFrom();
    console.log(`Content: Estimated value field filled: ${estimatedValueFilled}`);

    // Step 2: Try to use our specialized DateInputFiller for publication date fields
    // If a startDate was provided, import and use the custom date function
    let publicationDatesFilled = false;

    if (startDate) {
      console.log(`Content: Using custom start date: ${startDate}`);
      // Import the custom date fill function
      const formAutocompletion = await import('../utils/form-autocompletion');
      // Use the custom date range with the provided start date
      publicationDatesFilled = await formAutocompletion.fillPublicationStartDate(startDate);

      // For end date, use today as default
      if (publicationDatesFilled) {
        const today = new Date();
        const endDateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
        await formAutocompletion.fillPublicationEndDate(endDateStr);
      }
    } else {
      // Use the default date range if no custom date provided
      publicationDatesFilled = await fillPublicationDateRange();
    }

    console.log(`Content: Publication date fields filled: ${publicationDatesFilled}`);

    let specializedFieldsCount = 0;
    if (estimatedValueFilled) specializedFieldsCount++;
    if (publicationDatesFilled) specializedFieldsCount += 2; // Two date fields

    // Step 3: Find all text input fields on the page
    const inputFields = document.querySelectorAll('input[type="text"], input:not([type])');
    console.log(`Content: Found ${inputFields.length} input fields to potentially autocomplete`);

    // Log all field names/ids for debugging
    Array.from(inputFields).forEach((input, index) => {
      const el = input as HTMLInputElement;
      console.log(
        `Field #${index}: id="${el.id}", name="${el.name}", placeholder="${el.placeholder}", value="${el.value}"`
      );
    });

    let filledCount = 0;

    // Step 4: Process each input field with more specific e-licitatie.ro patterns
    for (const input of Array.from(inputFields)) {
      const inputElement = input as HTMLInputElement;
      const id = inputElement.id || '';
      const name = inputElement.name || '';
      const placeholder = inputElement.placeholder || '';
      const label = findAssociatedLabel(inputElement);

      // Skip if already filled
      if (inputElement.value.trim()) {
        console.log(
          `Content: Skipping field "${id || name}" as it already has a value: "${inputElement.value}"`
        );
        continue;
      }

      // Determine what value to use based on field attributes and e-licitatie.ro specific patterns
      let valueToFill = '';

      // E-licitatie specific field patterns (add more based on your observations)
      if (
        placeholder.toLowerCase().includes('denumire') ||
        label?.toLowerCase().includes('denumire') ||
        name.toLowerCase().includes('name') ||
        id.toLowerCase().includes('name')
      ) {
        valueToFill = 'Servicii IT';
      } else if (
        placeholder.toLowerCase().includes('cod') ||
        label?.toLowerCase().includes('cod') ||
        name.toLowerCase().includes('code') ||
        id.toLowerCase().includes('code')
      ) {
        valueToFill = '72000000';
      } else if (
        placeholder.toLowerCase().includes('valoare') ||
        label?.toLowerCase().includes('valoare') ||
        name.toLowerCase().includes('value') ||
        id.toLowerCase().includes('value')
      ) {
        valueToFill = '1000000';
      } else if (
        placeholder.toLowerCase().includes('observatii') ||
        label?.toLowerCase().includes('observatii') ||
        name.toLowerCase().includes('note') ||
        id.toLowerCase().includes('note')
      ) {
        valueToFill = 'Automat completat';
      }

      // Fill the field if we have a value
      if (valueToFill) {
        try {
          inputElement.focus();
          await delay(50);

          inputElement.value = valueToFill;

          // Trigger events for AngularJS or React applications
          const inputEvent = new Event('input', { bubbles: true, cancelable: true });
          inputElement.dispatchEvent(inputEvent);

          const changeEvent = new Event('change', { bubbles: true, cancelable: true });
          inputElement.dispatchEvent(changeEvent);

          // Try to trigger Angular digest if available
          triggerAngularDigest(inputElement);

          inputElement.blur();
          filledCount++;

          console.log(`Content: Filled field "${id || name}" with: "${valueToFill}"`);
        } catch (fieldError) {
          console.error(`Content: Error filling field "${id || name}":`, fieldError);
        }
      }
    }

    const totalFilled = filledCount + specializedFieldsCount;
    return `Successfully filled ${totalFilled} of ${inputFields.length} input fields`;
  } catch (error) {
    console.error('Content: Error in autocompleteFormFields:', error);
    throw new Error('Failed to autocomplete form fields');
  }
}

/**
 * Find the label associated with an input field
 */
function findAssociatedLabel(input: HTMLInputElement): string | null {
  // Method 1: Look for label with 'for' attribute matching input id
  if (input.id) {
    const forLabel = document.querySelector(`label[for="${input.id}"]`);
    if (forLabel) {
      return forLabel.textContent?.trim() || null;
    }
  }

  // Method 2: Look for parent container and find label within it
  const container = input.closest('.form-group, .col-md-3, .col-md-4, .col-md-6, .form-field');
  if (container) {
    const label = container.querySelector('label');
    if (label) {
      return label.textContent?.trim() || null;
    }
  }

  // Method 3: Check preceding siblings
  let sibling = input.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === 'LABEL') {
      return sibling.textContent?.trim() || null;
    }
    sibling = sibling.previousElementSibling;
  }

  return null;
}

/**
 * Try to trigger Angular digest cycle
 */
function triggerAngularDigest(element: HTMLElement): void {
  try {
    // Check if Angular is available and trigger digest
    const windowWithAngular = window as Window & {
      angular?: {
        element: (el: Element) => {
          scope: () => {
            $apply: () => void;
          };
        };
      };
    };

    const angularElement = windowWithAngular.angular?.element;
    if (angularElement) {
      const scope = angularElement(element).scope();
      if (scope && scope.$apply) {
        scope.$apply();
        console.log('Content: ✓ Triggered AngularJS digest cycle');
      }
    }
  } catch (e) {
    // Ignore errors from Angular scope operations
    console.log(`Content: ℹ️ Could not trigger AngularJS digest: ${e}`);
  }
}

/**
 * Utility delay function
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Initialize the content script
 */
function initialize(): void {
  // Check if we should activate on this page
  if (!shouldActivate()) {
    return;
  }

  // Report page information to background script
  reportPageInformation();

  // Set up observers based on page type
  setupObservers();

  // Request preferences from background script
  chrome.runtime.sendMessage({ action: 'getPreferences' }, preferences => {
    if (preferences?.autoFill) {
      // Handle auto-fill if enabled
    }
  });
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

// First, create a proper interface for the dropdown return type
interface DropdownInfo {
  title: string;
  id: string;
  name: string;
  options: Array<{
    value: string;
    text: string;
    selected: boolean;
  }>;
  isKendo?: boolean;
}

/**
 * Find all SELECT elements in the document and analyze them
 * Uses a simpler approach to find associated labels
 */
function findAllDropdowns(): DropdownInfo[] {
  try {
    // Find standard SELECT elements
    const selectElements = document.querySelectorAll('select');

    // Convert NodeList to Array for easier manipulation
    const dropdowns: DropdownInfo[] = Array.from(selectElements).map(select => {
      const element = select as HTMLSelectElement;
      const id = element.id || '';
      const name = element.name || '';

      // Find the closest label - multiple strategies in order of priority
      let label = '';

      // 1. Look for label with matching 'for' attribute if element has ID
      if (id) {
        const forLabel = document.querySelector(`label[for="${id}"]`);
        if (forLabel) {
          label = forLabel.textContent?.trim() || '';
        }
      }

      // 2. Look for a parent div container and find label within it
      if (!label) {
        // Find containing wrapper (common pattern in form layouts)
        const parentContainer = element.closest(
          '.form-group, .col, .col-md-3, .col-md-4, .col-md-6, .control-group, .form-field'
        );
        if (parentContainer) {
          // Find label within the same container
          const labelElement = parentContainer.querySelector('label');
          if (labelElement) {
            label = labelElement.textContent?.trim() || '';
          }
        }
      }

      // 3. Look for preceding sibling label
      if (!label) {
        let previous = element.previousElementSibling;
        while (previous && !label) {
          if (previous.tagName === 'LABEL') {
            label = previous.textContent?.trim() || '';
          }
          previous = previous.previousElementSibling;
        }
      }

      // 4. Check for custom attributes
      if (!label) {
        // Try commonly used attributes for labeling
        label =
          element.getAttribute('aria-label') ||
          element.getAttribute('placeholder') ||
          element.getAttribute('title') ||
          '';
      }

      // 5. Fallback to name or id with formatting if still no label
      if (!label) {
        if (name) {
          // Format name: "firstName" -> "First Name"
          label = name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ');
        } else if (id) {
          // Format id
          label = id
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ');
        } else {
          label = 'Unnamed Dropdown';
        }
      }

      // Get all options
      const options = Array.from(element.options).map(option => ({
        value: option.value,
        text: option.text,
        selected: option.selected,
      }));

      return {
        title: label,
        id,
        name,
        options,
      };
    });

    // Also look for Kendo UI dropdowns that might have hidden select elements
    const kendoDropdowns = document.querySelectorAll(
      '.k-combobox, .k-dropdown, .k-dropdownlist, .k-widget'
    );

    // If there are Kendo dropdowns, process them too
    if (kendoDropdowns.length > 0) {
      kendoDropdowns.forEach(kendoDropdown => {
        // Find the hidden select element inside
        const hiddenSelect = kendoDropdown.querySelector(
          'select[style*="display: none"]'
        ) as HTMLSelectElement;
        if (!hiddenSelect) return; // Skip if no hidden select found

        // Check if this select is already processed
        const alreadyProcessed = dropdowns.some(
          d => d.id === hiddenSelect.id || (hiddenSelect.name && d.name === hiddenSelect.name)
        );
        if (alreadyProcessed) return;

        // Based on the example DOM structure, get label (typically preceding the Kendo widget)
        let label = '';

        // Method 1: Find parent container and get the label within it
        const parentContainer = kendoDropdown.closest(
          '.col-md-3, .col-md-4, .col-md-6, .col, .form-group, .form-field'
        );
        if (parentContainer) {
          const labelElement = parentContainer.querySelector('label');
          if (labelElement) {
            label = labelElement.textContent?.trim() || '';
          }
        }

        // Method 2: Look for preceding sibling label
        if (!label) {
          let previous = kendoDropdown.previousElementSibling;
          while (previous && !label) {
            if (previous.tagName === 'LABEL') {
              label = previous.textContent?.trim() || '';
              break;
            }
            previous = previous.previousElementSibling;
          }
        }

        // Fallback to attributes or name/id
        if (!label) {
          label =
            hiddenSelect.getAttribute('aria-label') ||
            hiddenSelect.getAttribute('placeholder') ||
            hiddenSelect.getAttribute('title') ||
            hiddenSelect.getAttribute('k-ng-model') ||
            hiddenSelect.name ||
            hiddenSelect.id ||
            'Kendo Dropdown';
        }

        // Get options - Kendo might not have populated options in the select yet
        let options: Array<{ value: string; text: string; selected: boolean }> = [];

        // Try to get options from the select element
        if (hiddenSelect.options && hiddenSelect.options.length > 0) {
          options = Array.from(hiddenSelect.options).map(option => ({
            value: option.value,
            text: option.text,
            selected: option.selected,
          }));
        } else {
          // If no options in select, try to find them in the Kendo widget
          const kendoItems = kendoDropdown.querySelectorAll('.k-item');
          if (kendoItems.length > 0) {
            options = Array.from(kendoItems).map(item => ({
              value: item.getAttribute('data-value') || '',
              text: item.textContent?.trim() || '',
              selected: item.classList.contains('k-state-selected'),
            }));
          }
        }

        const kendoInfo: DropdownInfo = {
          title: label,
          id: hiddenSelect.id || '',
          name: hiddenSelect.name || '',
          options,
          isKendo: true,
        };

        dropdowns.push(kendoInfo);
      });
    }

    return dropdowns;
  } catch (error) {
    console.error('Content: Error in findAllDropdowns:', error);
    return [];
  }
}

/**
 * Process all dropdowns on the page, including Kendo UI components
 */
async function processDropdowns(): Promise<DropdownInfo[]> {
  console.log('Starting dropdown processing...');

  // Get and log the target labels we're looking for
  const targetLabels = getTargetLabels();
  console.log('Processing target labels:', targetLabels.join(', '));

  // Process target Kendo selects to get their data
  const kendoSelectData = await processTargetKendoSelects();
  console.log('Kendo select data:', kendoSelectData);

  // Convert Kendo data to DropdownInfo format
  const kendoDropdowns: DropdownInfo[] = Object.entries(kendoSelectData).map(([label, options]) => {
    return {
      title: label,
      id: '',
      name: '',
      options: options.map(opt => ({
        value: opt.value,
        text: opt.text,
        selected: false,
      })),
      isKendo: true,
    };
  });

  // For non-target dropdowns, use the regular method
  const regularDropdowns = findAllDropdowns();

  // Filter out regular dropdowns that match our target labels to avoid duplication
  const filteredRegularDropdowns = regularDropdowns.filter(dropdown => {
    // Check if this dropdown matches any of our target labels
    const isTargetDropdown = targetLabels.some(
      targetLabel =>
        dropdown.title.toLowerCase().includes(targetLabel.toLowerCase()) ||
        targetLabel.toLowerCase().includes(dropdown.title.toLowerCase())
    );

    // Keep only non-target dropdowns from the regular list
    return !isTargetDropdown;
  });

  console.log(
    `Found ${kendoDropdowns.length} target Kendo dropdowns and ${filteredRegularDropdowns.length} other dropdowns`
  );

  // Return the combined list with target dropdowns first
  return [...kendoDropdowns, ...filteredRegularDropdowns];
}

// Start initialization when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Clean up observers when the page is unloaded
window.addEventListener('beforeunload', cleanupObservers);
