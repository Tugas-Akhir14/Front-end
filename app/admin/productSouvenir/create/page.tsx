// app/admin/productSouvenir/create/page.tsx
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Category {
  id: number;
  nama: string;
  slug?: string;
}

interface ProductCreate {
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: File[];
  category_id: number;
}

interface ApiError {
  error: string;
}

export default function CreateProductPage() {
  const router = useRouter();

  // State Form
  const [form, setForm] = useState<ProductCreate>({
    nama: '',
    deskripsi: '',
    harga: 0,
    stok: 0,
    gambar: [],
    category_id: 0,
  });

  // State Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // State Loading & Error
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8080/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Gagal mengambil kategori');
      
      const data = await res.json();
      setCategories(data.data || data); // adjust based on API response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'harga') {
      setForm({ ...form, [name]: parseFloat(value) || 0 });
    } else if (name === 'stok') {
      setForm({ ...form, [name]: parseInt(value) || 0 });
    } else if (name === 'category_id') {
      setForm({ ...form, [name]: parseInt(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, gambar: Array.from(e.target.files) });
    }
  };

  // Validation
  const validateForm = (): boolean => {
    if (!form.nama.trim()) return false;
    if (form.harga <= 0) return false;
    if (form.stok < 0) return false;
    if (form.category_id === 0) return false;
    return true;
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Mohon lengkapi semua field wajib (*)');
      return;
    }

    setSubmitLoading(true);
    setError(null);

    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Token tidak ditemukan. Login ulang.');
      setSubmitLoading(false);
      return;
    }

    try {
      // Create FormData untuk multipart/form-data
      const formData = new FormData();
      formData.append('nama', form.nama);
      formData.append('deskripsi', form.deskripsi);
      formData.append('harga', form.harga.toString());
      formData.append('stok', form.stok.toString());
      formData.append('category_id', form.category_id.toString());

      // Upload multiple gambar
      form.gambar.forEach((file) => {
        formData.append('gambar', file);
      });

      const res = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // No Content-Type, browser set otomatis
      });

      if (!res.ok) {
        const errorData: ApiError = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      setSuccess(true);
      
      // Reset form
      setForm({
        nama: '',
        deskripsi: '',
        harga: 0,
        stok: 0,
        gambar: [],
        category_id: 0,
      });
      
      // Auto redirect after 2s
      setTimeout(() => {
        router.push('/admin/productSouvenir');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat produk');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <strong>✅ Produk berhasil dibuat!</strong>
          <br />Sedang mengarahkan ke daftar produk...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tambah Produk Souvenir</h1>
          <p className="text-gray-600 mt-1">Isi form di bawah untuk menambah produk baru</p>
        </div>
        <Link
          href="/admin/productSouvenir"
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          ← Kembali
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Nama Produk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Kaos Bali Motif Barong"
            required
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
          <textarea
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Deskripsi produk..."
          />
        </div>

        {/* Harga & Stok */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="harga"
              value={form.harga || ''}
              onChange={handleInputChange}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stok <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stok"
              value={form.stok || ''}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50"
              required
            />
          </div>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori <span className="text-red-500">*</span>
          </label>
          {loading ? (
            <div className="text-gray-500">Memuat kategori...</div>
          ) : (
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>Pilih Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nama}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gambar (Upload multiple)
          </label>
          <input
            type="file"
            name="gambar"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {form.gambar.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.gambar.map((file, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/admin/productSouvenir"
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitLoading || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {submitLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              'Simpan Produk'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}