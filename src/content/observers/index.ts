/**
 * Mutation Observers Module
 *
 * This module provides utilities for monitoring dynamic changes to the DOM
 * using the MutationObserver API.
 */

/**
 * Configuration for DOM mutation observer
 */
export interface MutationConfig {
  targetNode: Node;
  config?: MutationObserverInit;
  onMutation: (mutations: MutationRecord[], observer: MutationObserver) => void;
  onError?: (error: Error) => void;
}

/**
 * Default configuration for mutation observer
 */
const DEFAULT_MUTATION_CONFIG: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style', 'value'],
};

/**
 * Creates and starts a mutation observer with the given configuration
 * @param config The mutation observer configuration
 * @returns The created MutationObserver instance
 */
export function createMutationObserver(config: MutationConfig): MutationObserver {
  const { targetNode, onMutation, onError } = config;
  const observerConfig = config.config || DEFAULT_MUTATION_CONFIG;

  try {
    const observer = new MutationObserver((mutations, observer) => {
      try {
        onMutation(mutations, observer);
      } catch (error) {
        console.error('Error in mutation callback:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    });

    observer.observe(targetNode, observerConfig);
    return observer;
  } catch (error) {
    console.error('Error creating mutation observer:', error);
    if (onError) {
      onError(error as Error);
    }
    // Return a dummy observer that does nothing
    return {
      observe: () => {},
      disconnect: () => {},
      takeRecords: () => [],
    } as MutationObserver;
  }
}

/**
 * Waits for an element matching a selector to appear in the DOM
 * @param selector The CSS selector to wait for
 * @param timeout Timeout in milliseconds (default: 10000)
 * @param rootNode The root node to observe (default: document.body)
 * @returns Promise resolving to the found element
 */
export function waitForElement(
  selector: string,
  timeout = 10000,
  rootNode: Node = document.body
): Promise<Element> {
  return new Promise((resolve, reject) => {
    // First check if the element already exists
    const existingElement = document.querySelector(selector);
    if (existingElement) {
      resolve(existingElement);
      return;
    }

    // Set a timeout to reject the promise if the element is not found
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector} (timeout: ${timeout}ms)`));
    }, timeout);

    // Create a mutation observer to watch for the element
    const observer = createMutationObserver({
      targetNode: rootNode,
      config: {
        childList: true,
        subtree: true,
      },
      onMutation: () => {
        const element = document.querySelector(selector);
        if (element) {
          clearTimeout(timeoutId);
          observer.disconnect();
          resolve(element);
        }
      },
      onError: error => {
        clearTimeout(timeoutId);
        reject(error);
      },
    });
  });
}

/**
 * Waits for multiple elements matching a selector to appear in the DOM
 * @param selector The CSS selector to wait for
 * @param count The minimum number of elements to wait for
 * @param timeout Timeout in milliseconds (default: 10000)
 * @param rootNode The root node to observe (default: document.body)
 * @returns Promise resolving to the found elements
 */
export function waitForElements(
  selector: string,
  count = 1,
  timeout = 10000,
  rootNode: Node = document.body
): Promise<Element[]> {
  return new Promise((resolve, reject) => {
    // First check if the elements already exist
    const existingElements = document.querySelectorAll(selector);
    if (existingElements.length >= count) {
      resolve(Array.from(existingElements));
      return;
    }

    // Set a timeout to reject the promise if the elements are not found
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(
          `Not enough elements found: ${selector} (expected: ${count}, found: ${document.querySelectorAll(selector).length})`
        )
      );
    }, timeout);

    // Create a mutation observer to watch for the elements
    const observer = createMutationObserver({
      targetNode: rootNode,
      config: {
        childList: true,
        subtree: true,
      },
      onMutation: () => {
        const elements = document.querySelectorAll(selector);
        if (elements.length >= count) {
          clearTimeout(timeoutId);
          observer.disconnect();
          resolve(Array.from(elements));
        }
      },
      onError: error => {
        clearTimeout(timeoutId);
        reject(error);
      },
    });
  });
}

/**
 * Creates an observer that watches for changes in auction listings
 * @param onAuctionAdded Callback when a new auction is added
 * @param onAuctionRemoved Callback when an auction is removed
 * @returns The created MutationObserver instance
 */
export function createAuctionListObserver(
  onAuctionAdded?: (element: Element) => void,
  onAuctionRemoved?: (element: Element) => void
): MutationObserver {
  return createMutationObserver({
    targetNode: document.body,
    config: {
      childList: true,
      subtree: true,
    },
    onMutation: mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check for added auction elements
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Check if this element is an auction listing
              if (element.matches('.list-group-item, .auction-item')) {
                if (onAuctionAdded) {
                  onAuctionAdded(element);
                }
              }

              // Check for auction listings inside the added node
              const auctionItems = element.querySelectorAll('.list-group-item, .auction-item');
              for (const auctionItem of Array.from(auctionItems)) {
                if (onAuctionAdded) {
                  onAuctionAdded(auctionItem);
                }
              }
            }
          }

          // Check for removed auction elements
          for (const node of Array.from(mutation.removedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Check if this element is an auction listing
              if (element.matches('.list-group-item, .auction-item')) {
                if (onAuctionRemoved) {
                  onAuctionRemoved(element);
                }
              }
            }
          }
        }
      }
    },
  });
}

/**
 * Creates an observer that watches for changes in form elements
 * @param formSelector CSS selector for the form element
 * @param onChange Callback when a form element changes
 * @returns The created MutationObserver instance
 */
export function createFormObserver(
  formSelector: string,
  onChange: (element: Element, attributeName: string | null) => void
): MutationObserver {
  const formElement = document.querySelector(formSelector);
  if (!formElement) {
    console.warn(`Form element not found: ${formSelector}`);
    // Return a dummy observer
    return {
      observe: () => {},
      disconnect: () => {},
      takeRecords: () => [],
    } as MutationObserver;
  }

  return createMutationObserver({
    targetNode: formElement,
    config: {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['value', 'checked', 'selected', 'data-value'],
    },
    onMutation: mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          onChange(mutation.target as Element, mutation.attributeName);
        }
      }
    },
  });
}

/**
 * Creates an observer that watches for changes in specific elements
 * @param selector CSS selector for the elements to observe
 * @param onChange Callback when an element changes
 * @returns The created MutationObserver instance
 */
export function createElementObserver(
  selector: string,
  onChange: (element: Element) => void
): MutationObserver {
  // First, observe the document for new elements matching the selector
  const documentObserver = createMutationObserver({
    targetNode: document.body,
    config: {
      childList: true,
      subtree: true,
    },
    onMutation: mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check for added elements matching the selector
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Check if this element matches the selector
              if (element.matches(selector)) {
                onChange(element);
              }

              // Check for matching elements inside the added node
              const matchingElements = element.querySelectorAll(selector);
              for (const matchingElement of Array.from(matchingElements)) {
                onChange(matchingElement);
              }
            }
          }
        }
      }
    },
  });

  // Now find all existing elements and call the change handler
  document.querySelectorAll(selector).forEach(onChange);

  return documentObserver;
}
