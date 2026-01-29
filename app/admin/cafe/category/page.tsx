'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Swal from 'sweetalert2';
import axios from 'axios';

// === AXIOS INSTANCE DENGAN TOKEN ===
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')?.replace(/^"+|"+$/g, '');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Category {
  id: number;
  nama: string;
}

export default function CategoryCafePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States (hanya untuk Create & Edit)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form States
  const [formData, setFormData] = useState({ nama: '' });

  // === FETCH CATEGORIES ===
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/cafe-categories');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setCategories(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memuat kategori cafe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter by search
  const filteredCategories = categories.filter((cat) =>
    cat.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset Form
  const resetForm = () => setFormData({ nama: '' });

  // Open Modals
  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ nama: category.nama });
    setIsEditModalOpen(true);
  };

  // === CREATE CATEGORY ===
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      toast.error('Nama kategori wajib diisi!');
      return;
    }

    const result = await Swal.fire({
      title: 'Tambah Kategori Baru?',
      text: `Kategori "${formData.nama}" akan ditambahkan.`,
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

    try {
      await api.post('/api/cafe-categories', { nama: formData.nama.trim() });
      toast.success('Kategori berhasil ditambahkan!', { id: toastId });
      setIsCreateModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menambahkan kategori', { id: toastId });
    }
  };

  // === UPDATE CATEGORY ===
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      toast.error('Nama kategori wajib diisi!');
      return;
    }

    const result = await Swal.fire({
      title: 'Simpan Perubahan?',
      text: `Kategori "${formData.nama}" akan diperbarui.`,
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

    try {
      await api.put(`/api/cafe-categories/${selectedCategory?.id}`, { nama: formData.nama.trim() });
      toast.success('Kategori berhasil diperbarui!', { id: toastId });
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui kategori', { id: toastId });
    }
  };

  // === DELETE DENGAN SWEETALERT LANGSUNG ===
  const confirmDelete = async (category: Category) => {
    const result = await Swal.fire({
      title: `Hapus Kategori "${category.nama}"?`,
      text: 'Produk terkait mungkin akan terpengaruh. Tindakan ini tidak dapat dibatalkan!',
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
      await api.delete(`/api/cafe-categories/${category.id}`);
      toast.success('Kategori berhasil dihapus!', { id: toastId });
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menghapus kategori', { id: toastId });
    }
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

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kategori Cafe</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Tambah Kategori
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada kategori ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.nama}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* === CREATE MODAL (TIDAK BERUBAH) === */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Tambah Kategori Baru</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Minuman, Makanan"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === EDIT MODAL (TIDAK BERUBAH) === */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit Kategori</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}                                                       