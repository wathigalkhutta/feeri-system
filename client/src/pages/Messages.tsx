import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { useState, useMemo } from 'react';
import {
  Inbox, Send, Plus, X, Search, Trash2, CheckCheck,
  Mail, MailOpen, Users, Megaphone, ChevronRight, RefreshCw
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type Tab = 'inbox' | 'sent' | 'compose';

interface ComposeForm {
  recipientId: number | null;
  recipientName: string;
  messageType: 'direct' | 'broadcast';
  subject: string;
  body: string;
}

const defaultForm: ComposeForm = {
  recipientId: null,
  recipientName: '',
  messageType: 'direct',
  subject: '',
  body: '',
};

export default function Messages() {
  const { selectedCompany, lang } = useApp();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<Tab>('inbox');
  const [search, setSearch] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<number | null>(null);
  const [form, setForm] = useState<ComposeForm>(defaultForm);
  const [showCompose, setShowCompose] = useState(false);

  const companyId = Number(selectedCompany?.id ?? 0);
  const userId = Number(user?.id ?? 0);

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: inbox = [], refetch: refetchInbox } = trpc.internalMessages.inbox.useQuery(
    { companyId, userId },
    { enabled: !!companyId && !!userId }
  );

  const { data: sent = [], refetch: refetchSent } = trpc.internalMessages.sent.useQuery(
    { companyId, userId },
    { enabled: !!companyId && !!userId }
  );

  const { data: employees = [] } = trpc.employees.list.useQuery(
    { companyId },
    { enabled: !!companyId }
  );

  const { data: unreadCount = 0, refetch: refetchUnread } = trpc.internalMessages.unreadCount.useQuery(
    { companyId, userId },
    { enabled: !!companyId && !!userId }
  );

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const sendMsg = trpc.internalMessages.send.useMutation({
    onSuccess: () => {
      toast.success(lang === 'ar' ? 'تم إرسال الرسالة' : 'Message sent');
      setForm(defaultForm);
      setShowCompose(false);
      refetchInbox();
      refetchSent();
      refetchUnread();
    },
    onError: () => toast.error(lang === 'ar' ? 'فشل الإرسال' : 'Send failed'),
  });

  const markRead = trpc.internalMessages.markRead.useMutation({
    onSuccess: () => {
      refetchInbox();
      refetchUnread();
    },
  });

  const markAllRead = trpc.internalMessages.markAllRead.useMutation({
    onSuccess: () => {
      refetchInbox();
      refetchUnread();
      toast.success(lang === 'ar' ? 'تم تعليم الكل كمقروء' : 'All marked as read');
    },
  });

  const deleteMsg = trpc.internalMessages.delete.useMutation({
    onSuccess: () => {
      setSelectedMsg(null);
      refetchInbox();
      refetchSent();
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    },
  });

  // ─── Derived ───────────────────────────────────────────────────────────────
  const messages = activeTab === 'inbox' ? inbox : sent;

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter(m =>
      m.subject?.toLowerCase().includes(q) ||
      m.body.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q) ||
      m.recipientName?.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const selectedMessage = useMemo(
    () => messages.find(m => m.id === selectedMsg) ?? null,
    [messages, selectedMsg]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function openMessage(id: number, isRead: boolean) {
    setSelectedMsg(id);
    if (!isRead && activeTab === 'inbox') {
      markRead.mutate({ id });
    }
  }

  function handleSend() {
    if (!form.body.trim()) {
      toast.error(lang === 'ar' ? 'نص الرسالة مطلوب' : 'Message body required');
      return;
    }
    if (form.messageType === 'direct' && !form.recipientId) {
      toast.error(lang === 'ar' ? 'يرجى اختيار المستلم' : 'Please select a recipient');
      return;
    }
    sendMsg.mutate({
      companyId,
      senderId: userId,
      senderName: user?.name ?? 'Unknown',
      recipientId: form.messageType === 'direct' ? form.recipientId! : undefined,
      recipientName: form.messageType === 'direct' ? form.recipientName : undefined,
      subject: form.subject || undefined,
      body: form.body,
      messageType: form.messageType,
    });
  }

  // ─── Styles ────────────────────────────────────────────────────────────────
  const bg = 'var(--feeri-bg)';
  const cardBg = 'var(--feeri-bg-card)';
  const border = 'var(--feeri-border)';
  const textPrimary = 'var(--feeri-text-primary)';
  const textMuted = 'var(--feeri-text-muted)';
  const accent = 'oklch(0.65 0.22 265)';

  const tabs: { id: Tab; labelAr: string; labelEn: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inbox', labelAr: 'الوارد', labelEn: 'Inbox', icon: <Inbox size={16} />, badge: unreadCount },
    { id: 'sent', labelAr: 'الصادر', labelEn: 'Sent', icon: <Send size={16} /> },
  ];

  return (
    <Layout title={lang === 'ar' ? 'الرسائل الداخلية' : 'Internal Messages'}>
      <div className="flex flex-col h-full" style={{ background: bg, minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: border, background: cardBg }}>
          <div className="flex items-center gap-3">
            <Mail size={22} style={{ color: accent }} />
            <h1 className="text-xl font-bold" style={{ color: textPrimary }}>
              {lang === 'ar' ? 'الرسائل الداخلية' : 'Internal Messages'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate({ companyId, userId })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--feeri-bg-input)', color: textMuted }}
              >
                <CheckCheck size={14} />
                {lang === 'ar' ? 'تعليم الكل كمقروء' : 'Mark all read'}
              </button>
            )}
            <button
              onClick={() => { setShowCompose(true); setSelectedMsg(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: accent }}
            >
              <Plus size={16} />
              {lang === 'ar' ? 'رسالة جديدة' : 'New Message'}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* ── Sidebar: Tabs + List ── */}
          <div className="flex flex-col border-e" style={{ width: 320, borderColor: border, background: cardBg }}>

            {/* Tabs */}
            <div className="flex p-2 gap-1 border-b" style={{ borderColor: border }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setSelectedMsg(null); setSearch(''); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium relative"
                  style={{
                    background: activeTab === t.id ? accent : 'transparent',
                    color: activeTab === t.id ? 'white' : textMuted,
                  }}
                >
                  {t.icon}
                  {lang === 'ar' ? t.labelAr : t.labelEn}
                  {t.badge ? (
                    <span className="absolute -top-1 -end-1 text-xs font-bold text-white rounded-full w-4 h-4 flex items-center justify-center"
                      style={{ background: 'oklch(0.65 0.22 25)', fontSize: 10 }}>
                      {t.badge > 9 ? '9+' : t.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b" style={{ borderColor: border }}>
              <div className="relative">
                <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث في الرسائل...' : 'Search messages...'}
                  className="w-full ps-8 pe-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--feeri-bg-input)', color: textPrimary, border: `1px solid ${border}` }}
                />
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2" style={{ color: textMuted }}>
                  <MailOpen size={32} />
                  <p className="text-sm">{lang === 'ar' ? 'لا توجد رسائل' : 'No messages'}</p>
                </div>
              ) : (
                filtered.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => openMessage(msg.id, msg.isRead)}
                    className="w-full text-start px-4 py-3 border-b transition-colors"
                    style={{
                      borderColor: border,
                      background: selectedMsg === msg.id
                        ? 'var(--feeri-bg-hover)'
                        : (!msg.isRead && activeTab === 'inbox' ? 'color-mix(in oklch, var(--feeri-bg-card) 85%, oklch(0.65 0.22 265))' : 'transparent'),
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {!msg.isRead && activeTab === 'inbox' && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: textPrimary }}>
                            {activeTab === 'inbox' ? msg.senderName : (msg.recipientName ?? (lang === 'ar' ? 'للجميع' : 'Everyone'))}
                          </p>
                          {msg.subject && (
                            <p className="text-xs truncate" style={{ color: textMuted }}>{msg.subject}</p>
                          )}
                          <p className="text-xs truncate mt-0.5" style={{ color: textMuted }}>{msg.body}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {msg.messageType === 'broadcast' && (
                          <Megaphone size={12} style={{ color: 'oklch(0.78 0.18 85)' }} />
                        )}
                        <span className="text-xs" style={{ color: textMuted }}>
                          {new Date(msg.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Main: Message Detail or Compose ── */}
          <div className="flex-1 overflow-y-auto p-6">
            {showCompose ? (
              /* ── Compose Form ── */
              <div className="max-w-2xl mx-auto rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
                    {lang === 'ar' ? 'رسالة جديدة' : 'New Message'}
                  </h2>
                  <button onClick={() => setShowCompose(false)} style={{ color: textMuted }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Message Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: textMuted }}>
                    {lang === 'ar' ? 'نوع الرسالة' : 'Message Type'}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { v: 'direct', ar: 'رسالة فردية', en: 'Direct', icon: <Mail size={14} /> },
                      { v: 'broadcast', ar: 'للجميع', en: 'Broadcast', icon: <Megaphone size={14} /> },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => setForm(f => ({ ...f, messageType: opt.v as any, recipientId: null, recipientName: '' }))}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                          background: form.messageType === opt.v ? accent : 'var(--feeri-bg-input)',
                          color: form.messageType === opt.v ? 'white' : textMuted,
                          border: `1px solid ${form.messageType === opt.v ? accent : border}`,
                        }}
                      >
                        {opt.icon}
                        {lang === 'ar' ? opt.ar : opt.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient (direct only) */}
                {form.messageType === 'direct' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: textMuted }}>
                      {lang === 'ar' ? 'المستلم' : 'Recipient'} *
                    </label>
                    <select
                      value={form.recipientId ?? ''}
                      onChange={e => {
                        const val = e.target.value;
                        const emp = val ? employees.find(em => em.id === Number(val)) : undefined;
                        setForm(f => ({
                          ...f,
                          recipientId: emp ? emp.id : null,
                          recipientName: emp ? emp.nameAr : '',
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--feeri-bg-input)', color: textPrimary, border: `1px solid ${border}` }}
                    >
                      <option value="">{lang === 'ar' ? '-- اختر المستلم --' : '-- Select recipient --'}</option>
                      {employees.filter(e => e.id !== userId).map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nameAr} {emp.position ? `(${emp.position})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {form.messageType === 'broadcast' && (
                  <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'color-mix(in oklch, var(--feeri-bg-input) 80%, oklch(0.78 0.18 85))', border: `1px solid ${border}` }}>
                    <Users size={16} style={{ color: 'oklch(0.78 0.18 85)' }} />
                    <span className="text-sm" style={{ color: textPrimary }}>
                      {lang === 'ar' ? `سيتم إرسال الرسالة لجميع الموظفين (${employees.length} موظف)` : `Will be sent to all employees (${employees.length})`}
                    </span>
                  </div>
                )}

                {/* Subject */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: textMuted }}>
                    {lang === 'ar' ? 'الموضوع (اختياري)' : 'Subject (optional)'}
                  </label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder={lang === 'ar' ? 'موضوع الرسالة...' : 'Message subject...'}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--feeri-bg-input)', color: textPrimary, border: `1px solid ${border}` }}
                  />
                </div>

                {/* Body */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: textMuted }}>
                    {lang === 'ar' ? 'نص الرسالة' : 'Message'} *
                  </label>
                  <textarea
                    value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    rows={6}
                    placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: 'var(--feeri-bg-input)', color: textPrimary, border: `1px solid ${border}` }}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--feeri-bg-input)', color: textMuted }}
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sendMsg.isPending}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: accent, opacity: sendMsg.isPending ? 0.7 : 1 }}
                  >
                    <Send size={14} />
                    {sendMsg.isPending
                      ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                      : (lang === 'ar' ? 'إرسال' : 'Send')}
                  </button>
                </div>
              </div>

            ) : selectedMessage ? (
              /* ── Message Detail ── */
              <div className="max-w-2xl mx-auto rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
                      {selectedMessage.subject ?? (lang === 'ar' ? '(بدون موضوع)' : '(No subject)')}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm" style={{ color: textMuted }}>
                        {lang === 'ar' ? 'من:' : 'From:'} <strong style={{ color: textPrimary }}>{selectedMessage.senderName}</strong>
                      </span>
                      {selectedMessage.recipientName && (
                        <span className="text-sm" style={{ color: textMuted }}>
                          {lang === 'ar' ? 'إلى:' : 'To:'} <strong style={{ color: textPrimary }}>{selectedMessage.recipientName}</strong>
                        </span>
                      )}
                      {selectedMessage.messageType === 'broadcast' && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'color-mix(in oklch, var(--feeri-bg-input) 70%, oklch(0.78 0.18 85))', color: 'oklch(0.78 0.18 85)' }}>
                          <Megaphone size={10} />
                          {lang === 'ar' ? 'للجميع' : 'Broadcast'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: textMuted }}>
                      {new Date(selectedMessage.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteMsg.mutate({ id: selectedMessage.id })}
                      className="p-2 rounded-lg"
                      style={{ background: 'var(--feeri-bg-input)', color: 'oklch(0.65 0.22 25)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button onClick={() => setSelectedMsg(null)} style={{ color: textMuted }}>
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4" style={{ borderColor: border }}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textPrimary }}>
                    {selectedMessage.body}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t" style={{ borderColor: border }}>
                  <button
                    onClick={() => {
                      setForm({
                        recipientId: selectedMessage.senderId,
                        recipientName: selectedMessage.senderName,
                        messageType: 'direct',
                        subject: `رد: ${selectedMessage.subject ?? ''}`,
                        body: '',
                      });
                      setShowCompose(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--feeri-bg-input)', color: textPrimary, border: `1px solid ${border}` }}
                  >
                    <ChevronRight size={14} />
                    {lang === 'ar' ? 'رد على الرسالة' : 'Reply'}
                  </button>
                </div>
              </div>

            ) : (
              /* ── Empty State ── */
              <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: textMuted }}>
                <MailOpen size={56} strokeWidth={1} />
                <p className="text-lg font-medium" style={{ color: textPrimary }}>
                  {lang === 'ar' ? 'اختر رسالة للعرض' : 'Select a message to view'}
                </p>
                <p className="text-sm">
                  {lang === 'ar' ? 'أو أنشئ رسالة جديدة' : 'Or compose a new message'}
                </p>
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mt-2"
                  style={{ background: accent }}
                >
                  <Plus size={16} />
                  {lang === 'ar' ? 'رسالة جديدة' : 'New Message'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
