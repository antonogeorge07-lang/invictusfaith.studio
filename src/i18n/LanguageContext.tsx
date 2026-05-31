import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};

const supportedLanguages: Language[] = ['en', 'es', 'ru', 'hu', 'pt', 'fr', 'de', 'it', 'pl', 'nl'];

const isLanguage = (value: string | null): value is Language => (
  Boolean(value && supportedLanguages.includes(value as Language))
);

const getSavedLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem('language');
  return isLanguage(saved) ? saved : 'en';
};

const translate = (language: Language, key: string, vars?: Record<string, string>): string => {
  const raw = translations[language][key] ?? translations.en[key] ?? key;
  if (!vars) return raw;
  return Object.keys(vars).reduce((acc, k) => acc.split(`{{${k}}}`).join(vars[k]), raw);
};

const fallbackLanguageContext: LanguageContextType = {
  language: getSavedLanguage(),
  setLanguage: (lang: Language) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('language', lang);
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  },
  t: (key, vars) => translate(getSavedLanguage(), key, vars),
};

declare global {
  var __invictusLanguageContext: ReturnType<typeof createContext<LanguageContextType>> | undefined;
}

const LanguageContext = globalThis.__invictusLanguageContext ?? createContext<LanguageContextType>(fallbackLanguageContext);
globalThis.__invictusLanguageContext = LanguageContext;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getSavedLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    fallbackLanguageContext.language = language;
    fallbackLanguageContext.t = (key, vars) => translate(language, key, vars);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, vars?: Record<string, string>): string => {
    return translate(language, key, vars);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
