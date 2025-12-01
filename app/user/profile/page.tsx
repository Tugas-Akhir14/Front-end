'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Shield,
  History,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  const [activeTab, setActiveTab] = useState('profile');

  const limit = 5;
  const totalPages = Math.ceil(totalBookings / limit);

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
    if (activeTab !== 'bookings') return;

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
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        router.push('/login');
        return;
      }
      toast.error('Gagal memuat riwayat pemesanan');
      setBookings([]);
      setTotalBookings(0);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => { 
    if (activeTab === 'bookings') {
      fetchBookings(page);
    }
  }, [activeTab, page]);

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
    const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border';
    switch (status) {
      case 'confirmed':   return <span className={`${base} bg-emerald-500/20 text-emerald-300 border-emerald-500/50`}><CheckCircle2 className="w-3 h-3" />Confirmed</span>;
      case 'pending':     return <span className={`${base} bg-yellow-500/20 text-yellow-300 border-yellow-500/50`}><Sparkles className="w-3 h-3" />Pending</span>;
      case 'cancelled':   return <span className={`${base} bg-red-500/20 text-red-300 border-red-500/50`}>Cancelled</span>;
      case 'checked_in':  return <span className={`${base} bg-blue-500/20 text-blue-300 border-blue-500/50`}><Star className="w-3 h-3" />Checked In</span>;
      case 'checked_out': return <span className={`${base} bg-gray-500/20 text-gray-300 border-gray-500/50`}>Checked Out</span>;
      default:            return <span className={`${base} bg-gray-500/20 text-gray-300`}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 border-8 border-amber-600 border-t-transparent rounded-full"
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              My Sanctuary
            </h1>
            <p className="text-xl text-gray-400">Your personal space at our luxury residence</p>
          </motion.div>
          

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-amber-800/50 shadow-2xl">
                <div className="absolute inset-0 bg-amber-600 opacity-5" />
                <CardContent className="p-8 text-center relative">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative mx-auto mb-6">
                    <div className="absolute inset-0 bg-amber-500 rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-40 h-40 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center border-4 border-amber-400 shadow-2xl">
                      <User className="w-20 h-20 text-white" strokeWidth={1.5} />
                    </div>
                  </motion.div>

                  <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    {user?.full_name}
                  </h3>
                  <p className="text-gray-400 mt-2">{user?.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <p className="text-amber-400 font-medium capitalize">{user?.role.replace('_', ' ')}</p>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-10">
                    <Button onClick={handleLogout} variant="outline" className="w-full border-red-600 text-red-400 hover:bg-red-600/20">
                      <LogOut className="w-5 h-5 mr-2" /> Logout
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 backdrop-blur border border-amber-800/30 p-2 rounded-xl">
                  {[
                    { value: 'profile', icon: User, label: 'Profile' },
                    { value: 'security', icon: Shield, label: 'Security' },
                    { value: 'bookings', icon: History, label: 'Riwayat Pesanan' },
                  ].map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="relative data-[state=active]:text-amber-400">
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                      {activeTab === tab.value && (
                        <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 rounded-lg -z-10" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>


                <AnimatePresence mode="wait">
                  {/* Profile Tab */}
                  <TabsContent value="profile" forceMount>
                    <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-gray-900/80 backdrop-blur border-2 border-amber-700/50 shadow-2xl">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-3xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                                Informasi Pribadi
                              </CardTitle>
                              <CardDescription className="text-gray-400 text-lg">Perbarui data profil Anda</CardDescription>
                            </div>
                            <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
                              <DialogTrigger asChild>
                                <motion.div whileHover={{ scale: 1.1 }}>
                                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                                    <Edit3 className="w-5 h-5 mr-2" /> Edit Profile
                                  </Button>
                                </motion.div>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-900 border-2 border-amber-700 text-white">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 py-6">
                                  {['full_name', 'email', 'phone_number'].map((field) => (
                                    <div key={field}>
                                      <Label className="text-amber-400">
                                        {field === 'full_name' ? 'Nama Lengkap' : field === 'email' ? 'Email' : 'Nomor Telepon'}
                                      </Label>
                                      <Input
                                        value={editForm[field as keyof typeof editForm]}
                                        onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                        className="mt-2 bg-gray-800 border-amber-600/50 focus:border-amber-500 text-white"
                                        placeholder={field === 'phone_number' ? '081234567890' : ''}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setOpenEditModal(false)}>Batal</Button>
                                  <Button onClick={handleUpdateProfile} disabled={saving} className="bg-gradient-to-r from-amber-500 to-yellow-600">
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                          </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
                          {[
                            { label: 'Nama Lengkap', value: user?.full_name },
                            { label: 'Email', value: user?.email },
                            { label: 'Nomor Telepon', value: user?.phone_number || 'Belum diisi' },
                            { label: 'Role', value: user?.role.replace(/_/g, ' '), highlight: true },
                          ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                              <p className="text-gray-500">{item.label}</p>
                              <p className={`font-semibold ${item.highlight ? 'text-amber-400 text-2xl' : 'text-white'}`}>{item.value}</p>
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-gray-900/80 backdrop-blur border-2 border-amber-700/50 shadow-2xl">
                        <CardHeader>
                          <CardTitle className="text-3xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent flex items-center gap-3">
                            <Shield className="w-10 h-10" /> Keamanan Akun
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Dialog open={openPasswordModal} onOpenChange={setOpenPasswordModal}>
                            <DialogTrigger asChild>
                              <motion.div whileHover={{ scale: 1.05 }}>
                                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600">
                                  <Key className="w-6 h-6 mr-3" /> Ganti Password
                                </Button>
                              </motion.div>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-2 border-amber-700">
                              <DialogHeader><DialogTitle className="text-2xl">Ganti Password</DialogTitle></DialogHeader>
                              <div className2="space-y-5 py-4">
                                {['old_password', 'new_password', 'confirm_password'].map((field) => (
                                  <div key={field}>
                                    <Label>{field === 'old_password' ? 'Password Lama' : field === 'new_password' ? 'Password Baru' : 'Konfirmasi Password'}</Label>
                                    <Input type="password" value={passwordForm[field as keyof typeof passwordForm]} onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })} className="mt-2 bg-gray-800 border-amber-600/50" />
                                  </div>
                                ))}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setOpenPasswordModal(false)}>Batal</Button>
                                <Button onClick={handleChangePassword} disabled={saving} className="bg-gradient-to-r from-amber-500 to-yellow-600">
                                  {saving ? 'Mengubah...' : 'Ubah Password'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Bookings Tab - CARD LEBIH KECIL & KOMPAK */}
                  <TabsContent value="bookings">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-gray-900/80 backdrop-blur border-2 border-amber-700/50 shadow-2xl">
                        <CardHeader>
                          <CardTitle className="text-3xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent flex items-center gap-3">
                            <History className="w-10 h-10" /> Riwayat Pemesanan
                          </CardTitle>
                          <CardDescription className="text-gray-400">Semua pemesanan kamar Anda</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {loadingBookings ? (
                            <div className="space-y-4">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-gray-800/50 border border-amber-800/20 rounded-xl h-32 animate-pulse" />
                              ))}
                            </div>
                          ) : bookings.length === 0 ? (
                            <div className="text-center py-20">
                              <Calendar className="w-20 h-20 mx-auto text-gray-700 mb-4" />
                              <p className="text-xl text-gray-400">Belum ada riwayat pemesanan</p>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-4">
                                <AnimatePresence>
                                  {bookings.map((booking, index) => (
                                    <motion.div
                                      key={booking.id}
                                      initial={{ opacity: 0, x: -30 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.08 }}
                                      whileHover={{ scale: 1.02 }}
                                      className="bg-gray-800/50 border border-amber-700/30 rounded-xl p-5 hover:border-amber-500/70 transition-all duration-300"
                                    >
                                      <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                          <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-3 rounded-lg">
                                            <Calendar className="w-6 h-6 text-white" />
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-amber-400 text-lg">
                                              {booking.room.room_type.type} • Room {booking.room.number}
                                            </h4>
                                            <p className="text-xs text-gray-500">ID #{booking.id} • {format(new Date(booking.created_at), 'dd MMM yyyy', { locale: localeId })}</p>
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <p className="text-xl font-bold text-amber-400">
                                            Rp {booking.total_price.toLocaleString('id-ID')}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {booking.total_nights} malam • <Users className="inline w-3 h-3" /> {booking.guests}
                                          </p>
                                        </div>

                                        <div>{getStatusBadge(booking.status)}</div>
                                      </div>

                                      <div className="mt-3 flex items-center gap-6 text-sm text-gray-400 border-t border-amber-800/30 pt-3">
                                        <span><strong>Check-in:</strong> {format(new Date(booking.check_in), 'dd MMM yyyy', { locale: localeId })}</span>
                                        <span><strong>Check-out:</strong> {format(new Date(booking.check_out), 'dd MMM yyyy', { locale: localeId })}</span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                              </div>

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-10">
                                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-amber-700">
                                    <ChevronLeft className="w-4 h-4" />
                                  </Button>
                                  <div className="flex gap-2">
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                      const pageNum = i + 1;
                                      return (
                                        <button
                                          key={pageNum}
                                          onClick={() => setPage(pageNum)}
                                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                            page === pageNum
                                              ? 'bg-amber-600 text-white'
                                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                          }`}
                                        >
                                          {pageNum}
                                        </button>
                                      );
                                    })}
                                    {totalPages > 7 && <span className="px-2 text-gray-500">...</span>}
                                  </div>
                                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="border-amber-700">
                                    <ChevronRight className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}

                              <p className="text-center text-gray-500 text-sm mt-6">
                                Menampilkan {((page - 1) * limit) + 1}–{Math.min(page * limit, totalBookings)} dari {totalBookings} pemesanan
                              </p>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}