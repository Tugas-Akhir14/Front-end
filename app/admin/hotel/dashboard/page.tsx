'use client';
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// =====================
// AXIOS INSTANCE
// =====================
const api = axios.create({ baseURL: "http://localhost:8080" });
api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem("token");
  if (raw) {
    const token = raw.replace(/^"+|"+$/g, "");
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// =====================
// Types
// =====================
export type Room = {
  id: number;
  number: string;
  type: "superior" | "deluxe" | "executive" | string;
  price: number;
  capacity: number;
  description?: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
};

export type Gallery = {
  id: number;
  title: string;
  caption: string;
  url: string;
  created_at: string;
  updated_at: string;
};

export type News = {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url?: string | null;
  status: "draft" | "published" | string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};

export type RoomsResponse = { data: Room[]; total: number };
export type GalleriesResponse = { data: Gallery[]; total: number };
export type NewsResponse = { data: News[]; total: number };
export type BookingsResponse = { data: Booking[]; total: number };

// =====================
// Helper Functions
// =====================
function rupiah(n: number) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `Rp ${n}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
  } catch {
    return "—";
  }
}

function fileURL(path: string | null | undefined) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${api.defaults.baseURL}${p}`;
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border";
  const styles =
    status === "published"
      ? "bg-green-100 text-green-800 border-green-200"
      : status === "draft"
      ? "bg-gray-100 text-gray-700 border-gray-200"
      : "bg-zinc-100 text-zinc-700 border-zinc-200";
  return <span className={`${base} ${styles}`}>{status}</span>;
}

// Skeleton
function StatCardSkeleton() {
  return <div className="h-24 w-full rounded-2xl bg-zinc-100 animate-pulse" />;
}
function ChartSkeleton() {
  return <div className="h-64 w-full rounded-2xl bg-zinc-100 animate-pulse" />;
}

// Colors
const ROOM_COLORS = { superior: "#3b82f6", deluxe: "#10b981", executive: "#f59e0b" };
const NEWS_STATUS_COLORS = { published: "#10b981", draft: "#94a3b8" };
const BAR_COLORS = { room: "#3b82f6", gallery: "#8b5cf6", news: "#f59e0b" };

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]); // BARU
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch All Data
  const fetchAll = async () => {
    try {
      const [roomsRes, galleriesRes, newsRes, bookingsRes] = await Promise.all([
        api.get<RoomsResponse>("/api/rooms", { params: { limit: 1000 } }),
        api.get<GalleriesResponse>("/api/galleries", { params: { limit: 1000 } }),
        api.get<NewsResponse>("/api/news", { params: { limit: 1000 } }),
        api.get<BookingsResponse>("/api/bookings", { params: { limit: 1000 } }) // BARU
      ]);
      setRooms(roomsRes.data.data || []);
      setGalleries(galleriesRes.data.data || []);
      setNews(newsRes.data.data || []);
      setBookings(bookingsRes.data.data || []); // BARU
    } catch (err: any) {
      setError("Gagal memuat data. Silakan coba lagi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Tidak ada token. Silakan login kembali.");
      setLoading(false);
      return;
    }
    fetchAll();
  }, []);

  // =====================
  // Stats: Room
  // =====================
  const roomStats = useMemo(() => {
    const typeCount = rooms.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPrice = rooms.reduce((sum, r) => sum + r.price, 0);
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);

    return {
      total: rooms.length,
      avgPrice: rooms.length ? Math.round(totalPrice / rooms.length) : 0,
      avgCapacity: rooms.length ? Number((totalCapacity / rooms.length).toFixed(1)) : 0,
      typeCount
    };
  }, [rooms]);

  const roomPieData = Object.entries(roomStats.typeCount).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    fill: ROOM_COLORS[type as keyof typeof ROOM_COLORS] || "#94a3b8"
  }));

  // =====================
  // Stats: News
  // =====================
  const newsStats = useMemo(() => {
    const statusCount = news.reduce((acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: news.length,
      published: statusCount["published"] || 0,
      draft: statusCount["draft"] || 0
    };
  }, [news]);

  const newsStatusData = [
    { name: "Published", value: newsStats.published, fill: NEWS_STATUS_COLORS.published },
    { name: "Draft", value: newsStats.draft, fill: NEWS_STATUS_COLORS.draft }
  ];

  // =====================
  // BARU: Booking Stats (Bulan Ini)
  // =====================
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const bookingStats = useMemo(() => {
    const thisMonthBookings = bookings.filter(b => {
      const date = new Date(b.check_in);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const confirmed = thisMonthBookings.filter(b => b.status === "confirmed");

    const totalGuests = confirmed.reduce((sum, b) => sum + b.guests, 0);
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.total_price, 0);
    const confirmedCount = confirmed.length;

    // Hitung tingkat hunian: kamar yang terbooking / total kamar
    const occupiedRooms = new Set(confirmed.map(b => b.room_id)).size; // asumsi room_id ada
    const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;

    return {
      occupancyRate: Number(occupancyRate.toFixed(1)),
      totalGuests,
      avgGuestsPerBooking: confirmedCount > 0 ? Number((totalGuests / confirmedCount).toFixed(1)) : 0,
      totalRevenue,
      confirmedCount
    };
  }, [bookings, rooms, currentMonth, currentYear]);

  // =====================
  // Monthly Activity (Last 6 Months)
  // =====================
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        name: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d),
        room: 0,
        gallery: 0,
        news: 0
      };
    }).reverse();

    const countByMonth = (items: any[], key: string) => {
      items.forEach(item => {
        const date = new Date(item.created_at);
        const monthKey = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date);
        const month = months.find(m => m.name === monthKey);
        if (month) month[key]++;
      });
    };

    countByMonth(rooms, "room");
    countByMonth(galleries, "gallery");
    countByMonth(news, "news");

    return months;
  }, [rooms, galleries, news]);

  // Recent Items
  const recent = <T extends { updated_at: string }>(items: T[], n = 5) =>
    [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, n);

  const recentRooms = recent(rooms);
  const recentGalleries = recent(galleries);
  const recentNews = recent(news);

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900">
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Laporan Dashboard</h1>
          <p className="text-zinc-600 mt-1">Ringkasan performa sistem: kamar, galeri, berita, dan <strong>booking</strong></p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">Terjadi kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              {/* BARU: 4 Kartu Booking */}
              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Tingkat Hunian</p>
                    <p className="text-2xl font-bold text-zinc-900">{bookingStats.occupancyRate}%</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 7h18M3 12h18M3 17h18" />
                      <path d="M8 7v10M12 7v10M16 7v10" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Tamu Bulan Ini</p>
                    <p className="text-2xl font-bold text-zinc-900">{bookingStats.totalGuests}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
                    <svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Rata-rata Tamu</p>
                    <p className="text-2xl font-bold text-zinc-900">{bookingStats.avgGuestsPerBooking} org</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                    <svg className="h-5 w-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Pendapatan Bulan Ini</p>
                    <p className="text-2xl font-bold text-green-600">{rupiah(bookingStats.totalRevenue)}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                      <path d="M12 14c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                      <path d="M12 20c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* KARTU LAMA */}
              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Total Kamar</p>
                    <p className="text-2xl font-bold text-zinc-900">{roomStats.total}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M7 8h10M7 12h6M7 16h8" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Harga Rata-rata</p>
                    <p className="text-2xl font-bold text-zinc-900">{rupiah(roomStats.avgPrice)}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Kapasitas Rata</p>
                    <p className="text-2xl font-bold text-zinc-900">{roomStats.avgCapacity} org</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <svg className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Total Galeri</p>
                    <p className="text-2xl font-bold text-zinc-900">{galleries.length}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                    <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Total Berita</p>
                    <p className="text-2xl font-bold text-zinc-900">{newsStats.total}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Published / Draft</p>
                    <p className="text-2xl font-bold text-zinc-900">
                      {newsStats.published} / {newsStats.draft}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Room Type Distribution */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Distribusi Tipe Kamar</h3>
            {loading ? <ChartSkeleton /> : roomPieData.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={roomPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {roomPieData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} kamar`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* News Status */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Status Berita</h3>
            {loading ? <ChartSkeleton /> : newsStats.total === 0 ? (
              <p className="text-center text-zinc-500 py-8">Belum ada berita</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={newsStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {newsStatusData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} artikel`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Activity */}
          <div className="xl:col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Aktivitas Bulanan (6 Bulan)</h3>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="room" fill={BAR_COLORS.room} name="Kamar" />
                  <Bar dataKey="gallery" fill={BAR_COLORS.gallery} name="Galeri" />
                  <Bar dataKey="news" fill={BAR_COLORS.news} name="Berita" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Rooms */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Kamar Terbaru</h3>
              <Link href="/admin/hotel/room" className="text-sm text-black hover:underline">Lihat semua</Link>
            </div>
            <table className="min-w-full">
              <tbody className="divide-y divide-zinc-100">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={4} className="px-4 py-3"><div className="h-3 w-full bg-zinc-200 rounded" /></td></tr>
                )) : recentRooms.length === 0 ? (
                  <tr><td className="px-6 py-8 text-center text-zinc-500">Belum ada kamar</td></tr>
                ) : recentRooms.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-2 w-12">
                      {r.image ? <img src={r.image} alt="" className="h-10 w-10 rounded-lg object-cover border" /> : <div className="h-10 w-10 bg-zinc-100 rounded-lg border" />}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">{r.number}</td>
                    <td className="px-4 py-2"><StatusBadge status={r.type} /></td>
                    <td className="px-4 py-2 text-xs text-zinc-600">{formatDate(r.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Galleries */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Galeri Terbaru</h3>
              <Link href="/admin/gallery" className="text-sm text-black hover:underline">Lihat semua</Link>
            </div>
            <table className="min-w-full">
              <tbody className="divide-y divide-zinc-100">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={3} className="px-4 py-3"><div className="h-3 w-full bg-zinc-200 rounded" /></td></tr>
                )) : recentGalleries.length === 0 ? (
                  <tr><td className="px-6 py-8 text-center text-zinc-500">Belum ada foto</td></tr>
                ) : recentGalleries.map(g => (
                  <tr key={g.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-2 w-12">
                      <div className="h-10 w-10 rounded-lg border overflow-hidden">
                        <img src={fileURL(g.url)} alt="" className="h-full w-full object-cover" onError={e => (e.currentTarget.src = "/placeholder.svg")} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium line-clamp-1">{g.title || "Tanpa Judul"}</td>
                    <td className="px-4 py-2 text-xs text-zinc-600">{formatDate(g.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent News */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Berita Terbaru</h3>
              <Link href="/admin/news" className="text-sm text-black hover:underline">Lihat semua</Link>
            </div>
            <table className="min-w-full">
              <tbody className="divide-y divide-zinc-100">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={3} className="px-4 py-3"><div className="h-3 w-full bg-zinc-200 rounded" /></td></tr>
                )) : recentNews.length === 0 ? (
                  <tr><td className="px-6 py-8 text-center text-zinc-500">Belum ada berita</td></tr>
                ) : recentNews.map(n => (
                  <tr key={n.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-2 w-12">
                      <div className="h-10 w-10 rounded-lg border overflow-hidden">
                        <img src={fileURL(n.image_url)} alt="" className="h-full w-full object-cover" onError={e => (e.currentTarget.src = "/placeholder.svg")} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium line-clamp-1">{n.title}</td>
                    <td className="px-4 py-2"><StatusBadge status={n.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}