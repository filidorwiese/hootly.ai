import type { PageContext } from './types';

// Cached page info from parent
let cachedPageInfo: {
  url: string;
  title: string;
  selection: string;
  pageText: string;
} | null = null;

// Check if running in iframe
function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

// Request page info from parent window (returns promise)
export function requestPageInfo(): Promise<typeof cachedPageInfo> {
  return new Promise((resolve) => {
    if (!isInIframe()) {
      // Direct mode - get info from current window
      resolve({
        url: window.location.href,
        title: document.title,
        selection: window.getSelection()?.toString() || '',
        pageText: document.body?.innerText || '',
      });
      return;
    }

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'fireowl-page-info') {
        window.removeEventListener('message', handler);
        cachedPageInfo = event.data.payload;
        resolve(cachedPageInfo);
      }
    };
    window.addEventListener('message', handler);

    // Request info from parent
    window.parent.postMessage({ type: 'fireowl-get-page-info' }, '*');

    // Timeout fallback
    setTimeout(() => {
      window.removeEventListener('message', handler);
      if (!cachedPageInfo) {
        resolve(null);
      }
    }, 1000);
  });
}

// Get cached page info (sync) - call requestPageInfo first
function getPageInfo() {
  return cachedPageInfo;
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
  let text = pageInfo?.pageText || document.body?.innerText || '';

  // Truncate if needed
  if (text.length > options.maxLength) {
    text = text.substring(0, options.maxLength) + '\n\n[Content truncated due to length limit]';
  }

  return text.trim();
}

/**
 * Extract selected text from page (uses cached value)
 */
export function extractSelection(): string | null {
  const pageInfo = getPageInfo();
  if (pageInfo) {
    return pageInfo.selection?.trim() || null;
  }
  const selection = window.getSelection();
  return selection?.toString().trim() || null;
}

/**
 * Get page URL
 */
export function getPageUrl(): string {
  const pageInfo = getPageInfo();
  return pageInfo?.url || window.location.href;
}

/**
 * Get page title
 */
export function getPageTitle(): string {
  const pageInfo = getPageInfo();
  return pageInfo?.title || document.title;
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
