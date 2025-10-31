// app/admin/categoryBook/page.tsx
"use client";

import { useEffect, useState } from 'react';

interface CategoryBook {
  id: number;
  nama: string;
}

export default function CategoryBookPage() {
  const [categories, setCategories] = useState<CategoryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBook | null>(null);

  // Form state
  const [formNama, setFormNama] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const API_URL = 'http://localhost:8080/api/book-categories';

  // === FETCH CATEGORIES - AMAN TERHADAP FORMAT APAPUN ===
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Token tidak ditemukan. Silakan login ulang.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const result = await res.json();

      // === HANDLE BERBAGAI FORMAT RESPONSE ===
      let data: CategoryBook[] = [];

      if (Array.isArray(result)) {
        data = result;
      } else if (result && Array.isArray(result.data)) {
        data = result.data;
      } else if (result && typeof result === 'object') {
        data = [result];
      } else {
        console.warn('Unexpected response format:', result);
        data = [];
      }

      setCategories(data);

    } catch (err) {
      console.error('Fetch categories error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat kategori buku.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // === CREATE ===
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nama: formNama.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal membuat kategori');
      }

      setSuccessMessage('Kategori berhasil ditambahkan!');
      setIsCreateOpen(false);
      setFormNama('');
      fetchCategories();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat kategori');
    } finally {
      setSubmitLoading(false);
    }
  };

  // === UPDATE ===
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !formNama.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nama: formNama.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal update kategori');
      }

      setSuccessMessage('Kategori berhasil diupdate!');
      setIsEditOpen(false);
      setFormNama('');
      fetchCategories();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal update kategori');
    } finally {
      setSubmitLoading(false);
    }
  };

  // === DELETE ===
  const handleDelete = async () => {
    if (!selectedCategory) return;

    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_URL}/${selectedCategory.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Gagal menghapus kategori');

      setSuccessMessage('Kategori berhasil dihapus!');
      setIsDeleteOpen(false);
      fetchCategories();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus kategori');
    } finally {
      setSubmitLoading(false);
    }
  };

  // === OPEN MODALS ===
  const openCreate = () => {
    setFormNama('');
    setIsCreateOpen(true);
  };

  const openEdit = (cat: CategoryBook) => {
    setSelectedCategory(cat);
    setFormNama(cat.nama);
    setIsEditOpen(true);
  };

  const openDelete = (cat: CategoryBook) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Kategori Buku</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Tambah Kategori
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 relative">
          {successMessage}
          <button
            onClick={() => setSuccessMessage('')}
            className="absolute top-2 right-3 text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat kategori...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(!Array.isArray(categories) || categories.length === 0) ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      Belum ada kategori buku.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.nama}</td>
                      <td className="px-6 py-4 text-sm font-medium space-x-3">
                        <button
                          onClick={() => openEdit(cat)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(cat)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === CREATE MODAL === */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tambah Kategori Buku</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama kategori"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {isEditOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Kategori Buku</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama kategori"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitLoading ? 'Menyimpan...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === DELETE CONFIRM MODAL === */}
      {isDeleteOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-4 text-red-600">Hapus Kategori?</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus kategori <strong>"{selectedCategory.nama}"</strong>?
              <br />
              <span className="text-sm text-red-500">Produk terkait akan menjadi Uncategorized.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={submitLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={submitLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}