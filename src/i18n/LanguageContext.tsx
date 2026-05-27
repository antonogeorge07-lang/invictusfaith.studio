import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};


const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved && ['en', 'es', 'ru', 'hu', 'pt', 'fr', 'de', 'it', 'pl', 'nl'].includes(saved)) {
      setLanguageState(saved as Language);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, vars?: Record<string, string>): string => {
    const raw = translations[language][key] || translations['en'][key] || key;
    if (!vars) return raw;
    return Object.keys(vars).reduce((acc, k) => acc.split(`{{${k}}}`).join(vars[k]), raw);
  };


  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
