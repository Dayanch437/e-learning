import { en } from './en';
import { tk } from './tk';

// Available languages
export const languages = {
  en: 'English',
  tk: 'Türkmençe'
};

// Type for translation strings
export type TranslationKeys = keyof typeof en;

// Get translation based on key and language
export const getTranslation = (
  key: TranslationKeys, 
  lang: 'en' | 'tk' = 'en',
  params?: Record<string, string | number>
): string => {
  const translations = lang === 'en' ? en : tk;
  
  let text = translations[key] || key;
  
  // Replace parameters in the translation
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{{${param}}}`, String(value));
    });
  }
  
  return text;
};

// Translation hook context will be created in a separate file