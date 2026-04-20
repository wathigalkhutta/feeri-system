import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import {
  Building2, Plus, TrendingUp, Users, DollarSign, BarChart3,
  ArrowUpRight, ArrowDownRight, Briefcase, FileText, Car,
  CheckSquare, Handshake, Loader2, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number, short = false) => {
  if (short) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toFixed(0);
  }
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const COMPANY_COLORS = [
  'oklch(0.55 0.28 300)',
  'oklch(0.78 0.18 85)',
  'oklch(0.72 0.16 200)',
  'oklch(0.65 0.20 160)',
  'oklch(0.60 0.22 25)',
  'oklch(0.70 0.20 240)',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{
        background: 'var(--feeri-bg-card)',
        border: '1px solid var(--feeri-border)',
      }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {Number(p.value).toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Add Company Modal ─────────────────────────────────────────────────────────
function AddCompanyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { lang } = useApp();
  const [form, setForm] = useState({ nameAr: '', nameEn: '', industry: '', industryEn: '', phone: '', email: '' });
  const createMutation = trpc.companies.create.useMutation({
    onSuccess: () => { toast.success(lang === 'ar' ? 'تم إضافة الشركة بنجاح' : 'Company added successfully'); onSuccess(); onClose(); },
    onError: () => toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'إضافة شركة جديدة' : 'Add New Company'}
          </h2>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--feeri-text-muted)' }} /></button>
        </div>
        <div className="space-y-3">
          {[
            { key: 'nameAr', labelAr: 'اسم الشركة (عربي)', labelEn: 'Company Name (Arabic)' },
            { key: 'nameEn', labelAr: 'اسم الشركة (إنجليزي)', labelEn: 'Company Name (English)' },
            { key: 'industry', labelAr: 'القطاع (عربي)', labelEn: 'Industry (Arabic)' },
            { key: 'industryEn', labelAr: 'القطاع (إنجليزي)', labelEn: 'Industry (English)' },
            { key: 'phone', labelAr: 'الهاتف', labelEn: 'Phone' },
            { key: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>
                {lang === 'ar' ? f.labelAr : f.labelEn}
              </label>
              <input
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--feeri-bg-input)', color: 'var(--feeri-text-secondary)' }}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={() => createMutation.mutate(form)}
            disabled={createMutation.isPending || !form.nameAr}
            className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'oklch(0.55 0.28 300)' }}>
            {createMutation.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : (lang === 'ar' ? 'إضافة' : 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Company Detail Panel ──────────────────────────────────────────────────────
function CompanyDetailPanel({ companyId, color, onClose }: { companyId: number; color: string; onClose: () => void }) {
  const { lang } = useApp();
  const { data: summary, isLoading } = trpc.companies.financialSummary.useQuery({ companyId });

  if (isLoading) return (
    <div className="mt-4 pt-4 flex items-center justify-center py-8" style={{ borderTop: '1px solid var(--feeri-border-subtle)' }}>
      <Loader2 size={20} className="animate-spin" style={{ color }} />
    </div>
  );

  if (!summary) return null;

  const months = lang === 'ar' ? MONTHS_AR : MONTHS_EN;
  const chartData = summary.monthlyRevenue.map((rev, i) => ({
    month: months[i],
    [lang === 'ar' ? 'إيرادات' : 'Revenue']: rev,
    [lang === 'ar' ? 'مصاريف' : 'Expenses']: summary.monthlyExpenses[i],
  }));

  const netProfit = summary.netProfit;
  const profitPositive = netProfit >= 0;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--feeri-border-subtle)' }}>
      {/* Financial KPIs */}
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--feeri-text-muted)' }}>
        {lang === 'ar' ? 'الملخص المالي' : 'Financial Summary'}
      </p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          {
            labelAr: 'إجمالي الإيرادات', labelEn: 'Total Revenue',
            value: fmt(summary.totalRevenue, true), color: 'oklch(0.65 0.20 160)',
            sub: `${summary.paidInvoices} ${lang === 'ar' ? 'فاتورة مدفوعة' : 'paid invoices'}`,
          },
          {
            labelAr: 'إجمالي المصاريف', labelEn: 'Total Expenses',
            value: fmt(summary.totalExpenses, true), color: 'oklch(0.60 0.22 25)',
            sub: `${lang === 'ar' ? 'رواتب' : 'Salaries'}: ${fmt(summary.totalSalaries, true)}`,
          },
          {
            labelAr: 'صافي الربح', labelEn: 'Net Profit',
            value: fmt(netProfit, true),
            color: profitPositive ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)',
            sub: `${lang === 'ar' ? 'هامش' : 'Margin'}: ${summary.profitMargin}%`,
          },
        ].map((s, i) => (
          <div key={i} className="rounded-lg p-2.5 text-center" style={{ background: 'var(--feeri-bg-input)' }}>
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? s.labelAr : s.labelEn}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-faint)', fontSize: '10px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending & Overdue */}
      {(summary.pendingRevenue > 0 || summary.overdueRevenue > 0) && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg p-2.5" style={{ background: 'oklch(0.78 0.18 85 / 0.1)', border: '1px solid oklch(0.78 0.18 85 / 0.2)' }}>
            <p className="text-xs" style={{ color: 'oklch(0.78 0.18 85)' }}>
              {lang === 'ar' ? 'فواتير معلقة' : 'Pending Invoices'}
            </p>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'oklch(0.78 0.18 85)' }}>{fmt(summary.pendingRevenue, true)}</p>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: 'oklch(0.60 0.22 25 / 0.1)', border: '1px solid oklch(0.60 0.22 25 / 0.2)' }}>
            <p className="text-xs" style={{ color: 'oklch(0.60 0.22 25)' }}>
              {lang === 'ar' ? 'فواتير متأخرة' : 'Overdue Invoices'}
            </p>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'oklch(0.60 0.22 25)' }}>{fmt(summary.overdueRevenue, true)}</p>
          </div>
        </div>
      )}

      {/* Monthly Chart */}
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--feeri-text-muted)' }}>
        {lang === 'ar' ? 'الإيرادات والمصاريف الشهرية' : 'Monthly Revenue & Expenses'}
      </p>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--feeri-border-subtle)" />
          <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--feeri-text-faint)' }} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--feeri-text-faint)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={lang === 'ar' ? 'إيرادات' : 'Revenue'} stroke="oklch(0.65 0.20 160)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey={lang === 'ar' ? 'مصاريف' : 'Expenses'} stroke="oklch(0.60 0.22 25)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      {/* Operational Stats */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[
          { icon: <Users size={12} />, labelAr: 'موظفون', labelEn: 'Staff', value: summary.totalEmployees, color: 'oklch(0.72 0.16 200)' },
          { icon: <Briefcase size={12} />, labelAr: 'عملاء نشطون', labelEn: 'Active Clients', value: summary.activeClients, color: 'oklch(0.55 0.28 300)' },
          { icon: <FileText size={12} />, labelAr: 'عقود نشطة', labelEn: 'Active Contracts', value: summary.activeContracts, color: 'oklch(0.78 0.18 85)' },
          { icon: <CheckSquare size={12} />, labelAr: 'مهام معلقة', labelEn: 'Pending Tasks', value: summary.pendingTasks, color: 'oklch(0.60 0.22 25)' },
        ].map((s, i) => (
          <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'var(--feeri-bg-input)' }}>
            <div className="flex items-center justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--feeri-text-faint)', fontSize: '10px' }}>{lang === 'ar' ? s.labelAr : s.labelEn}</p>
          </div>
        ))}
      </div>

      {/* Partnerships */}
      {summary.totalPartners > 0 && (
        <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--feeri-bg-input)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake size={13} style={{ color: 'oklch(0.55 0.28 300)' }} />
              <span className="text-xs" style={{ color: 'var(--feeri-text-secondary)' }}>
                {summary.totalPartners} {lang === 'ar' ? 'شريك' : 'Partners'} — {lang === 'ar' ? 'استثمار' : 'Investment'}: {fmt(summary.totalInvestment, true)}
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: 'oklch(0.65 0.20 160)' }}>
              {lang === 'ar' ? 'أرباح' : 'Profit'}: {fmt(summary.totalProfit, true)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Companies() {
  const { t, lang } = useApp();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: companies = [], isLoading, refetch } = trpc.companies.listWithSummary.useQuery();

  const totalRevenue  = companies.reduce((s, c) => s + (c.summary?.totalRevenue  ?? 0), 0);
  const totalExpenses = companies.reduce((s, c) => s + (c.summary?.totalExpenses ?? 0), 0);
  const totalEmployees = companies.reduce((s, c) => s + (c.summary?.totalEmployees ?? 0), 0);
  const totalNetProfit = totalRevenue - totalExpenses;

  // Bar chart data for all companies
  const barData = companies.map((c, i) => ({
    name: lang === 'ar' ? c.nameAr : (c.nameEn || c.nameAr),
    [lang === 'ar' ? 'إيرادات' : 'Revenue']: c.summary?.totalRevenue ?? 0,
    [lang === 'ar' ? 'مصاريف' : 'Expenses']: c.summary?.totalExpenses ?? 0,
    color: COMPANY_COLORS[i % COMPANY_COLORS.length],
  }));

  return (
    <Layout title={t('companies')} subtitle={lang === 'ar' ? 'نظرة شاملة على جميع الشركات' : 'Comprehensive view of all companies'}>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { titleAr: 'عدد الشركات', titleEn: 'Total Companies', value: companies.length, icon: <Building2 size={20} />, color: 'oklch(0.55 0.28 300)' },
          { titleAr: 'إجمالي الإيرادات', titleEn: 'Total Revenue', value: fmt(totalRevenue, true), icon: <DollarSign size={20} />, color: 'oklch(0.65 0.20 160)', prefix: '' },
          { titleAr: 'إجمالي المصاريف', titleEn: 'Total Expenses', value: fmt(totalExpenses, true), icon: <TrendingUp size={20} />, color: 'oklch(0.60 0.22 25)' },
          { titleAr: 'صافي الربح الكلي', titleEn: 'Total Net Profit', value: fmt(totalNetProfit, true), icon: <BarChart3 size={20} />, color: totalNetProfit >= 0 ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' },
        ].map((card, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: card.color + '22' }}>
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
              {i > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: i === 2 ? 'oklch(0.60 0.22 25)' : 'oklch(0.65 0.20 160)' }}>
                  {i === 2 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                </span>
              )}
            </div>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? card.titleAr : card.titleEn}</p>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      {companies.length > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'مقارنة الإيرادات والمصاريف بين الشركات' : 'Revenue & Expenses Comparison'}
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--feeri-border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--feeri-text-faint)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--feeri-text-faint)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey={lang === 'ar' ? 'إيرادات' : 'Revenue'} fill="oklch(0.65 0.20 160)" radius={[4, 4, 0, 0]} />
              <Bar dataKey={lang === 'ar' ? 'مصاريف' : 'Expenses'} fill="oklch(0.60 0.22 25)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: 'oklch(0.55 0.28 300)' }} />
        </div>
      )}

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company, idx) => {
          const color = COMPANY_COLORS[idx % COMPANY_COLORS.length];
          const isSelected = selectedId === company.id;
          const summary = company.summary;
          const netProfit = summary ? summary.netProfit : 0;
          const profitPositive = netProfit >= 0;

          return (
            <div key={company.id}
              className="rounded-xl p-5 transition-all"
              style={{
                background: 'var(--feeri-bg-card)',
                border: `1px solid ${isSelected ? color + '55' : 'var(--feeri-border)'}`,
                boxShadow: isSelected ? `0 0 24px ${color}18` : 'none',
              }}>

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + '22' }}>
                    <Building2 size={20} style={{ color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--feeri-text-primary)' }}>
                      {lang === 'ar' ? company.nameAr : (company.nameEn || company.nameAr)}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                      {company.industry || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'oklch(0.65 0.20 160 / 0.15)', color: 'oklch(0.65 0.20 160)' }}>
                    {lang === 'ar' ? 'نشطة' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  {
                    labelAr: 'الإيرادات', labelEn: 'Revenue',
                    value: summary ? fmt(summary.totalRevenue, true) : '—',
                    color: 'oklch(0.65 0.20 160)',
                  },
                  {
                    labelAr: 'المصاريف', labelEn: 'Expenses',
                    value: summary ? fmt(summary.totalExpenses, true) : '—',
                    color: 'oklch(0.60 0.22 25)',
                  },
                  {
                    labelAr: 'صافي الربح', labelEn: 'Net Profit',
                    value: summary ? fmt(netProfit, true) : '—',
                    color: profitPositive ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)',
                  },
                  {
                    labelAr: 'الموظفون', labelEn: 'Staff',
                    value: summary ? summary.totalEmployees : '—',
                    color: 'oklch(0.72 0.16 200)',
                  },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'var(--feeri-bg-input)' }}>
                    <p className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-faint)', fontSize: '10px' }}>
                      {lang === 'ar' ? stat.labelAr : stat.labelEn}
                    </p>
                  </div>
                ))}
              </div>

              {/* Profit Margin Bar */}
              {summary && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>
                      {lang === 'ar' ? 'هامش الربح' : 'Profit Margin'}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: profitPositive ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                      {summary.profitMargin}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--feeri-bg-input)' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.min(Math.abs(summary.profitMargin), 100)}%`,
                      background: profitPositive ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)',
                    }} />
                  </div>
                </div>
              )}

              {/* Expand Button */}
              <button
                onClick={() => setSelectedId(isSelected ? null : company.id)}
                className="w-full py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                style={{ background: isSelected ? color + '22' : 'var(--feeri-bg-input)', color: isSelected ? color : 'var(--feeri-text-secondary)' }}>
                {isSelected ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {isSelected
                  ? (lang === 'ar' ? 'إخفاء التفاصيل' : 'Hide Details')
                  : (lang === 'ar' ? 'عرض الملخص المالي الكامل' : 'View Full Financial Summary')}
              </button>

              {/* Expanded Detail Panel */}
              {isSelected && <CompanyDetailPanel companyId={company.id} color={color} onClose={() => setSelectedId(null)} />}
            </div>
          );
        })}

        {/* Add Company Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/5"
          style={{ border: '2px dashed oklch(0.30 0.02 265)', minHeight: '200px' }}>
          <Plus size={32} style={{ color: 'oklch(0.55 0.28 300)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--feeri-text-muted)' }}>
            {t('addCompany')}
          </span>
        </button>
      </div>

      {/* Add Company Modal */}
      {showAddModal && <AddCompanyModal onClose={() => setShowAddModal(false)} onSuccess={() => refetch()} />}
    </Layout>
  );
}
