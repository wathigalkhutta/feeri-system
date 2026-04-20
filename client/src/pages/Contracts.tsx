import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { FileText, Plus, Search, CheckCircle, Clock, AlertCircle, Mail, Send, Trash2, Edit2, X } from 'lucide-react';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import { useContracts } from '@/hooks/useFeeriData';
import { toast } from 'sonner';

type ContractStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';

interface ContractForm {
  titleAr: string;
  titleEn: string;
  clientName: string;
  value: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  progress: string;
  notes: string;
}

const defaultForm: ContractForm = {
  titleAr: '', titleEn: '', clientName: '', value: '', startDate: '', endDate: '',
  status: 'draft', progress: '0', notes: '',
};

export default function Contracts() {
  const { t, lang, selectedCompany } = useApp();
  const companyId = selectedCompany ? Number(selectedCompany.id) : 1;
  const { contracts, isLoading, createMutation, updateMutation, deleteMutation } = useContracts(companyId);

  const [search, setSearch] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ContractForm>(defaultForm);

  const filtered = contracts.filter(c => {
    const title = lang === 'ar' ? c.titleAr : (c.titleEn ?? c.titleAr);
    return title.toLowerCase().includes(search.toLowerCase()) ||
      c.clientName.toLowerCase().includes(search.toLowerCase());
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { ar: string; en: string; color: string; icon: React.ReactNode }> = {
      draft:     { ar: 'مسودة',  en: 'Draft',     color: 'oklch(0.60 0.01 265)', icon: <FileText size={10} /> },
      active:    { ar: 'نشط',    en: 'Active',     color: 'oklch(0.65 0.20 160)', icon: <CheckCircle size={10} /> },
      pending:   { ar: 'معلق',   en: 'Pending',    color: 'oklch(0.78 0.18 85)',  icon: <Clock size={10} /> },
      completed: { ar: 'مكتمل',  en: 'Completed',  color: 'oklch(0.72 0.16 200)', icon: <CheckCircle size={10} /> },
      cancelled: { ar: 'ملغي',   en: 'Cancelled',  color: 'oklch(0.60 0.22 25)',  icon: <AlertCircle size={10} /> },
      expired:   { ar: 'منتهي',  en: 'Expired',    color: 'oklch(0.65 0.15 45)',  icon: <AlertCircle size={10} /> },
    };
    const s = map[status] ?? map.draft;
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs w-fit"
        style={{ background: s.color + '22', color: s.color }}>
        {s.icon}{lang === 'ar' ? s.ar : s.en}
      </span>
    );
  };

  const setField = (key: keyof ContractForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const openCreate = () => { setForm(defaultForm); setEditingId(null); setShowForm(true); };
  const openEdit = (c: typeof contracts[0]) => {
    setForm({
      titleAr: c.titleAr, titleEn: c.titleEn ?? '',
      clientName: c.clientName,
      value: c.value ? String(c.value) : '',
      startDate: c.startDate ? String(c.startDate) : '',
      endDate: c.endDate ? String(c.endDate) : '',
      status: (c.status as ContractStatus) ?? 'draft',
      progress: String(c.progress ?? 0),
      notes: c.notes ?? '',
    });
    setEditingId(Number(c.id));
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.titleAr || !form.clientName) {
      toast.error(lang === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }
    const payload = {
      companyId,
      titleAr: form.titleAr,
      titleEn: form.titleEn || undefined,
      clientName: form.clientName,
      value: form.value ? String(form.value) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      status: form.status,
      progress: Number(form.progress),
      notes: form.notes || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { status: payload.status, progress: payload.progress, notes: payload.notes } }, { onSuccess: () => setShowForm(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  };

  const active    = contracts.filter(c => c.status === 'active').length;
  const completed = contracts.filter(c => c.status === 'completed').length;
  const pending   = contracts.filter(c => c.status === 'draft').length;
  const totalValue = contracts.reduce((s, c) => s + Number(c.value ?? 0), 0);

  return (
    <Layout title={t('contracts')} subtitle={lang === 'ar' ? 'إدارة العقود والاتفاقيات' : 'Manage contracts and agreements'}>
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="contracts" />
      <EmailInbox  isOpen={showEmailInbox}  onClose={() => setShowEmailInbox(false)}  module="contracts" />

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--feeri-text-primary)' }}>
                {editingId ? (lang === 'ar' ? 'تعديل العقد' : 'Edit Contract') : (lang === 'ar' ? 'عقد جديد' : 'New Contract')}
              </h3>
              <button onClick={() => setShowForm(false)}><X size={18} style={{ color: 'var(--feeri-text-muted)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: lang === 'ar' ? 'عنوان العقد (عربي) *' : 'Contract Title (AR) *', key: 'titleAr', type: 'text', col: 2 },
                { label: lang === 'ar' ? 'عنوان العقد (إنجليزي)' : 'Contract Title (EN)', key: 'titleEn', type: 'text', col: 2 },
                { label: lang === 'ar' ? 'اسم العميل *' : 'Client Name *', key: 'clientName', type: 'text', col: 2 },
                { label: lang === 'ar' ? 'القيمة' : 'Value', key: 'value', type: 'number', col: 1 },
                { label: lang === 'ar' ? 'نسبة الإنجاز %' : 'Progress %', key: 'progress', type: 'number', col: 1 },
                { label: lang === 'ar' ? 'تاريخ البداية' : 'Start Date', key: 'startDate', type: 'date', col: 1 },
                { label: lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date', key: 'endDate', type: 'date', col: 1 },
              ] as { label: string; key: keyof ContractForm; type: string; col: number }[]).map(f => (
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
                  <option value="draft">{lang === 'ar' ? 'مسودة' : 'Draft'}</option>
                  <option value="active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                  <option value="completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
                  <option value="cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                  <option value="expired">{lang === 'ar' ? 'منتهي' : 'Expired'}</option>
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
        <StatCard title={t('activeContracts')} value={active} trend={8} icon={<FileText size={20} />} accentColor="purple" />
        <StatCard title={lang === 'ar' ? 'إجمالي قيمة العقود' : 'Total Contract Value'} value={totalValue} prefix={t('currency')} trend={15} icon={<FileText size={20} />} accentColor="yellow" />
        <StatCard title={lang === 'ar' ? 'عقود مكتملة' : 'Completed'} value={completed} icon={<CheckCircle size={20} />} accentColor="green" />
        <StatCard title={lang === 'ar' ? 'مسودات' : 'Drafts'} value={pending} icon={<Clock size={20} />} accentColor="cyan" />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--feeri-border)' }}>
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
              <Plus size={14} /> {t('addContract')}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={40} style={{ color: 'var(--feeri-text-faint)' }} />
            <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
              {lang === 'ar' ? 'لا توجد عقود بعد' : 'No contracts yet'}
            </p>
            <button onClick={openCreate} className="px-4 py-2 text-xs rounded-lg font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              {lang === 'ar' ? '+ أضف أول عقد' : '+ Add First Contract'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
                  {[lang === 'ar' ? '#' : '#', lang === 'ar' ? 'عنوان العقد' : 'Title', lang === 'ar' ? 'العميل' : 'Client',
                    t('contractValue'), lang === 'ar' ? 'البداية' : 'Start', lang === 'ar' ? 'الانتهاء' : 'End',
                    lang === 'ar' ? 'التقدم' : 'Progress', t('status'), lang === 'ar' ? 'إجراءات' : 'Actions'].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--feeri-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((contract, idx) => (
                  <tr key={contract.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--feeri-border-subtle)' }}>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'oklch(0.72 0.16 200)' }}>#{idx + 1}</td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>
                      {lang === 'ar' ? contract.titleAr : (contract.titleEn ?? contract.titleAr)}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-secondary)' }}>{contract.clientName}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'oklch(0.78 0.18 85)' }}>
                      {Number(contract.value ?? 0).toLocaleString()} {t('currency')}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                      {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                      {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--feeri-bg-input)', width: '80px' }}>
                          <div className="h-full rounded-full" style={{ width: `${contract.progress ?? 0}%`, background: 'oklch(0.55 0.28 300)' }} />
                        </div>
                        <span className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{contract.progress ?? 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(contract.status ?? 'draft')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(contract)} className="p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors">
                          <Edit2 size={13} style={{ color: 'oklch(0.55 0.28 300)' }} />
                        </button>
                        <button onClick={() => { if (confirm(lang === 'ar' ? 'حذف العقد؟' : 'Delete contract?')) deleteMutation.mutate({ id: Number(contract.id) }); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                          <Trash2 size={13} style={{ color: 'oklch(0.60 0.22 25)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
