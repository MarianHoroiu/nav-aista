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
  // First priority: Check for label with 'for' attribute
  if (element.id) {
    const labelWithFor = document.querySelector(`label[for="${element.id}"]`) as HTMLLabelElement;
    if (labelWithFor) {
      return labelWithFor;
    }
  }

  // Second priority: If element is within a label
  const parentLabel = findClosestParent(element, 'label', 3) as HTMLLabelElement;
  if (parentLabel) {
    return parentLabel;
  }

  // Third priority: Look for preceding text nodes, div, span, or p elements
  // that might be acting as labels (common in many UI frameworks)
  const previousSibling = element.previousElementSibling;
  if (previousSibling) {
    if (previousSibling.tagName === 'LABEL') {
      return previousSibling as HTMLLabelElement;
    }
    if (['SPAN', 'DIV', 'P', 'STRONG', 'B'].includes(previousSibling.tagName)) {
      // Create a virtual label to return the text content
      const virtualLabel = document.createElement('label');
      virtualLabel.textContent = previousSibling.textContent;
      return virtualLabel;
    }
  }

  // Fourth priority: Look for parent with label as first child
  const parent = element.parentElement;
  if (parent) {
    // First child is a label
    if (parent.firstElementChild && parent.firstElementChild.tagName === 'LABEL') {
      return parent.firstElementChild as HTMLLabelElement;
    }

    // First child is text wrapper (heading, paragraph, div, etc.)
    if (
      parent.firstElementChild &&
      ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'SPAN'].includes(
        parent.firstElementChild.tagName
      ) &&
      parent.firstElementChild !== element
    ) {
      // Create a virtual label with the text content
      const virtualLabel = document.createElement('label');
      virtualLabel.textContent = parent.firstElementChild.textContent;
      return virtualLabel;
    }

    // Check for text node before the element
    for (let i = 0; i < parent.childNodes.length; i++) {
      const node = parent.childNodes[i];
      if (node === element) break;

      if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
        // Create a virtual label with the text content
        const virtualLabel = document.createElement('label');
        virtualLabel.textContent = node.textContent.trim();
        return virtualLabel;
      }
    }
  }

  // Fifth priority: Try other heuristics
  return findNearestLabel(element);
}

/**
 * Find the nearest label element based on DOM proximity
 * @param element The form element to find a label for
 * @returns The nearest label element or null if not found
 */
export function findNearestLabel(element: Element): HTMLLabelElement | null {
  // Check for a label within the same form group (common pattern in e-licitatie.ro)
  const formGroup = findClosestParent(element, '.form-group, .form-control, .input-group', 3);
  if (formGroup) {
    // Try to find an explicit label
    const explicitLabel = formGroup.querySelector('label');
    if (explicitLabel) {
      return explicitLabel as HTMLLabelElement;
    }

    // Look for elements that might be acting as labels
    const possibleLabel = formGroup.querySelector('span, div, p, h1, h2, h3, h4, h5, h6');
    if (possibleLabel && possibleLabel !== element) {
      // Create a virtual label
      const virtualLabel = document.createElement('label');
      virtualLabel.textContent = possibleLabel.textContent;
      return virtualLabel;
    }
  }

  // Check nearby elements with label-like classes
  const labelWithClass = findClosestParent(element, '.label, .control-label, .form-label', 3);
  if (labelWithClass) {
    const virtualLabel = document.createElement('label');
    virtualLabel.textContent = labelWithClass.textContent;
    return virtualLabel;
  }

  // Try aria-label and aria-labelledby attributes
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    const virtualLabel = document.createElement('label');
    virtualLabel.textContent = ariaLabel;
    return virtualLabel;
  }

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) {
      const virtualLabel = document.createElement('label');
      virtualLabel.textContent = labelElement.textContent;
      return virtualLabel;
    }
  }

  // Last resort: check for a preceding heading or paragraph
  let current = element.previousElementSibling;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV'].includes(current.tagName)) {
      const virtualLabel = document.createElement('label');
      virtualLabel.textContent = current.textContent;
      return virtualLabel;
    }
    current = current.previousElementSibling;
  }

  // If still nothing found, check for placeholder as label
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) {
      const virtualLabel = document.createElement('label');
      virtualLabel.textContent = placeholder;
      return virtualLabel;
    }
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
