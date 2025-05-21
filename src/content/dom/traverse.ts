/**
 * DOM Traversal Utilities
 *
 * This module provides utilities for traversing the DOM in complex page structures,
 * particularly focused on e-licitatie.ro website.
 */

/**
 * Find the nearest element matching a selector by traversing up the DOM tree
 * @param startElement The element to start from
 * @param selector The CSS selector to match
 * @param maxDepth Maximum number of levels to traverse up (prevents infinite loops)
 * @returns The closest matching element or null if not found
 */
export function findClosestParent(
  startElement: Element,
  selector: string,
  maxDepth = 10
): Element | null {
  let current: Element | null = startElement;
  let depth = 0;

  while (current && depth < maxDepth) {
    // Don't check the start element itself, only its ancestors
    if (depth > 0 && current.matches(selector)) {
      return current;
    }

    current = current.parentElement;
    depth++;
  }

  return null;
}

/**
 * Find the first matching element by traversing down the DOM tree
 * @param startElement The element to start from
 * @param selector The CSS selector to match
 * @returns The first matching descendant element or null if not found
 */
export function findFirstDescendant(
  startElement: Element | Document,
  selector: string
): Element | null {
  return startElement.querySelector(selector);
}

/**
 * Find all matching elements by traversing down the DOM tree
 * @param startElement The element to start from
 * @param selector The CSS selector to match
 * @returns An array of matching descendant elements
 */
export function findAllDescendants(startElement: Element | Document, selector: string): Element[] {
  return Array.from(startElement.querySelectorAll(selector));
}

/**
 * Find the nearest previous sibling matching a selector
 * @param startElement The element to start from
 * @param selector The CSS selector to match
 * @returns The matching sibling element or null if not found
 */
export function findPreviousSibling(startElement: Element, selector: string): Element | null {
  let current = startElement.previousElementSibling;

  while (current) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.previousElementSibling;
  }

  return null;
}

/**
 * Find the nearest next sibling matching a selector
 * @param startElement The element to start from
 * @param selector The CSS selector to match
 * @returns The matching sibling element or null if not found
 */
export function findNextSibling(startElement: Element, selector: string): Element | null {
  let current = startElement.nextElementSibling;

  while (current) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.nextElementSibling;
  }

  return null;
}

/**
 * Find a label element associated with a form field (using for attribute or proximity)
 * @param element The form element to find a label for
 * @returns The associated label element or null if not found
 */
export function findAssociatedLabel(element: Element): HTMLLabelElement | null {
  if (!element.id) {
    return findNearestLabel(element);
  }

  // First, check for label with 'for' attribute
  const labelWithFor = document.querySelector(`label[for="${element.id}"]`) as HTMLLabelElement;
  if (labelWithFor) {
    return labelWithFor;
  }

  // If not found, try to find the nearest label
  return findNearestLabel(element);
}

/**
 * Find the nearest label element based on DOM proximity
 * @param element The form element to find a label for
 * @returns The nearest label element or null if not found
 */
export function findNearestLabel(element: Element): HTMLLabelElement | null {
  // Check if the element is within a label
  const parentLabel = findClosestParent(element, 'label', 3) as HTMLLabelElement;
  if (parentLabel) {
    return parentLabel;
  }

  // Check for a label within the same form group (common pattern in e-licitatie.ro)
  const formGroup = findClosestParent(element, '.form-group', 3);
  if (formGroup) {
    return formGroup.querySelector('label') as HTMLLabelElement;
  }

  // Check previous sibling
  const prevLabel = findPreviousSibling(element, 'label') as HTMLLabelElement;
  if (prevLabel) {
    return prevLabel;
  }

  // Look at parent's first child for label
  const parent = element.parentElement;
  if (parent && parent.firstElementChild && parent.firstElementChild.tagName === 'LABEL') {
    return parent.firstElementChild as HTMLLabelElement;
  }

  return null;
}

/**
 * Get the hierarchy of element IDs from root to the given element
 * Useful for creating unique paths to elements
 * @param element The element to get the path for
 * @returns An array of IDs representing the path
 */
export function getElementIdPath(element: Element): string[] {
  const path: string[] = [];
  let current: Element | null = element;

  while (current) {
    if (current.id) {
      path.unshift(current.id);
    }
    current = current.parentElement;
  }

  return path;
}

/**
 * Find the common parent of two elements
 * @param element1 The first element
 * @param element2 The second element
 * @returns The common parent element or null if not found
 */
export function findCommonParent(element1: Element, element2: Element): Element | null {
  // Get all parents of element1
  const parents1: Element[] = [];
  let current1: Element | null = element1;

  while (current1) {
    parents1.push(current1);
    current1 = current1.parentElement;
  }

  // Check if element2 or any of its parents is in the list of element1's parents
  let current2: Element | null = element2;

  while (current2) {
    if (parents1.includes(current2)) {
      return current2;
    }
    current2 = current2.parentElement;
  }

  return null;
}

/**
 * Get the DOM path of an element as a CSS selector string
 * @param element The element to get the path for
 * @returns A CSS selector string that uniquely identifies the element
 */
export function getElementCssPath(element: Element): string {
  if (!element) return '';
  if (element.id) return `#${element.id}`;

  const path: string[] = [];
  let current: Element | null = element;

  while (current && current.tagName !== 'HTML') {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    } else {
      // Add class names to improve specificity if id is not available
      if (current.classList.length > 0) {
        const classNames = Array.from(current.classList).join('.');
        selector += `.${classNames}`;
      }

      // Add nth-child for additional specificity
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }

      path.unshift(selector);
      current = current.parentElement;
    }
  }

  return path.join(' > ');
}
