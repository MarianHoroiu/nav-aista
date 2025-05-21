/**
 * Site Detection Module
 *
 * This module handles detection of e-licitatie.ro pages and determines
 * which content script functionality should be activated.
 */

/**
 * Page type enum for e-licitatie.ro website
 */
export enum PageType {
  UNKNOWN = 'unknown',
  HOME = 'home',
  SEARCH = 'search',
  AUCTION_LIST = 'auction_list',
  AUCTION_DETAIL = 'auction_detail',
  DOCUMENT_VIEW = 'document_view',
  LOGIN = 'login',
  UPLOAD = 'upload',
  SETTINGS = 'settings',
}

/**
 * Interface for page detection result
 */
export interface PageDetectionResult {
  type: PageType;
  url: string;
  title: string;
  path: string;
  auctionId?: string;
  documentId?: string;
}

/**
 * Regular expressions for detecting different page types
 */
const PAGE_PATTERNS = {
  HOME: /^\/(\?.*)?$/,
  SEARCH: /\/cautare-proceduri/,
  AUCTION_LIST: /\/lista-proceduri-achizitii/,
  AUCTION_DETAIL: /\/procedura-([a-zA-Z0-9-]+)/,
  DOCUMENT_VIEW: /\/document-([a-zA-Z0-9-]+)/,
  LOGIN: /\/login/,
  UPLOAD: /\/upload/,
  SETTINGS: /\/setari/,
};

/**
 * Detects the current page type based on URL and DOM content
 * @returns The detected page type and related information
 */
export function detectPageType(): PageDetectionResult {
  const url = window.location.href;
  const path = window.location.pathname;
  const title = document.title;

  // Default result
  let result: PageDetectionResult = {
    type: PageType.UNKNOWN,
    url,
    title,
    path,
  };

  // Try to match URL patterns
  if (PAGE_PATTERNS.HOME.test(path)) {
    result.type = PageType.HOME;
  } else if (PAGE_PATTERNS.SEARCH.test(path)) {
    result.type = PageType.SEARCH;
  } else if (PAGE_PATTERNS.AUCTION_LIST.test(path)) {
    result.type = PageType.AUCTION_LIST;
  } else if (PAGE_PATTERNS.AUCTION_DETAIL.test(path)) {
    result.type = PageType.AUCTION_DETAIL;
    // Extract auction ID
    const match = path.match(PAGE_PATTERNS.AUCTION_DETAIL);
    if (match && match[1]) {
      result.auctionId = match[1];
    }
  } else if (PAGE_PATTERNS.DOCUMENT_VIEW.test(path)) {
    result.type = PageType.DOCUMENT_VIEW;
    // Extract document ID
    const match = path.match(PAGE_PATTERNS.DOCUMENT_VIEW);
    if (match && match[1]) {
      result.documentId = match[1];
    }
  } else if (PAGE_PATTERNS.LOGIN.test(path)) {
    result.type = PageType.LOGIN;
  } else if (PAGE_PATTERNS.UPLOAD.test(path)) {
    result.type = PageType.UPLOAD;
  } else if (PAGE_PATTERNS.SETTINGS.test(path)) {
    result.type = PageType.SETTINGS;
  }

  // If still unknown, try to use DOM content to determine page type
  if (result.type === PageType.UNKNOWN) {
    result = detectPageTypeFromDOM(result);
  }

  return result;
}

/**
 * Fallback detection method using DOM content when URL patterns don't match
 * @param result The initial detection result
 * @returns Updated detection result
 */
function detectPageTypeFromDOM(result: PageDetectionResult): PageDetectionResult {
  // Check for login page
  if (
    document.querySelector('form input[type="password"]') &&
    document.querySelector('button[type="submit"]')
  ) {
    return { ...result, type: PageType.LOGIN };
  }

  // Check for auction list page
  if (document.querySelector('.list-group-item')) {
    return { ...result, type: PageType.AUCTION_LIST };
  }

  // Check for auction detail page
  if (document.querySelector('.auction-details, .procedura-detalii')) {
    return { ...result, type: PageType.AUCTION_DETAIL };
  }

  // Check for document view page
  if (document.querySelector('.document-viewer, iframe[src*=".pdf"]')) {
    return { ...result, type: PageType.DOCUMENT_VIEW };
  }

  // Check for search page
  if (
    document.querySelector('form input[type="search"]') ||
    document.querySelector('.search-results')
  ) {
    return { ...result, type: PageType.SEARCH };
  }

  return result;
}

/**
 * Checks if the current site is e-licitatie.ro
 * @returns True if the current site is e-licitatie.ro
 */
export function isELicitatieSite(): boolean {
  const hostname = window.location.hostname;
  return hostname.includes('e-licitatie.ro');
}

/**
 * Checks if the current page is a specific type
 * @param type The page type to check for
 * @returns True if the current page is the specified type
 */
export function isPageType(type: PageType): boolean {
  return detectPageType().type === type;
}

/**
 * Get the auction ID from the current page
 * @returns The auction ID or undefined if not on an auction page
 */
export function getAuctionId(): string | undefined {
  return detectPageType().auctionId;
}

/**
 * Get the document ID from the current page
 * @returns The document ID or undefined if not on a document page
 */
export function getDocumentId(): string | undefined {
  return detectPageType().documentId;
}

/**
 * Determines which content script features should be activated
 * @returns An object indicating which features should be activated
 */
export function determineActiveFeatures(): Record<string, boolean> {
  const pageType = detectPageType().type;

  return {
    auctionScraping: pageType === PageType.AUCTION_LIST || pageType === PageType.AUCTION_DETAIL,
    documentDownload: pageType === PageType.DOCUMENT_VIEW || pageType === PageType.AUCTION_DETAIL,
    formFilling:
      pageType === PageType.SEARCH || pageType === PageType.LOGIN || pageType === PageType.UPLOAD,
    notifications: pageType !== PageType.UNKNOWN,
    uiEnhancement: pageType !== PageType.UNKNOWN,
  };
}

/**
 * Determine if the content script should activate on the current page
 * @returns True if the content script should activate
 */
export function shouldActivate(): boolean {
  // Skip activation if not on e-licitatie.ro
  if (!isELicitatieSite()) {
    return false;
  }

  // Skip activation for unknown page types
  if (detectPageType().type === PageType.UNKNOWN) {
    return false;
  }

  return true;
}

/**
 * Report the current page information to the background script
 */
export function reportPageInformation(): void {
  const pageInfo = detectPageType();

  // Send the information to the background script
  chrome.runtime.sendMessage({
    action: 'pageDetected',
    pageInfo,
  });
}
