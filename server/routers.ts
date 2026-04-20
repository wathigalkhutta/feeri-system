import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { vouchers, journalEntries, users } from "../drizzle/schema";
import { localAuthRouter } from "./localAuth";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const appRouter = router({
  system: systemRouter,

  auth: localAuthRouter,

  // ─── Companies ────────────────────────────────────────────────────────────────
  companies: router({
    list: protectedProcedure.query(() => db.getCompanies()),
    listWithSummary: protectedProcedure.query(() => db.getAllCompaniesWithSummary()),
    financialSummary: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getCompanyFinancialSummary(input.companyId)),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getCompanyById(input.id)),
    create: protectedProcedure
      .input(z.object({
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.string().optional(),
        industry: z.string().optional(),
        status: z.enum(["active", "inactive", "suspended"]).optional(),
        revenue: z.string().optional(),
        expenses: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(({ input }) => db.createCompany(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          type: z.string().optional(),
          industry: z.string().optional(),
          status: z.enum(["active", "inactive", "suspended"]).optional(),
          revenue: z.string().optional(),
          expenses: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          address: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateCompany(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCompany(input.id)),
  }),

  // ─── CRM Clients ──────────────────────────────────────────────────────────────
  clients: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getClients(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(["lead", "prospect", "active", "inactive"]).optional(),
        value: z.string().optional(),
        probability: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createClient(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          status: z.enum(["lead", "prospect", "active", "inactive"]).optional(),
          value: z.string().optional(),
          probability: z.number().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateClient(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteClient(input.id)),
  }),

  // ─── Employees ────────────────────────────────────────────────────────────────
  employees: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getEmployees(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        salary: z.string().optional(),
        status: z.enum(["active", "inactive", "on_leave"]).optional(),
        hireDate: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, hireDate: input.hireDate ? new Date(input.hireDate) : undefined };
        return db.createEmployee(data as Parameters<typeof db.createEmployee>[0]);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          department: z.string().optional(),
          position: z.string().optional(),
          salary: z.string().optional(),
          status: z.enum(["active", "inactive", "on_leave"]).optional(),
        }),
      }))
      .mutation(({ input }) => db.updateEmployee(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteEmployee(input.id)),
  }),

  // ─── Leave Requests ───────────────────────────────────────────────────────────
  leaveRequests: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getLeaveRequests(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        companyId: z.number(),
        type: z.enum(["annual", "sick", "emergency", "unpaid"]),
        startDate: z.string(),
        endDate: z.string(),
        days: z.number().optional(),
        reason: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, startDate: new Date(input.startDate), endDate: new Date(input.endDate) };
        return db.createLeaveRequest(data as Parameters<typeof db.createLeaveRequest>[0]);
      }),
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "rejected"]) }))
      .mutation(({ input }) => db.updateLeaveRequest(input.id, { status: input.status })),
  }),

  // ─── Invoices ─────────────────────────────────────────────────────────────────
  invoices: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getInvoices(input.companyId)),
    getWithItems: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getInvoiceWithItems(input.id)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        number: z.string(),
        clientName: z.string(),
        clientEmail: z.string().optional(),
        clientAddress: z.string().optional(),
        date: z.string(),
        dueDate: z.string().optional(),
        subtotal: z.string().optional(),
        taxRate: z.string().optional(),
        taxAmount: z.string().optional(),
        discount: z.string().optional(),
        total: z.string().optional(),
        status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
        notes: z.string().optional(),
        items: z.array(z.object({
          description: z.string(),
          qty: z.number().optional(),
          unitPrice: z.string().optional(),
          total: z.string().optional(),
        })).optional(),
      }))
      .mutation(({ input }) => {
        const { items, ...invoiceData } = input;
        const data = { ...invoiceData, date: new Date(invoiceData.date), dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined };
        return db.createInvoice(data as Parameters<typeof db.createInvoice>[0], (items || []) as Parameters<typeof db.createInvoice>[1]);
      }),
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]) }))
      .mutation(({ input }) => db.updateInvoice(input.id, { status: input.status })),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteInvoice(input.id)),
  }),

  // ─── Journal Entries ──────────────────────────────────────────────────────────
  journalEntries: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getJournalEntries(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        date: z.string(),
        description: z.string(),
        debitAccount: z.string(),
        creditAccount: z.string(),
        amount: z.string(),
        reference: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, date: new Date(input.date) };
        return db.createJournalEntry(data as Parameters<typeof db.createJournalEntry>[0]);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteJournalEntry(input.id)),
  }),

  // ─── Contracts ────────────────────────────────────────────────────────────────
  contracts: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getContracts(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        titleAr: z.string().min(1),
        titleEn: z.string().optional(),
        clientName: z.string(),
        type: z.string().optional(),
        value: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(["draft", "active", "completed", "cancelled", "expired"]).optional(),
        progress: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, startDate: input.startDate ? new Date(input.startDate) : undefined, endDate: input.endDate ? new Date(input.endDate) : undefined };
        return db.createContract(data as Parameters<typeof db.createContract>[0]);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["draft", "active", "completed", "cancelled", "expired"]).optional(),
          progress: z.number().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateContract(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteContract(input.id)),
  }),

  // ─── Partnerships ─────────────────────────────────────────────────────────────
  partnerships: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getPartnerships(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        partnerName: z.string().min(1),
        partnerEmail: z.string().optional(),
        sharePercent: z.string().optional(),
        investment: z.string().optional(),
        profit: z.string().optional(),
        status: z.enum(["active", "inactive", "pending"]).optional(),
        startDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, startDate: input.startDate ? new Date(input.startDate) : undefined };
        return db.createPartnership(data as Parameters<typeof db.createPartnership>[0]);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["active", "inactive", "pending"]).optional(),
          profit: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updatePartnership(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deletePartnership(input.id)),
  }),

  // ─── Vehicles ─────────────────────────────────────────────────────────────────
  vehicles: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getVehicles(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        make: z.string().min(1),
        model: z.string().min(1),
        year: z.number().optional(),
        plateNumber: z.string().optional(),
        color: z.string().optional(),
        dailyRate: z.string().optional(),
        status: z.enum(["available", "rented", "maintenance"]).optional(),
        mileage: z.number().optional(),
      }))
      .mutation(({ input }) => db.createVehicle(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["available", "rented", "maintenance"]).optional(),
          mileage: z.number().optional(),
          dailyRate: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateVehicle(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteVehicle(input.id)),
  }),

  // ─── Rentals ──────────────────────────────────────────────────────────────────
  rentals: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getRentals(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        vehicleId: z.number(),
        companyId: z.number(),
        clientName: z.string().min(1),
        clientPhone: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
        totalAmount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, startDate: new Date(input.startDate), endDate: new Date(input.endDate) };
        return db.createRental(data as Parameters<typeof db.createRental>[0]);
      }),
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["active", "completed", "cancelled"]) }))
      .mutation(({ input }) => db.updateRental(input.id, { status: input.status })),
  }),

  // ─── Tasks ────────────────────────────────────────────────────────────────────
  tasks: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getTasks(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        titleAr: z.string().min(1),
        titleEn: z.string().optional(),
        description: z.string().optional(),
        assignedTo: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const data = { ...input, dueDate: input.dueDate ? new Date(input.dueDate) : undefined };
        return db.createTask(data as Parameters<typeof db.createTask>[0]);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          assignedTo: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateTask(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteTask(input.id)),
  }),

  // ─── Emails ───────────────────────────────────────────────────────────────────
  emails: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number().optional() }))
      .query(({ input }) => db.getEmails(input.companyId)),
    send: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
        module: z.string().optional(),
        type: z.enum(["internal", "external", "general"]),
        fromName: z.string().optional(),
        fromEmail: z.string().optional(),
        toName: z.string().optional(),
        toEmail: z.string().optional(),
        subject: z.string().min(1),
        body: z.string().min(1),
      }))
      .mutation(({ input }) => db.createEmail(input)),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.markEmailRead(input.id)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteEmail(input.id)),
  }),

  // ─── Dashboard ──────────────────────────────────────────────────────────────────
  dashboard: router({
    stats: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getDashboardStats(input.companyId)),
  }),

  // ─── Invoice Template ─────────────────────────────────────────────────────────
  invoiceTemplate: router({
    get: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getInvoiceTemplate(input.companyId)),
    save: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        companyNameAr: z.string().optional(),
        companyNameEn: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        vatNumber: z.string().optional(),
        crNumber: z.string().optional(),
        bankName: z.string().optional(),
        bankAccount: z.string().optional(),
        footerNote: z.string().optional(),
        primaryColor: z.string().optional(),
        invoicePrefix: z.string().optional(),
        paymentTerms: z.string().optional(),
      }))
       .mutation(({ input }) => db.upsertInvoiceTemplate(input)),
  }),

  // ─── Chart of Accounts (شجرة الحسابات) ──────────────────────────────────────
  chartOfAccounts: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getChartOfAccounts(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
        parentId: z.number().optional(),
        level: z.number().optional(),
        isActive: z.boolean().optional(),
        balance: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createChartOfAccount(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          code: z.string().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          type: z.enum(["asset", "liability", "equity", "revenue", "expense"]).optional(),
          isActive: z.boolean().optional(),
          balance: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateChartOfAccount(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteChartOfAccount(input.id)),
  }),

  // ─── Bank Accounts (حسابات البنوك) ───────────────────────────────────────────
  bankAccounts: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getBankAccounts(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        bankName: z.string().min(1),
        accountName: z.string().min(1),
        accountNumber: z.string().min(1),
        iban: z.string().optional(),
        currency: z.string().optional(),
        balance: z.string().optional(),
        type: z.enum(["current", "savings", "investment"]).optional(),
        status: z.enum(["active", "inactive"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createBankAccount(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          bankName: z.string().optional(),
          accountName: z.string().optional(),
          accountNumber: z.string().optional(),
          iban: z.string().optional(),
          currency: z.string().optional(),
          balance: z.string().optional(),
          type: z.enum(["current", "savings", "investment"]).optional(),
          status: z.enum(["active", "inactive"]).optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateBankAccount(input.id, input.data)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteBankAccount(input.id)),
  }),

  // ─── Petty Cash / Advances (العهد والسلف) ────────────────────────────────────
  pettyCash: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getPettyCash(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        employeeId: z.number().optional(),
        employeeName: z.string().min(1),
        type: z.enum(["petty_cash", "advance", "expense"]).optional(),
        amount: z.string(),
        purpose: z.string().min(1),
        date: z.string(),
        returnDate: z.string().optional(),
        returnedAmount: z.string().optional(),
        status: z.enum(["pending", "approved", "settled", "cancelled"]).optional(),
        approvedBy: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createPettyCash(input as any)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          employeeName: z.string().optional(),
          type: z.enum(["petty_cash", "advance", "expense"]).optional(),
          amount: z.string().optional(),
          purpose: z.string().optional(),
          returnDate: z.string().optional(),
          returnedAmount: z.string().optional(),
          status: z.enum(["pending", "approved", "settled", "cancelled"]).optional(),
          approvedBy: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updatePettyCash(input.id, input.data as any)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deletePettyCash(input.id)),
  }),

  // ─── Fixed Assets (الأصول الثابتة) ───────────────────────────────────────────
  fixedAssets: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getFixedAssets(input.companyId)),
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        category: z.string().min(1),
        purchaseDate: z.string(),
        purchaseCost: z.string(),
        usefulLife: z.number().optional(),
        depreciationMethod: z.enum(["straight_line", "declining_balance"]).optional(),
        depreciationRate: z.string().optional(),
        accumulatedDepreciation: z.string().optional(),
        bookValue: z.string().optional(),
        location: z.string().optional(),
        serialNumber: z.string().optional(),
        status: z.enum(["active", "disposed", "under_maintenance"]).optional(),
        disposalDate: z.string().optional(),
        disposalValue: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createFixedAsset(input as any)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          category: z.string().optional(),
          purchaseCost: z.string().optional(),
          usefulLife: z.number().optional(),
          depreciationMethod: z.enum(["straight_line", "declining_balance"]).optional(),
          depreciationRate: z.string().optional(),
          accumulatedDepreciation: z.string().optional(),
          bookValue: z.string().optional(),
          location: z.string().optional(),
          serialNumber: z.string().optional(),
          status: z.enum(["active", "disposed", "under_maintenance"]).optional(),
          disposalDate: z.string().optional(),
          disposalValue: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateFixedAsset(input.id, input.data as any)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteFixedAsset(input.id)),
  }),
  // ─── Vouchers (سندات القبض والصرف) ─────────────────────────────────────────────────────────────────
  vouchers: router({
    list: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        type: z.enum(["receipt", "payment"]).optional(),
      }))
      .query(({ input }) => db.getVouchers(input.companyId, input.type)),

    getNextNumber: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        type: z.enum(["receipt", "payment"]),
      }))
      .query(({ input }) => db.getNextVoucherNumber(input.companyId, input.type)),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        voucherNumber: z.string().min(1),
        type: z.enum(["receipt", "payment"]),
        date: z.string(),
        amount: z.string(),
        currency: z.string().optional(),
        payeeName: z.string().min(1),
        payeeType: z.enum(["client", "employee", "supplier", "other"]).optional(),
        account: z.string().min(1),
        paymentMethod: z.enum(["cash", "bank_transfer", "check", "other"]).optional(),
        referenceNumber: z.string().optional(),
        description: z.string().min(1),
        status: z.enum(["draft", "approved", "cancelled"]).optional(),
        approvedBy: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Determine cash/bank account label based on payment method
        const cashAccount = input.paymentMethod === "bank_transfer"
          ? "بنك - حساب جاري"
          : "صندوق النقدية";

        // Receipt: Debit = Cash/Bank, Credit = specified account (revenue/receivable)
        // Payment: Debit = specified account (expense/payable), Credit = Cash/Bank
        const debitAccount  = input.type === "receipt" ? cashAccount : input.account;
        const creditAccount = input.type === "receipt" ? input.account : cashAccount;

        const journalDescription = input.type === "receipt"
          ? `سند قبض ${input.voucherNumber} - ${input.payeeName} - ${input.description}`
          : `سند صرف ${input.voucherNumber} - ${input.payeeName} - ${input.description}`;

        // Execute both inserts inside a single DB transaction for atomicity
        const drizzleDb = await db.getDb();
        if (!drizzleDb) throw new Error("DB not available");

        let voucherId: number = 0;
        await drizzleDb.transaction(async (tx) => {
          // 1. Insert voucher
          const [voucherResult] = await tx.insert(vouchers).values(input as any);
          voucherId = (voucherResult as any).insertId;

          // 2. Insert journal entry linked to this voucher
          await tx.insert(journalEntries).values({
            companyId: input.companyId,
            date: new Date(input.date),
            description: journalDescription,
            debitAccount,
            creditAccount,
            amount: input.amount,
            reference: input.voucherNumber,
          });
        });

        return voucherId;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["draft", "approved", "cancelled"]).optional(),
          approvedBy: z.string().optional(),
          notes: z.string().optional(),
          amount: z.string().optional(),
          description: z.string().optional(),
          payeeName: z.string().optional(),
          account: z.string().optional(),
          paymentMethod: z.enum(["cash", "bank_transfer", "check", "other"]).optional(),
          referenceNumber: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateVoucher(input.id, input.data as any)),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteVoucher(input.id)),
  }),

  // ─── Business Development: Projects (المشاريع) ───────────────────────────────────────────────────────────────
  projects: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getProjects(input.companyId)),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["new", "in_progress", "completed", "on_hold", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        progress: z.number().min(0).max(100).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budget: z.string().optional(),
        clientName: z.string().optional(),
        teamMembers: z.string().optional(),
        tags: z.string().optional(),
      }))
      .mutation(({ input }) => db.createProject(input as any)),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["new", "in_progress", "completed", "on_hold", "cancelled"]).optional(),
          priority: z.enum(["low", "medium", "high", "critical"]).optional(),
          progress: z.number().min(0).max(100).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          budget: z.string().optional(),
          clientName: z.string().optional(),
          teamMembers: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateProject(input.id, input.data as any)),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteProject(input.id)),
  }),

  // ─── Business Development: Opportunities / CRM (الفرص) ───────────────────────────────────────────────────────────────
  opportunities: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getOpportunities(input.companyId)),

    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        source: z.enum(["advertisement", "client", "partnership", "marketing", "referral", "other"]).optional(),
        status: z.enum(["new", "negotiating", "won", "lost", "on_hold"]).optional(),
        value: z.string().optional(),
        currency: z.string().optional(),
        probability: z.number().min(0).max(100).optional(),
        clientName: z.string().optional(),
        contactPerson: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        expectedCloseDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createOpportunity(input as any)),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          source: z.enum(["advertisement", "client", "partnership", "marketing", "referral", "other"]).optional(),
          status: z.enum(["new", "negotiating", "won", "lost", "on_hold"]).optional(),
          value: z.string().optional(),
          probability: z.number().min(0).max(100).optional(),
          clientName: z.string().optional(),
          contactPerson: z.string().optional(),
          contactEmail: z.string().optional(),
          contactPhone: z.string().optional(),
          expectedCloseDate: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateOpportunity(input.id, input.data as any)),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteOpportunity(input.id)),

    convertToProject: protectedProcedure
      .input(z.object({
        opportunityId: z.number(),
        companyId: z.number(),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        clientName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { opportunityId, companyId, ...projectData } = input;
        const projectId = await db.createProject({ companyId, ...projectData, status: "new", priority: "medium", progress: 0 });
        await db.convertOpportunityToProject(opportunityId, projectId);
        return projectId;
      }),
  }),

  // ─── Business Development: Internal Messages (الرسائل الداخلية) ───────────────────────────────────────────────────────────────
  internalMessages: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number(), userId: z.number().optional() }))
      .query(({ input }) => db.getMessages(input.companyId, input.userId)),

    inbox: protectedProcedure
      .input(z.object({ companyId: z.number(), userId: z.number() }))
      .query(({ input }) => db.getInbox(input.companyId, input.userId)),

    sent: protectedProcedure
      .input(z.object({ companyId: z.number(), userId: z.number() }))
      .query(({ input }) => db.getSent(input.companyId, input.userId)),

    unreadCount: protectedProcedure
      .input(z.object({ companyId: z.number(), userId: z.number() }))
      .query(({ input }) => db.getUnreadCount(input.companyId, input.userId)),

    markAllRead: protectedProcedure
      .input(z.object({ companyId: z.number(), userId: z.number() }))
      .mutation(({ input }) => db.markAllReadForUser(input.companyId, input.userId)),

    getGroup: protectedProcedure
      .input(z.object({ companyId: z.number(), groupId: z.string() }))
      .query(({ input }) => db.getGroupMessages(input.companyId, input.groupId)),

    send: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        senderId: z.number(),
        senderName: z.string(),
        recipientId: z.number().optional(),
        recipientName: z.string().optional(),
        groupId: z.string().optional(),
        groupName: z.string().optional(),
        subject: z.string().optional(),
        body: z.string().min(1),
        messageType: z.enum(["direct", "group", "broadcast"]).optional(),
        parentMessageId: z.number().optional(),
      }))
      .mutation(({ input }) => db.createMessage(input as any)),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.markMessageAsRead(input.id)),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteMessage(input.id)),
  }),

  // ─── Business Development: Stats Dashboard (إحصائيات) ───────────────────────────────────────────────────────────────
  businessDev: router({
    stats: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getBusinessDevStats(input.companyId)),
  }),

  // ─── General Ledger ───────────────────────────────────────────────────────────────────────────────────
  generalLedger: router({
    // Returns all journal entries for a company, optionally filtered by account name and date range
    getEntries: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        account: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }))
      .query(({ input }) => db.getLedgerEntries(input)),

    // Returns a summary of all accounts with their debit/credit totals and running balance
    getAccountSummary: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getLedgerAccountSummary(input.companyId)),
  }),

  // ─── User Management (Admin Only) ───────────────────────────────────────────
  userManagement: router({
    // List all users (owner/admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "owner" && ctx.user.role !== "admin") {
        throw new Error("ليس لديك صلاحية لعرض المستخدمين");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        loginMethod: users.loginMethod,
        lastSignedIn: users.lastSignedIn,
        createdAt: users.createdAt,
      }).from(users).orderBy(users.createdAt);
    }),

    // Create new user (owner/admin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["owner", "manager", "employee", "user"]).default("employee"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "admin") {
          throw new Error("ليس لديك صلاحية لإنشاء مستخدمين");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existing.length > 0) throw new Error("البريد الإلكتروني مستخدم بالفعل");
        const passwordHash = await bcrypt.hash(input.password, 12);
        const result = await db.insert(users).values({
          name: input.name,
          email: input.email,
          passwordHash,
          loginMethod: "local",
          role: input.role,
          lastSignedIn: new Date(),
        });
        return { success: true, userId: (result as any).insertId };
      }),

    // Update user role (owner only)
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["owner", "manager", "employee", "user"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "owner") {
          throw new Error("فقط مالك الشركة يمكنه تغيير الأدوار");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),

    // Delete user (owner only)
    delete: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "owner") {
          throw new Error("فقط مالك الشركة يمكنه حذف المستخدمين");
        }
        if (Number(ctx.user.id) === input.userId) {
          throw new Error("لا يمكنك حذف حسابك الخاص");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(users).where(eq(users.id, input.userId));
        return { success: true };
      }),

    // Change password (any authenticated user for their own account)
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const rows = await db.select().from(users).where(eq(users.id, Number(ctx.user.id))).limit(1);
        if (rows.length === 0) throw new Error("المستخدم غير موجود");
        const user = rows[0];
        if (!user.passwordHash) throw new Error("هذا الحساب لا يدعم تغيير كلمة المرور");
        const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!valid) throw new Error("كلمة المرور الحالية غير صحيحة");
        const newHash = await bcrypt.hash(input.newPassword, 12);
        await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, Number(ctx.user.id)));
        return { success: true };
      }),

    // Update profile (name)
    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().min(2) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(users).set({ name: input.name }).where(eq(users.id, Number(ctx.user.id)));
        return { success: true };
      }),
  }),

});
export type AppRouter = typeof appRouter;
