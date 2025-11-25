import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ExecutiveSuiteDetail() {
  const gallery = [
    "/executive-1.jpg",
    "/executive-2.jpg",
    "/executive-3.jpg",
    "/executive-4.jpg",
    "/executive-5.jpg",
  ];

  const amenities = [
    "King bed dengan Egyptian cotton 1000-thread count",
    "68 m² luas total + separate living area",
    "Panoramic floor-to-ceiling windows",
    "75” OLED Smart TV + Bose surround sound",
    "Complimentary premium minibar (wine & spirits)",
    "Nespresso Vertuo + Jing Tea collection",
    "Deep soaking tub + separate rain shower",
    "Diptyque Paris bathroom amenities",
    "Executive work desk dengan ergonomic chair",
    "High-speed Wi-Fi 1 Gbps + VPN support",
    "Access to Executive Lounge (daily cocktail & canapés)",
    "Priority check-in & late check-out hingga 4 PM",
    "Dedicated concierge line",
    "Daily pressed newspaper & shoeshine service",
  ];

  return (
    <>
      {/* Hero Full-Screen */}
      <section className="relative h-screen min-h-[750px] overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="/executive-main.jpg"
            alt="Executive Suite - Golden Skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        </div>

        {/* Floating Gallery */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-5 z-20">
          {gallery.map((img, i) => (
            <div
              key={i}
              className="w-28 h-20 rounded-2xl overflow-hidden border-2 border-amber-700/70 hover:border-amber-400 
                         transition-all duration-400 cursor-pointer group shadow-2xl"
            >
              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-10 left-10 z-30 flex items-center gap-3 text-white/80 hover:text-amber-400 transition-all group"
        >
          <ChevronLeft className="w-7 h-7 group-hover:-translate-x-2 transition" />
          <span className="text-sm tracking-widest uppercase font-medium">Back to Collection</span>
        </Link>

        {/* Hero Caption */}
        <div className="absolute inset-0 flex items-end pb-36 px-10 lg:px-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-8 mb-6">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-11 h-11 text-amber-400 fill-amber-400 drop-shadow-glow" />
                ))}
              </div>
              <span className="text-amber-300 text-sm tracking-widest uppercase font-light">
                Signature Collection • Executive Level
              </span>
            </div>

            <h1 className="text-7xl md:text-9xl font-bold text-white leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-yellow-600 
                drop-shadow-2xl">
                Executive Suite
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 font-light mt-4 max-w-4xl">
              68 m² ruang pribadi dengan living area terpisah dan akses Executive Lounge — 
              dirancang untuk para decision-maker yang menginginkan privasi, produktivitas, dan kemewahan sejati.
            </p>
          </div>
        </div>
      </section>

      {/* Detail Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        {/* Golden Orbs Background */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 -left-48 w-96 h-96 bg-amber-600/30 rounded-full blur-3xl animate-drift-slow"></div>
          <div className="absolute bottom-0 -right-48 w-96 h-96 bg-yellow-600/20 rounded-full blur-3xl animate-drift-slow" style={{animationDelay: '5s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-20">
            {/* Left: Content */}
            <div className="lg:col-span-2 space-y-20">
              {/* Tagline */}
              <div>
                <h2 className="text-5xl md:text-6xl font-bold mb-10">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                    Power. Privacy. Perfection.
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed font-light max-w-3xl">
                  Executive Suite adalah pernyataan. Ruang kerja yang elegan, living area terpisah, 
                  dan akses eksklusif ke Executive Lounge menjadikan suite ini pilihan utama para CEO, 
                  diplomat, dan traveler yang menghargai efisiensi tanpa mengorbankan kemewahan.
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold text-amber-400 mb-12">
                  Executive Privileges
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {amenities.map((item, i) => (
                    <div key={i} className="flex items-start gap-5 group">
                      <div className="mt-2 w-3 h-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full 
                        shadow-lg shadow-amber-500/60 group-hover:scale-175 transition-transform duration-300"></div>
                      <span className="text-gray-200 text-lg font-light group-hover:text-amber-200 transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elegant Divider */}
              <div className="flex items-center gap-10 opacity-70">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                <div className="w-6 h-6 rotate-45 border-2 border-amber-500 shadow-2xl shadow-amber-500/40"></div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              </div>
            </div>

            {/* Right: Sticky Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-10 bg-gradient-to-br from-gray-950/95 via-black to-amber-950/40 
                backdrop-blur-3xl rounded-3xl border border-amber-700/60 overflow-hidden shadow-2xl shadow-black/80">
                <div className="p-10 lg:p-12">
                  <div className="text-center mb-10">
                    <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text 
                      bg-gradient-to-r from-amber-100 via-amber-400 to-yellow-600">
                      IDR 6.800.000
                    </div>
                    <p className="text-gray-400 mt-3 text-sm tracking-wide">
                      per malam ++ · termasuk Executive Lounge access
                    </p>
                  </div>

                  <div className="space-y-6 mb-10 bg-black/50 rounded-2xl p-8 border border-amber-800/50">
                    <div className="flex justify-between text-gray-200">
                      <span className="font-light">Luas Suite</span>
                      <span className="text-amber-400 font-bold">68 m²</span>
                    </div>
                    <div className="flex justify-between text-gray-200">
                      <span className="font-light">Living Area</span>
                      <span className="text-amber-400 font-bold">Terpisah</span>
                    </div>
                    <div className="flex justify-between text-gray-200">
                      <span className="font-light">Lounge Access</span>
                      <span className="text-amber-400 font-bold">Termasuk</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 
                      hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-lg py-9 rounded-2xl 
                      shadow-2xl hover:shadow-amber-500/60 border border-amber-400 transition-all duration-500">
                      Book Executive Suite
                    </Button>

                    <Button variant="outline" className="w-full border-2 border-amber-600 text-amber-400 
                      hover:bg-amber-950/60 hover:text-amber-200 py-9 rounded-2xl font-medium text-lg transition-all">
                      View Availability
                    </Button>
                  </div>

                  <div className="mt-10 pt-8 border-t border-amber-900/50 text-center text-xs text-gray-500">
                    <p className="mb-2">Gratis upgrade (jika tersedia) • Late check-out hingga 16:00</p>
                    <p>Best rate guaranteed</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Golden Line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-2xl shadow-amber-400/60"></div>
    </>
  );
}