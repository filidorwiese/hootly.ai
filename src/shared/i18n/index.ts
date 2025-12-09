import en from './en.json';
import nl from './nl.json';
import de from './de.json';
import fr from './fr.json';
import es from './es.json';
import it from './it.json';
import pt from './pt.json';
import zh from './zh.json';
import ja from './ja.json';
import ko from './ko.json';

type Translations = typeof en;
type TranslationKey = string;

const translations: Record<string, Translations> = { en, nl, de, fr, es, it, pt, zh, ja, ko };

function getBrowserLanguage(): string {
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  return lang.split('-')[0].toLowerCase();
}

let currentLanguage = getBrowserLanguage();
let languageSetting: string = 'auto';

export async function initLanguage(): Promise<void> {
  try {
    const result = await chrome.storage.local.get('hootly_settings');
    const settings = result.hootly_settings;
    if (settings?.language) {
      languageSetting = settings.language;
      if (languageSetting !== 'auto' && translations[languageSetting]) {
        currentLanguage = languageSetting;
      }
    }
  } catch {
    // Storage not available, use browser language
  }
}

export function setLanguage(lang: string): void {
  if (translations[lang]) {
    currentLanguage = lang;
  }
}

export function getLanguage(): string {
  return currentLanguage;
}

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const lang = translations[currentLanguage] ? currentLanguage : 'en';
  let value = getNestedValue(translations[lang], key);

  if (value === undefined) {
    value = getNestedValue(translations.en, key);
  }

  if (value === undefined) {
    return key;
  }

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value!.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    });
  }

  return value;
}

export default t;
