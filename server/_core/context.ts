import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyLocalSession } from "../localAuth";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookieHeader = opts.req.headers.cookie || "";
    const sessionUser = await verifyLocalSession(cookieHeader);
    if (sessionUser) {
      const db = await getDb();
      if (db) {
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(sessionUser.id)))
          .limit(1);
        if (rows.length > 0) {
          user = rows[0];
        }
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
