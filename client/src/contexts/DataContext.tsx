// Feeri System - Shared Data Context
// Manages: Emails, Invoices, Journal Entries, Company Profile, HR Data

import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Email {
  id: string;
  type: 'internal' | 'external';
  visibility: 'general' | 'private';
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  module: string; // which module sent it
  attachments?: string[];
  starred: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  companyId: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  companyId: string;
  createdBy: string;
}

export interface CompanyProfile {
  name: string;
  nameEn: string;
  logo: string;
  address: string;
  addressEn: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  commercialReg: string;
  invoiceFooter: string;
  invoiceFooterEn: string;
  primaryColor: string;
  letterheadStyle: 'classic' | 'modern' | 'minimal';
}

export interface LeaveRequest {
  id: string;
  employeeId: number;
  employeeNameAr: string;
  employeeNameEn: string;
  type: 'annual' | 'sick' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  hoursWorked: number;
}

// ─── Default Data ───────────────────────────────────────────────────────────

const defaultProfile: CompanyProfile = {
  name: 'مجموعة فيري القابضة',
  nameEn: 'Feeri Holding Group',
  logo: '/manus-storage/feeri-logo_cb2aa543.jpg',
  address: 'الرياض، المملكة العربية السعودية، حي العليا، شارع الملك فهد',
  addressEn: 'Riyadh, Saudi Arabia, Al-Olaya, King Fahd Road',
  phone: '+966 11 234 5678',
  email: 'info@feeri.com',
  website: 'www.feeri.com',
  taxNumber: '310012345600003',
  commercialReg: '1010123456',
  invoiceFooter: 'شكراً لتعاملكم معنا. جميع الأسعار شاملة ضريبة القيمة المضافة.',
  invoiceFooterEn: 'Thank you for your business. All prices include VAT.',
  primaryColor: '#9333ea',
  letterheadStyle: 'modern',
};

const defaultEmails: Email[] = [
  {
    id: 'e1', type: 'internal', visibility: 'general',
    fromName: 'Sabri Garza ', fromEmail: 'owner@feeri.com',
    toName: 'جميع الموظفين', toEmail: 'all@feeri.com',
    subject: 'اجتماع الربع الثاني 2026',
    body: 'السادة الموظفون الكرام،\n\nيسعدنا دعوتكم لحضور اجتماع مراجعة أداء الربع الثاني يوم الأحد القادم الساعة 10 صباحاً في قاعة الاجتماعات الرئيسية.\n\nمع التحية،\nSabri Garza ',
    date: '2026-04-19T09:00:00', read: true, module: 'general', starred: true,
  },
  {
    id: 'e2', type: 'external', visibility: 'private',
    fromName: 'Sabri Garza ', fromEmail: 'owner@feeri.com',
    toName: 'شركة الأمل', toEmail: 'contact@alamal.com',
    subject: 'عرض سعر - خدمات تقنية',
    body: 'السادة شركة الأمل المحترمين،\n\nيسعدنا تقديم عرض الأسعار المطلوب للخدمات التقنية المتفق عليها.\n\nمع فائق الاحترام،\nSabri Garza \nمجموعة فيري القابضة',
    date: '2026-04-18T14:30:00', read: false, module: 'crm', starred: false,
  },
  {
    id: 'e3', type: 'internal', visibility: 'private',
    fromName: 'Sabri Garza ', fromEmail: 'owner@feeri.com',
    toName: 'رحاب سيدحمد', toEmail: 'manager@feeri.com',
    subject: 'تقرير الأداء الشهري',
    body: 'سارة،\n\nأرجو مراجعة تقرير الأداء الشهري وإرسال ملاحظاتك قبل نهاية الأسبوع.\n\nشكراً',
    date: '2026-04-17T11:00:00', read: true, module: 'hr', starred: false,
  },
  {
    id: 'e4', type: 'external', visibility: 'general',
    fromName: 'Sabri Garza ', fromEmail: 'owner@feeri.com',
    toName: 'عملاء فيري', toEmail: 'clients@feeri.com',
    subject: 'إشعار تحديث الأسعار لعام 2026',
    body: 'عملاءنا الكرام،\n\nنودّ إعلامكم بأن أسعار خدماتنا سيتم تحديثها اعتباراً من مطلع مايو 2026.\n\nمع التقدير،\nإدارة مجموعة فيري',
    date: '2026-04-15T08:00:00', read: true, module: 'general', starred: true,
  },
];

const defaultInvoices: Invoice[] = [
  {
    id: 'inv1', number: 'INV-2026-001', clientName: 'شركة الأمل للتجارة',
    clientEmail: 'billing@alamal.com', clientAddress: 'الرياض، حي النزهة',
    date: '2026-04-01', dueDate: '2026-05-01',
    items: [
      { id: 'i1', description: 'خدمات تطوير البرمجيات', qty: 1, unitPrice: 35000, total: 35000 },
      { id: 'i2', description: 'صيانة وتحديثات شهرية', qty: 3, unitPrice: 5000, total: 15000 },
    ],
    subtotal: 50000, taxRate: 15, taxAmount: 7500, discount: 0, total: 57500,
    status: 'paid', notes: 'شكراً لتعاملكم معنا', companyId: '1',
  },
  {
    id: 'inv2', number: 'INV-2026-002', clientName: 'مجموعة النجم القابضة',
    clientEmail: 'finance@alnajm.com', clientAddress: 'جدة، حي الروضة',
    date: '2026-04-10', dueDate: '2026-05-10',
    items: [
      { id: 'i3', description: 'استشارات إدارية', qty: 10, unitPrice: 8000, total: 80000 },
      { id: 'i4', description: 'تدريب الكوادر', qty: 2, unitPrice: 15000, total: 30000 },
    ],
    subtotal: 110000, taxRate: 15, taxAmount: 16500, discount: 5000, total: 121500,
    status: 'sent' as const, notes: '', companyId: '4',
  },
  {
    id: 'inv3', number: 'INV-2026-003', clientName: 'مؤسسة الريادة',
    clientEmail: 'accounts@riyadah.com', clientAddress: 'الدمام، حي الفيصلية',
    date: '2026-03-15', dueDate: '2026-04-15',
    items: [
      { id: 'i5', description: 'تأجير سيارات فاخرة', qty: 30, unitPrice: 450, total: 13500 },
    ],
    subtotal: 13500, taxRate: 15, taxAmount: 2025, discount: 0, total: 15525,
    status: 'overdue' as const, notes: 'يرجى السداد فوراً', companyId: '3',
  },
];

const defaultJournalEntries: JournalEntry[] = [
  { id: 'j1', date: '2026-04-19', reference: 'JV-001', description: 'إيرادات خدمات تقنية - شركة الأمل', debitAccount: 'الذمم المدينة', creditAccount: 'إيرادات الخدمات', amount: 57500, companyId: '1', createdBy: 'Sabri Garza ' },
  { id: 'j2', date: '2026-04-18', reference: 'JV-002', description: 'رواتب شهر أبريل 2026', debitAccount: 'مصروفات الرواتب', creditAccount: 'البنك الأهلي', amount: 320000, companyId: '1', createdBy: 'فاطمة علي' },
  { id: 'j3', date: '2026-04-17', reference: 'JV-003', description: 'إيجار مكتب الرياض - Q2', debitAccount: 'مصروفات الإيجار', creditAccount: 'النقدية', amount: 25000, companyId: '2', createdBy: 'Sabri Garza ' },
  { id: 'j4', date: '2026-04-16', reference: 'JV-004', description: 'دفعة عقد شراكة - مجموعة النجم', debitAccount: 'البنك الأهلي', creditAccount: 'إيرادات الشراكات', amount: 121500, companyId: '4', createdBy: 'Sabri Garza ' },
  { id: 'j5', date: '2026-04-15', reference: 'JV-005', description: 'صيانة أسطول السيارات', debitAccount: 'مصروفات الصيانة', creditAccount: 'النقدية', amount: 18500, companyId: '3', createdBy: 'خالد عبدالله' },
  { id: 'j6', date: '2026-04-14', reference: 'JV-006', description: 'إيرادات تأجير سيارات - أبريل', debitAccount: 'الذمم المدينة', creditAccount: 'إيرادات التأجير', amount: 35000, companyId: '3', createdBy: 'Sabri Garza ' },
  { id: 'j7', date: '2026-04-13', reference: 'JV-007', description: 'مصاريف تسويق رقمي', debitAccount: 'مصروفات التسويق', creditAccount: 'بطاقة الائتمان', amount: 12000, companyId: '1', createdBy: 'حسين غنيم' },
  { id: 'j8', date: '2026-04-12', reference: 'JV-008', description: 'استشارات قانونية - عقد جديد', debitAccount: 'الذمم المدينة', creditAccount: 'إيرادات الاستشارات', amount: 28000, companyId: '4', createdBy: 'سارة إبراهيم' },
];

const defaultLeaves: LeaveRequest[] = [
  { id: 'l1', employeeId: 5, employeeNameAr: 'حسين غنيم', employeeNameEn: 'Hussein Ghunaim', type: 'annual', startDate: '2026-04-15', endDate: '2026-04-25', days: 10, reason: 'إجازة سنوية', status: 'approved', approvedBy: 'نورة سعد' },
  { id: 'l2', employeeId: 3, employeeNameAr: 'قمرالأنبياء محمد', employeeNameEn: 'Gamer-Alanbiaa Mohammed', type: 'sick', startDate: '2026-04-18', endDate: '2026-04-20', days: 3, reason: 'مرض', status: 'approved', approvedBy: 'نورة سعد' },
  { id: 'l3', employeeId: 4, employeeNameAr: 'أبوبكر محمد ', employeeNameEn: 'Abu-Bakker Mohammed', type: 'emergency', startDate: '2026-04-22', endDate: '2026-04-23', days: 2, reason: 'ظرف طارئ', status: 'pending' },
];

// ─── Context ────────────────────────────────────────────────────────────────

interface DataContextType {
  // Emails
  emails: Email[];
  addEmail: (email: Omit<Email, 'id' | 'date' | 'read' | 'starred'>) => void;
  markEmailRead: (id: string) => void;
  toggleStar: (id: string) => void;
  deleteEmail: (id: string) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  deleteInvoice: (id: string) => void;

  // Journal Entries
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteJournalEntry: (id: string) => void;

  // Company Profile
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;

  // Leaves
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: LeaveRequest['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [emails, setEmails] = useState<Email[]>(defaultEmails);
  const [invoices, setInvoices] = useState<Invoice[]>(defaultInvoices);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(defaultJournalEntries);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultProfile);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(defaultLeaves);

  // Email actions
  const addEmail = useCallback((email: Omit<Email, 'id' | 'date' | 'read' | 'starred'>) => {
    const newEmail: Email = {
      ...email,
      id: `e${Date.now()}`,
      date: new Date().toISOString(),
      read: false,
      starred: false,
    };
    setEmails(prev => [newEmail, ...prev]);
  }, []);

  const markEmailRead = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  }, []);

  const toggleStar = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  }, []);

  const deleteEmail = useCallback((id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
  }, []);

  // Invoice actions
  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'number'>) => {
    const count = invoices.length + 1;
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv${Date.now()}`,
      number: `INV-2026-${String(count).padStart(3, '0')}`,
    };
    setInvoices(prev => [newInvoice, ...prev]);
  }, [invoices.length]);

  const updateInvoiceStatus = useCallback((id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, []);

  // Journal Entry actions
  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = { ...entry, id: `j${Date.now()}` };
    setJournalEntries(prev => [newEntry, ...prev]);
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(j => j.id !== id));
  }, []);

  // Company Profile
  const updateCompanyProfile = useCallback((profile: Partial<CompanyProfile>) => {
    setCompanyProfile(prev => ({ ...prev, ...profile }));
  }, []);

  // Leaves
  const addLeaveRequest = useCallback((req: Omit<LeaveRequest, 'id' | 'status'>) => {
    const newReq: LeaveRequest = { ...req, id: `l${Date.now()}`, status: 'pending' };
    setLeaveRequests(prev => [newReq, ...prev]);
  }, []);

  const updateLeaveStatus = useCallback((id: string, status: LeaveRequest['status']) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }, []);

  return (
    <DataContext.Provider value={{
      emails, addEmail, markEmailRead, toggleStar, deleteEmail,
      invoices, addInvoice, updateInvoiceStatus, deleteInvoice,
      journalEntries, addJournalEntry, deleteJournalEntry,
      companyProfile, updateCompanyProfile,
      leaveRequests, addLeaveRequest, updateLeaveStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
