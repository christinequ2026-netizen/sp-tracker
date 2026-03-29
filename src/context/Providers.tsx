'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'zh' | 'en';
interface LangContextType { lang: Lang; toggleLang: () => void; }

const LangContext = createContext<LangContextType>({ lang: 'zh', toggleLang: () => {} });
export const useLanguage = () => useContext(LangContext);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh');
  const toggleLang = () => setLang(prev => prev === 'zh' ? 'en' : 'zh');
  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}
