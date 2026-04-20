// Feeri System - Email Composer Component
// Shared across all modules - supports internal/external, general/private emails

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { X, Send, Mail, Users, Lock, Globe, Paperclip, Star, Trash2, Eye, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  module?: string;
  defaultTo?: string;
  defaultToEmail?: string;
  defaultSubject?: string;
}

const internalRecipients = [
  { nameAr: 'جميع الموظفين', nameEn: 'All Employees', email: 'all@feeri.com' },
  { nameAr: 'قسم المحاسبة', nameEn: 'Accounting Dept', email: 'accounting@feeri.com' },
  { nameAr: 'قسم الموارد البشرية', nameEn: 'HR Dept', email: 'hr@feeri.com' },
  { nameAr: 'قسم المبيعات', nameEn: 'Sales Dept', email: 'sales@feeri.com' },
  { nameAr: 'قسم تقنية المعلومات', nameEn: 'IT Dept', email: 'it@feeri.com' },
  { nameAr: 'رحاب سيدحمد', nameEn: 'Rehab Sidahmed', email: 'manager@feeri.com' },
  { nameAr: 'الواثق صلاح', nameEn: 'Wathig Salah', email: 'employee@feeri.com' },
];

export function EmailComposer({ isOpen, onClose, module = 'general', defaultTo = '', defaultToEmail = '', defaultSubject = '' }: EmailComposerProps) {
  const { lang } = useApp();
  const { user } = useAuth();
  const { addEmail } = useData();

  const [emailType, setEmailType] = useState<'internal' | 'external'>('internal');
  const [visibility, setVisibility] = useState<'general' | 'private'>('private');
  const [toName, setToName] = useState(defaultTo);
  const [toEmail, setToEmail] = useState(defaultToEmail);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [showRecipients, setShowRecipients] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!toName || !toEmail || !subject || !body) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    addEmail({
      type: emailType,
      visibility,
      fromName: lang === 'ar' ? (user?.name || 'Sabri Garza ') : (user?.nameEn || 'Sabri Garza '),
      fromEmail: user?.email || 'owner@feeri.com',
      toName,
      toEmail,
      subject,
      body,
      module,
    });
    toast.success(lang === 'ar' ? 'تم إرسال الإيميل بنجاح ✓' : 'Email sent successfully ✓');
    setToName(''); setToEmail(''); setSubject(''); setBody('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.55 0.28 300 / 0.15)' }}>
              <Mail size={16} style={{ color: 'oklch(0.55 0.28 300)' }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'إنشاء إيميل جديد' : 'New Email'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--feeri-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type & Visibility toggles */}
          <div className="flex gap-3">
            {/* Email Type */}
            <div className="flex-1">
              <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--feeri-text-muted)' }}>
                {lang === 'ar' ? 'نوع الإيميل' : 'Email Type'}
              </p>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--feeri-border)' }}>
                {(['internal', 'external'] as const).map(t => (
                  <button key={t} onClick={() => setEmailType(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
                    style={{ background: emailType === t ? 'oklch(0.55 0.28 300)' : 'transparent', color: emailType === t ? 'white' : 'var(--feeri-text-muted)' }}>
                    {t === 'internal' ? <Users size={12} /> : <Globe size={12} />}
                    {t === 'internal' ? (lang === 'ar' ? 'داخلي' : 'Internal') : (lang === 'ar' ? 'خارجي' : 'External')}
                  </button>
                ))}
              </div>
            </div>
            {/* Visibility */}
            <div className="flex-1">
              <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--feeri-text-muted)' }}>
                {lang === 'ar' ? 'الخصوصية' : 'Visibility'}
              </p>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--feeri-border)' }}>
                {(['private', 'general'] as const).map(v => (
                  <button key={v} onClick={() => setVisibility(v)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
                    style={{ background: visibility === v ? (v === 'general' ? 'oklch(0.78 0.18 85)' : 'oklch(0.72 0.16 200)') : 'transparent', color: visibility === v ? 'white' : 'var(--feeri-text-muted)' }}>
                    {v === 'private' ? <Lock size={12} /> : <Globe size={12} />}
                    {v === 'private' ? (lang === 'ar' ? 'خاص' : 'Private') : (lang === 'ar' ? 'عام' : 'General')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* To Field */}
          <div className="relative">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--feeri-text-muted)' }}>
              {lang === 'ar' ? 'إلى' : 'To'}
            </label>
            <div className="flex gap-2">
              <input
                value={toName}
                onChange={e => setToName(e.target.value)}
                placeholder={lang === 'ar' ? 'اسم المستلم' : 'Recipient name'}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
              />
              <input
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
              />
              {emailType === 'internal' && (
                <button onClick={() => setShowRecipients(!showRecipients)}
                  className="px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-all"
                  style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
                  <Users size={12} />
                  <ChevronDown size={10} className={showRecipients ? 'rotate-180' : ''} />
                </button>
              )}
            </div>
            {showRecipients && emailType === 'internal' && (
              <div className="absolute top-full mt-1 left-0 right-0 z-10 rounded-xl overflow-hidden shadow-xl border"
                style={{ background: 'var(--feeri-bg-card)', borderColor: 'var(--feeri-border)' }}>
                {internalRecipients.map(r => (
                  <button key={r.email} onClick={() => { setToName(lang === 'ar' ? r.nameAr : r.nameEn); setToEmail(r.email); setShowRecipients(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs hover:bg-white/5 transition-colors text-start"
                    style={{ color: 'var(--feeri-text-primary)' }}>
                    <span>{lang === 'ar' ? r.nameAr : r.nameEn}</span>
                    <span style={{ color: 'var(--feeri-text-muted)' }}>{r.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--feeri-text-muted)' }}>
              {lang === 'ar' ? 'الموضوع' : 'Subject'}
            </label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder={lang === 'ar' ? 'موضوع الإيميل' : 'Email subject'}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--feeri-text-muted)' }}>
              {lang === 'ar' ? 'نص الرسالة' : 'Message'}
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
              placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--feeri-bg-elevated)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/5"
              style={{ color: 'var(--feeri-text-muted)' }}>
              <Paperclip size={13} />
              {lang === 'ar' ? 'إرفاق ملف' : 'Attach File'}
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleSend}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                <Send size={13} />
                {lang === 'ar' ? 'إرسال' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Email Inbox Panel (shown in all modules) ────────────────────────────────

interface EmailInboxProps {
  isOpen: boolean;
  onClose: () => void;
  module?: string;
}

export function EmailInbox({ isOpen, onClose, module }: EmailInboxProps) {
  const { lang } = useApp();
  const { emails, markEmailRead, toggleStar, deleteEmail } = useData();
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'internal' | 'external' | 'starred'>('all');

  if (!isOpen) return null;

  const filtered = emails.filter(e => {
    if (filter === 'internal') return e.type === 'internal';
    if (filter === 'external') return e.type === 'external';
    if (filter === 'starred') return e.starred;
    return true;
  });

  const selected = emails.find(e => e.id === selectedEmail);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.55 0.28 300 / 0.15)' }}>
              <Mail size={16} style={{ color: 'oklch(0.55 0.28 300)' }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>
              {lang === 'ar' ? 'صندوق الإيميلات' : 'Email Inbox'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)' }}>
              {emails.filter(e => !e.read).length} {lang === 'ar' ? 'غير مقروء' : 'unread'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--feeri-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 border-e flex flex-col flex-shrink-0" style={{ borderColor: 'var(--feeri-border)' }}>
            {/* Filters */}
            <div className="p-3 border-b space-y-1" style={{ borderColor: 'var(--feeri-border)' }}>
              {([
                { key: 'all', labelAr: 'الكل', labelEn: 'All', icon: <Mail size={13} /> },
                { key: 'internal', labelAr: 'داخلي', labelEn: 'Internal', icon: <Users size={13} /> },
                { key: 'external', labelAr: 'خارجي', labelEn: 'External', icon: <Globe size={13} /> },
                { key: 'starred', labelAr: 'المميزة', labelEn: 'Starred', icon: <Star size={13} /> },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-start"
                  style={{ background: filter === f.key ? 'oklch(0.55 0.28 300 / 0.15)' : 'transparent', color: filter === f.key ? 'oklch(0.55 0.28 300)' : 'var(--feeri-text-muted)' }}>
                  {f.icon}
                  {lang === 'ar' ? f.labelAr : f.labelEn}
                  <span className="ms-auto text-xs">
                    {f.key === 'all' ? emails.length : f.key === 'starred' ? emails.filter(e => e.starred).length : emails.filter(e => e.type === f.key).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.map(email => (
                <button key={email.id} onClick={() => { setSelectedEmail(email.id); markEmailRead(email.id); }}
                  className="w-full p-3 border-b text-start transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--feeri-border)', background: selectedEmail === email.id ? 'oklch(0.55 0.28 300 / 0.08)' : 'transparent' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold truncate" style={{ color: email.read ? 'var(--feeri-text-muted)' : 'var(--feeri-text-primary)', fontWeight: email.read ? 400 : 600 }}>
                      {email.toName}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!email.read && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.55 0.28 300)' }} />}
                      {email.starred && <Star size={10} style={{ color: 'oklch(0.78 0.18 85)' }} fill="oklch(0.78 0.18 85)" />}
                    </div>
                  </div>
                  <p className="text-xs truncate mb-1" style={{ color: 'var(--feeri-text-primary)' }}>{email.subject}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                      background: email.type === 'internal' ? 'oklch(0.72 0.16 200 / 0.15)' : 'oklch(0.78 0.18 85 / 0.15)',
                      color: email.type === 'internal' ? 'oklch(0.72 0.16 200)' : 'oklch(0.78 0.18 85)',
                    }}>
                      {email.type === 'internal' ? (lang === 'ar' ? 'داخلي' : 'Internal') : (lang === 'ar' ? 'خارجي' : 'External')}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{formatDate(email.date)}</span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <Mail size={24} style={{ color: 'var(--feeri-text-faint)' }} />
                  <p className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{lang === 'ar' ? 'لا توجد رسائل' : 'No emails'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 overflow-y-auto">
            {selected ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold mb-1" style={{ color: 'var(--feeri-text-primary)' }}>{selected.subject}</h2>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                      <span>{lang === 'ar' ? 'من:' : 'From:'} <strong style={{ color: 'var(--feeri-text-primary)' }}>{selected.fromName}</strong> ({selected.fromEmail})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: 'var(--feeri-text-muted)' }}>
                      <span>{lang === 'ar' ? 'إلى:' : 'To:'} <strong style={{ color: 'var(--feeri-text-primary)' }}>{selected.toName}</strong> ({selected.toEmail})</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--feeri-text-faint)' }}>{formatDate(selected.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full" style={{
                      background: selected.visibility === 'private' ? 'oklch(0.72 0.16 200 / 0.15)' : 'oklch(0.78 0.18 85 / 0.15)',
                      color: selected.visibility === 'private' ? 'oklch(0.72 0.16 200)' : 'oklch(0.78 0.18 85)',
                    }}>
                      {selected.visibility === 'private' ? (lang === 'ar' ? 'خاص' : 'Private') : (lang === 'ar' ? 'عام' : 'General')}
                    </span>
                    <button onClick={() => toggleStar(selected.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <Star size={14} style={{ color: selected.starred ? 'oklch(0.78 0.18 85)' : 'var(--feeri-text-muted)' }} fill={selected.starred ? 'oklch(0.78 0.18 85)' : 'none'} />
                    </button>
                    <button onClick={() => { deleteEmail(selected.id); setSelectedEmail(null); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14} style={{ color: 'oklch(0.60 0.22 25)' }} />
                    </button>
                  </div>
                </div>
                <div className="rounded-xl p-5 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-primary)', border: '1px solid var(--feeri-border)' }}>
                  {selected.body}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'oklch(0.55 0.28 300 / 0.1)' }}>
                  <Mail size={28} style={{ color: 'oklch(0.55 0.28 300 / 0.5)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'اختر رسالة لعرضها' : 'Select an email to read'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
