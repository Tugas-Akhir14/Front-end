// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, Coffee, Bed, Gift, Image, Newspaper, Download, RefreshCw, Moon, Sun, Search, ChevronLeft, ChevronRight, AlertTriangle, Tag, Filter } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

// === AXIOS ===
const api = axios.create({ baseURL: 'http://localhost:8080' });
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function UnifiedDashboard() {
  const [tab, setTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === DATA STATES ===
  const [books, setBooks] = useState<any[]>([]);
  const [bookCategories, setBookCategories] = useState<any[]>([]);
  const [cafeProducts, setCafeProducts] = useState<any[]>([]);
  const [cafeCategories, setCafeCategories] = useState<any[]>([]);
  const [souvenirProducts, setSouvenirProducts] = useState<any[]>([]);
  const [souvenirCategories, setSouvenirCategories] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  // === FILTERS (Cafe & Souvenir) ===
  const [searchCafe, setSearchCafe] = useState('');
  const [selectedCafeCat, setSelectedCafeCat] = useState('all');
  const [stockFilterCafe, setStockFilterCafe] = useState<'all' | 'in' | 'low' | 'empty'>('all');
  const [priceRangeCafe, setPriceRangeCafe] = useState<[number, number]>([0, 500000]);
  const [dateRangeCafe, setDateRangeCafe] = useState<'all' | '30d' | '90d' | 'custom'>('all');
  const [customStartCafe, setCustomStartCafe] = useState('');
  const [customEndCafe, setCustomEndCafe] = useState('');
  const [sortByCafe, setSortByCafe] = useState<'harga' | 'stok' | 'created_at'>('created_at');
  const [sortOrderCafe, setSortOrderCafe] = useState<'asc' | 'desc'>('desc');
  const [pageCafe, setPageCafe] = useState(1);

  const [searchSouvenir, setSearchSouvenir] = useState('');
  const [selectedSouvenirCat, setSelectedSouvenirCat] = useState('all');
  const [stockFilterSouvenir, setStockFilterSouvenir] = useState<'all' | 'in-stock' | 'low' | 'empty'>('all');
  const [priceRangeSouvenir, setPriceRangeSouvenir] = useState<[number, number]>([0, 1000000]);
  const [dateRangeSouvenir, setDateRangeSouvenir] = useState<'all' | 'last30' | 'last90' | 'custom'>('all');
  const [customStartSouvenir, setCustomStartSouvenir] = useState('');
  const [customEndSouvenir, setCustomEndSouvenir] = useState('');
  const [sortBySouvenir, setSortBySouvenir] = useState<'nama' | 'harga' | 'stok' | 'created_at'>('created_at');
  const [sortOrderSouvenir, setSortOrderSouvenir] = useState<'asc' | 'desc'>('desc');
  const [pageSouvenir, setPageSouvenir] = useState(1);

  const limit = 10;

  // === FETCH ALL DATA ===
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        bRes, bcRes, cRes, ccRes, sRes, scRes, rRes, gRes, nRes
      ] = await Promise.all([
        api.get('/api/books'),
        api.get('/api/book-categories'),
        api.get('/api/cafe-products'),
        api.get('/api/cafe-categories'),
        api.get('/api/products?limit=1000'),
        api.get('/api/categories'),
        api.get('/api/rooms?limit=1000'),
        api.get('/api/galleries?limit=1000'),
        api.get('/api/news?limit=1000')
      ]);

      setBooks(bRes.data.data || []);
      setBookCategories(bcRes.data.data || []);
      setCafeProducts(cRes.data || []);
      setCafeCategories(ccRes.data || []);
      setSouvenirProducts(sRes.data.data || []);
      setSouvenirCategories(scRes.data.data || []);
      setRooms(rRes.data.data || []);
      setGalleries(gRes.data.data || []);
      setNews(nRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data. Pastikan backend aktif.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (!autoRefresh) return;
    const int = setInterval(fetchAll, 30000);
    return () => clearInterval(int);
  }, [autoRefresh, fetchAll]);

  // === FORMATTER ===
  const formatRupiah = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

  // === OVERVIEW ===
  const overview = useMemo(() => {
    const totalProducts = books.length + cafeProducts.length + souvenirProducts.length;
    const totalStock = [...books, ...cafeProducts, ...souvenirProducts].reduce((s, p) => s + (p.stok || 0), 0);
    const totalValue = books.reduce((s, p) => s + p.harga * p.stok, 0);
    const outOfStock = [...books, ...cafeProducts, ...souvenirProducts].filter(p => p.stok === 0).length;
    return { totalProducts, totalStock, totalValue, outOfStock, rooms: rooms.length, galleries: galleries.length, news: news.length };
  }, [books, cafeProducts, souvenirProducts, rooms, galleries, news]);

  // === BOOK CHARTS ===
  const bookChartCategory = useMemo(() => {
    const map = new Map();
    books.forEach(b => {
      const cur = map.get(b.category_id) || { jumlah: 0, nilai: 0 };
      map.set(b.category_id, { jumlah: cur.jumlah + 1, nilai: cur.nilai + b.harga * b.stok });
    });
    return bookCategories
      .map(cat => ({
        name: cat.nama,
        jumlah: map.get(cat.id)?.jumlah || 0,
        nilai: Math.round(map.get(cat.id)?.nilai || 0)
      }))
      .filter(c => c.jumlah > 0)
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [books, bookCategories]);

  const bookStockStatus = useMemo(() => {
    const inStock = books.filter(b => b.stok > 0).length;
    const low = books.filter(b => b.stok > 0 && b.stok <= 5).length;
    const out = books.filter(b => b.stok === 0).length;
    return [
      { name: 'Tersedia', jumlah: inStock },
      { name: 'Stok Rendah', jumlah: low },
      { name: 'Habis', jumlah: out }
    ].filter(d => d.jumlah > 0);
  }, [books]);

  // === CAFE FILTERED & PAGINATED ===
  const filteredCafe = useMemo(() => {
    let filtered = cafeProducts;
    if (searchCafe) filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchCafe.toLowerCase()));
    if (selectedCafeCat !== 'all') filtered = filtered.filter(p => p.category?.id === Number(selectedCafeCat));
    if (stockFilterCafe === 'in') filtered = filtered.filter(p => p.stok > 0);
    if (stockFilterCafe === 'low') filtered = filtered.filter(p => p.stok > 0 && p.stok <= 10);
    if (stockFilterCafe === 'empty') filtered = filtered.filter(p => p.stok === 0);
    filtered = filtered.filter(p => p.harga >= priceRangeCafe[0] && p.harga <= priceRangeCafe[1]);
    if (dateRangeCafe === '30d') {
      const threshold = subMonths(new Date(), 1);
      filtered = filtered.filter(p => new Date(p.created_at) >= threshold);
    } else if (dateRangeCafe === '90d') {
      const threshold = subMonths(new Date(), 3);
      filtered = filtered.filter(p => new Date(p.created_at) >= threshold);
    } else if (dateRangeCafe === 'custom' && customStartCafe && customEndCafe) {
      const start = new Date(customStartCafe);
      const end = new Date(customEndCafe);
      filtered = filtered.filter(p => isWithinInterval(new Date(p.created_at), { start, end }));
    }
    return filtered;
  }, [cafeProducts, searchCafe, selectedCafeCat, stockFilterCafe, priceRangeCafe, dateRangeCafe, customStartCafe, customEndCafe]);

  const sortedCafe = useMemo(() => {
    return [...filteredCafe].sort((a, b) => {
      const aVal = a[sortByCafe], bVal = b[sortByCafe];
      if (sortByCafe === 'created_at') {
        return sortOrderCafe === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }
      return sortOrderCafe === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [filteredCafe, sortByCafe, sortOrderCafe]);

  const paginatedCafe = sortedCafe.slice((pageCafe - 1) * limit, pageCafe * limit);
  const totalPagesCafe = Math.ceil(sortedCafe.length / limit);

  // === SOUVENIR FILTERED & PAGINATED ===
  const filteredSouvenir = useMemo(() => {
    let filtered = souvenirProducts;
    if (searchSouvenir) {
      filtered = filtered.filter(p =>
        p.nama.toLowerCase().includes(searchSouvenir.toLowerCase()) ||
        p.deskripsi?.toLowerCase().includes(searchSouvenir.toLowerCase())
      );
    }
    if (selectedSouvenirCat !== 'all') filtered = filtered.filter(p => p.category_id === Number(selectedSouvenirCat));
    if (stockFilterSouvenir === 'in-stock') filtered = filtered.filter(p => p.stok > 0);
    if (stockFilterSouvenir === 'low') filtered = filtered.filter(p => p.stok > 0 && p.stok <= 10);
    if (stockFilterSouvenir === 'empty') filtered = filtered.filter(p => p.stok === 0);
    filtered = filtered.filter(p => p.harga >= priceRangeSouvenir[0] && p.harga <= priceRangeSouvenir[1]);
    if (dateRangeSouvenir === 'last30') {
      const threshold = subMonths(new Date(), 1);
      filtered = filtered.filter(p => new Date(p.created_at) >= threshold);
    } else if (dateRangeSouvenir === 'last90') {
      const threshold = subMonths(new Date(), 3);
      filtered = filtered.filter(p => new Date(p.created_at) >= threshold);
    } else if (dateRangeSouvenir === 'custom' && customStartSouvenir && customEndSouvenir) {
      const start = new Date(customStartSouvenir);
      const end = new Date(customEndSouvenir);
      filtered = filtered.filter(p => isWithinInterval(new Date(p.created_at), { start, end }));
    }
    return filtered;
  }, [souvenirProducts, searchSouvenir, selectedSouvenirCat, stockFilterSouvenir, priceRangeSouvenir, dateRangeSouvenir, customStartSouvenir, customEndSouvenir]);

  const sortedSouvenir = useMemo(() => {
    return [...filteredSouvenir].sort((a, b) => {
      const aVal = a[sortBySouvenir], bVal = b[sortBySouvenir];
      if (sortBySouvenir === 'created_at') {
        return sortOrderSouvenir === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }
      return sortOrderSouvenir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [filteredSouvenir, sortBySouvenir, sortOrderSouvenir]);

  const paginatedSouvenir = sortedSouvenir.slice((pageSouvenir - 1) * limit, pageSouvenir * limit);
  const totalPagesSouvenir = Math.ceil(sortedSouvenir.length / limit);

  // === HOTEL CHARTS ===
  const roomPieData = useMemo(() => {
    const typeCount = rooms.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      fill: ['#3b82f6', '#10b981', '#f59e0b'][Object.keys(typeCount).indexOf(type) % 3] || '#94a3b8'
    }));
  }, [rooms]);

  const newsStatusData = useMemo(() => {
    const statusCount = news.reduce((acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [
      { name: 'Published', value: statusCount['published'] || 0, fill: '#10b981' },
      { name: 'Draft', value: statusCount['draft'] || 0, fill: '#94a3b8' }
    ];
  }, [news]);

  const monthlyActivity = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        name: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d),
        room: 0,
        gallery: 0,
        news: 0
      };
    }).reverse();
    const countByMonth = (items: any[], key: string) => {
      items.forEach(item => {
        const date = new Date(item.created_at);
        const monthKey = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date);
        const month = months.find(m => m.name === monthKey);
        if (month) month[key]++;
      });
    };
    countByMonth(rooms, "room");
    countByMonth(galleries, "gallery");
    countByMonth(news, "news");
    return months;
  }, [rooms, galleries, news]);

  const recent = <T extends { updated_at: string }>(items: T[], n = 5) =>
    [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, n);

  // === EXPORT CSV ===
  const exportCSV = (data: any[], name: string) => {
    const headers = ['ID', 'Nama', 'Kategori', 'Harga', 'Stok', 'Dibuat'];
    const rows = data.map(p => [
      p.id, p.nama, p.category?.nama || '-', p.harga, p.stok,
      p.created_at ? format(new Date(p.created_at), 'dd/MM/yyyy') : '-'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  // === LOADING & ERROR ===
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-lg">Memuat semua dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Terpadu</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Buku • Cafe • Hotel • Souvenir • Terakhir: {format(new Date(), 'HH:mm')}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={`p-2 rounded-lg ${autoRefresh ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-gray-200">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b">
          {[
            { key: 'overview', label: 'Ringkasan' },
            { key: 'book', label: 'Buku' },
            { key: 'cafe', label: 'Cafe' },
            { key: 'hotel', label: 'Hotel' },
            { key: 'souvenir', label: 'Souvenir' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 font-medium whitespace-nowrap ${tab === t.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>  
        
        {/* === OVERVIEW === */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Produk', value: overview.totalProducts, icon: Package, color: 'blue' },
                { label: 'Total Stok', value: overview.totalStock.toLocaleString(), icon: Package, color: 'green' },
                { label: 'Nilai Stok (Buku)', value: formatRupiah(overview.totalValue), icon: Coffee, color: 'yellow' },
                { label: 'Kamar Tersedia', value: overview.rooms, icon: Bed, color: 'purple' },
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
          </div>
        )}

        {/* === BOOK TAB === */}
        {tab === 'book' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Buku</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Buku', value: books.length },
                { label: 'Total Stok', value: books.reduce((s, b) => s + b.stok, 0).toLocaleString() },
                { label: 'Nilai Stok', value: formatRupiah(books.reduce((s, b) => s + b.harga * b.stok, 0)) },
                { label: 'Stok Habis', value: books.filter(b => b.stok === 0).length, color: 'text-red-600' },
              ].map((k, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-gray-600">{k.label}</p>
                  <p className={`text-2xl font-bold ${k.color || 'text-gray-900'}`}>{k.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Distribusi Buku per Kategori</h3>
                {bookChartCategory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Belum ada data buku</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookChartCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(v: any, n) => n === 'nilai' ? formatRupiah(v) : v} />
                      <Legend />
                      <Bar dataKey="jumlah" fill="#3B82F6" name="Jumlah Buku" />
                      <Bar dataKey="nilai" fill="#10B981" name="Nilai Stok" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Status Ketersediaan Stok</h3>
                {bookStockStatus.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Semua stok tersedia</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookStockStatus}>
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
            {books.some(b => b.stok > 0 && b.stok <= 5) && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Stok Rendah (≤5)</h3>
                </div>
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buku</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.filter(b => b.stok > 0 && b.stok <= 5).sort((a, b) => a.stok - b.stok).map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{b.nama}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{b.category?.nama || '-'}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">{b.stok}</span></td>
                        <td className="px-6 py-4 text-sm">Rp {b.harga.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* === CAFE TAB === */}
        {tab === 'cafe' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dashboard Cafe</h2>
              <button onClick={() => exportCSV(cafeProducts, 'cafe')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Produk', value: cafeProducts.length },
                { label: 'Kategori', value: cafeCategories.length },
                { label: 'Total Stok', value: cafeProducts.reduce((s, p) => s + p.stok, 0).toLocaleString() },
                { label: 'Rata-rata Harga', value: formatRupiah(Math.round(cafeProducts.reduce((s, p) => s + p.harga, 0) / (cafeProducts.length || 1))) },
              ].map((k, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-gray-600">{k.label}</p>
                  <p className="text-2xl font-bold">{k.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Cari produk..." value={searchCafe} onChange={e => setSearchCafe(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-50" />
              </div>
              <select value={selectedCafeCat} onChange={e => setSelectedCafeCat(e.target.value)} className="px-3 py-2 rounded-lg border bg-gray-50">
                <option value="all">Semua Kategori</option>
                {cafeCategories.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
              <select value={stockFilterCafe} onChange={e => setStockFilterCafe(e.target.value as any)} className="px-3 py-2 rounded-lg border bg-gray-50">
                <option value="all">Semua Stok</option>
                <option value="in">Ada Stok</option>
                <option value="low">Stok Rendah</option>
                <option value="empty">Habis</option>
              </select>
              <button onClick={() => { setSearchCafe(''); setSelectedCafeCat('all'); setStockFilterCafe('all'); setPriceRangeCafe([0, 500000]); setDateRangeCafe('all'); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Reset</button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['nama', 'harga', 'stok', 'created_at'].map(col => (
                      <th key={col} onClick={() => { setSortByCafe(col as any); setSortOrderCafe(sortByCafe === col ? (sortOrderCafe === 'asc' ? 'desc' : 'asc') : 'desc'); }} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">
                        {col === 'nama' ? 'Nama' : col === 'harga' ? 'Harga' : col === 'stok' ? 'Stok' : 'Dibuat'}
                        {sortByCafe === col && (sortOrderCafe === 'asc' ? ' up' : ' down')}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCafe.map(p => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 flex justify-between border-t">
                <p className="text-sm">Halaman {pageCafe} dari {totalPagesCafe}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPageCafe(p => Math.max(1, p - 1))} disabled={pageCafe === 1} className="p-2 rounded-lg bg-gray-200 disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPageCafe(p => Math.min(totalPagesCafe, p + 1))} disabled={pageCafe === totalPagesCafe} className="p-2 rounded-lg bg-gray-200 disabled:opacity-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === HOTEL TAB === */}
        {tab === 'hotel' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Hotel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Kamar', value: rooms.length },
                { label: 'Total Galeri', value: galleries.length },
                { label: 'Total Berita', value: news.length },
              ].map((k, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-gray-600">{k.label}</p>
                  <p className="text-2xl font-bold">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Distribusi Tipe Kamar</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={roomPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {roomPieData.map((_, i) => <Cell key={i} fill={roomPieData[i].fill} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} kamar`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Status Berita</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={newsStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {newsStatusData.map((_, i) => <Cell key={i} fill={newsStatusData[i].fill} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} artikel`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Aktivitas Bulanan</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="room" fill="#3b82f6" name="Kamar" />
                    <Bar dataKey="gallery" fill="#8b5cf6" name="Galeri" />
                    <Bar dataKey="news" fill="#f59e0b" name="Berita" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { title: 'Kamar Terbaru', data: recent(rooms), link: '/admin/room' },
                { title: 'Galeri Terbaru', data: recent(galleries), link: '/admin/gallery' },
                { title: 'Berita Terbaru', data: recent(news), link: '/admin/news' }
              ].map((sec, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="border-b px-5 py-3 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{sec.title}</h3>
                    <Link href={sec.link} className="text-sm text-black hover:underline">Lihat semua</Link>
                  </div>
                  <table className="min-w-full">
                    <tbody className="divide-y divide-gray-100">
                      {sec.data.length === 0 ? (
                        <tr><td className="px-6 py-8 text-center text-gray-500">Belum ada data</td></tr>
                      ) : sec.data.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 w-12">
                            <div className="h-10 w-10 rounded-lg border overflow-hidden">
                              <img src={item.image || item.url || item.image_url || '/placeholder.svg'} alt="" className="h-full w-full object-cover" onError={e => (e.currentTarget.src = '/placeholder.svg')} />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm font-medium line-clamp-1">{item.nama || item.number || item.title}</td>
                          <td className="px-4 py-2 text-xs text-gray-600">{format(new Date(item.updated_at), 'dd MMM')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === SOUVENIR TAB === */}
        {tab === 'souvenir' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dashboard Souvenir</h2>
              <button onClick={() => exportCSV(souvenirProducts, 'souvenir')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
            {/* Filter & Tabel mirip Cafe, tapi untuk souvenir */}
            <p className="text-center text-gray-500">Souvenir menggunakan filter & tabel seperti Cafe. Gunakan fitur di atas.</p>
          </div>
        )}

      </div>
    </div>
  );
}