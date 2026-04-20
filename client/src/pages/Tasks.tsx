import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import {
  CheckSquare, Plus, Search, Mail, Send, X, Trash2, Edit2,
  AlertCircle, Clock, CheckCircle2, XCircle, Flag
} from 'lucide-react';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import { useTasks } from '@/hooks/useFeeriData';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Status   = 'todo' | 'in_progress' | 'done' | 'cancelled';

interface TaskForm {
  titleAr: string; titleEn: string; description: string;
  assignedTo: string; priority: Priority; status: Status; dueDate: string;
}

const defaultTask: TaskForm = {
  titleAr: '', titleEn: '', description: '', assignedTo: '',
  priority: 'medium', status: 'todo', dueDate: '',
};

const priorityColors: Record<Priority, string> = {
  low:    'oklch(0.65 0.20 160)',
  medium: 'oklch(0.78 0.18 85)',
  high:   'oklch(0.65 0.22 40)',
  urgent: 'oklch(0.60 0.22 25)',
};

const statusColors: Record<Status, string> = {
  todo:        'oklch(0.55 0.28 300)',
  in_progress: 'oklch(0.55 0.25 230)',
  done:        'oklch(0.65 0.20 160)',
  cancelled:   'oklch(0.50 0.05 0)',
};

export default function Tasks() {
  const { t, lang, selectedCompany } = useApp();
  const companyId = selectedCompany ? Number(selectedCompany.id) : 1;
  const { tasks, isLoading, createMutation, updateMutation, deleteMutation } = useTasks(companyId);
  const utils = trpc.useUtils();

  const [search, setSearch]                 = useState('');
  const [filterStatus, setFilterStatus]     = useState<Status | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox]       = useState(false);
  const [showForm, setShowForm]             = useState(false);
  const [editingId, setEditingId]           = useState<number | null>(null);
  const [form, setForm]                     = useState<TaskForm>(defaultTask);

  const setField = (k: keyof TaskForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const openCreate = () => { setForm(defaultTask); setEditingId(null); setShowForm(true); };
  const openEdit   = (task: typeof tasks[0]) => {
    setForm({
      titleAr:     task.titleAr,
      titleEn:     task.titleEn ?? '',
      description: task.description ?? '',
      assignedTo:  task.assignedTo ?? '',
      priority:    (task.priority as Priority) ?? 'medium',
      status:      (task.status as Status) ?? 'todo',
      dueDate:     task.dueDate ? String(task.dueDate).split('T')[0] : '',
    });
    setEditingId(Number(task.id));
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.titleAr) {
      toast.error(lang === 'ar' ? 'العنوان بالعربي مطلوب' : 'Arabic title is required');
      return;
    }
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: { status: form.status, priority: form.priority, assignedTo: form.assignedTo || undefined } },
        { onSuccess: () => { setShowForm(false); utils.tasks.list.invalidate(); } }
      );
    } else {
      createMutation.mutate(
        { companyId, titleAr: form.titleAr, titleEn: form.titleEn || undefined, description: form.description || undefined, assignedTo: form.assignedTo || undefined, priority: form.priority, status: form.status, dueDate: form.dueDate || undefined },
        { onSuccess: () => { setShowForm(false); utils.tasks.list.invalidate(); } }
      );
    }
  };

  const quickStatus = (id: number, status: Status) =>
    updateMutation.mutate({ id, data: { status } }, { onSuccess: () => utils.tasks.list.invalidate() });

  const filtered = tasks.filter(task => {
    const matchSearch   = task.titleAr.toLowerCase().includes(search.toLowerCase()) || (task.titleEn ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus   = filterStatus   === 'all' || task.status   === filterStatus;
    const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const todo       = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const urgent     = tasks.filter(t => t.priority === 'urgent').length;

  const priorityLabel = (p: string) => {
    const m: Record<string, { ar: string; en: string }> = {
      low:    { ar: 'منخفض', en: 'Low'    },
      medium: { ar: 'متوسط', en: 'Medium' },
      high:   { ar: 'عالي',  en: 'High'   },
      urgent: { ar: 'عاجل',  en: 'Urgent' },
    };
    return lang === 'ar' ? (m[p]?.ar ?? p) : (m[p]?.en ?? p);
  };

  const statusLabel = (s: string) => {
    const m: Record<string, { ar: string; en: string }> = {
      todo:        { ar: 'قيد الانتظار', en: 'To Do'       },
      in_progress: { ar: 'جارٍ العمل',   en: 'In Progress' },
      done:        { ar: 'مكتمل',        en: 'Done'        },
      cancelled:   { ar: 'ملغي',         en: 'Cancelled'   },
    };
    return lang === 'ar' ? (m[s]?.ar ?? s) : (m[s]?.en ?? s);
  };

  const statusIcon = (s: string) => {
    if (s === 'done')        return <CheckCircle2 size={12} />;
    if (s === 'in_progress') return <Clock size={12} />;
    if (s === 'cancelled')   return <XCircle size={12} />;
    return <AlertCircle size={12} />;
  };

  return (
    <Layout title={t('tasks')} subtitle={lang === 'ar' ? 'إدارة المهام والمتابعة' : 'Task management and tracking'}>
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="tasks" />
      <EmailInbox   isOpen={showEmailInbox}   onClose={() => setShowEmailInbox(false)}   module="tasks" />

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--feeri-text-primary)' }}>
                {editingId ? (lang === 'ar' ? 'تعديل المهمة' : 'Edit Task') : (lang === 'ar' ? 'مهمة جديدة' : 'New Task')}
              </h3>
              <button onClick={() => setShowForm(false)}><X size={18} style={{ color: 'var(--feeri-text-muted)' }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'العنوان بالعربي *' : 'Arabic Title *'}</label>
                <input value={form.titleAr} onChange={setField('titleAr')} dir="rtl"
                  className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                  style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'العنوان بالإنجليزي' : 'English Title'}</label>
                <input value={form.titleEn} onChange={setField('titleEn')}
                  className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                  style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الوصف' : 'Description'}</label>
                <textarea value={form.description} onChange={setField('description')} rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg outline-none resize-none"
                  style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'المسؤول' : 'Assigned To'}</label>
                  <input value={form.assignedTo} onChange={setField('assignedTo')}
                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                    style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                  <input type="date" value={form.dueDate} onChange={setField('dueDate')}
                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                    style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الأولوية' : 'Priority'}</label>
                  <select value={form.priority} onChange={setField('priority')}
                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                    style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
                    <option value="low">{lang === 'ar' ? 'منخفض' : 'Low'}</option>
                    <option value="medium">{lang === 'ar' ? 'متوسط' : 'Medium'}</option>
                    <option value="high">{lang === 'ar' ? 'عالي' : 'High'}</option>
                    <option value="urgent">{lang === 'ar' ? 'عاجل' : 'Urgent'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
                  <select value={form.status} onChange={setField('status')}
                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                    style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
                    <option value="todo">{lang === 'ar' ? 'قيد الانتظار' : 'To Do'}</option>
                    <option value="in_progress">{lang === 'ar' ? 'جارٍ العمل' : 'In Progress'}</option>
                    <option value="done">{lang === 'ar' ? 'مكتمل' : 'Done'}</option>
                    <option value="cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs rounded-lg"
                style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-xs rounded-lg font-semibold" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                {createMutation.isPending || updateMutation.isPending ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={lang === 'ar' ? 'قيد الانتظار' : 'To Do'}       value={todo}       icon={<AlertCircle size={20} />}  accentColor="purple" />
        <StatCard title={lang === 'ar' ? 'جارٍ العمل'   : 'In Progress'} value={inProgress} icon={<Clock size={20} />}         accentColor="cyan"   />
        <StatCard title={lang === 'ar' ? 'مكتملة'       : 'Done'}        value={done}       icon={<CheckSquare size={20} />}   accentColor="green"  />
        <StatCard title={lang === 'ar' ? 'عاجلة'        : 'Urgent'}      value={urgent}     icon={<Flag size={20} />}          accentColor="red"    />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute top-2.5 start-3" style={{ color: 'var(--feeri-text-faint)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search') + '...'}
              className="ps-8 pe-4 py-2 text-xs rounded-lg outline-none"
              style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)', width: '180px' }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | 'all')}
            className="px-3 py-2 text-xs rounded-lg outline-none"
            style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
            <option value="all">{lang === 'ar' ? 'كل الحالات' : 'All Status'}</option>
            <option value="todo">{lang === 'ar' ? 'قيد الانتظار' : 'To Do'}</option>
            <option value="in_progress">{lang === 'ar' ? 'جارٍ العمل' : 'In Progress'}</option>
            <option value="done">{lang === 'ar' ? 'مكتمل' : 'Done'}</option>
            <option value="cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
            className="px-3 py-2 text-xs rounded-lg outline-none"
            style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
            <option value="all">{lang === 'ar' ? 'كل الأولويات' : 'All Priorities'}</option>
            <option value="urgent">{lang === 'ar' ? 'عاجل' : 'Urgent'}</option>
            <option value="high">{lang === 'ar' ? 'عالي' : 'High'}</option>
            <option value="medium">{lang === 'ar' ? 'متوسط' : 'Medium'}</option>
            <option value="low">{lang === 'ar' ? 'منخفض' : 'Low'}</option>
          </select>
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
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
            <Plus size={14} /> {lang === 'ar' ? 'مهمة جديدة' : 'New Task'}
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl"
          style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          <CheckSquare size={40} style={{ color: 'var(--feeri-text-faint)' }} />
          <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
            {lang === 'ar' ? 'لا توجد مهام بعد' : 'No tasks yet'}
          </p>
          <button onClick={openCreate} className="px-4 py-2 text-xs rounded-lg font-semibold"
            style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
            {lang === 'ar' ? '+ أضف أول مهمة' : '+ Add First Task'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const pColor    = priorityColors[(task.priority as Priority) ?? 'medium'];
            const sColor    = statusColors[(task.status as Status) ?? 'todo'];
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && task.status !== 'cancelled';
            return (
              <div key={task.id} className="rounded-xl p-4 group relative flex items-start gap-4"
                style={{ background: 'var(--feeri-bg-card)', border: `1px solid ${isOverdue ? 'oklch(0.60 0.22 25 / 0.4)' : 'var(--feeri-border)'}` }}>
                {/* Priority Bar */}
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: pColor }} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>
                        {lang === 'ar' ? task.titleAr : (task.titleEn || task.titleAr)}
                      </p>
                      {task.description && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--feeri-text-muted)' }}>{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-purple-500/10">
                        <Edit2 size={12} style={{ color: 'oklch(0.55 0.28 300)' }} />
                      </button>
                      <button onClick={() => { if (confirm(lang === 'ar' ? 'حذف المهمة؟' : 'Delete task?')) deleteMutation.mutate({ id: Number(task.id) }); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10">
                        <Trash2 size={12} style={{ color: 'oklch(0.60 0.22 25)' }} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: sColor + '22', color: sColor }}>
                      {statusIcon(task.status ?? 'todo')}{statusLabel(task.status ?? 'todo')}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: pColor + '22', color: pColor }}>
                      <Flag size={9} />{priorityLabel(task.priority ?? 'medium')}
                    </span>
                    {task.assignedTo && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)' }}>
                        👤 {task.assignedTo}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: isOverdue ? 'oklch(0.60 0.22 25 / 0.15)' : 'var(--feeri-bg-elevated)', color: isOverdue ? 'oklch(0.60 0.22 25)' : 'var(--feeri-text-muted)' }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Status Buttons */}
                {task.status !== 'done' && task.status !== 'cancelled' && (
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {task.status === 'todo' && (
                      <button onClick={() => quickStatus(Number(task.id), 'in_progress')}
                        className="px-2 py-1 text-xs rounded-lg whitespace-nowrap"
                        style={{ background: 'oklch(0.55 0.25 230 / 0.15)', color: 'oklch(0.55 0.25 230)' }}>
                        {lang === 'ar' ? 'ابدأ' : 'Start'}
                      </button>
                    )}
                    <button onClick={() => quickStatus(Number(task.id), 'done')}
                      className="px-2 py-1 text-xs rounded-lg whitespace-nowrap"
                      style={{ background: 'oklch(0.65 0.20 160 / 0.15)', color: 'oklch(0.65 0.20 160)' }}>
                      {lang === 'ar' ? 'أتمم' : 'Done'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
