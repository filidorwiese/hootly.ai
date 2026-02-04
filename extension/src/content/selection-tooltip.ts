/**
 * Lightweight selection tooltip that runs on all pages.
 * Shows a hint when user selects text, before main extension is injected.
 */

const TOOLTIP_ID = 'hootly-selection-tooltip';
const STYLE_ID = 'hootly-selection-tooltip-style';

interface TooltipState {
  enabled: boolean;
  shortcut: string;
  visible: boolean;
}

const state: TooltipState = {
  enabled: true,
  shortcut: 'Alt+C',
  visible: false,
};

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${TOOLTIP_ID} {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 10px 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      z-index: 2147483646;
      animation: hootly-slideIn 0.2s ease-out;
      transition: all 0.2s ease;
    }
    #${TOOLTIP_ID}:hover {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      transform: translateY(-2px);
    }
    #${TOOLTIP_ID} img {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    #${TOOLTIP_ID} strong {
      font-weight: 600;
      color: #4CAF50;
    }
    @keyframes hootly-slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}

function createTooltip(): HTMLElement {
  let tooltip = document.getElementById(TOOLTIP_ID);
  if (tooltip) return tooltip;

  injectStyles();

  tooltip = document.createElement('div');
  tooltip.id = TOOLTIP_ID;
  tooltip.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/icon-48.png')}" alt="">
    <span>Press <strong>${state.shortcut}</strong> to chat with selection</span>
  `;
  tooltip.style.display = 'none';

  tooltip.addEventListener('click', () => {
    hideTooltip();
    // Trigger main extension injection via background
    chrome.runtime.sendMessage({ type: 'toggleDialogFromTooltip' });
  });

  document.body.appendChild(tooltip);
  return tooltip;
}

function showTooltip(): void {
  if (!state.enabled || state.visible) return;

  const tooltip = createTooltip();
  // Update shortcut text in case it changed
  const span = tooltip.querySelector('span');
  if (span) {
    span.innerHTML = `Press <strong>${state.shortcut}</strong> to chat with selection`;
  }
  tooltip.style.display = 'flex';
  state.visible = true;
}

function hideTooltip(): void {
  if (!state.visible) return;

  const tooltip = document.getElementById(TOOLTIP_ID);
  if (tooltip) {
    tooltip.style.display = 'none';
  }
  state.visible = false;
}

function handleSelectionChange(): void {
  // Don't show tooltip if main extension already injected
  if (document.getElementById('hootly-frame')) {
    hideTooltip();
    return;
  }

  const selection = window.getSelection()?.toString().trim() || '';
  if (selection.length > 0) {
    showTooltip();
  } else {
    hideTooltip();
  }
}

const STORAGE_KEY = 'hootly_settings';

async function loadSettings(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const settings = result[STORAGE_KEY];
    if (settings) {
      state.enabled = settings.showSelectionTooltip !== false;
      state.shortcut = settings.shortcut || 'Alt+C';
    }
  } catch {
    // Use defaults on error
  }
}

async function init(): Promise<void> {
  // Skip non-injectable pages
  if (!document.body) return;

  // Load settings BEFORE attaching listeners (prevents showing tooltip when disabled)
  await loadSettings();

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]?.newValue) {
      const settings = changes[STORAGE_KEY].newValue;
      state.enabled = settings.showSelectionTooltip !== false;
      state.shortcut = settings.shortcut || 'Alt+C';
      // Hide if disabled
      if (!state.enabled) {
        hideTooltip();
      }
    }
  });

  // Use debounced selection change handler
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  document.addEventListener('selectionchange', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handleSelectionChange, 150);
  });
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
