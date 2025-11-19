import type { PageContext } from './types';

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
  let text = document.body.innerText;

  if (!options.includeScripts) {
    // Remove script tags content
    const scripts = document.querySelectorAll('script');
    scripts.forEach((script) => {
      text = text.replace(script.innerText, '');
    });
  }

  if (!options.includeStyles) {
    // Remove style tags content
    const styles = document.querySelectorAll('style');
    styles.forEach((style) => {
      text = text.replace(style.innerText, '');
    });
  }

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
  const selection = window.getSelection();
  return selection && selection.toString().trim() || null;
}

/**
 * Extract page metadata
 */
export function extractMetadata(): PageContext['metadata'] {
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
    url: window.location.href,
    title: document.title,
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
