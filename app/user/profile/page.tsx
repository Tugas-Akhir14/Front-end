'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  User,
  LogOut,
  Edit3,
  Key,
  Calendar,
  Users,
} from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type AdminProfile = {
  id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  is_approved: boolean;
};

type Booking = {
  id: number;
  room: {
    number: string;
    room_type: {
      type: string;
    };
  };
  check_in: string;
  check_out: string;
  total_nights: number;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
  created_at: string;
};

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [totalBookings, setTotalBookings] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('profile'); // Tambah state untuk tab
  const limit = 10;

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admins/profile');
        const userData = data.data;
        setUser(userData);
        setEditForm({
          full_name: userData.full_name,
          email: userData.email,
          phone_number: userData.phone_number || '',
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          sessionStorage.removeItem('token');
          router.push('/login');
        } else {
          toast.error('Gagal memuat profil');
        }
      } finally {
        setLoading(false);
      }
    };

    if (sessionStorage.getItem('token')) {
      fetchProfile();
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchBookings = async (pageNum: number = 1) => {
    if (activeTab !== 'bookings') return; // Hanya fetch kalau tab aktif

    try {
      setLoadingBookings(true);
      const offset = (pageNum - 1) * limit;
      const { data } = await api.get(`/public/bookings/me?limit=${limit}&offset=${offset}`);

      const rawBookings = data?.data?.data || [];
      const bookingsData = Array.isArray(rawBookings) ? rawBookings : [];
      
      setBookings(bookingsData);
      setTotalBookings(data?.data?.total || 0);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        router.push('/login');
        return;
      }
      toast.error('Gagal memuat riwayat pemesanan');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Trigger fetch saat tab berubah ke bookings
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings(1);
    }
  }, [activeTab]);

  const handleUpdateProfile = async () => {
    if (!editForm.full_name || !editForm.email) {
      toast.error('Nama dan email wajib diisi');
      return;
    }
    try {
      setSaving(true);
      const { data } = await api.patch('/admins/profile', {
        full_name: editForm.full_name,
        email: editForm.email,
        phone_number: editForm.phone_number || null,
      });
      setUser(data.data);
      setOpenEditModal(false);
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal update profil');
    } finally {
      setSaving(false);
    }
  };

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
      });
      setOpenPasswordModal(false);
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      toast.success('Password berhasil diubah');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengubah password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'confirmed':   return <span className={`${base} bg-green-900 text-green-300`}>Confirmed</span>;
      case 'pending':     return <span className={`${base} bg-yellow-900 text-yellow-300`}>Pending</span>;
      case 'cancelled':   return <span className={`${base} bg-red-900 text-red-300`}>Cancelled</span>;
      case 'checked_in':  return <span className={`${base} bg-blue-900 text-blue-300`}>Checked In</span>;
      case 'checked_out': return <span className={`${base} bg-gray-700 text-gray-300`}>Checked Out</span>;
      default:            return <span className={`${base} bg-gray-700 text-gray-300`}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-400">Kelola akun dan riwayat pemesanan Anda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Card className="bg-gray-900 border-2 border-amber-700">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-amber-500 rounded-full flex items-center justify-center border-4 border-amber-400 shadow-lg">
                  <User className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold">{user?.full_name}</h3>
                <p className="text-gray-400">{user?.email}</p>
                <p className="text-sm text-amber-400 mt-2 capitalize">
                  {user?.role.replace('_', ' ')}
                </p>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="mt-8 w-full border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-3 bg-gray-900">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="bookings">Riwayat Pesanan</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card className="bg-gray-900 border-2 border-amber-700">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-2xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                            Informasi Pribadi
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Update data profil Anda
                          </CardDescription>
                        </div>
                        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
                          <DialogTrigger asChild>
                            <Button className="bg-amber-500 hover:bg-amber-600">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 text-white border-2 border-amber-700">
                            <DialogHeader>
                              <DialogTitle>Edit Profile</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Ubah informasi profil Anda
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>Nama Lengkap</Label>
                                <Input
                                  value={editForm.full_name}
                                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                  className="bg-gray-800 border-amber-600 text-white mt-1"
                                />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="bg-gray-800 border-amber-600 text-white mt-1"
                                />
                              </div>
                              <div>
                                <Label>Nomor Telepon</Label>
                                <Input
                                  value={editForm.phone_number}
                                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                  placeholder="081234567890"
                                  className="bg-gray-800 border-amber-600 text-white mt-1"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setOpenEditModal(false)}>
                                Batal
                              </Button>
                              <Button
                                onClick={handleUpdateProfile}
                                disabled={saving}
                                className="bg-amber-500 hover:bg-amber-600"
                              >
                                {saving ? 'Menyimpan...' : 'Simpan'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label className="text-gray-400">Nama Lengkap</Label><p className="text-xl font-medium text-white mt-1">{user?.full_name}</p></div>
                        <div><Label className="text-gray-400">Email</Label><p className="text-xl font-medium text-white mt-1">{user?.email}</p></div>
                        <div><Label className="text-gray-400">Nomor Telepon</Label><p className="text-xl font-medium text-white mt-1">{user?.phone_number || 'Belum diisi'}</p></div>
                        <div><Label className="text-gray-400">Role</Label><p className="text-xl font-medium text-amber-400 capitalize mt-1">{user?.role.replace(/_/g, ' ')}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <Card className="bg-gray-900 border-2 border-amber-700">
                    <CardHeader>
                      <CardTitle className="text-2xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                        Keamanan Akun
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Dialog open={openPasswordModal} onOpenChange={setOpenPasswordModal}>
                        <DialogTrigger asChild>
                          <Button className="bg-amber-500 hover:bg-amber-600">
                            <Key className="w-4 h-4 mr-2" />
                            Ganti Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 text-white border-2 border-amber-700">
                          <DialogHeader>
                            <DialogTitle>Ganti Password</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div><Label>Password Lama</Label><Input type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} className="bg-gray-800 border-amber-600 text-white mt-1" /></div>
                            <div><Label>Password Baru</Label><Input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="bg-gray-800 border-amber-600 text-white mt-1" /></div>
                            <div><Label>Konfirmasi Password Baru</Label><Input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} className="bg-gray-800 border-amber-600 text-white mt-1" /></div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenPasswordModal(false)}>Batal</Button>
                            <Button onClick={handleChangePassword} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
                              {saving ? 'Menyimpan...' : 'Ubah Password'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <Card className="bg-gray-900 border-2 border-amber-700">
                    <CardHeader>
                      <CardTitle className="text-2xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                        Riwayat Pemesanan Kamar
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Semua pemesanan kamar yang pernah Anda buat
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingBookings ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                        </div>
                      ) : bookings.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                          <p className="text-gray-400">Belum ada riwayat pemesanan</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.map((booking) => (
                            <div key={booking.id} className="bg-gray-800/50 border border-amber-800/30 rounded-lg p-6 hover:border-amber-600 transition">
                              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-amber-600 text-white rounded-lg p-3">
                                      <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-semibold">
                                        {booking.room.room_type.type} - Kamar {booking.room.number}
                                      </h4>
                                      <p className="text-sm text-gray-400">Booking #{booking.id}</p>
                                    </div>
                                    <div className="ml-auto">{getStatusBadge(booking.status)}</div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div><p className="text-gray-400">Check-in</p><p className="font-medium">{format(new Date(booking.check_in), 'dd MMM yyyy', { locale: localeId })}</p></div>
                                    <div><p className="text-gray-400">Check-out</p><p className="font-medium">{format(new Date(booking.check_out), 'dd MMM yyyy', { locale: localeId })}</p></div>
                                    <div><p className="text-gray-400">Lama Menginap</p><p className="font-medium">{booking.total_nights} malam</p></div>
                                    <div><p className="text-gray-400">Tamu</p><p className="font-medium"><Users className="inline w-4 h-4 mr-1" />{booking.guests} orang</p></div>
                                  </div>

                                  <div className="mt-4 flex items-center justify-between">
                                    <p className="text-lg font-bold text-amber-400">
                                      Rp {booking.total_price.toLocaleString('id-ID')}
                                    </p>
                                    <span className="text-sm text-gray-500">
                                      {format(new Date(booking.created_at), 'dd MMM yyyy HH:mm', { locale: localeId })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {totalBookings > limit && (
                        <div className="flex justify-center gap-4 mt-8">
                          <Button variant="outline" disabled={page === 1} onClick={() => fetchBookings(page - 1)}>
                            Sebelumnya
                          </Button>
                          <span className="flex items-center px-4 text-gray-400">
                            Halaman {page} dari {Math.ceil(totalBookings / limit)}
                          </span>
                          <Button variant="outline" disabled={page * limit >= totalBookings} onClick={() => fetchBookings(page + 1)}>
                            Selanjutnya
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}