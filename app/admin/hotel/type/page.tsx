"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, AlertCircle, Plus, Percent, Calendar } from "lucide-react";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";

interface RoomType {
  id: number;
  type: string;
  base_price: number;
  discount_percentage: number;
  discount_start?: string | null;
  discount_end?: string | null;
  discount_description?: string;
  description: string;
  created_at: string;
  updated_at: string;
  current_price: number;
}

export default function RoomTypePage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    type: "",
    base_price: "",
    discount_percentage: "",
    discount_start: "",
    discount_end: "",
    discount_description: "",
    description: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<RoomType>>({});
  const [editError, setEditError] = useState<string | null>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api";
  const TOKEN_KEY = "token";
  const validTypes = ["superior", "deluxe", "executive"];

  // Load token
  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken.replace(/^"+|"+$/g, ""));
    } else {
      setError("Anda belum login. Silakan login terlebih dahulu.");
      setLoading(false);
    }
  }, []);

  const saveToSession = (data: RoomType[]) => {
    sessionStorage.setItem("room_types_cache", JSON.stringify(data));
  };

  const loadFromSession = (): RoomType[] | null => {
    const cached = sessionStorage.getItem("room_types_cache");
    return cached ? JSON.parse(cached) : null;
  };

  const fetchRoomTypes = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const cached = loadFromSession();
      if (cached && cached.length > 0) {
        setRoomTypes(cached);
      }

      const res = await fetch(`${API_URL}/room-types`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
          throw new Error("Sesi telah berakhir. Silakan login kembali.");
        }
        throw new Error(err.error || "Gagal mengambil data");
      }

      const data = await res.json();
      const types: RoomType[] = data.data || [];
      setRoomTypes(types);
      saveToSession(types);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan jaringan";
      toast.error(msg);
      const cached = loadFromSession();
      if (cached) {
        setRoomTypes(cached);
        toast.info("Menggunakan data dari cache");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRoomTypes();
  }, [token]);

  const validatePrice = (value: string): number | null => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return null;
    return num;
  };

  const validateDiscountPercentage = (value: string): number | null => {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 100) return null;
    return num;
  };

  const validateDiscountDates = (
    percentage: number,
    start: string,
    end: string
  ): boolean => {
    if (percentage > 0) {
      if (!start || !end) return false;
      if (new Date(start) >= new Date(end)) return false;
    }
    return true;
  };

  // === CREATE ===
  const handleCreate = async () => {
    setCreateError(null);

    if (!createForm.type || !validTypes.includes(createForm.type.toLowerCase())) {
      setCreateError("Tipe harus salah satu: superior, deluxe, executive");
      return;
    }

    const basePrice = validatePrice(createForm.base_price);
    if (basePrice === null) {
      setCreateError("Harga dasar harus angka positif");
      return;
    }

    const discountPercentage = validateDiscountPercentage(createForm.discount_percentage) ?? 0;

    if (!validateDiscountDates(discountPercentage, createForm.discount_start, createForm.discount_end)) {
      setCreateError("Tanggal diskon tidak valid: start harus sebelum end dan wajib jika diskon >0%");
      return;
    }

    if (!createForm.description.trim()) {
      setCreateError("Deskripsi wajib diisi");
      return;
    }

    const toastId = toast.loading("Menambahkan tipe kamar...");

    try {
      const payload = {
        type: createForm.type.toLowerCase(),
        base_price: basePrice,
        discount_percentage: discountPercentage,
        discount_start: discountPercentage > 0 ? createForm.discount_start + "T00:00:00Z" : undefined,
        discount_end: discountPercentage > 0 ? createForm.discount_end + "T23:59:59Z" : undefined,
        discount_description: createForm.discount_description.trim() || undefined,
        description: createForm.description.trim(),
      };

      const res = await fetch(`${API_URL}/room-types`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menambah tipe kamar");
      }

      toast.success("Tipe kamar berhasil ditambahkan!", { id: toastId });
      await fetchRoomTypes();
      setIsCreateModalOpen(false);
      setCreateForm({
        type: "",
        base_price: "",
        discount_percentage: "",
        discount_start: "",
        discount_end: "",
        discount_description: "",
        description: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah", { id: toastId });
    }
  };

  // === EDIT ===
  const openEditModal = (rt: RoomType) => {
    setEditForm({
      id: rt.id,
      base_price: rt.base_price,
      discount_percentage: rt.discount_percentage,
      discount_start: rt.discount_start ? rt.discount_start.split("T")[0] : "",
      discount_end: rt.discount_end ? rt.discount_end.split("T")[0] : "",
      discount_description: rt.discount_description,
      description: rt.description,
    });
    setIsEditModalOpen(true);
    setEditError(null);
  };

  const handleUpdate = async () => {
    setEditError(null);

    const basePrice = validatePrice(String(editForm.base_price));
    if (basePrice === null) {
      setEditError("Harga dasar harus angka positif");
      return;
    }

    const discountPercentage = validateDiscountPercentage(String(editForm.discount_percentage)) ?? 0;

    if (!validateDiscountDates(discountPercentage, String(editForm.discount_start), String(editForm.discount_end))) {
      setEditError("Tanggal diskon tidak valid: start harus sebelum end dan wajib jika diskon >0%");
      return;
    }

    if (!editForm.description?.trim()) {
      setEditError("Deskripsi wajib diisi");
      return;
    }

    const toastId = toast.loading("Menyimpan perubahan...");

    try {
      const payload = {
        base_price: basePrice,
        discount_percentage: discountPercentage > 0 ? discountPercentage : undefined,
        discount_start: discountPercentage > 0 ? String(editForm.discount_start) + "T00:00:00Z" : null,
        discount_end: discountPercentage > 0 ? String(editForm.discount_end) + "T23:59:59Z" : null,
        discount_description: editForm.discount_description?.trim() || undefined,
        description: editForm.description.trim(),
      };

      const res = await fetch(`${API_URL}/room-types/${editForm.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
          throw new Error("Sesi berakhir.");
        }
        throw new Error(err.error || "Gagal update");
      }

      toast.success("Tipe kamar berhasil diperbarui!", { id: toastId });
      await fetchRoomTypes();
      setIsEditModalOpen(false);
      setEditForm({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update gagal", { id: toastId });
    }
  };

  // === DELETE ===
  const handleDelete = async (id: number, typeName: string) => {
    const result = await Swal.fire({
      title: `Hapus tipe "${typeName}"?`,
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "swal-btn-confirm",
        cancelButton: "swal-btn-cancel",
        actions: "swal-actions",
        popup: "rounded-2xl",
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading(`Menghapus tipe ${typeName}...`);

    try {
      setDeletingId(id);

      const res = await fetch(`${API_URL}/room-types/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menghapus tipe kamar");
      }

      toast.success(`Tipe "${typeName}" berhasil dihapus!`, { id: toastId });
      await fetchRoomTypes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/admin/login")}
            className="px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <style jsx global>{`
        .swal-actions {
          gap: 1rem !important;
          justify-content: center !important;
        }
        .swal-btn-cancel {
          min-width: 120px !important;
          padding: 0.75rem 1.5rem !important;
          background-color: #6b7280 !important;
          color: white !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3) !important;
        }
        .swal-btn-cancel:hover {
          background-color: #4b5563 !important;
        }
        .swal-btn-confirm {
          min-width: 140px !important;
          padding: 0.75rem 1.5rem !important;
          background: linear-gradient(to right, #ef4444, #dc2626) !important;
          color: white !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4) !important;
        }
        .swal-btn-confirm:hover {
          background: linear-gradient(to right, #dc2626, #b91c1c) !important;
        }
      `}</style>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Tipe Kamar</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold rounded-xl shadow-md hover:from-amber-600 hover:to-yellow-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Tipe
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {roomTypes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Belum ada tipe kamar. Tekan tombol "Tambah Tipe" untuk memulai.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Tipe</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Harga Dasar</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Harga Saat Ini</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Diskon (%)</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Periode Diskon</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Deskripsi Diskon</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Deskripsi</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-amber-800">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {roomTypes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-amber-50 transition">
                      <td className="px-4 py-4 text-sm text-gray-900">{rt.id}</td>
                      <td className="px-4 py-4 text-sm font-bold text-amber-700 capitalize">{rt.type}</td>
                      <td className="px-4 py-4 text-sm font-bold text-emerald-700">{formatPrice(rt.base_price)}</td>
                      <td className="px-4 py-4 text-sm font-bold text-blue-700">
                        {formatPrice(rt.current_price)}
                        {rt.current_price !== rt.base_price && <Percent className="w-4 h-4 inline ml-1 text-green-500" />}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{rt.discount_percentage}%</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {rt.discount_start ? `${formatDate(rt.discount_start)} - ${formatDate(rt.discount_end)}` : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate" title={rt.discount_description}>
                        {rt.discount_description || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate" title={rt.description}>
                        {rt.description}
                      </td>
                      <td className="px-4 py-4 text-right flex justify-end gap-4">
                        <button
                          onClick={() => openEditModal(rt)}
                          className="text-amber-600 hover:text-amber-800"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rt.id, rt.type.charAt(0).toUpperCase() + rt.type.slice(1))}
                          disabled={deletingId === rt.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === rt.id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREATE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-amber-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Tambah Tipe Kamar</h2>

            {createError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {createError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Kamar</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Pilih tipe</option>
                  {validTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Dasar per Malam</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={createForm.base_price}
                  onChange={(e) => setCreateForm({ ...createForm, base_price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="1.500.000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diskon (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={createForm.discount_percentage}
                  onChange={(e) => setCreateForm({ ...createForm, discount_percentage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mulai Diskon</label>
                  <input
                    type="date"
                    value={createForm.discount_start}
                    onChange={(e) => setCreateForm({ ...createForm, discount_start: e.target.value })}
                    className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Akhir Diskon</label>
                  <input
                    type="date"
                    value={createForm.discount_end}
                    onChange={(e) => setCreateForm({ ...createForm, discount_end: e.target.value })}
                    className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Diskon</label>
                <input
                  type="text"
                  value={createForm.discount_description}
                  onChange={(e) => setCreateForm({ ...createForm, discount_description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Alasan diskon, misal: Promo Lebaran"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Kamar</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Fasilitas, keunggulan, dll..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateForm({
                    type: "",
                    base_price: "",
                    discount_percentage: "",
                    discount_start: "",
                    discount_end: "",
                    discount_description: "",
                    description: "",
                  });
                  setCreateError(null);
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-yellow-700 transition"
              >
                Simpan Tipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-amber-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Edit Tipe Kamar</h2>

            {editError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {editError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Dasar per Malam</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={editForm.base_price ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, base_price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="1.500.000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diskon (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editForm.discount_percentage ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, discount_percentage: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mulai Diskon</label>
                  <input
                    type="date"
                    value={editForm.discount_start ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, discount_start: e.target.value })}
                    className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Akhir Diskon</label>
                  <input
                    type="date"
                    value={editForm.discount_end ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, discount_end: e.target.value })}
                    className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Diskon</label>
                <input
                  type="text"
                  value={editForm.discount_description ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, discount_description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Alasan diskon, misal: Promo Lebaran"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Kamar</label>
                <textarea
                  value={editForm.description ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Fasilitas, keunggulan, dll..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditForm({});
                  setEditError(null);
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-yellow-700 transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}