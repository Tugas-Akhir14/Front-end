'use client';

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, Hotel, DollarSign, Calendar, Star, RefreshCw } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  avgRating: number;
  totalRooms: number;
  availableRooms: number;
  totalReviews: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    avgRating: 0,
    totalRooms: 0,
    availableRooms: 0,
    totalReviews: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getToken = () => {
    const raw = sessionStorage.getItem('token');
    return raw ? raw.replace(/^"+|"+$/g, '') : null;
  };

  const fetchDashboardData = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const [bookingRes, roomRes, reviewRes] = await Promise.all([
        fetch(`${API_BASE}/api/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/rooms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/reviews`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const bookings = (await bookingRes.json()).data?.data || [];
      const rooms = (await roomRes.json()).data || [];
      const reviews = (await reviewRes.json()).data || [];

      // === Hitung statistik ===
      const confirmed = bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'checked_in');
      const totalRevenue = confirmed.reduce((sum: number, b: any) => sum + b.total_price, 0);

      const availableRooms = rooms.filter((r: any) => r.status === 'available').length;
      const occupancyRate = rooms.length > 0 ? ((rooms.length - availableRooms) / rooms.length) * 100 : 0;

      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      // === Data bulanan (6 bulan terakhir) ===
      const monthly: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const monthBookings = bookings.filter((b: any) => {
          const checkIn = new Date(b.check_in);
          return checkIn >= monthStart && checkIn <= monthEnd && (b.status === 'confirmed' || b.status === 'checked_in');
        });
        monthly.push({
          month: format(date, 'MMM yyyy'),
          revenue: monthBookings.reduce((s: number, b: any) => s + b.total_price, 0),
          bookings: monthBookings.length,
        });
      }

      setMonthlyData(monthly);

      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
        confirmedBookings: confirmed.length,
        cancelledBookings: bookings.filter((b: any) => b.status === 'cancelled').length,
        totalRevenue,
        occupancyRate: Number(occupancyRate.toFixed(1)),
        avgRating: Number(avgRating),
        totalRooms: rooms.length,
        availableRooms,
        totalReviews: reviews.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const pieData = [
    { name: 'Tersedia', value: stats.availableRooms, color: '#10b981' },
    { name: 'Dipesan', value: stats.totalRooms - stats.availableRooms, color: '#3b82f6' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-lg font-medium text-gray-700">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Hotel className="w-10 h-10 text-amber-600" />
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-1">Ringkasan performa hotel secara real-time</p>
            </div>
            <Button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-yellow-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Total Pendapatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-700">
                  {stats.totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  dari booking terkonfirmasi
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Total Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-700">{stats.totalBookings}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-amber-800">{stats.pendingBookings} pending</Badge>
                  <Badge className="bg-emerald-100 text-emerald-800">{stats.confirmedBookings} confirmed</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-blue-600" />
                  Tingkat Okupansi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-700">{stats.occupancyRate}%</p>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.availableRooms} dari {stats.totalRooms} kamar tersedia
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Rating Tamu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
                  {stats.avgRating} <span className="text-4xl">★</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">berdasarkan {stats.totalReviews} ulasan</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pendapatan Bulanan */}
            <Card className="shadow-xl border-yellow-200">
              <CardHeader>
                <CardTitle>Pendapatan 6 Bulan Terakhir</CardTitle>
                <CardDescription>Grafik pendapatan dari booking terkonfirmasi</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `Rp${(v / 1e6).toFixed(0)}jt`} />
                    <Tooltip formatter={(v: number) => v.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })} />
                    <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Kamar */}
            <Card className="shadow-xl border-yellow-200">
              <CardHeader>
                <CardTitle>Distribusi Status Kamar</CardTitle>
                <CardDescription>{stats.totalRooms} total kamar</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: d.color }} />
                      <span className="text-sm font-medium">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild className="h-24 flex flex-col gap-2 bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold shadow-lg">
              <a href="/admin/hotel/booking">
                <Calendar className="w-8 h-8" />
                Kelola Booking
              </a>
            </Button>
            <Button asChild className="h-24 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold shadow-lg">
              <a href="/admin/hotel/room">
                <Hotel className="w-8 h-8" />
                Manajemen Kamar
              </a>
            </Button>
            <Button asChild className="h-24 flex flex-col gap-2 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg">
              <a href="/admin/hotel/review">
                <Star className="w-8 h-8" />
                Lihat Ulasan
              </a>
            </Button>
            <Button asChild className="h-24 flex flex-col gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg">
              <a href="/admin/hotel/type">
                <Users className="w-8 h-8" />
                Tipe Kamar
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}