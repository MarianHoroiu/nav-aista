/**
 * DOM Selector Strategies
 *
 * This module provides flexible CSS selector strategies that can adapt
 * to varying attribute values on e-licitatie.ro website.
 */

/**
 * Selector attribute match type
 */
export enum AttributeMatchType {
  EXACT = 'exact', // Exact match of attribute value
  CONTAINS = 'contains', // Attribute value contains the specified string
  STARTS_WITH = 'starts', // Attribute value starts with the specified string
  ENDS_WITH = 'ends', // Attribute value ends with the specified string
  REGEX = 'regex', // Attribute value matches the specified regex pattern
}

/**
 * Selector configuration for finding elements
 */
export interface SelectorConfig {
  tag?: string; // Tag name (e.g., 'div', 'select')
  id?: string; // Element ID
  classNames?: string[]; // CSS class names
  attributes?: AttributeSelector[]; // Attribute selectors
  text?: string; // Text content to match
  textMatchType?: AttributeMatchType; // How to match text content
  parent?: string; // Parent selector
  child?: string; // Child selector
  nth?: number; // Select nth matching element
}

/**
 * Configuration for attribute-based selection
 */
export interface AttributeSelector {
  name: string; // Attribute name
  value: string; // Attribute value to match
  matchType: AttributeMatchType; // How to match the attribute
  caseSensitive?: boolean; // Whether matching is case-sensitive
}

/**
 * Build a CSS selector string from a SelectorConfig object
 * @param config The selector configuration
 * @returns A CSS selector string
 */
export function buildSelector(config: SelectorConfig): string {
  let selector = '';

  // Add tag if specified
  if (config.tag) {
    selector += config.tag;
  }

  // Add ID if specified
  if (config.id) {
    selector += `#${config.id}`;
  }

  // Add classes if specified
  if (config.classNames && config.classNames.length > 0) {
    config.classNames.forEach(className => {
      selector += `.${className.trim()}`;
    });
  }

  // Add attributes if specified
  if (config.attributes && config.attributes.length > 0) {
    config.attributes.forEach(attr => {
      selector += buildAttributeSelector(attr);
    });
  }

  // Add parent if specified
  if (config.parent) {
    selector = `${config.parent} > ${selector}`;
  }

  // Add child if specified
  if (config.child) {
    selector = `${selector} > ${config.child}`;
  }

  return selector;
}

/**
 * Build an attribute selector string
 * @param attr The attribute selector configuration
 * @returns An attribute selector string
 */
function buildAttributeSelector(attr: AttributeSelector): string {
  const { name, value, matchType, caseSensitive = false } = attr;
  const caseInsensitiveFlag = !caseSensitive ? 'i' : '';

  switch (matchType) {
    case AttributeMatchType.EXACT:
      return `[${name}="${value}"${caseInsensitiveFlag}]`;
    case AttributeMatchType.CONTAINS:
      return `[${name}*="${value}"${caseInsensitiveFlag}]`;
    case AttributeMatchType.STARTS_WITH:
      return `[${name}^="${value}"${caseInsensitiveFlag}]`;
    case AttributeMatchType.ENDS_WITH:
      return `[${name}$="${value}"${caseInsensitiveFlag}]`;
    default:
      return `[${name}="${value}"]`;
  }
}

/**
 * Common e-licitatie.ro selectors
 */
export const ELicitatieSelectors = {
  // Common form selectors
  FORM_CONTAINER: {
    tag: 'div',
    classNames: ['container-fluid', 'container-form'],
  },
  FORM_GROUP: {
    tag: 'div',
    classNames: ['form-group'],
  },
  DROPDOWN: {
    tag: 'select',
    attributes: [
      {
        name: 'class',
        value: 'form-control',
        matchType: AttributeMatchType.CONTAINS,
      },
    ],
  },
  LABEL: {
    tag: 'label',
    attributes: [
      {
        name: 'class',
        value: 'control-label',
        matchType: AttributeMatchType.CONTAINS,
        caseSensitive: false,
      },
    ],
  },
  SUBMIT_BUTTON: {
    tag: 'button',
    attributes: [
      {
        name: 'type',
        value: 'submit',
        matchType: AttributeMatchType.EXACT,
      },
    ],
  },

  // Auction-specific selectors
  AUCTION_LISTING: {
    tag: 'div',
    classNames: ['list-group-item'],
  },
  AUCTION_TITLE: {
    tag: 'a',
    attributes: [
      {
        name: 'class',
        value: 'list-group-item-heading',
        matchType: AttributeMatchType.CONTAINS,
      },
    ],
  },
  AUCTION_DETAILS: {
    tag: 'div',
    classNames: ['list-group-item-text'],
  },

  // Document-specific selectors
  DOCUMENT_LINK: {
    tag: 'a',
    attributes: [
      {
        name: 'href',
        value: '.pdf',
        matchType: AttributeMatchType.ENDS_WITH,
        caseSensitive: false,
      },
    ],
  },

  // Pagination selectors
  PAGINATION: {
    tag: 'ul',
    classNames: ['pagination'],
  },
};

/**
 * Creates a selector specifically for finding an element by text content
 * @param tag The tag name of the element
 * @param text The text content to match
 * @param matchType How to match the text
 * @returns A SelectorConfig object
 */
export function createTextSelector(
  tag: string,
  text: string,
  matchType: AttributeMatchType = AttributeMatchType.CONTAINS
): SelectorConfig {
  return {
    tag,
    text,
    textMatchType: matchType,
  };
}

/**
 * Find elements using a SelectorConfig with text matching
 * @param config The selector configuration
 * @param scope The element to search within (defaults to document)
 * @returns An array of matching elements
 */
export function findElementsByText(
  config: SelectorConfig,
  scope: Element | Document = document
): Element[] {
  const { text, textMatchType = AttributeMatchType.CONTAINS } = config;

  // First, select all elements matching the base criteria (tag, id, classes, attributes)
  const baseSelector = buildSelector({
    ...config,
    text: undefined,
    textMatchType: undefined,
  });

  const elements = Array.from(scope.querySelectorAll(baseSelector));

  // If no text matching is required, return all elements
  if (!text) {
    return elements;
  }

  // Filter elements by text content
  return elements.filter(element => {
    const elementText = element.textContent || '';

    switch (textMatchType) {
      case AttributeMatchType.EXACT:
        return elementText === text;
      case AttributeMatchType.CONTAINS:
        return elementText.includes(text);
      case AttributeMatchType.STARTS_WITH:
        return elementText.startsWith(text);
      case AttributeMatchType.ENDS_WITH:
        return elementText.endsWith(text);
      case AttributeMatchType.REGEX:
        try {
          const regex = new RegExp(text);
          return regex.test(elementText);
        } catch (error) {
          console.error('Invalid regex pattern:', error);
          return false;
        }
      default:
        return false;
    }
  });
}
