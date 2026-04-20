import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; setCookieHeaders: string[] } {
  const setCookieHeaders: string[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: null,
    email: "sample@example.com",
    name: "Sample User",
    passwordHash: null,
    loginMethod: "local",
    role: "user",
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

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, setCookieHeaders } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(setCookieHeaders.length).toBeGreaterThan(0);
    // The logout cookie should have Max-Age=0 to clear it
    expect(setCookieHeaders[0]).toContain("Max-Age=0");
  });
});
