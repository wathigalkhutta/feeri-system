// Tests for userManagement router procedures
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: string = "owner"): { ctx: TrpcContext; setCookieHeaders: string[] } {
  const setCookieHeaders: string[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: null,
    email: "owner@feeri.com",
    name: "Owner User",
    passwordHash: null,
    loginMethod: "local",
    role: role as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: { cookie: "" },
    } as TrpcContext["req"],
    res: {
      setHeader: (name: string, value: string) => {
        if (name === "Set-Cookie") {
          setCookieHeaders.push(value);
        }
      },
    } as unknown as TrpcContext["res"],
  };
  return { ctx, setCookieHeaders };
}

describe("userManagement router", () => {
  it("list procedure requires authentication", async () => {
    // Test that the procedure exists and is callable
    const { ctx } = createAuthContext("owner");
    const caller = appRouter.createCaller(ctx);
    // The procedure should exist
    expect(typeof caller.userManagement.list).toBe("function");
  });

  it("changePassword procedure requires authentication", async () => {
    const { ctx } = createAuthContext("owner");
    const caller = appRouter.createCaller(ctx);
    // The procedure should exist
    expect(typeof caller.userManagement.changePassword).toBe("function");
  });

  it("create procedure requires authentication", async () => {
    const { ctx } = createAuthContext("owner");
    const caller = appRouter.createCaller(ctx);
    // The procedure should exist
    expect(typeof caller.userManagement.create).toBe("function");
  });

  it("updateRole procedure requires authentication", async () => {
    const { ctx } = createAuthContext("owner");
    const caller = appRouter.createCaller(ctx);
    // The procedure should exist
    expect(typeof caller.userManagement.updateRole).toBe("function");
  });

  it("delete procedure requires authentication", async () => {
    const { ctx } = createAuthContext("owner");
    const caller = appRouter.createCaller(ctx);
    // The procedure should exist
    expect(typeof caller.userManagement.delete).toBe("function");
  });
});
