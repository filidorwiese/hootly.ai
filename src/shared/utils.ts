import type { PageContext } from './types';

// Type for page info exposed from parent window (iframe mode)
interface PageInfo {
  url: string;
  title: string;
  getSelection: () => string;
  getPageText: () => string;
}

// Get page info - works in both iframe and direct mode
function getPageInfo(): PageInfo | null {
  return (window as any).__FIREOWL_PAGE_INFO__ || null;
}

/**
 * Estimate token count from character count
 * Conservative estimate: 1 token ≈ 3.5 characters
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/**
 * Extract clean text from page, respecting settings
 */
export function extractPageText(options: {
  includeScripts: boolean;
  includeStyles: boolean;
  maxLength: number;
}): string {
  const pageInfo = getPageInfo();
  let text = pageInfo ? pageInfo.getPageText() : (document.body?.innerText || '');

  // Truncate if needed
  if (text.length > options.maxLength) {
    text = text.substring(0, options.maxLength) + '\n\n[Content truncated due to length limit]';
  }

  return text.trim();
}

/**
 * Extract selected text from page
 */
export function extractSelection(): string | null {
  const pageInfo = getPageInfo();
  if (pageInfo) {
    const selection = pageInfo.getSelection();
    return selection && selection.trim() || null;
  }
  const selection = window.getSelection();
  return selection && selection.toString().trim() || null;
}

/**
 * Get page URL
 */
export function getPageUrl(): string {
  const pageInfo = getPageInfo();
  return pageInfo ? pageInfo.url : window.location.href;
}

/**
 * Get page title
 */
export function getPageTitle(): string {
  const pageInfo = getPageInfo();
  return pageInfo ? pageInfo.title : document.title;
}

/**
 * Extract page metadata
 */
export function extractMetadata(): PageContext['metadata'] {
  // In iframe mode, we don't have access to parent's meta tags
  const pageInfo = getPageInfo();
  if (pageInfo) {
    return { description: undefined, keywords: undefined };
  }

  const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');

  return {
    description: description || undefined,
    keywords: keywords || undefined,
  };
}

/**
 * Build full page context
 */
export function buildPageContext(options: {
  includeScripts: boolean;
  includeStyles: boolean;
  includeAltText: boolean;
  maxLength: number;
}): PageContext {
  const selection = extractSelection();

  return {
    url: getPageUrl(),
    title: getPageTitle(),
    selection: selection || undefined,
    fullPage: selection ? undefined : extractPageText(options),
    metadata: extractMetadata(),
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
