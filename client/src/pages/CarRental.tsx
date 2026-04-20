import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Car, Plus, Search, CheckCircle, Wrench, Clock, Mail, Send, Trash2, Edit2, X, DollarSign } from 'lucide-react';
import { EmailComposer, EmailInbox } from '@/components/EmailComposer';
import { useVehicles, useRentals } from '@/hooks/useFeeriData';
import { toast } from 'sonner';

type VehicleStatus = 'available' | 'rented' | 'maintenance';

interface VehicleForm {
  make: string; model: string; year: string; plateNumber: string;
  color: string; dailyRate: string; status: VehicleStatus; mileage: string;
}
interface RentalForm {
  vehicleId: string; clientName: string; clientPhone: string;
  startDate: string; endDate: string; totalAmount: string; notes: string;
}

const defaultVehicle: VehicleForm = { make: '', model: '', year: '', plateNumber: '', color: '', dailyRate: '', status: 'available', mileage: '' };
const defaultRental: RentalForm   = { vehicleId: '', clientName: '', clientPhone: '', startDate: '', endDate: '', totalAmount: '', notes: '' };

const vehicleColors: Record<string, string> = {
  available:   'oklch(0.65 0.20 160)',
  rented:      'oklch(0.55 0.28 300)',
  maintenance: 'oklch(0.78 0.18 85)',
};

export default function CarRental() {
  const { t, lang, selectedCompany } = useApp();
  const companyId = selectedCompany ? Number(selectedCompany.id) : 1;
  const { vehicles, isLoading: vLoading, createMutation: createVehicle, updateMutation: updateVehicle, deleteMutation: deleteVehicle } = useVehicles(companyId);
  const { rentals, isLoading: rLoading, createMutation: createRental, updateStatusMutation } = useRentals(companyId);

  const [tab, setTab] = useState<'fleet' | 'rentals'>('fleet');
  const [search, setSearch] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(defaultVehicle);
  const [rentalForm, setRentalForm] = useState<RentalForm>(defaultRental);

  const setVField = (k: keyof VehicleForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setVehicleForm(p => ({ ...p, [k]: e.target.value }));
  const setRField = (k: keyof RentalForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setRentalForm(p => ({ ...p, [k]: e.target.value }));

  const openCreateVehicle = () => { setVehicleForm(defaultVehicle); setEditingVehicleId(null); setShowVehicleForm(true); };
  const openEditVehicle = (v: typeof vehicles[0]) => {
    setVehicleForm({ make: v.make, model: v.model, year: String(v.year ?? ''), plateNumber: v.plateNumber ?? '', color: v.color ?? '', dailyRate: v.dailyRate ? String(v.dailyRate) : '', status: (v.status as VehicleStatus) ?? 'available', mileage: String(v.mileage ?? '') });
    setEditingVehicleId(Number(v.id));
    setShowVehicleForm(true);
  };

  const handleVehicleSubmit = () => {
    if (!vehicleForm.make || !vehicleForm.model) {
      toast.error(lang === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }
    const payload = { companyId, make: vehicleForm.make, model: vehicleForm.model, year: vehicleForm.year ? Number(vehicleForm.year) : undefined, plateNumber: vehicleForm.plateNumber || undefined, color: vehicleForm.color || undefined, dailyRate: vehicleForm.dailyRate || undefined, status: vehicleForm.status, mileage: vehicleForm.mileage ? Number(vehicleForm.mileage) : undefined };
    if (editingVehicleId) {
      updateVehicle.mutate({ id: editingVehicleId, data: { status: payload.status, dailyRate: payload.dailyRate, mileage: payload.mileage } }, { onSuccess: () => setShowVehicleForm(false) });
    } else {
      createVehicle.mutate(payload, { onSuccess: () => setShowVehicleForm(false) });
    }
  };

  const handleRentalSubmit = () => {
    if (!rentalForm.vehicleId || !rentalForm.clientName || !rentalForm.startDate || !rentalForm.endDate) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    createRental.mutate({ companyId, vehicleId: Number(rentalForm.vehicleId), clientName: rentalForm.clientName, clientPhone: rentalForm.clientPhone || undefined, startDate: rentalForm.startDate, endDate: rentalForm.endDate, totalAmount: rentalForm.totalAmount || undefined, notes: rentalForm.notes || undefined }, { onSuccess: () => setShowRentalForm(false) });
  };

  const filteredVehicles = vehicles.filter(v => `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase()) || (v.plateNumber ?? '').toLowerCase().includes(search.toLowerCase()));
  const filteredRentals  = rentals.filter(r => r.clientName.toLowerCase().includes(search.toLowerCase()));

  const available    = vehicles.filter(v => v.status === 'available').length;
  const rented       = vehicles.filter(v => v.status === 'rented').length;
  const maintenance  = vehicles.filter(v => v.status === 'maintenance').length;
  const totalRevenue = rentals.filter(r => r.status === 'completed').reduce((s, r) => s + Number(r.totalAmount ?? 0), 0);

  const statusLabel = (s: string) => {
    const m: Record<string, { ar: string; en: string }> = {
      available:   { ar: 'متاحة',    en: 'Available'   },
      rented:      { ar: 'مؤجرة',    en: 'Rented'      },
      maintenance: { ar: 'صيانة',    en: 'Maintenance' },
      active:      { ar: 'نشط',      en: 'Active'      },
      completed:   { ar: 'مكتمل',    en: 'Completed'   },
      cancelled:   { ar: 'ملغي',     en: 'Cancelled'   },
    };
    return lang === 'ar' ? (m[s]?.ar ?? s) : (m[s]?.en ?? s);
  };

  const statusIcon = (s: string) => {
    if (s === 'available' || s === 'completed') return <CheckCircle size={10} />;
    if (s === 'maintenance') return <Wrench size={10} />;
    return <Clock size={10} />;
  };

  return (
    <Layout title={t('carRental')} subtitle={lang === 'ar' ? 'إدارة أسطول السيارات والإيجارات' : 'Manage vehicle fleet and rentals'}>
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} module="carRental" />
      <EmailInbox   isOpen={showEmailInbox}   onClose={() => setShowEmailInbox(false)}   module="carRental" />

      {/* Vehicle Modal */}
      {showVehicleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--feeri-text-primary)' }}>
                {editingVehicleId ? (lang === 'ar' ? 'تعديل السيارة' : 'Edit Vehicle') : (lang === 'ar' ? 'إضافة سيارة' : 'Add Vehicle')}
              </h3>
              <button onClick={() => setShowVehicleForm(false)}><X size={18} style={{ color: 'var(--feeri-text-muted)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: lang === 'ar' ? 'الماركة *'         : 'Make *',           key: 'make'        as keyof VehicleForm, type: 'text'   },
                { label: lang === 'ar' ? 'الموديل *'         : 'Model *',          key: 'model'       as keyof VehicleForm, type: 'text'   },
                { label: lang === 'ar' ? 'السنة'             : 'Year',             key: 'year'        as keyof VehicleForm, type: 'number' },
                { label: lang === 'ar' ? 'رقم اللوحة'        : 'Plate Number',     key: 'plateNumber' as keyof VehicleForm, type: 'text'   },
                { label: lang === 'ar' ? 'اللون'             : 'Color',            key: 'color'       as keyof VehicleForm, type: 'text'   },
                { label: lang === 'ar' ? 'السعر اليومي'      : 'Daily Rate',       key: 'dailyRate'   as keyof VehicleForm, type: 'number' },
                { label: lang === 'ar' ? 'المسافة (كم)'      : 'Mileage (km)',     key: 'mileage'     as keyof VehicleForm, type: 'number' },
              ]).map(f => (
                <div key={f.key}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{f.label}</label>
                  <input type={f.type} value={vehicleForm[f.key]} onChange={setVField(f.key)}
                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                    style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
                <select value={vehicleForm.status} onChange={setVField('status')}
                  className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                  style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
                  <option value="available">{lang === 'ar' ? 'متاحة'  : 'Available'}</option>
                  <option value="rented">{lang === 'ar' ? 'مؤجرة'    : 'Rented'}</option>
                  <option value="maintenance">{lang === 'ar' ? 'صيانة' : 'Maintenance'}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowVehicleForm(false)} className="px-4 py-2 text-xs rounded-lg"
                style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleVehicleSubmit} disabled={createVehicle.isPending || updateVehicle.isPending}
                className="px-4 py-2 text-xs rounded-lg font-semibold" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                {createVehicle.isPending || updateVehicle.isPending ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rental Modal */}
      {showRentalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--feeri-text-primary)' }}>
                {lang === 'ar' ? 'إيجار جديد' : 'New Rental'}
              </h3>
              <button onClick={() => setShowRentalForm(false)}><X size={18} style={{ color: 'var(--feeri-text-muted)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{lang === 'ar' ? 'السيارة *' : 'Vehicle *'}</label>
                <select value={rentalForm.vehicleId} onChange={setRField('vehicleId')}
                  className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                  style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }}>
                  <option value="">{lang === 'ar' ? 'اختر سيارة' : 'Select vehicle'}</option>
                  {vehicles.filter(v => v.status === 'available').map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} — {v.plateNumber}</option>
                  ))}
                </select>
              </div>
              {([
                { label: lang === 'ar' ? 'اسم العميل *'   : 'Client Name *',  key: 'clientName'  as keyof RentalForm, type: 'text',   col: 2 },
                { label: lang === 'ar' ? 'هاتف العميل'    : 'Client Phone',   key: 'clientPhone' as keyof RentalForm, type: 'tel',    col: 2 },
                { label: lang === 'ar' ? 'تاريخ البداية *': 'Start Date *',   key: 'startDate'   as keyof RentalForm, type: 'date',   col: 1 },
                { label: lang === 'ar' ? 'تاريخ الانتهاء *': 'End Date *',    key: 'endDate'     as keyof RentalForm, type: 'date',   col: 1 },
                { label: lang === 'ar' ? 'المبلغ الإجمالي': 'Total Amount',   key: 'totalAmount' as keyof RentalForm, type: 'number', col: 2 },
              ]).map(f => (
                <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--feeri-text-muted)' }}>{f.label}</label>
                  <input type={f.type} value={rentalForm[f.key]} onChange={setRField(f.key)}
                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                    style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)' }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowRentalForm(false)} className="px-4 py-2 text-xs rounded-lg"
                style={{ background: 'var(--feeri-bg-elevated)', color: 'var(--feeri-text-muted)', border: '1px solid var(--feeri-border)' }}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleRentalSubmit} disabled={createRental.isPending}
                className="px-4 py-2 text-xs rounded-lg font-semibold" style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                {createRental.isPending ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={lang === 'ar' ? 'سيارات متاحة'    : 'Available'}      value={available}    icon={<Car size={20} />}    accentColor="green"  />
        <StatCard title={lang === 'ar' ? 'سيارات مؤجرة'    : 'Rented'}         value={rented}       icon={<Car size={20} />}    accentColor="purple" />
        <StatCard title={lang === 'ar' ? 'في الصيانة'      : 'Maintenance'}    value={maintenance}  icon={<Wrench size={20} />} accentColor="yellow" />
        <StatCard title={lang === 'ar' ? 'إجمالي الإيرادات': 'Total Revenue'}  value={totalRevenue} prefix={t('currency')} trend={12} icon={<DollarSign size={20} />} accentColor="cyan" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'var(--feeri-bg-elevated)' }}>
        {(['fleet', 'rentals'] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)}
            className="px-4 py-2 text-xs rounded-lg font-medium transition-all"
            style={tab === tb ? { background: 'oklch(0.55 0.28 300)', color: 'white' } : { color: 'var(--feeri-text-muted)' }}>
            {tb === 'fleet' ? (lang === 'ar' ? 'الأسطول' : 'Fleet') : (lang === 'ar' ? 'الإيجارات' : 'Rentals')}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search size={14} className="absolute top-2.5 start-3" style={{ color: 'var(--feeri-text-faint)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search') + '...'}
            className="ps-8 pe-4 py-2 text-xs rounded-lg outline-none"
            style={{ background: 'var(--feeri-bg-input)', border: '1px solid var(--feeri-border)', color: 'var(--feeri-text-primary)', width: '200px' }} />
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
          {tab === 'fleet' ? (
            <button onClick={openCreateVehicle} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={14} /> {lang === 'ar' ? 'إضافة سيارة' : 'Add Vehicle'}
            </button>
          ) : (
            <button onClick={() => setShowRentalForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              <Plus size={14} /> {lang === 'ar' ? 'إيجار جديد' : 'New Rental'}
            </button>
          )}
        </div>
      </div>

      {/* Fleet Tab */}
      {tab === 'fleet' && (
        vLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl"
            style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            <Car size={40} style={{ color: 'var(--feeri-text-faint)' }} />
            <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
              {lang === 'ar' ? 'لا توجد سيارات بعد' : 'No vehicles yet'}
            </p>
            <button onClick={openCreateVehicle} className="px-4 py-2 text-xs rounded-lg font-semibold"
              style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
              {lang === 'ar' ? '+ أضف أول سيارة' : '+ Add First Vehicle'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVehicles.map(v => {
              const color = vehicleColors[v.status ?? 'available'];
              return (
                <div key={v.id} className="rounded-xl p-5 relative group"
                  style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '22' }}>
                        <Car size={18} style={{ color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--feeri-text-primary)' }}>{v.make} {v.model}</p>
                        <p className="text-xs" style={{ color: 'var(--feeri-text-muted)' }}>{v.plateNumber ?? '—'}{v.year ? ` • ${v.year}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditVehicle(v)} className="p-1.5 rounded-lg hover:bg-purple-500/10">
                        <Edit2 size={12} style={{ color: 'oklch(0.55 0.28 300)' }} />
                      </button>
                      <button onClick={() => { if (confirm(lang === 'ar' ? 'حذف السيارة؟' : 'Delete vehicle?')) deleteVehicle.mutate({ id: Number(v.id) }); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10">
                        <Trash2 size={12} style={{ color: 'oklch(0.60 0.22 25)' }} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: lang === 'ar' ? 'اللون' : 'Color',  value: v.color ?? '—',                              color: 'var(--feeri-text-secondary)' },
                      { label: lang === 'ar' ? 'يومي'  : 'Daily',  value: Number(v.dailyRate ?? 0).toLocaleString(),    color: 'oklch(0.78 0.18 85)' },
                      { label: lang === 'ar' ? 'كم'    : 'KM',     value: (v.mileage ?? 0).toLocaleString(),            color: 'var(--feeri-text-secondary)' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-lg p-2 text-center" style={{ background: 'var(--feeri-bg-elevated)' }}>
                        <p className="text-xs" style={{ color: 'var(--feeri-text-faint)' }}>{stat.label}</p>
                        <p className="text-xs font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs w-fit"
                    style={{ background: color + '22', color }}>
                    {statusIcon(v.status ?? 'available')}{statusLabel(v.status ?? 'available')}
                  </span>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Rentals Tab */}
      {tab === 'rentals' && (
        rLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feeri-bg-card)', border: '1px solid var(--feeri-border)' }}>
            {filteredRentals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Car size={40} style={{ color: 'var(--feeri-text-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
                  {lang === 'ar' ? 'لا توجد إيجارات بعد' : 'No rentals yet'}
                </p>
                <button onClick={() => setShowRentalForm(true)} className="px-4 py-2 text-xs rounded-lg font-semibold"
                  style={{ background: 'oklch(0.55 0.28 300)', color: 'white' }}>
                  {lang === 'ar' ? '+ إيجار جديد' : '+ New Rental'}
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--feeri-border)', background: 'var(--feeri-bg-elevated)' }}>
                    {[lang === 'ar' ? 'العميل' : 'Client', lang === 'ar' ? 'السيارة' : 'Vehicle', lang === 'ar' ? 'البداية' : 'Start', lang === 'ar' ? 'الانتهاء' : 'End', lang === 'ar' ? 'المبلغ' : 'Amount', t('status'), lang === 'ar' ? 'إجراءات' : 'Actions'].map(h => (
                      <th key={h} className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--feeri-text-faint)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRentals.map(r => {
                    const vehicle = vehicles.find(v => v.id === r.vehicleId);
                    const statusColorKey = r.status === 'active' ? 'rented' : r.status === 'completed' ? 'available' : 'maintenance';
                    const color = vehicleColors[statusColorKey];
                    return (
                      <tr key={r.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--feeri-border-subtle)' }}>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--feeri-text-primary)' }}>{r.clientName}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-secondary)' }}>
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : `#${r.vehicleId}`}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                          {new Date(r.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--feeri-text-muted)' }}>
                          {new Date(r.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'oklch(0.78 0.18 85)' }}>
                          {Number(r.totalAmount ?? 0).toLocaleString()} {t('currency')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs w-fit"
                            style={{ background: color + '22', color }}>
                            {statusIcon(r.status ?? 'active')}{statusLabel(r.status ?? 'active')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.status === 'active' && (
                            <button onClick={() => updateStatusMutation.mutate({ id: Number(r.id), status: 'completed' })}
                              className="px-2 py-1 text-xs rounded-lg"
                              style={{ background: 'oklch(0.65 0.20 160 / 0.15)', color: 'oklch(0.65 0.20 160)' }}>
                              {lang === 'ar' ? 'إتمام' : 'Complete'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )
      )}
    </Layout>
  );
}
