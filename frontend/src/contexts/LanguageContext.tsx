import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getTranslation, languages, TranslationKeys } from '../translations';

// Interface for the language context
interface LanguageContextType {
  language: 'en' | 'tk';
  setLanguage: (lang: 'en' | 'tk') => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
  availableLanguages: typeof languages;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider props interface
interface LanguageProviderProps {
  children: ReactNode;
}

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Check if there's a saved language preference in localStorage
  const savedLanguage = localStorage.getItem('language') as 'en' | 'tk';
  const defaultLanguage = savedLanguage || 'en';
  
  const [language, setLanguage] = useState<'en' | 'tk'>(defaultLanguage);

  // Function to change the language
  const handleSetLanguage = (lang: 'en' | 'tk') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: TranslationKeys, params?: Record<string, string | number>): string => {
    return getTranslation(key, language, params);
  };

  // Context value
  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    availableLanguages: languages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;