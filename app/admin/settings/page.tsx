'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,        // ← INI YANG HARUS DARI shadcn/ui
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  Edit3, 
  LogOut,
  Crown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Axios instance dengan token otomatis
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type AdminProfile = {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_approved: boolean;
};

export default function AdminSettings() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admins/profile');
        const adminData = data.data;
        setAdmin(adminData);
        setEditForm({
          full_name: adminData.full_name,
          email: adminData.email,
          phone_number: adminData.phone_number || '',
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          sessionStorage.removeItem('token');
          router.push('/admin/login');
        } else {
          toast.error('Gagal memuat profil admin');
        }
      } finally {
        setLoading(false);
      }
    };

    if (sessionStorage.getItem('token')) {
      fetchProfile();
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const { data } = await api.patch('/admins/profile', editForm);
      setAdmin(data.data);
      setOpenEdit(false);
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal update profil');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Password baru tidak cocok');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }

    try {
      setSaving(true);
      await api.patch('/admins/profile/password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });
      setOpenPassword(false);
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      toast.success('Password berhasil diubah');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Password lama salah');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    router.push('/admin/login');
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      superadmin: 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white',
      admin_hotel: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
      admin_souvenir: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      admin_buku: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
      admin_cafe: 'bg-gradient-to-r from-orange-600 to-red-600 text-white',
      guest: 'bg-gray-600 text-white',
    };
    return styles[role] || 'bg-gray-600 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Crown className="w-8 h-8 text-yellow-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Card */}
        <Card className="mb-10 bg-gradient-to-r from-yellow-600 to-amber-600 border-0 shadow-2xl">
          <CardContent className="p-10 text-white text-center">
            <div className="w-28 h-28 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
              <User className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-2">{admin?.full_name}</h2>
            <p className="text-xl opacity-90 mb-4">{admin?.email}</p>
            <Badge className={`text-lg px-6 py-2 ${getRoleBadge(admin?.role || '')}`}>
              {admin?.role === 'superadmin' ? 'Super Admin' : admin?.role.replace('admin_', '').replace('_', ' ').toUpperCase()}
            </Badge>
            {admin?.role !== 'superadmin' && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                {admin?.is_approved ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span className="text-green-200 font-medium">Akun Telah Disetujui</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-orange-300" />
                    <span className="text-orange-200 font-medium">Menunggu Persetujuan Superadmin</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-gray-100">
            <TabsTrigger value="profile" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Keamanan
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-2 border-yellow-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-gray-900">Informasi Profil</CardTitle>
                    <CardDescription className="text-gray-600">
                      Kelola data pribadi Anda sebagai administrator
                    </CardDescription>
                  </div>

                  {/* Edit Profile Modal */}
                  <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogTrigger asChild>
                      <Button className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profil
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-2 border-yellow-300">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Edit Profil Admin</DialogTitle>
                        <DialogDescription>Perbarui informasi profil Anda</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-5 py-4">
                        <div>
                          <Label className="text-gray-700 font-semibold">Nama Lengkap</Label>
                          <Input
                            value={editForm.full_name}
                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            className="mt-2 border-yellow-300 focus:border-yellow-500"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-semibold">Email</Label>
                          <Input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="mt-2 border-yellow-300 focus:border-yellow-500"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-semibold">Nomor Telepon</Label>
                          <Input
                            value={editForm.phone_number}
                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                            placeholder="081234567890"
                            className="mt-2 border-yellow-300 focus:border-yellow-500"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenEdit(false)}>Batal</Button>
                        <Button onClick={handleUpdateProfile} disabled={saving} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                          {saving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent className="pt-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { icon: User, label: 'Nama Lengkap', value: admin?.full_name },
                    { icon: Mail, label: 'Email', value: admin?.email },
                    { icon: Phone, label: 'Nomor Telepon', value: admin?.phone_number || 'Belum diisi' },
                    { 
                      icon: Crown, 
                      label: 'Role', 
                      value: <Badge className={getRoleBadge(admin?.role || '')}>
                        {admin?.role === 'superadmin' ? 'Super Admin' : admin?.role.replace('admin_', '').replace('_', ' ').toUpperCase()}
                      </Badge>
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-yellow-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                        <div className="text-xl font-bold text-gray-900 mt-1">
                          {typeof item.value === 'string' ? item.value : item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-2 border-yellow-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Shield className="w-8 h-8 mr-3 text-yellow-600" />
                  Keamanan Akun
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Ganti password untuk menjaga keamanan akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-12">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Key className="w-12 h-12 text-yellow-700" />
                  </div>

                  <Dialog open={openPassword} onOpenChange={setOpenPassword}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white text-lg px-10 shadow-xl">
                        <Key className="w-5 h-5 mr-3" />
                        Ganti Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-2 border-yellow-300">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Ganti Password</DialogTitle>
                        <DialogDescription>Pastikan password baru kuat dan tidak mudah ditebak</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-5 py-4">
                        <div>
                          <Label className="text-gray-700 font-semibold">Password Lama</Label>
                          <Input type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} className="mt-2 border-yellow-300 focus:border-yellow-500" />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-semibold">Password Baru</Label>
                          <Input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="mt-2 border-yellow-300 focus:border-yellow-500" />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-semibold">Konfirmasi Password Baru</Label>
                          <Input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} className="mt-2 border-yellow-300 focus:border-yellow-500" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenPassword(false)}>Batal</Button>
                        <Button onClick={handleChangePassword} disabled={saving} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                          {saving ? 'Menyimpan...' : 'Ubah Password'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}