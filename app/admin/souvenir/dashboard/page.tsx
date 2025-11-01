"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, RefreshCw, Moon, Sun, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  nama: string;
  slug: string;
  deskripsi: string;
  created_at: string;
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

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  avgPrice: number;
  productsWithImage: number;
  productsWithoutImage: number;
  newestProduct: Product | null;
  oldestProduct: Product | null;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export default function DashboardSouvenirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low' | 'empty'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [dateRange, setDateRange] = useState<'all' | 'last30' | 'last90' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Table
  const [sortBy, setSortBy] = useState<'nama' | 'harga' | 'stok' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

  // === FETCH DATA ===
  const fetchData = useCallback(async () => {
    if (!token) {
      setError('Silakan login terlebih dahulu.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:8080/api/products?limit=1000', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:8080/api/categories', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!prodRes.ok || !catRes.ok) throw new Error('Gagal memuat data');

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData.data || []);
      setCategories(catData.data || []);
    } catch (err) {
      setError('Gagal memuat dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto Refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // === FILTERED PRODUCTS ===
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search
    if (search) {
      filtered = filtered.filter(p =>
        p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.deskripsi.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === Number(selectedCategory));
    }

    // Stock
    if (stockFilter === 'in-stock') filtered = filtered.filter(p => p.stok > 0);
    if (stockFilter === 'low') filtered = filtered.filter(p => p.stok > 0 && p.stok <= 10);
    if (stockFilter === 'empty') filtered = filtered.filter(p => p.stok === 0);

    // Price
    filtered = filtered.filter(p => p.harga >= priceRange[0] && p.harga <= priceRange[1]);

    // Date Range
    if (dateRange === 'last30') {
      const threshold = subMonths(new Date(), 1);
      filtered = filtered.filter(p => new Date(p.created_at) >= threshold);
    } else if (dateRange === 'last90') {
      const threshold = subMonths(new Date(), 3);
      filtered = filtered.filter(p => new Date(p.created_at) >= threshold);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      filtered = filtered.filter(p => {
        const date = new Date(p.created_at);
        return isWithinInterval(date, { start, end });
      });
    }

    return filtered;
  }, [products, search, selectedCategory, stockFilter, priceRange, dateRange, customStart, customEnd]);

  // === STATS ===
  const stats: Stats = useMemo(() => {
    const withImage = filteredProducts.filter(p => p.gambar && p.gambar.trim() !== '').length;
    const sortedByDate = [...filteredProducts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      totalProducts: filteredProducts.length,
      totalCategories: categories.length,
      totalStock: filteredProducts.reduce((sum, p) => sum + p.stok, 0),
      avgPrice: filteredProducts.length > 0
        ? Math.round(filteredProducts.reduce((sum, p) => sum + p.harga, 0) / filteredProducts.length)
        : 0,
      productsWithImage: withImage,
      productsWithoutImage: filteredProducts.length - withImage,
      newestProduct: sortedByDate[sortedByDate.length - 1] || null,
      oldestProduct: sortedByDate[0] || null,
    };
  }, [filteredProducts, categories]);

  // === CHART DATA ===
  const productsByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredProducts.forEach(p => {
      const name = p.category?.nama || 'Uncategorized';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredProducts]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    filteredProducts.forEach(p => {
      const month = format(new Date(p.created_at), 'MMM yyyy');
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, count]) => ({ month, count }));
  }, [filteredProducts]);

  const stockHeatmap = useMemo(() => {
    return categories.map(cat => {
      const prods = filteredProducts.filter(p => p.category_id === cat.id);
      const totalStock = prods.reduce((sum, p) => sum + p.stok, 0);
      const avgStock = prods.length > 0 ? totalStock / prods.length : 0;
      return { name: cat.nama, total: totalStock, avg: Math.round(avgStock), count: prods.length };
    }).filter(h => h.count > 0);
  }, [categories, filteredProducts]);

  // === SORTED & PAGINATED TABLE ===
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortBy === 'created_at') {
        return sortOrder === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [filteredProducts, sortBy, sortOrder]);

  const paginatedProducts = sortedProducts.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(sortedProducts.length / limit);

  // === EXPORT CSV ===
  const exportCSV = () => {
    const headers = ['ID', 'Nama', 'Kategori', 'Harga', 'Stok', 'Gambar', 'Dibuat'];
    const rows = sortedProducts.map(p => [
      p.id,
      p.nama,
      p.category?.nama || '-',
      p.harga,
      p.stok,
      p.gambar ? 'Ada' : 'Tidak',
      format(new Date(p.created_at), 'dd/MM/yyyy'),
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-souvenir-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <span className="ml-3 text-lg">Memuat Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <strong>Error:</strong> {error}
          {error.includes('login') && <Link href="/login" className="underline ml-2">Login ulang</Link>}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors`}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Souvenir</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Analisis mendalam produk & kategori • Terakhir diperbarui: {format(new Date(), 'HH:mm')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg ${autoRefresh ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              title="Auto Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 text-gray-700"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Produk', value: stats.totalProducts, color: 'blue' },
            { label: 'Kategori', value: stats.totalCategories, color: 'green' },
            { label: 'Total Stok', value: stats.totalStock.toLocaleString(), color: 'purple' },
            { label: 'Rata-rata Harga', value: `Rp ${stats.avgPrice.toLocaleString()}`, color: 'yellow' },
          ].map((s, i) => (
            <div key={i} className={`p-5 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className="text-sm opacity-70">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nama}</option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
            >
              <option value="all">Semua Stok</option>
              <option value="in-stock">Ada Stok</option>
              <option value="low">Stok Rendah (≤10)</option>
              <option value="empty">Habis</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
              />
              <span className="text-sm">—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
              />
            </div>
            <button
              onClick={() => {
                setSearch(''); setSelectedCategory('all'); setStockFilter('all'); setPriceRange([0, 1000000]); setDateRange('all');
                setCustomStart(''); setCustomEnd('');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Distribusi Produk per Kategori</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={productsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {productsByCategory.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Tren Penambahan Produk</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap Stok */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold mb-4">Heatmap Stok per Kategori</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockHeatmap.map((h, i) => (
              <div key={i} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${h.avg > 50 ? 'bg-green-100' : h.avg > 20 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <p className="font-medium">{h.name}</p>
                <p className="text-sm">Total Stok: <strong>{h.total}</strong></p>
                <p className="text-sm">Rata-rata: <strong>{h.avg}</strong></p>
                <p className="text-xs opacity-70">{h.count} produk</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Daftar Produk (Detail)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {['nama', 'harga', 'stok', 'created_at'].map(col => (
                    <th
                      key={col}
                      onClick={() => {
                        setSortBy(col as any);
                        setSortOrder(sortBy === col ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc');
                      }}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      {col === 'nama' ? 'Nama' : col === 'harga' ? 'Harga' : col === 'stok' ? 'Stok' : 'Dibuat'}
                      {sortBy === col && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Gambar</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.nama}</td>
                    <td className="px-4 py-3 text-sm">Rp {p.harga.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${p.stok > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.stok}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{format(new Date(p.created_at), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3 text-sm">{p.category?.nama || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {p.gambar ? 'Ada' : 'Tidak'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <p className="text-sm">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-gray-200 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-gray-200 disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}