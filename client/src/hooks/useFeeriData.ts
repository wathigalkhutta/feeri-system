/**
 * useFeeriData - Shared hook for all Feeri System modules
 * Connects frontend pages to the real database via tRPC
 */
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Companies ────────────────────────────────────────────────────────────────
export function useCompanies() {
  const utils = trpc.useUtils();
  const { data: companies = [], isLoading } = trpc.companies.list.useQuery();

  const createMutation = trpc.companies.create.useMutation({
    onSuccess: () => { utils.companies.list.invalidate(); toast.success("تم إنشاء الشركة بنجاح"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateMutation = trpc.companies.update.useMutation({
    onSuccess: () => { utils.companies.list.invalidate(); toast.success("تم تحديث الشركة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.companies.delete.useMutation({
    onSuccess: () => { utils.companies.list.invalidate(); toast.success("تم حذف الشركة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { companies, isLoading, createMutation, updateMutation, deleteMutation };
}

// ─── Clients (CRM) ────────────────────────────────────────────────────────────
export function useClients(companyId: number) {
  const utils = trpc.useUtils();
  const { data: clients = [], isLoading } = trpc.clients.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); toast.success("تم إضافة العميل"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); toast.success("تم تحديث العميل"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); toast.success("تم حذف العميل"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { clients, isLoading, createMutation, updateMutation, deleteMutation };
}

// ─── Employees ────────────────────────────────────────────────────────────────
export function useEmployees(companyId: number) {
  const utils = trpc.useUtils();
  const { data: employees = [], isLoading } = trpc.employees.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.employees.create.useMutation({
    onSuccess: () => { utils.employees.list.invalidate(); toast.success("تم إضافة الموظف"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateMutation = trpc.employees.update.useMutation({
    onSuccess: () => { utils.employees.list.invalidate(); toast.success("تم تحديث الموظف"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.employees.delete.useMutation({
    onSuccess: () => { utils.employees.list.invalidate(); toast.success("تم حذف الموظف"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { employees, isLoading, createMutation, updateMutation, deleteMutation };
}

// ─── Leave Requests ───────────────────────────────────────────────────────────
export function useLeaveRequests(companyId: number) {
  const utils = trpc.useUtils();
  const { data: leaveRequests = [], isLoading } = trpc.leaveRequests.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.leaveRequests.create.useMutation({
    onSuccess: () => { utils.leaveRequests.list.invalidate(); toast.success("تم تقديم طلب الإجازة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateStatusMutation = trpc.leaveRequests.updateStatus.useMutation({
    onSuccess: () => { utils.leaveRequests.list.invalidate(); toast.success("تم تحديث حالة الطلب"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { leaveRequests, isLoading, createMutation, updateStatusMutation };
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export function useInvoices(companyId: number) {
  const utils = trpc.useUtils();
  const { data: invoices = [], isLoading } = trpc.invoices.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => { utils.invoices.list.invalidate(); toast.success("تم إنشاء الفاتورة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateStatusMutation = trpc.invoices.updateStatus.useMutation({
    onSuccess: () => { utils.invoices.list.invalidate(); toast.success("تم تحديث حالة الفاتورة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => { utils.invoices.list.invalidate(); toast.success("تم حذف الفاتورة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { invoices, isLoading, createMutation, updateStatusMutation, deleteMutation };
}

// ─── Journal Entries ──────────────────────────────────────────────────────────
export function useJournalEntries(companyId: number) {
  const utils = trpc.useUtils();
  const { data: entries = [], isLoading } = trpc.journalEntries.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.journalEntries.create.useMutation({
    onSuccess: () => { utils.journalEntries.list.invalidate(); toast.success("تم إضافة القيد"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.journalEntries.delete.useMutation({
    onSuccess: () => { utils.journalEntries.list.invalidate(); toast.success("تم حذف القيد"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { entries, isLoading, createMutation, deleteMutation };
}

// ─── Contracts ────────────────────────────────────────────────────────────────
export function useContracts(companyId: number) {
  const utils = trpc.useUtils();
  const { data: contracts = [], isLoading } = trpc.contracts.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); toast.success("تم إنشاء العقد"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); toast.success("تم تحديث العقد"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.contracts.delete.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); toast.success("تم حذف العقد"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { contracts, isLoading, createMutation, updateMutation, deleteMutation };
}

// ─── Partnerships ─────────────────────────────────────────────────────────────
export function usePartnerships(companyId: number) {
  const utils = trpc.useUtils();
  const { data: partnerships = [], isLoading } = trpc.partnerships.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.partnerships.create.useMutation({
    onSuccess: () => { utils.partnerships.list.invalidate(); toast.success("تم إضافة الشريك"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateMutation = trpc.partnerships.update.useMutation({
    onSuccess: () => { utils.partnerships.list.invalidate(); toast.success("تم تحديث الشراكة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.partnerships.delete.useMutation({
    onSuccess: () => { utils.partnerships.list.invalidate(); toast.success("تم حذف الشراكة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { partnerships, isLoading, createMutation, updateMutation, deleteMutation };
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export function useVehicles(companyId: number) {
  const utils = trpc.useUtils();
  const { data: vehicles = [], isLoading } = trpc.vehicles.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.vehicles.create.useMutation({
    onSuccess: () => { utils.vehicles.list.invalidate(); toast.success("تم إضافة السيارة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateMutation = trpc.vehicles.update.useMutation({
    onSuccess: () => { utils.vehicles.list.invalidate(); toast.success("تم تحديث السيارة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.vehicles.delete.useMutation({
    onSuccess: () => { utils.vehicles.list.invalidate(); toast.success("تم حذف السيارة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { vehicles, isLoading, createMutation, updateMutation, deleteMutation };
}

// ─── Rentals ──────────────────────────────────────────────────────────────────
export function useRentals(companyId: number) {
  const utils = trpc.useUtils();
  const { data: rentals = [], isLoading } = trpc.rentals.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.rentals.create.useMutation({
    onSuccess: () => { utils.rentals.list.invalidate(); toast.success("تم إنشاء عقد الإيجار"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateStatusMutation = trpc.rentals.updateStatus.useMutation({
    onSuccess: () => { utils.rentals.list.invalidate(); toast.success("تم تحديث حالة الإيجار"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { rentals, isLoading, createMutation, updateStatusMutation };
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export function useTasks(companyId: number) {
  const utils = trpc.useUtils();
  const { data: tasks = [], isLoading } = trpc.tasks.list.useQuery({ companyId }, { enabled: companyId > 0 });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("تم إنشاء المهمة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("تم تحديث المهمة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("تم حذف المهمة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { tasks, isLoading, createMutation, updateMutation, deleteMutation };
}

// ─── Emails ───────────────────────────────────────────────────────────────────
export function useEmails(companyId?: number) {
  const utils = trpc.useUtils();
  const { data: emails = [], isLoading } = trpc.emails.list.useQuery({ companyId });

  const sendMutation = trpc.emails.send.useMutation({
    onSuccess: () => { utils.emails.list.invalidate(); toast.success("تم إرسال الإيميل بنجاح"); },
    onError: (e) => toast.error("خطأ في الإرسال: " + e.message),
  });

  const markReadMutation = trpc.emails.markRead.useMutation({
    onSuccess: () => utils.emails.list.invalidate(),
  });

  const deleteMutation = trpc.emails.delete.useMutation({
    onSuccess: () => { utils.emails.list.invalidate(); toast.success("تم حذف الإيميل"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { emails, isLoading, sendMutation, markReadMutation, deleteMutation };
}

// ─── Invoice Template ─────────────────────────────────────────────────────────
export function useInvoiceTemplate(companyId: number) {
  const utils = trpc.useUtils();
  const { data: template, isLoading } = trpc.invoiceTemplate.get.useQuery({ companyId }, { enabled: companyId > 0 });

  const saveMutation = trpc.invoiceTemplate.save.useMutation({
    onSuccess: () => { utils.invoiceTemplate.get.invalidate(); toast.success("تم حفظ نموذج الفاتورة"); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  return { template, isLoading, saveMutation };
}
