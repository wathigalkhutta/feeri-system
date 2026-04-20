// Feeri System - Business Development & Communications Module
// قسم تطوير الأعمال والمراسلات

import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import {
  Rocket, FolderKanban, Target, Handshake, MessageSquare,
  Plus, Search, X, Edit2, Trash2, ChevronRight,
  TrendingUp, CheckCircle2, Clock, AlertCircle, XCircle,
  Users, DollarSign, Calendar, Send, Inbox, RefreshCw,
  ArrowRight, Star, BarChart2, Zap, Eye
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'projects' | 'opportunities' | 'partnerships' | 'messages';

type ProjectStatus = 'new' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
type OppStatus = 'new' | 'negotiating' | 'won' | 'lost' | 'on_hold';
type OppSource = 'advertisement' | 'client' | 'partnership' | 'marketing' | 'referral' | 'other';
type MsgType = 'direct' | 'group' | 'broadcast';

interface ProjectForm {
  nameAr: string; nameEn: string; description: string;
  status: ProjectStatus; priority: ProjectPriority;
  progress: number; startDate: string; endDate: string;
  budget: string; clientName: string; teamMembers: string;
}
interface OppForm {
  title: string; description: string; source: OppSource;
  status: OppStatus; value: string; currency: string;
  probability: number; clientName: string; contactPerson: string;
  contactEmail: string; contactPhone: string; expectedCloseDate: string; notes: string;
}
interface MsgForm {
  recipientName: string; subject: string; body: string; messageType: MsgType;
}

const defaultProject: ProjectForm = {
  nameAr: '', nameEn: '', description: '', status: 'new', priority: 'medium',
  progress: 0, startDate: '', endDate: '', budget: '', clientName: '', teamMembers: '',
};
const defaultOpp: OppForm = {
  title: '', description: '', source: 'other', status: 'new', value: '',
  currency: 'SAR', probability: 50, clientName: '', contactPerson: '',
  contactEmail: '', contactPhone: '', expectedCloseDate: '', notes: '',
};
const defaultMsg: MsgForm = { recipientName: '', subject: '', body: '', messageType: 'direct' };

// ─── Color Maps ─────────────────────────────────────────────────────────────
const projectStatusColor: Record<ProjectStatus, string> = {
  new:        'oklch(0.55 0.28 300)',
  in_progress:'oklch(0.55 0.25 230)',
  completed:  'oklch(0.65 0.20 160)',
  on_hold:    'oklch(0.78 0.18 85)',
  cancelled:  'oklch(0.50 0.05 0)',
};
const projectStatusLabel: Record<ProjectStatus, { ar: string; en: string }> = {
  new:        { ar: 'جديد', en: 'New' },
  in_progress:{ ar: 'جاري', en: 'In Progress' },
  completed:  { ar: 'مكتمل', en: 'Completed' },
  on_hold:    { ar: 'متوقف', en: 'On Hold' },
  cancelled:  { ar: 'ملغي', en: 'Cancelled' },
};
const priorityColor: Record<ProjectPriority, string> = {
  low:      'oklch(0.65 0.20 160)',
  medium:   'oklch(0.78 0.18 85)',
  high:     'oklch(0.65 0.22 40)',
  critical: 'oklch(0.60 0.22 25)',
};
const priorityLabel: Record<ProjectPriority, { ar: string; en: string }> = {
  low:      { ar: 'منخفضة', en: 'Low' },
  medium:   { ar: 'متوسطة', en: 'Medium' },
  high:     { ar: 'عالية', en: 'High' },
  critical: { ar: 'حرجة', en: 'Critical' },
};
const oppStatusColor: Record<OppStatus, string> = {
  new:        'oklch(0.55 0.28 300)',
  negotiating:'oklch(0.55 0.25 230)',
  won:        'oklch(0.65 0.20 160)',
  lost:       'oklch(0.60 0.22 25)',
  on_hold:    'oklch(0.78 0.18 85)',
};
const oppStatusLabel: Record<OppStatus, { ar: string; en: string }> = {
  new:        { ar: 'جديدة', en: 'New' },
  negotiating:{ ar: 'قيد التفاوض', en: 'Negotiating' },
  won:        { ar: 'ناجحة', en: 'Won' },
  lost:       { ar: 'مرفوضة', en: 'Lost' },
  on_hold:    { ar: 'معلقة', en: 'On Hold' },
};
const sourceLabel: Record<OppSource, { ar: string; en: string }> = {
  advertisement:{ ar: 'إعلان', en: 'Advertisement' },
  client:       { ar: 'عميل', en: 'Client' },
  partnership:  { ar: 'شراكة', en: 'Partnership' },
  marketing:    { ar: 'تسويق', en: 'Marketing' },
  referral:     { ar: 'إحالة', en: 'Referral' },
  other:        { ar: 'أخرى', en: 'Other' },
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BusinessDevelopment() {
  const { lang, selectedCompany } = useApp();
  const { user } = useAuth();
  const companyId = selectedCompany ? Number(selectedCompany.id) : 1;
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');

  // ── Projects state ──
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(defaultProject);

  // ── Opportunities state ──
  const [showOppForm, setShowOppForm] = useState(false);
  const [editingOppId, setEditingOppId] = useState<number | null>(null);
  const [oppForm, setOppForm] = useState<OppForm>(defaultOpp);
  const [convertingOppId, setConvertingOppId] = useState<number | null>(null);

  // ── Messages state ──
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [msgForm, setMsgForm] = useState<MsgForm>(defaultMsg);

  // ── Data queries ──
  const { data: stats } = trpc.businessDev.stats.useQuery({ companyId });
  const { data: projects = [], isLoading: loadingProjects } = trpc.projects.list.useQuery({ companyId });
  const { data: opportunities = [], isLoading: loadingOpps } = trpc.opportunities.list.useQuery({ companyId });
  const { data: messages = [], isLoading: loadingMsgs } = trpc.internalMessages.list.useQuery({ companyId, userId: user?.id ? Number(user.id) : undefined });
  const { data: partnerships = [] } = trpc.partnerships.list.useQuery({ companyId });

  // ── Mutations ──
  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); utils.businessDev.stats.invalidate(); toast.success(lang === 'ar' ? 'تم إنشاء المشروع' : 'Project created'); setShowProjectForm(false); setProjectForm(defaultProject); },
    onError: () => toast.error(lang === 'ar' ? 'خطأ في الحفظ' : 'Save error'),
  });
  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated'); setShowProjectForm(false); setEditingProjectId(null); },
  });
  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); utils.businessDev.stats.invalidate(); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); },
  });

  const createOpp = trpc.opportunities.create.useMutation({
    onSuccess: () => { utils.opportunities.list.invalidate(); utils.businessDev.stats.invalidate(); toast.success(lang === 'ar' ? 'تم إضافة الفرصة' : 'Opportunity added'); setShowOppForm(false); setOppForm(defaultOpp); },
    onError: () => toast.error(lang === 'ar' ? 'خطأ في الحفظ' : 'Save error'),
  });
  const updateOpp = trpc.opportunities.update.useMutation({
    onSuccess: () => { utils.opportunities.list.invalidate(); toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated'); setShowOppForm(false); setEditingOppId(null); },
  });
  const deleteOpp = trpc.opportunities.delete.useMutation({
    onSuccess: () => { utils.opportunities.list.invalidate(); utils.businessDev.stats.invalidate(); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); },
  });
  const convertToProject = trpc.opportunities.convertToProject.useMutation({
    onSuccess: () => { utils.opportunities.list.invalidate(); utils.projects.list.invalidate(); utils.businessDev.stats.invalidate(); toast.success(lang === 'ar' ? 'تم تحويل الفرصة إلى مشروع' : 'Opportunity converted to project'); setConvertingOppId(null); },
  });

  const sendMessage = trpc.internalMessages.send.useMutation({
    onSuccess: () => { utils.internalMessages.list.invalidate(); toast.success(lang === 'ar' ? 'تم إرسال الرسالة' : 'Message sent'); setShowMsgForm(false); setMsgForm(defaultMsg); },
    onError: () => toast.error(lang === 'ar' ? 'خطأ في الإرسال' : 'Send error'),
  });
  const markRead = trpc.internalMessages.markRead.useMutation({
    onSuccess: () => { utils.internalMessages.list.invalidate(); utils.businessDev.stats.invalidate(); },
  });
  const deleteMsg = trpc.internalMessages.delete.useMutation({
    onSuccess: () => { utils.internalMessages.list.invalidate(); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); },
  });

  // ── Helpers ──
  const setProjectField = (k: keyof ProjectForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setProjectForm(p => ({ ...p, [k]: k === 'progress' ? Number(e.target.value) : e.target.value }));

  const setOppField = (k: keyof OppForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setOppForm(p => ({ ...p, [k]: k === 'probability' ? Number(e.target.value) : e.target.value }));

  const openEditProject = (p: any) => {
    setProjectForm({ nameAr: p.nameAr, nameEn: p.nameEn || '', description: p.description || '', status: p.status, priority: p.priority, progress: p.progress, startDate: p.startDate ? String(p.startDate).slice(0, 10) : '', endDate: p.endDate ? String(p.endDate).slice(0, 10) : '', budget: p.budget || '', clientName: p.clientName || '', teamMembers: p.teamMembers || '' });
    setEditingProjectId(p.id);
    setShowProjectForm(true);
  };
  const openEditOpp = (o: any) => {
    setOppForm({ title: o.title, description: o.description || '', source: o.source, status: o.status, value: o.value || '', currency: o.currency || 'SAR', probability: o.probability || 50, clientName: o.clientName || '', contactPerson: o.contactPerson || '', contactEmail: o.contactEmail || '', contactPhone: o.contactPhone || '', expectedCloseDate: o.expectedCloseDate ? String(o.expectedCloseDate).slice(0, 10) : '', notes: o.notes || '' });
    setEditingOppId(o.id);
    setShowOppForm(true);
  };

  const handleSaveProject = () => {
    if (!projectForm.nameAr.trim()) return toast.error(lang === 'ar' ? 'اسم المشروع مطلوب' : 'Project name required');
    if (editingProjectId) {
      updateProject.mutate({ id: editingProjectId, data: projectForm as any });
    } else {
      createProject.mutate({ companyId, ...projectForm });
    }
  };
  const handleSaveOpp = () => {
    if (!oppForm.title.trim()) return toast.error(lang === 'ar' ? 'عنوان الفرصة مطلوب' : 'Title required');
    if (editingOppId) {
      updateOpp.mutate({ id: editingOppId, data: oppForm as any });
    } else {
      createOpp.mutate({ companyId, ...oppForm });
    }
  };
  const handleSendMessage = () => {
    if (!msgForm.body.trim()) return toast.error(lang === 'ar' ? 'محتوى الرسالة مطلوب' : 'Message body required');
    sendMessage.mutate({
      companyId,
      senderId: user?.id ? Number(user.id) : 1,
      senderName: user?.name || 'مستخدم',
      recipientName: msgForm.recipientName || undefined,
      subject: msgForm.subject || undefined,
      body: msgForm.body,
      messageType: msgForm.messageType,
    });
  };

  const filteredProjects = useMemo(() =>
    projects.filter(p => p.nameAr.includes(search) || (p.clientName || '').includes(search)),
    [projects, search]);
  const filteredOpps = useMemo(() =>
    opportunities.filter(o => o.title.includes(search) || (o.clientName || '').includes(search)),
    [opportunities, search]);

  // ─── Tabs config ──────────────────────────────────────────────────────────
  const tabs: { id: Tab; labelAr: string; labelEn: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard',     labelAr: 'لوحة التحكم',   labelEn: 'Dashboard',      icon: <BarChart2 size={16} /> },
    { id: 'projects',      labelAr: 'المشاريع',       labelEn: 'Projects',       icon: <FolderKanban size={16} />, count: projects.length },
    { id: 'opportunities', labelAr: 'الفرص',          labelEn: 'Opportunities',  icon: <Target size={16} />, count: opportunities.filter(o => o.status === 'new').length },
    { id: 'partnerships',  labelAr: 'الشراكات',       labelEn: 'Partnerships',   icon: <Handshake size={16} />, count: partnerships.length },
    { id: 'messages',      labelAr: 'الرسائل',        labelEn: 'Messages',       icon: <MessageSquare size={16} />, count: messages.filter(m => !m.isRead).length },
  ];

  const cardBg = 'var(--feeri-bg-card)';
  const border = 'var(--feeri-border)';
  const accent = 'oklch(0.55 0.28 300)';
  const gold   = 'oklch(0.78 0.18 85)';
  const green  = 'oklch(0.65 0.20 160)';
  const textMuted = 'var(--feeri-text-muted)';

  return (
    <Layout
      title={lang === 'ar' ? 'تطوير الأعمال' : 'Business Development'}
      subtitle={lang === 'ar' ? 'إدارة المشاريع والفرص والمراسلات' : 'Projects, Opportunities & Communications'}
    >
      {/* ── Tab Bar ── */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: cardBg, border: `1px solid ${border}` }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap relative"
            style={{
              background: activeTab === tab.id ? accent : 'transparent',
              color: activeTab === tab.id ? 'white' : textMuted,
            }}
          >
            {tab.icon}
            <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: activeTab === tab.id ? 'white' : accent, color: activeTab === tab.id ? accent : 'white', minWidth: '20px', textAlign: 'center' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════ DASHBOARD TAB ══════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: lang === 'ar' ? 'مشاريع نشطة' : 'Active Projects', value: stats?.activeProjects ?? 0, icon: <FolderKanban size={20} />, color: accent },
              { label: lang === 'ar' ? 'فرص جديدة' : 'New Opportunities', value: stats?.newOpportunities ?? 0, icon: <Target size={20} />, color: gold },
              { label: lang === 'ar' ? 'فرص ناجحة' : 'Won Deals', value: stats?.wonOpportunities ?? 0, icon: <CheckCircle2 size={20} />, color: green },
              { label: lang === 'ar' ? 'إجمالي الفرص' : 'Total Opportunities', value: stats?.totalOpportunities ?? 0, icon: <BarChart2 size={20} />, color: 'oklch(0.55 0.25 230)' },
              { label: lang === 'ar' ? 'نسبة النجاح' : 'Win Rate', value: `${stats?.winRate ?? 0}%`, icon: <TrendingUp size={20} />, color: green },
              { label: lang === 'ar' ? 'رسائل غير مقروءة' : 'Unread Messages', value: stats?.unreadMessages ?? 0, icon: <MessageSquare size={20} />, color: 'oklch(0.65 0.22 40)' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.color + '20' }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--feeri-text-primary)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: textMuted }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Projects + Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <div className="rounded-xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? 'آخر المشاريع' : 'Recent Projects'}
                </h3>
                <button onClick={() => setActiveTab('projects')} className="text-xs flex items-center gap-1" style={{ color: accent }}>
                  {lang === 'ar' ? 'عرض الكل' : 'View all'} <ChevronRight size={12} />
                </button>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--feeri-bg)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: projectStatusColor[p.status as ProjectStatus] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--feeri-text-primary)' }}>{p.nameAr}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: border }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${p.progress}%`, background: accent }} />
                        </div>
                        <span className="text-xs" style={{ color: textMuted }}>{p.progress}%</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: projectStatusColor[p.status as ProjectStatus] + '20', color: projectStatusColor[p.status as ProjectStatus] }}>
                      {lang === 'ar' ? projectStatusLabel[p.status as ProjectStatus]?.ar : projectStatusLabel[p.status as ProjectStatus]?.en}
                    </span>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-sm text-center py-4" style={{ color: textMuted }}>{lang === 'ar' ? 'لا توجد مشاريع' : 'No projects'}</p>}
              </div>
            </div>

            {/* Recent Opportunities */}
            <div className="rounded-xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? 'آخر الفرص' : 'Recent Opportunities'}
                </h3>
                <button onClick={() => setActiveTab('opportunities')} className="text-xs flex items-center gap-1" style={{ color: accent }}>
                  {lang === 'ar' ? 'عرض الكل' : 'View all'} <ChevronRight size={12} />
                </button>
              </div>
              <div className="space-y-3">
                {opportunities.slice(0, 4).map(o => (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--feeri-bg)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: oppStatusColor[o.status as OppStatus] + '20' }}>
                      <Target size={14} style={{ color: oppStatusColor[o.status as OppStatus] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--feeri-text-primary)' }}>{o.title}</p>
                      <p className="text-xs truncate" style={{ color: textMuted }}>{o.clientName || (lang === 'ar' ? 'بدون عميل' : 'No client')}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold" style={{ color: gold }}>{o.value ? `${Number(o.value).toLocaleString()} ${o.currency}` : '—'}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: oppStatusColor[o.status as OppStatus] + '20', color: oppStatusColor[o.status as OppStatus] }}>
                        {lang === 'ar' ? oppStatusLabel[o.status as OppStatus]?.ar : oppStatusLabel[o.status as OppStatus]?.en}
                      </span>
                    </div>
                  </div>
                ))}
                {opportunities.length === 0 && <p className="text-sm text-center py-4" style={{ color: textMuted }}>{lang === 'ar' ? 'لا توجد فرص' : 'No opportunities'}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PROJECTS TAB ══════════════ */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'ar' ? 'بحث في المشاريع...' : 'Search projects...'} className="w-full ps-9 pe-4 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
            </div>
            <button onClick={() => { setProjectForm(defaultProject); setEditingProjectId(null); setShowProjectForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: accent, color: 'white' }}>
              <Plus size={16} /> {lang === 'ar' ? 'مشروع جديد' : 'New Project'}
            </button>
          </div>

          {loadingProjects ? (
            <div className="text-center py-12" style={{ color: textMuted }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map(p => (
                <div key={p.id} className="rounded-xl p-5 flex flex-col gap-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--feeri-text-primary)' }}>{p.nameAr}</h4>
                      {p.nameEn && <p className="text-xs truncate" style={{ color: textMuted }}>{p.nameEn}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEditProject(p)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: textMuted }}><Edit2 size={13} /></button>
                      <button onClick={() => { if (confirm(lang === 'ar' ? 'حذف المشروع؟' : 'Delete project?')) deleteProject.mutate({ id: p.id }); }} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: 'oklch(0.60 0.22 25)' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {p.description && <p className="text-xs line-clamp-2" style={{ color: textMuted }}>{p.description}</p>}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full" style={{ background: border }}>
                      <div className="h-2 rounded-full transition-all" style={{ width: `${p.progress}%`, background: accent }} />
                    </div>
                    <span className="text-xs font-bold w-8 text-end" style={{ color: accent }}>{p.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: projectStatusColor[p.status as ProjectStatus] + '20', color: projectStatusColor[p.status as ProjectStatus] }}>
                      {lang === 'ar' ? projectStatusLabel[p.status as ProjectStatus]?.ar : projectStatusLabel[p.status as ProjectStatus]?.en}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: priorityColor[p.priority as ProjectPriority] + '20', color: priorityColor[p.priority as ProjectPriority] }}>
                      {lang === 'ar' ? priorityLabel[p.priority as ProjectPriority]?.ar : priorityLabel[p.priority as ProjectPriority]?.en}
                    </span>
                    {p.clientName && <span className="text-xs" style={{ color: textMuted }}><Users size={11} className="inline me-1" />{p.clientName}</span>}
                  </div>
                  {(p.startDate || p.endDate) && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: textMuted }}>
                      <Calendar size={11} />
                      {p.startDate ? String(p.startDate).slice(0, 10) : '—'} → {p.endDate ? String(p.endDate).slice(0, 10) : '—'}
                    </div>
                  )}
                  {p.budget && <div className="text-xs font-medium" style={{ color: gold }}><DollarSign size={11} className="inline me-1" />{Number(p.budget).toLocaleString()} SAR</div>}
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-3 text-center py-16" style={{ color: textMuted }}>
                  <FolderKanban size={40} className="mx-auto mb-3 opacity-30" />
                  <p>{lang === 'ar' ? 'لا توجد مشاريع. أضف مشروعك الأول!' : 'No projects yet. Add your first project!'}</p>
                </div>
              )}
            </div>
          )}

          {/* Project Form Modal */}
          {showProjectForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--feeri-bg-card)', border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg" style={{ color: 'var(--feeri-text-primary)' }}>
                    {editingProjectId ? (lang === 'ar' ? 'تعديل المشروع' : 'Edit Project') : (lang === 'ar' ? 'مشروع جديد' : 'New Project')}
                  </h3>
                  <button onClick={() => setShowProjectForm(false)} style={{ color: textMuted }}><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'اسم المشروع (عربي) *' : 'Project Name (AR) *'}</label>
                      <input value={projectForm.nameAr} onChange={setProjectField('nameAr')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'اسم المشروع (إنجليزي)' : 'Project Name (EN)'}</label>
                      <input value={projectForm.nameEn} onChange={setProjectField('nameEn')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'الوصف' : 'Description'}</label>
                    <textarea value={projectForm.description} onChange={setProjectField('description')} rows={3} className="w-full px-3 py-2 rounded-lg text-sm border resize-none" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
                      <select value={projectForm.status} onChange={setProjectField('status')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }}>
                        {Object.entries(projectStatusLabel).map(([k, v]) => <option key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'الأولوية' : 'Priority'}</label>
                      <select value={projectForm.priority} onChange={setProjectField('priority')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }}>
                        {Object.entries(priorityLabel).map(([k, v]) => <option key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? `نسبة التقدم: ${projectForm.progress}%` : `Progress: ${projectForm.progress}%`}</label>
                    <input type="range" min={0} max={100} value={projectForm.progress} onChange={setProjectField('progress')} className="w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}</label>
                      <input type="date" value={projectForm.startDate} onChange={setProjectField('startDate')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</label>
                      <input type="date" value={projectForm.endDate} onChange={setProjectField('endDate')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'الميزانية (SAR)' : 'Budget (SAR)'}</label>
                      <input type="number" value={projectForm.budget} onChange={setProjectField('budget')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'اسم العميل' : 'Client Name'}</label>
                      <input value={projectForm.clientName} onChange={setProjectField('clientName')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'فريق العمل' : 'Team Members'}</label>
                    <input value={projectForm.teamMembers} onChange={setProjectField('teamMembers')} placeholder={lang === 'ar' ? 'أسماء مفصولة بفاصلة' : 'Comma-separated names'} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveProject} disabled={createProject.isPending || updateProject.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: accent, color: 'white' }}>
                      {lang === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                    <button onClick={() => setShowProjectForm(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: border, color: 'var(--feeri-text-primary)' }}>
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ OPPORTUNITIES TAB ══════════════ */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'ar' ? 'بحث في الفرص...' : 'Search opportunities...'} className="w-full ps-9 pe-4 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
            </div>
            <button onClick={() => { setOppForm(defaultOpp); setEditingOppId(null); setShowOppForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: gold, color: 'oklch(0.15 0.02 85)' }}>
              <Plus size={16} /> {lang === 'ar' ? 'فرصة جديدة' : 'New Opportunity'}
            </button>
          </div>

          {loadingOpps ? (
            <div className="text-center py-12" style={{ color: textMuted }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
          ) : (
            <div className="space-y-3">
              {filteredOpps.map(o => (
                <div key={o.id} className="rounded-xl p-4 flex items-center gap-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: oppStatusColor[o.status as OppStatus] + '20' }}>
                    <Target size={18} style={{ color: oppStatusColor[o.status as OppStatus] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>{o.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: oppStatusColor[o.status as OppStatus] + '20', color: oppStatusColor[o.status as OppStatus] }}>
                        {lang === 'ar' ? oppStatusLabel[o.status as OppStatus]?.ar : oppStatusLabel[o.status as OppStatus]?.en}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: border, color: textMuted }}>
                        {lang === 'ar' ? sourceLabel[o.source as OppSource]?.ar : sourceLabel[o.source as OppSource]?.en}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {o.clientName && <span className="text-xs" style={{ color: textMuted }}><Users size={11} className="inline me-1" />{o.clientName}</span>}
                      {o.contactPerson && <span className="text-xs" style={{ color: textMuted }}>{o.contactPerson}</span>}
                      <span className="text-xs" style={{ color: textMuted }}>{lang === 'ar' ? 'احتمالية:' : 'Probability:'} {o.probability}%</span>
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    {o.value && <p className="text-sm font-bold" style={{ color: gold }}>{Number(o.value).toLocaleString()} {o.currency}</p>}
                    {o.expectedCloseDate && <p className="text-xs" style={{ color: textMuted }}>{String(o.expectedCloseDate).slice(0, 10)}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {o.status !== 'won' && o.convertedToProjectId === null && (
                      <button onClick={() => setConvertingOppId(o.id)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" title={lang === 'ar' ? 'تحويل لمشروع' : 'Convert to project'} style={{ color: green }}><ArrowRight size={14} /></button>
                    )}
                    <button onClick={() => openEditOpp(o)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: textMuted }}><Edit2 size={13} /></button>
                    <button onClick={() => { if (confirm(lang === 'ar' ? 'حذف الفرصة؟' : 'Delete opportunity?')) deleteOpp.mutate({ id: o.id }); }} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: 'oklch(0.60 0.22 25)' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
              {filteredOpps.length === 0 && (
                <div className="text-center py-16" style={{ color: textMuted }}>
                  <Target size={40} className="mx-auto mb-3 opacity-30" />
                  <p>{lang === 'ar' ? 'لا توجد فرص. أضف فرصتك الأولى!' : 'No opportunities yet. Add your first!'}</p>
                </div>
              )}
            </div>
          )}

          {/* Convert to Project Modal */}
          {convertingOppId && (() => {
            const opp = opportunities.find(o => o.id === convertingOppId);
            if (!opp) return null;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
                <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--feeri-bg-card)', border: `1px solid ${border}` }}>
                  <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--feeri-text-primary)' }}>
                    {lang === 'ar' ? 'تحويل الفرصة إلى مشروع' : 'Convert to Project'}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: textMuted }}>
                    {lang === 'ar' ? `سيتم إنشاء مشروع جديد من الفرصة: "${opp.title}"` : `Creating a project from: "${opp.title}"`}
                  </p>
                  <div className="space-y-3">
                    <input placeholder={lang === 'ar' ? 'اسم المشروع (عربي) *' : 'Project Name (AR) *'} id="conv-name" className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} defaultValue={opp.title} />
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => {
                      const nameEl = document.getElementById('conv-name') as HTMLInputElement;
                      if (!nameEl?.value.trim()) return toast.error(lang === 'ar' ? 'اسم المشروع مطلوب' : 'Name required');
                      convertToProject.mutate({ opportunityId: convertingOppId, companyId, nameAr: nameEl.value, clientName: opp.clientName || undefined, description: opp.description || undefined });
                    }} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: green, color: 'white' }}>
                      {lang === 'ar' ? 'تحويل' : 'Convert'}
                    </button>
                    <button onClick={() => setConvertingOppId(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: border, color: 'var(--feeri-text-primary)' }}>
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Opportunity Form Modal */}
          {showOppForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--feeri-bg-card)', border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg" style={{ color: 'var(--feeri-text-primary)' }}>
                    {editingOppId ? (lang === 'ar' ? 'تعديل الفرصة' : 'Edit Opportunity') : (lang === 'ar' ? 'فرصة جديدة' : 'New Opportunity')}
                  </h3>
                  <button onClick={() => setShowOppForm(false)} style={{ color: textMuted }}><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'عنوان الفرصة *' : 'Title *'}</label>
                    <input value={oppForm.title} onChange={setOppField('title')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'المصدر' : 'Source'}</label>
                      <select value={oppForm.source} onChange={setOppField('source')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }}>
                        {Object.entries(sourceLabel).map(([k, v]) => <option key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
                      <select value={oppForm.status} onChange={setOppField('status')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }}>
                        {Object.entries(oppStatusLabel).map(([k, v]) => <option key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'القيمة المتوقعة' : 'Expected Value'}</label>
                      <input type="number" value={oppForm.value} onChange={setOppField('value')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? `الاحتمالية: ${oppForm.probability}%` : `Probability: ${oppForm.probability}%`}</label>
                      <input type="range" min={0} max={100} value={oppForm.probability} onChange={setOppField('probability')} className="w-full mt-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'اسم العميل' : 'Client Name'}</label>
                      <input value={oppForm.clientName} onChange={setOppField('clientName')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'جهة الاتصال' : 'Contact Person'}</label>
                      <input value={oppForm.contactPerson} onChange={setOppField('contactPerson')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                      <input type="email" value={oppForm.contactEmail} onChange={setOppField('contactEmail')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'الهاتف' : 'Phone'}</label>
                      <input value={oppForm.contactPhone} onChange={setOppField('contactPhone')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'تاريخ الإغلاق المتوقع' : 'Expected Close Date'}</label>
                    <input type="date" value={oppForm.expectedCloseDate} onChange={setOppField('expectedCloseDate')} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</label>
                    <textarea value={oppForm.notes} onChange={setOppField('notes')} rows={3} className="w-full px-3 py-2 rounded-lg text-sm border resize-none" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveOpp} disabled={createOpp.isPending || updateOpp.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: gold, color: 'oklch(0.15 0.02 85)' }}>
                      {lang === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                    <button onClick={() => setShowOppForm(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: border, color: 'var(--feeri-text-primary)' }}>
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ PARTNERSHIPS TAB ══════════════ */}
      {activeTab === 'partnerships' && (
        <div className="space-y-4">
          <div className="rounded-xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-3 mb-4">
              <Handshake size={20} style={{ color: accent }} />
              <h3 className="font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? 'الشراكات' : 'Partnerships'}</h3>
            </div>
            {partnerships.length === 0 ? (
              <div className="text-center py-12" style={{ color: textMuted }}>
                <Handshake size={40} className="mx-auto mb-3 opacity-30" />
                <p>{lang === 'ar' ? 'لا توجد شراكات مسجلة' : 'No partnerships registered'}</p>
                <p className="text-xs mt-1">{lang === 'ar' ? 'يمكنك إضافة الشراكات من قسم الشراكات الرئيسي' : 'You can add partnerships from the main Partnerships section'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {partnerships.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--feeri-bg)', border: `1px solid ${border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accent + '20' }}>
                      <Handshake size={18} style={{ color: accent }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? p.nameAr : (p.nameEn || p.nameAr)}</p>
                      <p className="text-xs" style={{ color: textMuted }}>{p.partnershipType} • {p.sharePercentage}%</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: p.status === 'active' ? green + '20' : border, color: p.status === 'active' ? green : textMuted }}>
                      {p.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ MESSAGES TAB ══════════════ */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold flex-1" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'الرسائل الداخلية' : 'Internal Messages'}
            </h3>
            <button onClick={() => utils.internalMessages.list.invalidate()} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: textMuted }} title={lang === 'ar' ? 'تحديث' : 'Refresh'}>
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setShowMsgForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: accent, color: 'white' }}>
              <Send size={16} /> {lang === 'ar' ? 'رسالة جديدة' : 'New Message'}
            </button>
          </div>

          {loadingMsgs ? (
            <div className="text-center py-12" style={{ color: textMuted }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
          ) : (
            <div className="space-y-2">
              {messages.map(m => (
                <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl transition-all" style={{ background: m.isRead ? cardBg : accent + '10', border: `1px solid ${m.isRead ? border : accent + '40'}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ background: accent + '20', color: accent }}>
                    {m.senderName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: 'var(--feeri-text-primary)' }}>{m.senderName}</span>
                      {m.recipientName && <span className="text-xs" style={{ color: textMuted }}>→ {m.recipientName}</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: border, color: textMuted }}>
                        {m.messageType === 'direct' ? (lang === 'ar' ? 'مباشر' : 'Direct') : m.messageType === 'group' ? (lang === 'ar' ? 'مجموعة' : 'Group') : (lang === 'ar' ? 'عام' : 'Broadcast')}
                      </span>
                      {!m.isRead && <span className="w-2 h-2 rounded-full" style={{ background: accent }} />}
                    </div>
                    {m.subject && <p className="text-xs font-medium mt-0.5" style={{ color: gold }}>{m.subject}</p>}
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: textMuted }}>{m.body}</p>
                    <p className="text-xs mt-1" style={{ color: textMuted }}>{new Date(m.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!m.isRead && (
                      <button onClick={() => markRead.mutate({ id: m.id })} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" title={lang === 'ar' ? 'تحديد كمقروء' : 'Mark as read'} style={{ color: green }}><Eye size={13} /></button>
                    )}
                    <button onClick={() => { if (confirm(lang === 'ar' ? 'حذف الرسالة؟' : 'Delete message?')) deleteMsg.mutate({ id: m.id }); }} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: 'oklch(0.60 0.22 25)' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-16" style={{ color: textMuted }}>
                  <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                  <p>{lang === 'ar' ? 'لا توجد رسائل. ابدأ محادثة جديدة!' : 'No messages yet. Start a conversation!'}</p>
                </div>
              )}
            </div>
          )}

          {/* Message Form Modal */}
          {showMsgForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--feeri-bg-card)', border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg" style={{ color: 'var(--feeri-text-primary)' }}>{lang === 'ar' ? 'رسالة جديدة' : 'New Message'}</h3>
                  <button onClick={() => setShowMsgForm(false)} style={{ color: textMuted }}><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'نوع الرسالة' : 'Message Type'}</label>
                    <select value={msgForm.messageType} onChange={e => setMsgForm(p => ({ ...p, messageType: e.target.value as MsgType }))} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }}>
                      <option value="direct">{lang === 'ar' ? 'مباشر' : 'Direct'}</option>
                      <option value="group">{lang === 'ar' ? 'مجموعة' : 'Group'}</option>
                      <option value="broadcast">{lang === 'ar' ? 'عام للجميع' : 'Broadcast'}</option>
                    </select>
                  </div>
                  {msgForm.messageType === 'direct' && (
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'المستلم' : 'Recipient'}</label>
                      <input value={msgForm.recipientName} onChange={e => setMsgForm(p => ({ ...p, recipientName: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                    </div>
                  )}
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'الموضوع' : 'Subject'}</label>
                    <input value={msgForm.subject} onChange={e => setMsgForm(p => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: textMuted }}>{lang === 'ar' ? 'محتوى الرسالة *' : 'Message Body *'}</label>
                    <textarea value={msgForm.body} onChange={e => setMsgForm(p => ({ ...p, body: e.target.value }))} rows={5} className="w-full px-3 py-2 rounded-lg text-sm border resize-none" style={{ background: cardBg, borderColor: border, color: 'var(--feeri-text-primary)' }} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSendMessage} disabled={sendMessage.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2" style={{ background: accent, color: 'white' }}>
                      <Send size={14} /> {lang === 'ar' ? 'إرسال' : 'Send'}
                    </button>
                    <button onClick={() => setShowMsgForm(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: border, color: 'var(--feeri-text-primary)' }}>
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
