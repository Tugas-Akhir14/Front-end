"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, Tag, Coffee, AlertTriangle, Download, RefreshCw, Moon, Sun, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// === AXIOS WITH TOKEN ===
const api = axios.create({ baseURL: 'http://localhost:8080' });
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// === INTERFACES ===
interface Category { id: number; nama: string; }
interface Product {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  gambar?: string;
  created_at: string;
  category: Category;
}

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  avgPrice: number;
  withImage: number;
  lowStock: number;
  outOfStock: number;
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export default function DashboardCafePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'empty'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Table
  const [sortBy, setSortBy] = useState<'harga' | 'stok' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // === FETCH DATA ===
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/api/cafe-products'),
        api.get('/api/cafe-categories'),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // === FILTERED PRODUCTS ===
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (search) {
      filtered = filtered.filter(p =>
        p.nama.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.id === Number(selectedCategory));
    }
    if (stockFilter === 'in') filtered = filtered.filter(p => p.stok > 0);
    if (stockFilter === 'low') filtered = filtered.filter(p => p.stok > 0 && p.stok <= 10);
    if (stockFilter === 'empty') filtered = filtered.filter(p => p.stok === 0);
    filtered = filtered.filter(p => p.harga >= priceRange[0] && p.harga <= priceRange[1]);

    if (dateRange === '30d') {
      const threshold = subMonths(new Date(), 1);
      filtered = filtered.filter(p => new Date(p.created_at) >= threshold);
    } else if (dateRange === '90d') {
      const threshold = subMonths(new Date(), 3);
      filtered = filtered.filter(p => new Date(p.created_at) >= threshold);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      filtered = filtered.filter(p => isWithinInterval(new Date(p.created_at), { start, end }));
    }

    return filtered;
  }, [products, search, selectedCategory, stockFilter, priceRange, dateRange, customStart, customEnd]);

  // === STATS ===
  const stats: Stats = useMemo(() => {
    const withImage = filteredProducts.filter(p => p.gambar && p.gambar.trim() !== '').length;
    return {
      totalProducts: filteredProducts.length,
      totalCategories: categories.length,
      totalStock: filteredProducts.reduce((s, p) => s + p.stok, 0),
      avgPrice: filteredProducts.length > 0
        ? Math.round(filteredProducts.reduce((s, p) => s + p.harga, 0) / filteredProducts.length)
        : 0,
      withImage,
      lowStock: filteredProducts.filter(p => p.stok > 0 && p.stok <= 10).length,
      outOfStock: filteredProducts.filter(p => p.stok === 0).length,
    };
  }, [filteredProducts, categories]);

  // === CHART DATA ===
  const productsByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredProducts.forEach(p => {
      const name = p.category.nama || 'Lainnya';
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
      const prods = filteredProducts.filter(p => p.category.id === cat.id);
      const total = prods.reduce((s, p) => s + p.stok, 0);
      const avg = prods.length > 0 ? total / prods.length : 0;
      return { name: cat.nama, total, avg: Math.round(avg), count: prods.length };
    }).filter(h => h.count > 0);
  }, [categories, filteredProducts]);

  const topExpensive = useMemo(() => {
    return [...filteredProducts].sort((a, b) => b.harga - a.harga).slice(0, 5);
  }, [filteredProducts]);

  const topCheapest = useMemo(() => {
    return [...filteredProducts].sort((a, b) => a.harga - b.harga).slice(0, 5);
  }, [filteredProducts]);

  // === SORTED & PAGINATED ===
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aVal = a[sortBy], bVal = b[sortBy];
      if (sortBy === 'created_at') {
        return sortOrder === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [filteredProducts, sortBy, sortOrder]);

  const paginated = sortedProducts.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(sortedProducts.length / limit);

  // === EXPORT CSV ===
  const exportCSV = () => {
    const headers = ['ID', 'Nama', 'Kategori', 'Harga', 'Stok', 'Gambar', 'Dibuat'];
    const rows = sortedProducts.map(p => [
      p.id, p.nama, p.category.nama, p.harga, p.stok,
      p.gambar ? 'Ada' : 'Tidak',
      format(new Date(p.created_at), 'dd/MM/yyyy')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cafe-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading && products.length === 0) {
    return <LoadingSkeleton darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors`}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Coffee className="w-8 h-8 text-amber-600" />
              Dashboard Cafe
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Analisis produk & kategori • Terakhir: {format(new Date(), 'HH:mm')}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={`p-2 rounded-lg ${autoRefresh ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-gray-200">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Produk', value: stats.totalProducts, icon: Package, color: 'blue' },
            { label: 'Kategori', value: stats.totalCategories, icon: Tag, color: 'green' },
            { label: 'Total Stok', value: stats.totalStock.toLocaleString(), icon: Package, color: 'purple' },
            { label: 'Rata-rata Harga', value: `Rp ${stats.avgPrice.toLocaleString()}`, icon: Coffee, color: 'amber' },
          ].map((s, i) => (
            <div key={i} className={`p-5 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${s.color}-100`}>
                  <s.icon className={`w-6 h-6 text-${s.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
              <option value="all">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
            <select value={stockFilter} onChange={e => setStockFilter(e.target.value as any)}
              className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
              <option value="all">Semua Stok</option>
              <option value="in">Ada Stok</option>
              <option value="low">Stok Rendah</option>
              <option value="empty">Habis</option>
            </select>
            <button onClick={() => { setSearch(''); setSelectedCategory('all'); setStockFilter('all'); setPriceRange([0, 500000]); setDateRange('all'); }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Reset</button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Distribusi Kategori</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={productsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {productsByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap & Top */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Heatmap Stok per Kategori</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stockHeatmap.map((h, i) => (
                <div key={i} className={`p-3 rounded-lg border ${h.avg > 50 ? 'bg-green-100' : h.avg > 20 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-sm">Stok: <strong>{h.total}</strong> (rata-rata {h.avg})</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Top 5 Termahal</h3>
            <div className="space-y-2">
              {topExpensive.map((p, i) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="font-medium truncate">{i + 1}. {p.nama}</span>
                  <span className="text-amber-600 font-semibold">Rp {p.harga.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Daftar Produk</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {['nama', 'harga', 'stok', 'created_at'].map(col => (
                    <th key={col} onClick={() => { setSortBy(col as any); setSortOrder(sortBy === col ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc'); }}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      {col === 'nama' ? 'Nama' : col === 'harga' ? 'Harga' : col === 'stok' ? 'Stok' : 'Dibuat'}
                      {sortBy === col && (sortOrder === 'asc' ? ' up' : ' down')}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginated.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.nama}</td>
                    <td className="px-4 py-3 text-sm">Rp {p.harga.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${p.stok > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.stok}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{format(new Date(p.created_at), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3 text-sm">{p.category.nama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex justify-between border-t">
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

// === LOADING SKELETON ===
function LoadingSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-300 rounded w-64"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-gray-300 rounded-xl"></div>
          <div className="h-64 bg-gray-300 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}