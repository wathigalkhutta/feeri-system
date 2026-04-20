// Feeri System - Authentication & Permissions Context
// Uses tRPC localAuth (email + password + JWT cookie) - independent from Manus OAuth

import React, { createContext, useContext, useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export type UserRole = 'owner' | 'manager' | 'employee' | 'admin' | 'user';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface ModulePermissions {
  dashboard: Permission;
  companies: Permission;
  crm: Permission;
  hr: Permission;
  accounting: Permission;
  contracts: Permission;
  partnerships: Permission;
  carRental: Permission;
  tasks: Permission;
  reports: Permission;
  businessDev: Permission;
  messages: Permission;
  settings: Permission;
  users: Permission;
}

export interface AuthUser {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  department?: string;
  permissions: ModulePermissions;
}

// ─── Default Permission Sets ───────────────────────────────────────────────

const fullAccess: Permission = { view: true, create: true, edit: true, delete: true };
const readOnly: Permission = { view: true, create: false, edit: false, delete: false };
const readCreate: Permission = { view: true, create: true, edit: false, delete: false };
const readEdit: Permission = { view: true, create: true, edit: true, delete: false };
const noAccess: Permission = { view: false, create: false, edit: false, delete: false };

const ownerPermissions: ModulePermissions = {
  dashboard: fullAccess, companies: fullAccess, crm: fullAccess,
  hr: fullAccess, accounting: fullAccess, contracts: fullAccess,
  partnerships: fullAccess, carRental: fullAccess, tasks: fullAccess,
  reports: fullAccess, businessDev: fullAccess, messages: fullAccess,
  settings: fullAccess, users: fullAccess,
};

const managerPermissions: ModulePermissions = {
  dashboard: readOnly, companies: readOnly, crm: readEdit,
  hr: readEdit, accounting: readCreate, contracts: readEdit,
  partnerships: readOnly, carRental: readEdit, tasks: fullAccess,
  reports: readOnly, businessDev: readEdit, messages: readEdit,
  settings: { view: true, create: false, edit: false, delete: false },
  users: noAccess,
};

const employeePermissions: ModulePermissions = {
  dashboard: readOnly, companies: readOnly, crm: readCreate,
  hr: readOnly, accounting: noAccess, contracts: readOnly,
  partnerships: noAccess, carRental: readOnly, tasks: readEdit,
  reports: noAccess, businessDev: readCreate, messages: readCreate,
  settings: noAccess, users: noAccess,
};

const adminPermissions: ModulePermissions = ownerPermissions;
const defaultPermissions: ModulePermissions = employeePermissions;

function getPermissions(role: UserRole): ModulePermissions {
  switch (role) {
    case 'owner': return ownerPermissions;
    case 'admin': return adminPermissions;
    case 'manager': return managerPermissions;
    case 'employee': return employeePermissions;
    default: return defaultPermissions;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (module: keyof ModulePermissions, action: keyof Permission) => boolean;
  canView: (module: keyof ModulePermissions) => boolean;
  canCreate: (module: keyof ModulePermissions) => boolean;
  canEdit: (module: keyof ModulePermissions) => boolean;
  canDelete: (module: keyof ModulePermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const utils = trpc.useUtils();

  // Check session on mount via tRPC auth.me
  const { data: meData, isLoading: meLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!meLoading) {
      if (meData) {
        const role = (meData.role as UserRole) || 'user';
        setUser({
          id: String(meData.id),
          name: meData.name || meData.email || 'مستخدم',
          email: meData.email || '',
          role,
          permissions: getPermissions(role),
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [meData, meLoading]);

  const loginMutation = trpc.auth.login.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success && result.user) {
        const role = (result.user.role as UserRole) || 'user';
        setUser({
          id: String(result.user.id),
          name: result.user.name || result.user.email || 'مستخدم',
          email: result.user.email || '',
          role,
          permissions: getPermissions(role),
        });
        await utils.auth.me.invalidate();
        return { success: true };
      }
      return { success: false, error: 'فشل تسجيل الدخول' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {}
    setUser(null);
    await utils.auth.me.invalidate();
  };

  const hasPermission = (module: keyof ModulePermissions, action: keyof Permission): boolean => {
    if (!user) return false;
    return user.permissions[module][action];
  };

  const canView = (module: keyof ModulePermissions) => hasPermission(module, 'view');
  const canCreate = (module: keyof ModulePermissions) => hasPermission(module, 'create');
  const canEdit = (module: keyof ModulePermissions) => hasPermission(module, 'edit');
  const canDelete = (module: keyof ModulePermissions) => hasPermission(module, 'delete');

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading: isLoading || meLoading,
      login, logout, hasPermission, canView, canCreate, canEdit, canDelete
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
