import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Handshake, Plus, Search, CheckCircle, Clock, XCircle, Mail, Send, Trash2, Edit2, X, TrendingUp, DollarSign, Users } from 'lucide-react';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import { usePartnerships } from '@/hooks/useFeeriData';
import { toast } from 'sonner';

type PartnerStatus = 'active' | 'inactive' | 'pending';

interface PartnerForm {
  partnerName: string;
  partnerEmail: string;
  sharePercent: string;
  investment: string;
  profit: string;
  status: PartnerStatus;
  startDate: string;
  notes: string;
}

const defaultForm: PartnerForm = {
  partnerName: '', partnerEmail: '', sharePercent: '', investment: '',
  profit: '', status: 'active', startDate: '', notes: '',
};

export default function Partnerships() {
  const { t, lang, selectedCompany } = useApp();
  const companyId = selectedCompany ? Number(selectedCompany.id) : 1;
  const { partnerships, isLoading, createMutation, updateMutation, deleteMutation } = usePartnerships(companyId);

  const [search, setSearch] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PartnerForm>(defaultForm);

  const filtered = partnerships.filter(p =>
    p.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, { ar: string; en: string; color: string; icon: React.ReactNode }> = {
      active:   { ar: 'نشط',    en: 'Active',   color: 'oklch(0.65 0.20 160)', icon: <CheckCircle size={10} /> },
      pending:  { ar: 'معلق',   en: 'Pending',  color: 'oklch(0.78 0.18 85)',  icon: <Clock size={10} /> },
      inactive: { ar: 'غير نشط', en: 'Inactive', color: 'oklch(0.60 0.22 25)',  icon: <XCircle size={10} /> },
    };
    const s = map[status] ?? map.pending;
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs w-fit"
        style={{ background: s.color + '22', color: s.color }}>
        {s.icon}{lang === 'ar' ? s.ar : s.en}
      </span>
    );
  };

  const setField = (key: keyof PartnerForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const openCreate = () => { setForm(defaultForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p: typeof partnerships[0]) => {
    setForm({
      partnerName: p.partnerName,
      partnerEmail: p.partnerEmail ?? '',
      sharePercent: p.sharePercent ? String(p.sharePercent) : '',
      investment: p.investment ? String(p.investment) : '',
      profit: p.profit ? String(p.profit) : '',
      status: (p.status as PartnerStatus) ?? 'active',
      startDate: p.startDate ? String(p.startDate) : '',
      notes: p.notes ?? '',
    });
    setEditingId(Number(p.id));
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.partnerName) {
      toast.error(lang === 'ar' ? 'يرجى إدخال اسم الشريك' : 'Please enter partner name');
      return;
    }
    const payload = {
      companyId,
      partnerName: form.partnerName,
      partnerEmail: form.partnerEmail || undefined,
      sharePercent: form.sharePercent || undefined,
      investment: form.investment || undefined,
      profit: form.profit || undefined,
      status: form.status,
      startDate: form.startDate || undefined,
      notes: form.notes || undefined,
    };
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: { status: payload.status, profit: payload.profit, notes: payload.notes } },
        { onSuccess: () => setShowForm(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  };

  const totalInvestment = partnerships.reduce((s, p) => s + Number(p.investment ?? 0), 0);
  const totalProfit     = partnerships.reduce((s, p) => s + Number(p.profit ?? 0), 0);
  const activeCount     = partnerships.filter(p => p.status === 'active').length;
  const avgShare        = partnerships.length > 0
    ? (partnerships.reduce((s, p) => s + Number(p.sharePercent ?? 0), 0) / partnerships.length).toFixed(1)
    : '0';

  return (
    <Layout title={t('partnerships')} subtitle={lang === 'ar' ? 'إدارة الشراكات والمستثمرين' : 'Manage partnerships and investors'}>
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="partnerships" />
      <EmailInbox  isOpen={showEmailInbox}  onClose={() => setShowEmailInbox(false)}  module="partnerships" />

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--feeri-text-primary)' }}>
                {editingId ? (lang === 'ar' ? 'تعديل الشراكة' : 'Edit Partnership') : (lang === 'ar' ? 'شراكة جديدة' : 'New Partnership')}
              </h3>
              <button onClick={() => setShowForm(false)}><X size={18} style={{ color: 'var(--feeri-text-muted)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: lang === 'ar' ? 'اسم الشريك *' : 'Partner Name *', key: 'partnerName', type: 'text', col: 2 },
                { label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', key: 'partnerEmail', type: 'email', col: 2 },
                { label: lang === 'ar' ? 'نسبة الحصة %' : 'Share %', key: 'sharePercent', type: 'number', col: 1 },
                { label: lang === 'ar' ? 'قيمة الاستثمار' : 'Investment', key: 'investment', type: 'number', col: 1 },
                { label: lang === 'ar' ? 'الأرباح' : 'Profit', key: 'profit', type: 'number', col: 1 },
                { label: lang === 'ar' ? 'تاريخ البداية' : 'Start Date', key: 'startDate', type: 'date', col: 1 },
              ] as { label: string; key: keyof PartnerForm; type: string; col: number }[]).map(f => (
                <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={setField(f.key)}
                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                    style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
                <select value={form.status} onChange={setField('status')}
                  className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                  style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
                  <option value="active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                  <option value="pending">{lang === 'ar' ? 'معلق' : 'Pending'}</option>
                  <option value="inactive">{lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</label>
                <input type="text" value={form.notes} onChange={setField('notes')}
                  className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                  style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs rounded-lg"
                style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-xs rounded-lg font-semibold"
                style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                {createMutation.isPending || updateMutation.isPending ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={lang === 'ar' ? 'الشراكات النشطة' : 'Active Partnerships'} value={activeCount} trend={5} icon={<Handshake size={20} />} accentColor="purple" />
        <StatCard title={lang === 'ar' ? 'إجمالي الاستثمارات' : 'Total Investments'} value={totalInvestment} prefix={t('currency')} trend={12} icon={<DollarSign size={20} />} accentColor="yellow" />
        <StatCard title={lang === 'ar' ? 'إجمالي الأرباح' : 'Total Profits'} value={totalProfit} prefix={t('currency')} trend={18} icon={<TrendingUp size={20} />} accentColor="green" />
        <StatCard title={lang === 'ar' ? 'متوسط الحصة' : 'Avg Share'} value={avgShare} suffix="%" icon={<Users size={20} />} accentColor="cyan" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search size={14} className="absolute top-2.5 start-3" style={{ color: 'var(--feeri-text-faint)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search') + '...'}
            className="ps-8 pe-4 py-2 text-xs rounded-lg outline-none"
            style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)', width: '200px' }} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEmailInbox(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
            <Mail size={13} /> {lang === 'ar' ? 'البريد' : 'Inbox'}
          </button>
          <button onClick={() => setShowEmailComposer(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
            <Send size={13} /> {lang === 'ar' ? 'إرسال إيميل' : 'Send Email'}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
            <Plus size={14} /> {lang === 'ar' ? 'إضافة شريك' : 'Add Partner'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl"
          style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          <Handshake size={40} style={{ color: 'var(--feeri-text-faint)' }} />
          <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
            {lang === 'ar' ? 'لا توجد شراكات بعد' : 'No partnerships yet'}
          </p>
          <button onClick={openCreate} className="px-4 py-2 text-xs rounded-lg font-semibold"
            style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
            {lang === 'ar' ? '+ أضف أول شريك' : '+ Add First Partner'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(partner => {
            const shareNum   = Number(partner.sharePercent ?? 0);
            const investNum  = Number(partner.investment ?? 0);
            const profitNum  = Number(partner.profit ?? 0);
            return (
              <div key={partner.id} className="rounded-xl p-5 relative group"
                style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)' }}>
                      {partner.partnerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>{partner.partnerName}</p>
                      {partner.partnerEmail && (
                        <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{partner.partnerEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(partner)} className="p-1.5 rounded-lg hover:bg-purple-500/10">
                      <Edit2 size={12} style={{ color: 'oklch(0.55 0.28 300)' }} />
                    </button>
                    <button onClick={() => {
                      if (confirm(lang === 'ar' ? 'حذف الشريك؟' : 'Delete partner?'))
                        deleteMutation.mutate({ id: Number(partner.id) });
                    }} className="p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={12} style={{ color: 'oklch(0.60 0.22 25)' }} />
                    </button>
                  </div>
                </div>

                {/* Share Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'نسبة الحصة' : 'Share Percentage'}</span>
                    <span className="font-bold" style={{ color: 'oklch(0.55 0.28 300)' }}>{shareNum}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--feeri-bg-input)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(shareNum, 100)}%`, background: 'linear-gradient(90deg, oklch(0.55 0.28 300), oklch(0.72 0.16 200))' }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg p-3" style={{ background: 'var(--feeri-bg-elevated)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'الاستثمار' : 'Investment'}</p>
                    <p className="text-sm font-bold" style={{ color: 'oklch(0.78 0.18 85)' }}>{investNum.toLocaleString()} {t('currency')}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--feeri-bg-elevated)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'الأرباح' : 'Profits'}</p>
                    <p className="text-sm font-bold" style={{ color: 'oklch(0.65 0.20 160)' }}>{profitNum.toLocaleString()} {t('currency')}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {statusBadge(partner.status ?? 'active')}
                  {partner.startDate && (
                    <span className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>
                      {new Date(partner.startDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
