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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =====================
// Types – SESUAI DENGAN BACKEND
// =====================
export type Room = {
  id: number;
  number: string;
  type: "superior" | "deluxe" | "executive";
  price: number;
  capacity: number;
  description?: string;
  image?: string | null;
  status: "available" | "booked" | "maintenance" | "cleaning";
  created_at: string;
  updated_at: string;
};

export type RoomsResponse = {
  data: Room[];
  total: number;
};

// STATUS OPTIONS
const ROOM_STATUSES = [
  { label: "Semua Status", value: "" },
  { label: "Tersedia", value: "available", color: "bg-green-100 text-green-800" },
  { label: "Dipesan", value: "booked", color: "bg-blue-100 text-blue-800" },
  { label: "Maintenance", value: "maintenance", color: "bg-orange-100 text-orange-800" },
  { label: "Sedang Dibersihkan", value: "cleaning", color: "bg-purple-100 text-purple-800" },
];

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
      <td className="px-4 py-4"><div className="h-3 w-20 rounded bg-zinc-200" /></td>
      <td className="px-4 py-4"><div className="h-8 w-28 rounded bg-zinc-200" /></td>
    </tr>
  );
}

export default function RoomPage() {
  // Query state
  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomStatus, setRoomStatus] = useState("");
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
  const [editPrice, setEditPrice] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Room["status"]>("available");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Sesi berakhir. Silakan login kembali.");
      return;
    }

    try {
      const res = await api.get<RoomsResponse>("/api/rooms", {
        params: {
          q: search || undefined,
          type: roomType || undefined,
          status: roomStatus || undefined,
          limit,
          offset,
        },
      });
      setRooms(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesi berakhir. Silakan login kembali.");
      } else if (status === 403) {
        setError("Akses ditolak. Anda tidak memiliki izin.");
      } else {
        setError("Gagal memuat data kamar.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search, roomType, roomStatus, limit, offset]);

  // Fallback gambar
  const FallbackThumb = () => (
    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
      <svg className="h-5 w-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="m8 13 2.5-2.5 4 4L21 9" />
        <circle cx="7" cy="8" r="1.5" />
      </svg>
    </div>
  );

  // Badge status
  const getStatusBadge = (status: string) => {
    const s = ROOM_STATUSES.find(s => s.value === status);
    if (!s || !s.value) return <span className="text-xs text-zinc-500">{status}</span>;
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.color}`}>{s.label}</span>;
  };

  // Handlers
  const openEdit = (r: Room) => {
    setEditing(r);
    setEditNumber(r.number);
    setEditType(r.type);
    setEditPrice(String(r.price));
    setEditCapacity(String(r.capacity));
    setEditDescription(r.description || "");
    setEditStatus(r.status);
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

    // Validasi dasar
    if (!editNumber.trim()) {
      setSubmitError("Nomor kamar wajib diisi.");
      return;
    }
    if (Number(editPrice) <= 0) {
      setSubmitError("Harga harus lebih dari 0.");
      return;
    }
    if (Number(editCapacity) < 1) {
      setSubmitError("Kapasitas minimal 1.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("number", editNumber.trim());
      formData.append("type", editType);
      formData.append("price", String(Math.round(Number(editPrice))));
      formData.append("capacity", String(Math.round(Number(editCapacity))));
      formData.append("description", editDescription.trim());
      formData.append("status", editStatus);
      if (editImage) {
        formData.append("image", editImage);
      }

      await api.put(`/api/rooms/${editing.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchRooms();
      closeEdit();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal memperbarui kamar. Pastikan data valid.";
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
      const newTotal = total - 1;
      setTotal(newTotal);

      if (rooms.length === 1 && offset > 0) {
        setOffset(Math.max(0, offset - limit));
      } else {
        await fetchRooms();
      }
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
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select
            value={roomStatus}
            onChange={(e) => {
              setRoomStatus(e.target.value);
              setOffset(0);
            }}
            className="rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {ROOM_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
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
                <option key={n} value={n}>{n}</option>
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
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Diperbarui</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200">
                      <svg className="h-5 w-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 8h10M7 12h6M7 16h8" />
                      </svg>
                    </div>
                    <p className="text-zinc-800 font-medium">Belum ada data kamar.</p>
                    <p className="text-zinc-500 text-sm mt-1">Mulai dengan menambahkan kamar baru.</p>
                    <div className="mt-4">
                      <Link href="/admin/hotel/room/create" className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm shadow-black/10 hover:opacity-90">
                        + Tambah Kamar
                      </Link>
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
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const fallback = FallbackThumb();
                            img.parentElement?.appendChild(React.createElement(fallback.type, fallback.props));
                          }}
                        />
                      ) : (
                        <FallbackThumb />
                      )}
                    </td>
                    <td className="px-4 py-3 align-top font-medium text-zinc-900">{r.number}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border border-zinc-200 bg-zinc-50 text-zinc-700 capitalize">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-800">{rupiah(r.price)}</td>
                    <td className="px-4 py-3 align-top text-zinc-800">{r.capacity}</td>
                    <td className="px-4 py-3 align-top">{getStatusBadge(r.status)}</td>
                    <td className="px-4 py-3 align-top text-sm text-zinc-700">{formatDate(r.updated_at)}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="px-3 py-1.5 rounded-xl text-sm bg-black text-white shadow-sm hover:opacity-90"
                          title="Ubah"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="px-3 py-1.5 rounded-xl text-sm border border-zinc-300 hover:bg-zinc-50"
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
              onClick={() => setOffset(Math.max(0, offset - limit))}
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
              onClick={() => setOffset(offset + limit)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-zinc-200">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ubah Kamar #{editing.number}</h3>
              <button onClick={closeEdit} className="p-2 rounded-xl hover:bg-zinc-100">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm">{submitError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Nomor Kamar</label>
                  <input
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="101"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Tipe Kamar</label>
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
                  <label className="block text-sm text-zinc-700 mb-1">Harga per Malam</label>
                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Kapasitas (orang)</label>
                  <input
                    type="number"
                    min="1"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Room["status"])}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="available">Tersedia</option>
                    <option value="booked">Dipesan</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Sedang Dibersihkan</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-zinc-700 mb-1">Deskripsi (opsional)</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="Kamar luas dengan pemandangan taman..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-zinc-700 mb-1">Ganti Gambar (opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-black/90"
                  />
                  {editing.image && !editImage && (
                    <div className="mt-3">
                      <p className="text-xs text-zinc-500 mb-1">Gambar saat ini:</p>
                      <img src={editing.image} alt="preview" className="h-20 w-20 rounded-xl object-cover border border-zinc-200" />
                    </div>
                  )}
                  {editImage && (
                    <div className="mt-3">
                      <p className="text-xs text-zinc-500 mb-1">Gambar baru:</p>
                      <div className="h-20 w-20 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center text-xs text-zinc-500">
                        {editImage.name}
                      </div>
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
                className="px-4 py-2 rounded-xl bg-black text-white text-sm shadow-sm hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}