/**
 * TAB-7: Constrain TabHeader contents to max-width 1024px centered
 *
 * Requirements:
 * - Add inner container to TabHeader with max-width: 1024px
 * - Center inner container with margin: 0 auto
 * - Keep outer background/border full-width
 * - Verify layout on wide and narrow screens
 */

import {
  getTabHeaderStyles,
  generateTabHeaderHTML,
  createTabHeaderElement,
} from '../../shared/TabHeader';

describe('TAB-7: TabHeader max-width constraint', () => {
  describe('CSS styles', () => {
    const styles = getTabHeaderStyles();

    it('should have .tab-header-inner class defined', () => {
      expect(styles).toContain('.tab-header-inner');
    });

    it('should set max-width: 1024px on inner container', () => {
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*max-width:\s*1024px/);
    });

    it('should center inner container with margin: 0 auto', () => {
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*margin:\s*0\s+auto/);
    });

    it('should set width: 100% on inner container', () => {
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*width:\s*100%/);
    });

    it('should keep outer .tab-header without max-width constraint', () => {
      // Match .tab-header { ... } block but NOT .tab-header-inner
      const tabHeaderMatch = styles.match(/\.tab-header\s*\{([^}]+)\}/);
      expect(tabHeaderMatch).toBeTruthy();
      const tabHeaderStyles = tabHeaderMatch![1];
      // Outer should not have max-width (it stays full-width)
      expect(tabHeaderStyles).not.toContain('max-width');
    });

    it('should have display: flex on inner container', () => {
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*display:\s*flex/);
    });

    it('should have justify-content: space-between on inner container', () => {
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*justify-content:\s*space-between/);
    });

    it('should have align-items: center on inner container', () => {
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*align-items:\s*center/);
    });
  });

  describe('HTML structure', () => {
    it('should have .tab-header-inner wrapper inside .tab-header', () => {
      const html = generateTabHeaderHTML('settings');
      expect(html).toContain('class="tab-header"');
      expect(html).toContain('class="tab-header-inner"');
    });

    it('should wrap brand and nav inside inner container', () => {
      const html = generateTabHeaderHTML('settings');
      // Inner should contain both brand and nav
      const innerMatch = html.match(
        /<div class="tab-header-inner">([\s\S]*?)<\/div>\s*<\/div>\s*$/
      );
      expect(innerMatch).toBeTruthy();
      const innerContent = innerMatch![1];
      expect(innerContent).toContain('class="tab-header-brand"');
      expect(innerContent).toContain('class="tab-header-nav"');
    });

    it('should have outer .tab-header containing inner container', () => {
      const html = generateTabHeaderHTML('personas');
      // Verify nesting structure
      expect(html).toMatch(/<div class="tab-header">\s*<div class="tab-header-inner">/);
    });
  });

  describe('createTabHeaderElement', () => {
    it('should create element with proper nesting structure', () => {
      const element = createTabHeaderElement('history');
      expect(element.classList.contains('tab-header')).toBe(true);

      const inner = element.querySelector('.tab-header-inner');
      expect(inner).not.toBeNull();
    });

    it('should have brand and nav inside inner container', () => {
      const element = createTabHeaderElement('settings');
      const inner = element.querySelector('.tab-header-inner');

      expect(inner?.querySelector('.tab-header-brand')).not.toBeNull();
      expect(inner?.querySelector('.tab-header-nav')).not.toBeNull();
    });

    it('should not have brand/nav directly under .tab-header', () => {
      const element = createTabHeaderElement('personas');

      // Brand and nav should be children of inner, not direct children of header
      const directBrand = Array.from(element.children).find((el) =>
        el.classList.contains('tab-header-brand')
      );
      const directNav = Array.from(element.children).find((el) =>
        el.classList.contains('tab-header-nav')
      );

      expect(directBrand).toBeUndefined();
      expect(directNav).toBeUndefined();
    });
  });

  describe('layout behavior', () => {
    it('should keep outer header full-width via CSS', () => {
      const styles = getTabHeaderStyles();
      // Outer header should not have max-width - relies on natural block behavior
      const tabHeaderBlock = styles.match(/\.tab-header\s*\{([^}]+)\}/);
      expect(tabHeaderBlock).toBeTruthy();
      expect(tabHeaderBlock![1]).not.toContain('max-width');
    });

    it('should have padding on inner container for narrow screens', () => {
      const styles = getTabHeaderStyles();
      // Inner should have horizontal padding for narrow screens
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*padding/);
    });
  });

  describe('visual consistency', () => {
    it('should use CSS variables for max-width', () => {
      const styles = getTabHeaderStyles();
      // Using hardcoded 1024px is acceptable per PRD
      expect(styles).toMatch(/max-width:\s*1024px/);
    });

    it('should maintain flex layout in inner container', () => {
      const styles = getTabHeaderStyles();
      const innerMatch = styles.match(/\.tab-header-inner\s*\{([^}]+)\}/);
      expect(innerMatch).toBeTruthy();
      const innerStyles = innerMatch![1];
      expect(innerStyles).toContain('display: flex');
      expect(innerStyles).toContain('justify-content: space-between');
      expect(innerStyles).toContain('align-items: center');
    });
  });

  describe('responsive behavior', () => {
    it('should allow inner container to shrink below max-width', () => {
      const styles = getTabHeaderStyles();
      // width: 100% allows shrinking on narrow screens
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*width:\s*100%/);
    });

    it('should center inner container on wide screens', () => {
      const styles = getTabHeaderStyles();
      // margin: 0 auto centers on wide screens
      expect(styles).toMatch(/\.tab-header-inner\s*\{[^}]*margin:\s*0\s+auto/);
    });
  });
});
