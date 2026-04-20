// Feeri System - Invoice Template Context
// Shared invoice template settings across Accounting and Settings pages

import { createContext, useContext, useState, ReactNode } from 'react';

export interface InvoiceTemplate {
  companyNameAr: string;
  companyNameEn: string;
  address: string;
  phone: string;
  email: string;
  vatNumber: string;
  crNumber: string;
  bankName: string;
  bankAccount: string;
  footerNote: string;
  primaryColor: string;
  showLogo: boolean;
  invoicePrefix: string;
  paymentTerms: string;
  logoUrl?: string;
}

interface InvoiceTemplateContextType {
  template: InvoiceTemplate;
  setTemplate: (t: InvoiceTemplate) => void;
  updateTemplate: (partial: Partial<InvoiceTemplate>) => void;
}

const defaultTemplate: InvoiceTemplate = {
  companyNameAr: 'شركة فيري القابضة',
  companyNameEn: 'Feeri Holding Company',
  address: 'الرياض، المملكة العربية السعودية',
  phone: '+966 11 XXX XXXX',
  email: 'info@feeri.com',
  vatNumber: '300XXXXXXXXX',
  crNumber: '1010XXXXXX',
  bankName: 'بنك الراجحي',
  bankAccount: 'SA00 0000 0000 0000 0000 0000',
  footerNote: 'شكراً لتعاملكم معنا — Thank you for your business',
  primaryColor: '#9333ea',
  showLogo: true,
  invoicePrefix: 'INV',
  paymentTerms: '30',
};

const InvoiceTemplateContext = createContext<InvoiceTemplateContextType>({
  template: defaultTemplate,
  setTemplate: () => {},
  updateTemplate: () => {},
});

export function InvoiceTemplateProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useState<InvoiceTemplate>(defaultTemplate);

  const updateTemplate = (partial: Partial<InvoiceTemplate>) => {
    setTemplate(prev => ({ ...prev, ...partial }));
  };

  return (
    <InvoiceTemplateContext.Provider value={{ template, setTemplate, updateTemplate }}>
      {children}
    </InvoiceTemplateContext.Provider>
  );
}

export function useInvoiceTemplate() {
  return useContext(InvoiceTemplateContext);
}
