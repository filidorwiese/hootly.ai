/**
 * Shared TabHeader component for settings, personas, and history pages.
 * Provides consistent navigation with Hootly logo and tab buttons.
 */

export type TabId = 'settings' | 'personas' | 'history';

export interface TabHeaderOptions {
  activeTab: TabId;
  containerId?: string;
}

/**
 * Get the URL for the extension icon.png
 */
function getLogoUrl(): string {
  return chrome.runtime.getURL('icons/icon.png');
}

// Tab icons
const SETTINGS_ICON = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="currentColor"/>
  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" fill="currentColor" opacity="0.7"/>
</svg>
`;

const PERSONAS_ICON = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.7"/>
  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor"/>
</svg>
`;

const HISTORY_ICON = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
  <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

/**
 * Get tab header CSS styles
 */
export function getTabHeaderStyles(): string {
  return `
    .tab-header {
      background: var(--color-surface-default, #FFFFFF);
      border-bottom: 1px solid var(--color-border-light, #E4E8E2);
      margin-bottom: var(--spacing-6, 24px);
    }

    .tab-header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1024px;
      width: 100%;
      margin: 0 auto;
      padding: var(--spacing-4, 16px) var(--spacing-5, 20px);
    }

    .tab-header-brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-3, 12px);
    }

    .tab-header-logo {
      display: flex;
      align-items: center;
    }

    .tab-header-logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
      display: block;
    }

    .tab-header-title {
      font-size: var(--font-size-xl, 16px);
      font-weight: 700;
      color: var(--color-text-primary, #2D3A30);
      margin: 0;
    }

    .tab-header-nav {
      display: flex;
      gap: var(--spacing-2, 8px);
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 8px);
      padding: var(--spacing-2, 8px) var(--spacing-4, 16px);
      border: 1px solid transparent;
      border-radius: var(--radius-md, 6px);
      background: transparent;
      color: var(--color-text-secondary, #6B7A6E);
      font-size: var(--font-size-base, 14px);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-default, 0.15s ease);
      font-family: 'Inter', sans-serif;
    }

    .tab-btn:hover {
      background: var(--color-surface-hover, #F5F7F4);
      color: var(--color-text-link, #3A5A40);
    }

    .tab-btn.active {
      background: var(--color-primary-50, #E8F0EA);
      color: var(--color-primary-500, #3A5A40);
      border-color: var(--color-primary-200, #A3C4AC);
    }

    .tab-btn svg {
      flex-shrink: 0;
    }
  `;
}

/**
 * Generate tab header HTML
 */
export function generateTabHeaderHTML(activeTab: TabId): string {
  const tabs: Array<{ id: TabId; label: string; icon: string; i18nKey: string }> = [
    { id: 'settings', label: 'Settings', icon: SETTINGS_ICON, i18nKey: 'tabs.settings' },
    { id: 'personas', label: 'Personas', icon: PERSONAS_ICON, i18nKey: 'tabs.personas' },
    { id: 'history', label: 'History', icon: HISTORY_ICON, i18nKey: 'tabs.history' },
  ];

  const tabButtons = tabs
    .map(
      (tab) => `
      <button class="tab-btn${tab.id === activeTab ? ' active' : ''}" data-tab="${tab.id}" data-i18n="${tab.i18nKey}">
        ${tab.icon}
        <span>${tab.label}</span>
      </button>
    `
    )
    .join('');

  return `
    <div class="tab-header">
      <div class="tab-header-inner">
        <div class="tab-header-brand">
          <div class="tab-header-logo"><img class="tab-header-logo-img" src="${getLogoUrl()}" alt="Hootly.ai logo" /></div>
          <h2 class="tab-header-title">Hootly.ai</h2>
        </div>
        <nav class="tab-header-nav">
          ${tabButtons}
        </nav>
      </div>
    </div>
  `;
}

/**
 * Get URL for a specific tab page
 */
export function getTabUrl(tabId: TabId): string {
  const urls: Record<TabId, string> = {
    settings: chrome.runtime.getURL('settings.html'),
    personas: chrome.runtime.getURL('personas.html'),
    history: chrome.runtime.getURL('history.html'),
  };
  return urls[tabId];
}

/**
 * Initialize tab header navigation handlers
 */
export function initTabHeaderNav(activeTab: TabId): void {
  const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const tabId = target.dataset.tab as TabId;
      if (tabId && tabId !== activeTab) {
        window.location.href = getTabUrl(tabId);
      }
    });
  });
}

/**
 * Inject tab header into page
 * Replaces existing header or inserts at start of body/container
 */
export function injectTabHeader(options: TabHeaderOptions): void {
  const { activeTab, containerId } = options;

  // Add styles if not already present
  if (!document.getElementById('tab-header-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'tab-header-styles';
    styleEl.textContent = getTabHeaderStyles();
    document.head.appendChild(styleEl);
  }

  // Generate HTML
  const headerHTML = generateTabHeaderHTML(activeTab);

  // Find container or use body
  const container = containerId ? document.getElementById(containerId) : document.body;
  if (!container) return;

  // Remove existing tab header if present
  const existingHeader = container.querySelector('.tab-header');
  if (existingHeader) {
    existingHeader.remove();
  }

  // Insert at start of container
  container.insertAdjacentHTML('afterbegin', headerHTML);

  // Initialize navigation
  initTabHeaderNav(activeTab);
}

/**
 * Create a standalone TabHeader element (for testing or custom placement)
 */
export function createTabHeaderElement(activeTab: TabId): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = generateTabHeaderHTML(activeTab);
  return wrapper.firstElementChild as HTMLElement;
}
