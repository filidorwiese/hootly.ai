/**
 * ICON-1: Replace dialog icons with glyphs.fyi colorful icons
 *
 * Tests verify that dialog, InputArea, and ContextToggle use SVG icons
 * instead of emoji/text characters.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('ICON-1: Dialog icons replaced with colorful SVG icons', () => {
  describe('icons.tsx exports', () => {
    const iconsPath = path.join(__dirname, '../../shared/icons.tsx');
    const iconsContent = fs.readFileSync(iconsPath, 'utf-8');

    it('should export FireIcon component', () => {
      expect(iconsContent).toContain('export const FireIcon');
    });

    it('should export HistoryIcon component', () => {
      expect(iconsContent).toContain('export const HistoryIcon');
    });

    it('should export SettingsIcon component', () => {
      expect(iconsContent).toContain('export const SettingsIcon');
    });

    it('should export CloseIcon component', () => {
      expect(iconsContent).toContain('export const CloseIcon');
    });

    it('should export SendIcon component', () => {
      expect(iconsContent).toContain('export const SendIcon');
    });

    it('should export ClearIcon component', () => {
      expect(iconsContent).toContain('export const ClearIcon');
    });

    it('should export SelectionIcon component', () => {
      expect(iconsContent).toContain('export const SelectionIcon');
    });

    it('should export FullPageIcon component', () => {
      expect(iconsContent).toContain('export const FullPageIcon');
    });

    it('should export NoContextIcon component', () => {
      expect(iconsContent).toContain('export const NoContextIcon');
    });

    describe('icons are colorful (not monochrome)', () => {
      it('FireIcon uses orange/yellow colors', () => {
        expect(iconsContent).toMatch(/FireIcon[\s\S]*?#FF6B35/);
        expect(iconsContent).toMatch(/FireIcon[\s\S]*?#FFB800/);
        expect(iconsContent).toMatch(/FireIcon[\s\S]*?#FFDD00/);
      });

      it('HistoryIcon uses brown/tan colors', () => {
        expect(iconsContent).toMatch(/HistoryIcon[\s\S]*?#8B7355/);
        expect(iconsContent).toMatch(/HistoryIcon[\s\S]*?#D4B896/);
      });

      it('SettingsIcon uses blue/teal colors', () => {
        expect(iconsContent).toMatch(/SettingsIcon[\s\S]*?#3A7B89/);
        expect(iconsContent).toMatch(/SettingsIcon[\s\S]*?#5BA3B0/);
      });

      it('SendIcon uses green color', () => {
        expect(iconsContent).toMatch(/SendIcon[\s\S]*?#4A7C54/);
      });

      it('SelectionIcon uses forest green colors', () => {
        expect(iconsContent).toMatch(/SelectionIcon[\s\S]*?#4A7C54/);
        expect(iconsContent).toMatch(/SelectionIcon[\s\S]*?#A3C4AC/);
      });
    });

    describe('icons are proper SVG', () => {
      it('FireIcon contains SVG structure', () => {
        expect(iconsContent).toMatch(/FireIcon[\s\S]*?<svg[\s\S]*?<\/svg>/);
      });

      it('HistoryIcon contains SVG structure', () => {
        expect(iconsContent).toMatch(/HistoryIcon[\s\S]*?<svg[\s\S]*?<\/svg>/);
      });

      it('icons have viewBox attribute', () => {
        expect(iconsContent).toContain('viewBox="0 0 24 24"');
      });

      it('icons support size prop', () => {
        expect(iconsContent).toContain('size?: number');
        expect(iconsContent).toContain('width={size}');
        expect(iconsContent).toContain('height={size}');
      });
    });
  });

  describe('Dialog.tsx uses SVG icons', () => {
    const dialogPath = path.join(__dirname, '../../content/components/Dialog.tsx');
    const dialogContent = fs.readFileSync(dialogPath, 'utf-8');

    it('should import icons from shared/icons', () => {
      expect(dialogContent).toContain("from '../../shared/icons'");
      expect(dialogContent).toContain('FireIcon');
      expect(dialogContent).toContain('HistoryIcon');
      expect(dialogContent).toContain('SettingsIcon');
      expect(dialogContent).toContain('CloseIcon');
    });

    it('should use FireIcon instead of 🔥 emoji', () => {
      expect(dialogContent).toContain('<FireIcon');
      expect(dialogContent).not.toMatch(/>\s*🔥\s*</);
    });

    it('should use HistoryIcon instead of 📜 emoji', () => {
      expect(dialogContent).toContain('<HistoryIcon');
      expect(dialogContent).not.toMatch(/>\s*📜\s*</);
    });

    it('should use SettingsIcon instead of ⚙️ emoji', () => {
      expect(dialogContent).toContain('<SettingsIcon');
      expect(dialogContent).not.toMatch(/>\s*⚙️\s*</);
    });

    it('should use CloseIcon instead of ✕ text', () => {
      expect(dialogContent).toContain('<CloseIcon');
      // Check header close button doesn't use text ✕
      expect(dialogContent).not.toMatch(/aria-label={t\('dialog\.close'\)}>\s*✕/);
    });
  });

  describe('InputArea.tsx uses SVG icons', () => {
    const inputAreaPath = path.join(__dirname, '../../content/components/InputArea.tsx');
    const inputAreaContent = fs.readFileSync(inputAreaPath, 'utf-8');

    it('should import icons from shared/icons', () => {
      expect(inputAreaContent).toContain("from '../../shared/icons'");
      expect(inputAreaContent).toContain('SendIcon');
      expect(inputAreaContent).toContain('ClearIcon');
    });

    it('should use SendIcon instead of ▶ character', () => {
      expect(inputAreaContent).toContain('<SendIcon');
      expect(inputAreaContent).not.toMatch(/>\s*▶\s*</);
    });

    it('should use ClearIcon instead of ✕ character', () => {
      expect(inputAreaContent).toContain('<ClearIcon');
      // Only check for clear button text replacement
      expect(inputAreaContent).not.toMatch(/aria-label={t\('input\.clear'\)}[\s\S]*?>\s*✕\s*</);
    });
  });

  describe('ContextToggle.tsx uses SVG icons', () => {
    const contextTogglePath = path.join(__dirname, '../../content/components/ContextToggle.tsx');
    const contextToggleContent = fs.readFileSync(contextTogglePath, 'utf-8');

    it('should import context icons from shared/icons', () => {
      expect(contextToggleContent).toContain("from '../../shared/icons'");
      expect(contextToggleContent).toContain('SelectionIcon');
      expect(contextToggleContent).toContain('FullPageIcon');
      expect(contextToggleContent).toContain('NoContextIcon');
    });

    it('should use IconComponent instead of 🌐 emoji', () => {
      expect(contextToggleContent).toContain('<IconComponent');
      expect(contextToggleContent).not.toMatch(/>\s*🌐\s*</);
    });

    it('should assign SelectionIcon for selection mode', () => {
      expect(contextToggleContent).toContain('IconComponent = SelectionIcon');
    });

    it('should assign FullPageIcon for fullpage mode', () => {
      expect(contextToggleContent).toContain('IconComponent = FullPageIcon');
    });

    it('should assign NoContextIcon for disabled mode', () => {
      expect(contextToggleContent).toContain('IconComponent = NoContextIcon');
    });
  });

  describe('icons complement forest theme', () => {
    const iconsPath = path.join(__dirname, '../../shared/icons.tsx');
    const iconsContent = fs.readFileSync(iconsPath, 'utf-8');
    const stylesPath = path.join(__dirname, '../../shared/styles.ts');
    const stylesContent = fs.readFileSync(stylesPath, 'utf-8');

    it('icons use forest green (#4A7C54) from design system', () => {
      // Forest green is the main primary color
      expect(stylesContent).toContain("500: '#3A5A40'");
      expect(stylesContent).toContain("400: '#4A7C54'");
      // Icons use this color
      expect(iconsContent).toContain('#4A7C54');
    });

    it('icons use accent info color (#3A7B89) from design system', () => {
      expect(stylesContent).toContain("info: '#3A7B89'");
      expect(iconsContent).toContain('#3A7B89');
    });

    it('icons use accent error color (#C45A5A) from design system', () => {
      expect(stylesContent).toContain("error: '#C45A5A'");
      expect(iconsContent).toContain('#C45A5A');
    });
  });

  describe('additional icon exports for other pages', () => {
    const iconsPath = path.join(__dirname, '../../shared/icons.tsx');
    const iconsContent = fs.readFileSync(iconsPath, 'utf-8');

    it('should export ExportIcon', () => {
      expect(iconsContent).toContain('export const ExportIcon');
    });

    it('should export ImportIcon', () => {
      expect(iconsContent).toContain('export const ImportIcon');
    });

    it('should export TrashIcon', () => {
      expect(iconsContent).toContain('export const TrashIcon');
    });

    it('should export AddIcon', () => {
      expect(iconsContent).toContain('export const AddIcon');
    });

    it('should export EditIcon', () => {
      expect(iconsContent).toContain('export const EditIcon');
    });

    it('should export BackIcon', () => {
      expect(iconsContent).toContain('export const BackIcon');
    });

    it('should export ContinueIcon', () => {
      expect(iconsContent).toContain('export const ContinueIcon');
    });

    it('should export ViewIcon', () => {
      expect(iconsContent).toContain('export const ViewIcon');
    });

    it('should export SearchIcon', () => {
      expect(iconsContent).toContain('export const SearchIcon');
    });
  });
});
