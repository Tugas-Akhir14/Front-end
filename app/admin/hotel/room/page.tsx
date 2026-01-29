'use client';

import React, {  useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';

// ===================== AXIOS INSTANCE =====================
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem("token");
  if (raw) {
    const token = raw.replace(/^"+|"+$/g, "");
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// ===================== TYPES =====================
export type RoomType = {
  id: number;
  type: "superior" | "deluxe" | "executive";
  Price: number;
  description?: string;
};

export type Room = {
  id: number;
  number: string;
  room_type_id: number;
  room_type: RoomType;
  capacity: number;
  description?: string;
  image?: string | null;
  status: "available" | "booked" | "cleaning";
  created_at: string;
  updated_at: string;
};

export type RoomsResponse = { data: Room[]; total: number; };

// ===================== CONSTANTS =====================
const ROOM_STATUSES = [
  { label: "Semua Status", value: "" },
  { label: "Tersedia", value: "available", color: "bg-emerald-50 text-emerald-800 border border-emerald-200" },
  { label: "Dipesan", value: "booked", color: "bg-blue-50 text-blue-800 border border-blue-200" },
  { label: "Sedang Dibersihkan", value: "cleaning", color: "bg-purple-50 text-purple-800 border border-purple-200" },
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
      <td className="px-4 py-4"><div className="h-16 w-16 rounded-xl bg-amber-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-12 rounded bg-amber-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-28 rounded bg-amber-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-24 rounded bg-amber-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-20 rounded bg-amber-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-32 rounded bg-amber-100" /></td>
      <td className="px-4 py-4"><div className="h-3 w-20 rounded bg-amber-100" /></td>
      <td className="px-4 py-4"><div className="h-8 w-28 rounded bg-amber-100" /></td>
    </tr>
  );
}

export default function RoomPage() {
  const [imageErrorIds, setImageErrorIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomStatus, setRoomStatus] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editRoomTypeId, setEditRoomTypeId] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Room["status"]>("available");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // ===================== FETCH ROOM TYPES =====================
  useEffect(() => {
    api.get<{ data: RoomType[] }>("/api/room-types")
      .then(res => setRoomTypes(res.data.data || []))
      .catch(() => {
        toast.error("Gagal memuat tipe kamar, menggunakan data default");
        setRoomTypes([
          { id: 1, type: "superior", Price: 750000 },
          { id: 2, type: "deluxe", Price: 1200000 },
          { id: 3, type: "executive", Price: 2000000 },
        ]);
      })
      .finally(() => setLoadingTypes(false));
  }, []);

  // ===================== FETCH ROOMS =====================
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<RoomsResponse>("/api/rooms", {
        params: { q: search || undefined, type: roomType || undefined, status: roomStatus || undefined, limit, offset },
      });
      setRooms(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesi berakhir. Silakan login kembali.");
        toast.error("Sesi berakhir, silakan login ulang");
      } else if (status === 403) {
        setError("Akses ditolak.");
        toast.error("Akses ditolak");
      } else {
        setError("Gagal memuat data kamar.");
        toast.error("Gagal memuat data kamar");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, [search, roomType, roomStatus, limit, offset]);

  // ===================== UI HELPERS =====================
  const FallbackThumb = () => (
    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-50">
      <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="m8 13 2.5-2.5 4 4L21 9" />
        <circle cx="7" cy="8" r="1.5" />
      </svg>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const s = ROOM_STATUSES.find(s => s.value === status);
    if (!s || !s.value) return <span className="text-xs text-gray-600">{status}</span>;
    return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>{s.label}</span>;
  };

  // ===================== EDIT MODAL =====================
  const openEdit = (r: Room) => {
    setEditing(r);
    setEditNumber(r.number);
    setEditRoomTypeId(String(r.room_type_id));
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

    if (!editNumber.trim()) {
      setSubmitError("Nomor kamar wajib diisi.");
      toast.error("Nomor kamar wajib diisi");
      return;
    }
    if (Number(editCapacity) < 1) {
      setSubmitError("Kapasitas minimal 1.");
      toast.error("Kapasitas minimal 1 orang");
      return;
    }

    const toastId = toast.loading("Menyimpan perubahan...");

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("number", editNumber.trim());
      formData.append("room_type_id", editRoomTypeId);
      formData.append("capacity", String(Math.round(Number(editCapacity))));
      formData.append("description", editDescription.trim());
      formData.append("status", editStatus);
      if (editImage) formData.append("image", editImage);

      await api.put(`/api/rooms/${editing.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Kamar berhasil diperbarui!", { id: toastId });
      await fetchRooms();
      closeEdit();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal memperbarui kamar.";
      setSubmitError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitLoading(false);
    }
  };

const handleDelete = async (room: Room) => {
  const result = await Swal.fire({
    title: `Hapus kamar ${room.number}?`,
    text: "Tindakan ini tidak dapat dibatalkan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
    focusCancel: true,

    // CUSTOM STYLING BIAR TOMBOL GA BEREMPETAN + CANTIK
    buttonsStyling: false,
    customClass: {
      popup: "swal-popup",
      title: "swal-title",
      htmlContainer: "swal-text",
      confirmButton: "swal-btn-confirm",
      cancelButton: "swal-btn-cancel",
      actions: "swal-actions",
    },
  });

  if (!result.isConfirmed) return;

  Swal.fire({
    title: "Menghapus...",
    text: `Sedang menghapus kamar ${room.number}`,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    await api.delete(`/api/rooms/${room.id}`);
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: `Kamar ${room.number} telah dihapus`,
      timer: 2000,
      showConfirmButton: false,
    });

    const newTotal = total - 1;
    setTotal(newTotal);
    if (rooms.length === 1 && offset > 0) {
      setOffset(Math.max(0, offset - limit));
    } else {
      await fetchRooms();
    }
  } catch (err: any) {
    const msg = err?.response?.data?.error || "Gagal menghapus kamar.";
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: msg,
    });
  }
};

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-yellow-200 bg-white dark:bg-gray-900  backdrop-blur-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold bg-black bg-clip-text text-transparent">
                Manajemen Kamar
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/hotel/room/create"
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-black shadow-md hover:from-amber-600 hover:to-yellow-700 transition-all"
              >
                + Tambah Kamar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
              placeholder="Cari nomor/deskripsi..."
              className="w-full rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-500"
            />
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <select
            value={roomType}
            onChange={(e) => { setRoomType(e.target.value); setOffset(0); }}
            className="rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Semua Tipe</option>
            {roomTypes.map(rt => (
              <option key={rt.id} value={rt.type}>
                {rt.type.charAt(0).toUpperCase() + rt.type.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={roomStatus}
            onChange={(e) => { setRoomStatus(e.target.value); setOffset(0); }}
            className="rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {ROOM_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-700 font-medium">Per halaman</label>
            <select
              value={limit}
              onChange={(e) => { const l = Number(e.target.value) || 10; setLimit(l); setOffset(0); }}
              className="rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl  bg-white shadow-lg">
          <table className="min-w-full divide-y divide-yellow-100">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Gambar</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">No. Kamar</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Harga</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Kapasitas</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Diperbarui</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <svg className="h-8 w-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 8h10M7 12h6M7 16h8" />
                      </svg>
                    </div>
                    <p className="text-gray-800 font-semibold text-lg">Belum ada data kamar.</p>
                    <p className="text-gray-600 text-sm mt-1">Mulai dengan menambahkan kamar baru.</p>
                    <div className="mt-5">
                      <Link href="/admin/hotel/room/create" className="inline-flex items-center rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-black shadow-md hover:from-amber-600 hover:to-yellow-700">
                        + Tambah Kamar
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="px-4 py-3 align-top">
                     {r.image && !imageErrorIds.has(r.id) ? (
                      <img
                        src={r.image}
                        alt={`Kamar ${r.number}`}
                        className="h-16 w-16 rounded-xl object-cover border-2 border-amber-200 shadow-sm"
                        onError={() => {
                          setImageErrorIds(prev => new Set(prev).add(r.id));
                        }}
                      />
                    ) : (
                      <FallbackThumb />
                    )}

                    </td>
                    <td className="px-4 py-3 align-top font-bold text-amber-700">{r.number}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                        {r.room_type.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-medium text-emerald-700">
                      {rupiah(r.room_type.Price)}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-800">{r.capacity}</td>
                    <td className="px-4 py-3 align-top">{getStatusBadge(r.status)}</td>
                    <td className="px-4 py-3 align-top text-sm text-gray-600">{formatDate(r.updated_at)}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="px-3 py-1.5 rounded-xl text-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold shadow-sm hover:from-amber-600 hover:to-yellow-700 transition-all"
                          title="Ubah"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="px-3 py-1.5 rounded-xl text-sm border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
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
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 mt-0.5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="font-bold">Terjadi kesalahan</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-700">
            Menampilkan <span className="font-bold text-amber-700">{rooms.length}</span> dari{" "}
            <span className="font-bold text-amber-700">{total}</span> kamar
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset <= 0 || loading}
              className="px-4 py-2.5 rounded-xl border border-yellow-300 text-sm font-medium disabled:opacity-50 hover:bg-yellow-50 transition-colors"
            >
              Previous
            </button>
            <div className="text-sm text-gray-700 font-medium">
              Halaman <span className="text-amber-700 font-bold">{page}</span> dari{" "}
              <span className="text-amber-700 font-bold">{totalPages}</span>
            </div>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total || loading}
              className="px-4 py-2.5 rounded-xl border border-yellow-300 text-sm font-medium disabled:opacity-50 hover:bg-yellow-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* EDIT MODAL – TETAP SAMA */}
      {isEditOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/30">
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-yellow-200">
            <div className="px-6 py-4 border-b border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Ubah Kamar #{editing.number}</h3>
              <button onClick={closeEdit} className="p-2 rounded-xl hover:bg-amber-100 transition-colors">
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {submitError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm font-medium">{submitError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Kamar</label>
                  <input
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Kamar</label>
                  <select
                    value={editRoomTypeId}
                    onChange={(e) => setEditRoomTypeId(e.target.value)}
                    className="w-full rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>
                        {rt.type.charAt(0).toUpperCase() + rt.type.slice(1)} — {rupiah(rt.Price)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kapasitas (orang)</label>
                  <input
                    type="number"
                    min="1"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="w-full rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Room["status"])}
                    className="w-full rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="available">Tersedia</option>
                    <option value="booked">Dipesan</option>
                    <option value="cleaning">Sedang Dibersihkan</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi (opsional)</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    placeholder="Kamar luas dengan pemandangan taman..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ganti Gambar (opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-amber-500 file:to-yellow-600 file:text-black hover:file:from-amber-600 hover:file:to-yellow-700"
                  />
                  {editing.image && !editImage && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Gambar saat ini:</p>
                      <img src={editing.image} alt="preview" className="h-24 w-24 rounded-xl object-cover border-2 border-amber-200 shadow-sm" />
                    </div>
                  )}
                  {editImage && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Gambar baru:</p>
                      <div className="h-24 w-24 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex items-center justify-center text-xs text-amber-700 font-medium p-2">
                        {editImage.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 flex items-center justify-end gap-3">
              <button
                onClick={closeEdit}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors"
                disabled={submitLoading}
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-sm font-bold shadow-md hover:from-amber-600 hover:to-yellow-700 disabled:opacity-60 flex items-center gap-2 transition-all"
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

      {/* TOASTER (untuk success/error biasa) */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: { fontSize: '14px' },
          classNames: {
            success: 'bg-emerald-600 text-white',
            error: 'bg-rose-600 text-white',
            loading: 'bg-amber-600 text-white',
          },
        }}
      />
    </div>
  );
}