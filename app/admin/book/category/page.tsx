// app/admin/categoryBook/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import Swal from 'sweetalert2';

interface CategoryBook {
  id: number;
  nama: string;
}

export default function CategoryBookPage() {
  const [categories, setCategories] = useState<CategoryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states (hanya untuk Create & Edit)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBook | null>(null);

  // Form state
  const [formNama, setFormNama] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token')?.replace(/^"+|"+$/g, '') : null;
  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/book-categories`;

  // === FETCH CATEGORIES ===
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      toast.error('Sesi telah berakhir. Silakan login kembali.');
      setError('Token tidak ditemukan.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      const data = Array.isArray(result) ? result : result.data || [];
      setCategories(data);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat kategori buku.');
      setError('Gagal memuat kategori buku.');
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
      toast.error('Nama kategori wajib diisi!');
      return;
    }

    const result = await Swal.fire({
      title: 'Tambah Kategori Baru?',
      text: `Kategori "${formNama}" akan ditambahkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tambah!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel',
        actions: 'swal-actions',
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading('Menyimpan kategori...');
    setSubmitLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nama: formNama.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal membuat kategori');
      }

      toast.success('Kategori berhasil ditambahkan!', { id: toastId });
      setIsCreateOpen(false);
      setFormNama('');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat kategori', { id: toastId });
    } finally {
      setSubmitLoading(false);
    }
  };

  // === UPDATE ===
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !formNama.trim()) {
      toast.error('Nama kategori wajib diisi!');
      return;
    }

    const result = await Swal.fire({
      title: 'Simpan Perubahan?',
      text: `Kategori "${formNama}" akan diperbarui.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel',
        actions: 'swal-actions',
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading('Memperbarui kategori...');
    setSubmitLoading(true);

    try {
      const res = await fetch(`${API_URL}/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nama: formNama.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal update kategori');
      }

      toast.success('Kategori berhasil diperbarui!', { id: toastId });
      setIsEditOpen(false);
      setFormNama('');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Gagal update kategori', { id: toastId });
    } finally {
      setSubmitLoading(false);
    }
  };

  // === DELETE DENGAN SWEETALERT LANGSUNG ===
  const confirmDelete = async (cat: CategoryBook) => {
    const result = await Swal.fire({
      title: `Hapus Kategori "${cat.nama}"?`,
      text: 'Produk terkait akan menjadi Uncategorized. Tindakan ini tidak dapat dibatalkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel',
        actions: 'swal-actions',
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading('Menghapus kategori...');

    try {
      const res = await fetch(`${API_URL}/${cat.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Gagal menghapus kategori');

      toast.success('Kategori berhasil dihapus!', { id: toastId });
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus kategori', { id: toastId });
    }
  };

  // === MODAL OPENERS ===
  const openCreate = () => {
    setFormNama('');
    setIsCreateOpen(true);
  };

  const openEdit = (cat: CategoryBook) => {
    setSelectedCategory(cat);
    setFormNama(cat.nama);
    setIsEditOpen(true);
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      {/* SweetAlert2 Premium Style (sama di semua halaman) */}
      <style jsx global>{`
        .swal-popup { border-radius: 1rem !important; }
        .swal-actions { gap: 1rem !important; justify-content: center !important; padding: 0 1.5rem !important; }
        .swal-cancel {
          min-width: 120px !important;
          padding: 0.75rem 1.5rem !important;
          background-color: #6b7280 !important;
          color: white !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3) !important;
        }
        .swal-cancel:hover { background-color: #4b5563 !important; }
        .swal-confirm {
          min-width: 140px !important;
          padding: 0.75rem 1.5rem !important;
          background: linear-gradient(to right, #ef4444, #dc2626) !important;
          color: white !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4) !important;
        }
        .swal-confirm:hover { background: linear-gradient(to right, #dc2626, #b91c1c) !important; }
      `}</style>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Kategori Buku</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Tambah Kategori
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat kategori...</p>
          </div>
        ) : (
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
                  {categories.length === 0 ? (
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
                            onClick={() => confirmDelete(cat)}
                            className="text-red-600 hover:text-red-900 font-medium"
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

        {/* === CREATE MODAL (TIDAK BERUBAH) === */}
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {submitLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === EDIT MODAL (TIDAK BERUBAH) === */}
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {submitLoading ? 'Menyimpan...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}