// Feeri System - Invoice PDF Generator
// Generates professional PDF invoices using the company's custom template

import { useRef, useState } from 'react';
import { useInvoiceTemplate } from '@/contexts/InvoiceTemplateContext';
import { useApp } from '@/contexts/AppContext';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface InvoiceData {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  clientVat?: string;
  items: { description: string; qty: number; unitPrice: number }[];
  notes?: string;
  currency?: string;
}

interface InvoicePDFProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
}

function calcSubtotal(items: InvoiceData['items']) {
  return items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
}

function fmt(n: number, currency = 'SAR') {
  return n.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
}

export default function InvoicePDF({ isOpen, onClose, invoice }: InvoicePDFProps) {
  const { template } = useInvoiceTemplate();
  const { lang } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const currency = invoice.currency || (lang === 'ar' ? 'ر.س' : 'SAR');
  const subtotal = calcSubtotal(invoice.items);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const pc = template.primaryColor;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error(lang === 'ar' ? 'تعذر فتح نافذة الطباعة' : 'Could not open print window'); return; }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${lang === 'ar' ? 'rtl' : 'ltr'}" lang="${lang}">
      <head>
        <meta charset="UTF-8"/>
        <title>${lang === 'ar' ? 'فاتورة' : 'Invoice'} ${invoice.number}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"/>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Cairo',Arial,sans-serif; color:#1a1a2e; background:#fff; direction:${lang === 'ar' ? 'rtl' : 'ltr'}; }
          @page { size:A4; margin:0; }
          @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
    toast.success(lang === 'ar' ? 'جاري الطباعة...' : 'Printing...');
  };

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const content = printRef.current;
      if (!content) return;
      const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.number}.pdf`);
      toast.success(lang === 'ar' ? `تم تحميل الفاتورة ${invoice.number}.pdf` : `Invoice ${invoice.number}.pdf downloaded`);
    } catch (err) {
      console.error(err);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء توليد PDF' : 'Error generating PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-3xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? `فاتورة رقم ${invoice.number}` : `Invoice ${invoice.number}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--feeri-bg-card)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
              <Printer size={13} />
              {lang === 'ar' ? 'طباعة' : 'Print'}
            </button>
            <button onClick={handleDownloadPDF} disabled={generating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: pc, color: 'white' }}>
              {generating ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {generating ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating...') : (lang === 'ar' ? 'تحميل PDF' : 'Download PDF')}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--feeri-text-muted)' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="overflow-y-auto flex-1 p-5">
          <div ref={printRef} style={{ background: '#fff', color: '#1a1a2e', fontFamily: "'Cairo', Arial, sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr', width: '100%', minHeight: '297mm', padding: '0' }}>

            {/* Header Band */}
            <div style={{ background: pc, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'white', fontSize: '22px', fontWeight: 900, lineHeight: 1.2 }}>
                  {template.companyNameAr}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '4px' }}>
                  {template.companyNameEn}
                </div>
              </div>
              <div style={{ textAlign: lang === 'ar' ? 'left' : 'right' }}>
                <div style={{ color: 'white', fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                  {lang === 'ar' ? 'فاتورة' : 'INVOICE'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>
                  {invoice.number}
                </div>
              </div>
            </div>

            {/* Info Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 32px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', gap: '24px', flexWrap: 'wrap' }}>
              {/* Company Info */}
              <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '13px' }}>
                  {lang === 'ar' ? 'من' : 'From'}
                </div>
                <div style={{ color: '#6b7280' }}>{template.address}</div>
                <div style={{ color: '#6b7280' }}>{template.phone}</div>
                <div style={{ color: '#6b7280' }}>{template.email}</div>
                <div style={{ color: '#6b7280' }}>{lang === 'ar' ? 'الرقم الضريبي:' : 'VAT:'} {template.vatNumber}</div>
                <div style={{ color: '#6b7280' }}>{lang === 'ar' ? 'السجل التجاري:' : 'CR:'} {template.crNumber}</div>
              </div>
              {/* Client Info */}
              <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '13px' }}>
                  {lang === 'ar' ? 'إلى' : 'Bill To'}
                </div>
                <div style={{ fontWeight: 600, color: '#111827' }}>{invoice.clientName}</div>
                {invoice.clientAddress && <div style={{ color: '#6b7280' }}>{invoice.clientAddress}</div>}
                {invoice.clientEmail && <div style={{ color: '#6b7280' }}>{invoice.clientEmail}</div>}
                {invoice.clientVat && <div style={{ color: '#6b7280' }}>{lang === 'ar' ? 'الرقم الضريبي:' : 'VAT:'} {invoice.clientVat}</div>}
              </div>
              {/* Dates */}
              <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '13px' }}>
                  {lang === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice Details'}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#9ca3af' }}>{lang === 'ar' ? 'رقم الفاتورة:' : 'Invoice #:'}</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>{invoice.number}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#9ca3af' }}>{lang === 'ar' ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>
                  <span style={{ color: '#111827' }}>{invoice.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#9ca3af' }}>{lang === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span>
                  <span style={{ color: '#111827' }}>{invoice.dueDate}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#9ca3af' }}>{lang === 'ar' ? 'شروط الدفع:' : 'Terms:'}</span>
                  <span style={{ color: '#111827' }}>{template.paymentTerms} {lang === 'ar' ? 'يوم' : 'days'}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ padding: '24px 32px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: pc + '18' }}>
                    <th style={{ padding: '10px 12px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: 700, color: '#374151', borderBottom: `2px solid ${pc}40` }}>
                      {lang === 'ar' ? 'الوصف' : 'Description'}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#374151', borderBottom: `2px solid ${pc}40`, width: '80px' }}>
                      {lang === 'ar' ? 'الكمية' : 'Qty'}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: lang === 'ar' ? 'left' : 'right', fontWeight: 700, color: '#374151', borderBottom: `2px solid ${pc}40`, width: '120px' }}>
                      {lang === 'ar' ? 'سعر الوحدة' : 'Unit Price'}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: lang === 'ar' ? 'left' : 'right', fontWeight: 700, color: '#374151', borderBottom: `2px solid ${pc}40`, width: '130px' }}>
                      {lang === 'ar' ? 'الإجمالي' : 'Total'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{item.description}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6b7280' }}>{item.qty}</td>
                      <td style={{ padding: '10px 12px', textAlign: lang === 'ar' ? 'left' : 'right', color: '#6b7280' }}>
                        {fmt(item.unitPrice, currency)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: lang === 'ar' ? 'left' : 'right', color: '#111827', fontWeight: 600 }}>
                        {fmt(item.qty * item.unitPrice, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: lang === 'ar' ? 'flex-start' : 'flex-end', marginTop: '16px' }}>
                <div style={{ minWidth: '260px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span style={{ color: '#374151', fontWeight: 600 }}>{fmt(subtotal, currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>{lang === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                    <span style={{ color: '#374151', fontWeight: 600 }}>{fmt(vat, currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', marginTop: '6px', background: pc + '15' }}>
                    <span style={{ color: pc, fontWeight: 800, fontSize: '14px' }}>{lang === 'ar' ? 'الإجمالي الكلي' : 'Grand Total'}</span>
                    <span style={{ color: pc, fontWeight: 900, fontSize: '15px' }}>{fmt(total, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>
                    {lang === 'ar' ? 'ملاحظات' : 'Notes'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{invoice.notes}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ margin: '0 32px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.7' }}>
                  <div style={{ fontWeight: 700, color: '#6b7280', marginBottom: '2px' }}>
                    {lang === 'ar' ? 'معلومات التحويل البنكي' : 'Bank Transfer Details'}
                  </div>
                  <div>{lang === 'ar' ? 'البنك:' : 'Bank:'} {template.bankName}</div>
                  <div>IBAN: {template.bankAccount}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                  <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '2px' }}>{template.footerNote}</div>
                  <div style={{ marginTop: '4px', color: pc, fontWeight: 700 }}>{template.companyNameAr}</div>
                </div>
              </div>
              {/* Barcode-like decoration */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '2px', opacity: 0.15 }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} style={{ width: `${Math.random() > 0.5 ? 3 : 1}px`, height: '20px', background: pc }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
