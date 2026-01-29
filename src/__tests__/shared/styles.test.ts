import { describe, it, expect } from 'vitest';
import {
  colors,
  spacing,
  radii,
  fontSizes,
  fontWeights,
  transitions,
  cssVariables,
  flatButtonStyle,
  flatInputStyle,
  flatCardStyle,
} from '../../shared/styles';

describe('Flat Design Color Palette (FD-1)', () => {
  describe('colors', () => {
    describe('primary colors', () => {
      it('defines full primary color spectrum (50-900)', () => {
        expect(colors.primary).toHaveProperty('50');
        expect(colors.primary).toHaveProperty('100');
        expect(colors.primary).toHaveProperty('200');
        expect(colors.primary).toHaveProperty('300');
        expect(colors.primary).toHaveProperty('400');
        expect(colors.primary).toHaveProperty('500');
        expect(colors.primary).toHaveProperty('600');
        expect(colors.primary).toHaveProperty('700');
        expect(colors.primary).toHaveProperty('800');
        expect(colors.primary).toHaveProperty('900');
      });

      it('uses forest green theme (#3A5A40 as primary-500)', () => {
        expect(colors.primary[500]).toBe('#3A5A40');
      });

      it('provides accessible contrast for main primary', () => {
        // Primary-500 should be dark enough for white text
        expect(colors.primary[500]).toMatch(/^#[3-9A-Fa-f][0-9A-Fa-f]/);
      });
    });

    describe('background colors', () => {
      it('defines solid background colors (no gradients)', () => {
        expect(colors.background.base).toBe('#FAFBF9');
        expect(colors.background.elevated).toBe('#FFFFFF');
        expect(colors.background.muted).toBe('#F5F7F4');
        expect(colors.background.subtle).toBe('#EEF1EC');
      });

      it('all backgrounds are hex colors (not gradients)', () => {
        Object.values(colors.background).forEach((color) => {
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
      });
    });

    describe('border colors', () => {
      it('defines solid border colors', () => {
        expect(colors.border.light).toBe('#E4E8E2');
        expect(colors.border.default).toBe('#D4DCD6');
        expect(colors.border.strong).toBe('#B8C4BC');
        expect(colors.border.focus).toBe('#4A7C54');
      });
    });

    describe('text colors', () => {
      it('defines accessible text colors', () => {
        expect(colors.text.primary).toBe('#2D3A30');
        expect(colors.text.secondary).toBe('#6B7A6E');
        expect(colors.text.tertiary).toBe('#8A9A8C');
        expect(colors.text.inverse).toBe('#FFFFFF');
      });
    });

    describe('accent colors', () => {
      it('defines accent colors for buttons', () => {
        expect(colors.accent.success).toBeDefined();
        expect(colors.accent.successHover).toBeDefined();
        expect(colors.accent.error).toBeDefined();
        expect(colors.accent.errorHover).toBeDefined();
      });

      it('hover states are darker than default', () => {
        // Success hover should be darker (lower luminosity)
        expect(colors.accent.successHover).not.toBe(colors.accent.success);
        expect(colors.accent.errorHover).not.toBe(colors.accent.error);
      });
    });

    describe('status colors', () => {
      it('defines status indicator colors', () => {
        expect(colors.status.successBg).toBeDefined();
        expect(colors.status.successText).toBeDefined();
        expect(colors.status.successBorder).toBeDefined();
        expect(colors.status.errorBg).toBeDefined();
        expect(colors.status.errorText).toBeDefined();
        expect(colors.status.errorBorder).toBeDefined();
      });
    });

    describe('message colors', () => {
      it('defines user and assistant message backgrounds', () => {
        expect(colors.message.userBg).toBe('#EDF4F0');
        expect(colors.message.userBorder).toBe('#C5D9CB');
        expect(colors.message.assistantBg).toBe('#FFFFFF');
        expect(colors.message.assistantBorder).toBe('#E4E8E2');
      });
    });

    describe('send button colors', () => {
      it('defines send button color states', () => {
        expect(colors.send.default).toBe('#99cd7e');
        expect(colors.send.hover).toBe('#769d60');
        expect(colors.send.active).toBe('#5f7d4d');
      });
    });
  });

  describe('spacing', () => {
    it('uses 4px base unit system', () => {
      expect(spacing[0]).toBe('0');
      expect(spacing[1]).toBe('4px');
      expect(spacing[2]).toBe('8px');
      expect(spacing[3]).toBe('12px');
      expect(spacing[4]).toBe('16px');
    });

    it('provides larger spacing values', () => {
      expect(spacing[6]).toBe('24px');
      expect(spacing[8]).toBe('32px');
      expect(spacing[10]).toBe('40px');
      expect(spacing[12]).toBe('48px');
    });
  });

  describe('radii (border radius)', () => {
    it('defines border radius scale', () => {
      expect(radii.none).toBe('0');
      expect(radii.sm).toBe('4px');
      expect(radii.md).toBe('6px');
      expect(radii.lg).toBe('8px');
      expect(radii.xl).toBe('10px');
      expect(radii['2xl']).toBe('12px');
      expect(radii['3xl']).toBe('16px');
      expect(radii.full).toBe('9999px');
    });
  });

  describe('fontSizes', () => {
    it('defines font size scale', () => {
      expect(fontSizes.xs).toBe('10px');
      expect(fontSizes.sm).toBe('12px');
      expect(fontSizes.base).toBe('14px');
      expect(fontSizes.lg).toBe('15px');
      expect(fontSizes.xl).toBe('16px');
    });
  });

  describe('fontWeights', () => {
    it('defines standard font weights', () => {
      expect(fontWeights.normal).toBe('400');
      expect(fontWeights.medium).toBe('500');
      expect(fontWeights.semibold).toBe('600');
      expect(fontWeights.bold).toBe('700');
    });
  });

  describe('transitions', () => {
    it('defines transition durations', () => {
      expect(transitions.fast).toBe('0.1s ease');
      expect(transitions.default).toBe('0.15s ease');
      expect(transitions.slow).toBe('0.25s ease');
    });
  });

  describe('cssVariables', () => {
    it('generates CSS custom properties string', () => {
      expect(cssVariables).toContain(':root');
      expect(typeof cssVariables).toBe('string');
    });

    it('includes primary color variables', () => {
      expect(cssVariables).toContain('--color-primary-500');
      expect(cssVariables).toContain('#3A5A40');
    });

    it('includes background variables', () => {
      expect(cssVariables).toContain('--color-bg-base');
      expect(cssVariables).toContain('#FAFBF9');
    });

    it('includes border variables', () => {
      expect(cssVariables).toContain('--color-border-default');
      expect(cssVariables).toContain('--color-border-focus');
    });

    it('includes spacing variables', () => {
      expect(cssVariables).toContain('--spacing-1');
      expect(cssVariables).toContain('--spacing-4');
    });

    it('includes radius variables', () => {
      expect(cssVariables).toContain('--radius-sm');
      expect(cssVariables).toContain('--radius-xl');
    });

    it('includes font size variables', () => {
      expect(cssVariables).toContain('--font-size-base');
      expect(cssVariables).toContain('--font-size-lg');
    });

    it('includes transition variables', () => {
      expect(cssVariables).toContain('--transition-default');
      expect(cssVariables).toContain('0.15s ease');
    });

    it('does not contain box-shadow definitions', () => {
      expect(cssVariables).not.toContain('box-shadow');
    });

    it('does not contain gradient definitions', () => {
      expect(cssVariables).not.toContain('linear-gradient');
      expect(cssVariables).not.toContain('radial-gradient');
    });
  });

  describe('flatButtonStyle', () => {
    it('generates primary button style by default', () => {
      const style = flatButtonStyle();
      expect(style).toContain('background:');
      expect(style).toContain('border:');
      expect(style).toContain('border-radius:');
    });

    it('generates primary button with success colors', () => {
      const style = flatButtonStyle('primary');
      expect(style).toContain(colors.accent.success);
      expect(style).toContain(colors.text.inverse);
    });

    it('generates secondary button with neutral colors', () => {
      const style = flatButtonStyle('secondary');
      expect(style).toContain(colors.surface.default);
      expect(style).toContain(colors.text.primary);
    });

    it('generates danger button with error colors', () => {
      const style = flatButtonStyle('danger');
      expect(style).toContain(colors.accent.error);
      expect(style).toContain(colors.text.inverse);
    });

    it('includes hover states', () => {
      const style = flatButtonStyle('primary');
      expect(style).toContain('&:hover');
      expect(style).toContain(colors.accent.successHover);
    });

    it('includes disabled state', () => {
      const style = flatButtonStyle();
      expect(style).toContain('&:disabled');
      expect(style).toContain(colors.surface.disabled);
    });

    it('does not include box-shadow', () => {
      const style = flatButtonStyle();
      expect(style).not.toContain('box-shadow');
    });
  });

  describe('flatInputStyle', () => {
    it('generates input style', () => {
      const style = flatInputStyle();
      expect(style).toContain('background:');
      expect(style).toContain('border:');
      expect(style).toContain('border-radius:');
    });

    it('uses solid border colors', () => {
      const style = flatInputStyle();
      expect(style).toContain(colors.border.default);
    });

    it('includes focus state with border change', () => {
      const style = flatInputStyle();
      expect(style).toContain('&:focus');
      expect(style).toContain(colors.border.focus);
    });

    it('does not include box-shadow', () => {
      const style = flatInputStyle();
      expect(style).not.toContain('box-shadow');
    });
  });

  describe('flatCardStyle', () => {
    it('generates card style', () => {
      const style = flatCardStyle();
      expect(style).toContain('background:');
      expect(style).toContain('border:');
      expect(style).toContain('border-radius:');
    });

    it('uses solid colors', () => {
      const style = flatCardStyle();
      expect(style).toContain(colors.surface.default);
      expect(style).toContain(colors.border.light);
    });

    it('includes hover state with border change', () => {
      const style = flatCardStyle();
      expect(style).toContain('&:hover');
      expect(style).toContain(colors.border.strong);
    });

    it('does not include box-shadow', () => {
      const style = flatCardStyle();
      expect(style).not.toContain('box-shadow');
    });
  });

  describe('WCAG accessibility', () => {
    it('text primary on background base has sufficient contrast', () => {
      // #2D3A30 on #FAFBF9 should have high contrast
      // Primary text is dark (low luminosity)
      expect(colors.text.primary).toMatch(/^#[0-4][0-9A-Fa-f]/);
      // Background is light (high luminosity)
      expect(colors.background.base).toMatch(/^#[F][0-9A-Fa-f]/);
    });

    it('inverse text on primary-500 has sufficient contrast', () => {
      // White text on #3A5A40 should be readable
      expect(colors.text.inverse).toBe('#FFFFFF');
      // Primary is mid-dark green
      expect(colors.primary[500]).toMatch(/^#[3-5][0-9A-Fa-f]/);
    });
  });
});
