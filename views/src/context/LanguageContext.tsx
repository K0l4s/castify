import React, { createContext, useState, useContext, ReactNode } from 'react';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Record<string, any>;  // Allow nested objects here
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages = {
  en,
  vi
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const lang = localStorage.getItem('lang') as Language;
  const [language, setLanguage] = useState<Language>(lang || 'en');

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
    // Optionally, you can also set the document's lang attribute
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language: languages[language], changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
