// Feeri System - Stat Card Component
// Design: Corporate - supports Light and Dark mode via CSS variables

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  accentColor?: 'purple' | 'yellow' | 'cyan' | 'green' | 'red';
  prefix?: string;
  suffix?: string;
}

const accentStyles = {
  purple: {
    iconBg: 'oklch(0.55 0.28 300 / 0.15)',
    iconColor: 'oklch(0.55 0.28 300)',
    glow: 'oklch(0.55 0.28 300 / 0.08)',
    border: 'oklch(0.55 0.28 300 / 0.2)',
  },
  yellow: {
    iconBg: 'oklch(0.78 0.18 85 / 0.15)',
    iconColor: 'oklch(0.78 0.18 85)',
    glow: 'oklch(0.78 0.18 85 / 0.08)',
    border: 'oklch(0.78 0.18 85 / 0.2)',
  },
  cyan: {
    iconBg: 'oklch(0.72 0.16 200 / 0.15)',
    iconColor: 'oklch(0.72 0.16 200)',
    glow: 'oklch(0.72 0.16 200 / 0.08)',
    border: 'oklch(0.72 0.16 200 / 0.2)',
  },
  green: {
    iconBg: 'oklch(0.65 0.20 160 / 0.15)',
    iconColor: 'oklch(0.65 0.20 160)',
    glow: 'oklch(0.65 0.20 160 / 0.08)',
    border: 'oklch(0.65 0.20 160 / 0.2)',
  },
  red: {
    iconBg: 'oklch(0.60 0.22 25 / 0.15)',
    iconColor: 'oklch(0.60 0.22 25)',
    glow: 'oklch(0.60 0.22 25 / 0.08)',
    border: 'oklch(0.60 0.22 25 / 0.2)',
  },
};

export default function StatCard({ title, value, subtitle, icon, trend, accentColor = 'purple', prefix, suffix }: StatCardProps) {
  const { lang } = useApp();
  const accent = accentStyles[accentColor];

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div
      className="group"
      style={{
        background: 'var(--feeri-bg-card)',
        border: `1px solid ${accent.border}`,
        boxShadow: `0 4px 20px ${accent.glow}`,
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: accent.iconBg }}
        >
          <span style={{ color: accent.iconColor }}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{
              background: trendPositive ? 'oklch(0.65 0.20 160 / 0.15)' : trendNegative ? 'oklch(0.60 0.22 25 / 0.15)' : 'var(--feeri-bg-input)',
              color: trendPositive ? 'oklch(0.65 0.20 160)' : trendNegative ? 'oklch(0.60 0.22 25)' : 'var(--feeri-text-muted)',
            }}
          >
            {trendPositive ? <TrendingUp size={10} /> : trendNegative ? <TrendingDown size={10} /> : <Minus size={10} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{title}</p>
        <p className="text-2xl font-bold leading-tight"
          style={{ color: 'var(--feeri-text-primary)', fontFamily: 'Roboto Mono, Cairo, monospace' }}>
          {prefix && <span className="text-sm font-normal me-1" style={{ color: 'var(--feeri-text-muted)' }}>{prefix}</span>}
          {typeof value === 'number' ? value.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US') : value}
          {suffix && <span className="text-sm font-normal ms-1" style={{ color: 'var(--feeri-text-muted)' }}>{suffix}</span>}
        </p>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: 'var(--feeri-text-faint)' }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
