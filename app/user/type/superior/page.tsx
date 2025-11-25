import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SuperiorSuiteDetail() {
  const images = [
    "/superior-1.jpg",
    "/superior-2.jpg",
    "/superior-3.jpg",
    "/superior-4.jpg",
  ];

  const amenities = [
    "King-size bed dengan linen Frette 1000-thread count",
    "80 m² ruang pribadi + balkon panoramic",
    "Smart TV 75” dengan Netflix & Apple TV",
    "Bang & Olufsen Beosound sound system",
    "Minibar premium gratis (termasuk champagne)",
    "Nespresso machine + TWG Tea selection",
    "Marble bathroom dengan rain shower & bathtub",
    "Byredo London bathroom amenities",
    "Walk-in wardrobe dengan safety box",
    "Smart home control (lampu, curtain, AC)",
    "High-speed Wi-Fi 1 Gbps",
    "24-hour dedicated butler service",
  ];

  return (
    <>
      {/* Hero Gallery Section */}
      <section className="relative h-screen min-h-[700px] overflow-hidden bg-black">
        {/* Main Image Background */}
        <div className="absolute inset-0">
          <img
            src="/superior-main.jpg"
            alt="Superior Suite - Panoramic View"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Floating Thumbnail Gallery */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {images.map((img, i) => (
            <button
              key={i}
              className="group relative w-24 h-16 rounded-xl overflow-hidden border-2 border-amber-600/50 hover:border-amber-400 transition-all duration-300"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-10 left-10 z-30 flex items-center gap-3 text-white/80 hover:text-amber-400 transition-colors group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm tracking-wider uppercase font-medium">Back to Rooms</span>
        </Link>

        {/* Header Overlay */}
        <div className="absolute inset-0 flex items-end pb-32 px-10 lg:px-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-10 h-10 text-amber-400 fill-amber-400 drop-shadow-glow" />
                ))}
              </div>
              <span className="text-amber-300 text-sm tracking-widest uppercase">Signature Collection</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                Superior Suite
              </span>
            </h1>
            <p className="text-2xl text-gray-300 font-light max-w-3xl">
              Ruang luas 80 m² dengan sentuhan emas dan marmer Italia — dirancang untuk mereka yang menginginkan 
              kemewahan tanpa kompromi.
            </p>
          </div>
        </div>
      </section>

      {/* Detail Content */}
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-drift-slow"></div>
          <div className="absolute bottom-20 -right-40 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-drift-slow delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Left Column - Description & Amenities */}
            <div className="lg:col-span-2 space-y-16">
              {/* Description */}
              <div>
                <h2 className="text-5xl font-bold mb-8">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                    A Sanctuary of Modern Luxury
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed font-light">
                  Superior Suite kami menawarkan perpaduan sempurna antara desain kontemporer dan kenyamanan absolut. 
                  Setiap detail — mulai dari lantai marmer Carrara hingga aksen emas 24 karat — diciptakan untuk 
                  memberikan pengalaman menginap yang tak terlupakan.
                </p>
              </div>

              {/* Amenities Grid */}
              <div>
                <h3 className="text-3xl font-semibold text-amber-400 mb-10">Exclusive Amenities</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {amenities.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="mt-1.5 w-3 h-3 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50 
                        group-hover:scale-150 transition-transform duration-300"></div>
                      <span className="text-gray-300 text-lg font-light group-hover:text-amber-200 transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center gap-8 my-16 opacity-50">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                <div className="w-5 h-5 rotate-45 border-2 border-amber-500"></div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              </div>
            </div>

            {/* Right Column - Booking Card (Sticky) */}
            <div className="lg:col-span-1">
              <Card className="sticky top-10 bg-gradient-to-br from-gray-950/90 via-black/95 to-amber-950/40 
                backdrop-blur-2xl border border-amber-800/50 rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                <div className="p-10">
                  {/* Price */}
                  <div className="text-center mb-10">
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                      IDR 8.800.000
                    </div>
                    <p className="text-gray-400 mt-2">per malam ++ · termasuk sarapan untuk 2 orang</p>
                  </div>

                  {/* Features Highlight */}
                  <div className="space-y-4 mb-10 bg-black/40 rounded-2xl p-6 border border-amber-900/50">
                    <div className="flex items-center justify-between text-gray-300">
                      <span className="font-light">Luas Kamar</span>
                      <span className="text-amber-400 font-semibold">80 m²</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span className="font-light">Kapasitas</span>
                      <span className="text-amber-400 font-semibold">2 Dewasa + 1 Anak</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span className="font-light">View</span>
                      <span className="text-amber-400 font-semibold">City / Ocean</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 
                      text-white font-bold text-lg py-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-amber-500/50 
                      border border-amber-400 transition-all duration-400">
                      Reserve Now
                    </Button>

                    <Button variant="outline" className="w-full border-2 border-amber-600 text-amber-400 
                      hover:bg-amber-950/50 hover:text-amber-300 py-8 rounded-2xl font-medium text-lg transition-all duration-400">
                      Check Availability
                    </Button>
                  </div>

                  {/* Trust Elements */}
                  <div className="mt-10 pt-10 border-t border-amber-900/50 text-center text-sm text-gray-500">
                    <p className="mb-2">Gratis pembatalan hingga 48 jam sebelum check-in</p>
                    <p>No hidden fees • Best rate guaranteed</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final Glow Lines */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-2xl shadow-amber-400/50"></div>
    </>
  );
}