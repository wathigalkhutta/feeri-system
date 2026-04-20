// Feeri System - Login Page
// Design: Split-screen layout - dark brand panel + clean form panel
// Supports Light/Dark mode, Arabic/English, role quick-fill cards

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Eye, EyeOff, LogIn, Crown, UserCheck, User, Globe, Shield } from 'lucide-react';
import { toast } from 'sonner';

// Demo credentials for quick testing (remove in production)
const demoUsers = [
  { id: '1', email: 'owner@feeri.com', password: 'owner123', role: 'owner' },
  { id: '2', email: 'manager@feeri.com', password: 'manager123', role: 'manager' },
  { id: '3', email: 'employee@feeri.com', password: 'employee123', role: 'employee' },
];

const roleLabels: Record<string, { ar: string; en: string; color: string; icon: React.ReactNode; badge: string }> = {
  owner: {
    ar: 'Sabri Garza ',
    en: 'Company Owner',
    color: 'oklch(0.78 0.18 85)',
    icon: <Crown size={16} />,
    badge: 'وصول كامل',
  },
  manager: {
    ar: 'مدير',
    en: 'Manager',
    color: 'oklch(0.55 0.28 300)',
    icon: <UserCheck size={16} />,
    badge: 'وصول جزئي',
  },
  employee: {
    ar: 'موظف',
    en: 'Employee',
    color: 'oklch(0.72 0.16 200)',
    icon: <User size={16} />,
    badge: 'وصول محدود',
  },
};

export default function Login() {
  const { login, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      toast.success(lang === 'ar' ? 'مرحباً بك في Feeri System' : 'Welcome to Feeri System');
      navigate('/');
    } else {
      setError(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
    }
  };

  const fillDemo = (userId: string) => {
    const u = demoUsers.find(u => u.id === userId);
    if (u) {
      setEmail(u.email);
      setPassword(u.password);
      setError('');
    }
  };

  return (
    <div
      className="min-h-screen flex"
      dir={dir}
      style={{ background: 'oklch(0.13 0.025 265)', fontFamily: 'Cairo, Inter, sans-serif' }}
    >
      {/* ── Left / Brand Panel ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'oklch(0.16 0.025 265)' }}
      >
        {/* Decorative glows */}
        <div className="absolute top-[-80px] start-[-80px] w-[320px] h-[320px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, oklch(0.55 0.28 300), transparent 70%)' }} />
        <div className="absolute bottom-[-60px] end-[-60px] w-[260px] h-[260px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.16 200), transparent 70%)' }} />
        <div className="absolute bottom-[30%] start-[10%] w-[180px] h-[180px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, oklch(0.78 0.18 85), transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: 'oklch(0.55 0.28 300 / 0.15)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
              <img src="/manus-storage/feeri-logo_cb2aa543.jpg" alt="Feeri" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'oklch(0.92 0.005 265)', fontFamily: 'Syne, Cairo, sans-serif' }}>
                Feeri System
              </h1>
              <p className="text-xs" style={{ color: 'oklch(0.55 0.28 300)' }}>
                {lang === 'ar' ? 'نظام إدارة الشركات' : 'Company Management System'}
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold leading-snug mb-4"
            style={{ color: 'oklch(0.92 0.005 265)', fontFamily: 'Cairo, Syne, sans-serif' }}>
            {lang === 'ar' ? 'أدِر شركاتك\nبكفاءة عالية' : 'Manage Your\nCompanies Efficiently'}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.60 0.01 265)' }}>
            {lang === 'ar'
              ? 'منصة متكاملة لإدارة الموارد البشرية، المحاسبة، العقود، الشراكات، وأكثر — كل شيء في مكان واحد.'
              : 'An all-in-one platform for HR, accounting, contracts, partnerships, and more — everything in one place.'}
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {[
            { ar: 'لوحة تحكم شاملة مع رسوم بيانية', en: 'Comprehensive dashboard with charts' },
            { ar: 'إدارة متعددة الشركات', en: 'Multi-company management' },
            { ar: 'صلاحيات متدرجة حسب الدور', en: 'Role-based access control' },
            { ar: 'تقارير مالية تفصيلية', en: 'Detailed financial reports' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'oklch(0.55 0.28 300 / 0.2)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.55 0.28 300)' }} />
              </div>
              <span className="text-sm" style={{ color: 'oklch(0.70 0.01 265)' }}>
                {lang === 'ar' ? f.ar : f.en}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom brand */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'oklch(0.40 0.01 265)' }}>
            © 2026 Feeri Holding. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>
      </div>

      {/* ── Right / Form Panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">

        {/* Language toggle */}
        <div className="absolute top-6 end-6 flex items-center gap-2">
          <Globe size={14} style={{ color: 'oklch(0.55 0.01 265)' }} />
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'oklch(0.30 0.02 265)' }}>
            {(['ar', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="px-3 py-1 text-xs font-medium transition-all"
                style={{
                  background: lang === l ? 'oklch(0.55 0.28 300)' : 'oklch(0.21 0.025 265)',
                  color: lang === l ? 'white' : 'oklch(0.60 0.01 265)',
                }}>
                {l === 'ar' ? 'العربية' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl overflow-hidden"
              style={{ background: 'oklch(0.55 0.28 300 / 0.15)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
              <img src="/manus-storage/feeri-logo_cb2aa543.jpg" alt="Feeri" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold" style={{ color: 'oklch(0.92 0.005 265)' }}>Feeri System</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'oklch(0.92 0.005 265)' }}>
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </h2>
            <p className="text-sm" style={{ color: 'oklch(0.55 0.01 265)' }}>
              {lang === 'ar' ? 'أدخل بيانات حسابك للمتابعة' : 'Enter your credentials to continue'}
            </p>
          </div>

          {/* Demo Role Cards */}
          <div className="mb-6">
            <p className="text-xs mb-3" style={{ color: 'oklch(0.55 0.01 265)' }}>
              {lang === 'ar' ? 'تجربة سريعة — اختر دوراً:' : 'Quick demo — choose a role:'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoUsers.map(u => {
                const rl = roleLabels[u.role];
                return (
                  <button
                    key={u.id}
                    onClick={() => fillDemo(u.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all hover:scale-[1.03]"
                    style={{
                      background: 'oklch(0.21 0.025 265)',
                      border: `1px solid ${rl.color}33`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: `${rl.color}22`, color: rl.color }}>
                      {rl.icon}
                    </div>
                    <span className="text-xs font-semibold leading-tight" style={{ color: 'oklch(0.88 0.005 265)' }}>
                      {lang === 'ar' ? rl.ar : rl.en}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: `${rl.color}22`, color: rl.color, fontSize: '10px' }}>
                      {rl.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'oklch(0.26 0.02 265)' }} />
            <span className="text-xs" style={{ color: 'oklch(0.45 0.01 265)' }}>
              {lang === 'ar' ? 'أو أدخل بياناتك' : 'or enter manually'}
            </span>
            <div className="flex-1 h-px" style={{ background: 'oklch(0.26 0.02 265)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'oklch(0.70 0.01 265)' }}>
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder={lang === 'ar' ? 'example@feeri.com' : 'example@feeri.com'}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'oklch(0.21 0.025 265)',
                  border: `1px solid ${error ? 'oklch(0.60 0.22 25)' : 'oklch(0.30 0.02 265)'}`,
                  color: 'oklch(0.92 0.005 265)',
                }}
                onFocus={e => { e.target.style.borderColor = 'oklch(0.55 0.28 300 / 0.6)'; }}
                onBlur={e => { e.target.style.borderColor = error ? 'oklch(0.60 0.22 25)' : 'oklch(0.30 0.02 265)'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'oklch(0.70 0.01 265)' }}>
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'oklch(0.21 0.025 265)',
                    border: `1px solid ${error ? 'oklch(0.60 0.22 25)' : 'oklch(0.30 0.02 265)'}`,
                    color: 'oklch(0.92 0.005 265)',
                    paddingInlineEnd: '44px',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'oklch(0.55 0.28 300 / 0.6)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'oklch(0.60 0.22 25)' : 'oklch(0.30 0.02 265)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{ insetInlineEnd: '12px', color: 'oklch(0.55 0.01 265)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'oklch(0.60 0.22 25 / 0.1)', border: '1px solid oklch(0.60 0.22 25 / 0.3)', color: 'oklch(0.60 0.22 25)' }}>
                <Shield size={12} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: submitting ? 'oklch(0.45 0.20 300)' : 'oklch(0.55 0.28 300)',
                color: 'white',
                opacity: submitting ? 0.8 : 1,
              }}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {lang === 'ar' ? 'جارٍ التحقق...' : 'Verifying...'}
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
