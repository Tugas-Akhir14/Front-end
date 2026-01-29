'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Coffee,
  ShoppingBag,
  ArrowLeft,
  Star,
  Award,
  Clock,
  Heart,
  Sparkles,
  Flame,
  ChefHat,
  Leaf,
  Plus,
  Minus,
  Trash2,
  Search,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Swal from 'sweetalert2';

interface CafeProduct {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: string;
  category: {
    id: number;
    nama: string;
  };
}

interface CartItem {
  product: CafeProduct;
  quantity: number;
}

export default function CafePage() {
  const [products, setProducts] = useState<CafeProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  // Fetch products (client-side supaya bisa filter real-time)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category_id', selectedCategory);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/public/cafe?${params.toString()}`,
          { cache: 'no-store' }
        );

        if (!res.ok) throw new Error('Gagal memuat menu');
        const data = await res.json();
        const productList = Array.isArray(data) ? data : data.data || [];
        setProducts(productList);

        // Auto categories
        const uniqueCats: { id: number; nama: string }[] = Array.from(
  new Map<number, { id: number; nama: string }>(
    productList.map((p: CafeProduct) => [p.category.id, p.category])
  ).values()
);

        setCategories(uniqueCats);
      } catch (err) {
        toast.error('Gagal memuat menu cafe');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Filter produk
  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cart Functions
  const addToCart = (product: CafeProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stok) {
          toast.error(`Stok ${product.nama} tidak cukup!`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stok < 1) {
        toast.error(`${product.nama} habis stok!`);
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.nama} ditambahkan ke keranjang`);
  };

  const decreaseQuantity = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info('Item dihapus dari keranjang');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.harga * item.quantity, 0);

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast.error('Nama pemesan wajib diisi!');
      return;
    }
    if (cart.length === 0) {
      toast.error('Keranjang kosong!');
      return;
    }

    const items = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const payload = {
      customer_name: customerName,
      table_number: tableNumber || null,
      items,
    };

    const result = await Swal.fire({
      title: 'Konfirmasi Pesanan?',
      text: `Total: Rp ${cartTotal.toLocaleString('id-ID')}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Pesan!',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading('Memproses pesanan...');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/public/cafe/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal memproses pesanan');
      }

      const data = await res.json();
      const { wa_link } = data;

      toast.success('Pesanan berhasil dibuat!', { id: toastId });

      Swal.fire({
        title: 'Pesanan Berhasil!',
        html: `
          <p>Pesanan Anda telah diterima.</p>
          <p>Klik tombol di bawah untuk mengirim notifikasi ke admin WhatsApp:</p>
          <a href="${wa_link}" target="_blank" rel="noopener noreferrer" 
             class="mt-6 inline-block bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg">
            Kirim ke WA Admin Sekarang
          </a>
        `,
        icon: 'success',
        showConfirmButton: false,
      });

      setCart([]);
      setCustomerName('');
      setTableNumber('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses pesanan', { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="min-h-screen bg-white">
        {/* Hero Section - TETAP SAMA PERSIS */}
        <div className="relative bg-gradient-to-r from-amber-50 via-white to-amber-50 border-b border-amber-100">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent"></div>

          {/* Back Button - Fixed Position */}
          <div className="fixed top-4 left-4 z-50">
            <Link
              href="/user/facilities"
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-amber-600 border border-amber-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Kembali</span>
            </Link>
          </div>

          {/* Header Content */}
          <div className="relative max-w-7xl mx-auto px-6 py-16 pt-20">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Golden Brew Cafe
              </div>

              <div className="space-y-3">
                <Image className="inline-flex justify-center items-center" src="/cafe.png" alt="Cafe" width={300} height={300} />
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Nikmati secangkir Kopi Premium, Dengan pemandangan yang tak terlupakan.
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">{products.length}+</div>
                  <div className="text-sm text-gray-600">Menu Tersedia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">4.9</div>
                  <div className="text-sm text-gray-600">Rating Pelanggan</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">100%</div>
                  <div className="text-sm text-gray-600">Bahan Fresh</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - TETAP SAMA */}
        <div className="bg-gradient-to-b from-amber-50/50 to-white py-8 border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Kopi Premium</div>
                  <div className="text-xs text-gray-600">Biji pilihan terbaik</div>
                </div>
              </div>

              {/* ... 3 card feature lainnya tetap sama persis ... */}
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Chef Handal</div>
                  <div className="text-xs text-gray-600">Ahli kuliner</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Bahan Segar</div>
                  <div className="text-xs text-gray-600">100% fresh daily</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Cepat Saji</div>
                  <div className="text-xs text-gray-600">Siap dalam hitungan menit</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section dengan Pemesanan */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Menu Spesial Kami</h2>
                  <p className="text-sm text-gray-600">Pilihan terbaik untuk setiap momen Anda</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                <span className="text-sm font-semibold text-amber-700">{products.length} item tersedia</span>
              </div>
            </div>

            {/* Filter Search */}
            <div className="mb-10">
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari menu favoritmu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-500 mx-auto"></div>
                <p className="mt-6 text-gray-600">Memuat menu lezat...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-16 text-center">
                <Coffee className="w-20 h-20 mx-auto mb-6 text-amber-500" />
                <p className="text-xl font-bold text-gray-900 mb-2">Tidak ada menu ditemukan</p>
                <p className="text-gray-600">Coba ubah kata kunci atau pilih kategori lain</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const imageUrl = product.gambar?.startsWith('http')
                    ? product.gambar
                    : `${process.env.NEXT_PUBLIC_BASE_URL}${product.gambar}`;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-amber-100 hover:border-amber-300 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
                    >
                      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.nama}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 25vw"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Coffee className="w-20 h-20 text-gray-300" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {product.category.nama}
                          </div>
                        </div>

                        {product.stok < 10 && product.stok > 0 && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              Terbatas!
                            </div>
                          </div>
                        )}

                        <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
                          <Heart className="w-5 h-5 text-amber-600" />
                        </button>
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
                          {product.nama}
                        </h3>

                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                          {product.deskripsi || 'Dibuat dengan bahan berkualitas tinggi dan resep istimewa.'}
                        </p>

                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">(4.9)</span>
                        </div>

                        <div className="flex items-end justify-between pt-4 border-t border-amber-100">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Harga</p>
                            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                              Rp {product.harga.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Stok:{' '}
                              <span
                                className={`font-bold ${
                                  product.stok > 20
                                    ? 'text-green-600'
                                    : product.stok > 0
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {product.stok}
                              </span>
                            </p>
                          </div>

                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stok === 0}
                            className={`p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 ${
                              product.stok === 0
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white'
                            }`}
                          >
                            <ShoppingBag className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us - TETAP SAMA */}
        <div className="bg-gradient-to-b from-white to-amber-50 py-16 px-6 border-t border-amber-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Mengapa Golden Brew?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Kami berkomitmen memberikan pengalaman kuliner terbaik untuk setiap tamu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 3 card why choose us tetap sama persis */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center group hover:border-amber-300 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Kualitas Terjamin</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Setiap menu dibuat dengan standar kualitas tinggi menggunakan bahan-bahan pilihan terbaik untuk kepuasan Anda.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center group hover:border-amber-300 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Chef Profesional</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tim chef berpengalaman kami siap menyajikan hidangan dengan cita rasa istimewa yang memanjakan lidah Anda.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center group hover:border-amber-300 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Dibuat Dengan Cinta</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Setiap pesanan dibuat dengan penuh perhatian dan cinta untuk memberikan pengalaman yang berkesan bagi Anda.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Special Offers - TETAP SAMA */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 py-12 px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-3">Promo Spesial Hari Ini</h2>
            <p className="text-lg mb-6 text-amber-50">
              Dapatkan diskon spesial untuk pemesanan hari ini dan nikmati kelezatan dengan harga istimewa
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-amber-600 px-8 py-3 rounded-xl font-bold hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Lihat Menu Lengkap
              </button>
              <button className="bg-amber-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Operating Hours - TETAP SAMA */}
        <div className="bg-white py-8 px-6 border-t border-amber-100">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Jam Operasional</h3>
                    <p className="text-sm text-gray-600">Senin - Minggu: 10:00 - 22:00 WIB</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-600 mb-1">Hubungi Kami</p>
                  <p className="font-bold text-amber-600">+62 812-3456-7890</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cart - Bagian baru untuk pemesanan */}
        {cart.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50 w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6" />
                  <span className="font-bold">Keranjang ({cart.length})</span>
                </div>
                <span className="font-bold text-xl">Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>

              <div className="p-5 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center mb-4 pb-3 border-b">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.product.nama}</p>
                      <p className="text-sm text-gray-600">
                        Rp {item.product.harga.toLocaleString('id-ID')} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => decreaseQuantity(item.product.id)}>
                        <Minus className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => addToCart(item.product)}>
                        <Plus className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)}>
                        <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="mt-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Nama Pemesan *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />

                  <button
                    onClick={handleCheckout}
                    disabled={cartTotal === 0 || !customerName.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                      cartTotal === 0 || !customerName.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 shadow-lg'
                    }`}
                  >
                    Checkout & Kirim Pesanan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}