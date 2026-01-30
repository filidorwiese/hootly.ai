import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('UI-8: Fix dropdown cut-off on react-draggable', () => {
  let dialogContent: string;
  let personaSelectorContent: string;
  let modelSelectorContent: string;

  beforeEach(() => {
    const dialogPath = path.join(process.cwd(), 'src/content/components/Dialog.tsx');
    const personaSelectorPath = path.join(process.cwd(), 'src/content/components/PersonaSelector.tsx');
    const modelSelectorPath = path.join(process.cwd(), 'src/content/components/ModelSelector.tsx');

    dialogContent = fs.readFileSync(dialogPath, 'utf-8');
    personaSelectorContent = fs.readFileSync(personaSelectorPath, 'utf-8');
    modelSelectorContent = fs.readFileSync(modelSelectorPath, 'utf-8');
  });

  describe('Dialog overflow property', () => {
    it('dialogStyles has overflow: visible (not hidden)', () => {
      // Extract dialogStyles content
      const dialogStylesMatch = dialogContent.match(/const dialogStyles = css`([\s\S]*?)`;/);
      expect(dialogStylesMatch).toBeTruthy();
      const dialogStyles = dialogStylesMatch![1];

      // Check that overflow is visible
      expect(dialogStyles).toContain('overflow: visible');
      expect(dialogStyles).not.toContain('overflow: hidden');
    });

    it('contentWrapperStyles has overflow: visible', () => {
      const contentWrapperMatch = dialogContent.match(/const contentWrapperStyles = css`([\s\S]*?)`;/);
      expect(contentWrapperMatch).toBeTruthy();
      const contentWrapperStyles = contentWrapperMatch![1];

      expect(contentWrapperStyles).toContain('overflow: visible');
    });
  });

  describe('PersonaSelector dropdown positioning', () => {
    it('dropdown uses position: absolute', () => {
      const dropdownMatch = personaSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      expect(dropdownStyles).toContain('position: absolute');
    });

    it('dropdown opens upward with bottom positioning', () => {
      const dropdownMatch = personaSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      // bottom: calc(100% + ...) means dropdown opens upward
      expect(dropdownStyles).toMatch(/bottom:\s*calc\(100%/);
    });

    it('dropdown has z-index for stacking', () => {
      const dropdownMatch = personaSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      expect(dropdownStyles).toMatch(/z-index:\s*\d+/);
    });

    it('container uses position: relative for dropdown positioning', () => {
      const containerMatch = personaSelectorContent.match(/const containerStyles = css`([\s\S]*?)`;/);
      expect(containerMatch).toBeTruthy();
      const containerStyles = containerMatch![1];

      expect(containerStyles).toContain('position: relative');
    });
  });

  describe('ModelSelector dropdown positioning', () => {
    it('dropdown uses position: absolute', () => {
      const dropdownMatch = modelSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      expect(dropdownStyles).toContain('position: absolute');
    });

    it('dropdown opens upward with bottom positioning', () => {
      const dropdownMatch = modelSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      expect(dropdownStyles).toMatch(/bottom:\s*calc\(100%/);
    });

    it('dropdown has z-index for stacking', () => {
      const dropdownMatch = modelSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      expect(dropdownStyles).toMatch(/z-index:\s*\d+/);
    });

    it('container uses position: relative for dropdown positioning', () => {
      const containerMatch = modelSelectorContent.match(/const containerStyles = css`([\s\S]*?)`;/);
      expect(containerMatch).toBeTruthy();
      const containerStyles = containerMatch![1];

      expect(containerStyles).toContain('position: relative');
    });
  });

  describe('Border radius handling with overflow: visible', () => {
    it('headerStyles has top border-radius to maintain rounded corners', () => {
      const headerMatch = dialogContent.match(/const headerStyles = css`([\s\S]*?)`;/);
      expect(headerMatch).toBeTruthy();
      const headerStyles = headerMatch![1];

      // Check for top corners radius (e.g., radii['3xl'] radii['3xl'] 0 0)
      expect(headerStyles).toMatch(/border-radius:.*\d.*\d.*0.*0/);
    });

    it('inputSectionStyles has bottom border-radius to maintain rounded corners', () => {
      const inputMatch = dialogContent.match(/const inputSectionStyles = css`([\s\S]*?)`;/);
      expect(inputMatch).toBeTruthy();
      const inputSectionStyles = inputMatch![1];

      // Check for bottom corners radius (e.g., 0 0 radii['3xl'] radii['3xl'])
      expect(inputSectionStyles).toMatch(/border-radius:.*0.*0.*\d.*\d/);
    });
  });

  describe('Dropdown visibility', () => {
    it('persona dropdown max-height allows full visibility', () => {
      const dropdownMatch = personaSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      // Should have max-height for scrollable content
      expect(dropdownStyles).toMatch(/max-height:\s*\d+px/);
    });

    it('model dropdown max-height allows full visibility', () => {
      const dropdownMatch = modelSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      expect(dropdownStyles).toMatch(/max-height:\s*\d+px/);
    });

    it('persona dropdown has overflow-y: auto for scrolling long lists', () => {
      const dropdownMatch = personaSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      expect(dropdownStyles).toContain('overflow-y: auto');
    });

    it('model dropdown has overflow-y: auto for scrolling long lists', () => {
      const dropdownMatch = modelSelectorContent.match(/const dropdownStyles = css`([\s\S]*?)`;/);
      expect(dropdownMatch).toBeTruthy();
      const dropdownStyles = dropdownMatch![1];

      expect(dropdownStyles).toContain('overflow-y: auto');
    });
  });

  describe('Dragging still functional', () => {
    it('dialog still has drag-handle class for header', () => {
      // The header should still have drag-handle for react-rnd
      expect(dialogContent).toContain('drag-handle');
      expect(dialogContent).toContain('dragHandleClassName="drag-handle"');
    });

    it('dialog uses react-rnd Rnd component', () => {
      expect(dialogContent).toContain("import { Rnd } from 'react-rnd'");
      expect(dialogContent).toContain('<Rnd');
    });

    it('dialog has bounds="parent" for containing drag area', () => {
      expect(dialogContent).toContain('bounds="parent"');
    });
  });
});
