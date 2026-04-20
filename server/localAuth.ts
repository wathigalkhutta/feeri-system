/**
 * Local Auth Router - Independent from Manus OAuth
 * Provides register / login / logout / me via email + password + JWT
 */
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

const JWT_SECRET = ENV.cookieSecret || "feeri-secret-key-change-in-production";
const COOKIE_NAME = "feeri_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function signToken(payload: { userId: number; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export const localAuthRouter = router({
  // ── Register ────────────────────────────────────────────────────────────────
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["owner", "manager", "employee", "user"]).default("user"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if email already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      if (existing.length > 0) {
        throw new Error("البريد الإلكتروني مستخدم بالفعل");
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const result = await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "local",
        role: input.role,
        lastSignedIn: new Date(),
      });

      const userId = (result as any).insertId as number;
      const token = signToken({ userId, email: input.email, role: input.role });

      // Set cookie
      ctx.res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`
      );

      return { success: true, userId };
    }),

  // ── Login ───────────────────────────────────────────────────────────────────
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (rows.length === 0) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      const user = rows[0];

      if (!user.passwordHash) {
        throw new Error("هذا الحساب لا يدعم تسجيل الدخول بكلمة المرور");
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      // Update lastSignedIn
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      const token = signToken({
        userId: user.id,
        email: user.email || "",
        role: user.role,
      });

      ctx.res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  // ── Logout ──────────────────────────────────────────────────────────────────
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    );
    return { success: true };
  }),

  // ── Me ──────────────────────────────────────────────────────────────────────
  me: publicProcedure.query(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.cookie || "";
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) return null;

    try {
      const payload = jwt.verify(match[1], JWT_SECRET) as {
        userId: number;
        email: string;
        role: string;
      };

      const db = await getDb();
      if (!db) return null;

      const rows = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (rows.length === 0) return null;

      const user = rows[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        openId: String(user.id),
      };
    } catch {
      return null;
    }
  }),
});

/**
 * Verify JWT from cookie and return user payload
 * Used by context.ts to authenticate requests
 */
export async function verifyLocalSession(cookieHeader: string) {
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  try {
    const payload = jwt.verify(match[1], JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };

    const db = await getDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (rows.length === 0) return null;

    const user = rows[0];
    return {
      id: String(user.id),
      openId: String(user.id),
      name: user.name || "",
      email: user.email || "",
      role: user.role,
    };
  } catch {
    return null;
  }
}
