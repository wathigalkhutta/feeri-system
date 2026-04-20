// Feeri System - Header Component
// Design: Corporate - supports both Light and Dark mode via CSS variables

import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Bell, Mail, Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const notifications = [
  { id: 1, titleAr: 'عقد جديد بانتظار الموافقة', titleEn: 'New contract awaiting approval', time: '5m', read: false },
  { id: 2, titleAr: 'تم دفع فاتورة #1042', titleEn: 'Invoice #1042 has been paid', time: '1h', read: false },
  { id: 3, titleAr: 'موظف جديد انضم للفريق', titleEn: 'New employee joined the team', time: '3h', read: true },
  { id: 4, titleAr: 'تنتهي صلاحية عقد إيجار السيارة', titleEn: 'Car rental contract expiring soon', time: '1d', read: true },
];

export default function Header({ title, subtitle }: HeaderProps) {
  const { t, lang, dir, selectedCompany } = useApp();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const companyId = Number(selectedCompany?.id ?? 0);
  const userId = Number(user?.id ?? 0);

  const { data: unreadMsgCount = 0 } = trpc.internalMessages.unreadCount.useQuery(
    { companyId, userId },
    { enabled: !!companyId && !!userId, refetchInterval: 30000 }
  );

  return (
    <header
      className="flex items-center gap-4 px-6 py-4 border-b sticky top-0 z-30"
      style={{
        background: 'var(--feeri-bg-card)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--feeri-border)',
      }}
    >
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold leading-tight"
          style={{ color: 'var(--feeri-text-primary)', fontFamily: 'Cairo, Syne, sans-serif' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-muted)' }}>{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={14} className="absolute" style={{
          [dir === 'rtl' ? 'right' : 'left']: '10px',
          color: 'var(--feeri-text-muted)'
        }} />
        <input
          type="text"
          placeholder={t('search') + '...'}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="text-sm py-2 rounded-lg outline-none transition-all w-48 focus:w-64"
          style={{
            background: 'var(--feeri-bg-input)',
            border: `1px solid ${searchFocused ? 'oklch(0.55 0.28 300 / 0.5)' : 'var(--feeri-border)'}`,
            color: 'var(--feeri-text-primary)',
            paddingLeft: dir === 'rtl' ? '12px' : '32px',
            paddingRight: dir === 'rtl' ? '32px' : '12px',
          }}
        />
      </div>

      {/* Mail Icon */}
      <button
        onClick={() => navigate('/messages')}
        className="relative p-2 rounded-lg transition-colors"
        style={{ background: 'var(--feeri-bg-input)', color: 'var(--feeri-text-secondary)' }}
        title={lang === 'ar' ? 'الرسائل الداخلية' : 'Internal Messages'}
      >
        <Mail size={18} />
        {unreadMsgCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
            style={{ background: 'oklch(0.65 0.22 265)', color: 'white', fontSize: 10 }}
          >
            {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
          </span>
        )}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg transition-colors"
          style={{ background: 'var(--feeri-bg-input)', color: 'var(--feeri-text-secondary)' }}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              {unread}
            </span>
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute top-12 rounded-xl shadow-2xl w-80 z-50 overflow-hidden"
            style={{
              [dir === 'rtl' ? 'left' : 'right']: '0',
              background: 'var(--feeri-bg-card)',
              border: '1px solid var(--feeri-border)',
              boxShadow: '0 20px 60px var(--feeri-shadow)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--feeri-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
                {t('notifications')}
              </span>
              <button className="text-xs" style={{ color: 'oklch(0.55 0.28 300)' }}
                onClick={() => toast.success(lang === 'ar' ? 'تم تحديد الكل كمقروء' : 'All marked as read')}>
                {t('markAllRead')}
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--feeri-border-subtle)' }}>
              {notifications.map(n => (
                <div key={n.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--feeri-bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'opacity-0' : ''}`}
                    style={{ background: 'oklch(0.55 0.28 300)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed"
                      style={{ color: n.read ? 'var(--feeri-text-muted)' : 'var(--feeri-text-primary)' }}>
                      {lang === 'ar' ? n.titleAr : n.titleEn}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-faint)' }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
        style={{ background: 'var(--feeri-bg-input)', color: 'var(--feeri-text-muted)' }}>
        <TrendingUp size={12} style={{ color: 'oklch(0.78 0.18 85)' }} />
        {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </header>
  );
}
