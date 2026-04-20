import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Crown, Pencil, Plus, Shield, Trash2, User, UserCog } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Sabri Garza ',
  manager: 'مدير',
  employee: 'موظف',
  user: 'مستخدم',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  employee: 'bg-green-500/20 text-green-400 border-green-500/30',
  user: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="w-3 h-3" />,
  manager: <Shield className="w-3 h-3" />,
  employee: <User className="w-3 h-3" />,
  user: <User className="w-3 h-3" />,
};

export default function Users() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [newRole, setNewRole] = useState('employee');

  // Form state
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });

  const { data: usersList, isLoading } = trpc.userManagement.list.useQuery(undefined, {
    enabled: user?.role === 'owner' || user?.role === 'admin',
  });

  const createUser = trpc.userManagement.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء المستخدم بنجاح');
      utils.userManagement.list.invalidate();
      setShowCreateDialog(false);
      setForm({ name: '', email: '', password: '', role: 'employee' });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateRole = trpc.userManagement.updateRole.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الدور بنجاح');
      utils.userManagement.list.invalidate();
      setShowEditDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteUser = trpc.userManagement.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف المستخدم');
      utils.userManagement.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    createUser.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role as 'owner' | 'manager' | 'employee' | 'user',
    });
  };

  const handleEditRole = (u: { id: number; name: string; email: string; role: string }) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setShowEditDialog(true);
  };

  const handleDelete = (u: { id: number; name: string }) => {
    setUserToDelete(u);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser.mutate({ userId: userToDelete.id });
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <Layout title="إدارة المستخدمين" subtitle="صلاحيات المستخدمين والأدوار">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">ليس لديك صلاحية للوصول لهذه الصفحة</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="إدارة المستخدمين" subtitle="إدارة حسابات المستخدمين وصلاحياتهم">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['owner', 'manager', 'employee', 'user'].map((role) => {
          const count = usersList?.filter((u) => u.role === role).length ?? 0;
          return (
            <Card key={role} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${ROLE_COLORS[role]}`}>
                  {ROLE_ICONS[role]}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            قائمة المستخدمين
          </CardTitle>
          <Button onClick={() => setShowCreateDialog(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            مستخدم جديد
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : !usersList || usersList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا يوجد مستخدمون</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">طريقة الدخول</TableHead>
                  <TableHead className="text-right">آخر دخول</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge className={`${ROLE_COLORS[u.role ?? 'user']} border text-xs flex items-center gap-1 w-fit`}>
                        {ROLE_ICONS[u.role ?? 'user']}
                        {ROLE_LABELS[u.role ?? 'user']}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.loginMethod === 'local' ? 'بريد إلكتروني' : 'OAuth'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString('ar-SA') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user?.role === 'owner' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-400 hover:text-blue-300"
                              onClick={() => handleEditRole({ id: u.id, name: u.name ?? '', email: u.email ?? '', role: u.role ?? 'employee' })}
                              title="تعديل الدور"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {Number(u.id) !== Number(user?.id) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300"
                                onClick={() => handleDelete({ id: u.id, name: u.name ?? '' })}
                                title="حذف المستخدم"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">إنشاء مستخدم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-foreground">الاسم الكامل *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="أدخل الاسم الكامل"
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">البريد الإلكتروني *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@feeri.com"
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">كلمة المرور *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="6 أحرف على الأقل"
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">الدور</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="employee">موظف</SelectItem>
                  <SelectItem value="manager">مدير</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="owner">مالك الشركة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreate}
                disabled={createUser.isPending}
                className="flex-1"
              >
                {createUser.isPending ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1 bg-transparent">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">تعديل دور المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-background border border-border">
                <p className="font-medium text-foreground">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              <div>
                <Label className="text-foreground">الدور الجديد</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="manager">مدير</SelectItem>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="owner">مالك الشركة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => updateRole.mutate({ userId: selectedUser.id, role: newRole as 'owner' | 'manager' | 'employee' | 'user' })}
                  disabled={updateRole.isPending}
                  className="flex-1"
                >
                  {updateRole.isPending ? 'جاري الحفظ...' : 'حفظ التغيير'}
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1 bg-transparent">
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>
              هل أنت متأكد من حذف المستخدم <span className="font-semibold" style={{ color: 'var(--feeri-text-primary)' }}>«{userToDelete?.name}»</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={confirmDelete}
                disabled={deleteUser.isPending}
                className="flex-1"
                style={{ background: 'oklch(0.60 0.22 25)', color: 'white' }}
              >
                {deleteUser.isPending ? 'جاري الحذف...' : 'حذف المستخدم'}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1 bg-transparent">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
