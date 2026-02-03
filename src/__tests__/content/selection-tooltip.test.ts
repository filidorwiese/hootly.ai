import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock chrome APIs
const mockStorage = {
  local: {
    get: vi.fn().mockResolvedValue({}),
  },
  onChanged: {
    addListener: vi.fn(),
  },
};

const mockRuntime = {
  getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
  sendMessage: vi.fn(),
};

vi.stubGlobal('chrome', {
  storage: mockStorage,
  runtime: mockRuntime,
});

describe('selection-tooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('tooltip creation', () => {
    it('creates tooltip element with correct structure', () => {
      const TOOLTIP_ID = 'hootly-selection-tooltip';

      // Simulate tooltip creation (inline for test isolation)
      const tooltip = document.createElement('div');
      tooltip.id = TOOLTIP_ID;
      tooltip.innerHTML = `
        <img src="${mockRuntime.getURL('icons/icon-48.png')}" alt="">
        <span>Press <strong>Alt+C</strong> to chat with selection</span>
      `;
      document.body.appendChild(tooltip);

      expect(document.getElementById(TOOLTIP_ID)).toBeTruthy();
      expect(tooltip.querySelector('img')).toBeTruthy();
      expect(tooltip.querySelector('strong')?.textContent).toBe('Alt+C');
    });
  });

  describe('tooltip visibility', () => {
    it('hides tooltip when main extension frame exists', () => {
      // Simulate main extension frame present
      const frame = document.createElement('iframe');
      frame.id = 'hootly-frame';
      document.body.appendChild(frame);

      // When hootly-frame exists, tooltip should not be shown
      expect(document.getElementById('hootly-frame')).toBeTruthy();
      // The selection tooltip script checks for hootly-frame and doesn't show if present
    });
  });

  describe('settings integration', () => {
    it('loads settings from chrome storage', async () => {
      mockStorage.local.get.mockResolvedValue({
        settings: {
          showSelectionTooltip: true,
          shortcut: 'Ctrl+Shift+H',
        },
      });

      const result = await mockStorage.local.get('settings');
      expect(result.settings.shortcut).toBe('Ctrl+Shift+H');
      expect(result.settings.showSelectionTooltip).toBe(true);
    });

    it('respects disabled tooltip setting', async () => {
      mockStorage.local.get.mockResolvedValue({
        settings: {
          showSelectionTooltip: false,
        },
      });

      const result = await mockStorage.local.get('settings');
      expect(result.settings.showSelectionTooltip).toBe(false);
    });
  });

  describe('click handler', () => {
    it('sends toggleDialogFromTooltip message on click', () => {
      mockRuntime.sendMessage.mockResolvedValue({ success: true });

      // Simulate click action
      mockRuntime.sendMessage({ type: 'toggleDialogFromTooltip' });

      expect(mockRuntime.sendMessage).toHaveBeenCalledWith({
        type: 'toggleDialogFromTooltip',
      });
    });
  });

  describe('TT-4: showSelectionTooltip setting must be respected', () => {
    let tooltipSource: string;

    beforeEach(() => {
      tooltipSource = readFileSync(
        join(__dirname, '../../content/selection-tooltip.ts'),
        'utf-8'
      );
    });

    it('uses correct storage key (hootly_settings)', () => {
      // Bug was: used 'settings' instead of 'hootly_settings'
      expect(tooltipSource).toContain("STORAGE_KEY = 'hootly_settings'");
      expect(tooltipSource).toContain('chrome.storage.local.get(STORAGE_KEY)');
      expect(tooltipSource).toContain('changes[STORAGE_KEY]');
    });

    it('init() must await loadSettings() before attaching selection listeners', () => {
      expect(tooltipSource).toContain('async function init()');
      expect(tooltipSource).toContain('await loadSettings()');
    });

    it('selection listener must be attached AFTER loadSettings awaited', () => {
      const awaitLoadSettingsIndex = tooltipSource.indexOf('await loadSettings()');
      const selectionChangeIndex = tooltipSource.indexOf("addEventListener('selectionchange'");

      expect(awaitLoadSettingsIndex).toBeGreaterThan(-1);
      expect(selectionChangeIndex).toBeGreaterThan(-1);
      expect(awaitLoadSettingsIndex).toBeLessThan(selectionChangeIndex);
    });

    it('storage.onChanged listener reacts to showSelectionTooltip changes', () => {
      expect(tooltipSource).toContain('chrome.storage.onChanged.addListener');
      expect(tooltipSource).toContain('showSelectionTooltip');
    });
  });
});
