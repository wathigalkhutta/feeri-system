// Feeri System - Main Layout
// Design: Corporate - supports Light and Dark mode via CSS variables

import { useApp } from '@/contexts/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const { dir } = useApp();

  return (
    <div className="flex h-screen overflow-hidden" dir={dir}
      style={{ background: 'var(--feeri-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
