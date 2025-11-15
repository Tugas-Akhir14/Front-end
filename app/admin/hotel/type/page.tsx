"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, AlertCircle, LogOut, Plus } from "lucide-react";

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
      setToken(storedToken);
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

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${API_URL}/room-types`, {
        method: "GET",
        credentials: "include",
        headers,
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
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      const cached = loadFromSession();
      if (cached) {
        setRoomTypes(cached);
        setError("Menggunakan data dari cache (offline mode)");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRoomTypes();
    }
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

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token!}`,
      };

      const res = await fetch(`${API_URL}/room-types`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          type: createForm.type.toLowerCase(),
          price: price,
          description: createForm.description,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menambah tipe kamar");
      }

      await fetchRoomTypes();
      setIsCreateModalOpen(false);
      setCreateForm({ type: "", Price: "", description: "" });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Gagal menambah");
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

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${API_URL}/room-types/${id}`, {
        method: "PUT",
        credentials: "include",
        headers,
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

      setPriceError(null);
      await fetchRoomTypes();
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update gagal");
    }
  };

  // === DELETE ===
  const handleDelete = async (id: number) => {
    if (!confirm("Hapus tipe kamar ini?")) return;

    try {
      setDeletingId(id);
      const headers: HeadersInit = { Authorization: `Bearer ${token!}` };

      const res = await fetch(`${API_URL}/room-types/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menghapus");
      }

      await fetchRoomTypes();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hapus gagal");
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

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("room_types_cache");
    window.location.href = "/admin/login";
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Tipe Kamar</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Tipe
              </button>
              <button
                onClick={fetchRoomTypes}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
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
              Belum ada tipe kamar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roomTypes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{rt.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{rt.type}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
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
                            className={`w-32 px-2 py-1 border rounded focus:outline-none focus:ring-2 ${
                              priceError ? "border-red-500 ring-red-500" : "focus:ring-blue-500"
                            }`}
                            placeholder="Harga"
                          />
                        ) : (
                          <span className="font-medium">{formatPrice(rt.Price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                        {editingId === rt.id ? (
                          <textarea
                            value={editForm.description ?? rt.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        ) : (
                          <span className="block truncate" title={rt.description}>
                            {rt.description}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === rt.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdate(rt.id)} className="text-green-600 hover:text-green-800 font-medium">
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
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => {
                                setEditingId(rt.id);
                                setEditForm({ Price: rt.Price, description: rt.description });
                                setPriceError(null);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rt.id)}
                              disabled={deletingId === rt.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Hapus"
                            >
                              {deletingId === rt.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
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

      {/* === MODAL CREATE === */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Tipe Kamar</h2>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={createForm.Price}
                  onChange={(e) => setCreateForm({ ...createForm, Price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 1500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Deskripsi tipe kamar..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateForm({ type: "", Price: "", description: "" });
                  setCreateError(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}