'use client';
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// =====================
// AXIOS INSTANCE (sama untuk room & gallery)
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

export type RoomsResponse = { data: Room[]; total: number };
export type GalleriesResponse = { data: Gallery[]; total: number };

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

// Skeleton Components
function StatCardSkeleton() {
  return <div className="h-24 w-full rounded-2xl bg-zinc-100 animate-pulse" />;
}
function TableSkeleton() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3"><div className="h-10 w-10 rounded-lg bg-zinc-200" /></td>
      <td className="px-4 py-3"><div className="h-3 w-24 rounded bg-zinc-200" /></td>
      <td className="px-4 py-3"><div className="h-3 w-32 rounded bg-zinc-200" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-zinc-200" /></td>
    </tr>
  ));
}

const COLORS = {
  superior: "#3b82f6",
  deluxe: "#10b981",
  executive: "#f59e0b"
};

export default function DashboardPage() {
  // Room State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  // Gallery State
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [totalGalleries, setTotalGalleries] = useState(0);
  // Shared
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await api.get<RoomsResponse>("/api/rooms", { params: { limit: 1000 } });
      setRooms(res.data.data || []);
      setTotalRooms(res.data.total ?? 0);
    } catch (err: any) {
      console.error("Room fetch error:", err);
    }
  };

  // Fetch Galleries
  const fetchGalleries = async () => {
    try {
      const res = await api.get<GalleriesResponse>("/api/galleries", { params: { limit: 1000 } });
      setGalleries(res.data.data || []);
      setTotalGalleries(res.data.total ?? 0);
    } catch (err: any) {
      console.error("Gallery fetch error:", err);
    }
  };

  // Initial Load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const hasToken = !!sessionStorage.getItem("token");
      if (!hasToken) {
        setError("Tidak ada token. Silakan login kembali.");
        setLoading(false);
        return;
      }
      await Promise.all([fetchRooms(), fetchGalleries()]);
      setLoading(false);
    };
    load();
  }, []);

  // =====================
  // Room Stats
  // =====================
  const roomStats = useMemo(() => {
    const typeCount = rooms.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPrice = rooms.reduce((sum, r) => sum + r.price, 0);
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);

    return {
      totalRooms: rooms.length,
      avgPrice: rooms.length ? Math.round(totalPrice / rooms.length) : 0,
      avgCapacity: rooms.length ? Number((totalCapacity / rooms.length).toFixed(1)) : 0,
      typeCount
    };
  }, [rooms]);

  const pieData = Object.entries(roomStats.typeCount).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    fill: COLORS[type as keyof typeof COLORS] || "#94a3b8"
  }));

  const recentRooms = rooms
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // =====================
  // Gallery Stats
  // =====================
  const recentGalleries = galleries
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
  

      {/* Content */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">Terjadi kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid – Kamar + Galeri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Total Kamar</p>
                    <p className="text-2xl font-bold text-zinc-900">{roomStats.totalRooms}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M7 8h10M7 12h6M7 16h8" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Harga Rata-rata</p>
                    <p className="text-2xl font-bold text-zinc-900">{rupiah(roomStats.avgPrice)}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Kapasitas Rata-rata</p>
                    <p className="text-2xl font-bold text-zinc-900">{roomStats.avgCapacity} org</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <svg className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Total Foto Galeri</p>
                    <p className="text-2xl font-bold text-zinc-900">{totalGalleries}</p>
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
            </>
          )}
        </div>

        {/* Chart + Recent Rooms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pie Chart – Tipe Kamar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Distribusi Tipe Kamar</h3>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-zinc-100 animate-pulse" />
                </div>
              ) : pieData.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">Belum ada data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} kamar`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Rooms */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-zinc-200 px-5 py-3 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Kamar Terbaru</h3>
                <Link href="/admin/room" className="text-sm text-black hover:underline">Lihat semua</Link>
              </div>
              <table className="min-w-full">
                <thead className="bg-zinc-50/80">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">Gambar</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">No.</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">Tipe</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">Harga</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <TableSkeleton />
                  ) : recentRooms.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Belum ada kamar</td></tr>
                  ) : (
                    recentRooms.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50">
                        <td className="px-4 py-2">
                          {r.image ? (
                            <img src={r.image} alt="" className="h-10 w-10 rounded-lg object-cover border border-zinc-200" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
                              <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="14" rx="2" />
                                <path d="m8 13 2.5-2.5 4 4L21 9" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">{r.number}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border border-zinc-200 bg-zinc-50 text-zinc-700 capitalize">
                            {r.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{rupiah(r.price)}</td>
                        <td className="px-4 py-2 text-xs text-zinc-600">{formatDate(r.updated_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Galleries – BARU */}
        <div className="mb-8">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Foto Galeri Terbaru</h3>
              <Link href="/admin/gallery" className="text-sm text-black hover:underline">Lihat semua</Link>
            </div>
            <table className="min-w-full">
              <thead className="bg-zinc-50/80">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">Cover</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">Judul</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-zinc-600">Diperbarui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-14 w-20 rounded-lg bg-zinc-200" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-32 rounded bg-zinc-200" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-zinc-200" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-24 rounded bg-zinc-200" /></td>
                    </tr>
                  ))
                ) : recentGalleries.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Belum ada foto galeri</td></tr>
                ) : (
                  recentGalleries.map((g) => (
                    <tr key={g.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="h-14 w-20 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                          <img
                            src={fileURL(g.url)}
                            alt={g.title}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{g.title || "Tanpa Judul"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-800">
                          Published
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(g.updated_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}