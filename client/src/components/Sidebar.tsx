// Feeri System - Sidebar Component
// Design: Corporate Dark - stays dark in both Light/Dark modes for contrast
// Supports role-based navigation filtering

import { useApp } from '@/contexts/AppContext';
import { useAuth, ModulePermissions } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import {
  LayoutDashboard, Users, UserCheck, Calculator, BarChart3,
  FileText, Handshake, Car, CheckSquare, Settings, Building2,
  ChevronDown, Plus, Shield, Menu, X, Sun, Moon,
  LogOut, Crown, User, Rocket, Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface NavItem {
  key: string;
  moduleKey: keyof ModulePermissions;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const roleMeta: Record<string, { color: string; icon: React.ReactNode; labelAr: string; labelEn: string }> = {
  owner: { color: 'oklch(0.78 0.18 85)', icon: <Crown size={12} />, labelAr: 'Sabri Garza ', labelEn: 'Owner' },
  manager: { color: 'oklch(0.55 0.28 300)', icon: <UserCheck size={12} />, labelAr: 'مدير', labelEn: 'Manager' },
  employee: { color: 'oklch(0.72 0.16 200)', icon: <User size={12} />, labelAr: 'موظف', labelEn: 'Employee' },
};

export default function Sidebar() {
  const { t, lang, setLang, sidebarCollapsed, setSidebarCollapsed, companies, selectedCompany, setSelectedCompany } = useApp();
  const { user, logout, canView } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  const allNavItems: NavItem[] = [
    { key: 'dashboard', moduleKey: 'dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { key: 'companies', moduleKey: 'companies', icon: <Building2 size={18} />, path: '/companies' },
    { key: 'crm', moduleKey: 'crm', icon: <Users size={18} />, path: '/crm', badge: 3 },
    { key: 'hr', moduleKey: 'hr', icon: <UserCheck size={18} />, path: '/hr' },
    { key: 'accounting', moduleKey: 'accounting', icon: <Calculator size={18} />, path: '/accounting' },
    { key: 'contracts', moduleKey: 'contracts', icon: <FileText size={18} />, path: '/contracts', badge: 2 },
    { key: 'partnerships', moduleKey: 'partnerships', icon: <Handshake size={18} />, path: '/partnerships' },
    { key: 'carRental', moduleKey: 'carRental', icon: <Car size={18} />, path: '/car-rental' },
    { key: 'tasks', moduleKey: 'tasks', icon: <CheckSquare size={18} />, path: '/tasks', badge: 5 },
    { key: 'reports', moduleKey: 'reports', icon: <BarChart3 size={18} />, path: '/reports' },
    { key: 'businessDev', moduleKey: 'businessDev', icon: <Rocket size={18} />, path: '/business-dev' },
    { key: 'messages', moduleKey: 'messages', icon: <Mail size={18} />, path: '/messages' },
    { key: 'users', moduleKey: 'users', icon: <Shield size={18} />, path: '/users' },
    { key: 'settings', moduleKey: 'settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  // Filter nav items based on user permissions
  const navItems = allNavItems.filter(item => canView(item.moduleKey));

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
  };

  const role = user?.role ?? 'employee';
  const rm = roleMeta[role];

  // Sidebar always stays dark for contrast
  const sidebarBg = 'oklch(0.13 0.025 265)';
  const sidebarBorder = 'oklch(0.26 0.02 265)';
  const sidebarText = 'oklch(0.88 0.005 265)';
  const sidebarMuted = 'oklch(0.60 0.01 265)';
  const sidebarCard = 'oklch(0.22 0.025 265)';

  return (
    <aside
      className="flex flex-col h-screen transition-all duration-300 relative z-40"
      style={{
        width: sidebarCollapsed ? '72px' : '260px',
        background: sidebarBg,
        borderInlineEnd: `1px solid ${sidebarBorder}`,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: sidebarBorder }}>
        <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center"
          style={{ background: 'oklch(0.55 0.28 300 / 0.15)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
          <img src="/manus-storage/feeri-logo_cb2aa543.jpg" alt="Feeri" className="w-8 h-8 object-contain" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm leading-tight" style={{ color: sidebarText, fontFamily: 'Syne, Cairo, sans-serif' }}>
              Feeri System
            </span>
            <span className="text-xs leading-tight" style={{ color: 'oklch(0.55 0.28 300)' }}>
              {lang === 'ar' ? 'نظام إدارة الشركات' : 'Company Management'}
            </span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ms-auto p-1 rounded-md transition-colors hover:bg-white/10"
          style={{ color: sidebarMuted }}
        >
          {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Company Selector */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-b" style={{ borderColor: sidebarBorder }}>
          <button
            onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ background: sidebarCard, color: sidebarText, border: `1px solid ${sidebarBorder}` }}
          >
            <Building2 size={14} style={{ color: 'oklch(0.78 0.18 85)' }} />
            <span className="flex-1 text-start truncate text-xs font-medium">
              {selectedCompany ? (lang === 'ar' ? selectedCompany.name : selectedCompany.nameEn) : (lang === 'ar' ? 'جميع الشركات' : 'All Companies')}
            </span>
            <ChevronDown size={12} className={`transition-transform ${companyDropdownOpen ? 'rotate-180' : ''}`} style={{ color: sidebarMuted }} />
          </button>
          {companyDropdownOpen && (
            <div className="mt-1 rounded-lg overflow-hidden border" style={{ background: 'oklch(0.18 0.025 265)', borderColor: sidebarBorder }}>
              <button
                onClick={() => { setSelectedCompany(null); setCompanyDropdownOpen(false); }}
                className="w-full text-start px-3 py-2 text-xs transition-colors hover:bg-white/5"
                style={{ color: sidebarMuted }}
              >
                {lang === 'ar' ? 'جميع الشركات' : 'All Companies'}
              </button>
              {companies.map(c => (
                <button key={c.id} onClick={() => { setSelectedCompany(c); setCompanyDropdownOpen(false); }}
                  className="w-full text-start px-3 py-2 text-xs transition-colors hover:bg-white/5"
                  style={{ color: selectedCompany?.id === c.id ? 'oklch(0.55 0.28 300)' : sidebarMuted }}>
                  {lang === 'ar' ? c.name : c.nameEn}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => (
          <Link key={item.key} href={item.path}>
            <a
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={sidebarCollapsed ? t(item.key as any) : undefined}
            >
              <span className="flex-shrink-0" style={{ color: isActive(item.path) ? 'oklch(0.55 0.28 300)' : sidebarMuted }}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-sm" style={{ color: isActive(item.path) ? 'oklch(0.55 0.28 300)' : sidebarText }}>
                    {t(item.key as any)}
                  </span>
                  {item.badge && (
                    <Badge className="text-xs px-1.5 py-0 h-4" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </a>
          </Link>
        ))}

        {/* Add Module - owner only */}
        {!sidebarCollapsed && canView('settings') && (
          <button
            onClick={() => toast.info(lang === 'ar' ? 'يمكنك إضافة نشاط جديد من الإعدادات' : 'Add a new module from Settings')}
            className="nav-item w-full mt-2"
            style={{ border: `1px dashed ${sidebarBorder}`, borderRadius: '8px' }}
          >
            <Plus size={16} style={{ color: 'oklch(0.78 0.18 85)' }} />
            <span className="text-xs" style={{ color: sidebarMuted }}>{t('addModule')}</span>
          </button>
        )}
      </nav>

      {/* Bottom Controls */}
      <div className="border-t p-3 space-y-2" style={{ borderColor: sidebarBorder }}>

        {/* Theme Toggle */}
        {!sidebarCollapsed ? (
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:bg-white/10"
            style={{ background: sidebarCard, color: sidebarText }}>
            {theme === 'dark'
              ? <Sun size={14} style={{ color: 'oklch(0.78 0.18 85)' }} />
              : <Moon size={14} style={{ color: 'oklch(0.72 0.16 200)' }} />}
            <span style={{ color: sidebarMuted }}>
              {theme === 'dark' ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
            </span>
            <span className="ms-auto text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: theme === 'dark' ? 'oklch(0.78 0.18 85 / 0.2)' : 'oklch(0.72 0.16 200 / 0.2)', color: theme === 'dark' ? 'oklch(0.78 0.18 85)' : 'oklch(0.72 0.16 200)' }}>
              {theme === 'dark' ? (lang === 'ar' ? 'داكن' : 'Dark') : (lang === 'ar' ? 'فاتح' : 'Light')}
            </span>
          </button>
        ) : (
          <button onClick={toggleTheme}
            className="w-full flex items-center justify-center p-2 rounded-lg transition-all hover:bg-white/10"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            style={{ background: sidebarCard }}>
            {theme === 'dark' ? <Sun size={16} style={{ color: 'oklch(0.78 0.18 85)' }} /> : <Moon size={16} style={{ color: 'oklch(0.72 0.16 200)' }} />}
          </button>
        )}

        {/* Language Toggle */}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: sidebarCard }}>
            {(['ar', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="flex-1 py-1 text-xs rounded-md font-medium transition-all"
                style={{ background: lang === l ? 'oklch(0.55 0.28 300)' : 'transparent', color: lang === l ? 'white' : sidebarMuted }}>
                {l === 'ar' ? 'العربية' : 'English'}
              </button>
            ))}
          </div>
        )}

        {/* User Info + Logout */}
        <div className="rounded-lg overflow-hidden" style={{ background: sidebarCard }}>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: rm.color + '33', color: rm.color }}>
              {user?.name.charAt(0) ?? 'U'}
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: sidebarText }}>
                    {lang === 'ar' ? user?.name : user?.nameEn}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span style={{ color: rm.color }}>{rm.icon}</span>
                    <p className="text-xs" style={{ color: rm.color }}>
                      {lang === 'ar' ? rm.labelAr : rm.labelEn}
                    </p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                  title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  style={{ color: 'oklch(0.60 0.22 25)' }}>
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
