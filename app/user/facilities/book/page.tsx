// app/user/facilities/book/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ShoppingBag, ArrowLeft, Star, Award, Bookmark, TrendingUp, Library, Sparkles } from "lucide-react";

interface Book {
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

export default function BookStorePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`${baseUrl}/public/books`, {
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Gagal memuat data buku');
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [baseUrl]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAddToCart = (book: Book) => {
    if (book.stok > 0) {
      // Implement your add to cart logic here
      alert(`Buku "${book.nama}" ditambahkan ke keranjang!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed top-4 left-4 z-50">
          <Link
            href="/user/facilities"
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-amber-600 border border-amber-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Kembali</span>
          </Link>
        </div>

        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data buku...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed top-4 left-4 z-50">
          <Link
            href="/user/facilities"
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-amber-600 border border-amber-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Kembali</span>
          </Link>
        </div>

        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Gagal Memuat Data</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-r from-amber-50 via-white to-amber-50 border-b border-amber-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent"></div>
        
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
              Koleksi Premium
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Golden <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">Pages</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Koleksi buku premium dengan kualitas terbaik. Dari novel inspiratif hingga ensiklopedia pengetahuan, 
                setiap halaman adalah emas bagi jiwa yang haus akan cerita dan ilmu.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{books.length}+</div>
                <div className="text-sm text-gray-600">Buku Tersedia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">50+</div>
                <div className="text-sm text-gray-600">Kategori Buku</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">4.9</div>
                <div className="text-sm text-gray-600">Rating Pembaca</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-amber-50/50 to-white py-8 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Buku Berkualitas</div>
                <div className="text-xs text-gray-600">Pilihan terbaik</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Harga Terjangkau</div>
                <div className="text-xs text-gray-600">Penawaran spesial</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Koleksi Lengkap</div>
                <div className="text-xs text-gray-600">Berbagai genre</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Bestseller</div>
                <div className="text-xs text-gray-600">Update terbaru</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Collection Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Koleksi Buku</h2>
                <p className="text-sm text-gray-600">Jelajahi pilihan bacaan terbaik kami</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
              <span className="text-sm font-semibold text-amber-700">{books.length} buku tersedia</span>
            </div>
          </div>

          {books.length === 0 ? (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-16 text-center">
              <BookOpen className="w-20 h-20 mx-auto mb-6 text-amber-500" />
              <p className="text-xl font-bold text-gray-900 mb-2">Tidak ada buku tersedia</p>
              <p className="text-gray-600">Koleksi buku sedang dalam proses pembaruan</p>
              <button 
                onClick={handleRefresh}
                className="mt-6 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-all duration-300"
              >
                Refresh Halaman
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => {
                const imageUrl = book.gambar
                  ? book.gambar.startsWith("http")
                    ? book.gambar
                    : `${baseUrl}${book.gambar}`
                  : null;

                return (
                  <div
                    key={book.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-amber-100 hover:border-amber-300 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
                  >
                    {/* Book Cover Image */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={book.nama}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 25vw"
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="w-20 h-20 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Overlay gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          {book.category.nama}
                        </div>
                      </div>

                      {/* Stock Badge */}
                      {book.stok < 10 && book.stok > 0 && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Stok Terbatas!
                          </div>
                        </div>
                      )}

                      {/* Out of Stock Badge */}
                      {book.stok === 0 && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-gray-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Habis
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
                        {book.nama}
                      </h3>
                      
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                        {book.deskripsi || "Buku berkualitas dengan konten menarik yang akan memperkaya wawasan dan pengetahuan Anda."}
                      </p>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">(4.8)</span>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-end justify-between pt-4 border-t border-amber-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Harga</p>
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                            Rp {book.harga.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Stok: <span className={`font-bold ${
                              book.stok > 20 ? 'text-green-600' : 
                              book.stok > 0 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {book.stok}
                            </span>
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => handleAddToCart(book)}
                          className={`p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 ${
                            book.stok > 0 
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={book.stok === 0}
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

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-b from-white to-amber-50 py-16 px-6 border-t border-amber-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Mengapa Berbelanja di Sini?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami berkomitmen memberikan pengalaman berbelanja buku terbaik untuk Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center group hover:border-amber-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Koleksi Terpilih</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Setiap buku dalam koleksi kami dipilih dengan cermat untuk memastikan kualitas konten dan nilai edukatif yang tinggi.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center group hover:border-amber-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bookmark className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Harga Kompetitif</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kami menawarkan harga terbaik dengan berbagai promo menarik agar bacaan berkualitas dapat dijangkau semua kalangan.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center group hover:border-amber-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Library className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Layanan Prima</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tim kami siap membantu Anda menemukan buku yang tepat dan memberikan rekomendasi sesuai minat dan kebutuhan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Mulai Petualangan Membaca Anda</h2>
          <p className="text-lg mb-6 text-amber-50">
            Temukan buku favorit Anda dan kembangkan wawasan dengan koleksi terbaik kami
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-amber-600 px-8 py-3 rounded-xl font-bold hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Lihat Semua Buku
            </button>
            <button className="bg-amber-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}