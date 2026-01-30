/**
 * WS-9: Style website with flat design CSS
 *
 * Tests verify:
 * - Flat design principles (no shadows, no gradients)
 * - Solid colors matching extension theme
 * - Clean typography with Inter font
 * - Consistent styling with extension
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const websitePath = path.join(__dirname, '../../../website');
const stylesPath = path.join(websitePath, 'styles.css');
const indexPath = path.join(websitePath, 'index.html');
const sharedStylesPath = path.join(__dirname, '../../shared/styles.ts');

describe('WS-9: Style website with flat design CSS', () => {
  let css: string;
  let html: string;
  let sharedStyles: string;

  beforeAll(() => {
    css = fs.readFileSync(stylesPath, 'utf-8');
    html = fs.readFileSync(indexPath, 'utf-8');
    sharedStyles = fs.readFileSync(sharedStylesPath, 'utf-8');
  });

  describe('Flat design principles', () => {
    it('should have comment indicating flat design', () => {
      expect(css).toMatch(/flat design/i);
    });

    it('should not have box-shadow in any rule (except reset)', () => {
      // Should have the explicit shadow reset
      expect(css).toMatch(/box-shadow:\s*none/);

      // Should not have any actual shadow values
      const shadowPatterns = [
        /box-shadow:\s*\d+px/i,
        /box-shadow:\s*rgba/i,
        /box-shadow:\s*#[0-9a-f]/i,
        /box-shadow:\s*0\s+\d+px/i,
      ];

      shadowPatterns.forEach((pattern) => {
        expect(css).not.toMatch(pattern);
      });
    });

    it('should not have linear-gradient or radial-gradient in CSS', () => {
      // Check for gradient usage (excluding SVG definitions which are allowed)
      const cssWithoutSvg = css.replace(/<svg[\s\S]*?<\/svg>/gi, '');
      expect(cssWithoutSvg).not.toMatch(/linear-gradient/i);
      expect(cssWithoutSvg).not.toMatch(/radial-gradient/i);
    });

    it('should use solid border colors from design system', () => {
      expect(css).toMatch(/--color-border-default/);
      expect(css).toMatch(/--color-border-light/);
      expect(css).toMatch(/--color-border-strong/);
    });
  });

  describe('Colors match extension theme', () => {
    it('should define primary color palette matching styles.ts', () => {
      // Primary 500 (main primary) from styles.ts is #3A5A40
      expect(css).toMatch(/--color-primary-500:\s*#3A5A40/i);
      // Primary 50 from styles.ts is #E8F0EA
      expect(css).toMatch(/--color-primary-50:\s*#E8F0EA/i);
      // Primary 400 from styles.ts is #4A7C54
      expect(css).toMatch(/--color-primary-400:\s*#4A7C54/i);
    });

    it('should define background colors matching styles.ts', () => {
      // Background base from styles.ts is #FAFBF9
      expect(css).toMatch(/--color-bg-base:\s*#FAFBF9/i);
      // Background elevated from styles.ts is #FFFFFF
      expect(css).toMatch(/--color-bg-elevated:\s*#FFFFFF/i);
    });

    it('should define text colors matching styles.ts', () => {
      // Text primary from styles.ts is #2D3A30
      expect(css).toMatch(/--color-text-primary:\s*#2D3A30/i);
      // Text secondary from styles.ts is #6B7A6E
      expect(css).toMatch(/--color-text-secondary:\s*#6B7A6E/i);
    });

    it('should define accent colors matching styles.ts', () => {
      // Accent success from styles.ts is #4A7C54
      expect(css).toMatch(/--color-accent-success:\s*#4A7C54/i);
      // Accent info from styles.ts is #3A7B89
      expect(css).toMatch(/--color-accent-info:\s*#3A7B89/i);
    });

    it('should use consistent forest theme colors for headings', () => {
      // Hero h1 and feature h2 should use primary color
      expect(css).toMatch(/\.hero h1[\s\S]*?color:\s*var\(--color-primary/);
      expect(css).toMatch(/\.feature h2[\s\S]*?color:\s*var\(--color-primary/);
    });

    it('should use solid surface colors', () => {
      expect(css).toMatch(/--color-surface-default:\s*#FFFFFF/i);
      expect(css).toMatch(/--color-surface-hover:\s*#F5F7F4/i);
    });
  });

  describe('Typography with Inter font', () => {
    it('should load Inter font from Google Fonts', () => {
      expect(html).toMatch(/fonts\.googleapis\.com.*Inter/);
    });

    it('should set Inter as primary font in CSS', () => {
      expect(css).toMatch(/--font-family:\s*['"]?Inter['"]?/);
    });

    it('should apply font-family to body', () => {
      expect(css).toMatch(/body[\s\S]*?font-family:\s*var\(--font-family\)/);
    });

    it('should define font size scale', () => {
      expect(css).toMatch(/--font-size-sm/);
      expect(css).toMatch(/--font-size-base/);
      expect(css).toMatch(/--font-size-lg/);
      expect(css).toMatch(/--font-size-xl/);
      expect(css).toMatch(/--font-size-2xl/);
      expect(css).toMatch(/--font-size-3xl/);
      expect(css).toMatch(/--font-size-4xl/);
    });

    it('should define font weight scale', () => {
      expect(css).toMatch(/--font-weight-normal:\s*400/);
      expect(css).toMatch(/--font-weight-medium:\s*500/);
      expect(css).toMatch(/--font-weight-semibold:\s*600/);
      expect(css).toMatch(/--font-weight-bold:\s*700/);
    });

    it('should use font weight variables in styling', () => {
      expect(css).toMatch(/font-weight:\s*var\(--font-weight-/);
    });
  });

  describe('Consistent with extension styling', () => {
    it('should define spacing scale with 4px base unit', () => {
      expect(css).toMatch(/--spacing-1:\s*4px/);
      expect(css).toMatch(/--spacing-2:\s*8px/);
      expect(css).toMatch(/--spacing-4:\s*16px/);
      expect(css).toMatch(/--spacing-8:\s*32px/);
    });

    it('should define border radius scale', () => {
      expect(css).toMatch(/--radius-sm:\s*4px/);
      expect(css).toMatch(/--radius-md:\s*6px/);
      expect(css).toMatch(/--radius-lg:\s*8px/);
    });

    it('should define transition scale', () => {
      expect(css).toMatch(/--transition-fast:\s*0\.1s/);
      expect(css).toMatch(/--transition-default:\s*0\.15s/);
      expect(css).toMatch(/--transition-slow:\s*0\.25s/);
    });

    it('should use CSS variables throughout styles', () => {
      // Count usage of var() in CSS
      const varUsage = (css.match(/var\(--/g) || []).length;
      expect(varUsage).toBeGreaterThan(50);
    });

    it('should use transition variables for hover states', () => {
      expect(css).toMatch(/transition:.*var\(--transition-/);
    });
  });

  describe('Button styling', () => {
    it('should have flat button styles without shadows', () => {
      expect(css).toMatch(/\.download-btn/);
      // Button background should be solid color
      expect(css).toMatch(/\.download-btn-firefox[\s\S]*?background-color:\s*var\(--color-accent-success\)/);
    });

    it('should have hover state using color change', () => {
      expect(css).toMatch(/\.download-btn-firefox:hover[\s\S]*?background-color:\s*var\(--color-accent-success-hover\)/);
    });

    it('should have secondary button style', () => {
      expect(css).toMatch(/\.download-btn-chrome[\s\S]*?background-color:\s*var\(--color-surface-default\)/);
    });
  });

  describe('Card/Feature styling', () => {
    it('should have flat feature cards with border instead of shadow', () => {
      expect(css).toMatch(/\.feature[\s\S]*?border:\s*1px solid var\(--color-border/);
    });

    it('should have hover state on feature cards', () => {
      expect(css).toMatch(/\.feature:hover[\s\S]*?border-color:\s*var\(--color-border-strong\)/);
    });

    it('should have solid background on cards', () => {
      expect(css).toMatch(/\.feature[\s\S]*?background-color:\s*var\(--color-surface-default\)/);
    });
  });

  describe('Focus states for accessibility', () => {
    it('should define focus outline using design system color', () => {
      expect(css).toMatch(/--color-border-focus:\s*#4A7C54/i);
    });

    it('should have focus state styling', () => {
      expect(css).toMatch(/focus[\s\S]*?outline/);
    });
  });

  describe('Header and footer styling', () => {
    it('should have flat header with border', () => {
      expect(css).toMatch(/\.site-header[\s\S]*?border-bottom:\s*1px solid var\(--color-border/);
    });

    it('should have flat footer with border', () => {
      expect(css).toMatch(/\.site-footer[\s\S]*?border-top:\s*1px solid var\(--color-border/);
    });
  });
});
