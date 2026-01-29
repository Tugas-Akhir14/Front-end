// app/admin/dashboardBook/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryBook {
  id: number;
  nama: string;
}

interface ProductBook {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  category_id: number;
  category: CategoryBook;
}

interface SummaryData {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  outOfStock: number;
}

interface ChartData {
  name: string;
  jumlah: number;
  nilai: number;
}

export default function DashboardBookPage() {
  const [summary, setSummary] = useState<SummaryData>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    outOfStock: 0,
  });

  const [products, setProducts] = useState<ProductBook[]>([]);
  const [categories, setCategories] = useState<CategoryBook[]>([]);
  const [chartByCategory, setChartByCategory] = useState<ChartData[]>([]);
  const [chartStockStatus, setChartStockStatus] = useState<ChartData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const API_BOOKS = 'http://localhost:8080/api/books';
  const API_CATEGORIES = 'http://localhost:8080/api/book-categories';

  // === FETCH DATA ===
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Token tidak ditemukan. Silakan login ulang.');
      setLoading(false);
      return;
    }

    try {
      // Fetch products
      const resProducts = await fetch(API_BOOKS, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!resProducts.ok) throw new Error('Gagal memuat produk');
      const productsData = await resProducts.json();
      const productsList: ProductBook[] = Array.isArray(productsData) ? productsData : productsData.data || [];
      setProducts(productsList);

      // Fetch categories
      const resCategories = await fetch(API_CATEGORIES, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!resCategories.ok) throw new Error('Gagal memuat kategori');
      const categoriesData = await resCategories.json();
      const categoriesList: CategoryBook[] = Array.isArray(categoriesData) ? categoriesData : categoriesData.data || [];
      setCategories(categoriesList);

      // === HITUNG SUMMARY ===
      const totalProducts = productsList.length;
      const totalStock = productsList.reduce((sum, p) => sum + p.stok, 0);
      const totalValue = productsList.reduce((sum, p) => sum + (p.harga * p.stok), 0);
      const outOfStock = productsList.filter(p => p.stok === 0).length;

      setSummary({ totalProducts, totalStock, totalValue, outOfStock });

      // === CHART: Produk per Kategori ===
      const categoryMap = new Map<number, { jumlah: number; nilai: number }>();
      productsList.forEach(p => {
        const catId = p.category_id;
        const current = categoryMap.get(catId) || { jumlah: 0, nilai: 0 };
        categoryMap.set(catId, {
          jumlah: current.jumlah + 1,
          nilai: current.nilai + (p.harga * p.stok),
        });
      });

      const chartCategoryData: ChartData[] = categoriesList
        .map(cat => {
          const stats = categoryMap.get(cat.id) || { jumlah: 0, nilai: 0 };
          return {
            name: cat.nama,
            jumlah: stats.jumlah,
            nilai: Math.round(stats.nilai),
          };
        })
        .filter(item => item.jumlah > 0)
        .sort((a, b) => b.jumlah - a.jumlah);

      setChartByCategory(chartCategoryData);

      // === CHART: Status Stok ===
      const inStock = productsList.filter(p => p.stok > 0).length;
      const lowStock = productsList.filter(p => p.stok > 0 && p.stok <= 5).length;
      const outOfStockCount = productsList.filter(p => p.stok === 0).length;

      setChartStockStatus([
  { name: 'Tersedia', jumlah: inStock, nilai: inStock },
  { name: 'Stok Rendah', jumlah: lowStock, nilai: lowStock },
  { name: 'Habis', jumlah: outOfStockCount, nilai: outOfStockCount },
]);


    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Buku</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* === CARD SUMMARY === */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Buku</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalProducts}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.668 5.477 15.254 5 17 5s3.332.477 4.5 1.253v13C20.332 18.477 18.746 18 17 18s-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stok</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalStock.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nilai Stok</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(summary.totalValue)}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stok Habis</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{summary.outOfStock}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* === CHARTS === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Produk per Kategori */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Buku per Kategori</h3>
              {chartByCategory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Belum ada data buku</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => 
                        name === 'jumlah' ? value : formatRupiah(value)
                      }
                    />
                    <Legend />
                    <Bar dataKey="jumlah" fill="#3B82F6" name="Jumlah Buku" />
                    <Bar dataKey="nilai" fill="#10B981" name="Nilai Stok" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 2: Status Stok */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Ketersediaan Stok</h3>
              {chartStockStatus.filter(d => d.jumlah > 0).length === 0 ? (
                <p className="text-center text-gray-500 py-8">Semua stok tersedia</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartStockStatus.filter(d => d.jumlah > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jumlah" fill="#8B5CF6" name="Jumlah Buku" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* === TABEL RINGKASAN STOK RENDAH === */}
          {products.some(p => p.stok <= 5 && p.stok > 0) && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Stok Rendah (≤5)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buku</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products
                      .filter(p => p.stok <= 5 && p.stok > 0)
                      .sort((a, b) => a.stok - b.stok)
                      .map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.nama}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{p.category?.nama || '-'}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {p.stok}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">Rp {p.harga.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}