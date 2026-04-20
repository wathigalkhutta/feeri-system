// Dashboard.tsx - Feeri System
// Design: Corporate - supports Light and Dark mode via CSS variables

import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, TrendingUp, Users, FileText, Car, CheckSquare,
  UserCheck, Building2, Activity, Loader2, AlertTriangle,
  Handshake, Clock
} from 'lucide-react';
import { useState, useMemo } from 'react';

const MONTH_NAMES_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTH_NAMES_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-3 py-2 text-xs" style={{
        background: 'var(--feeri-bg-card)',
        border: '1px solid var(--feeri-border)',
        boxShadow: '0 8px 30px var(--feeri-shadow)',
      }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--feeri-text-primary)' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {Number(p.value)?.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

const cardStyle = {
  background: 'var(--feeri-bg-card)',
  border: '1px solid var(--feeri-border)',
  borderRadius: '12px',
};

export default function Dashboard() {
  const { t, lang, selectedCompany } = useApp();
  const [chartPeriod, setChartPeriod] = useState<'6m' | '12m'>('12m');

  const companyId = selectedCompany ? Number(selectedCompany.id) : 1;

  const { data: stats, isLoading, error } = trpc.dashboard.stats.useQuery(
    { companyId },
    { enabled: companyId > 0, refetchOnWindowFocus: false }
  );

  const { data: dbCompanies } = trpc.companies.list.useQuery(undefined, { refetchOnWindowFocus: false });

  const monthlyChartData = useMemo(() => {
    const months = lang === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;
    return months.map((month, i) => ({
      month,
      revenue: stats?.monthlyRevenue?.[i] ?? 0,
      expenses: stats?.monthlyExpenses?.[i] ?? 0,
      profit: (stats?.monthlyRevenue?.[i] ?? 0) - (stats?.monthlyExpenses?.[i] ?? 0),
    }));
  }, [stats, lang]);

  const displayData = chartPeriod === '6m' ? monthlyChartData.slice(-6) : monthlyChartData;

  const title = selectedCompany
    ? (lang === 'ar' ? selectedCompany.name : selectedCompany.nameEn)
    : t('dashboard');
  const subtitle = selectedCompany
    ? (lang === 'ar' ? 'نظرة عامة على أداء الشركة' : 'Company performance overview')
    : (lang === 'ar' ? 'نظرة عامة على جميع الشركات' : 'Overview of all companies');

  const fmt = (n: number) => n.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US');
  const fmtK = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(n);

  if (isLoading) {
    return (
      <Layout title={title} subtitle={subtitle}>
        <div className="flex items-center justify-center h-64 gap-3" style={{ color: 'var(--feeri-text-muted)' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'oklch(0.55 0.28 300)' }} />
          <span className="text-sm">{lang === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={title} subtitle={subtitle}>
        <div className="flex items-center justify-center h-64 gap-3" style={{ color: 'var(--feeri-text-muted)' }}>
          <AlertTriangle size={24} style={{ color: 'oklch(0.60 0.22 25)' }} />
          <span className="text-sm">{lang === 'ar' ? 'تعذّر تحميل البيانات' : 'Failed to load data'}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={title} subtitle={subtitle}>

      {/* ── Row 1: Finance KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title={t('totalRevenue')}
          value={stats?.totalRevenue ?? 0}
          prefix={t('currency')}
          trend={stats?.monthRevenue && stats?.totalRevenue ? Math.round((stats.monthRevenue / stats.totalRevenue) * 100) : 0}
          icon={<DollarSign size={20} />}
          accentColor="green"
          subtitle={lang === 'ar' ? `هذا الشهر: ${fmt(stats?.monthRevenue ?? 0)}` : `This month: ${fmt(stats?.monthRevenue ?? 0)}`}
        />
        <StatCard
          title={t('totalExpenses')}
          value={stats?.totalExpenses ?? 0}
          prefix={t('currency')}
          trend={stats?.monthExpenses && stats?.totalExpenses ? -Math.round((stats.monthExpenses / stats.totalExpenses) * 100) : 0}
          icon={<TrendingUp size={20} />}
          accentColor="red"
          subtitle={lang === 'ar' ? `هذا الشهر: ${fmt(stats?.monthExpenses ?? 0)}` : `This month: ${fmt(stats?.monthExpenses ?? 0)}`}
        />
        <StatCard
          title={t('netProfit')}
          value={stats?.netProfit ?? 0}
          prefix={t('currency')}
          trend={stats?.netProfit && stats?.totalRevenue ? Math.round((stats.netProfit / stats.totalRevenue) * 100) : 0}
          icon={<Activity size={20} />}
          accentColor="purple"
          subtitle={lang === 'ar' ? `هذا الشهر: ${fmt(stats?.monthNetProfit ?? 0)}` : `This month: ${fmt(stats?.monthNetProfit ?? 0)}`}
        />
        <StatCard
          title={t('activeContracts')}
          value={stats?.activeContracts ?? 0}
          trend={0}
          icon={<FileText size={20} />}
          accentColor="cyan"
          subtitle={
            (stats?.expiringContracts ?? 0) > 0
              ? (lang === 'ar' ? `${stats!.expiringContracts} تنتهي قريباً` : `${stats!.expiringContracts} expiring soon`)
              : (lang === 'ar' ? `الإجمالي: ${stats?.totalContracts ?? 0}` : `Total: ${stats?.totalContracts ?? 0}`)
          }
        />
      </div>

      {/* ── Row 2: Operations KPIs ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title={t('totalEmployees')}
          value={stats?.totalEmployees ?? 0}
          trend={0}
          icon={<UserCheck size={20} />}
          accentColor="yellow"
          subtitle={lang === 'ar' ? `نشط: ${stats?.activeEmployees ?? 0}` : `Active: ${stats?.activeEmployees ?? 0}`}
        />
        <StatCard
          title={t('activeClients')}
          value={stats?.activeClients ?? 0}
          trend={0}
          icon={<Users size={20} />}
          accentColor="purple"
          subtitle={lang === 'ar' ? `الإجمالي: ${stats?.totalClients ?? 0}` : `Total: ${stats?.totalClients ?? 0}`}
        />
        <StatCard
          title={t('pendingTasks')}
          value={stats?.pendingTasks ?? 0}
          trend={(stats?.urgentTasks ?? 0) > 0 ? -(stats?.urgentTasks ?? 0) : 0}
          icon={<CheckSquare size={20} />}
          accentColor="cyan"
          subtitle={lang === 'ar' ? `منجز: ${stats?.doneTasks ?? 0}` : `Done: ${stats?.doneTasks ?? 0}`}
        />
        <StatCard
          title={t('activeVehicles')}
          value={stats?.totalVehicles ?? 0}
          trend={0}
          icon={<Car size={20} />}
          accentColor="green"
          subtitle={lang === 'ar' ? `مؤجر: ${stats?.rentedVehicles ?? 0} | متاح: ${stats?.availableVehicles ?? 0}` : `Rented: ${stats?.rentedVehicles ?? 0} | Available: ${stats?.availableVehicles ?? 0}`}
        />
      </div>

      {/* ── Row 3: Finance Summary Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Invoices */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.65 0.20 160 / 0.15)' }}>
              <FileText size={14} style={{ color: 'oklch(0.65 0.20 160)' }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'الفواتير' : 'Invoices'}
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              { labelAr: 'مدفوعة', labelEn: 'Paid', value: stats?.paidInvoices ?? 0, color: 'oklch(0.65 0.20 160)' },
              { labelAr: 'معلقة', labelEn: 'Pending', value: stats?.pendingInvoices ?? 0, color: 'oklch(0.78 0.18 85)' },
              { labelAr: 'متأخرة', labelEn: 'Overdue', value: stats?.overdueInvoices ?? 0, color: 'oklch(0.60 0.22 25)' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Receivables */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.78 0.18 85 / 0.15)' }}>
              <DollarSign size={14} style={{ color: 'oklch(0.78 0.18 85)' }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'المستحقات' : 'Receivables'}
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              { labelAr: 'معلق', labelEn: 'Pending', value: fmtK(stats?.pendingRevenue ?? 0), color: 'oklch(0.78 0.18 85)' },
              { labelAr: 'متأخر', labelEn: 'Overdue', value: fmtK(stats?.overdueAmount ?? 0), color: 'oklch(0.60 0.22 25)' },
              { labelAr: 'إيرادات إيجار', labelEn: 'Rental Rev.', value: fmtK(stats?.rentalRevenue ?? 0), color: 'oklch(0.72 0.16 200)' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Partnerships */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.55 0.28 300 / 0.15)' }}>
              <Handshake size={14} style={{ color: 'oklch(0.55 0.28 300)' }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'الشراكات' : 'Partnerships'}
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              { labelAr: 'الشركاء', labelEn: 'Partners', value: String(stats?.totalPartners ?? 0), color: 'var(--feeri-text-primary)' },
              { labelAr: 'الاستثمار', labelEn: 'Investment', value: fmtK(stats?.totalInvestment ?? 0), color: 'oklch(0.55 0.28 300)' },
              { labelAr: 'الأرباح', labelEn: 'Profits', value: fmtK(stats?.totalProfit ?? 0), color: 'oklch(0.65 0.20 160)' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HR & Tasks */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.72 0.16 200 / 0.15)' }}>
              <Clock size={14} style={{ color: 'oklch(0.72 0.16 200)' }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'الموارد البشرية' : 'HR & Tasks'}
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              { labelAr: 'إجمالي الرواتب', labelEn: 'Total Salaries', value: fmtK(stats?.totalSalaries ?? 0), color: 'var(--feeri-text-primary)' },
              { labelAr: 'إجازات معلقة', labelEn: 'Pending Leaves', value: String(stats?.pendingLeaves ?? 0), color: 'oklch(0.78 0.18 85)' },
              { labelAr: 'مهام متأخرة', labelEn: 'Overdue Tasks', value: String(stats?.overdueTasks ?? 0), color: 'oklch(0.60 0.22 25)' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 rounded-xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>{t('monthlyRevenue')}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-muted)' }}>{t('thisYear')}</p>
            </div>
            <div className="flex gap-1">
              {(['6m', '12m'] as const).map(p => (
                <button key={p} onClick={() => setChartPeriod(p)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: chartPeriod === p ? 'oklch(0.55 0.28 300)' : 'var(--feeri-bg-input)',
                    color: chartPeriod === p ? 'white' : 'var(--feeri-text-muted)',
                  }}>
                  {p === '6m' ? (lang === 'ar' ? '6 أشهر' : '6M') : (lang === 'ar' ? '12 شهر' : '12M')}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={displayData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.28 300)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.28 300)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.60 0.22 25)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="oklch(0.60 0.22 25)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--feeri-border-subtle)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--feeri-text-faint)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--feeri-text-faint)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => fmtK(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name={lang === 'ar' ? 'الإيرادات' : 'Revenue'}
                stroke="oklch(0.55 0.28 300)" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="expenses" name={lang === 'ar' ? 'المصروفات' : 'Expenses'}
                stroke="oklch(0.60 0.22 25)" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Summary */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'ملخص سريع' : 'Quick Summary'}
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--feeri-text-muted)' }}>
            {lang === 'ar' ? 'هذا الشهر' : 'This month'}
          </p>
          <div className="space-y-3">
            {[
              { labelAr: 'الإيرادات', labelEn: 'Revenue', value: stats?.monthRevenue ?? 0, color: 'oklch(0.65 0.20 160)', pct: stats?.totalRevenue ? Math.min(Math.round((( stats?.monthRevenue ?? 0) / stats.totalRevenue) * 100), 100) : 0 },
              { labelAr: 'المصروفات', labelEn: 'Expenses', value: stats?.monthExpenses ?? 0, color: 'oklch(0.60 0.22 25)', pct: stats?.totalExpenses ? Math.min(Math.round(((stats?.monthExpenses ?? 0) / stats.totalExpenses) * 100), 100) : 0 },
              { labelAr: 'صافي الربح', labelEn: 'Net Profit', value: stats?.monthNetProfit ?? 0, color: 'oklch(0.55 0.28 300)', pct: stats?.netProfit ? Math.min(Math.round(((stats?.monthNetProfit ?? 0) / (Math.abs(stats.netProfit) || 1)) * 100), 100) : 0 },
              { labelAr: 'إيرادات الإيجار', labelEn: 'Rental Rev.', value: stats?.rentalRevenue ?? 0, color: 'oklch(0.78 0.18 85)', pct: stats?.totalRevenue ? Math.min(Math.round(((stats?.rentalRevenue ?? 0) / (stats.totalRevenue || 1)) * 100), 100) : 0 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--feeri-text-secondary)' }}>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                  <span className="font-semibold" style={{ color: item.color }}>{fmtK(item.value)}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--feeri-bg-input)' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--feeri-border-subtle)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>
              {lang === 'ar' ? 'صافي الربح السنوي' : 'Annual Net Profit'}
            </p>
            <p className="text-xl font-bold" style={{ color: (stats?.netProfit ?? 0) >= 0 ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
              {(stats?.netProfit ?? 0) >= 0 ? '+' : ''}{fmt(stats?.netProfit ?? 0)} {t('currency')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Monthly Profit Bar Chart ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-5" style={cardStyle}>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'الأرباح الشهرية' : 'Monthly Profit'}
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--feeri-text-muted)' }}>{t('thisYear')}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={displayData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--feeri-border-subtle)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--feeri-text-faint)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--feeri-text-faint)', fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={v => fmtK(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name={lang === 'ar' ? 'الإيرادات' : 'Revenue'} fill="oklch(0.55 0.28 300)" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name={lang === 'ar' ? 'المصروفات' : 'Expenses'} fill="oklch(0.78 0.18 85)" radius={[4,4,0,0]} />
              <Bar dataKey="profit" name={lang === 'ar' ? 'الربح' : 'Profit'} fill="oklch(0.65 0.20 160)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Operations Status */}
        <div className="rounded-xl p-5" style={cardStyle}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'حالة العمليات' : 'Operations Status'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { labelAr: 'الفواتير المدفوعة', labelEn: 'Paid Invoices', value: stats?.paidInvoices ?? 0, total: stats?.totalInvoices ?? 0, color: 'oklch(0.65 0.20 160)' },
              { labelAr: 'العقود النشطة', labelEn: 'Active Contracts', value: stats?.activeContracts ?? 0, total: stats?.totalContracts ?? 0, color: 'oklch(0.55 0.28 300)' },
              { labelAr: 'المهام المنجزة', labelEn: 'Done Tasks', value: stats?.doneTasks ?? 0, total: stats?.totalTasks ?? 0, color: 'oklch(0.72 0.16 200)' },
              { labelAr: 'السيارات المتاحة', labelEn: 'Available Cars', value: stats?.availableVehicles ?? 0, total: stats?.totalVehicles ?? 0, color: 'oklch(0.78 0.18 85)' },
            ].map((item, i) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={i} className="rounded-lg p-3" style={{ background: 'var(--feeri-bg-input)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>
                    {lang === 'ar' ? item.labelAr : item.labelEn}
                  </p>
                  <p className="text-lg font-bold mb-1" style={{ color: item.color }}>
                    {item.value}<span className="text-xs font-normal" style={{ color: 'var(--feeri-text-faint)' }}>/{item.total}</span>
                  </p>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--feeri-border)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--feeri-text-faint)' }}>{pct}%</p>
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          {((stats?.urgentTasks ?? 0) > 0 || (stats?.expiringContracts ?? 0) > 0 || (stats?.overdueInvoices ?? 0) > 0) && (
            <div className="mt-3 space-y-2">
              {(stats?.urgentTasks ?? 0) > 0 && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'oklch(0.60 0.22 25 / 0.1)', color: 'oklch(0.60 0.22 25)' }}>
                  <AlertTriangle size={12} />
                  {lang === 'ar' ? `${stats!.urgentTasks} مهام عاجلة` : `${stats!.urgentTasks} urgent tasks`}
                </div>
              )}
              {(stats?.expiringContracts ?? 0) > 0 && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'oklch(0.78 0.18 85 / 0.1)', color: 'oklch(0.78 0.18 85)' }}>
                  <Clock size={12} />
                  {lang === 'ar' ? `${stats!.expiringContracts} عقود تنتهي خلال 30 يوم` : `${stats!.expiringContracts} contracts expiring in 30 days`}
                </div>
              )}
              {(stats?.overdueInvoices ?? 0) > 0 && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'oklch(0.60 0.22 25 / 0.1)', color: 'oklch(0.60 0.22 25)' }}>
                  <AlertTriangle size={12} />
                  {lang === 'ar' ? `${stats!.overdueInvoices} فواتير متأخرة` : `${stats!.overdueInvoices} overdue invoices`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Companies Overview ───────────────────────────────────────────── */}
      {dbCompanies && dbCompanies.length > 0 ? (
        <div className="rounded-xl p-5" style={cardStyle}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'نظرة عامة على الشركات' : 'Companies Overview'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {dbCompanies.map(company => {
              const rev = Number(company.revenue ?? 0);
              const exp = Number(company.expenses ?? 0);
              const profit = rev - exp;
              const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0.0';
              return (
                <div key={company.id} className="rounded-lg p-4 transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border-subtle)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'oklch(0.55 0.28 300 / 0.15)' }}>
                      <Building2 size={14} style={{ color: 'oklch(0.55 0.28 300)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--feeri-text-primary)' }}>
                        {lang === 'ar' ? company.nameAr : (company.nameEn || company.nameAr)}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--feeri-text-faint)' }}>
                        {company.industry || (lang === 'ar' ? 'غير محدد' : 'N/A')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الإيرادات' : 'Revenue'}</span>
                      <span style={{ color: 'oklch(0.65 0.20 160)' }}>{fmtK(rev)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المصروفات' : 'Expenses'}</span>
                      <span style={{ color: 'oklch(0.60 0.22 25)' }}>{fmtK(exp)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold pt-1 border-t"
                      style={{ borderColor: 'var(--feeri-border-subtle)' }}>
                      <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'هامش الربح' : 'Margin'}</span>
                      <span style={{ color: 'oklch(0.78 0.18 85)' }}>{margin}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-10 text-center" style={cardStyle}>
          <Building2 size={40} className="mx-auto mb-3" style={{ color: 'var(--feeri-text-faint)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--feeri-text-secondary)' }}>
            {lang === 'ar' ? 'لا توجد شركات بعد' : 'No companies yet'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--feeri-text-muted)' }}>
            {lang === 'ar' ? 'أضف شركة من قسم الشركات لتظهر هنا' : 'Add a company from the Companies section to see it here'}
          </p>
        </div>
      )}

    </Layout>
  );
}
