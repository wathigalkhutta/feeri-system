// Feeri System - CRM Page
// Design: Corporate Dark Luxury

import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Users, UserPlus, TrendingUp, Phone, Mail, MapPin, Star, Search, Filter, Plus, MoreVertical, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const clients = [
  { id: 1, nameAr: 'شركة الأمل للتجارة', nameEn: 'Al-Amal Trading', contactAr: 'أحمد محمد', contactEn: 'Ahmed Mohammed', phone: '+966 50 123 4567', email: 'ahmed@alamal.com', cityAr: 'الرياض', cityEn: 'Riyadh', status: 'active', value: 285000, rating: 5, type: 'corporate' },
  { id: 2, nameAr: 'مجموعة النجم', nameEn: 'Al-Najm Group', contactAr: 'فاطمة علي', contactEn: 'Fatima Ali', phone: '+966 55 234 5678', email: 'fatima@najm.com', cityAr: 'جدة', cityEn: 'Jeddah', status: 'active', value: 520000, rating: 4, type: 'corporate' },
  { id: 3, nameAr: 'شركة الفجر', nameEn: 'Al-Fajr Company', contactAr: 'خالد عبدالله', contactEn: 'Khalid Abdullah', phone: '+966 56 345 6789', email: 'khalid@alfajr.com', cityAr: 'الدمام', cityEn: 'Dammam', status: 'pending', value: 95000, rating: 3, type: 'sme' },
  { id: 4, nameAr: 'مؤسسة الريادة', nameEn: 'Al-Riyada Foundation', contactAr: 'نورة سعد', contactEn: 'Noura Saad', phone: '+966 54 456 7890', email: 'noura@riyada.com', cityAr: 'الرياض', cityEn: 'Riyadh', status: 'active', value: 180000, rating: 5, type: 'corporate' },
  { id: 5, nameAr: 'شركة المستقبل', nameEn: 'Al-Mustaqbal Co.', contactAr: 'عمر حسن', contactEn: 'Omar Hassan', phone: '+966 58 567 8901', email: 'omar@mustaqbal.com', cityAr: 'مكة', cityEn: 'Makkah', status: 'inactive', value: 45000, rating: 2, type: 'sme' },
  { id: 6, nameAr: 'مجموعة الخليج', nameEn: 'Gulf Group', contactAr: 'سارة إبراهيم', contactEn: 'Sara Ibrahim', phone: '+966 59 678 9012', email: 'sara@gulf.com', cityAr: 'جدة', cityEn: 'Jeddah', status: 'active', value: 750000, rating: 5, type: 'enterprise' },
];

const leads = [
  { id: 1, nameAr: 'شركة الإبداع', nameEn: 'Innovation Co.', stageAr: 'اتصال أولي', stageEn: 'Initial Contact', probability: 20, valueAr: '50,000 ر.س', valueEn: 'SAR 50,000' },
  { id: 2, nameAr: 'مؤسسة التميز', nameEn: 'Excellence Foundation', stageAr: 'عرض مقدم', stageEn: 'Proposal Sent', probability: 60, valueAr: '120,000 ر.س', valueEn: 'SAR 120,000' },
  { id: 3, nameAr: 'شركة الرواد', nameEn: 'Al-Rowad Company', stageAr: 'تفاوض', stageEn: 'Negotiation', probability: 80, valueAr: '280,000 ر.س', valueEn: 'SAR 280,000' },
];

export default function CRM() {
  const { t, lang } = useApp();
  const [activeTab, setActiveTab] = useState<'clients' | 'leads'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);

  const filtered = clients.filter(c => {
    const name = lang === 'ar' ? c.nameAr : c.nameEn;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; labelEn: string; color: string }> = {
      active: { label: 'نشط', labelEn: 'Active', color: 'oklch(0.65 0.20 160)' },
      pending: { label: 'معلق', labelEn: 'Pending', color: 'oklch(0.78 0.18 85)' },
      inactive: { label: 'غير نشط', labelEn: 'Inactive', color: 'oklch(0.60 0.22 25)' },
    };
    const s = map[status] || map.active;
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: s.color + '22', color: s.color }}>
        {lang === 'ar' ? s.label : s.labelEn}
      </span>
    );
  };

  return (
    <Layout title={t('crm')} subtitle={lang === 'ar' ? 'إدارة العملاء والفرص' : 'Manage clients and opportunities'}>
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="crm" />
      <EmailInbox isOpen={showEmailInbox} onClose={() => setShowEmailInbox(false)} module="crm" />
      {/* Email Actions */}
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => setShowEmailInbox(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
          <Mail size={13} /> {lang === 'ar' ? 'البريد الوارد' : 'Inbox'}
        </button>
        <button onClick={() => setShowEmailComposer(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'oklch(0.55 0.28 300 / 0.15)', color: 'oklch(0.55 0.28 300)', border: '1px solid oklch(0.55 0.28 300 / 0.3)' }}>
          <Send size={13} /> {lang === 'ar' ? 'إرسال إيميل' : 'Send Email'}
        </button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={t('activeClients')} value={clients.filter(c => c.status === 'active').length} trend={8} icon={<Users size={20} />} accentColor="purple" />
        <StatCard title={t('leads')} value={leads.length} trend={15} icon={<UserPlus size={20} />} accentColor="yellow" />
        <StatCard title={lang === 'ar' ? 'إجمالي قيمة العملاء' : 'Total Client Value'} value={clients.reduce((s, c) => s + c.value, 0)} prefix={t('currency')} trend={12} icon={<TrendingUp size={20} />} accentColor="cyan" />
        <StatCard title={lang === 'ar' ? 'متوسط التقييم' : 'Avg Rating'} value="4.2" suffix="★" trend={5} icon={<Star size={20} />} accentColor="green" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['clients', 'leads'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab ? 'oklch(0.55 0.28 300)' : 'oklch(0.21 0.025 265)',
              color: activeTab === tab ? 'white' : 'oklch(0.65 0.01 265)',
              border: `1px solid ${activeTab === tab ? 'transparent' : 'oklch(0.30 0.02 265)'}`,
            }}>
            {tab === 'clients' ? t('clients') : t('leads')}
          </button>
        ))}
      </div>

      {activeTab === 'clients' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
          {/* Table Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--feeri-border)' }}>
            <div className="relative">
              <Search size={14} className="absolute top-2.5 start-3" style={{ color: 'var(--feeri-text-faint)' }} />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t('search') + '...'}
                className="ps-8 pe-4 py-2 text-xs rounded-lg outline-none"
                style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)', width: '200px' }}
              />
            </div>
            <button onClick={() => toast.success(lang === 'ar' ? 'سيتم فتح نموذج إضافة عميل' : 'Add client form will open')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={14} />
              {t('addClient')}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid oklch(0.26 0.02 265)' }}>
                  {[t('clientName'), t('phone'), t('email'), lang === 'ar' ? 'المدينة' : 'City', lang === 'ar' ? 'القيمة' : 'Value', t('status'), lang === 'ar' ? 'التقييم' : 'Rating', t('actions')].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id} className="transition-colors hover:bg-white/5" style={{ borderBottom: '1px solid oklch(0.22 0.02 265)' }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
                          {lang === 'ar' ? client.nameAr : client.nameEn}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>
                          {lang === 'ar' ? client.contactAr : client.contactEn}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-secondary)' }}>{client.phone}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-secondary)' }}>{client.email}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-secondary)' }}>{lang === 'ar' ? client.cityAr : client.cityEn}</td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: 'oklch(0.78 0.18 85)' }}>
                      {client.value.toLocaleString()} {t('currency')}
                    </td>
                    <td className="px-4 py-3">{statusBadge(client.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={10} fill={s <= client.rating ? 'oklch(0.78 0.18 85)' : 'none'}
                            style={{ color: 'oklch(0.78 0.18 85)' }} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toast.info(lang === 'ar' ? 'عرض تفاصيل العميل' : 'View client details')}
                        className="p-1 rounded-md transition-colors hover:bg-white/10" style={{ color: 'var(--feeri-text-muted)' }}>
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>
                  {lang === 'ar' ? lead.nameAr : lead.nameEn}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? lead.stageAr : lead.stageEn}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'القيمة' : 'Value'}</p>
                <p className="text-sm font-semibold" style={{ color: 'oklch(0.78 0.18 85)' }}>
                  {lang === 'ar' ? lead.valueAr : lead.valueEn}
                </p>
              </div>
              <div className="w-32">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الاحتمالية' : 'Probability'}</span>
                  <span style={{ color: 'oklch(0.55 0.28 300)' }}>{lead.probability}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--feeri-bg-input)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${lead.probability}%`, background: 'oklch(0.55 0.28 300)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
