// Feeri System - Settings Page - Full with Invoice Template + Owner Email
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Shield, Users, Settings as SettingsIcon, Plus, Check, X, Edit2,
  Globe, Bell, Lock, Building2, Crown, UserCheck, User, FileText,
  Mail, Send, Printer, Eye, Palette
} from 'lucide-react';
import { useInvoiceTemplate } from '@/contexts/InvoiceTemplateContext';
import { toast } from 'sonner';

const modules = [
  { id: 'dashboard', nameAr: 'الرئيسية', nameEn: 'Dashboard' },
  { id: 'crm', nameAr: 'إدارة العملاء', nameEn: 'CRM' },
  { id: 'hr', nameAr: 'الموارد البشرية', nameEn: 'HR' },
  { id: 'accounting', nameAr: 'المحاسبة', nameEn: 'Accounting' },
  { id: 'contracts', nameAr: 'العقود', nameEn: 'Contracts' },
  { id: 'partnerships', nameAr: 'الشراكات', nameEn: 'Partnerships' },
  { id: 'carRental', nameAr: 'إيجار السيارات', nameEn: 'Car Rental' },
  { id: 'tasks', nameAr: 'المهام', nameEn: 'Tasks' },
  { id: 'reports', nameAr: 'التقارير', nameEn: 'Reports' },
];

const roles = [
  {
    id: 'owner', nameAr: 'المالك', nameEn: 'Owner',
    color: 'oklch(0.78 0.18 85)',
    permissions: { dashboard: ['view', 'edit'], crm: ['view', 'edit', 'delete'], hr: ['view', 'edit', 'delete'], accounting: ['view', 'edit', 'delete'], contracts: ['view', 'edit', 'delete'], partnerships: ['view', 'edit', 'delete'], carRental: ['view', 'edit', 'delete'], tasks: ['view', 'edit', 'delete'], reports: ['view', 'edit'] },
  },
  {
    id: 'admin', nameAr: 'مدير', nameEn: 'Admin',
    color: 'oklch(0.55 0.28 300)',
    permissions: { dashboard: ['view', 'edit'], crm: ['view', 'edit'], hr: ['view', 'edit'], accounting: ['view'], contracts: ['view', 'edit'], partnerships: ['view'], carRental: ['view', 'edit'], tasks: ['view', 'edit', 'delete'], reports: ['view'] },
  },
  {
    id: 'manager', nameAr: 'مشرف', nameEn: 'Manager',
    color: 'oklch(0.72 0.16 200)',
    permissions: { dashboard: ['view'], crm: ['view', 'edit'], hr: ['view'], accounting: [], contracts: ['view'], partnerships: [], carRental: ['view'], tasks: ['view', 'edit'], reports: ['view'] },
  },
  {
    id: 'employee', nameAr: 'موظف', nameEn: 'Employee',
    color: 'oklch(0.65 0.20 160)',
    permissions: { dashboard: ['view'], crm: ['view'], hr: [], accounting: [], contracts: [], partnerships: [], carRental: [], tasks: ['view', 'edit'], reports: [] },
  },
];

const systemUsers = [
  { id: '1', nameAr: 'Sabri Garza ', nameEn: 'Sabri Garza ', email: 'owner@feeri.com', role: 'owner', status: 'active' },
  { id: '2', nameAr: ' رحاب سيدحمد ', nameEn: 'Rehab Sidahmed', email: 'manager@feeri.com', role: 'manager', status: 'active' },
  { id: '3', nameAr: 'الواثق صلاح', nameEn: 'Wathig Salah', email: 'employee@feeri.com', role: 'employee', status: 'active' },
  { id: '4', nameAr: 'نورة سعد', nameEn: 'Noura Saad', email: 'noura@feeri.com', role: 'employee', status: 'inactive' },
];

const customModules = [
  { id: 'custom1', nameAr: 'إدارة المستودعات', nameEn: 'Warehouse Management', icon: '📦', active: false },
  { id: 'custom2', nameAr: 'إدارة المشاريع', nameEn: 'Project Management', icon: '🏗️', active: false },
  { id: 'custom3', nameAr: 'التجارة الإلكترونية', nameEn: 'E-Commerce', icon: '🛒', active: false },
];

type Tab = 'permissions' | 'users' | 'modules' | 'invoice' | 'email' | 'general' | 'security';

export default function Settings() {
  const { t, lang } = useApp();
  const { user: currentAuthUser } = useAuth();
  const { template: ctxTemplate, updateTemplate } = useInvoiceTemplate();
  const [invoiceTemplate, setInvoiceTemplateLocal] = useState(ctxTemplate);
  const [activeTab, setActiveTab] = useState<Tab>('permissions');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const changePasswordMutation = trpc.userManagement.changePassword.useMutation({
    onSuccess: () => {
      toast.success(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    },
    onError: (err) => {
      setPasswordError(err.message);
    },
  });

  const handleChangePassword = () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(lang === 'ar' ? 'كلمة المرور الجديدة وتأكيدها غير متطابقتين' : 'New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };
  const [selectedRole, setSelectedRole] = useState('owner');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [emailType, setEmailType] = useState<'general' | 'private'>('general');

  const setInvoiceTemplate = (updater: ((prev: typeof ctxTemplate) => typeof ctxTemplate) | Partial<typeof ctxTemplate>) => {
    if (typeof updater === 'function') {
      setInvoiceTemplateLocal(prev => updater(prev));
    } else {
      setInvoiceTemplateLocal(prev => ({ ...prev, ...updater }));
    }
  };

  const saveInvoiceTemplate = () => {
    updateTemplate(invoiceTemplate);
    toast.success(lang === 'ar' ? 'تم حفظ نموذج الفاتورة بنجاح' : 'Invoice template saved successfully');
  };

  const currentRole = roles.find(r => r.id === selectedRole)!;

  const hasPermission = (module: string, perm: string) => {
    return currentRole.permissions[module as keyof typeof currentRole.permissions]?.includes(perm) ?? false;
  };

  const tabs: { id: Tab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'permissions', labelAr: 'الصلاحيات', labelEn: 'Permissions', icon: <Shield size={14} /> },
    { id: 'users', labelAr: 'المستخدمون', labelEn: 'Users', icon: <Users size={14} /> },
    { id: 'modules', labelAr: 'الأنشطة', labelEn: 'Modules', icon: <Plus size={14} /> },
    { id: 'invoice', labelAr: 'نموذج الفاتورة', labelEn: 'Invoice Template', icon: <FileText size={14} /> },
    { id: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email', icon: <Mail size={14} /> },
    { id: 'security', labelAr: 'الأمان', labelEn: 'Security', icon: <Lock size={14} /> },
    { id: 'general', labelAr: 'عام', labelEn: 'General', icon: <SettingsIcon size={14} /> },
  ];

  return (
    <Layout title={t('settings')} subtitle={lang === 'ar' ? 'إدارة الصلاحيات والمستخدمين والإعدادات' : 'Manage permissions, users and settings'}>
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="settings" defaultSubject={emailType === 'general' ? (lang === 'ar' ? 'بريد عام - من إدارة فيري' : 'General Email - Feeri Management') : ''} defaultTo={emailType === 'general' ? (lang === 'ar' ? 'جميع الموظفين' : 'All Employees') : ''} defaultToEmail={emailType === 'general' ? 'all@feeri.com' : ''} />
      <EmailInbox isOpen={showEmailInbox} onClose={() => setShowEmailInbox(false)} module="settings" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-4 flex-wrap" style={{ borderColor: 'var(--feeri-border-subtle)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
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

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div>
          <div className="flex gap-3 mb-6 flex-wrap">
            {roles.map(role => (
              <button key={role.id} onClick={() => setSelectedRole(role.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: selectedRole === role.id ? role.color + '22' : 'var(--feeri-bg-elevated)',
                  color: selectedRole === role.id ? role.color : 'var(--feeri-text-muted)',
                  border: `1px solid ${selectedRole === role.id ? role.color + '44' : 'var(--feeri-border)'}`,
                }}>
                <Shield size={14} />
                {lang === 'ar' ? role.nameAr : role.nameEn}
              </button>
            ))}
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--feeri-border)' }}>
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: currentRole.color }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? `صلاحيات ${currentRole.nameAr}` : `${currentRole.nameEn} Permissions`}
                </span>
              </div>
              <button onClick={() => toast.success(lang === 'ar' ? 'تم حفظ الصلاحيات' : 'Permissions saved')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                <Check size={12} /> {t('save')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--feeri-border)' }}>
                    <th className="text-start px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-faint)' }}>
                      {lang === 'ar' ? 'القسم / النشاط' : 'Module'}
                    </th>
                    {['view', 'edit', 'delete'].map(perm => (
                      <th key={perm} className="text-center px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-faint)' }}>
                        {perm === 'view' ? (lang === 'ar' ? 'عرض' : 'View') : perm === 'edit' ? (lang === 'ar' ? 'تعديل' : 'Edit') : (lang === 'ar' ? 'حذف' : 'Delete')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map(module => (
                    <tr key={module.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid var(--feeri-border-subtle)' }}>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>
                        {lang === 'ar' ? module.nameAr : module.nameEn}
                      </td>
                      {['view', 'edit', 'delete'].map(perm => (
                        <td key={perm} className="px-4 py-3 text-center">
                          <button
                            onClick={() => toast.info(lang === 'ar' ? 'تم تحديث الصلاحية' : 'Permission updated')}
                            className="w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-all"
                            style={{
                              background: hasPermission(module.id, perm) ? currentRole.color + '22' : 'var(--feeri-bg-elevated)',
                              border: `1px solid ${hasPermission(module.id, perm) ? currentRole.color + '44' : 'var(--feeri-border)'}`,
                            }}>
                            {hasPermission(module.id, perm)
                              ? <Check size={10} style={{ color: currentRole.color }} />
                              : <X size={10} style={{ color: 'var(--feeri-text-faint)' }} />
                            }
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl mb-4" style={{ background: 'oklch(0.55 0.28 300 / 0.08)', border: '1px solid oklch(0.55 0.28 300 / 0.2)' }}>
            <p className="text-xs" style={{ color: 'oklch(0.55 0.28 300)' }}>
              {lang === 'ar'
                ? `أنت مسجل الدخول كـ: ${currentAuthUser?.name} (${currentAuthUser?.role === 'owner' ? 'مالك' : currentAuthUser?.role === 'manager' ? 'مدير' : 'موظف'})`
                : `Logged in as: ${currentAuthUser?.nameEn} (${currentAuthUser?.role})`}
            </p>
          </div>
          <div className="flex justify-end mb-4">
            <button onClick={() => toast.success(lang === 'ar' ? 'إضافة مستخدم جديد' : 'Add new user')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={14} /> {lang === 'ar' ? 'إضافة مستخدم' : 'Add User'}
            </button>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--feeri-border)' }}>
                  {[t('name'), t('email'), lang === 'ar' ? 'الدور' : 'Role', t('status'), t('actions')].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {systemUsers.map(user => {
                  const role = roles.find(r => r.id === user.role)!;
                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid var(--feeri-border-subtle)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: role.color + '22', color: role.color }}>
                            {(lang === 'ar' ? user.nameAr : user.nameEn).charAt(0)}
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>
                            {lang === 'ar' ? user.nameAr : user.nameEn}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: role.color + '22', color: role.color }}>
                          {lang === 'ar' ? role.nameAr : role.nameEn}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: user.status === 'active' ? 'oklch(0.65 0.20 160 / 0.15)' : 'oklch(0.60 0.22 25 / 0.15)', color: user.status === 'active' ? 'oklch(0.65 0.20 160)' : 'oklch(0.60 0.22 25)' }}>
                          {user.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toast.info(lang === 'ar' ? 'تعديل المستخدم' : 'Edit user')}
                          className="p-1 rounded-md hover:bg-white/10 transition-colors" style={{ color: 'var(--feeri-text-muted)' }}>
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div>
          <p className="text-sm mb-4" style={{ color: 'var(--feeri-text-muted)' }}>
            {lang === 'ar' ? 'يمكنك إضافة أنشطة جديدة للنظام حسب احتياجاتك' : 'Add new modules to the system as needed'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customModules.map(mod => (
              <div key={mod.id} className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
                <div className="text-3xl mb-3">{mod.icon}</div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? mod.nameAr : mod.nameEn}
                </h3>
                <p className="text-xs mb-4" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'نشاط إضافي قابل للتفعيل' : 'Optional module, can be activated'}
                </p>
                <button onClick={() => toast.success(lang === 'ar' ? `تم تفعيل ${mod.nameAr}` : `${mod.nameEn} activated`)}
                  className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
                  {lang === 'ar' ? 'تفعيل النشاط' : 'Activate Module'}
                </button>
              </div>
            ))}
            <button onClick={() => toast.info(lang === 'ar' ? 'تواصل معنا لإضافة نشاط مخصص' : 'Contact us to add a custom module')}
              className="rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/5"
              style={{ border: '2px dashed var(--feeri-border)', minHeight: '160px' }}>
              <Plus size={28} style={{ color: 'oklch(0.55 0.28 300)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--feeri-text-muted)' }}>
                {lang === 'ar' ? 'إضافة نشاط مخصص' : 'Add Custom Module'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Invoice Template Tab */}
      {activeTab === 'invoice' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Form */}
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--feeri-text-primary)' }}>
                <Palette size={16} style={{ color: 'oklch(0.55 0.28 300)' }} />
                {lang === 'ar' ? 'تخصيص نموذج الفاتورة' : 'Customize Invoice Template'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'companyNameAr', labelAr: 'اسم الشركة (عربي)', labelEn: 'Company Name (AR)' },
                  { key: 'companyNameEn', labelAr: 'اسم الشركة (إنجليزي)', labelEn: 'Company Name (EN)' },
                  { key: 'address', labelAr: 'العنوان', labelEn: 'Address' },
                  { key: 'phone', labelAr: 'الهاتف', labelEn: 'Phone' },
                  { key: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email' },
                  { key: 'vatNumber', labelAr: 'الرقم الضريبي', labelEn: 'VAT Number' },
                  { key: 'crNumber', labelAr: 'السجل التجاري', labelEn: 'CR Number' },
                  { key: 'bankName', labelAr: 'اسم البنك', labelEn: 'Bank Name' },
                  { key: 'bankAccount', labelAr: 'رقم الحساب (IBAN)', labelEn: 'Account (IBAN)' },
                  { key: 'invoicePrefix', labelAr: 'بادئة الفاتورة', labelEn: 'Invoice Prefix' },
                  { key: 'paymentTerms', labelAr: 'شروط الدفع (أيام)', labelEn: 'Payment Terms (days)' },
                ].map(field => (
                  <div key={field.key} className={field.key === 'footerNote' || field.key === 'address' ? 'col-span-2' : ''}>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-faint)' }}>
                      {lang === 'ar' ? field.labelAr : field.labelEn}
                    </label>
                    <input
                      value={invoiceTemplate[field.key as keyof typeof invoiceTemplate] as string}
                      onChange={e => setInvoiceTemplate(p => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-faint)' }}>
                    {lang === 'ar' ? 'ملاحظة أسفل الفاتورة' : 'Footer Note'}
                  </label>
                  <input
                    value={invoiceTemplate.footerNote}
                    onChange={e => setInvoiceTemplate(p => ({ ...p, footerNote: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--feeri-text-faint)' }}>
                    {lang === 'ar' ? 'اللون الرئيسي' : 'Primary Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={invoiceTemplate.primaryColor}
                      onChange={e => setInvoiceTemplate(p => ({ ...p, primaryColor: e.target.value }))}
                      className="w-10 h-8 rounded cursor-pointer border-0 p-0"
                      style={{ background: 'transparent' }} />
                    <span className="text-xs font-mono" style={{ color: 'var(--feeri-text-muted)' }}>{invoiceTemplate.primaryColor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input type="checkbox" id="showLogo" checked={invoiceTemplate.showLogo}
                    onChange={e => setInvoiceTemplate(p => ({ ...p, showLogo: e.target.checked }))}
                    className="w-4 h-4 rounded" />
                  <label htmlFor="showLogo" className="text-xs cursor-pointer" style={{ color: 'var(--feeri-text-muted)' }}>
                    {lang === 'ar' ? 'إظهار الشعار في الفاتورة' : 'Show logo on invoice'}
                  </label>
                </div>
              </div>
              <button onClick={saveInvoiceTemplate}
                className="w-full py-2.5 rounded-lg text-sm font-semibold mt-2"
                style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                {lang === 'ar' ? 'حفظ النموذج' : 'Save Template'}
              </button>
            </div>

            {/* Preview */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
                <h3 className="text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--feeri-text-primary)' }}>
                  <Eye size={14} style={{ color: 'oklch(0.55 0.28 300)' }} />
                  {lang === 'ar' ? 'معاينة الفاتورة' : 'Invoice Preview'}
                </h3>
                <button onClick={() => toast.success(lang === 'ar' ? 'جاري طباعة الفاتورة' : 'Printing invoice')}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{ background: 'var(--feeri-bg-card)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                  <Printer size={11} /> {lang === 'ar' ? 'طباعة' : 'Print'}
                </button>
              </div>
              <div className="p-4">
                {/* Invoice Preview Card */}
                <div className="rounded-lg overflow-hidden text-xs" style={{ background: 'white', color: '#1a1a2e', border: '1px solid #e5e7eb' }}>
                  {/* Header */}
                  <div className="p-4" style={{ background: invoiceTemplate.primaryColor, color: 'white' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-black text-base">{invoiceTemplate.companyNameAr}</h2>
                        <p className="text-xs opacity-80">{invoiceTemplate.companyNameEn}</p>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-sm">{lang === 'ar' ? 'فاتورة' : 'INVOICE'}</p>
                        <p className="opacity-80">{invoiceTemplate.invoicePrefix}-2026-001</p>
                      </div>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-gray-500">{lang === 'ar' ? 'من' : 'From'}</p>
                        <p className="font-medium text-gray-800">{invoiceTemplate.companyNameAr}</p>
                        <p className="text-gray-500">{invoiceTemplate.address}</p>
                        <p className="text-gray-500">{invoiceTemplate.phone}</p>
                        <p className="text-gray-500">{lang === 'ar' ? 'ضريبي:' : 'VAT:'} {invoiceTemplate.vatNumber}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-500">{lang === 'ar' ? 'إلى' : 'To'}</p>
                        <p className="font-medium text-gray-800">{lang === 'ar' ? 'اسم العميل' : 'Client Name'}</p>
                        <p className="text-gray-500">{lang === 'ar' ? 'عنوان العميل' : 'Client Address'}</p>
                      </div>
                    </div>
                    {/* Items */}
                    <table className="w-full mt-3 text-xs">
                      <thead>
                        <tr style={{ background: invoiceTemplate.primaryColor + '15' }}>
                          <th className="text-start p-2 font-semibold text-gray-700">{lang === 'ar' ? 'البند' : 'Item'}</th>
                          <th className="text-center p-2 font-semibold text-gray-700">{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                          <th className="text-end p-2 font-semibold text-gray-700">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td className="p-2 text-gray-700">{lang === 'ar' ? 'خدمة مثال' : 'Sample Service'}</td>
                          <td className="p-2 text-center text-gray-700">1</td>
                          <td className="p-2 text-end text-gray-700">1,000 {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="flex justify-end mt-2">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-8">
                          <span className="text-gray-500">{lang === 'ar' ? 'المجموع' : 'Subtotal'}</span>
                          <span className="font-medium">1,000 {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="text-gray-500">{lang === 'ar' ? 'ضريبة 15%' : 'VAT 15%'}</span>
                          <span className="font-medium">150 {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                        </div>
                        <div className="flex justify-between gap-8 font-bold" style={{ color: invoiceTemplate.primaryColor }}>
                          <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                          <span>1,150 {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Footer */}
                    <div className="mt-3 pt-2 border-t border-gray-100 text-center text-gray-400 text-xs">
                      <p>{invoiceTemplate.footerNote}</p>
                      <p className="mt-1">{lang === 'ar' ? 'البنك:' : 'Bank:'} {invoiceTemplate.bankName} | IBAN: {invoiceTemplate.bankAccount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Tab - Owner can send general or private emails */}
      {activeTab === 'email' && (
        <div className="space-y-5">
          <div className="rounded-xl p-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--feeri-text-primary)' }}>
              <Mail size={16} style={{ color: 'oklch(0.55 0.28 300)' }} />
              {lang === 'ar' ? 'إرسال بريد إلكتروني' : 'Send Email'}
            </h3>
            <p className="text-xs mb-5" style={{ color: 'var(--feeri-text-muted)' }}>
              {lang === 'ar'
                ? 'كمالك للشركة يمكنك إرسال بريد عام لجميع الموظفين أو بريد خاص لشخص محدد'
                : 'As company owner, you can send a general email to all employees or a private email to a specific person'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* General Email */}
              <div className="rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
                style={{ background: emailType === 'general' ? 'oklch(0.55 0.28 300 / 0.1)' : 'var(--feeri-bg-elevated)', border: `2px solid ${emailType === 'general' ? 'oklch(0.55 0.28 300)' : 'var(--feeri-border)'}` }}
                onClick={() => setEmailType('general')}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'oklch(0.55 0.28 300 / 0.15)' }}>
                  <Users size={22} style={{ color: 'oklch(0.55 0.28 300)' }} />
                </div>
                <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? 'بريد عام' : 'General Email'}
                </h4>
                <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'إرسال لجميع الموظفين والأقسام' : 'Send to all employees and departments'}
                </p>
                {emailType === 'general' && (
                  <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'oklch(0.55 0.28 300)' }}>
                    <Check size={12} /> {lang === 'ar' ? 'محدد' : 'Selected'}
                  </div>
                )}
              </div>
              {/* Private Email */}
              <div className="rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
                style={{ background: emailType === 'private' ? 'oklch(0.78 0.18 85 / 0.1)' : 'var(--feeri-bg-elevated)', border: `2px solid ${emailType === 'private' ? 'oklch(0.78 0.18 85)' : 'var(--feeri-border)'}` }}
                onClick={() => setEmailType('private')}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'oklch(0.78 0.18 85 / 0.15)' }}>
                  <Lock size={22} style={{ color: 'oklch(0.78 0.18 85)' }} />
                </div>
                <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? 'بريد خاص' : 'Private Email'}
                </h4>
                <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'إرسال لشخص أو جهة محددة' : 'Send to a specific person or entity'}
                </p>
                {emailType === 'private' && (
                  <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'oklch(0.78 0.18 85)' }}>
                    <Check size={12} /> {lang === 'ar' ? 'محدد' : 'Selected'}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEmailComposer(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                <Send size={15} />
                {lang === 'ar' ? (emailType === 'general' ? 'إرسال بريد عام' : 'إرسال بريد خاص') : (emailType === 'general' ? 'Send General Email' : 'Send Private Email')}
              </button>
              <button onClick={() => setShowEmailInbox(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                <Mail size={15} />
                {lang === 'ar' ? 'البريد الوارد' : 'Inbox'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab - Change Password */}
      {activeTab === 'security' && (
        <div className="max-w-lg">
          <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.60 0.22 25 / 0.15)' }}>
                <Lock size={18} style={{ color: 'oklch(0.60 0.22 25)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'أدخل كلمة المرور الحالية ثم الجديدة' : 'Enter your current password then the new one'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
                  placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                />
              </div>

              {passwordError && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'oklch(0.60 0.22 25 / 0.1)', color: 'oklch(0.60 0.22 25)' }}>
                  {passwordError}
                </p>
              )}

              <button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'oklch(0.55 0.28 300)', color: 'white', opacity: changePasswordMutation.isPending ? 0.7 : 1 }}
              >
                {changePasswordMutation.isPending
                  ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
                  : (lang === 'ar' ? 'حفظ كلمة المرور' : 'Save Password')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          {[
            { icon: <Globe size={18} />, titleAr: 'اللغة والمنطقة', titleEn: 'Language & Region', descAr: 'تغيير لغة النظام والمنطقة الزمنية', descEn: 'Change system language and timezone', color: 'oklch(0.72 0.16 200)' },
            { icon: <Bell size={18} />, titleAr: 'الإشعارات', titleEn: 'Notifications', descAr: 'إدارة إشعارات النظام والتنبيهات', descEn: 'Manage system notifications and alerts', color: 'oklch(0.78 0.18 85)' },
            { icon: <Lock size={18} />, titleAr: 'الأمان', titleEn: 'Security', descAr: 'إعدادات كلمة المرور والمصادقة الثنائية', descEn: 'Password and two-factor authentication', color: 'oklch(0.60 0.22 25)' },
            { icon: <Building2 size={18} />, titleAr: 'معلومات الشركة', titleEn: 'Company Info', descAr: 'تحديث بيانات الشركة والشعار', descEn: 'Update company data and logo', color: 'oklch(0.55 0.28 300)' },
          ].map((item, i) => (
            <button key={i} onClick={() => toast.info(lang === 'ar' ? item.titleAr : item.titleEn)}
              className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.005] text-start"
              style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.color + '22' }}>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? item.titleAr : item.titleEn}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? item.descAr : item.descEn}
                </p>
              </div>
              <div style={{ color: 'var(--feeri-text-faint)' }}>›</div>
            </button>
          ))}
        </div>
      )}
    </Layout>
  );
}
