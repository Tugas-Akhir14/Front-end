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
import { Hotel, Bed, Star, Calendar, DollarSign, Users, RefreshCw, Check, XCircle, Trash2 } from 'lucide-react';

// === CONFIG ===
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API = `${API_BASE}/api`;

// === TYPES (SESUAI BACKEND) ===
type Room = {
  id: number;
  number: string;
  type: string; // BISA "executive", "Superior", dll
  price: number;
  capacity: number;
  status: string; // BISA "available", "Available", dll
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
    available: 'bg-green-100 text-green-800',
    booked: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-orange-100 text-orange-800',
    cleaning: 'bg-purple-100 text-purple-800',
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[s] || 'bg-gray-100 text-gray-800';
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

      console.log('Rooms:', rawRooms);
      console.log('Bookings:', rawBookings);
      console.log('Reviews:', rawReviews);

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
      { name: 'Menunggu', value: counts.pending, color: '#facc15' },
      { name: 'Dikonfirmasi', value: counts.confirmed, color: '#22c55e' },
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
      toast({ title: 'Gagal', description: 'Gagal update status.', variant: 'destructive' });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Login sebagai admin diperlukan.</p>
            <a href="/login" className="inline-block bg-blue-600 text-white px-6мот py-3 rounded-md hover:bg-blue-700">
              Login Admin
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Hotel className="w-8 h-8 text-yellow-600" />
              Dashboard Hotel
            </h1>
            <p className="text-gray-600 mt-1">Pantau semua aktivitas hotel secara real-time</p>
          </div>
          <Button onClick={fetchAll} disabled={refreshing} size="sm" variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kamar</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">{stats.availableRooms} tersedia</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Booking Menunggu</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Perlu konfirmasi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rupiah(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Dari booking dikonfirmasi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ulasan Pending</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
              <p className="text-xs text-muted-foreground">Menunggu moderasi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating} ★</div>
              <p className="text-xs text-muted-foreground">Dari {reviews.length} ulasan</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Distribusi Tipe Kamar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={roomTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {roomTypeData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={['#3b82f6', '#10b981', '#f59e0b'][i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status Booking</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {bookingStatusData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Tren Booking 7 Hari Terakhir</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={last7DaysBookings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Rooms */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kamar</CardTitle>
                <Select value={roomFilter} onValueChange={(v) => setRoomFilter(v as any)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
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
                  <TableRow>
                    <TableHead>No. Kamar</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.slice(0, 5).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.number}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(r.status)}>{getStatusLabel(r.status, 'room')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredRooms.length > 5 && (
                <div className="px-6 py-3 text-center text-sm text-gray-500">
                  +{filteredRooms.length - 5} kamar lainnya
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pemesanan</CardTitle>
                <Select value={bookingFilter} onValueChange={(v) => setBookingFilter(v as any)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
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
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tamu</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.slice(0, 5).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono">#{b.id}</TableCell>
                      <TableCell>{b.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(b.status)}>{getStatusLabel(b.status, 'booking')}</Badge>
                      </TableCell>
                      <TableCell>
                        {b.status.toLowerCase() === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleBookingAction(b.id, 'confirm')} className="h-7 w-7 p-0">
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleBookingAction(b.id, 'cancel')} className="h-7 w-7 p-0">
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
          <Card>
            <CardHeader><CardTitle>Ulasan Pending</CardTitle></CardHeader>
            <CardContent className="p-0">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">Tidak ada ulasan menunggu</div>
              ) : (
                <div className="space-y-3 p-4">
                  {reviews.slice(0, 3).map((r) => (
                    <div key={r.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{r.guest_name || 'Tamu'}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{r.comment}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleApproveReview(r.id)} className="h-7 w-7 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(r.id)} className="h-7 w-7 p-0">
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
        <div className="text-center text-xs text-gray-500">
          Dashboard diperbarui otomatis setiap 30 detik • {format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}
        </div>
      </div>
    </div>
  );
}