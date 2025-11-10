// app/user/facilities/cafe/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Coffee, ShoppingBag, ArrowLeft, Star, Award, Clock, Heart, Sparkles, Flame, ChefHat, Leaf } from "lucide-react";

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

async function getCafeProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/public/cafe`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function CafePage() {
  const products: CafeProduct[] = await getCafeProducts();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient Background */}
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
              Kualitas Premium
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">Cafe</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Nikmati secangkir kehangatan di Golden Brew. Dari kopi premium hingga pastry artisan, 
                setiap tegukan dan gigitan adalah perjalanan rasa yang tak terlupakan.
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

      {/* Features Section */}
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

      {/* Menu Section */}
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

          {products.length === 0 ? (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-16 text-center">
              <Coffee className="w-20 h-20 mx-auto mb-6 text-amber-500" />
              <p className="text-xl font-bold text-gray-900 mb-2">Tidak ada menu tersedia</p>
              <p className="text-gray-600">Menu sedang dalam proses pembaruan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const imageUrl = product.gambar
                  ? product.gambar.startsWith("http")
                    ? product.gambar
                    : `${baseUrl}${product.gambar}`
                  : null;

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-amber-100 hover:border-amber-300 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
                  >
                    {/* Product Image */}
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
                      
                      {/* Overlay gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          {product.category.nama}
                        </div>
                      </div>

                      {/* Stock Badge */}
                      {product.stok < 10 && product.stok > 0 && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Terbatas!
                          </div>
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
                        <Heart className="w-5 h-5 text-amber-600" />
                      </button>
                    </div>

                    {/* Product Details */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
                        {product.nama}
                      </h3>
                      
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                        {product.deskripsi || "Dibuat dengan bahan berkualitas tinggi dan resep istimewa untuk memberikan pengalaman rasa yang sempurna."}
                      </p>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">(4.9)</span>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-end justify-between pt-4 border-t border-amber-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Harga</p>
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                            Rp {product.harga.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Stok: <span className={`font-bold ${product.stok > 20 ? 'text-green-600' : product.stok > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                              {product.stok}
                            </span>
                          </p>
                        </div>
                        
                        <button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Mengapa Golden Brew?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami berkomitmen memberikan pengalaman kuliner terbaik untuk setiap tamu
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center group hover:border-amber-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Kualitas Terjamin</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Setiap menu dibuat dengan standar kualitas tinggi menggunakan bahan-bahan pilihan terbaik untuk kepuasan Anda.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center group hover:border-amber-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Chef Profesional</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tim chef berpengalaman kami siap menyajikan hidangan dengan cita rasa istimewa yang memanjakan lidah Anda.
              </p>
            </div>

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

      {/* Special Offers Section */}
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

      {/* Operating Hours */}
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
                  <p className="text-sm text-gray-600">Senin - Minggu: 08:00 - 22:00 WIB</p>
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
    </div>
  );
}