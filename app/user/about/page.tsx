// app/about/page.tsx (atau pages/about.tsx jika pakai pages router)
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ChatBot from '@/components/Chatbot/ChatBot';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Waves, Coffee, Dumbbell, Car, Wifi, Shield, Sparkles, Camera } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Tentang Kami - Hotel Mutiara Balige | Permata Danau Toba',
  description: 'Hotel bintang 4+ terbaik di tepi Danau Toba dengan pemandangan memukau, pelayanan kelas dunia, dan sentuhan kemewahan khas Batak Toba.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white overflow-hidden">
         <section className="relative h-[600px] bg-gradient-to-br from-black via-gray-900 to-amber-950 overflow-hidden">
          {/* Animated gold pattern background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #d4af37 2px, transparent 2px)',
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-amber-950/60 to-transparent z-10"></div>
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105 opacity-20"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg)' }}
          />
          
          {/* Floating sparkles */}
          <div className="absolute top-20 left-10 animate-pulse z-20">
            <Sparkles className="w-10 h-10 text-amber-500 opacity-70" />
          </div>
          <div className="absolute top-32 right-20 animate-pulse z-20" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-8 h-8 text-yellow-500 opacity-70" />
          </div>
          <div className="absolute bottom-40 left-1/3 animate-pulse z-20" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-9 h-9 text-amber-400 opacity-70" />
          </div>
          
          {/* Gold glow effects */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          
          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="text-center max-w-5xl px-4 space-y-8">
              
              {/* Badge */}
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-amber-900/50 to-yellow-900/50 backdrop-blur-md px-6 py-3 rounded-full border-2 border-amber-600">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300 text-sm font-bold tracking-widest uppercase">Visual Excellence</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                  About
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-10 text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in the opulent beauty and timeless elegance of our luxury sanctuary
              </p>
              
              {/* Decorative line */}
              <div className="flex justify-center mb-10">
                <div className="h-px w-64 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
               
              </div>
            </div>
          </div>
          
          {/* Bottom gradient transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20"></div>
        </section>

        {/* About Section */}
        <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                  Kemewahan Berpadu Budaya
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed font-light">
                Hotel Mutiara Balige bukan sekadar tempat menginap — kami adalah <span className="text-amber-400">warisan hidup</span> yang 
                memadukan kemewahan modern dengan kehangatan khas Batak Toba. Setiap sudut dirancang untuk menghormati 
                budaya lokal, sekaligus memberikan standar internasional tertinggi.
              </p>
              <p className="text-lg text-gray-400">
                Terletak di jantung Balige, hanya beberapa menit dari tepi Danau Toba, kami menawarkan akses sempurna 
                ke keindahan alam, kuliner khas, dan keramahan masyarakat setempat.
              </p>

              <div className="flex items-center gap-6 pt-8">
                <div className="flex -space-x-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-12 h-12 text-amber-400 fill-amber-400 drop-shadow-glow" />
                  ))}
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">Bintang 4+</p>
                  <p className="text-gray-400">Standar Internasional</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 rounded-3xl blur-3xl group-hover:blur-xl transition-all duration-700"></div>
              <div className="relative bg-gradient-to-br from-gray-950/90 via-black to-amber-950/30 backdrop-blur-xl rounded-3xl border border-amber-800/50 p-10">
                <div className="space-y-8">
                  {[
                    { icon: Sparkles, title: "80+ Kamar Premium", desc: "Desain elegan dengan view Danau Toba" },
                    { icon: Waves, title: "Restoran Danau View", desc: "Kuliner Batak & internasional" },
                    { icon: Coffee, title: "Lounge Eksekutif", desc: "Ruang santai dengan pemandangan" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group/item">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-amber-400">{item.title}</h3>
                        <p className="text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-24 bg-gradient-to-b from-black via-gray-950 to-black">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold mb-16">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                Visi & Misi Kami
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-gradient-to-br from-amber-950/40 to-black p-10 rounded-3xl border border-amber-700 hover:border-amber-500 transition-all duration-500">
                <div className="text-6xl mb-6">Vision</div>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Menjadi hotel terbaik di kawasan Danau Toba yang menggabungkan kemewahan kelas dunia 
                  dengan pelestarian budaya Batak dan keberlanjutan lingkungan.
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-950/40 to-black p-10 rounded-3xl border border-yellow-700 hover:border-yellow-500 transition-all duration-500">
                <div className="text-6xl mb-6">Target</div>
                <ul className="text-left text-gray-300 space-y-4 text-lg mt-8">
                  <li className="flex items-center gap-4"><span className="text-amber-400">•</span> Pelayanan terbaik dengan keramahan khas Batak</li>
                  <li className="flex items-center gap-4"><span className="text-amber-400">•</span> Fasilitas modern berkelas internasional</li>
                  <li className="flex items-center gap-4"><span className="text-amber-400">•</span> Mendukung ekonomi & pariwisata lokal</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities Grid */}
        <section id="facilities" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-amber-400 mb-4">Fasilitas Unggulan</h2>
              <p className="text-xl text-gray-400">Semua yang Anda butuhkan, dalam satu tempat mewah</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Waves, label: "Infinity Pool" },
                { icon: Dumbbell, label: "Fitness Center" },
                { icon: Coffee, label: "Lake View Café" },
                { icon: Car, label: "Valet Parking" },
                { icon: Wifi, label: "High-Speed WiFi" },
                { icon: Sparkles, label: "Spa & Wellness" },
                { icon: MapPin, label: "Ballroom" },
                { icon: Shield, label: "24/7 Security" },
              ].map((f, i) => (
                <div key={i} className="group text-center">
                  <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 group-hover:border-amber-600 transition-all duration-300 group-hover:scale-105">
                    <f.icon className="w-12 h-12 mx-auto mb-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <p className="text-gray-300 group-hover:text-amber-400 transition-colors font-medium">
                      {f.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="py-24 bg-gradient-to-t from-black via-gray-950 to-black">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold text-amber-400 mb-12">Lokasi Strategis</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { icon: MapPin, title: "Pusat Kota Balige", desc: "5 menit dari alun-alun" },
                { icon: Waves, title: "Tepi Danau Toba", desc: "10 menit ke pantai" },
                { icon: Car, title: "Bandara Silangit", desc: "45 menit berkendara" },
              ].map((loc, i) => (
                <div key={i} className="bg-black/50 backdrop-blur-sm border border-amber-800/50 p-8 rounded-2xl">
                  <loc.icon className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                  <h3 className="text-xl font-semibold text-amber-300 mb-2">{loc.title}</h3>
                  <p className="text-gray-400">{loc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                Mulai Perjalanan Anda
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Pesan sekarang dan rasakan kemewahan sejati di tepi Danau Toba
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-xl px-12 py-8 rounded-xl shadow-2xl hover:shadow-amber-500/50">
              <Link href="/user/rooms">Reservasi Sekarang</Link>
            </Button>
          </div>
        </section>
      </div>

      <Footer />
      <ChatBot />
    </>
  );
}