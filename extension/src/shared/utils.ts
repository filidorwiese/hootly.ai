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
      if (event.data?.type === 'hootly-page-info') {
        window.removeEventListener('message', handler);
        cachedPageInfo = event.data.payload;
        resolve(cachedPageInfo);
      }
    };
    window.addEventListener('message', handler);

    // Request info from parent
    window.parent.postMessage({ type: 'hootly-get-page-info' }, '*');

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
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
