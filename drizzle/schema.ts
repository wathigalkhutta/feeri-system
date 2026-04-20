import {
  int, mysqlEnum, mysqlTable, text, timestamp, varchar,
  decimal, boolean, date
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  role: mysqlEnum("role", ["user", "admin", "owner", "manager", "employee"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Companies ────────────────────────────────────────────────────────────────
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  type: varchar("type", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  revenue: decimal("revenue", { precision: 15, scale: 2 }).default("0"),
  expenses: decimal("expenses", { precision: 15, scale: 2 }).default("0"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  logoUrl: text("logoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ─── CRM Clients ──────────────────────────────────────────────────────────────
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  status: mysqlEnum("status", ["lead", "prospect", "active", "inactive"]).default("lead").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).default("0"),
  probability: int("probability").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ─── Employees ────────────────────────────────────────────────────────────────
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  salary: decimal("salary", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "inactive", "on_leave"]).default("active").notNull(),
  hireDate: date("hireDate"),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  number: varchar("number", { length: 50 }).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientAddress: text("clientAddress"),
  date: date("date").notNull(),
  dueDate: date("dueDate"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).default("0"),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("15"),
  taxAmount: decimal("taxAmount", { precision: 15, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 15, scale: 2 }).default("0"),
  total: decimal("total", { precision: 15, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ─── Invoice Items ────────────────────────────────────────────────────────────
export const invoiceItems = mysqlTable("invoiceItems", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  description: text("description").notNull(),
  qty: int("qty").default(1),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// ─── Journal Entries ──────────────────────────────────────────────────────────
export const journalEntries = mysqlTable("journalEntries", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  debitAccount: varchar("debitAccount", { length: 255 }).notNull(),
  creditAccount: varchar("creditAccount", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

// ─── Contracts ────────────────────────────────────────────────────────────────
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }),
  value: decimal("value", { precision: 15, scale: 2 }).default("0"),
  startDate: date("startDate"),
  endDate: date("endDate"),
  status: mysqlEnum("status", ["draft", "active", "completed", "cancelled", "expired"]).default("draft").notNull(),
  progress: int("progress").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// ─── Partnerships ─────────────────────────────────────────────────────────────
export const partnerships = mysqlTable("partnerships", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  partnerName: varchar("partnerName", { length: 255 }).notNull(),
  partnerEmail: varchar("partnerEmail", { length: 320 }),
  sharePercent: decimal("sharePercent", { precision: 5, scale: 2 }).default("0"),
  investment: decimal("investment", { precision: 15, scale: 2 }).default("0"),
  profit: decimal("profit", { precision: 15, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("active").notNull(),
  startDate: date("startDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = typeof partnerships.$inferInsert;

// ─── Vehicles (Car Rental) ────────────────────────────────────────────────────
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year"),
  plateNumber: varchar("plateNumber", { length: 50 }),
  color: varchar("color", { length: 50 }),
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["available", "rented", "maintenance"]).default("available").notNull(),
  mileage: int("mileage").default(0),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// ─── Rentals ──────────────────────────────────────────────────────────────────
export const rentals = mysqlTable("rentals", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicleId").notNull(),
  companyId: int("companyId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 50 }),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rental = typeof rentals.$inferSelect;
export type InsertRental = typeof rentals.$inferInsert;

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  description: text("description"),
  assignedTo: varchar("assignedTo", { length: 255 }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "done", "cancelled"]).default("todo").notNull(),
  dueDate: date("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ─── Emails ───────────────────────────────────────────────────────────────────
export const emails = mysqlTable("emails", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId"),
  module: varchar("module", { length: 100 }),
  type: mysqlEnum("type", ["internal", "external", "general"]).default("internal").notNull(),
  fromName: varchar("fromName", { length: 255 }),
  fromEmail: varchar("fromEmail", { length: 320 }),
  toName: varchar("toName", { length: 255 }),
  toEmail: varchar("toEmail", { length: 320 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;

// ─── Leave Requests ───────────────────────────────────────────────────────────
export const leaveRequests = mysqlTable("leaveRequests", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  companyId: int("companyId").notNull(),
  type: mysqlEnum("type", ["annual", "sick", "emergency", "unpaid"]).default("annual").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  days: int("days").default(1),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;

// ─── Invoice Template Settings ────────────────────────────────────────────────
export const invoiceTemplates = mysqlTable("invoiceTemplates", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().unique(),
  companyNameAr: varchar("companyNameAr", { length: 255 }),
  companyNameEn: varchar("companyNameEn", { length: 255 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  vatNumber: varchar("vatNumber", { length: 50 }),
  crNumber: varchar("crNumber", { length: 50 }),
  bankName: varchar("bankName", { length: 100 }),
  bankAccount: varchar("bankAccount", { length: 100 }),
  footerNote: text("footerNote"),
  primaryColor: varchar("primaryColor", { length: 20 }),
  invoicePrefix: varchar("invoicePrefix", { length: 20 }),
  paymentTerms: varchar("paymentTerms", { length: 10 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
export type InsertInvoiceTemplate = typeof invoiceTemplates.$inferInsert;
// ─── Chart of Accounts (شجرة الحسابات) ───────────────────────────────────────
export const chartOfAccounts = mysqlTable("chartOfAccounts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  type: mysqlEnum("type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  parentId: int("parentId"),
  level: int("level").default(1),
  isActive: boolean("isActive").default(true),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = typeof chartOfAccounts.$inferInsert;

// ─── Bank Accounts (حسابات البنوك) ────────────────────────────────────────────
export const bankAccounts = mysqlTable("bankAccounts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  bankName: varchar("bankName", { length: 255 }).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 50 }).notNull(),
  iban: varchar("iban", { length: 50 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  type: mysqlEnum("type", ["current", "savings", "investment"]).default("current").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

// ─── Petty Cash / Advances (العهد والسلف) ─────────────────────────────────────
export const pettyCash = mysqlTable("pettyCash", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId"),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["petty_cash", "advance", "expense"]).default("petty_cash").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(),
  date: date("date").notNull(),
  returnDate: date("returnDate"),
  returnedAmount: decimal("returnedAmount", { precision: 15, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "approved", "settled", "cancelled"]).default("pending").notNull(),
  approvedBy: varchar("approvedBy", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PettyCash = typeof pettyCash.$inferSelect;
export type InsertPettyCash = typeof pettyCash.$inferInsert;

// ─── Fixed Assets (الأصول الثابتة) ────────────────────────────────────────────
export const fixedAssets = mysqlTable("fixedAssets", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(),
  purchaseDate: date("purchaseDate").notNull(),
  purchaseCost: decimal("purchaseCost", { precision: 15, scale: 2 }).notNull(),
  usefulLife: int("usefulLife").default(5),
  depreciationMethod: mysqlEnum("depreciationMethod", ["straight_line", "declining_balance"]).default("straight_line").notNull(),
  depreciationRate: decimal("depreciationRate", { precision: 5, scale: 2 }).default("20"),
  accumulatedDepreciation: decimal("accumulatedDepreciation", { precision: 15, scale: 2 }).default("0"),
  bookValue: decimal("bookValue", { precision: 15, scale: 2 }).default("0"),
  location: varchar("location", { length: 255 }),
  serialNumber: varchar("serialNumber", { length: 100 }),
  status: mysqlEnum("status", ["active", "disposed", "under_maintenance"]).default("active").notNull(),
  disposalDate: date("disposalDate"),
  disposalValue: decimal("disposalValue", { precision: 15, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FixedAsset = typeof fixedAssets.$inferSelect;
export type InsertFixedAsset = typeof fixedAssets.$inferInsert;

// ─── Vouchers - Receipt & Payment (سندات القبض والصرف) ───────────────────────
export const vouchers = mysqlTable("vouchers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  voucherNumber: varchar("voucherNumber", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["receipt", "payment"]).notNull(),
  date: date("date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  payeeName: varchar("payeeName", { length: 255 }).notNull(),
  payeeType: mysqlEnum("payeeType", ["client", "employee", "supplier", "other"]).default("other").notNull(),
  account: varchar("account", { length: 255 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "check", "other"]).default("cash").notNull(),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["draft", "approved", "cancelled"]).default("draft").notNull(),
  approvedBy: varchar("approvedBy", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = typeof vouchers.$inferInsert;

// ─── Business Development: Projects (المشاريع) ───────────────────────────────
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", ["new", "in_progress", "completed", "on_hold", "cancelled"]).default("new").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  progress: int("progress").default(0).notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  clientName: varchar("clientName", { length: 255 }),
  teamMembers: text("teamMembers"),
  tags: varchar("tags", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── Business Development: Opportunities / CRM (الفرص) ──────────────────────
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  source: mysqlEnum("source", ["advertisement", "client", "partnership", "marketing", "referral", "other"]).default("other").notNull(),
  status: mysqlEnum("status", ["new", "negotiating", "won", "lost", "on_hold"]).default("new").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  probability: int("probability").default(50),
  clientName: varchar("clientName", { length: 255 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  expectedCloseDate: date("expectedCloseDate"),
  convertedToProjectId: int("convertedToProjectId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// ─── Business Development: Internal Messages (الرسائل الداخلية) ──────────────
export const internalMessages = mysqlTable("internalMessages", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  senderId: int("senderId").notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  recipientId: int("recipientId"),
  recipientName: varchar("recipientName", { length: 255 }),
  groupId: varchar("groupId", { length: 100 }),
  groupName: varchar("groupName", { length: 255 }),
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  messageType: mysqlEnum("messageType", ["direct", "group", "broadcast"]).default("direct").notNull(),
  status: mysqlEnum("status", ["sent", "delivered", "read"]).default("sent").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  parentMessageId: int("parentMessageId"),
  attachmentUrl: text("attachmentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InternalMessage = typeof internalMessages.$inferSelect;
export type InsertInternalMessage = typeof internalMessages.$inferInsert;
