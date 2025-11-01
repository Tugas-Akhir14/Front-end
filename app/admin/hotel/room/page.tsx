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
    const token = raw.replace(/^"+|"+$/g, "");
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
  number: string;
  type: "superior" | "deluxe" | "executive" | string;
  price: number;
  capacity: number;
  description?: string;
  image?: string | null;
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
      <td className="px-4 py-4">
        <div className="h-16 w-16 rounded-xl bg-zinc-200" />
      </td>
      <td className="px-4 py-4"><div className="h-3 w-12 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-3 w-28 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-3 w-24 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-3 w-20 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-3 w-32 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-8 w-28 rounded bg-zinc-200" /></td>
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

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editType, setEditType] = useState<Room["type"]>("superior");
  const [editPrice, setEditPrice] = useState<string>("0");
  const [editCapacity, setEditCapacity] = useState<string>("1");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // fallback icon kalau gambar kosong atau gagal load
  const FallbackThumb = () => (
    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
      <svg className="h-5 w-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="m8 13 2.5-2.5 4 4L21 9" />
        <circle cx="7" cy="8" r="1.5" />
      </svg>
    </div>
  );

  // Handlers: Edit & Delete
  const openEdit = (r: Room) => {
    setEditing(r);
    setEditNumber(r.number);
    setEditType(r.type as Room["type"]);
    setEditPrice(String(r.price));
    setEditCapacity(String(r.capacity));
    setEditDescription(r.description || "");
    setEditImage(null);
    setSubmitError(null);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditing(null);
    setSubmitLoading(false);
    setSubmitError(null);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Backend menerima form-data (ShouldBind), jadi kita kirim multipart.
      const fd = new FormData();
      fd.append("number", editNumber);
      fd.append("type", editType);
      fd.append("price", String(Number(editPrice) || 0));
      fd.append("capacity", String(Number(editCapacity) || 1));
      fd.append("description", editDescription || "");
      if (editImage) {
        fd.append("image", editImage);
      }

      await api.put(`/api/rooms/${editing.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchRooms();
      closeEdit();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal memperbarui kamar.";
      setSubmitError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (r: Room) => {
    const ok = window.confirm(`Hapus kamar ${r.number}? Tindakan ini tidak bisa dibatalkan.`);
    if (!ok) return;
    try {
      await api.delete(`/api/rooms/${r.id}`);
      // Jika halaman jadi kosong setelah delete, geser offset balik
      setOffset((o) => {
        const remaining = total - 1 - (o);
        const atEnd = remaining <= 0 && o > 0;
        return atEnd ? Math.max(0, o - limit) : o;
      });
      await fetchRooms();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Gagal menghapus kamar.");
    }
  };

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
                href="/admin/hotel/room/create"
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
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Gambar</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">No. Kamar</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Tipe</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Harga</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Kapasitas</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Diperbarui</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
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
                        <Link href="/admin/hotel/room/create" className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm shadow-black/10 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black">
                          + Tambah Kamar
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/60">
                    <td className="px-4 py-3 align-top">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={`Kamar ${r.number}`}
                          className="h-16 w-16 rounded-xl object-cover border border-zinc-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.appendChild(FallbackThumb().props.children as any);
                          }}
                        />
                      ) : (
                        <FallbackThumb />
                      )}
                    </td>
                    <td className="px-4 py-3 align-top font-medium text-zinc-900">{r.number}</td>
                    <td className="px-4 py-3 align-top capitalize">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border border-zinc-200 bg-zinc-50 text-zinc-700">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-800">{rupiah(r.price)}</td>
                    <td className="px-4 py-3 align-top text-zinc-800">{r.capacity}</td>
                    <td className="px-4 py-3 align-top text-sm text-zinc-700">{formatDate(r.updated_at)}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="px-3 py-1.5 rounded-xl text-sm bg-black text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/20"
                          title="Ubah"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="px-3 py-1.5 rounded-xl text-sm border border-zinc-300 hover:bg-zinc-50 focus:outline-none"
                          title="Hapus"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
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
            Menampilkan <span className="font-medium text-zinc-900">{rooms.length}</span> dari{" "}
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
              Halaman <span className="font-semibold text-zinc-900">{page}</span> dari{" "}
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

      {/* EDIT MODAL */}
      {isEditOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          {/* modal */}
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-zinc-200">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ubah Kamar #{editing.number}</h3>
              <button onClick={closeEdit} className="p-2 rounded-xl hover:bg-zinc-100">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm">{submitError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Nomor</label>
                  <input
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Tipe</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as Room["type"])}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="superior">Superior</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Harga</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Kapasitas</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-zinc-700 mb-1">Deskripsi</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-zinc-700 mb-1">Gambar (opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                  {editing.image && (
                    <div className="mt-2">
                      <img src={editing.image} alt="preview" className="h-20 w-20 rounded-xl object-cover border border-zinc-200" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                onClick={closeEdit}
                className="px-4 py-2 rounded-xl border border-zinc-300 text-sm hover:bg-zinc-50"
                disabled={submitLoading}
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitLoading}
                className="px-4 py-2 rounded-xl bg-black text-white text-sm shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {submitLoading ? "Menyimpan…" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
