// app/admin/productBook/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import Swal from 'sweetalert2';

interface CategoryBook {
  id: number;
  nama: string;
}

interface ProductBook {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: string;
  category_id: number;
  category: CategoryBook;
  created_at: string;
  updated_at: string;
}

export default function ProductBookPage() {
  // === STATE UTAMA ===
  const [products, setProducts] = useState<ProductBook[]>([]);
  const [categories, setCategories] = useState<CategoryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === MODAL STATES (HANYA UNTUK CREATE & EDIT) ===
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductBook | null>(null);

  // === FORM STATES ===
  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    harga: '',
    stok: '',
    category_id: '',
    gambar: null as File | null,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token')?.replace(/^"+|"+$/g, '') : null;
  const API_BOOKS = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books`;
  const API_CATEGORIES = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/book-categories`;

  // === FETCH PRODUCTS ===
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      toast.error('Sesi telah berakhir. Silakan login kembali.');
      setError('Token tidak ditemukan. Silakan login ulang.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_BOOKS, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      const data = Array.isArray(result) ? result : result.data || [];
      setProducts(data);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat buku.');
      setError('Gagal memuat buku.');
    } finally {
      setLoading(false);
    }
  };

  // === FETCH CATEGORIES ===
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch(API_CATEGORIES, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat kategori');
      const result = await res.json();
      const data = Array.isArray(result) ? result : result.data || [];
      setCategories(data);
    } catch (err) {
      toast.error('Gagal memuat kategori.');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // === HELPER: Full Image URL ===
  const getFullImageUrl = (path: string): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // === RESET FORM ===
  const resetForm = () => {
    setForm({
      nama: '',
      deskripsi: '',
      harga: '',
      stok: '',
      category_id: '',
      gambar: null,
    });
    setImagePreview(null);
  };

  // === HANDLE INPUT CHANGE ===
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // === HANDLE FILE CHANGE ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB!');
        return;
      }
      setForm(prev => ({ ...prev, gambar: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // === CREATE PRODUCT ===
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.harga || !form.stok || !form.category_id || !form.gambar) {
      toast.error('Lengkapi semua field wajib!');
      return;
    }

    const result = await Swal.fire({
      title: 'Tambah Buku Baru?',
      text: `Buku "${form.nama}" akan ditambahkan.`,
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

    const toastId = toast.loading('Menyimpan buku...');
    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('nama', form.nama.trim());
    formData.append('deskripsi', form.deskripsi);
    formData.append('harga', form.harga);
    formData.append('stok', form.stok);
    formData.append('category_id', form.category_id);
    formData.append('gambar', form.gambar);

    try {
      const res = await fetch(API_BOOKS, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Gagal membuat buku');
      toast.success('Buku berhasil ditambahkan!', { id: toastId });
      setIsCreateOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat buku', { id: toastId });
    } finally {
      setSubmitLoading(false);
    }
  };

  // === UPDATE PRODUCT ===
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !form.nama.trim() || !form.harga || !form.stok || !form.category_id) {
      toast.error('Lengkapi semua field wajib!');
      return;
    }

    const result = await Swal.fire({
      title: 'Simpan Perubahan?',
      text: `Buku "${form.nama}" akan diperbarui.`,
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

    const toastId = toast.loading('Memperbarui buku...');
    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('nama', form.nama.trim());
    formData.append('deskripsi', form.deskripsi);
    formData.append('harga', form.harga);
    formData.append('stok', form.stok);
    formData.append('category_id', form.category_id);
    if (form.gambar) formData.append('gambar', form.gambar);

    try {
      const res = await fetch(`${API_BOOKS}/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Gagal update buku');
      toast.success('Buku berhasil diperbarui!', { id: toastId });
      setIsEditOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal update buku', { id: toastId });
    } finally {
      setSubmitLoading(false);
    }
  };

  // === DELETE DENGAN SWEETALERT LANGSUNG ===
  const confirmDelete = async (product: ProductBook) => {
    const result = await Swal.fire({
      title: `Hapus Buku "${product.nama}"?`,
      text: 'Tindakan ini tidak dapat dibatalkan!',
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

    const toastId = toast.loading('Menghapus buku...');

    try {
      const res = await fetch(`${API_BOOKS}/${product.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus buku');
      toast.success('Buku berhasil dihapus!', { id: toastId });
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus buku', { id: toastId });
    }
  };

  // === MODAL HANDLERS ===
  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (product: ProductBook) => {
    setSelectedProduct(product);
    setForm({
      nama: product.nama,
      deskripsi: product.deskripsi,
      harga: product.harga.toString(),
      stok: product.stok.toString(),
      category_id: product.category_id.toString(),
      gambar: null,
    });
    setImagePreview(getFullImageUrl(product.gambar));
    setIsEditOpen(true);
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
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

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Produk Buku</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Tambah Buku
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
            <p className="mt-2 text-gray-600">Memuat buku...</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Belum ada buku.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const imageUrl = getFullImageUrl(product.gambar);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.nama}
                                className="h-12 w-12 object-cover rounded-md border shadow-sm"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 border-2 border-dashed rounded-md" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{product.nama}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{product.deskripsi}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.category?.nama || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Rp {product.harga.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.stok > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stok}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium space-x-3">
                            <button onClick={() => openEdit(product)} className="text-indigo-600 hover:text-indigo-900">
                              Edit
                            </button>
                            <button onClick={() => confirmDelete(product)} className="text-red-600 hover:text-red-900 font-medium">
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CREATE & EDIT MODAL (TIDAK BERUBAH) */}
        {(isCreateOpen || isEditOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {isCreateOpen ? 'Tambah Buku' : 'Edit Buku'}
              </h2>

              {loadingCategories ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 mt-2">Memuat kategori...</p>
                </div>
              ) : (
                <form onSubmit={isCreateOpen ? handleCreate : handleUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Buku *</label>
                      <input
                        type="text"
                        name="nama"
                        value={form.nama}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea
                        name="deskripsi"
                        value={form.deskripsi}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga *</label>
                        <input
                          type="number"
                          name="harga"
                          value={form.harga}
                          onChange={handleInputChange}
                          min="0"
                          step="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                        <input
                          type="number"
                          name="stok"
                          value={form.stok}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                      <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Pilih kategori</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isEditOpen ? 'Gambar (kosongkan jika tidak diganti)' : 'Gambar *'}
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={isCreateOpen}
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mt-2 h-32 w-full object-cover rounded-md border"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCreateOpen) setIsCreateOpen(false);
                        else setIsEditOpen(false);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading || loadingCategories}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {submitLoading ? 'Menyimpan...' : (isCreateOpen ? 'Simpan' : 'Update')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}