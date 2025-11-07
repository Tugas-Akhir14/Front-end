'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Hotel, Bed, Star, Calendar, DollarSign, Users, RefreshCw, Check, XCircle, Trash2, Sun, Moon, Crown, Sparkles, TrendingUp } from 'lucide-react';
import Image from 'next/image';

// === CONFIG ===
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API = `${API_BASE}/api`;

// === TYPES (SESUAI BACKEND) ===
type Room = {
  id: number;
  number: string;
  type: string;
  price: number;
  capacity: number;
  status: string;
  description?: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
};

type Booking = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  room: { number: string; type: string };
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  guest_name: string | null;
  status?: string;
  created_at: string;
};

// === UTILS ===
const getToken = (): string | null => {
  const raw = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  return raw ? raw.replace(/^"+|"+$/g, '') : null;
};

const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    available: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    booked: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    maintenance: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 dark:from-orange-900/30 dark:to-amber-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    cleaning: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    confirmed: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    cancelled: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
  };
  return map[s] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 dark:from-gray-900/30 dark:to-slate-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800';
};

const getStatusLabel = (status: string, type: 'room' | 'booking') => {
  const s = status.toLowerCase();
  const roomMap: Record<string, string> = {
    available: 'Tersedia',
    booked: 'Dipesan',
    maintenance: 'Maintenance',
    cleaning: 'Dibersihkan'
  };
  const bookingMap: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    cancelled: 'Dibatalkan'
  };
  return type === 'room' ? roomMap[s] || status : bookingMap[s] || status;
};

// === API CALLS ===
const api = {
  rooms: async (token: string) => {
    const res = await fetch(`${API}/rooms?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gagal memuat kamar');
    const json = await res.json();
    return json.data || [];
  },
  bookings: async (token: string) => {
    const res = await fetch(`${API}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gagal memuat booking');
    const json = await res.json();
    return json.data || [];
  },
  reviews: async (token: string) => {
    const res = await fetch(`${API}/reviews/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gagal memuat ulasan');
    return (await res.json()) || [];
  },
  approveReview: async (id: number, token: string) => {
    const res = await fetch(`${API}/reviews/${id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gagal menyetujui');
  },
  deleteReview: async (id: number, token: string) => {
    const res = await fetch(`${API}/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gagal menghapus');
  },
  updateBooking: async (id: number, action: 'confirm' | 'cancel', token: string) => {
    const res = await fetch(`${API}/bookings/${id}/${action}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gagal update status');
  },
};

// === MAIN DASHBOARD ===
export default function AdminHotelDashboard() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [roomFilter, setRoomFilter] = useState<'all' | 'available' | 'booked'>('all');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // === DARK MODE STATE (SYNC DENGAN LAYOUT) ===
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Load token
  useEffect(() => {
    const t = getToken();
    setToken(t);
    if (!t) {
      toast({ title: 'Login Diperlukan', description: 'Silakan login sebagai admin.', variant: 'destructive' });
    }
  }, [toast]);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const [rawRooms, rawBookings, rawReviews] = await Promise.all([
        api.rooms(token),
        api.bookings(token),
        api.reviews(token),
      ]);

      const mappedBookings: Booking[] = (rawBookings || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        email: b.email,
        room: {
          number: b.room?.number || '—',
          type: b.room?.type || 'unknown'
        },
        check_in: b.check_in,
        check_out: b.check_out,
        guests: b.guests,
        total_price: b.total_price || 0,
        status: b.status || 'unknown',
        created_at: b.created_at,
      }));

      setRooms(rawRooms || []);
      setBookings(mappedBookings);
      setReviews(rawReviews || []);
    } catch (err: any) {
      toast({ title: 'Gagal Memuat', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) {
      fetchAll();
      const interval = setInterval(fetchAll, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchAll]);

  // === STATISTICS ===
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status.toLowerCase() === 'available').length;
    const pendingBookings = bookings.filter(b => b.status.toLowerCase() === 'pending').length;
    const totalRevenue = bookings
      .filter(b => b.status.toLowerCase() === 'confirmed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0';

    return {
      totalRooms,
      availableRooms,
      pendingBookings,
      totalRevenue,
      avgRating: parseFloat(avgRating)
    };
  }, [rooms, bookings, reviews]);

  // === CHARTS DATA ===
  const roomTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    rooms.forEach(r => {
      const key = r.type.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value
    }));
  }, [rooms]);

  const bookingStatusData = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, confirmed: 0, cancelled: 0 };
    bookings.forEach(b => {
      const key = b.status.toLowerCase();
      if (key in counts) counts[key]++;
    });
    return [
      { name: 'Menunggu', value: counts.pending, color: '#f59e0b' },
      { name: 'Dikonfirmasi', value: counts.confirmed, color: '#10b981' },
      { name: 'Dibatalkan', value: counts.cancelled, color: '#ef4444' },
    ];
  }, [bookings]);

  const last7DaysBookings = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const count = bookings.filter(b => {
        const created = new Date(b.created_at);
        return startOfDay(created).getTime() === date.getTime();
      }).length;
      return { date: format(date, 'dd MMM', { locale: id }), count };
    });
  }, [bookings]);

  // === HANDLERS ===
  const handleApproveReview = async (id: number) => {
    if (!token) return;
    try {
      await api.approveReview(id, token);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Disetujui', description: 'Ulasan telah disetujui.' });
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menyetujui ulasan.', variant: 'destructive' });
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!token || !confirm('Hapus ulasan ini?')) return;
    try {
      await api.deleteReview(id, token);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Dihapus', description: 'Ulasan telah dihapus.' });
    } catch {
      toast({ title: 'Gagal', description: 'Gagal menghapus ulasan.', variant: 'destructive' });
    }
  };

  const handleBookingAction = async (id: number, action: 'confirm' | 'cancel') => {
    if (!token) return;
    try {
      await api.updateBooking(id, action, token);
      await fetchAll();
      toast({
        title: action === 'confirm' ? 'Dikonfirmasi' : 'Dibatalkan',
        description: `Booking #${id} berhasil.`
      });
    } catch {
      toast({ title: 'Gagal', description: 'Gagal update status.', variant: 'destructive' });
    }
  };

  // === FILTERED DATA ===
  const filteredRooms = roomFilter === 'all'
    ? rooms
    : rooms.filter(r => r.status.toLowerCase() === roomFilter);

  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status.toLowerCase() === bookingFilter);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/50 shadow-2xl">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl mb-4 shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <p className="text-red-600 dark:text-red-400 mb-4 font-medium">Login sebagai admin diperlukan.</p>
            <a href="/login" className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-yellow-600 font-semibold shadow-lg transition-all">
              Login Admin
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl mb-4 shadow-xl">
            <RefreshCw className="w-10 h-10 animate-spin text-white" />
          </div>
          <p className="text-amber-700 dark:text-amber-300 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl grid place-items-center shadow-lg">
                            
                                      <Image
                                        src="/logo.png"
                                        alt="Logo"
                                        width={64}
                                        height={64}
                                        className="object-contain"
                                        priority
                                      />
                                    
                        </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Dashboard Hotel
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pantau semua aktivitas hotel secara real-time
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-2 border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 hover:shadow-md"
              onClick={() => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
              }}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-amber-600" />}
            </Button>
            <Button 
              onClick={fetchAll} 
              disabled={refreshing} 
              size="sm" 
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-800 dark:to-amber-900/10 border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Kamar</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 grid place-items-center shadow-md">
                <Bed className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                {stats.availableRooms} tersedia
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-800 dark:to-yellow-900/10 border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Booking Menunggu</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 grid place-items-center shadow-md">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Perlu konfirmasi
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/10 border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Pendapatan</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 grid place-items-center shadow-md">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{rupiah(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                Booking dikonfirmasi
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-900/10 border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Ulasan Pending</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 grid place-items-center shadow-md">
                <Star className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{reviews.length}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-orange-600" />
                Menunggu moderasi
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/10 border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Rating Rata-rata</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 grid place-items-center shadow-md">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.avgRating} ★</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                Dari {reviews.length} ulasan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Distribusi Tipe Kamar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={roomTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {roomTypeData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: '2px solid #fbbf24', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Status Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {bookingStatusData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: '2px solid #fbbf24', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Tren Booking 7 Hari Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={last7DaysBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                  <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#6b7280'} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: '2px solid #fbbf24', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Rooms */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Bed className="w-5 h-5 text-amber-500" />
                  Kamar
                </CardTitle>
                <Select value={roomFilter} onValueChange={(v) => setRoomFilter(v as any)}>
                  <SelectTrigger className="w-32 border-2 border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-amber-200/50 dark:border-amber-700/50">
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="available">Tersedia</SelectItem>
                    <SelectItem value="booked">Dipesan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-200/50 dark:border-amber-700/30">
                    <TableHead className="text-amber-700 dark:text-amber-300 font-bold">No. Kamar</TableHead>
                    <TableHead className="text-amber-700 dark:text-amber-300 font-bold">Tipe</TableHead>
                    <TableHead className="text-amber-700 dark:text-amber-300 font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.slice(0, 5).map((r) => (
                    <TableRow key={r.id} className="border-b border-amber-100/50 dark:border-amber-800/20 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors">
                      <TableCell className="font-bold text-gray-900 dark:text-white">{r.number}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{r.type}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(r.status)} font-semibold shadow-sm`}>
                          {getStatusLabel(r.status, 'room')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredRooms.length > 5 && (
                <div className="px-6 py-3 text-center text-sm text-amber-600 dark:text-amber-400 font-medium border-t border-amber-200/50 dark:border-amber-700/30">
                  +{filteredRooms.length - 5} kamar lainnya
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Pemesanan
                </CardTitle>
                <Select value={bookingFilter} onValueChange={(v) => setBookingFilter(v as any)}>
                  <SelectTrigger className="w-32 border-2 border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-amber-200/50 dark:border-amber-700/50">
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-200/50 dark:border-amber-700/30">
                    <TableHead className="text-amber-700 dark:text-amber-300 font-bold">ID</TableHead>
                    <TableHead className="text-amber-700 dark:text-amber-300 font-bold">Tamu</TableHead>
                    <TableHead className="text-amber-700 dark:text-amber-300 font-bold">Status</TableHead>
                    <TableHead className="text-amber-700 dark:text-amber-300 font-bold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.slice(0, 5).map((b) => (
                    <TableRow key={b.id} className="border-b border-amber-100/50 dark:border-amber-800/20 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors">
                      <TableCell className="font-mono font-bold text-amber-700 dark:text-amber-300">#{b.id}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white font-medium">{b.name}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(b.status)} font-semibold shadow-sm`}>
                          {getStatusLabel(b.status, 'booking')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {b.status.toLowerCase() === 'pending' && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              onClick={() => handleBookingAction(b.id, 'confirm')} 
                              className="h-7 w-7 p-0 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleBookingAction(b.id, 'cancel')} 
                              className="h-7 w-7 p-0 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Ulasan Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm flex flex-col items-center gap-2">
                  <Sparkles className="w-8 h-8 text-amber-400 opacity-50" />
                  Tidak ada ulasan menunggu
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {reviews.slice(0, 3).map((r) => (
                    <div key={r.id} className="border-b border-amber-200/50 dark:border-amber-700/30 pb-3 last:border-0 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 p-3 rounded-lg transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-gray-900 dark:text-white flex items-center gap-2">
                            {r.guest_name || 'Tamu'}
                            <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 text-[10px] border border-amber-200 dark:border-amber-700">
                              NEW
                            </Badge>
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{r.comment}</p>
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveReview(r.id)} 
                            className="h-7 w-7 p-0 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteReview(r.id)} 
                            className="h-7 w-7 p-0 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-4 border-2 border-amber-200/50 dark:border-amber-700/30 shadow-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Dashboard diperbarui otomatis setiap 30 detik</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-medium text-amber-700 dark:text-amber-300">
              {format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </p>
        </div>
      </div>
    </div>
  );
}