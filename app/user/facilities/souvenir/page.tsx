// app/souvenirs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package, Tag, DollarSign, ShoppingBag, Star, Award, Truck, Shield, Gift, Sparkles } from 'lucide-react';

interface Category {
  id: number;
  nama: string;
}

interface Product {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: string;
  category: Category;
  category_id: number;
}

interface PaginatedResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function SouvenirsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `${API_BASE}/public/souvenirs?page=${page}&limit=${limit}`;
        if (selectedCategory) {
          url = `${API_BASE}/public/souvenirs/category/${selectedCategory}?page=${page}&limit=${limit}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');

        const result: PaginatedResponse = await res.json();
        setProducts(result.data);
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, selectedCategory]);

  const totalPages = Math.ceil(total / limit);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getFirstImage = (gambar: string) => {
    if (!gambar) return '/placeholder.jpg';
    const urls = gambar.split(',');
    return urls[0].trim();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-r from-amber-50 via-white to-amber-50 border-b border-amber-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent"></div>
        
        {/* Back Button */}
        <div className="fixed top-4 left-4 z-50">
          <Link
            href="/user/facilities"
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-amber-600 border border-amber-100"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold">Kembali</span>
          </Link>
        </div>

        {/* Header Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Koleksi Eksklusif
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Toko <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">Souvenir</span> Kami
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Temukan oleh-oleh khas dan berkualitas untuk kenangan indah Anda
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{total}+</div>
                <div className="text-sm text-gray-600">Produk Tersedia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Kategori Pilihan</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">100%</div>
                <div className="text-sm text-gray-600">Produk Berkualitas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-amber-50/50 to-white py-8 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Kualitas Terjamin</div>
                <div className="text-xs text-gray-600">Produk pilihan terbaik</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Pengiriman Aman</div>
                <div className="text-xs text-gray-600">Dikemas dengan baik</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">100% Original</div>
                <div className="text-xs text-gray-600">Produk asli & resmi</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Cocok Untuk Hadiah</div>
                <div className="text-xs text-gray-600">Sempurna untuk oleh-oleh</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filter */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-amber-100">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Kategori Produk</h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                    selectedCategory === null
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-200'
                      : 'bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-700 border border-transparent hover:border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Semua Produk</span>
                    {selectedCategory === null && <Star className="w-4 h-4" />}
                  </div>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-200'
                        : 'bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-700 border border-transparent hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.nama}</span>
                      {selectedCategory === cat.id && <Star className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-6 pt-6 border-t border-amber-100">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900 mb-1">Butuh Bantuan?</div>
                      <div className="text-gray-600 text-xs leading-relaxed">
                        Hubungi kami untuk informasi lebih lanjut tentang produk dan pemesanan khusus.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse border border-amber-100">
                    <div className="bg-gray-200 h-56"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded-lg w-1/3 mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-8 rounded-2xl text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <p className="font-semibold text-lg mb-2">Terjadi Kesalahan</p>
                <p className="text-sm mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                >
                  Coba Lagi
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 p-12 rounded-2xl text-center">
                <Package className="w-20 h-20 mx-auto mb-6 text-amber-500" />
                <p className="text-xl font-bold text-gray-900 mb-2">Tidak ada produk ditemukan</p>
                <p className="text-gray-600 mb-6">Coba pilih kategori lain atau lihat semua produk</p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  Lihat Semua Produk
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/souvenirs/${product.id}`}
                      className="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100 hover:border-amber-300"
                    >
                      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                        <Image
                          src={getFirstImage(product.gambar)}
                          alt={product.nama}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            {product.category.nama}
                          </div>
                        </div>

                        {product.stok < 10 && product.stok > 0 && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              Stok Terbatas!
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-amber-600 transition-colors mb-2 line-clamp-1">
                          {product.nama}
                        </h3>
                        
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                          {product.deskripsi || 'Produk berkualitas tinggi dengan desain eksklusif yang cocok untuk oleh-oleh atau hadiah istimewa.'}
                        </p>

                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">(4.9)</span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Harga</div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                                {formatRupiah(product.harga)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Stok</div>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              product.stok > 20 
                                ? 'bg-green-100 text-green-700' 
                                : product.stok > 0 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              <Package className="w-3 h-3" />
                              {product.stok}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-center rounded-xl font-semibold group-hover:shadow-lg transition-all duration-300">
                            Lihat Detail
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 mt-12">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          page === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 shadow-md hover:shadow-lg border border-amber-100'
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                                page === pageNum
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-200 scale-110'
                                  : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-100 hover:border-amber-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          page === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 shadow-md hover:shadow-lg border border-amber-100'
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 font-medium">
                      Menampilkan <span className="text-amber-600 font-bold">{products.length}</span> dari{' '}
                      <span className="text-amber-600 font-bold">{total}</span> produk
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info Section */}
      <div className="bg-gradient-to-b from-white to-amber-50 py-12 border-t border-amber-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Mengapa Memilih Kami?</h2>
            <p className="text-gray-600">Komitmen kami untuk memberikan yang terbaik</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Produk Berkualitas</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Setiap produk dipilih dengan cermat untuk memastikan kualitas terbaik dan kepuasan pelanggan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Transaksi Aman</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Keamanan data dan transaksi Anda adalah prioritas utama kami dengan sistem terenkripsi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Layanan Prima</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tim kami siap membantu Anda dengan pelayanan ramah dan responsif setiap saat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}