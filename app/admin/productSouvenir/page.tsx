// app/admin/productSouvenir/page.tsx
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8080/api/products?page=${page}&limit=${limit}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            setError('Token tidak valid atau kadaluarsa. Silakan login ulang.');
            sessionStorage.removeItem('token');
          } else {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
          }
          return;
        }

        const result: ApiResponse = await res.json();
        console.log("Products:", result.data); // DEBUG
        setProducts(result.data);
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  // Helper: Konversi relative → full URL
  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) return `http://localhost:8080${path}`;
    return `http://localhost:8080/uploads/${path}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Produk Souvenir</h1>
        <Link
          href="/admin/productSouvenir/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Tambah Produk
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          {error.includes('login ulang') && (
            <Link href="/login" className="underline ml-2">Login di sini</Link>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat produk...</p>
        </div>
      )}

      {!loading && !error && (
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
                      ? product.gambar
                          .split(',')
                          .map(url => getImageUrl(url.trim()))
                          .filter(Boolean)
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
                                  onError={(e) => {
                                    console.error("Failed to load:", url);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  loading="lazy"
                                />
                              ))}
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
                          <Link href={`/admin/productSouvenir/${product.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                          <Link href={`/admin/productSouvenir/${product.id}?delete=true`} className="text-red-600 hover:text-red-900">Hapus</Link>
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
    </div>
  );
}