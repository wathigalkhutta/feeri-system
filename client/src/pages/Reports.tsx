// Feeri System - Reports Page
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { BarChart3, Download, TrendingUp, DollarSign, Users, FileText, Mail, Send } from 'lucide-react';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import { toast } from 'sonner';

const quarterlyData = [
  { q: 'Q1', revenue: 1310000, expenses: 860000, profit: 450000 },
  { q: 'Q2', revenue: 1690000, expenses: 1040000, profit: 650000 },
  { q: 'Q3', revenue: 2140000, expenses: 1260000, profit: 880000 },
  { q: 'Q4', revenue: 2560000, expenses: 1460000, profit: 1100000 },
];

const companyRadar = [
  { subject: 'الإيرادات', subjectEn: 'Revenue', tech: 80, realestate: 95, cars: 65, consulting: 55 },
  { subject: 'الأرباح', subjectEn: 'Profits', tech: 75, realestate: 90, cars: 70, consulting: 60 },
  { subject: 'العملاء', subjectEn: 'Clients', tech: 85, realestate: 70, cars: 60, consulting: 80 },
  { subject: 'الموظفون', subjectEn: 'Employees', tech: 90, realestate: 60, cars: 55, consulting: 50 },
  { subject: 'العقود', subjectEn: 'Contracts', tech: 70, realestate: 85, cars: 65, consulting: 75 },
];

const monthlyGrowth = [
  { month: 'يناير', monthEn: 'Jan', growth: 5.2 },
  { month: 'فبراير', monthEn: 'Feb', growth: -2.1 },
  { month: 'مارس', monthEn: 'Mar', growth: 8.5 },
  { month: 'أبريل', monthEn: 'Apr', growth: 6.3 },
  { month: 'مايو', monthEn: 'May', growth: 12.1 },
  { month: 'يونيو', monthEn: 'Jun', growth: 9.8 },
  { month: 'يوليو', monthEn: 'Jul', growth: 15.2 },
  { month: 'أغسطس', monthEn: 'Aug', growth: 11.4 },
  { month: 'سبتمبر', monthEn: 'Sep', growth: 14.7 },
  { month: 'أكتوبر', monthEn: 'Oct', growth: 18.3 },
  { month: 'نوفمبر', monthEn: 'Nov', growth: 16.5 },
  { month: 'ديسمبر', monthEn: 'Dec', growth: 22.1 },
];

const reportTypes = [
  { id: 'financial', iconAr: 'التقرير المالي', iconEn: 'Financial Report', icon: <DollarSign size={20} />, color: 'oklch(0.65 0.20 160)' },
  { id: 'hr', iconAr: 'تقرير الموارد البشرية', iconEn: 'HR Report', icon: <Users size={20} />, color: 'oklch(0.55 0.28 300)' },
  { id: 'sales', iconAr: 'تقرير المبيعات', iconEn: 'Sales Report', icon: <TrendingUp size={20} />, color: 'oklch(0.78 0.18 85)' },
  { id: 'contracts', iconAr: 'تقرير العقود', iconEn: 'Contracts Report', icon: <FileText size={20} />, color: 'oklch(0.72 0.16 200)' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-3 py-2 text-xs" style={{
        background: 'var(--feeri-bg-card)',
        border: '1px solid var(--feeri-border)',
        boxShadow: '0 8px 30px oklch(0 0 0 / 0.4)',
      }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--feeri-text-primary)' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const { t, lang } = useApp();
  const [period, setPeriod] = useState<'quarterly' | 'monthly'>('quarterly');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);

  return (
    <Layout title={t('reports')} subtitle={lang === 'ar' ? 'التحليلات والرسوم البيانية التفصيلية' : 'Detailed analytics and charts'}>
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="reports" />
      <EmailInbox isOpen={showEmailInbox} onClose={() => setShowEmailInbox(false)} module="reports" />
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => setShowEmailInbox(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
          <Mail size={13} /> {lang === 'ar' ? 'البريد' : 'Inbox'}
        </button>
        <button onClick={() => setShowEmailComposer(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
          <Send size={13} /> {lang === 'ar' ? 'إرسال تقرير بالبريد' : 'Email Report'}
        </button>
      </div>
      {/* Quick Report Downloads */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map(r => (
          <button key={r.id}
            onClick={() => toast.success(lang === 'ar' ? `جاري تحميل ${r.iconAr}` : `Downloading ${r.iconEn}`)}
            className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: r.color + '22' }}>
              <span style={{ color: r.color }}>{r.icon}</span>
            </div>
            <div className="text-start flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--feeri-text-primary)' }}>
                {lang === 'ar' ? r.iconAr : r.iconEn}
              </p>
              <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>PDF</p>
            </div>
            <Download size={14} style={{ color: 'var(--feeri-text-muted)', flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2 mb-4">
        {(['quarterly', 'monthly'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: period === p ? 'oklch(0.55 0.28 300)' : 'oklch(0.21 0.025 265)',
              color: period === p ? 'white' : 'oklch(0.65 0.01 265)',
              border: `1px solid ${period === p ? 'transparent' : 'oklch(0.30 0.02 265)'}`,
            }}>
            {p === 'quarterly' ? (lang === 'ar' ? 'ربع سنوي' : 'Quarterly') : (lang === 'ar' ? 'شهري' : 'Monthly')}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue vs Expenses */}
        <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'الإيرادات مقابل المصروفات' : 'Revenue vs Expenses'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.02 265)" />
              <XAxis dataKey="q" tick={{ fill: 'oklch(0.55 0.01 265)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'oklch(0.55 0.01 265)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name={lang === 'ar' ? 'الإيرادات' : 'Revenue'} fill="oklch(0.55 0.28 300)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name={lang === 'ar' ? 'المصروفات' : 'Expenses'} fill="oklch(0.60 0.22 25)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name={lang === 'ar' ? 'الأرباح' : 'Profit'} fill="oklch(0.65 0.20 160)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Rate */}
        <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'معدل النمو الشهري' : 'Monthly Growth Rate'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.02 265)" />
              <XAxis dataKey={lang === 'ar' ? 'month' : 'monthEn'} tick={{ fill: 'oklch(0.55 0.01 265)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'oklch(0.55 0.01 265)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="growth" name={lang === 'ar' ? 'النمو %' : 'Growth %'}
                stroke="oklch(0.78 0.18 85)" strokeWidth={2.5} dot={{ fill: 'oklch(0.78 0.18 85)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
          {lang === 'ar' ? 'مقارنة أداء الشركات' : 'Company Performance Comparison'}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={companyRadar}>
            <PolarGrid stroke="oklch(0.26 0.02 265)" />
            <PolarAngleAxis dataKey={lang === 'ar' ? 'subject' : 'subjectEn'} tick={{ fill: 'oklch(0.65 0.01 265)', fontSize: 11 }} />
            <Radar name={lang === 'ar' ? 'فيري للتقنية' : 'Feeri Tech'} dataKey="tech" stroke="oklch(0.55 0.28 300)" fill="oklch(0.55 0.28 300)" fillOpacity={0.2} />
            <Radar name={lang === 'ar' ? 'فيري للعقارات' : 'Feeri Real Estate'} dataKey="realestate" stroke="oklch(0.78 0.18 85)" fill="oklch(0.78 0.18 85)" fillOpacity={0.2} />
            <Radar name={lang === 'ar' ? 'فيري للسيارات' : 'Feeri Cars'} dataKey="cars" stroke="oklch(0.72 0.16 200)" fill="oklch(0.72 0.16 200)" fillOpacity={0.2} />
            <Radar name={lang === 'ar' ? 'فيري للاستشارات' : 'Feeri Consulting'} dataKey="consulting" stroke="oklch(0.65 0.20 160)" fill="oklch(0.65 0.20 160)" fillOpacity={0.2} />
            <Legend wrapperStyle={{ color: 'var(--feeri-text-muted)', fontSize: '11px' }} />
            <Tooltip contentStyle={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)', borderRadius: '8px', color: 'var(--feeri-text-primary)' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
}
