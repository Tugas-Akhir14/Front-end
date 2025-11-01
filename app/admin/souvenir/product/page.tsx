"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  nama: string;
  slug?: string;
}

interface Product {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: string;
  category_id: number;
  category: Category;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export default function ProductSouvenirPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    harga: '',
    stok: '',
    category_id: '',
    gambar: [] as File[],
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

  // === FETCH PRODUCTS & CATEGORIES ===
  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8080/api/products?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result: ApiResponse = await res.json();
      setProducts(result.data);
      setTotal(result.total);
    } catch (err) {
      setError('Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, token]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat kategori');
      const result = await res.json();
      setCategories(result.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // === IMAGE URL HELPER ===
  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // === HANDLE CREATE ===
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.harga || !form.stok || !form.category_id || form.gambar.length === 0) {
      setError('Semua field wajib diisi dan minimal 1 gambar.');
      return;
    }

    setSubmitLoading(true);
    const formData = new FormData();
    formData.append('nama', form.nama);
    formData.append('deskripsi', form.deskripsi);
    formData.append('harga', form.harga);
    formData.append('stok', form.stok);
    formData.append('category_id', form.category_id);
    form.gambar.forEach(file => formData.append('gambar', file));

    try {
      const res = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal membuat produk');
      }
      setSuccess('Produk berhasil dibuat!');
      setIsCreateOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // === HANDLE UPDATE ===
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitLoading(true);
    const formData = new FormData();
    if (form.nama) formData.append('nama', form.nama);
    if (form.deskripsi) formData.append('deskripsi', form.deskripsi);
    if (form.harga) formData.append('harga', form.harga);
    if (form.stok) formData.append('stok', form.stok);
    if (form.category_id) formData.append('category_id', form.category_id);
    form.gambar.forEach(file => formData.append('gambar', file));

    try {
      const res = await fetch(`http://localhost:8080/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal update produk');
      }
      setSuccess('Produk berhasil diupdate!');
      setIsEditOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // === HANDLE DELETE ===
  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(`http://localhost:8080/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus produk');
      setSuccess('Produk berhasil dihapus!');
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // === MODAL OPENERS ===
  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      nama: product.nama,
      deskripsi: product.deskripsi,
      harga: product.harga.toString(),
      stok: product.stok.toString(),
      category_id: product.category_id.toString(),
      gambar: [],
    });
    setExistingImages(product.gambar ? product.gambar.split(',') : []);
    setIsEditOpen(true);
  };

  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setForm({ nama: '', deskripsi: '', harga: '', stok: '', category_id: '', gambar: [] });
    setExistingImages([]);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Produk Souvenir</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat produk...</p>
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Belum ada produk.</td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const imageUrls = product.gambar
                      ? product.gambar.split(',').map(url => getImageUrl(url.trim())).filter(Boolean)
                      : [];
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {imageUrls.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {imageUrls.slice(0, 3).map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`${product.nama} ${i + 1}`}
                                  className="h-12 w-12 object-cover rounded-md border shadow-sm"
                                  onError={(e) => e.currentTarget.style.display = 'none'}
                                  loading="lazy"
                                />
                              ))}
                              {imageUrls.length > 3 && <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-xs">+{imageUrls.length - 3}</div>}
                            </div>
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 border-2 border-dashed rounded-md flex items-center justify-center text-xs text-gray-500">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{product.nama}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{product.deskripsi}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{product.category?.nama || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">Rp {product.harga.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stok > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stok}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium space-x-3">
                          <button onClick={() => openEdit(product)} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => openDelete(product)} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} produk
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/admin/productSouvenir?page=${p}&limit=${limit}`}
                    className={`px-3 py-1 text-sm rounded-md ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === CREATE MODAL === */}
      {isCreateOpen && (
        <Modal title="Tambah Produk Baru" onClose={() => setIsCreateOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Nama Produk" name="nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
            <Textarea label="Deskripsi" name="deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
            <Input label="Harga" type="number" name="harga" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} required />
            <Input label="Stok" type="number" name="stok" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} required />
            <Select label="Kategori" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nama}</option>
              ))}
            </Select>
            <FileInput
              label="Gambar Produk (max 5MB, JPG/PNG/WEBP)"
              onChange={(files) => setForm({ ...form, gambar: files })}
              multiple
              accept="image/jpeg,image/png,image/webp"
            />
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {submitLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* === EDIT MODAL === */}
      {isEditOpen && selectedProduct && (
        <Modal title="Edit Produk" onClose={() => setIsEditOpen(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input label="Nama Produk" name="nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            <Textarea label="Deskripsi" name="deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
            <Input label="Harga" type="number" name="harga" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} />
            <Input label="Stok" type="number" name="stok" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} />
            <Select label="Kategori" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nama}</option>
              ))}
            </Select>

            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Saat Ini</label>
                <div className="flex gap-2 flex-wrap">
                  {existingImages.map((url, i) => (
                    <img key={i} src={getImageUrl(url)} alt={`Gambar ${i + 1}`} className="h-20 w-20 object-cover rounded-md border" />
                  ))}
                </div>
              </div>
            )}

            <FileInput
              label="Tambah Gambar Baru (opsional)"
              onChange={(files) => setForm({ ...form, gambar: files })}
              multiple
              accept="image/jpeg,image/png,image/webp"
            />

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {submitLoading ? 'Memperbarui...' : 'Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* === DELETE MODAL === */}
      {isDeleteOpen && selectedProduct && (
        <Modal title="Hapus Produk?" onClose={() => setIsDeleteOpen(false)}>
          <p className="text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus produk <strong>{selectedProduct.nama}</strong>?
            <br />
            <span className="text-sm text-red-500">Tindakan ini tidak dapat dibatalkan.</span>
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Batal
            </button>
            <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2">
              Hapus
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// === REUSABLE COMPONENTS ===
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        {...props}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
}

function FileInput({ label, onChange, ...props }: { label: string; onChange: (files: File[]) => void } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <input
          type="file"
          {...props}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.some(f => f.size > 5 * 1024 * 1024)) {
              alert('File terlalu besar! Maksimal 5MB.');
              return;
            }
            onChange(files);
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
    </div>
  );
}