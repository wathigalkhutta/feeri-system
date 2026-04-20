// Feeri System - App Context
// Design: Corporate - Language, Company selection, Sidebar state

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, t as translate, TranslationKey } from '@/lib/i18n';

export interface Company {
  id: string;
  name: string;
  nameEn: string;
  industry: string;
  logo?: string;
  revenue: number;
  expenses: number;
  employees: number;
  status: 'active' | 'inactive';
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  companies: Company[];
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const defaultCompanies: Company[] = [
  { id: '1', name: 'شركة فيري للتقنية', nameEn: 'Feeri Technology', industry: 'تقنية المعلومات', revenue: 1250000, expenses: 780000, employees: 45, status: 'active' },
  { id: '2', name: 'فيري للعقارات', nameEn: 'Feeri Real Estate', industry: 'عقارات', revenue: 3200000, expenses: 1100000, employees: 22, status: 'active' },
  { id: '3', name: 'فيري لتأجير السيارات', nameEn: 'Feeri Car Rental', industry: 'نقل وخدمات', revenue: 890000, expenses: 420000, employees: 18, status: 'active' },
  { id: '4', name: 'فيري للاستشارات', nameEn: 'Feeri Consulting', industry: 'استشارات', revenue: 560000, expenses: 230000, employees: 12, status: 'active' },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const t = useCallback((key: TranslationKey) => translate(key, lang), [lang]);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <AppContext.Provider value={{
      lang, setLang, t, dir,
      selectedCompany, setSelectedCompany,
      companies: defaultCompanies,
      sidebarCollapsed, setSidebarCollapsed,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
