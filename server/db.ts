import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  companies, InsertCompany,
  clients, InsertClient,
  employees, InsertEmployee,
  invoices, InsertInvoice,
  invoiceItems, InsertInvoiceItem,
  journalEntries, InsertJournalEntry,
  contracts, InsertContract,
  partnerships, InsertPartnership,
  vehicles, InsertVehicle,
  rentals, InsertRental,
  tasks, InsertTask,
  emails, InsertEmail,
  leaveRequests, InsertLeaveRequest,
  invoiceTemplates, InsertInvoiceTemplate,
  chartOfAccounts, InsertChartOfAccount,
  bankAccounts, InsertBankAccount,
  pettyCash, InsertPettyCash,
  fixedAssets, InsertFixedAsset,
  vouchers, InsertVoucher,
  projects, InsertProject,
  opportunities, InsertOpportunity,
  internalMessages, InsertInternalMessage,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Companies ────────────────────────────────────────────────────────────────
export async function getCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(desc(companies.createdAt));
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

export async function createCompany(data: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(companies).values(data);
}

export async function updateCompany(id: number, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(companies).set(data).where(eq(companies.id, id));
}

export async function deleteCompany(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(companies).where(eq(companies.id, id));
}

// ─── Clients (CRM) ────────────────────────────────────────────────────────────
export async function getClients(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.companyId, companyId)).orderBy(desc(clients.createdAt));
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(clients).values(data);
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(clients).where(eq(clients.id, id));
}

// ─── Employees ────────────────────────────────────────────────────────────────
export async function getEmployees(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.companyId, companyId)).orderBy(desc(employees.createdAt));
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(employees).values(data);
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(employees).set(data).where(eq(employees.id, id));
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(employees).where(eq(employees.id, id));
}

// ─── Leave Requests ───────────────────────────────────────────────────────────
export async function getLeaveRequests(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaveRequests).where(eq(leaveRequests.companyId, companyId)).orderBy(desc(leaveRequests.createdAt));
}

export async function createLeaveRequest(data: InsertLeaveRequest) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(leaveRequests).values(data);
}

export async function updateLeaveRequest(id: number, data: Partial<InsertLeaveRequest>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(leaveRequests).set(data).where(eq(leaveRequests.id, id));
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export async function getInvoices(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.companyId, companyId)).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceWithItems(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const inv = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!inv[0]) return undefined;
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  return { ...inv[0], items };
}

export async function createInvoice(data: InsertInvoice, items: Omit<InsertInvoiceItem, 'invoiceId'>[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(invoices).values(data);
  const insertId = (result as unknown as { insertId: number }).insertId;
  if (insertId && items.length > 0) {
    const itemsWithId = items.map(i => ({ ...i, invoiceId: insertId }));
    await db.insert(invoiceItems).values(itemsWithId);
  }
  return insertId;
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function deleteInvoice(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  await db.delete(invoices).where(eq(invoices.id, id));
}

// ─── Journal Entries ──────────────────────────────────────────────────────────
export async function getJournalEntries(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journalEntries).where(eq(journalEntries.companyId, companyId)).orderBy(desc(journalEntries.createdAt));
}

export async function createJournalEntry(data: InsertJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(journalEntries).values(data);
}

export async function deleteJournalEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
}

// ─── Contracts ────────────────────────────────────────────────────────────────
export async function getContracts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).where(eq(contracts.companyId, companyId)).orderBy(desc(contracts.createdAt));
}

export async function createContract(data: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(contracts).values(data);
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(contracts).set(data).where(eq(contracts.id, id));
}

export async function deleteContract(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(contracts).where(eq(contracts.id, id));
}

// ─── Partnerships ─────────────────────────────────────────────────────────────
export async function getPartnerships(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnerships).where(eq(partnerships.companyId, companyId)).orderBy(desc(partnerships.createdAt));
}

export async function createPartnership(data: InsertPartnership) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(partnerships).values(data);
}

export async function updatePartnership(id: number, data: Partial<InsertPartnership>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(partnerships).set(data).where(eq(partnerships.id, id));
}

export async function deletePartnership(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(partnerships).where(eq(partnerships.id, id));
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export async function getVehicles(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vehicles).where(eq(vehicles.companyId, companyId)).orderBy(desc(vehicles.createdAt));
}

export async function createVehicle(data: InsertVehicle) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(vehicles).values(data);
}

export async function updateVehicle(id: number, data: Partial<InsertVehicle>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(vehicles).set(data).where(eq(vehicles.id, id));
}

export async function deleteVehicle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(vehicles).where(eq(vehicles.id, id));
}

// ─── Rentals ──────────────────────────────────────────────────────────────────
export async function getRentals(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentals).where(eq(rentals.companyId, companyId)).orderBy(desc(rentals.createdAt));
}

export async function createRental(data: InsertRental) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(rentals).values(data);
}

export async function updateRental(id: number, data: Partial<InsertRental>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(rentals).set(data).where(eq(rentals.id, id));
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export async function getTasks(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.companyId, companyId)).orderBy(desc(tasks.createdAt));
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(tasks).values(data);
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ─── Emails ───────────────────────────────────────────────────────────────────
export async function getEmails(companyId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (companyId) {
    return db.select().from(emails).where(eq(emails.companyId, companyId)).orderBy(desc(emails.createdAt));
  }
  return db.select().from(emails).orderBy(desc(emails.createdAt));
}

export async function createEmail(data: InsertEmail) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(emails).values(data);
}

export async function markEmailRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(emails).set({ isRead: true }).where(eq(emails.id, id));
}

export async function deleteEmail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(emails).where(eq(emails.id, id));
}

// ─── Invoice Template ─────────────────────────────────────────────────────────
export async function getInvoiceTemplate(companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoiceTemplates).where(eq(invoiceTemplates.companyId, companyId)).limit(1);
  return result[0];
}

export async function upsertInvoiceTemplate(data: InsertInvoiceTemplate) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getInvoiceTemplate(data.companyId);
  if (existing) {
    await db.update(invoiceTemplates).set(data).where(eq(invoiceTemplates.companyId, data.companyId));
  } else {
    await db.insert(invoiceTemplates).values(data);
  }
}

// ─── Dashboard Statistics ──────────────────────────────────────────────────────
export async function getDashboardStats(companyId: number) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  // ── Invoices ──────────────────────────────────────────────────────────────
  const allInvoices     = await db.select().from(invoices).where(eq(invoices.companyId, companyId));
  const paidInvoices    = allInvoices.filter(i => i.status === 'paid');
  const overdueInvoices = allInvoices.filter(i => i.status === 'overdue');
  const pendingInvoices = allInvoices.filter(i => i.status === 'sent' || i.status === 'draft');
  const totalRevenue    = paidInvoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const monthRevenue    = paidInvoices.filter(i => i.createdAt >= startOfMonth).reduce((s, i) => s + Number(i.total ?? 0), 0);
  const pendingRevenue  = pendingInvoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const overdueAmount   = overdueInvoices.reduce((s, i) => s + Number(i.total ?? 0), 0);

  const monthlyRevenue: number[] = Array(12).fill(0);
  paidInvoices.forEach(i => {
    if (i.createdAt >= startOfYear) {
      const m = new Date(i.createdAt).getMonth();
      monthlyRevenue[m] += Number(i.total ?? 0);
    }
  });

  // ── Journal Entries (Expenses) ─────────────────────────────────────────────
  const allJournals   = await db.select().from(journalEntries).where(eq(journalEntries.companyId, companyId));
  const totalExpenses = allJournals.reduce((s, j) => s + Number(j.amount ?? 0), 0);
  const monthExpenses = allJournals.filter(j => j.createdAt >= startOfMonth).reduce((s, j) => s + Number(j.amount ?? 0), 0);

  const monthlyExpenses: number[] = Array(12).fill(0);
  allJournals.forEach(j => {
    if (j.createdAt >= startOfYear) {
      const m = new Date(j.createdAt).getMonth();
      monthlyExpenses[m] += Number(j.amount ?? 0);
    }
  });

  // ── Employees ─────────────────────────────────────────────────────────────
  const allEmployees    = await db.select().from(employees).where(eq(employees.companyId, companyId));
  const activeEmployees = allEmployees.filter(e => e.status === 'active').length;
  const totalSalaries   = allEmployees.reduce((s, e) => s + Number(e.salary ?? 0), 0);

  // ── Clients ───────────────────────────────────────────────────────────────
  const allClients    = await db.select().from(clients).where(eq(clients.companyId, companyId));
  const activeClients = allClients.filter(c => c.status === 'active').length;

  // ── Contracts ─────────────────────────────────────────────────────────────
  const allContracts    = await db.select().from(contracts).where(eq(contracts.companyId, companyId));
  const activeContracts = allContracts.filter(c => c.status === 'active').length;
  const contractsValue  = allContracts.filter(c => c.status === 'active').reduce((s, c) => s + Number(c.value ?? 0), 0);
  const expiringContracts = allContracts.filter(c => {
    if (!c.endDate || c.status !== 'active') return false;
    const end  = new Date(c.endDate);
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const allTasks     = await db.select().from(tasks).where(eq(tasks.companyId, companyId));
  const pendingTasks = allTasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
  const doneTasks    = allTasks.filter(t => t.status === 'done').length;
  const urgentTasks  = allTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const overdueTasks = allTasks.filter(t => {
    if (!t.dueDate || t.status === 'done' || t.status === 'cancelled') return false;
    return new Date(t.dueDate) < now;
  }).length;

  // ── Vehicles ──────────────────────────────────────────────────────────────
  const allVehicles       = await db.select().from(vehicles).where(eq(vehicles.companyId, companyId));
  const availableVehicles = allVehicles.filter(v => v.status === 'available').length;
  const rentedVehicles    = allVehicles.filter(v => v.status === 'rented').length;

  // ── Rentals Revenue ───────────────────────────────────────────────────────
  const allRentals    = await db.select().from(rentals).where(eq(rentals.companyId, companyId));
  const rentalRevenue = allRentals.filter(r => r.status === 'completed').reduce((s, r) => s + Number(r.totalAmount ?? 0), 0);

  // ── Partnerships ──────────────────────────────────────────────────────────
  const allPartnerships = await db.select().from(partnerships).where(eq(partnerships.companyId, companyId));
  const totalInvestment = allPartnerships.reduce((s, p) => s + Number(p.investment ?? 0), 0);
  const totalProfit     = allPartnerships.reduce((s, p) => s + Number(p.profit ?? 0), 0);

  // ── Leave Requests ────────────────────────────────────────────────────────
  const allLeaves     = await db.select().from(leaveRequests).where(eq(leaveRequests.companyId, companyId));
  const pendingLeaves = allLeaves.filter(l => l.status === 'pending').length;

  // ── Net Profit ────────────────────────────────────────────────────────────
  const netProfit      = totalRevenue - totalExpenses;
  const monthNetProfit = monthRevenue - monthExpenses;

  return {
    totalRevenue, monthRevenue, pendingRevenue, overdueAmount,
    totalExpenses, monthExpenses, netProfit, monthNetProfit, rentalRevenue,
    totalInvoices: allInvoices.length,
    paidInvoices: paidInvoices.length,
    overdueInvoices: overdueInvoices.length,
    pendingInvoices: pendingInvoices.length,
    totalEmployees: allEmployees.length,
    activeEmployees, totalSalaries, pendingLeaves,
    totalClients: allClients.length, activeClients,
    totalContracts: allContracts.length,
    activeContracts, contractsValue, expiringContracts,
    totalTasks: allTasks.length,
    pendingTasks, doneTasks, urgentTasks, overdueTasks,
    totalVehicles: allVehicles.length,
    availableVehicles, rentedVehicles,
    totalPartners: allPartnerships.length,
    totalInvestment, totalProfit,
    monthlyRevenue,
    monthlyExpenses,
  };
}

// ─── Company Financial Summary ─────────────────────────────────────────────────
export async function getCompanyFinancialSummary(companyId: number) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Invoices
  const allInvoices  = await db.select().from(invoices).where(eq(invoices.companyId, companyId));
  const paidInvoices = allInvoices.filter(i => i.status === 'paid');
  const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const pendingRevenue = allInvoices.filter(i => i.status === 'sent' || i.status === 'draft')
    .reduce((s, i) => s + Number(i.total ?? 0), 0);
  const overdueRevenue = allInvoices.filter(i => i.status === 'overdue')
    .reduce((s, i) => s + Number(i.total ?? 0), 0);

  // Monthly revenue for chart (12 months)
  const monthlyRevenue: number[] = Array(12).fill(0);
  paidInvoices.forEach(i => {
    if (i.createdAt >= startOfYear) {
      monthlyRevenue[new Date(i.createdAt).getMonth()] += Number(i.total ?? 0);
    }
  });

  // Journal Entries (Expenses)
  const allJournals   = await db.select().from(journalEntries).where(eq(journalEntries.companyId, companyId));
  const totalExpenses = allJournals.reduce((s, j) => s + Number(j.amount ?? 0), 0);
  const monthlyExpenses: number[] = Array(12).fill(0);
  allJournals.forEach(j => {
    if (j.createdAt >= startOfYear) {
      monthlyExpenses[new Date(j.createdAt).getMonth()] += Number(j.amount ?? 0);
    }
  });

  // Rental Revenue
  const allRentals    = await db.select().from(rentals).where(eq(rentals.companyId, companyId));
  const rentalRevenue = allRentals.filter(r => r.status === 'completed')
    .reduce((s, r) => s + Number(r.totalAmount ?? 0), 0);

  // Employees & Salaries
  const allEmployees  = await db.select().from(employees).where(eq(employees.companyId, companyId));
  const totalSalaries = allEmployees.reduce((s, e) => s + Number(e.salary ?? 0), 0);

  // Contracts
  const allContracts    = await db.select().from(contracts).where(eq(contracts.companyId, companyId));
  const activeContracts = allContracts.filter(c => c.status === 'active').length;
  const contractsValue  = allContracts.filter(c => c.status === 'active')
    .reduce((s, c) => s + Number(c.value ?? 0), 0);

  // Partnerships
  const allPartnerships = await db.select().from(partnerships).where(eq(partnerships.companyId, companyId));
  const totalInvestment = allPartnerships.reduce((s, p) => s + Number(p.investment ?? 0), 0);
  const totalProfit     = allPartnerships.reduce((s, p) => s + Number(p.profit ?? 0), 0);

  // Clients
  const allClients    = await db.select().from(clients).where(eq(clients.companyId, companyId));
  const activeClients = allClients.filter(c => c.status === 'active').length;

  // Tasks
  const allTasks     = await db.select().from(tasks).where(eq(tasks.companyId, companyId));
  const pendingTasks = allTasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;

  const netProfit     = totalRevenue - totalExpenses;
  const profitMargin  = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const totalIncome   = totalRevenue + rentalRevenue + totalProfit;

  return {
    totalRevenue, pendingRevenue, overdueRevenue,
    totalExpenses, totalSalaries,
    rentalRevenue, totalInvestment, totalProfit,
    netProfit, profitMargin, totalIncome,
    totalInvoices: allInvoices.length,
    paidInvoices: paidInvoices.length,
    totalEmployees: allEmployees.length,
    totalClients: allClients.length, activeClients,
    activeContracts, contractsValue,
    totalPartners: allPartnerships.length,
    pendingTasks,
    monthlyRevenue,
    monthlyExpenses,
  };
}

// ─── All Companies Financial Summary ──────────────────────────────────────────
export async function getAllCompaniesWithSummary() {
  const db = await getDb();
  if (!db) return [];
  const allCompanies = await db.select().from(companies).orderBy(desc(companies.createdAt));
  const results = await Promise.all(
    allCompanies.map(async (company) => {
      const summary = await getCompanyFinancialSummary(company.id);
      return { ...company, summary };
    })
  );
  return results;
}

// ─── Chart of Accounts (شجرة الحسابات) ───────────────────────────────────────
export async function getChartOfAccounts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chartOfAccounts)
    .where(eq(chartOfAccounts.companyId, companyId))
    .orderBy(chartOfAccounts.code);
}

export async function createChartOfAccount(data: InsertChartOfAccount) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(chartOfAccounts).values(data);
}

export async function updateChartOfAccount(id: number, data: Partial<InsertChartOfAccount>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(chartOfAccounts).set(data).where(eq(chartOfAccounts.id, id));
}

export async function deleteChartOfAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(chartOfAccounts).where(eq(chartOfAccounts.id, id));
}

// ─── Bank Accounts (حسابات البنوك) ────────────────────────────────────────────
export async function getBankAccounts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankAccounts)
    .where(eq(bankAccounts.companyId, companyId))
    .orderBy(desc(bankAccounts.createdAt));
}

export async function createBankAccount(data: InsertBankAccount) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(bankAccounts).values(data);
}

export async function updateBankAccount(id: number, data: Partial<InsertBankAccount>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(bankAccounts).set(data).where(eq(bankAccounts.id, id));
}

export async function deleteBankAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
}

// ─── Petty Cash / Advances (العهد والسلف) ─────────────────────────────────────
export async function getPettyCash(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pettyCash)
    .where(eq(pettyCash.companyId, companyId))
    .orderBy(desc(pettyCash.createdAt));
}

export async function createPettyCash(data: InsertPettyCash) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(pettyCash).values(data);
}

export async function updatePettyCash(id: number, data: Partial<InsertPettyCash>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(pettyCash).set(data).where(eq(pettyCash.id, id));
}

export async function deletePettyCash(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(pettyCash).where(eq(pettyCash.id, id));
}

// ─── Fixed Assets (الأصول الثابتة) ────────────────────────────────────────────
export async function getFixedAssets(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fixedAssets)
    .where(eq(fixedAssets.companyId, companyId))
    .orderBy(desc(fixedAssets.createdAt));
}

export async function createFixedAsset(data: InsertFixedAsset) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(fixedAssets).values(data);
}

export async function updateFixedAsset(id: number, data: Partial<InsertFixedAsset>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(fixedAssets).set(data).where(eq(fixedAssets.id, id));
}

export async function deleteFixedAsset(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(fixedAssets).where(eq(fixedAssets.id, id));
}

// ─── General Ledger ───────────────────────────────────────────────────────────────────────────────────
export async function getLedgerEntries(params: {
  companyId: number;
  account?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(journalEntries.companyId, params.companyId)];

  if (params.dateFrom) {
    conditions.push(gte(journalEntries.date, new Date(params.dateFrom)));
  }
  if (params.dateTo) {
    conditions.push(lte(journalEntries.date, new Date(params.dateTo)));
  }

  const entries = await db
    .select()
    .from(journalEntries)
    .where(and(...conditions))
    .orderBy(journalEntries.date, journalEntries.id);

  // If filtering by account, keep only rows where the account appears as debit or credit
  const filtered = params.account
    ? entries.filter(
        e =>
          e.debitAccount.toLowerCase().includes(params.account!.toLowerCase()) ||
          e.creditAccount.toLowerCase().includes(params.account!.toLowerCase())
      )
    : entries;

  // Compute running balance per entry (debit = +, credit = -) relative to the filtered account
  let runningBalance = 0;
  return filtered.map(e => {
    const isDebit = params.account
      ? e.debitAccount.toLowerCase().includes(params.account.toLowerCase())
      : true;
    const amount = Number(e.amount);
    runningBalance += isDebit ? amount : -amount;
    return { ...e, runningBalance };
  });
}

export async function getLedgerAccountSummary(companyId: number) {
  const db = await getDb();
  if (!db) return [];

  const entries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.companyId, companyId))
    .orderBy(journalEntries.date);

  // Build a map of account -> { totalDebit, totalCredit, balance }
  const accountMap = new Map<string, { account: string; totalDebit: number; totalCredit: number; balance: number; entryCount: number }>();

  for (const entry of entries) {
    const amount = Number(entry.amount);

    // Debit side
    if (!accountMap.has(entry.debitAccount)) {
      accountMap.set(entry.debitAccount, { account: entry.debitAccount, totalDebit: 0, totalCredit: 0, balance: 0, entryCount: 0 });
    }
    const debitAcc = accountMap.get(entry.debitAccount)!;
    debitAcc.totalDebit += amount;
    debitAcc.balance += amount;
    debitAcc.entryCount += 1;

    // Credit side
    if (!accountMap.has(entry.creditAccount)) {
      accountMap.set(entry.creditAccount, { account: entry.creditAccount, totalDebit: 0, totalCredit: 0, balance: 0, entryCount: 0 });
    }
    const creditAcc = accountMap.get(entry.creditAccount)!;
    creditAcc.totalCredit += amount;
    creditAcc.balance -= amount;
    creditAcc.entryCount += 1;
  }

  return Array.from(accountMap.values()).sort((a, b) => a.account.localeCompare(b.account, 'ar'));
}

// ─── Vouchers (سندات القبض والصرف) ───────────────────────────────────────────
export async function getVouchers(companyId: number, type?: "receipt" | "payment") {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(vouchers.companyId, companyId)];
  if (type) conditions.push(eq(vouchers.type, type));
  return db.select().from(vouchers).where(and(...conditions)).orderBy(desc(vouchers.date));
}

export async function createVoucher(data: InsertVoucher) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(vouchers).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function updateVoucher(id: number, data: Partial<InsertVoucher>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(vouchers).set(data).where(eq(vouchers.id, id));
}

export async function deleteVoucher(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(vouchers).where(eq(vouchers.id, id));
}

export async function getNextVoucherNumber(companyId: number, type: "receipt" | "payment") {
  const db = await getDb();
  if (!db) return type === "receipt" ? "RCV-001" : "PAY-001";
  const prefix = type === "receipt" ? "RCV" : "PAY";
  const existing = await db
    .select({ voucherNumber: vouchers.voucherNumber })
    .from(vouchers)
    .where(and(eq(vouchers.companyId, companyId), eq(vouchers.type, type)))
    .orderBy(desc(vouchers.id))
    .limit(1);
  if (existing.length === 0) return `${prefix}-001`;
  const lastNum = parseInt(existing[0].voucherNumber.split("-")[1] || "0", 10);
  return `${prefix}-${String(lastNum + 1).padStart(3, "0")}`;
}

// ─── Projects (المشاريع) ──────────────────────────────────────────────────────
export async function getProjects(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.companyId, companyId)).orderBy(desc(projects.createdAt));
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(projects).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(projects).where(eq(projects.id, id));
}

// ─── Opportunities / CRM (الفرص) ─────────────────────────────────────────────
export async function getOpportunities(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(opportunities).where(eq(opportunities.companyId, companyId)).orderBy(desc(opportunities.createdAt));
}

export async function createOpportunity(data: InsertOpportunity) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(opportunities).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function updateOpportunity(id: number, data: Partial<InsertOpportunity>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(opportunities).set(data).where(eq(opportunities.id, id));
}

export async function deleteOpportunity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(opportunities).where(eq(opportunities.id, id));
}

export async function convertOpportunityToProject(opportunityId: number, projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(opportunities)
    .set({ status: "won", convertedToProjectId: projectId })
    .where(eq(opportunities.id, opportunityId));
}

// ─── Internal Messages (الرسائل الداخلية) ────────────────────────────────────
export async function getMessages(companyId: number, userId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(internalMessages.companyId, companyId)];
  if (userId) {
    conditions.push(
      sql`(${internalMessages.senderId} = ${userId} OR ${internalMessages.recipientId} = ${userId} OR ${internalMessages.messageType} = 'broadcast')`
    );
  }
  return db.select().from(internalMessages).where(and(...conditions)).orderBy(desc(internalMessages.createdAt));
}

export async function getGroupMessages(companyId: number, groupId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(internalMessages)
    .where(and(eq(internalMessages.companyId, companyId), eq(internalMessages.groupId, groupId)))
    .orderBy(internalMessages.createdAt);
}

export async function createMessage(data: InsertInternalMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(internalMessages).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(internalMessages).set({ isRead: true, status: "read" }).where(eq(internalMessages.id, id));
}

export async function deleteMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(internalMessages).where(eq(internalMessages.id, id));
}

export async function getBusinessDevStats(companyId: number) {
  const db = await getDb();
  if (!db) return { activeProjects: 0, newOpportunities: 0, wonOpportunities: 0, totalOpportunities: 0, unreadMessages: 0 };
  const [activeProj, allOpps, unreadMsg] = await Promise.all([
    db.select().from(projects).where(and(eq(projects.companyId, companyId), eq(projects.status, "in_progress"))),
    db.select().from(opportunities).where(eq(opportunities.companyId, companyId)),
    db.select().from(internalMessages).where(and(eq(internalMessages.companyId, companyId), eq(internalMessages.isRead, false))),
  ]);
  const newOpps = allOpps.filter(o => o.status === "new").length;
  const wonOpps = allOpps.filter(o => o.status === "won").length;
  return {
    activeProjects: activeProj.length,
    newOpportunities: newOpps,
    wonOpportunities: wonOpps,
    totalOpportunities: allOpps.length,
    unreadMessages: unreadMsg.length,
    winRate: allOpps.length > 0 ? Math.round((wonOpps / allOpps.length) * 100) : 0,
  };
}

// ─── Enhanced Internal Messages ───────────────────────────────────────────────

export async function getInbox(companyId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(internalMessages)
    .where(and(
      eq(internalMessages.companyId, companyId),
      sql`(${internalMessages.recipientId} = ${userId} OR ${internalMessages.messageType} = 'broadcast')`
    ))
    .orderBy(desc(internalMessages.createdAt));
}

export async function getSent(companyId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(internalMessages)
    .where(and(
      eq(internalMessages.companyId, companyId),
      eq(internalMessages.senderId, userId)
    ))
    .orderBy(desc(internalMessages.createdAt));
}

export async function getUnreadCount(companyId: number, userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select().from(internalMessages)
    .where(and(
      eq(internalMessages.companyId, companyId),
      eq(internalMessages.isRead, false),
      sql`(${internalMessages.recipientId} = ${userId} OR ${internalMessages.messageType} = 'broadcast')`
    ));
  return rows.length;
}

export async function markAllReadForUser(companyId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(internalMessages)
    .set({ isRead: true, status: "read" })
    .where(and(
      eq(internalMessages.companyId, companyId),
      eq(internalMessages.isRead, false),
      sql`(${internalMessages.recipientId} = ${userId} OR ${internalMessages.messageType} = 'broadcast')`
    ));
}
