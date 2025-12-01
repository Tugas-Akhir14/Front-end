"use client";

import { useEffectCallback, useEffect, useState } from "react";
import { Pencil, Trash2, AlertCircle, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";

interface RoomType {
  id: number;
  type: string;
  Price: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function RoomTypePage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ Price?: number; description?: string }>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    type: "",
    Price: "",
    description: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const API_URL = "http://localhost:8080/api";
  const TOKEN_KEY = "token";
  const validTypes = ["superior", "deluxe", "executive"];

  // Load token
  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken.replace(/^"+|"+$/g, "")); // bersihin tanda petik kalau ada
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

  // === CREATE ===
  const handleCreate = async () => {
    setCreateError(null);

    if (!createForm.type || !validTypes.includes(createForm.type.toLowerCase())) {
      setCreateError("Tipe harus salah satu: superior, deluxe, executive");
      return;
    }

    const price = validatePrice(createForm.Price);
    if (price === null) {
      setCreateError("Harga harus angka positif");
      return;
    }

    if (!createForm.description.trim()) {
      setCreateError("Deskripsi wajib diisi");
      return;
    }

    const toastId = toast.loading("Menambahkan tipe kamar...");

    try {
      const res = await fetch(`${API_URL}/room-types`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify({
          type: createForm.type.toLowerCase(),
          price: price,
          description: createForm.description.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menambah tipe kamar");
      }

      toast.success("Tipe kamar berhasil ditambahkan!", { id: toastId });
      await fetchRoomTypes();
      setIsCreateModalOpen(false);
      setCreateForm({ type: "", Price: "", description: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah", { id: toastId });
    }
  };

  // === UPDATE ===
  const handleUpdate = async (id: number) => {
    if (!token) return;

    if (editForm.Price !== undefined) {
      const validPrice = validatePrice(String(editForm.Price));
      if (validPrice === null) {
        setPriceError("Harga harus angka positif");
        return;
      }
      editForm.Price = validPrice;
    }

    const toastId = toast.loading("Menyimpan perubahan...");

    try {
      const res = await fetch(`${API_URL}/room-types/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
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
      setPriceError(null);
      await fetchRoomTypes();
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update gagal", { id: toastId });
    }
  };

  // === DELETE DENGAN SWEETALERT2 CANTIK + WARNA SOLID ===
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

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || isNaN(price) || price < 0) return "Rp0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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
      {/* SWEETALERT2 & SONNER */}
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

      <div className="container mx-auto p-6 max-w-5xl">
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

          {priceError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {priceError}
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
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-amber-800">Deskripsi</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-amber-800">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {roomTypes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-amber-50 transition">
                      <td className="px-4 py-4 text-sm text-gray-900">{rt.id}</td>
                      <td className="px-4 py-4 text-sm font-bold text-amber-700 capitalize">{rt.type}</td>
                      <td className="px-4 py-4 text-sm">
                        {editingId === rt.id ? (
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={editForm.Price ?? rt.Price}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditForm({ ...editForm, Price: val === "" ? undefined : Number(val) });
                              setPriceError(null);
                            }}
                            className={`w-32 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                              priceError ? "border-red-500 ring-red-500" : "focus:ring-amber-500"
                            }`}
                          />
                        ) : (
                          <span className="font-bold text-emerald-700">{formatPrice(rt.Price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                        {editingId === rt.id ? (
                          <textarea
                            value={editForm.description ?? rt.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                          />
                        ) : (
                          <span className="block truncate" title={rt.description}>{rt.description}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {editingId === rt.id ? (
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleUpdate(rt.id)} className="text-green-600 hover:text-green-800 font-semibold">
                              Simpan
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditForm({});
                                setPriceError(null);
                              }}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => {
                                setEditingId(rt.id);
                                setEditForm({ Price: rt.Price, description: rt.description });
                                setPriceError(null);
                              }}
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
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREATE – TETAP SAMA */}
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga per Malam</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={createForm.Price}
                  onChange={(e) => setCreateForm({ ...createForm, Price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="1.500.000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
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
                  setCreateForm({ type: "", Price: "", description: "" });
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
    </>
  );
}