import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';


export default function AboutPage() {
  return (
    <><><Header />
          <div className="min-h-screen bg-black text-white">
              {/* Hero Section */}
              <section className="relative h-96 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-600 opacity-20"></div>
                  <div className="absolute inset-0 bg-black opacity-40"></div>
                  <div className="relative z-10 text-center px-4">
                      <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent animate-pulse">
                          Hotel Mutiara Balige
                      </h1>
                      <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-4"></div>
                      <p className="text-xl md:text-2xl text-yellow-200 font-light">
                          Permata di Tepi Danau Toba
                      </p>
                  </div>
              </section>

              {/* Main About Section */}
              <section className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                          <h2 className="text-4xl font-bold text-yellow-400 mb-6">
                              Tentang Kami
                          </h2>
                          <p className="text-gray-300 leading-relaxed text-lg">
                              Hotel Mutiara Balige adalah destinasi perhotelan terkemuka di Balige,
                              menawarkan pengalaman menginap yang tak terlupakan dengan pemandangan
                              spektakuler Danau Toba. Sejak didirikan, kami berkomitmen untuk
                              memberikan pelayanan terbaik dengan sentuhan kehangatan khas Batak Toba.
                          </p>
                          <p className="text-gray-300 leading-relaxed text-lg">
                              Terletak strategis di jantung kota Balige, hotel kami menyediakan
                              akses mudah ke berbagai destinasi wisata, pusat bisnis, dan kuliner
                              khas daerah. Dengan fasilitas modern dan desain yang memadukan
                              kemewahan kontemporer dengan kearifan lokal.
                          </p>
                          <div className="flex items-center space-x-4 pt-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center">
                                  <span className="text-2xl">⭐</span>
                              </div>
                              <div>
                                  <p className="text-yellow-400 font-semibold text-xl">Bintang 4</p>
                                  <p className="text-gray-400 text-sm">Hotel Berbintang</p>
                              </div>
                          </div>
                      </div>

                      <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg blur-xl opacity-30"></div>
                          <div className="relative bg-gradient-to-br from-gray-900 to-black p-8 rounded-lg border border-yellow-600">
                              <div className="space-y-6">
                                  <div className="flex items-start space-x-4">
                                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-1">
                                          <span className="text-xl">🏨</span>
                                      </div>
                                      <div>
                                          <h3 className="text-yellow-400 font-semibold text-lg mb-2">Kamar Mewah</h3>
                                          <p className="text-gray-400">Lebih dari 80 kamar dengan fasilitas premium</p>
                                      </div>
                                  </div>

                                  <div className="flex items-start space-x-4">
                                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-1">
                                          <span className="text-xl">🍽️</span>
                                      </div>
                                      <div>
                                          <h3 className="text-yellow-400 font-semibold text-lg mb-2">Restoran Berkelas</h3>
                                          <p className="text-gray-400">Sajian kuliner nusantara dan internasional</p>
                                      </div>
                                  </div>

                                  <div className="flex items-start space-x-4">
                                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-1">
                                          <span className="text-xl">💼</span>
                                      </div>
                                      <div>
                                          <h3 className="text-yellow-400 font-semibold text-lg mb-2">Ruang Meeting</h3>
                                          <p className="text-gray-400">Fasilitas MICE dengan kapasitas hingga 500 orang</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* Vision & Mission */}
              <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-black via-gray-900 to-black">
                  <div className="max-w-7xl mx-auto">
                      <div className="text-center mb-16">
                          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-4">
                              Visi & Misi
                          </h2>
                          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto"></div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                          <div className="bg-gradient-to-br from-yellow-900 via-black to-black p-8 rounded-lg border border-yellow-700 hover:border-yellow-500 transition-all duration-300">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center mb-6 mx-auto">
                                  <span className="text-3xl">👁️</span>
                              </div>
                              <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Visi</h3>
                              <p className="text-gray-300 text-center leading-relaxed">
                                  Menjadi hotel terbaik dan terpercaya di kawasan Danau Toba yang
                                  memberikan pengalaman menginap berkelas dunia dengan tetap
                                  mempertahankan nilai-nilai budaya lokal dan kelestarian lingkungan.
                              </p>
                          </div>

                          <div className="bg-gradient-to-br from-amber-900 via-black to-black p-8 rounded-lg border border-amber-700 hover:border-amber-500 transition-all duration-300">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center mb-6 mx-auto">
                                  <span className="text-3xl">🎯</span>
                              </div>
                              <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Misi</h3>
                              <ul className="text-gray-300 space-y-3">
                                  <li className="flex items-start">
                                      <span className="text-yellow-500 mr-2">•</span>
                                      <span>Memberikan pelayanan terbaik dengan keramahan khas Batak</span>
                                  </li>
                                  <li className="flex items-start">
                                      <span className="text-yellow-500 mr-2">•</span>
                                      <span>Menyediakan fasilitas modern dan berkualitas tinggi</span>
                                  </li>
                                  <li className="flex items-start">
                                      <span className="text-yellow-500 mr-2">•</span>
                                      <span>Mendukung pariwisata dan ekonomi lokal</span>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </section>

              {/* Facilities Highlight */}
              <section className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold text-yellow-400 mb-4">
                          Fasilitas Unggulan
                      </h2>
                      <p className="text-gray-400 text-lg">
                          Nikmati berbagai fasilitas premium untuk kenyamanan Anda
                      </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                          { icon: "🏊", label: "Kolam Renang" },
                          { icon: "🏋️", label: "Fitness Center" },
                          { icon: "☕", label: "Coffee Shop" },
                          { icon: "🚗", label: "Parkir Luas" },
                          { icon: "📶", label: "WiFi Gratis" },
                          { icon: "🛁", label: "Spa & Massage" },
                          { icon: "🎉", label: "Ballroom" },
                          { icon: "🔒", label: "Keamanan 24/7" }
                      ].map((facility, index) => (
                          <div
                              key={index}
                              className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-gray-800 hover:border-yellow-600 transition-all duration-300 hover:scale-105 text-center group"
                          >
                              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                  {facility.icon}
                              </div>
                              <p className="text-gray-300 group-hover:text-yellow-400 transition-colors duration-300">
                                  {facility.label}
                              </p>
                          </div>
                      ))}
                  </div>
              </section>

              {/* Location Info */}
              <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-t from-black via-gray-900 to-black">
                  <div className="max-w-7xl mx-auto text-center">
                      <h2 className="text-4xl font-bold text-yellow-400 mb-6">
                          Lokasi Strategis
                      </h2>
                      <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
                          Berlokasi di pusat kota Balige dengan akses mudah ke berbagai destinasi wisata
                          dan hanya beberapa menit dari Danau Toba yang memukau.
                      </p>

                      <div className="grid md:grid-cols-3 gap-6 mt-12">
                          <div className="bg-black border border-yellow-700 p-6 rounded-lg">
                              <div className="text-3xl mb-3">📍</div>
                              <h3 className="text-yellow-400 font-semibold mb-2">Pusat Kota</h3>
                              <p className="text-gray-400">5 menit dari alun-alun Balige</p>
                          </div>

                          <div className="bg-black border border-yellow-700 p-6 rounded-lg">
                              <div className="text-3xl mb-3">🏞️</div>
                              <h3 className="text-yellow-400 font-semibold mb-2">Danau Toba</h3>
                              <p className="text-gray-400">10 menit ke tepi danau</p>
                          </div>

                          <div className="bg-black border border-yellow-700 p-6 rounded-lg">
                              <div className="text-3xl mb-3">✈️</div>
                              <h3 className="text-yellow-400 font-semibold mb-2">Bandara</h3>
                              <p className="text-gray-400">45 menit dari Bandara Silangit</p>
                          </div>
                      </div>
                  </div>
              </section>

              {/* CTA Section */}
              <section className="py-20 px-4 text-center">
                  <div className="max-w-4xl mx-auto">
                      <h2 className="text-4xl font-bold text-white mb-6">
                          Siap Merasakan Pengalaman Tak Terlupakan?
                      </h2>
                      <p className="text-gray-400 text-lg mb-8">
                          Pesan kamar Anda sekarang dan nikmati kemewahan serta keramahan
                          khas Hotel Mutiara Balige
                      </p>
                      <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-amber-500 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/50">
                          Reservasi Sekarang
                      </button>
                  </div>
              </section>
          </div></>
          <Footer /></>
  );
}