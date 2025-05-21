/**
 * DOM Utilities
 *
 * This module exports a collection of DOM utilities for interacting with
 * the e-licitatie.ro website.
 */

// Re-export from selectors
export * from './selectors';

// Re-export from traverse
export * from './traverse';

/**
 * DOM utility functions for common operations
 */

/**
 * Extract text content from an element, trimming whitespace
 * @param element The element to extract text from
 * @returns The trimmed text content or empty string if not available
 */
export function getElementText(element: Element | null): string {
  if (!element) return '';
  return (element.textContent || '').trim();
}

/**
 * Get the value of an input, select, or textarea element
 * @param element The form element to get the value from
 * @returns The element's value
 */
export function getInputValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): string {
  return element.value;
}

/**
 * Set the value of an input, select, or textarea element
 * @param element The form element to set the value on
 * @param value The value to set
 */
export function setInputValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string
): void {
  element.value = value;

  // Dispatch events to trigger any listeners on the page
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Check if an element is visible on the page
 * @param element The element to check
 * @returns True if the element is visible
 */
export function isElementVisible(element: Element | null): boolean {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Find and click a button by its text content
 * @param buttonText The text content of the button to find
 * @param scope The element to search within (defaults to document)
 * @returns True if a button was found and clicked
 */
export function clickButtonByText(
  buttonText: string,
  scope: Element | Document = document
): boolean {
  const buttonElements = Array.from(
    scope.querySelectorAll('button, input[type="button"], input[type="submit"]')
  );

  for (const button of buttonElements) {
    const text = getElementText(button);
    if (text.toLowerCase().includes(buttonText.toLowerCase())) {
      (button as HTMLElement).click();
      return true;
    }
  }

  return false;
}

/**
 * Find an element by its label text
 * @param labelText The text content of the label to find
 * @param scope The element to search within (defaults to document)
 * @returns The associated input element or null if not found
 */
export function findInputByLabelText(
  labelText: string,
  scope: Element | Document = document
): Element | null {
  // First try to find labels containing the text
  const labels = Array.from(scope.querySelectorAll('label')).filter(label =>
    getElementText(label).toLowerCase().includes(labelText.toLowerCase())
  );

  for (const label of labels) {
    // If the label has a 'for' attribute, find the corresponding input
    const forAttr = label.getAttribute('for');
    if (forAttr) {
      const input = document.getElementById(forAttr);
      if (input) {
        return input;
      }
    }

    // Otherwise, look for input elements inside the label
    const input = label.querySelector('input, select, textarea');
    if (input) {
      return input;
    }
  }

  // If no input found via label, try looking for adjacent inputs
  for (const label of labels) {
    // Check for inputs after the label
    let sibling = label.nextElementSibling;
    while (sibling && !['INPUT', 'SELECT', 'TEXTAREA'].includes(sibling.tagName)) {
      sibling = sibling.nextElementSibling;
    }

    if (sibling && ['INPUT', 'SELECT', 'TEXTAREA'].includes(sibling.tagName)) {
      return sibling;
    }

    // Check for form-group pattern (label followed by input in same container)
    const formGroup = label.closest('.form-group');
    if (formGroup) {
      const input = formGroup.querySelector('input, select, textarea');
      if (input && input !== label.querySelector('input, select, textarea')) {
        return input;
      }
    }
  }

  return null;
}

/**
 * Extract table data into an array of objects
 * @param table The table element to extract data from
 * @returns An array of objects, each representing a row with column headers as keys
 */
export function extractTableData(table: HTMLTableElement): Record<string, string>[] {
  const rows = Array.from(table.querySelectorAll('tr'));
  const result: Record<string, string>[] = [];

  // First row is assumed to be the header
  const headerRow = rows[0];
  if (!headerRow) return result;

  const headers = Array.from(headerRow.querySelectorAll('th')).map(th => getElementText(th));

  // Process each data row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = Array.from(row.querySelectorAll('td'));
    const rowData: Record<string, string> = {};

    // Map each cell to its corresponding header
    for (let j = 0; j < Math.min(headers.length, cells.length); j++) {
      rowData[headers[j]] = getElementText(cells[j]);
    }

    result.push(rowData);
  }

  return result;
}

/**
 * Safely parse a date from a string
 * @param dateString The date string to parse
 * @returns A Date object or null if parsing failed
 */
export function parseDate(dateString: string): Date | null {
  try {
    // Try to parse the date string
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Format a price from string to a standardized format
 * @param priceString The price string to format
 * @returns A normalized price number or null if parsing failed
 */
export function formatPrice(priceString: string): number | null {
  try {
    // Remove currency symbols, spaces, and commas
    const normalizedString = priceString
      .replace(/[^\d.,]/g, '') // Remove anything that's not a digit, dot, or comma
      .replace(/,/g, '.'); // Replace commas with dots

    const price = parseFloat(normalizedString);

    if (isNaN(price)) {
      return null;
    }

    return price;
  } catch (error) {
    console.error('Error formatting price:', error);
    return null;
  }
}

/**
 * Normalize text by removing extra whitespace and converting to lowercase
 * @param text The text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim() // Remove leading/trailing whitespace
    .toLowerCase(); // Convert to lowercase
}

/**
 * Determine if two text strings are similar (useful for fuzzy matching)
 * @param text1 The first text string
 * @param text2 The second text string
 * @returns True if the strings are similar
 */
export function areTextsSimilar(text1: string, text2: string): boolean {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);

  return normalized1.includes(normalized2) || normalized2.includes(normalized1);
}
