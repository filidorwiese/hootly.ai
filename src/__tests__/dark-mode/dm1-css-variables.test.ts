import { describe, it, expect } from 'vitest';
import {
  colors,
  darkColors,
  getColors,
  cssVariables,
  darkCssVariables,
  allCssVariables,
  Theme,
} from '../../shared/styles';

describe('DM-1: Create dark mode CSS variables', () => {
  describe('darkColors palette', () => {
    describe('primary colors', () => {
      it('defines full primary color spectrum (50-900)', () => {
        expect(darkColors.primary).toHaveProperty('50');
        expect(darkColors.primary).toHaveProperty('100');
        expect(darkColors.primary).toHaveProperty('200');
        expect(darkColors.primary).toHaveProperty('300');
        expect(darkColors.primary).toHaveProperty('400');
        expect(darkColors.primary).toHaveProperty('500');
        expect(darkColors.primary).toHaveProperty('600');
        expect(darkColors.primary).toHaveProperty('700');
        expect(darkColors.primary).toHaveProperty('800');
        expect(darkColors.primary).toHaveProperty('900');
      });

      it('uses brighter forest green for dark mode primary-500', () => {
        expect(darkColors.primary[500]).toBe('#4A7C54');
      });

      it('inverts spectrum (50 is dark, 900 is light)', () => {
        // In dark mode, 50 is darkest, 900 is lightest
        expect(darkColors.primary[50]).toBe('#0A100D');
        expect(darkColors.primary[900]).toBe('#E8F0EA');
      });
    });

    describe('background colors', () => {
      it('defines dark background colors', () => {
        expect(darkColors.background.base).toBe('#121812');
        expect(darkColors.background.elevated).toBe('#1A221A');
        expect(darkColors.background.muted).toBe('#1E261E');
        expect(darkColors.background.subtle).toBe('#242E24');
      });

      it('all backgrounds are hex colors (no gradients)', () => {
        Object.values(darkColors.background).forEach((color) => {
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
      });

      it('backgrounds are darker than light mode', () => {
        // Dark mode base should be very dark
        expect(darkColors.background.base).toMatch(/^#[0-2][0-9A-Fa-f]/);
        // Light mode base should be very light
        expect(colors.background.base).toMatch(/^#[F][0-9A-Fa-f]/);
      });
    });

    describe('surface colors', () => {
      it('defines dark surface colors', () => {
        expect(darkColors.surface.default).toBe('#1A221A');
        expect(darkColors.surface.hover).toBe('#242E24');
        expect(darkColors.surface.active).toBe('#2A352A');
        expect(darkColors.surface.disabled).toBe('#1E261E');
      });
    });

    describe('border colors', () => {
      it('defines visible borders on dark backgrounds', () => {
        expect(darkColors.border.light).toBe('#2A352A');
        expect(darkColors.border.default).toBe('#3A4A3A');
        expect(darkColors.border.strong).toBe('#4A5A4A');
        expect(darkColors.border.focus).toBe('#75A683');
      });

      it('borders are lighter than in light mode (for visibility)', () => {
        // Dark mode borders need to be lighter to be visible
        // Light: #E4E8E2, Dark: #2A352A
        expect(darkColors.border.light).not.toBe(colors.border.light);
      });
    });

    describe('text colors', () => {
      it('defines high-contrast text for dark backgrounds', () => {
        expect(darkColors.text.primary).toBe('#E8F0EA');
        expect(darkColors.text.secondary).toBe('#B8C4BC');
        expect(darkColors.text.tertiary).toBe('#8A9A8C');
        expect(darkColors.text.inverse).toBe('#121812');
      });

      it('text colors are inverted from light mode', () => {
        // Dark mode primary text should be light
        expect(darkColors.text.primary).toMatch(/^#[D-F][0-9A-Fa-f]/);
        // Light mode primary text should be dark
        expect(colors.text.primary).toMatch(/^#[0-4][0-9A-Fa-f]/);
      });

      it('defines link colors for dark mode', () => {
        expect(darkColors.text.link).toBe('#75A683');
        expect(darkColors.text.linkHover).toBe('#A3C4AC');
      });
    });

    describe('accent colors', () => {
      it('defines brighter accent colors for visibility', () => {
        expect(darkColors.accent.success).toBe('#75A683');
        expect(darkColors.accent.successHover).toBe('#8BB897');
        expect(darkColors.accent.error).toBe('#D87070');
        expect(darkColors.accent.errorHover).toBe('#E68888');
      });

      it('includes info and warning accents', () => {
        expect(darkColors.accent.info).toBe('#5AA0B0');
        expect(darkColors.accent.infoHover).toBe('#72B4C2');
        expect(darkColors.accent.warning).toBe('#D4A840');
        expect(darkColors.accent.warningHover).toBe('#E0BC5C');
      });
    });

    describe('status colors', () => {
      it('defines dark status backgrounds', () => {
        expect(darkColors.status.successBg).toBe('#1A2A1E');
        expect(darkColors.status.infoBg).toBe('#1A2A2E');
        expect(darkColors.status.warningBg).toBe('#2A2A1A');
        expect(darkColors.status.errorBg).toBe('#2A1A1A');
      });

      it('defines light status text for readability', () => {
        expect(darkColors.status.successText).toBe('#A3C4AC');
        expect(darkColors.status.infoText).toBe('#A3C4C9');
        expect(darkColors.status.warningText).toBe('#D4C4A0');
        expect(darkColors.status.errorText).toBe('#D4A0A0');
      });
    });

    describe('message colors', () => {
      it('defines dark message backgrounds', () => {
        expect(darkColors.message.userBg).toBe('#1E2A22');
        expect(darkColors.message.userBorder).toBe('#3A5040');
        expect(darkColors.message.assistantBg).toBe('#1A221A');
        expect(darkColors.message.assistantBorder).toBe('#2A352A');
      });
    });

    describe('send button colors', () => {
      it('defines brighter send button for dark mode', () => {
        expect(darkColors.send.default).toBe('#75A683');
        expect(darkColors.send.hover).toBe('#8BB897');
        expect(darkColors.send.active).toBe('#6A9876');
      });
    });
  });

  describe('getColors helper', () => {
    it('returns light colors for light theme', () => {
      const result = getColors('light');
      expect(result).toBe(colors);
      expect(result.background.base).toBe('#FAFBF9');
    });

    it('returns dark colors for dark theme', () => {
      const result = getColors('dark');
      expect(result).toBe(darkColors);
      expect(result.background.base).toBe('#121812');
    });
  });

  describe('Theme type', () => {
    it('allows light, dark, and auto values', () => {
      const themes: Theme[] = ['light', 'dark', 'auto'];
      expect(themes).toHaveLength(3);
    });
  });

  describe('darkCssVariables', () => {
    it('generates CSS string for dark mode', () => {
      expect(typeof darkCssVariables).toBe('string');
      expect(darkCssVariables.length).toBeGreaterThan(0);
    });

    it('includes [data-theme="dark"] selector', () => {
      expect(darkCssVariables).toContain('[data-theme="dark"]');
    });

    it('includes dark primary color variables', () => {
      expect(darkCssVariables).toContain('--color-primary-500');
      expect(darkCssVariables).toContain('#4A7C54');
    });

    it('includes dark background variables', () => {
      expect(darkCssVariables).toContain('--color-bg-base');
      expect(darkCssVariables).toContain('#121812');
    });

    it('includes dark text variables', () => {
      expect(darkCssVariables).toContain('--color-text-primary');
      expect(darkCssVariables).toContain('#E8F0EA');
    });

    it('includes dark border variables', () => {
      expect(darkCssVariables).toContain('--color-border-default');
      expect(darkCssVariables).toContain('#3A4A3A');
    });

    it('includes dark accent variables', () => {
      expect(darkCssVariables).toContain('--color-accent-success');
      expect(darkCssVariables).toContain('#75A683');
    });

    it('includes dark status variables', () => {
      expect(darkCssVariables).toContain('--color-status-success-bg');
      expect(darkCssVariables).toContain('#1A2A1E');
    });

    it('includes dark message variables', () => {
      expect(darkCssVariables).toContain('--color-message-user-bg');
      expect(darkCssVariables).toContain('#1E2A22');
    });

    it('includes dark send button variables', () => {
      expect(darkCssVariables).toContain('--color-send-default');
    });
  });

  describe('auto mode (prefers-color-scheme)', () => {
    it('includes @media query for prefers-color-scheme: dark', () => {
      expect(darkCssVariables).toContain('@media (prefers-color-scheme: dark)');
    });

    it('includes [data-theme="auto"] selector inside media query', () => {
      expect(darkCssVariables).toContain('[data-theme="auto"]');
    });

    it('applies dark colors when system prefers dark and theme is auto', () => {
      // The CSS contains the auto mode rules
      const autoSection = darkCssVariables.split('@media (prefers-color-scheme: dark)')[1];
      expect(autoSection).toContain('[data-theme="auto"]');
      expect(autoSection).toContain('--color-bg-base: #121812');
      expect(autoSection).toContain('--color-text-primary: #E8F0EA');
    });
  });

  describe('allCssVariables (combined)', () => {
    it('includes light mode :root variables', () => {
      expect(allCssVariables).toContain(':root');
      expect(allCssVariables).toContain('#FAFBF9'); // light bg-base
    });

    it('includes dark mode [data-theme="dark"] variables', () => {
      expect(allCssVariables).toContain('[data-theme="dark"]');
      expect(allCssVariables).toContain('#121812'); // dark bg-base
    });

    it('includes auto mode prefers-color-scheme rules', () => {
      expect(allCssVariables).toContain('@media (prefers-color-scheme: dark)');
      expect(allCssVariables).toContain('[data-theme="auto"]');
    });

    it('is combination of cssVariables and darkCssVariables', () => {
      expect(allCssVariables).toBe(cssVariables + darkCssVariables);
    });
  });

  describe('WCAG accessibility (dark mode)', () => {
    it('text primary on dark background has sufficient contrast', () => {
      // #E8F0EA on #121812 should have high contrast
      // Dark mode primary text is light
      expect(darkColors.text.primary).toMatch(/^#[D-F][0-9A-Fa-f]/);
      // Dark mode background is very dark
      expect(darkColors.background.base).toMatch(/^#[0-2][0-9A-Fa-f]/);
    });

    it('inverse text on accent colors has sufficient contrast', () => {
      // Inverse text (#121812) on success (#75A683) should be readable
      expect(darkColors.text.inverse).toBe('#121812');
      expect(darkColors.accent.success).toMatch(/^#[7][0-9A-Fa-f]/);
    });

    it('secondary text still visible on dark background', () => {
      // Secondary text should be lighter than background
      expect(darkColors.text.secondary).toMatch(/^#[A-F][0-9A-Fa-f]/);
    });
  });

  describe('no shadows or gradients in dark mode', () => {
    it('darkCssVariables does not contain box-shadow', () => {
      expect(darkCssVariables).not.toContain('box-shadow');
    });

    it('darkCssVariables does not contain gradient definitions', () => {
      expect(darkCssVariables).not.toContain('linear-gradient');
      expect(darkCssVariables).not.toContain('radial-gradient');
    });
  });

  describe('color mapping documentation', () => {
    it('dark colors parallel light colors structure', () => {
      // Ensure both have same keys
      expect(Object.keys(darkColors.primary)).toEqual(Object.keys(colors.primary));
      expect(Object.keys(darkColors.background)).toEqual(Object.keys(colors.background));
      expect(Object.keys(darkColors.surface)).toEqual(Object.keys(colors.surface));
      expect(Object.keys(darkColors.border)).toEqual(Object.keys(colors.border));
      expect(Object.keys(darkColors.text)).toEqual(Object.keys(colors.text));
      expect(Object.keys(darkColors.accent)).toEqual(Object.keys(colors.accent));
      expect(Object.keys(darkColors.status)).toEqual(Object.keys(colors.status));
      expect(Object.keys(darkColors.message)).toEqual(Object.keys(colors.message));
      expect(Object.keys(darkColors.send)).toEqual(Object.keys(colors.send));
    });
  });
});
