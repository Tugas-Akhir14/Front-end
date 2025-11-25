import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function DeluxeRoomDetail() {
  const gallery = [
    "/deluxe-1.jpg",
    "/deluxe-2.jpg",
    "/deluxe-3.jpg",
    "/deluxe-4.jpg",
  ];

  const amenities = [
    "King atau Twin bed dengan linen katun Mesir 800-thread count",
    "45–52 m² ruang elegan dengan aksen emas brushed",
    "Smart TV 65” dengan streaming internasional",
    "Marshall Bluetooth speaker",
    "Minibar gratis (soft drinks & local beer)",
    "Nespresso machine + seleksi teh premium",
    "Rain shower dengan marmer Italia",
    "Aromatherapy bathroom amenities (lokal premium)",
    "Walk-in wardrobe & electronic safe",
    "Smart lighting & curtain control",
    "High-speed Wi-Fi 500 Mbps",
    "Daily turndown service",
  ];

  return (
    <>
      {/* Hero Full-Screen */}
      <section className="relative h-screen min-h-[700px] overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="/deluxe-main.jpg"
            alt="Deluxe Room - Golden Hour"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        </div>

        {/* Thumbnail Gallery */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {gallery.map((img, i) => (
            <div
              key={i}
              className="w-24 h-16 rounded-xl overflow-hidden border-2 border-amber-700/60 hover:border-amber-500 
                         transition-all duration-300 cursor-pointer group"
            >
              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
          ))}
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-10 left-10 z-30 flex items-center gap-3 text-white/80 hover:text-amber-400 transition-all group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition" />
          <span className="text-sm tracking-widest uppercase font-medium">All Rooms</span>
        </Link>

        {/* Hero Text */}
        <div className="absolute inset-0 flex items-end pb-32 px-10 lg:px-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-9 h-9 text-amber-400 fill-amber-400 drop-shadow-glow" />
                ))}
              </div>
              <span className="text-amber-300 text-sm tracking-widest uppercase">Signature Collection</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                Deluxe Room
              </span>
            </h1>
            <p className="text-2xl text-gray-300 font-light max-w-3xl">
              Ruang 45–52 m² yang memadukan kemewahan modern dengan kenyamanan terbaik — 
              pilihan sempurna untuk pelancong yang menghargai detail.
            </p>
          </div>
        </div>
      </section>

      {/* Detail Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 -left-32 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl animate-drift-slow"></div>
          <div className="absolute bottom-32 -right-32 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl animate-drift-slow" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Left: Description + Amenities */}
            <div className="lg:col-span-2 space-y-16">
              <div>
                <h2 className="text-5xl font-bold mb-8">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                    Refined Comfort, Elevated
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed font-light">
                  Deluxe Room kami dirancang dengan palet warna hangat, aksen emas brushed, dan material premium 
                  yang memberikan rasa tenang sekaligus mewah — cocok untuk perjalanan bisnis maupun liburan romantis.
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-semibold text-amber-400 mb-10">Room Highlights</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {amenities.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="mt-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full shadow-lg shadow-amber-500/40 
                        group-hover:scale-150 transition-transform duration-300"></div>
                      <span className="text-gray-300 text-lg font-light group-hover:text-amber-200 transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden Divider */}
              <div className="flex items-center gap-8 my-16 opacity-60">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                <div className="w-4 h-4 rotate-45 border-2 border-amber-500 shadow-lg"></div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              </div>
            </div>

            {/* Right: Sticky Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-10 bg-gradient-to-br from-gray-950/90 via-black/95 to-amber-950/30 
                backdrop-blur-2xl rounded-3xl border border-amber-800/50 overflow-hidden shadow-2xl">
                <div className="p-10">
                  <div className="text-center mb-10">
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                      IDR 4.800.000
                    </div>
                    <p className="text-gray-400 mt-2 text-sm">per malam ++ · termasuk sarapan untuk 2 orang</p>
                  </div>

                  <div className="space-y-5 mb-10 bg-black/40 rounded-2xl p-6 border border-amber-900/50">
                    <div className="flex justify-between text-gray-300">
                      <span className="font-light">Luas</span>
                      <span className="text-amber-400 font-semibold">45–52 m²</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span className="font-light">Kapasitas</span>
                      <span className="text-amber-400 font-semibold">2 Dewasa</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span className="font-light">Pilihan Bed</span>
                      <span className="text-amber-400 font-semibold">King / Twin</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 
                      text-white font-bold text-lg py-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-amber-500/50 
                      border border-amber-400 transition-all duration-400">
                      Reserve This Room
                    </Button>

                    <Button variant="outline" className="w-full border-2 border-amber-600 text-amber-400 
                      hover:bg-amber-950/50 hover:text-amber-300 py-8 rounded-2xl font-medium text-lg transition-all">
                      Check Dates & Rates
                    </Button>
                  </div>

                  <div className="mt-10 pt-8 border-t border-amber-900/40 text-center text-xs text-gray-500">
                    <p className="mb-1">Pembatalan gratis hingga 24 jam sebelum kedatangan</p>
                    <p>Best available rate • No hidden charges</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-2xl shadow-amber-400/50"></div>
    </>
  );
}