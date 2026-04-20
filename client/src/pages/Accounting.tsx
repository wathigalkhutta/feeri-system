// Feeri System - Accounting Module (Full)
// Tabs: Overview | Invoices | Create Invoice | Journal Entries | Budget
// Design: Corporate - Light/Dark mode

import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useApp } from '@/contexts/AppContext';
import { useInvoices, useJournalEntries } from '@/hooks/useFeeriData';
import { trpc } from '@/lib/trpc';
import { useState, useMemo } from 'react';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import InvoicePDF, { InvoiceData } from '@/components/InvoicePDF';
import { useInvoiceTemplate } from '@/contexts/InvoiceTemplateContext';
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Search, FileText,
  BookOpen, BarChart3, Printer, Send, Trash2, Eye, CheckCircle,
  Clock, AlertCircle, XCircle, Mail, Download, Edit2, X,
  Landmark, Wallet, Building2, List, Receipt, BookMarked, ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const monthlyData = [
  { month: 'يناير', income: 420000, expenses: 280000 },
  { month: 'فبراير', income: 380000, expenses: 260000 },
  { month: 'مارس', income: 510000, expenses: 310000 },
  { month: 'أبريل', income: 490000, expenses: 295000 },
  { month: 'مايو', income: 560000, expenses: 320000 },
  { month: 'يونيو', income: 620000, expenses: 350000 },
];

const expenseCategories = [
  { nameAr: 'رواتب', nameEn: 'Salaries', value: 320000, color: 'oklch(0.55 0.28 300)' },
  { nameAr: 'إيجار', nameEn: 'Rent', value: 75000, color: 'oklch(0.78 0.18 85)' },
  { nameAr: 'تسويق', nameEn: 'Marketing', value: 45000, color: 'oklch(0.72 0.16 200)' },
  { nameAr: 'صيانة', nameEn: 'Maintenance', value: 38500, color: 'oklch(0.65 0.20 160)' },
  { nameAr: 'أخرى', nameEn: 'Other', value: 52000, color: 'oklch(0.60 0.22 25)' },
];

const accounts = [
  { nameAr: 'الذمم المدينة', nameEn: 'Accounts Receivable', type: 'asset' },
  { nameAr: 'الذمم الدائنة', nameEn: 'Accounts Payable', type: 'liability' },
  { nameAr: 'البنك الأهلي', nameEn: 'Al-Ahli Bank', type: 'asset' },
  { nameAr: 'النقدية', nameEn: 'Cash', type: 'asset' },
  { nameAr: 'بطاقة الائتمان', nameEn: 'Credit Card', type: 'liability' },
  { nameAr: 'إيرادات الخدمات', nameEn: 'Service Revenue', type: 'income' },
  { nameAr: 'إيرادات التأجير', nameEn: 'Rental Revenue', type: 'income' },
  { nameAr: 'إيرادات الاستشارات', nameEn: 'Consulting Revenue', type: 'income' },
  { nameAr: 'إيرادات الشراكات', nameEn: 'Partnership Revenue', type: 'income' },
  { nameAr: 'مصروفات الرواتب', nameEn: 'Salary Expenses', type: 'expense' },
  { nameAr: 'مصروفات الإيجار', nameEn: 'Rent Expenses', type: 'expense' },
  { nameAr: 'مصروفات التسويق', nameEn: 'Marketing Expenses', type: 'expense' },
  { nameAr: 'مصروفات الصيانة', nameEn: 'Maintenance Expenses', type: 'expense' },
];

type Tab = 'overview' | 'invoices' | 'create-invoice' | 'journal' | 'budget' | 'chart-of-accounts' | 'bank-accounts' | 'petty-cash' | 'fixed-assets' | 'general-ledger' | 'vouchers';

const statusConfig: Record<string, { ar: string; en: string; color: string; icon: React.ReactNode }> = {
  paid: { ar: 'مدفوعة', en: 'Paid', color: 'oklch(0.65 0.20 160)', icon: <CheckCircle size={12} /> },
  sent: { ar: 'مُرسلة', en: 'Sent', color: 'oklch(0.72 0.16 200)', icon: <Send size={12} /> },
  draft: { ar: 'مسودة', en: 'Draft', color: 'oklch(0.60 0.01 265)', icon: <Edit2 size={12} /> },
  overdue: { ar: 'متأخرة', en: 'Overdue', color: 'oklch(0.60 0.22 25)', icon: <AlertCircle size={12} /> },
  cancelled: { ar: 'ملغاة', en: 'Cancelled', color: 'oklch(0.55 0.01 265)', icon: <XCircle size={12} /> },
};

// ─── Invoice Creator ─────────────────────────────────────────────────────────
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
type InvoiceItem = { id: string; description: string; qty: number; unitPrice: number; total: number };
type Invoice = { clientName: string; clientEmail: string; clientAddress: string; date: string; dueDate: string; taxRate: number; discount: number; notes: string; items: InvoiceItem[]; status: InvoiceStatus };

function InvoiceCreator({ onBack, editInvoice }: { onBack: () => void; editInvoice?: Invoice }) {
  const { lang } = useApp();
  const { createMutation } = useInvoices(1);
  const companyProfile = { name: 'Feeri Holding', nameEn: 'Feeri Holding', address: '', addressEn: '', phone: '', email: '', logo: '', primaryColor: '#9333ea', invoiceFooter: 'شكراً لتعاملكم معنا', invoiceFooterEn: 'Thank you for your business' };
  const [clientName, setClientName] = useState(editInvoice?.clientName || '');
  const [clientEmail, setClientEmail] = useState(editInvoice?.clientEmail || '');
  const [clientAddress, setClientAddress] = useState(editInvoice?.clientAddress || '');
  const [date, setDate] = useState(editInvoice?.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(editInvoice?.dueDate || '');
  const [taxRate, setTaxRate] = useState(editInvoice?.taxRate || 15);
  const [discount, setDiscount] = useState(editInvoice?.discount || 0);
  const [notes, setNotes] = useState(editInvoice?.notes || '');
  const [items, setItems] = useState<InvoiceItem[]>(editInvoice?.items || [
    { id: '1', description: '', qty: 1, unitPrice: 0, total: 0 }
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'qty' || field === 'unitPrice') {
        updated.total = Number(updated.qty) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const addItem = () => setItems(prev => [...prev, { id: String(Date.now()), description: '', qty: 1, unitPrice: 0, total: 0 }]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  const fmt = (n: number) => n.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US');

  const handleSave = (status: Invoice['status']) => {
    if (!clientName) { toast.error(lang === 'ar' ? 'أدخل اسم العميل' : 'Enter client name'); return; }
    createMutation.mutate({ companyId: 1, number: `INV-${Date.now()}`, clientName, clientEmail, clientAddress, date, dueDate, subtotal: String(subtotal), taxRate: String(taxRate), taxAmount: String(taxAmount), discount: String(discount), total: String(total), status, notes, items: items.map(i => ({ description: i.description, qty: i.qty, unitPrice: String(i.unitPrice), total: String(i.total) })) });
    toast.success(lang === 'ar' ? 'تم حفظ الفاتورة بنجاح ✓' : 'Invoice saved successfully ✓');
    onBack();
  };

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all"
            style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
            ← {lang === 'ar' ? 'رجوع للتعديل' : 'Back to Edit'}
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleSave('draft')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
              {lang === 'ar' ? 'حفظ كمسودة' : 'Save as Draft'}
            </button>
            <button onClick={() => handleSave('sent')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Send size={14} /> {lang === 'ar' ? 'إرسال الفاتورة' : 'Send Invoice'}
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'white', color: '#1a1d2e' }}>
          {/* Header */}
          <div className="p-8 flex items-start justify-between" style={{ background: companyProfile.primaryColor || '#9333ea' }}>
            <div>
              <img src={companyProfile.logo} alt="logo" className="h-12 w-auto mb-3 object-contain" style={{ filter: 'brightness(10)' }} />
              <h1 className="text-2xl font-bold text-white">{lang === 'ar' ? companyProfile.name : companyProfile.nameEn}</h1>
              <p className="text-white/80 text-sm mt-1">{lang === 'ar' ? companyProfile.address : companyProfile.addressEn}</p>
              <p className="text-white/80 text-sm">{companyProfile.phone} | {companyProfile.email}</p>
            </div>
            <div className="text-right text-white">
              <h2 className="text-3xl font-black">{lang === 'ar' ? 'فاتورة' : 'INVOICE'}</h2>
              <p className="text-white/80 text-sm mt-1">{lang === 'ar' ? 'رقم الفاتورة:' : 'Invoice #:'} <strong>INV-2026-NEW</strong></p>
              <p className="text-white/80 text-sm">{lang === 'ar' ? 'التاريخ:' : 'Date:'} {date}</p>
              <p className="text-white/80 text-sm">{lang === 'ar' ? 'الاستحقاق:' : 'Due:'} {dueDate}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="px-8 py-5 border-b" style={{ borderColor: '#e5e7eb' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>
              {lang === 'ar' ? 'فاتورة إلى' : 'Bill To'}
            </p>
            <p className="font-bold text-base">{clientName || (lang === 'ar' ? 'اسم العميل' : 'Client Name')}</p>
            <p className="text-sm" style={{ color: '#6b7280' }}>{clientEmail}</p>
            <p className="text-sm" style={{ color: '#6b7280' }}>{clientAddress}</p>
          </div>

          {/* Items Table */}
          <div className="px-8 py-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {[lang === 'ar' ? 'الوصف' : 'Description', lang === 'ar' ? 'الكمية' : 'Qty', lang === 'ar' ? 'السعر' : 'Unit Price', lang === 'ar' ? 'الإجمالي' : 'Total'].map(h => (
                    <th key={h} className="text-start px-3 py-2 text-xs font-semibold" style={{ color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td className="px-3 py-2.5">{item.description}</td>
                    <td className="px-3 py-2.5 text-center">{item.qty}</td>
                    <td className="px-3 py-2.5">{fmt(item.unitPrice)} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    <td className="px-3 py-2.5 font-medium">{fmt(item.total)} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 pb-5 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm"><span style={{ color: '#6b7280' }}>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span><span>{fmt(subtotal)} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span style={{ color: '#6b7280' }}>{lang === 'ar' ? 'الخصم' : 'Discount'}</span><span style={{ color: '#ef4444' }}>- {fmt(discount)} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>}
              <div className="flex justify-between text-sm"><span style={{ color: '#6b7280' }}>{lang === 'ar' ? `ضريبة القيمة المضافة (${taxRate}%)` : `VAT (${taxRate}%)`}</span><span>{fmt(taxAmount)} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span style={{ color: companyProfile.primaryColor || '#9333ea' }}>{fmt(total)} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          {notes && <div className="px-8 py-4 border-t text-sm" style={{ borderColor: '#e5e7eb', color: '#6b7280' }}><strong>{lang === 'ar' ? 'ملاحظات: ' : 'Notes: '}</strong>{notes}</div>}
          <div className="px-8 py-4 text-center text-xs" style={{ background: '#f9fafb', color: '#9ca3af' }}>
            {lang === 'ar' ? companyProfile.invoiceFooter : companyProfile.invoiceFooterEn}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all"
          style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
          ← {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <div className="flex gap-2">
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'oklch(0.72 0.16 200 / 0.15)', color: 'oklch(0.72 0.16 200)', border: '1px solid oklch(0.72 0.16 200 / 0.3)' }}>
            <Eye size={14} /> {lang === 'ar' ? 'معاينة' : 'Preview'}
          </button>
          <button onClick={() => handleSave('draft')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
            {lang === 'ar' ? 'حفظ كمسودة' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave('sent')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
            <Send size={14} /> {lang === 'ar' ? 'إرسال' : 'Send'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Client Info */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'بيانات العميل' : 'Client Information'}
          </h3>
          {[
            { label: lang === 'ar' ? 'اسم العميل *' : 'Client Name *', value: clientName, setter: setClientName, placeholder: lang === 'ar' ? 'اسم الشركة أو الشخص' : 'Company or person name' },
            { label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', value: clientEmail, setter: setClientEmail, placeholder: 'email@example.com' },
            { label: lang === 'ar' ? 'العنوان' : 'Address', value: clientAddress, setter: setClientAddress, placeholder: lang === 'ar' ? 'المدينة، الحي' : 'City, District' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{f.label}</label>
              <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
          ))}
        </div>

        {/* Invoice Details */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice Details'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'نسبة الضريبة %' : 'Tax Rate %'}</label>
              <input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} min={0} max={100}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الخصم (ر.س)' : 'Discount (SAR)'}</label>
              <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} min={0}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--feeri-border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'بنود الفاتورة' : 'Invoice Items'}
          </h3>
          <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)' }}>
            <Plus size={12} /> {lang === 'ar' ? 'إضافة بند' : 'Add Item'}
          </button>
        </div>
        <div className="p-4 space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium px-2 mb-1" style={{ color: 'var(--feeri-text-faint)' }}>
            <span className="col-span-5">{lang === 'ar' ? 'الوصف' : 'Description'}</span>
            <span className="col-span-2 text-center">{lang === 'ar' ? 'الكمية' : 'Qty'}</span>
            <span className="col-span-2 text-center">{lang === 'ar' ? 'السعر' : 'Price'}</span>
            <span className="col-span-2 text-center">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
            <span className="col-span-1" />
          </div>
          {items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                placeholder={lang === 'ar' ? 'وصف الخدمة أو المنتج' : 'Service or product description'}
                className="col-span-5 px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} min={1}
                className="col-span-2 px-2 py-2 rounded-lg text-xs outline-none text-center"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              <input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} min={0}
                className="col-span-2 px-2 py-2 rounded-lg text-xs outline-none text-center"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              <div className="col-span-2 text-center text-xs font-semibold" style={{ color: 'oklch(0.55 0.28 300)' }}>
                {item.total.toLocaleString()}
              </div>
              <button onClick={() => removeItem(item.id)} className="col-span-1 flex justify-center p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                <X size={13} style={{ color: 'oklch(0.60 0.22 25)' }} />
              </button>
            </div>
          ))}
        </div>
        {/* Summary */}
        <div className="flex justify-end px-5 py-4 border-t" style={{ borderColor: 'var(--feeri-border)' }}>
          <div className="w-56 space-y-2 text-sm">
            <div className="flex justify-between"><span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span><span style={{ color: 'var(--feeri-text-primary)' }}>{subtotal.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>
            {discount > 0 && <div className="flex justify-between"><span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الخصم' : 'Discount'}</span><span style={{ color: 'oklch(0.60 0.22 25)' }}>-{discount.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? `ضريبة ${taxRate}%` : `Tax ${taxRate}%`}</span><span style={{ color: 'var(--feeri-text-primary)' }}>{taxAmount.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t" style={{ borderColor: 'var(--feeri-border)', color: 'oklch(0.55 0.28 300)' }}>
              <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span>{total.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Journal Entry Form ───────────────────────────────────────────────────────
function JournalEntryForm({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const { createMutation } = useJournalEntries(1);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], reference: '', description: '', debitAccount: '', creditAccount: '', amount: 0 });

  const handleSave = () => {
    if (!form.description || !form.debitAccount || !form.creditAccount || !form.amount) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Fill all fields'); return;
    }
    createMutation.mutate({ companyId: 1, date: form.date, description: form.description, debitAccount: form.debitAccount, creditAccount: form.creditAccount, amount: String(form.amount), reference: form.reference });
    toast.success(lang === 'ar' ? 'تم حفظ القيد اليومي ✓' : 'Journal entry saved ✓');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'قيد يومي جديد' : 'New Journal Entry'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--feeri-text-muted)' }}><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المرجع' : 'Reference'}</label>
              <input value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} placeholder="JV-XXX"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الوصف *' : 'Description *'}</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder={lang === 'ar' ? 'وصف القيد المحاسبي' : 'Journal entry description'}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'oklch(0.65 0.20 160)' }}>{lang === 'ar' ? 'حساب المدين (Debit) *' : 'Debit Account *'}</label>
              <select value={form.debitAccount} onChange={e => setForm(p => ({ ...p, debitAccount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid oklch(0.65 0.20 160 / 0.4)', color: 'var(--feeri-text-primary)' }}>
                <option value="">{lang === 'ar' ? 'اختر الحساب' : 'Select account'}</option>
                {accounts.map(a => <option key={a.nameAr} value={lang === 'ar' ? a.nameAr : a.nameEn}>{lang === 'ar' ? a.nameAr : a.nameEn}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'oklch(0.60 0.22 25)' }}>{lang === 'ar' ? 'حساب الدائن (Credit) *' : 'Credit Account *'}</label>
              <select value={form.creditAccount} onChange={e => setForm(p => ({ ...p, creditAccount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid oklch(0.60 0.22 25 / 0.4)', color: 'var(--feeri-text-primary)' }}>
                <option value="">{lang === 'ar' ? 'اختر الحساب' : 'Select account'}</option>
                {accounts.map(a => <option key={a.nameAr} value={lang === 'ar' ? a.nameAr : a.nameEn}>{lang === 'ar' ? a.nameAr : a.nameEn}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المبلغ (ر.س) *' : 'Amount (SAR) *'}</label>
            <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} min={0}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              {lang === 'ar' ? 'حفظ القيد' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Accounting() {
  const { t, lang } = useApp();
  const { invoices: rawInvoices, updateStatusMutation, deleteMutation: deleteInvoiceMutation } = useInvoices(1);
  const { entries: rawEntries, deleteMutation: deleteJournalMutation } = useJournalEntries(1);
  const { template } = useInvoiceTemplate();
  // Map DB rows to UI shape
  const invoices = rawInvoices.map((inv: Record<string, unknown>) => ({
    id: String(inv.id),
    number: String(inv.number || ''),
    clientName: String(inv.clientName || ''),
    clientEmail: String(inv.clientEmail || ''),
    clientAddress: String(inv.clientAddress || ''),
    date: inv.date instanceof Date ? inv.date.toISOString().split('T')[0] : String(inv.date || ''),
    dueDate: inv.dueDate instanceof Date ? inv.dueDate.toISOString().split('T')[0] : String(inv.dueDate || ''),
    subtotal: Number(inv.subtotal || 0),
    taxRate: Number(inv.taxRate || 0),
    taxAmount: Number(inv.taxAmount || 0),
    discount: Number(inv.discount || 0),
    total: Number(inv.total || 0),
    status: (inv.status as string) || 'draft',
    notes: String(inv.notes || ''),
    items: [],
  }));
  const journalEntries = rawEntries.map((e: Record<string, unknown>) => ({
    id: String(e.id),
    date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date || ''),
    description: String(e.description || ''),
    debitAccount: String(e.debitAccount || ''),
    creditAccount: String(e.creditAccount || ''),
    amount: Number(e.amount || 0),
    reference: String(e.reference || ''),
  }));
  const updateInvoiceStatus = (id: string, status: string) => updateStatusMutation.mutate({ id: Number(id), status: status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' });
  const deleteInvoice = (id: string) => deleteInvoiceMutation.mutate({ id: Number(id) });
  const deleteJournalEntry = (id: string) => deleteJournalMutation.mutate({ id: Number(id) });
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [pdfInvoice, setPdfInvoice] = useState<InvoiceData | null>(null);

  // ─── New Accounting Modules ────────────────────────────────────────────────
  const companyIdInput = useMemo(() => ({ companyId: 1 }), []);
  const { data: chartAccounts = [], refetch: refetchChart } = trpc.chartOfAccounts.list.useQuery(companyIdInput);
  const { data: bankAccountsList = [], refetch: refetchBanks } = trpc.bankAccounts.list.useQuery(companyIdInput);
  const { data: pettyCashList = [], refetch: refetchPetty } = trpc.pettyCash.list.useQuery(companyIdInput);
  const { data: fixedAssetsList = [], refetch: refetchAssets } = trpc.fixedAssets.list.useQuery(companyIdInput);

  const createChartAccount = trpc.chartOfAccounts.create.useMutation({ onSuccess: () => { refetchChart(); toast.success(lang === 'ar' ? 'تم إضافة الحساب' : 'Account added'); } });
  const deleteChartAccount = trpc.chartOfAccounts.delete.useMutation({ onSuccess: () => { refetchChart(); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); } });
  const createBankAccount = trpc.bankAccounts.create.useMutation({ onSuccess: () => { refetchBanks(); toast.success(lang === 'ar' ? 'تم إضافة الحساب البنكي' : 'Bank account added'); } });
  const deleteBankAccount = trpc.bankAccounts.delete.useMutation({ onSuccess: () => { refetchBanks(); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); } });
  const createPettyCashEntry = trpc.pettyCash.create.useMutation({ onSuccess: () => { refetchPetty(); toast.success(lang === 'ar' ? 'تم إضافة العهدة' : 'Entry added'); } });
  const deletePettyCashEntry = trpc.pettyCash.delete.useMutation({ onSuccess: () => { refetchPetty(); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); } });
  const createFixedAsset = trpc.fixedAssets.create.useMutation({ onSuccess: () => { refetchAssets(); toast.success(lang === 'ar' ? 'تم إضافة الأصل' : 'Asset added'); } });
  const deleteFixedAsset = trpc.fixedAssets.delete.useMutation({ onSuccess: () => { refetchAssets(); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); } });

  // ─── Vouchers ───────────────────────────────────────────────────────────────────────────────────
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<'all' | 'receipt' | 'payment'>('all');
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [voucherFormType, setVoucherFormType] = useState<'receipt' | 'payment'>('receipt');
  const voucherQueryInput = useMemo(() => ({ companyId: 1 }), []);
  const { data: vouchersList = [], refetch: refetchVouchers } = trpc.vouchers.list.useQuery(voucherQueryInput);
  const { data: nextReceiptNum } = trpc.vouchers.getNextNumber.useQuery(useMemo(() => ({ companyId: 1, type: 'receipt' as const }), []));
  const { data: nextPaymentNum } = trpc.vouchers.getNextNumber.useQuery(useMemo(() => ({ companyId: 1, type: 'payment' as const }), []));
  const [voucherForm, setVoucherForm] = useState({
    payeeName: '', account: '', amount: '', description: '',
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'check' | 'other',
    referenceNumber: '', notes: '',
    date: new Date().toISOString().split('T')[0],
    payeeType: 'other' as 'client' | 'employee' | 'supplier' | 'other',
  });
  const createVoucher = trpc.vouchers.create.useMutation({
    onSuccess: () => { refetchVouchers(); setShowVoucherForm(false); toast.success(lang === 'ar' ? 'تم إنشاء السند' : 'Voucher created'); }
  });
  const updateVoucherStatus = trpc.vouchers.update.useMutation({ onSuccess: () => refetchVouchers() });
  const deleteVoucher = trpc.vouchers.delete.useMutation({ onSuccess: () => { refetchVouchers(); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); } });

  // ─── General Ledger ───────────────────────────────────────────────────────────────────────────────────
  const [ledgerAccountFilter, setLedgerAccountFilter] = useState('');
  const [ledgerDateFrom, setLedgerDateFrom] = useState('');
  const [ledgerDateTo, setLedgerDateTo] = useState('');
  const ledgerInput = useMemo(() => ({
    companyId: 1,
    account: ledgerAccountFilter || undefined,
    dateFrom: ledgerDateFrom || undefined,
    dateTo: ledgerDateTo || undefined,
  }), [ledgerAccountFilter, ledgerDateFrom, ledgerDateTo]);
  const { data: ledgerEntries = [] } = trpc.generalLedger.getEntries.useQuery(ledgerInput);
  const { data: ledgerSummary = [] } = trpc.generalLedger.getAccountSummary.useQuery(useMemo(() => ({ companyId: 1 }), []));

  // Form states for new modules
  const [showChartForm, setShowChartForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showPettyForm, setShowPettyForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [chartForm, setChartForm] = useState({ code: '', nameAr: '', nameEn: '', type: 'asset' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' });
  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '', iban: '', currency: 'SAR', balance: '0', type: 'current' as 'current' | 'savings' | 'investment' });
  const [pettyForm, setPettyForm] = useState({ employeeName: '', type: 'petty_cash' as 'petty_cash' | 'advance' | 'expense', amount: '', purpose: '', date: new Date().toISOString().split('T')[0] });
  const [assetForm, setAssetForm] = useState({ nameAr: '', nameEn: '', category: '', purchaseDate: new Date().toISOString().split('T')[0], purchaseCost: '', usefulLife: 5, depreciationRate: '20' });

  const openPDF = (inv: typeof invoices[0]) => {
    setPdfInvoice({
      id: inv.id,
      number: inv.number,
      date: inv.date,
      dueDate: inv.dueDate || '',
      clientName: inv.clientName,
      clientAddress: inv.clientAddress,
      clientEmail: inv.clientEmail,
      items: (inv.items as { description: string; qty: number; unitPrice: number }[]).map(i => ({ description: i.description, qty: i.qty, unitPrice: i.unitPrice })),
      notes: inv.notes,
      currency: lang === 'ar' ? 'ر.س' : 'SAR',
    });
  };

  const totalIncome = 490000;
  const totalExpenses = 295000;
  const balance = totalIncome - totalExpenses;
  const pendingInvoices = invoices.filter(i => i.status === 'sent').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const tabs = [
    { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: <BarChart3 size={14} /> },
    { id: 'invoices', labelAr: 'الفواتير', labelEn: 'Invoices', icon: <FileText size={14} /> },
    { id: 'create-invoice', labelAr: 'إنشاء فاتورة', labelEn: 'Create Invoice', icon: <Plus size={14} /> },
    { id: 'journal', labelAr: 'القيود اليومية', labelEn: 'Journal Entries', icon: <BookOpen size={14} /> },
    { id: 'budget', labelAr: 'الميزانية', labelEn: 'Budget', icon: <TrendingUp size={14} /> },
    { id: 'chart-of-accounts', labelAr: 'شجرة الحسابات', labelEn: 'Chart of Accounts', icon: <List size={14} /> },
    { id: 'bank-accounts', labelAr: 'البنوك', labelEn: 'Bank Accounts', icon: <Landmark size={14} /> },
    { id: 'petty-cash', labelAr: 'العهد والسلف', labelEn: 'Petty Cash', icon: <Wallet size={14} /> },
    { id: 'fixed-assets', labelAr: 'الأصول الثابتة', labelEn: 'Fixed Assets', icon: <Building2 size={14} /> },
    { id: 'vouchers', labelAr: 'سندات القبض والصرف', labelEn: 'Vouchers', icon: <Receipt size={14} /> },
    { id: 'general-ledger', labelAr: 'دفتر الأستاذ', labelEn: 'General Ledger', icon: <BookMarked size={14} /> },
  ] as const;

  return (
    <Layout
      title={t('accounting')}
      subtitle={lang === 'ar' ? 'الإيرادات والمصروفات والفواتير والقيود المحاسبية' : 'Revenue, expenses, invoices and journal entries'}
    >
      {/* Email Modals */}
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="accounting" />
      <EmailInbox isOpen={showEmailInbox} onClose={() => setShowEmailInbox(false)} module="accounting" />
      {showJournalForm && <JournalEntryForm onClose={() => setShowJournalForm(false)} />}
      {pdfInvoice && <InvoicePDF isOpen={!!pdfInvoice} onClose={() => setPdfInvoice(null)} invoice={pdfInvoice} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'} value={totalIncome} prefix={t('currency')} trend={12} icon={<TrendingUp size={20} />} accentColor="green" />
        <StatCard title={lang === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'} value={totalExpenses} prefix={t('currency')} trend={-5} icon={<TrendingDown size={20} />} accentColor="red" />
        <StatCard title={t('balance')} value={balance} prefix={t('currency')} trend={18} icon={<DollarSign size={20} />} accentColor="purple" />
        <StatCard title={lang === 'ar' ? 'فواتير معلقة' : 'Pending Invoices'} value={pendingInvoices + overdueInvoices} icon={<FileText size={20} />} accentColor="yellow" />
      </div>

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'oklch(0.55 0.28 300)' : 'var(--feeri-bg-elevated)',
                color: activeTab === tab.id ? 'white' : 'var(--feeri-text-muted)',
                border: `1px solid ${activeTab === tab.id ? 'transparent' : 'var(--feeri-border)'}`,
              }}>
              {tab.icon}
              {lang === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEmailInbox(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
            <Mail size={13} /> {lang === 'ar' ? 'البريد' : 'Inbox'}
          </button>
          <button onClick={() => setShowEmailComposer(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
            <Send size={13} /> {lang === 'ar' ? 'إرسال إيميل' : 'Send Email'}
          </button>
        </div>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Revenue vs Expenses Chart */}
            <div className="lg:col-span-2 rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
                {lang === 'ar' ? 'الإيرادات مقابل المصروفات' : 'Revenue vs Expenses'}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--feeri-border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--feeri-text-faint)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--feeri-text-faint)', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ${lang === 'ar' ? 'ر.س' : 'SAR'}`, '']} contentStyle={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)', borderRadius: '8px' }} />
                  <Bar dataKey="income" fill="oklch(0.65 0.20 160)" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'الإيرادات' : 'Revenue'} />
                  <Bar dataKey="expenses" fill="oklch(0.60 0.22 25)" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'المصروفات' : 'Expenses'} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Breakdown */}
            <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
                {lang === 'ar' ? 'توزيع المصروفات' : 'Expense Breakdown'}
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {expenseCategories.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ${lang === 'ar' ? 'ر.س' : 'SAR'}`, '']} contentStyle={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {expenseCategories.map(e => (
                  <div key={e.nameAr} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                      <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? e.nameAr : e.nameEn}</span>
                    </div>
                    <span style={{ color: 'var(--feeri-text-primary)' }}>{e.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { labelAr: 'إجمالي الفواتير', labelEn: 'Total Invoices', value: invoices.length, color: 'oklch(0.55 0.28 300)' },
              { labelAr: 'مدفوعة', labelEn: 'Paid', value: invoices.filter(i => i.status === 'paid').length, color: 'oklch(0.65 0.20 160)' },
              { labelAr: 'معلقة', labelEn: 'Pending', value: invoices.filter(i => i.status === 'sent').length, color: 'oklch(0.78 0.18 85)' },
              { labelAr: 'متأخرة', labelEn: 'Overdue', value: invoices.filter(i => i.status === 'overdue').length, color: 'oklch(0.60 0.22 25)' },
            ].map(s => (
              <div key={s.labelAr} className="rounded-xl p-4 text-center" style={{ background: 'var(--feeri-bg-card)', border: `1px solid ${s.color}33` }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? s.labelAr : s.labelEn}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Invoices Tab ── */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--feeri-text-faint)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث في الفواتير...' : 'Search invoices...'}
                className="w-full ps-9 pe-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
              <option value="all">{lang === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
              <option value="paid">{lang === 'ar' ? 'مدفوعة' : 'Paid'}</option>
              <option value="sent">{lang === 'ar' ? 'مُرسلة' : 'Sent'}</option>
              <option value="draft">{lang === 'ar' ? 'مسودة' : 'Draft'}</option>
              <option value="overdue">{lang === 'ar' ? 'متأخرة' : 'Overdue'}</option>
            </select>
            <button onClick={() => setActiveTab('create-invoice')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={14} /> {lang === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}
            </button>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
                  {[lang === 'ar' ? 'رقم الفاتورة' : 'Invoice #', lang === 'ar' ? 'العميل' : 'Client', lang === 'ar' ? 'التاريخ' : 'Date', lang === 'ar' ? 'الاستحقاق' : 'Due', lang === 'ar' ? 'المبلغ' : 'Amount', lang === 'ar' ? 'الحالة' : 'Status', lang === 'ar' ? 'إجراءات' : 'Actions'].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--feeri-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => {
                  const sc = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="transition-colors hover:bg-white/3" style={{ borderBottom: '1px solid var(--feeri-border-subtle)' }}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold" style={{ color: 'oklch(0.55 0.28 300)' }}>{inv.number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>{inv.clientName}</p>
                        <p className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{inv.clientEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{inv.date}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: inv.status === 'overdue' ? 'oklch(0.60 0.22 25)' : 'var(--feeri-text-muted)' }}>{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold" style={{ color: 'var(--feeri-text-primary)' }}>{inv.total.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs w-fit" style={{ background: sc.color + '22', color: sc.color }}>
                          {sc.icon} {lang === 'ar' ? sc.ar : sc.en}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {inv.status !== 'paid' && (
                            <button onClick={() => { updateInvoiceStatus(inv.id, 'paid'); toast.success(lang === 'ar' ? 'تم تحديد الفاتورة كمدفوعة' : 'Invoice marked as paid'); }}
                              className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors" title={lang === 'ar' ? 'تحديد كمدفوعة' : 'Mark as paid'}>
                              <CheckCircle size={13} style={{ color: 'oklch(0.65 0.20 160)' }} />
                            </button>
                          )}
                          <button onClick={() => openPDF(inv)} className="p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors" title={lang === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}>
                            <Printer size={13} style={{ color: 'oklch(0.55 0.28 300)' }} />
                          </button>
                          <button onClick={() => { setShowEmailComposer(true); }} className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors" title={lang === 'ar' ? 'إرسال بالإيميل' : 'Send by email'}>
                            <Send size={13} style={{ color: 'oklch(0.72 0.16 200)' }} />
                          </button>
                          <button onClick={() => { deleteInvoice(inv.id); toast.success(lang === 'ar' ? 'تم حذف الفاتورة' : 'Invoice deleted'); }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                            <Trash2 size={13} style={{ color: 'oklch(0.60 0.22 25)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <FileText size={32} style={{ color: 'var(--feeri-text-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'لا توجد فواتير' : 'No invoices found'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create Invoice Tab ── */}
      {activeTab === 'create-invoice' && (
        <InvoiceCreator onBack={() => setActiveTab('invoices')} />
      )}

      {/* ── Journal Entries Tab ── */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
              {lang === 'ar' ? `${journalEntries.length} قيد محاسبي` : `${journalEntries.length} journal entries`}
            </p>
            <button onClick={() => setShowJournalForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={14} /> {lang === 'ar' ? 'قيد جديد' : 'New Entry'}
            </button>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
                  {[lang === 'ar' ? 'التاريخ' : 'Date', lang === 'ar' ? 'المرجع' : 'Ref', lang === 'ar' ? 'الوصف' : 'Description', lang === 'ar' ? 'مدين' : 'Debit', lang === 'ar' ? 'دائن' : 'Credit', lang === 'ar' ? 'المبلغ' : 'Amount', ''].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--feeri-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {journalEntries.map(entry => (
                  <tr key={entry.id} className="transition-colors hover:bg-white/3" style={{ borderBottom: '1px solid var(--feeri-border-subtle)' }}>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{entry.date}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs" style={{ color: 'oklch(0.55 0.28 300)' }}>{entry.reference || '—'}</span></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-primary)' }}>{entry.description}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.65 0.20 160 / 0.15)', color: 'oklch(0.65 0.20 160)' }}>
                        {entry.debitAccount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.60 0.22 25 / 0.15)', color: 'oklch(0.60 0.22 25)' }}>
                        {entry.creditAccount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--feeri-text-primary)' }}>
                      {entry.amount.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { deleteJournalEntry(entry.id); toast.success(lang === 'ar' ? 'تم حذف القيد' : 'Entry deleted'); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                        <Trash2 size={13} style={{ color: 'oklch(0.60 0.22 25)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Journal Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: 'oklch(0.65 0.20 160 / 0.08)', border: '1px solid oklch(0.65 0.20 160 / 0.2)' }}>
              <p className="text-xs mb-1" style={{ color: 'oklch(0.65 0.20 160)' }}>{lang === 'ar' ? 'إجمالي المدين' : 'Total Debit'}</p>
              <p className="text-xl font-black" style={{ color: 'oklch(0.65 0.20 160)' }}>
                {journalEntries.reduce((s: number, e: { amount: number }) => s + e.amount, 0).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'oklch(0.60 0.22 25 / 0.08)', border: '1px solid oklch(0.60 0.22 25 / 0.2)' }}>
              <p className="text-xs mb-1" style={{ color: 'oklch(0.60 0.22 25)' }}>{lang === 'ar' ? 'إجمالي الدائن' : 'Total Credit'}</p>
              <p className="text-xl font-black" style={{ color: 'oklch(0.60 0.22 25)' }}>
                {journalEntries.reduce((s: number, e: { amount: number }) => s + e.amount, 0).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Budget Tab ── */}
      {activeTab === 'budget' && (
        <div className="space-y-5">
          <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'الميزانية التقديرية مقابل الفعلية - 2026' : 'Budget vs Actual - 2026'}
            </h3>
            <div className="space-y-4">
              {[
                { labelAr: 'الرواتب والأجور', labelEn: 'Salaries & Wages', budget: 400000, actual: 320000, color: 'oklch(0.55 0.28 300)' },
                { labelAr: 'الإيجارات', labelEn: 'Rent', budget: 90000, actual: 75000, color: 'oklch(0.78 0.18 85)' },
                { labelAr: 'التسويق والإعلان', labelEn: 'Marketing', budget: 60000, actual: 45000, color: 'oklch(0.72 0.16 200)' },
                { labelAr: 'الصيانة والتشغيل', labelEn: 'Maintenance', budget: 50000, actual: 38500, color: 'oklch(0.65 0.20 160)' },
                { labelAr: 'مصاريف إدارية', labelEn: 'Admin Expenses', budget: 40000, actual: 52000, color: 'oklch(0.60 0.22 25)' },
              ].map(item => {
                const pct = Math.min((item.actual / item.budget) * 100, 100);
                const over = item.actual > item.budget;
                return (
                  <div key={item.labelAr}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الميزانية:' : 'Budget:'} {item.budget.toLocaleString()}</span>
                        <span style={{ color: over ? 'oklch(0.60 0.22 25)' : 'oklch(0.65 0.20 160)', fontWeight: 600 }}>
                          {lang === 'ar' ? 'الفعلي:' : 'Actual:'} {item.actual.toLocaleString()}
                          {over && <span className="ms-1">⚠</span>}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--feeri-bg-elevated)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: over ? 'oklch(0.60 0.22 25)' : item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Area Chart */}
          <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'تطور الإيرادات والمصروفات' : 'Revenue & Expenses Trend'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.20 160)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.20 160)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.60 0.22 25)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.60 0.22 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--feeri-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--feeri-text-faint)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--feeri-text-faint)', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="income" stroke="oklch(0.65 0.20 160)" fill="url(#incomeGrad)" strokeWidth={2} name={lang === 'ar' ? 'الإيرادات' : 'Revenue'} />
                <Area type="monotone" dataKey="expenses" stroke="oklch(0.60 0.22 25)" fill="url(#expGrad)" strokeWidth={2} name={lang === 'ar' ? 'المصروفات' : 'Expenses'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Chart of Accounts Tab ── */}
      {activeTab === 'chart-of-accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'شجرة الحسابات' : 'Chart of Accounts'}
            </h3>
            <button onClick={() => setShowChartForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={13} /> {lang === 'ar' ? 'إضافة حساب' : 'Add Account'}
            </button>
          </div>

          {showChartForm && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'رمز الحساب *' : 'Account Code *'}</label>
                  <input value={chartForm.code} onChange={e => setChartForm(p => ({ ...p, code: e.target.value }))} placeholder="1001"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'نوع الحساب *' : 'Account Type *'}</label>
                  <select value={chartForm.type} onChange={e => setChartForm(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
                    <option value="asset">{lang === 'ar' ? 'أصول' : 'Asset'}</option>
                    <option value="liability">{lang === 'ar' ? 'خصوم' : 'Liability'}</option>
                    <option value="equity">{lang === 'ar' ? 'حقوق ملكية' : 'Equity'}</option>
                    <option value="revenue">{lang === 'ar' ? 'إيرادات' : 'Revenue'}</option>
                    <option value="expense">{lang === 'ar' ? 'مصروفات' : 'Expense'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'اسم الحساب (عربي) *' : 'Account Name (AR) *'}</label>
                  <input value={chartForm.nameAr} onChange={e => setChartForm(p => ({ ...p, nameAr: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'اسم الحساب (إنجليزي)' : 'Account Name (EN)'}</label>
                  <input value={chartForm.nameEn} onChange={e => setChartForm(p => ({ ...p, nameEn: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowChartForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={() => { if (!chartForm.code || !chartForm.nameAr) return; createChartAccount.mutate({ companyId: 1, ...chartForm }); setShowChartForm(false); setChartForm({ code: '', nameAr: '', nameEn: '', type: 'asset' }); }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                  {lang === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--feeri-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--feeri-bg-elevated)' }}>
                  <th className="px-4 py-3 text-start text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'رمز' : 'Code'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'اسم الحساب' : 'Account Name'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'النوع' : 'Type'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الرصيد' : 'Balance'}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}></th>
                </tr>
              </thead>
              <tbody>
                {chartAccounts.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'لا توجد حسابات بعد' : 'No accounts yet'}</td></tr>
                ) : chartAccounts.map((acc: any) => (
                  <tr key={acc.id} style={{ borderTop: '1px solid var(--feeri-border)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{acc.code}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? acc.nameAr : (acc.nameEn || acc.nameAr)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: acc.type === 'asset' ? 'oklch(0.72 0.16 200 / 0.15)' : acc.type === 'revenue' ? 'oklch(0.65 0.20 160 / 0.15)' : acc.type === 'expense' ? 'oklch(0.60 0.22 25 / 0.15)' : 'oklch(0.55 0.28 300 / 0.15)', color: acc.type === 'asset' ? 'oklch(0.72 0.16 200)' : acc.type === 'revenue' ? 'oklch(0.65 0.20 160)' : acc.type === 'expense' ? 'oklch(0.60 0.22 25)' : 'oklch(0.55 0.28 300)' }}>
                        {acc.type === 'asset' ? (lang === 'ar' ? 'أصول' : 'Asset') : acc.type === 'liability' ? (lang === 'ar' ? 'خصوم' : 'Liability') : acc.type === 'equity' ? (lang === 'ar' ? 'حقوق ملكية' : 'Equity') : acc.type === 'revenue' ? (lang === 'ar' ? 'إيرادات' : 'Revenue') : (lang === 'ar' ? 'مصروفات' : 'Expense')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>{Number(acc.balance || 0).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteChartAccount.mutate({ id: acc.id })} className="p-1 rounded hover:opacity-70"><Trash2 size={13} style={{ color: 'oklch(0.60 0.22 25)' }} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Bank Accounts Tab ── */}
      {activeTab === 'bank-accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'حسابات البنوك' : 'Bank Accounts'}
            </h3>
            <button onClick={() => setShowBankForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={13} /> {lang === 'ar' ? 'إضافة حساب' : 'Add Account'}
            </button>
          </div>

          {showBankForm && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <div className="grid grid-cols-2 gap-3">
                {[{ key: 'bankName', labelAr: 'اسم البنك *', labelEn: 'Bank Name *' }, { key: 'accountName', labelAr: 'اسم الحساب *', labelEn: 'Account Name *' }, { key: 'accountNumber', labelAr: 'رقم الحساب *', labelEn: 'Account Number *' }, { key: 'iban', labelAr: 'رقم آيبان', labelEn: 'IBAN' }, { key: 'balance', labelAr: 'الرصيد', labelEn: 'Balance' }, { key: 'currency', labelAr: 'العملة', labelEn: 'Currency' }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? f.labelAr : f.labelEn}</label>
                    <input value={(bankForm as any)[f.key]} onChange={e => setBankForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowBankForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={() => { if (!bankForm.bankName || !bankForm.accountName || !bankForm.accountNumber) return; createBankAccount.mutate({ companyId: 1, ...bankForm }); setShowBankForm(false); setBankForm({ bankName: '', accountName: '', accountNumber: '', iban: '', currency: 'SAR', balance: '0', type: 'current' }); }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>{lang === 'ar' ? 'حفظ' : 'Save'}</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccountsList.length === 0 ? (
              <div className="col-span-3 rounded-xl p-8 text-center" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
                <Landmark size={32} className="mx-auto mb-2" style={{ color: 'var(--feeri-text-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'لا توجد حسابات بنكية بعد' : 'No bank accounts yet'}</p>
              </div>
            ) : bankAccountsList.map((bank: any) => (
              <div key={bank.id} className="rounded-xl p-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.55 0.28 300 / 0.15)' }}>
                    <Landmark size={18} style={{ color: 'oklch(0.55 0.28 300)' }} />
                  </div>
                  <button onClick={() => deleteBankAccount.mutate({ id: bank.id })} className="p-1 rounded hover:opacity-70"><Trash2 size={13} style={{ color: 'oklch(0.60 0.22 25)' }} /></button>
                </div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--feeri-text-primary)' }}>{bank.bankName}</p>
                <p className="text-xs mb-2" style={{ color: 'var(--feeri-text-muted)' }}>{bank.accountName}</p>
                <p className="text-xs font-mono mb-3" style={{ color: 'var(--feeri-text-faint)' }}>{bank.accountNumber}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black" style={{ color: 'oklch(0.55 0.28 300)' }}>{Number(bank.balance || 0).toLocaleString()}</span>
                  <span className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{bank.currency || 'SAR'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Petty Cash Tab ── */}
      {activeTab === 'petty-cash' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'العهد والسلف' : 'Petty Cash & Advances'}
            </h3>
            <button onClick={() => setShowPettyForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={13} /> {lang === 'ar' ? 'إضافة عهدة' : 'Add Entry'}
            </button>
          </div>

          {showPettyForm && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'اسم الموظف *' : 'Employee Name *'}</label>
                  <input value={pettyForm.employeeName} onChange={e => setPettyForm(p => ({ ...p, employeeName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'نوع العهدة' : 'Type'}</label>
                  <select value={pettyForm.type} onChange={e => setPettyForm(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
                    <option value="petty_cash">{lang === 'ar' ? 'عهدة نقدية' : 'Petty Cash'}</option>
                    <option value="advance">{lang === 'ar' ? 'سلفة' : 'Advance'}</option>
                    <option value="expense">{lang === 'ar' ? 'مصروف' : 'Expense'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المبلغ *' : 'Amount *'}</label>
                  <input type="number" value={pettyForm.amount} onChange={e => setPettyForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'التاريخ *' : 'Date *'}</label>
                  <input type="date" value={pettyForm.date} onChange={e => setPettyForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الغرض *' : 'Purpose *'}</label>
                  <input value={pettyForm.purpose} onChange={e => setPettyForm(p => ({ ...p, purpose: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPettyForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={() => { if (!pettyForm.employeeName || !pettyForm.amount || !pettyForm.purpose) return; createPettyCashEntry.mutate({ companyId: 1, ...pettyForm }); setShowPettyForm(false); setPettyForm({ employeeName: '', type: 'petty_cash', amount: '', purpose: '', date: new Date().toISOString().split('T')[0] }); }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>{lang === 'ar' ? 'حفظ' : 'Save'}</button>
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--feeri-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--feeri-bg-elevated)' }}>
                  {[{ ar: 'الموظف', en: 'Employee' }, { ar: 'النوع', en: 'Type' }, { ar: 'المبلغ', en: 'Amount' }, { ar: 'الغرض', en: 'Purpose' }, { ar: 'التاريخ', en: 'Date' }, { ar: 'الحالة', en: 'Status' }, { ar: '', en: '' }].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-start text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? h.ar : h.en}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pettyCashList.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'لا توجد عهد بعد' : 'No entries yet'}</td></tr>
                ) : pettyCashList.map((entry: any) => (
                  <tr key={entry.id} style={{ borderTop: '1px solid var(--feeri-border)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--feeri-text-primary)' }}>{entry.employeeName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{entry.type === 'petty_cash' ? (lang === 'ar' ? 'عهدة نقدية' : 'Petty Cash') : entry.type === 'advance' ? (lang === 'ar' ? 'سلفة' : 'Advance') : (lang === 'ar' ? 'مصروف' : 'Expense')}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'oklch(0.55 0.28 300)' }}>{Number(entry.amount).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{entry.purpose}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : String(entry.date || '')}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: entry.status === 'approved' ? 'oklch(0.65 0.20 160 / 0.15)' : entry.status === 'settled' ? 'oklch(0.72 0.16 200 / 0.15)' : 'oklch(0.78 0.18 85 / 0.15)', color: entry.status === 'approved' ? 'oklch(0.65 0.20 160)' : entry.status === 'settled' ? 'oklch(0.72 0.16 200)' : 'oklch(0.78 0.18 85)' }}>
                        {entry.status === 'pending' ? (lang === 'ar' ? 'معلق' : 'Pending') : entry.status === 'approved' ? (lang === 'ar' ? 'موافق' : 'Approved') : entry.status === 'settled' ? (lang === 'ar' ? 'مسوى' : 'Settled') : (lang === 'ar' ? 'ملغي' : 'Cancelled')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deletePettyCashEntry.mutate({ id: entry.id })} className="p-1 rounded hover:opacity-70"><Trash2 size={13} style={{ color: 'oklch(0.60 0.22 25)' }} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Fixed Assets Tab ── */}
      {activeTab === 'fixed-assets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'الأصول الثابتة' : 'Fixed Assets'}
            </h3>
            <button onClick={() => setShowAssetForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={13} /> {lang === 'ar' ? 'إضافة أصل' : 'Add Asset'}
            </button>
          </div>

          {showAssetForm && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'اسم الأصل (عربي) *' : 'Asset Name (AR) *'}</label>
                  <input value={assetForm.nameAr} onChange={e => setAssetForm(p => ({ ...p, nameAr: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'اسم الأصل (إنجليزي)' : 'Asset Name (EN)'}</label>
                  <input value={assetForm.nameEn} onChange={e => setAssetForm(p => ({ ...p, nameEn: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الفئة *' : 'Category *'}</label>
                  <input value={assetForm.category} onChange={e => setAssetForm(p => ({ ...p, category: e.target.value }))}
                    placeholder={lang === 'ar' ? 'مباني / معدات / سيارات' : 'Buildings / Equipment / Vehicles'}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'تاريخ الشراء *' : 'Purchase Date *'}</label>
                  <input type="date" value={assetForm.purchaseDate} onChange={e => setAssetForm(p => ({ ...p, purchaseDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'تكلفة الشراء *' : 'Purchase Cost *'}</label>
                  <input type="number" value={assetForm.purchaseCost} onChange={e => setAssetForm(p => ({ ...p, purchaseCost: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'العمر الإنتاجي (سنوات)' : 'Useful Life (Years)'}</label>
                  <input type="number" value={assetForm.usefulLife} onChange={e => setAssetForm(p => ({ ...p, usefulLife: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAssetForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={() => { if (!assetForm.nameAr || !assetForm.category || !assetForm.purchaseCost) return; createFixedAsset.mutate({ companyId: 1, ...assetForm, bookValue: assetForm.purchaseCost }); setShowAssetForm(false); setAssetForm({ nameAr: '', nameEn: '', category: '', purchaseDate: new Date().toISOString().split('T')[0], purchaseCost: '', usefulLife: 5, depreciationRate: '20' }); }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>{lang === 'ar' ? 'حفظ' : 'Save'}</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fixedAssetsList.length === 0 ? (
              <div className="col-span-3 rounded-xl p-8 text-center" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
                <Building2 size={32} className="mx-auto mb-2" style={{ color: 'var(--feeri-text-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'لا توجد أصول ثابتة بعد' : 'No fixed assets yet'}</p>
              </div>
            ) : fixedAssetsList.map((asset: any) => (
              <div key={asset.id} className="rounded-xl p-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.78 0.18 85 / 0.15)' }}>
                    <Building2 size={18} style={{ color: 'oklch(0.78 0.18 85)' }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: asset.status === 'active' ? 'oklch(0.65 0.20 160 / 0.15)' : 'oklch(0.60 0.22 25 / 0.15)', color: asset.status === 'active' ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                      {asset.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : asset.status === 'disposed' ? (lang === 'ar' ? 'مستبعد' : 'Disposed') : (lang === 'ar' ? 'صيانة' : 'Maintenance')}
                    </span>
                    <button onClick={() => deleteFixedAsset.mutate({ id: asset.id })} className="p-1 rounded hover:opacity-70"><Trash2 size={13} style={{ color: 'oklch(0.60 0.22 25)' }} /></button>
                  </div>
                </div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? asset.nameAr : (asset.nameEn || asset.nameAr)}</p>
                <p className="text-xs mb-3" style={{ color: 'var(--feeri-text-muted)' }}>{asset.category}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'تكلفة الشراء' : 'Purchase Cost'}</span>
                    <span style={{ color: 'var(--feeri-text-primary)' }}>{Number(asset.purchaseCost).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'القيمة الدفترية' : 'Book Value'}</span>
                    <span className="font-semibold" style={{ color: 'oklch(0.78 0.18 85)' }}>{Number(asset.bookValue || asset.purchaseCost).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'معدل الاستهلاك' : 'Depreciation Rate'}</span>
                    <span style={{ color: 'var(--feeri-text-muted)' }}>{asset.depreciationRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Vouchers Tab (سندات القبض والصرف) ── */}
      {activeTab === 'vouchers' && (
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? 'سندات القبض والصرف' : 'Receipt & Payment Vouchers'}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'إدارة سندات القبض والصرف للشركة' : 'Manage receipt and payment vouchers'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setVoucherFormType('receipt'); setShowVoucherForm(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'oklch(0.65 0.20 160 / 0.15)', color: 'oklch(0.65 0.20 160)', border: '1px solid oklch(0.65 0.20 160 / 0.3)' }}>
                <ArrowDownCircle size={14} />{lang === 'ar' ? 'سند قبض' : 'Receipt'}
              </button>
              <button onClick={() => { setVoucherFormType('payment'); setShowVoucherForm(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'oklch(0.60 0.22 25 / 0.15)', color: 'oklch(0.60 0.22 25)', border: '1px solid oklch(0.60 0.22 25 / 0.3)' }}>
                <ArrowUpCircle size={14} />{lang === 'ar' ? 'سند صرف' : 'Payment'}
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'receipt', 'payment'] as const).map(t => (
              <button key={t} onClick={() => setVoucherTypeFilter(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: voucherTypeFilter === t ? 'oklch(0.55 0.28 300)' : 'var(--feeri-bg-elevated)', color: voucherTypeFilter === t ? 'white' : 'var(--feeri-text-muted)', border: `1px solid ${voucherTypeFilter === t ? 'transparent' : 'var(--feeri-border)'}` }}>
                {t === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : t === 'receipt' ? (lang === 'ar' ? 'سندات القبض' : 'Receipts') : (lang === 'ar' ? 'سندات الصرف' : 'Payments')}
              </button>
            ))}
          </div>

          {/* Create Form */}
          {showVoucherForm && (
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>
                  {voucherFormType === 'receipt' ? (lang === 'ar' ? 'إنشاء سند قبض' : 'New Receipt Voucher') : (lang === 'ar' ? 'إنشاء سند صرف' : 'New Payment Voucher')}
                  <span className="mr-2 text-xs px-2 py-0.5 rounded" style={{ background: voucherFormType === 'receipt' ? 'oklch(0.65 0.20 160 / 0.15)' : 'oklch(0.60 0.22 25 / 0.15)', color: voucherFormType === 'receipt' ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                    {voucherFormType === 'receipt' ? (nextReceiptNum || 'RCV-001') : (nextPaymentNum || 'PAY-001')}
                  </span>
                </h3>
                <button onClick={() => setShowVoucherForm(false)}><X size={16} style={{ color: 'var(--feeri-text-muted)' }} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'اسم المستفيد / الدافع *' : 'Payee / Payer Name *'}</label>
                  <input value={voucherForm.payeeName} onChange={e => setVoucherForm(p => ({ ...p, payeeName: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الحساب *' : 'Account *'}</label>
                  <input value={voucherForm.account} onChange={e => setVoucherForm(p => ({ ...p, account: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المبلغ *' : 'Amount *'}</label>
                  <input type="number" value={voucherForm.amount} onChange={e => setVoucherForm(p => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</label>
                  <select value={voucherForm.paymentMethod} onChange={e => setVoucherForm(p => ({ ...p, paymentMethod: e.target.value as any }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
                    <option value="cash">{lang === 'ar' ? 'نقدًا' : 'Cash'}</option>
                    <option value="bank_transfer">{lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                    <option value="check">{lang === 'ar' ? 'شيك' : 'Check'}</option>
                    <option value="other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
                  <input type="date" value={voucherForm.date} onChange={e => setVoucherForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'رقم المرجع (شيك / تحويل)' : 'Reference No. (Check/Transfer)'}</label>
                  <input value={voucherForm.referenceNumber} onChange={e => setVoucherForm(p => ({ ...p, referenceNumber: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'البيان *' : 'Description *'}</label>
                <textarea value={voucherForm.description} onChange={e => setVoucherForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowVoucherForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={() => {
                  if (!voucherForm.payeeName || !voucherForm.account || !voucherForm.amount || !voucherForm.description) return;
                  const num = voucherFormType === 'receipt' ? (nextReceiptNum || 'RCV-001') : (nextPaymentNum || 'PAY-001');
                  createVoucher.mutate({ companyId: 1, voucherNumber: num, type: voucherFormType, ...voucherForm });
                  setVoucherForm({ payeeName: '', account: '', amount: '', description: '', paymentMethod: 'cash', referenceNumber: '', notes: '', date: new Date().toISOString().split('T')[0], payeeType: 'other' });
                }} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>{lang === 'ar' ? 'حفظ السند' : 'Save Voucher'}</button>
              </div>
            </div>
          )}

          {/* Vouchers Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--feeri-bg-elevated)', borderBottom: '1px solid var(--feeri-border)' }}>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'رقم السند' : 'Voucher #'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'النوع' : 'Type'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المستفيد' : 'Payee'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الحساب' : 'Account'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'طريقة الدفع' : 'Method'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}></th>
                </tr>
              </thead>
              <tbody>
                {vouchersList.filter((v: any) => voucherTypeFilter === 'all' || v.type === voucherTypeFilter).length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--feeri-text-faint)' }}>
                    <Receipt size={28} className="mx-auto mb-2" style={{ color: 'var(--feeri-text-faint)' }} />
                    {lang === 'ar' ? 'لا توجد سندات بعد' : 'No vouchers yet'}
                  </td></tr>
                ) : vouchersList.filter((v: any) => voucherTypeFilter === 'all' || v.type === voucherTypeFilter).map((v: any) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--feeri-border)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--feeri-text-primary)' }}>{v.voucherNumber}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: v.type === 'receipt' ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                        {v.type === 'receipt' ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                        {v.type === 'receipt' ? (lang === 'ar' ? 'قبض' : 'Receipt') : (lang === 'ar' ? 'صرف' : 'Payment')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{v.date}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-primary)' }}>{v.payeeName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{v.account}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: v.type === 'receipt' ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                      {v.type === 'receipt' ? '+' : '-'}{Number(v.amount).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                      {v.paymentMethod === 'cash' ? (lang === 'ar' ? 'نقدًا' : 'Cash') : v.paymentMethod === 'bank_transfer' ? (lang === 'ar' ? 'تحويل' : 'Transfer') : v.paymentMethod === 'check' ? (lang === 'ar' ? 'شيك' : 'Check') : (lang === 'ar' ? 'أخرى' : 'Other')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: v.status === 'approved' ? 'oklch(0.65 0.20 160 / 0.15)' : v.status === 'cancelled' ? 'oklch(0.60 0.22 25 / 0.15)' : 'oklch(0.72 0.16 200 / 0.15)', color: v.status === 'approved' ? 'oklch(0.65 0.20 160)' : v.status === 'cancelled' ? 'oklch(0.60 0.22 25)' : 'oklch(0.72 0.16 200)' }}>
                        {v.status === 'approved' ? (lang === 'ar' ? 'معتمد' : 'Approved') : v.status === 'cancelled' ? (lang === 'ar' ? 'ملغى' : 'Cancelled') : (lang === 'ar' ? 'مسودة' : 'Draft')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {v.status === 'draft' && (
                          <button onClick={() => updateVoucherStatus.mutate({ id: v.id, data: { status: 'approved' } })} className="p-1 rounded hover:opacity-70" title={lang === 'ar' ? 'اعتماد' : 'Approve'}><CheckCircle size={13} style={{ color: 'oklch(0.65 0.20 160)' }} /></button>
                        )}
                        <button onClick={() => deleteVoucher.mutate({ id: v.id })} className="p-1 rounded hover:opacity-70"><Trash2 size={13} style={{ color: 'oklch(0.60 0.22 25)' }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── General Ledger Tab (دفتر الأستاذ) ── */}
      {activeTab === 'general-ledger' && (
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? 'دفتر الأستاذ' : 'General Ledger'}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'عرض جميع الحركات المالية مصنفة حسب الحساب' : 'View all financial movements by account'}</p>
          </div>

          {/* Account Summary Cards */}
          {ledgerSummary.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ledgerSummary.slice(0, 4).map((acc: any) => (
                <button key={acc.account} onClick={() => setLedgerAccountFilter(acc.account)}
                  className="rounded-xl p-3 text-right transition-all hover:opacity-80"
                  style={{ background: ledgerAccountFilter === acc.account ? 'oklch(0.55 0.28 300 / 0.15)' : 'var(--feeri-bg-card)', border: `1px solid ${ledgerAccountFilter === acc.account ? 'oklch(0.55 0.28 300 / 0.5)' : 'var(--feeri-border)'}` }}>
                  <p className="text-xs font-medium truncate mb-1" style={{ color: 'var(--feeri-text-primary)' }}>{acc.account}</p>
                  <p className="text-sm font-bold" style={{ color: acc.balance >= 0 ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                    {acc.balance >= 0 ? '+' : ''}{acc.balance.toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{acc.entryCount} {lang === 'ar' ? 'قيد' : 'entries'}</p>
                </button>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'تصفية بالحساب' : 'Filter by Account'}</label>
                <input value={ledgerAccountFilter} onChange={e => setLedgerAccountFilter(e.target.value)}
                  placeholder={lang === 'ar' ? 'اسم الحساب...' : 'Account name...'}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'من تاريخ' : 'From Date'}</label>
                <input type="date" value={ledgerDateFrom} onChange={e => setLedgerDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'إلى تاريخ' : 'To Date'}</label>
                <input type="date" value={ledgerDateTo} onChange={e => setLedgerDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              </div>
            </div>
            {(ledgerAccountFilter || ledgerDateFrom || ledgerDateTo) && (
              <button onClick={() => { setLedgerAccountFilter(''); setLedgerDateFrom(''); setLedgerDateTo(''); }}
                className="text-xs px-3 py-1 rounded-lg" style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                {lang === 'ar' ? 'إزالة التصفية' : 'Clear Filters'}
              </button>
            )}
          </div>

          {/* Ledger Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--feeri-bg-elevated)', borderBottom: '1px solid var(--feeri-border)' }}>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'البيان' : 'Description'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'ح.مدين' : 'Debit Acc.'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'ح.دائن' : 'Credit Acc.'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'مدين' : 'Debit'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'دائن' : 'Credit'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الرصيد' : 'Balance'}</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--feeri-text-faint)' }}>
                    <BookMarked size={28} className="mx-auto mb-2" style={{ color: 'var(--feeri-text-faint)' }} />
                    {lang === 'ar' ? 'لا توجد قيود بعد' : 'No entries yet'}
                  </td></tr>
                ) : ledgerEntries.map((entry: any, idx: number) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--feeri-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--feeri-bg-elevated)' }}>
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{entry.date instanceof Date ? entry.date.toLocaleDateString('ar-SA') : entry.date}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--feeri-text-primary)' }}>{entry.description}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{entry.debitAccount}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{entry.creditAccount}</td>
                    <td className="px-4 py-2.5 text-xs font-medium" style={{ color: 'oklch(0.65 0.20 160)' }}>{Number(entry.amount).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-xs font-medium" style={{ color: 'oklch(0.60 0.22 25)' }}>{Number(entry.amount).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-xs font-bold" style={{ color: entry.runningBalance >= 0 ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                      {entry.runningBalance >= 0 ? '+' : ''}{entry.runningBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              {ledgerEntries.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'var(--feeri-bg-elevated)', borderTop: '2px solid var(--feeri-border)' }}>
                    <td colSpan={4} className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الإجمالي' : 'Total'} ({ledgerEntries.length} {lang === 'ar' ? 'قيد' : 'entries'})</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: 'oklch(0.65 0.20 160)' }}>{ledgerEntries.reduce((s: number, e: any) => s + Number(e.amount), 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: 'oklch(0.60 0.22 25)' }}>{ledgerEntries.reduce((s: number, e: any) => s + Number(e.amount), 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: ledgerEntries[ledgerEntries.length - 1]?.runningBalance >= 0 ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                      {ledgerEntries[ledgerEntries.length - 1]?.runningBalance >= 0 ? '+' : ''}{ledgerEntries[ledgerEntries.length - 1]?.runningBalance?.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
