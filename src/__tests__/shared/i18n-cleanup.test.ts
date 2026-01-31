import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const i18nDir = resolve(__dirname, '../../shared/i18n');
const en = JSON.parse(readFileSync(resolve(i18nDir, 'en.json'), 'utf-8'));
const nl = JSON.parse(readFileSync(resolve(i18nDir, 'nl.json'), 'utf-8'));
const de = JSON.parse(readFileSync(resolve(i18nDir, 'de.json'), 'utf-8'));
const fr = JSON.parse(readFileSync(resolve(i18nDir, 'fr.json'), 'utf-8'));
const es = JSON.parse(readFileSync(resolve(i18nDir, 'es.json'), 'utf-8'));
const itLang = JSON.parse(readFileSync(resolve(i18nDir, 'it.json'), 'utf-8'));
const pt = JSON.parse(readFileSync(resolve(i18nDir, 'pt.json'), 'utf-8'));
const zh = JSON.parse(readFileSync(resolve(i18nDir, 'zh.json'), 'utf-8'));
const ja = JSON.parse(readFileSync(resolve(i18nDir, 'ja.json'), 'utf-8'));
const ko = JSON.parse(readFileSync(resolve(i18nDir, 'ko.json'), 'utf-8'));

function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...extractKeys(obj[key] as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('CLEANUP-3: i18n key consistency', () => {
  const enKeys = extractKeys(en);
  const languages = { nl, de, fr, es, it: itLang, pt, zh, ja, ko };

  it('should have no chat.* keys (removed as unused)', () => {
    const chatKeys = enKeys.filter(k => k.startsWith('chat.'));
    expect(chatKeys).toEqual([]);
  });

  it('should have no settings.managePersonas key (removed in UI-9)', () => {
    expect(enKeys).not.toContain('settings.managePersonas');
  });

  it('should have no settings.personaDescription key (removed in P-7)', () => {
    expect(enKeys).not.toContain('settings.personaDescription');
  });

  it('should have no unused model grouping keys', () => {
    expect(enKeys).not.toContain('settings.modelRecommended');
    expect(enKeys).not.toContain('settings.modelCurrent');
    expect(enKeys).not.toContain('settings.modelLegacy');
  });

  it('should have consistent keys across all language files', () => {
    for (const [lang, translations] of Object.entries(languages)) {
      const langKeys = extractKeys(translations);
      expect(langKeys).toEqual(enKeys);
    }
  });
});
