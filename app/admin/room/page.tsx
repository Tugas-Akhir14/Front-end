'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";

// =====================
// AXIOS INSTANCE
// =====================
const api = axios.create({ baseURL: "http://localhost:8080" });
api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem("token");
  if (raw) {
    const token = raw.replace(/^"+|"+$/g, ""); // bersihkan kutip
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// =====================
// Types – sesuaikan dengan backend
// =====================
export type Room = {
  id: number;
  number: string; // nomor kamar
  type: "superior" | "deluxe" | "executive" | string;
  price: number; // int64
  capacity: number;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type RoomsResponse = {
  data: Room[];
  total: number;
};

const ROOM_TYPES: Array<{ label: string; value: string }> = [
  { label: "Semua Tipe", value: "" },
  { label: "Superior", value: "superior" },
  { label: "Deluxe", value: "deluxe" },
  { label: "Executive", value: "executive" },
];

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
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return "—";
  }
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4"><div className="h-3 w-12 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-3 w-28 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-3 w-24 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-3 w-20 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-3 w-32 rounded bg-zinc-200" /></td>
    </tr>
  );
}

export default function RoomPage() {
  // Query state sesuai backend: q, type, limit, offset
  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Data state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    const hasToken = !!sessionStorage.getItem("token");
    if (!hasToken) {
      setLoading(false);
      setError("Tidak ada token. Silakan login kembali.");
      return;
    }

    try {
      const res = await api.get<RoomsResponse>("/api/rooms", {
        params: { q: search || undefined, type: roomType || undefined, limit, offset },
      });
      setRooms(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch (err: any) {
      const status = err?.response?.status;
      setError(status === 401 ? "Sesi berakhir/unauthorized. Silakan login kembali." : "Gagal memuat data kamar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roomType, limit, offset]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-[var(--app-header-h)] z-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Manajemen Kamar</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/room/create"
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm shadow-black/10 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black"
              >
                + Tambah Kamar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pt-[var(--app-header-h)]">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOffset(0);
              }}
              placeholder="Cari nomor/desk…"
              className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-zinc-400"
            />
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <select
            value={roomType}
            onChange={(e) => {
              setRoomType(e.target.value);
              setOffset(0);
            }}
            className="rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {ROOM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-zinc-600">Per halaman</label>
            <select
              value={limit}
              onChange={(e) => {
                const l = Number(e.target.value) || 10;
                setLimit(l);
                setOffset(0);
              }}
              className="rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">No. Kamar</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Tipe</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Harga</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Kapasitas</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Diperbarui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200">
                        <svg className="h-5 w-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <path d="M7 8h10M7 12h6M7 16h8" />
                        </svg>
                      </div>
                      <p className="text-zinc-800 font-medium">Belum ada data kamar.</p>
                      <p className="text-zinc-500 text-sm mt-1">Mulai dengan menambahkan kamar baru.</p>
                      <div className="mt-4">
                        <Link href="/admin/room/create" className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm shadow-black/10 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black">
                          + Tambah Kamar
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/60">
                    <td className="px-4 py-3 align-top font-medium text-zinc-900">{r.number}</td>
                    <td className="px-4 py-3 align-top capitalize">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border border-zinc-200 bg-zinc-50 text-zinc-700">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-800">{rupiah(r.price)}</td>
                    <td className="px-4 py-3 align-top text-zinc-800">{r.capacity}</td>
                    <td className="px-4 py-3 align-top text-sm text-zinc-700">{formatDate(r.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 text-red-800 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="font-semibold">Terjadi kesalahan</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="text-sm text-zinc-600">
            Menampilkan <span className="font-medium text-zinc-900">{rooms.length}</span> dari {" "}
            <span className="font-medium text-zinc-900">{total}</span> kamar
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
              disabled={offset <= 0 || loading}
              className="px-3 py-2 rounded-xl border border-zinc-200 text-sm disabled:opacity-50 hover:bg-zinc-50"
            >
              ← Sebelumnya
            </button>
            <div className="text-sm text-zinc-600">
              Halaman <span className="font-semibold text-zinc-900">{page}</span> dari {" "}
              <span className="font-semibold text-zinc-900">{totalPages}</span>
            </div>
            <button
              onClick={() => setOffset((o) => o + limit)}
              disabled={offset + limit >= total || loading}
              className="px-3 py-2 rounded-xl border border-zinc-200 text-sm disabled:opacity-50 hover:bg-zinc-50"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
