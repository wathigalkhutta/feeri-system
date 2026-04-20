// Feeri System - HR Module (Full)
// Tabs: Employees | Salaries | Attendance | Leaves | Org Chart

import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useApp } from '@/contexts/AppContext';
import { useEmployees, useLeaveRequests } from '@/hooks/useFeeriData';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import { useState } from 'react';
import {
  Users, DollarSign, Calendar, Plus, Search, Mail, Send,
  CheckCircle, XCircle, Briefcase, Phone, MapPin,
  BarChart3, X, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const employees = [
  { id: 1, nameAr: 'Sabri Garza ', nameEn: 'Mohammed Al-Feeri', role: 'owner', titleAr: 'المدير التنفيذي والشريك المؤسس', titleEn: 'Owner & Chairman', dept: 'management', deptAr: 'الإدارة العليا', email: 'owner@feeri.com', phone: '+966501234567', salary: 0, joinDate: '2018-01-01', status: 'active', performance: 100, avatar: 'م', city: 'الرياض' },
  { id: 2, nameAr: 'رحاب سيدحمد', nameEn: 'Rehab Sidahmed', role: 'manager', titleAr: 'السكرتيرة التنفيذية', titleEn: 'ES', dept: 'management', deptAr: 'الإدارة العليا', email: 'manager@feeri.com', phone: '+966502345678', salary: 45000, joinDate: '2019-03-15', status: 'active', performance: 95, avatar: 'ر', city: 'الرياض' },
  { id: 3, nameAr: 'قمرالأنبياء محمد', nameEn: 'Gamer-Alanbiaa Mohammed', role: 'employee', titleAr: 'مدير المحاسبة', titleEn: 'Accounting Manager', dept: 'accounting', deptAr: 'المحاسبة', email: 'khalid@feeri.com', phone: '+966503456789', salary: 28000, joinDate: '2020-06-01', status: 'active', performance: 88, avatar: 'خ', city: 'جدة' },
  { id: 4, nameAr: 'أبوبكر محمد ', nameEn: 'Abu-Bakker Mohammed', role: 'employee', titleAr: 'مديرة الموارد البشرية', titleEn: 'HR Manager', dept: 'hr', deptAr: 'الموارد البشرية', email: 'noura@feeri.com', phone: '+966504567890', salary: 25000, joinDate: '2020-09-10', status: 'active', performance: 92, avatar: 'ن', city: 'الرياض' },
  { id: 5, nameAr: 'حسين غنيم', nameEn: 'Hussein Ghunaim', role: 'employee', titleAr: 'مدير التطوير', titleEn: 'Development Manager', dept: 'marketing', deptAr: 'التسويق', email: 'hussein@feeri.com', phone: '+966505678901', salary: 22000, joinDate: '2021-01-20', status: 'leave', performance: 85, avatar: 'ع', city: 'الدمام' },
  { id: 6, nameAr: 'فاطمة علي الزهراني', nameEn: 'Fatima Ali', role: 'employee', titleAr: 'محاسبة أولى', titleEn: 'Senior Accountant', dept: 'accounting', deptAr: 'المحاسبة', email: 'fatima@feeri.com', phone: '+966506789012', salary: 18000, joinDate: '2021-05-15', status: 'active', performance: 90, avatar: 'ف', city: 'الرياض' },
  { id: 7, nameAr: 'الواثق صلاح', nameEn: 'Wathig Salah', role: 'employee', titleAr: 'مهندس تقنية المعلومات', titleEn: 'IT Engineer', dept: 'it', deptAr: 'تقنية المعلومات', email: 'employee@feeri.com', phone: '+966507890123', salary: 20000, joinDate: '2022-02-01', status: 'active', performance: 87, avatar: 'و', city: 'الرياض' },
  { id: 8, nameAr: 'ريم عبدالرحمن', nameEn: 'Reem Abdulrahman', role: 'employee', titleAr: 'مسؤولة خدمة العملاء', titleEn: 'Customer Service', dept: 'sales', deptAr: 'المبيعات', email: 'reem@feeri.com', phone: '+966508901234', salary: 14000, joinDate: '2022-08-15', status: 'active', performance: 82, avatar: 'ر', city: 'جدة' },
];

const salaryHistory = [
  { month: 'يناير', total: 172000 },
  { month: 'فبراير', total: 172000 },
  { month: 'مارس', total: 178000 },
  { month: 'أبريل', total: 172000 },
  { month: 'مايو', total: 185000 },
  { month: 'يونيو', total: 172000 },
];

const deptColors: Record<string, string> = {
  management: 'oklch(0.55 0.28 300)',
  accounting: 'oklch(0.78 0.18 85)',
  hr: 'oklch(0.72 0.16 200)',
  marketing: 'oklch(0.65 0.20 160)',
  it: 'oklch(0.60 0.22 25)',
  sales: 'oklch(0.68 0.22 340)',
};

const deptData = [
  { nameAr: 'الإدارة', nameEn: 'Management', value: 2, color: deptColors.management },
  { nameAr: 'المحاسبة', nameEn: 'Accounting', value: 2, color: deptColors.accounting },
  { nameAr: 'الموارد البشرية', nameEn: 'HR', value: 1, color: deptColors.hr },
  { nameAr: 'التسويق', nameEn: 'Marketing', value: 1, color: deptColors.marketing },
  { nameAr: 'تقنية المعلومات', nameEn: 'IT', value: 1, color: deptColors.it },
  { nameAr: 'المبيعات', nameEn: 'Sales', value: 1, color: deptColors.sales },
];

const attendanceData = [
  { day: 'الأحد', present: 7, absent: 1, late: 0 },
  { day: 'الاثنين', present: 8, absent: 0, late: 0 },
  { day: 'الثلاثاء', present: 6, absent: 1, late: 1 },
  { day: 'الأربعاء', present: 7, absent: 0, late: 1 },
  { day: 'الخميس', present: 8, absent: 0, late: 0 },
];

type Tab = 'employees' | 'salaries' | 'attendance' | 'leaves' | 'orgchart';

export default function HR() {
  const { t, lang } = useApp();
  const { employees: dbEmployees, createMutation: createEmployeeMutation } = useEmployees(1);
  const { leaveRequests: dbLeaves, updateStatusMutation: updateLeaveStatus, createMutation: addLeaveRequest } = useLeaveRequests(1);
  // Use static demo employees merged with DB employees for display
  const leaveRequests = dbLeaves.map((l: Record<string, unknown>) => ({
    id: String(l.id),
    employeeId: String(l.employeeId),
    employeeName: String(l.employeeId),
    type: String(l.type),
    startDate: l.startDate instanceof Date ? l.startDate.toISOString().split('T')[0] : String(l.startDate || ''),
    endDate: l.endDate instanceof Date ? l.endDate.toISOString().split('T')[0] : String(l.endDate || ''),
    days: Number(l.days || 0),
    reason: String(l.reason || ''),
    status: String(l.status || 'pending'),
  }));
  const [activeTab, setActiveTab] = useState<Tab>('employees');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalSalary = employees.filter(e => e.id !== 1).reduce((s, e) => s + e.salary, 0);
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

  const filtered = employees.filter(e => {
    const matchSearch = (lang === 'ar' ? e.nameAr : e.nameEn).toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.dept === deptFilter;
    return matchSearch && matchDept;
  });

  const tabs = [
    { id: 'employees', ar: 'الموظفون', en: 'Employees', icon: <Users size={14} /> },
    { id: 'salaries', ar: 'الرواتب', en: 'Salaries', icon: <DollarSign size={14} /> },
    { id: 'attendance', ar: 'الحضور', en: 'Attendance', icon: <UserCheck size={14} /> },
    { id: 'leaves', ar: 'الإجازات', en: 'Leaves', icon: <Calendar size={14} /> },
    { id: 'orgchart', ar: 'الهيكل التنظيمي', en: 'Org Chart', icon: <BarChart3 size={14} /> },
  ] as const;

  const statusColors: Record<string, { bg: string; text: string; ar: string; en: string }> = {
    active: { bg: 'oklch(0.65 0.20 160 / 0.15)', text: 'oklch(0.65 0.20 160)', ar: 'نشط', en: 'Active' },
    leave: { bg: 'oklch(0.78 0.18 85 / 0.15)', text: 'oklch(0.78 0.18 85)', ar: 'إجازة', en: 'On Leave' },
    inactive: { bg: 'oklch(0.60 0.01 265 / 0.15)', text: 'oklch(0.60 0.01 265)', ar: 'غير نشط', en: 'Inactive' },
  };

  return (
    <Layout
      title={t('hr')}
      subtitle={lang === 'ar' ? 'إدارة الموظفين والرواتب والحضور والإجازات' : 'Manage employees, salaries, attendance and leaves'}
    >
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="hr" />
      <EmailInbox isOpen={showEmailInbox} onClose={() => setShowEmailInbox(false)} module="hr" />

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? 'بيانات الموظف' : 'Employee Details'}</h3>
              <button onClick={() => setSelectedEmployee(null)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--feeri-text-muted)' }}><X size={16} /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: deptColors[selectedEmployee.dept] || 'oklch(0.55 0.28 300)' }}>
                  {selectedEmployee.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-base" style={{ color: 'var(--feeri-text-primary)' }}>
                    {lang === 'ar' ? selectedEmployee.nameAr : selectedEmployee.nameEn}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
                    {lang === 'ar' ? selectedEmployee.titleAr : selectedEmployee.titleEn}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: statusColors[selectedEmployee.status].bg, color: statusColors[selectedEmployee.status].text }}>
                    {lang === 'ar' ? statusColors[selectedEmployee.status].ar : statusColors[selectedEmployee.status].en}
                  </span>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: <Mail size={13} />, label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', value: selectedEmployee.email },
                  { icon: <Phone size={13} />, label: lang === 'ar' ? 'الجوال' : 'Phone', value: selectedEmployee.phone },
                  { icon: <MapPin size={13} />, label: lang === 'ar' ? 'المدينة' : 'City', value: selectedEmployee.city },
                  { icon: <Briefcase size={13} />, label: lang === 'ar' ? 'القسم' : 'Department', value: lang === 'ar' ? selectedEmployee.deptAr : selectedEmployee.dept },
                  { icon: <Calendar size={13} />, label: lang === 'ar' ? 'تاريخ التعيين' : 'Join Date', value: selectedEmployee.joinDate },
                  { icon: <DollarSign size={13} />, label: lang === 'ar' ? 'الراتب' : 'Salary', value: selectedEmployee.salary ? selectedEmployee.salary.toLocaleString() + (lang === 'ar' ? ' ر.س' : ' SAR') : (lang === 'ar' ? 'Sabri Garza ' : 'Company Owner') },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 text-sm">
                    <span style={{ color: 'var(--feeri-text-faint)' }}>{item.icon}</span>
                    <span style={{ color: 'var(--feeri-text-muted)', minWidth: '120px' }}>{item.label}:</span>
                    <span style={{ color: 'var(--feeri-text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl" style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)' }}>
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'مستوى الأداء' : 'Performance'}</span>
                  <span style={{ color: 'oklch(0.55 0.28 300)', fontWeight: 700 }}>{selectedEmployee.performance}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--feeri-bg-card)' }}>
                  <div className="h-full rounded-full" style={{ width: selectedEmployee.performance + '%', background: 'oklch(0.55 0.28 300)' }} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setShowEmailComposer(true); setSelectedEmployee(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium"
                  style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
                  <Send size={12} /> {lang === 'ar' ? 'إرسال إيميل' : 'Send Email'}
                </button>
                <button onClick={() => setSelectedEmployee(null)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={lang === 'ar' ? 'إجمالي الموظفين' : 'Total Employees'} value={employees.length} icon={<Users size={20} />} accentColor="purple" />
        <StatCard title={lang === 'ar' ? 'نشطون' : 'Active'} value={activeEmployees} icon={<CheckCircle size={20} />} accentColor="green" />
        <StatCard title={lang === 'ar' ? 'إجمالي الرواتب' : 'Total Salaries'} value={totalSalary} prefix={t('currency')} icon={<DollarSign size={20} />} accentColor="yellow" />
        <StatCard title={lang === 'ar' ? 'طلبات إجازة معلقة' : 'Pending Leaves'} value={pendingLeaves} icon={<Calendar size={20} />} accentColor="red" />
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
                border: '1px solid ' + (activeTab === tab.id ? 'transparent' : 'var(--feeri-border)'),
              }}>
              {tab.icon} {lang === 'ar' ? tab.ar : tab.en}
            </button>
          ))}
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
        </div>
      </div>

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--feeri-text-faint)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث في الموظفين...' : 'Search employees...'}
                className="w-full ps-9 pe-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
              <option value="all">{lang === 'ar' ? 'جميع الأقسام' : 'All Departments'}</option>
              <option value="management">{lang === 'ar' ? 'الإدارة' : 'Management'}</option>
              <option value="accounting">{lang === 'ar' ? 'المحاسبة' : 'Accounting'}</option>
              <option value="hr">{lang === 'ar' ? 'الموارد البشرية' : 'HR'}</option>
              <option value="marketing">{lang === 'ar' ? 'التسويق' : 'Marketing'}</option>
              <option value="it">{lang === 'ar' ? 'تقنية المعلومات' : 'IT'}</option>
              <option value="sales">{lang === 'ar' ? 'المبيعات' : 'Sales'}</option>
            </select>
            <button onClick={() => toast.success(lang === 'ar' ? 'سيتم إضافة موظف جديد' : 'Add new employee')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={14} /> {lang === 'ar' ? 'موظف جديد' : 'New Employee'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(emp => (
              <div key={emp.id} className="rounded-xl p-4 transition-all hover:shadow-lg cursor-pointer"
                style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}
                onClick={() => setSelectedEmployee(emp)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                    style={{ background: deptColors[emp.dept] || 'oklch(0.55 0.28 300)' }}>
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--feeri-text-primary)' }}>
                      {lang === 'ar' ? emp.nameAr : emp.nameEn}
                    </h4>
                    <p className="text-xs truncate" style={{ color: 'var(--feeri-text-muted)' }}>
                      {lang === 'ar' ? emp.titleAr : emp.titleEn}
                    </p>
                    <span className="text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: statusColors[emp.status].bg, color: statusColors[emp.status].text }}>
                      {lang === 'ar' ? statusColors[emp.status].ar : statusColors[emp.status].en}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--feeri-text-faint)' }}>
                  <Briefcase size={11} />
                  <span>{lang === 'ar' ? emp.deptAr : emp.dept}</span>
                  <span className="mx-1">·</span>
                  <MapPin size={11} />
                  <span>{emp.city}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'الأداء' : 'Performance'}</span>
                    <span style={{ color: 'oklch(0.55 0.28 300)', fontWeight: 600 }}>{emp.performance}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--feeri-bg-elevated)' }}>
                    <div className="h-full rounded-full" style={{ width: emp.performance + '%', background: 'oklch(0.55 0.28 300)' }} />
                  </div>
                </div>
                {emp.salary > 0 && (
                  <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--feeri-border)' }}>
                    <span className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'الراتب الشهري' : 'Monthly Salary'}</span>
                    <span className="text-sm font-bold" style={{ color: 'oklch(0.65 0.20 160)' }}>
                      {emp.salary.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Salaries Tab */}
      {activeTab === 'salaries' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
                {lang === 'ar' ? 'إجمالي الرواتب الشهرية' : 'Monthly Salary Total'}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={salaryHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--feeri-border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--feeri-text-faint)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--feeri-text-faint)', fontSize: 11 }} tickFormatter={(v: number) => (v / 1000).toFixed(0) + 'k'} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString() + (lang === 'ar' ? ' ر.س' : ' SAR'), '']} contentStyle={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="total" stroke="oklch(0.55 0.28 300)" strokeWidth={2.5} dot={{ fill: 'oklch(0.55 0.28 300)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
                {lang === 'ar' ? 'توزيع الموظفين بالأقسام' : 'Employees by Department'}
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {deptData.map(d => (
                  <div key={d.nameAr} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? d.nameAr : d.nameEn}</span>
                    <span className="ms-auto font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
                {lang === 'ar' ? 'كشف الرواتب - أبريل 2026' : 'Payroll - April 2026'}
              </h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'oklch(0.65 0.20 160 / 0.15)', color: 'oklch(0.65 0.20 160)' }}
                onClick={() => toast.success(lang === 'ar' ? 'تم اعتماد كشف الرواتب' : 'Payroll approved')}>
                <CheckCircle size={12} /> {lang === 'ar' ? 'اعتماد الكشف' : 'Approve Payroll'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
                    {[lang === 'ar' ? 'الموظف' : 'Employee', lang === 'ar' ? 'القسم' : 'Dept', lang === 'ar' ? 'الراتب الأساسي' : 'Basic', lang === 'ar' ? 'البدلات' : 'Allowances', lang === 'ar' ? 'الاستقطاعات' : 'Deductions', lang === 'ar' ? 'الصافي' : 'Net'].map(h => (
                      <th key={h} className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--feeri-text-faint)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(e => e.salary > 0).map(emp => {
                    const allowances = Math.round(emp.salary * 0.25);
                    const deductions = Math.round(emp.salary * 0.05);
                    const net = emp.salary + allowances - deductions;
                    return (
                      <tr key={emp.id} className="transition-colors hover:bg-white/3" style={{ borderBottom: '1px solid var(--feeri-border-subtle)' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: deptColors[emp.dept] }}>
                              {emp.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? emp.nameAr : emp.nameEn}</p>
                              <p className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? emp.titleAr : emp.titleEn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? emp.deptAr : emp.dept}</td>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>{emp.salary.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'oklch(0.65 0.20 160)' }}>+{allowances.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'oklch(0.60 0.22 25)' }}>-{deductions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: 'oklch(0.55 0.28 300)' }}>{net.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { ar: 'حاضر اليوم', en: 'Present Today', value: 7, color: 'oklch(0.65 0.20 160)' },
              { ar: 'غائب', en: 'Absent', value: 1, color: 'oklch(0.60 0.22 25)' },
              { ar: 'متأخر', en: 'Late', value: 0, color: 'oklch(0.78 0.18 85)' },
            ].map(s => (
              <div key={s.ar} className="rounded-xl p-4 text-center" style={{ background: 'var(--feeri-bg-card)', border: '1px solid ' + s.color + '33' }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? s.ar : s.en}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'سجل الحضور - هذا الأسبوع' : 'Attendance - This Week'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--feeri-border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--feeri-text-faint)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--feeri-text-faint)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)', borderRadius: '8px' }} />
                <Bar dataKey="present" fill="oklch(0.65 0.20 160)" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'حاضر' : 'Present'} />
                <Bar dataKey="absent" fill="oklch(0.60 0.22 25)" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'غائب' : 'Absent'} />
                <Bar dataKey="late" fill="oklch(0.78 0.18 85)" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'متأخر' : 'Late'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Leaves Tab */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-3">
              {[
                { ar: 'معلقة', en: 'Pending', status: 'pending', color: 'oklch(0.78 0.18 85)' },
                { ar: 'موافق عليها', en: 'Approved', status: 'approved', color: 'oklch(0.65 0.20 160)' },
                { ar: 'مرفوضة', en: 'Rejected', status: 'rejected', color: 'oklch(0.60 0.22 25)' },
              ].map(s => (
                <div key={s.status} className="text-center px-4 py-2 rounded-xl" style={{ background: s.color + '15', border: '1px solid ' + s.color + '33' }}>
                  <p className="text-lg font-black" style={{ color: s.color }}>
                    {leaveRequests.filter(l => l.status === s.status).length}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? s.ar : s.en}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                addLeaveRequest.mutate({ companyId: 1, employeeId: 7, type: 'annual', startDate: '2026-05-01', endDate: '2026-05-10', days: 10, reason: 'إجازة سنوية مستحقة' });
                toast.success(lang === 'ar' ? 'تم تقديم طلب الإجازة' : 'Leave request submitted');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={14} /> {lang === 'ar' ? 'طلب إجازة' : 'Request Leave'}
            </button>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
                    {[lang === 'ar' ? 'الموظف' : 'Employee', lang === 'ar' ? 'النوع' : 'Type', lang === 'ar' ? 'من' : 'From', lang === 'ar' ? 'إلى' : 'To', lang === 'ar' ? 'الأيام' : 'Days', lang === 'ar' ? 'الحالة' : 'Status', lang === 'ar' ? 'إجراءات' : 'Actions'].map(h => (
                      <th key={h} className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--feeri-text-faint)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map(req => {
                    const typeColors: Record<string, string> = { annual: 'oklch(0.72 0.16 200)', sick: 'oklch(0.60 0.22 25)', emergency: 'oklch(0.78 0.18 85)', unpaid: 'oklch(0.60 0.01 265)' };
                    const typeLabels: Record<string, { ar: string; en: string }> = { annual: { ar: 'سنوية', en: 'Annual' }, sick: { ar: 'مرضية', en: 'Sick' }, emergency: { ar: 'طارئة', en: 'Emergency' }, unpaid: { ar: 'بدون راتب', en: 'Unpaid' } };
                    return (
                      <tr key={req.id} className="transition-colors hover:bg-white/3" style={{ borderBottom: '1px solid var(--feeri-border-subtle)' }}>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>
                          {req.employeeName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: typeColors[req.type] + '22', color: typeColors[req.type] }}>
                            {lang === 'ar' ? typeLabels[req.type].ar : typeLabels[req.type].en}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{req.startDate}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{req.endDate}</td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--feeri-text-primary)' }}>{req.days}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{
                            background: req.status === 'approved' ? 'oklch(0.65 0.20 160 / 0.15)' : req.status === 'pending' ? 'oklch(0.78 0.18 85 / 0.15)' : 'oklch(0.60 0.22 25 / 0.15)',
                            color: req.status === 'approved' ? 'oklch(0.65 0.20 160)' : req.status === 'pending' ? 'oklch(0.78 0.18 85)' : 'oklch(0.60 0.22 25)',
                          }}>
                            {req.status === 'approved' ? (lang === 'ar' ? 'موافق' : 'Approved') : req.status === 'pending' ? (lang === 'ar' ? 'معلق' : 'Pending') : (lang === 'ar' ? 'مرفوض' : 'Rejected')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {req.status === 'pending' && (
                            <div className="flex gap-1">
                              <button onClick={() => { updateLeaveStatus.mutate({ id: Number(req.id), status: 'approved' }); toast.success(lang === 'ar' ? 'تم الموافقة' : 'Approved'); }}
                                className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors">
                                <CheckCircle size={13} style={{ color: 'oklch(0.65 0.20 160)' }} />
                              </button>
                              <button onClick={() => { updateLeaveStatus.mutate({ id: Number(req.id), status: 'rejected' }); toast.error(lang === 'ar' ? 'تم الرفض' : 'Rejected'); }}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                                <XCircle size={13} style={{ color: 'oklch(0.60 0.22 25)' }} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Org Chart Tab */}
      {activeTab === 'orgchart' && (
        <div className="rounded-xl p-6 overflow-x-auto" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          <h3 className="text-sm font-semibold mb-6 text-center" style={{ color: 'var(--feeri-text-primary)' }}>
            {lang === 'ar' ? 'الهيكل التنظيمي - مجموعة فيري القابضة' : 'Organizational Chart - Feeri Holding Group'}
          </h3>
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-2"
                style={{ background: 'oklch(0.55 0.28 300)', boxShadow: '0 0 20px oklch(0.55 0.28 300 / 0.4)' }}>م</div>
              <p className="text-xs font-bold" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? 'Sabri Garza ' : 'Mohammed Al-Feeri'}</p>
              <p className="text-xs" style={{ color: 'oklch(0.55 0.28 300)' }}>{lang === 'ar' ? 'مالك ورئيس مجلس الإدارة' : 'Owner & Chairman'}</p>
            </div>
          </div>
          <div className="flex justify-center mb-4"><div className="w-0.5 h-6" style={{ background: 'var(--feeri-border)' }} /></div>
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black text-white mx-auto mb-2"
                style={{ background: 'oklch(0.72 0.16 200)' }}>س</div>
              <p className="text-xs font-bold" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? 'رحاب سيدحمد' : 'Rehab Sidahmed'}</p>
              <p className="text-xs" style={{ color: 'oklch(0.72 0.16 200)' }}>{lang === 'ar' ? 'مديرة التشغيل' : 'COO'}</p>
            </div>
          </div>
          <div className="relative flex justify-center mb-4">
            <div className="w-3/4 h-0.5" style={{ background: 'var(--feeri-border)' }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emp: employees[2], color: deptColors.accounting },
              { emp: employees[3], color: deptColors.hr },
              { emp: employees[4], color: deptColors.marketing },
              { emp: employees[6], color: deptColors.it },
            ].map(({ emp, color }) => (
              <div key={emp.id} className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white mx-auto mb-2"
                  style={{ background: color }}>
                  {emp.avatar}
                </div>
                <p className="text-xs font-bold" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? emp.nameAr : emp.nameEn}</p>
                <p className="text-xs" style={{ color }}>{lang === 'ar' ? emp.titleAr : emp.titleEn}</p>
                <div className="mt-2 px-2 py-1 rounded-lg text-xs" style={{ background: color + '15', color }}>
                  {lang === 'ar' ? emp.deptAr : emp.dept}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
