'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar, Coffee, Dumbbell, MapPin, Star, TrendingUp, Utensils, Wifi, ArrowRight } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ChatBot from '@/components/Chatbot/ChatBot';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import Swal from 'sweetalert2';

// Matches News/Contact Page Theme
const GOLD = '#d4af37';

// ================== Types ==================
type Review = {
  id: number;
  rating: number;
  comment: string;
  guest_name: string | null;
  created_at: string;
};

// Static Rooms Data
const staticRooms = [
  {
    id: 1,
    number: '101',
    type: 'superior' as const,
    price: 320000,
    capacity: 2,
    image: '/superior.jpg',
    description: 'Elegant and comfortable room with modern amenities',
    link: '/user/type/superior'
  },
  {
    id: 2,
    number: '205',
    type: 'deluxe' as const,
    price: 630000,
    capacity: 2,
    image: '/deluxe.jpg',
    description: 'Spacious deluxe room with balcony and premium facilities',
    link: '/user/type/deluxe'
  },
  {
    id: 3,
    number: '301',
    type: 'executive' as const,
    price: 725000,
    capacity: 2,
    image: '/executive.jpg',
    description: 'Luxurious executive suite with living area and premium services',
    link: '/user/type/executive'
  }
];

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [otaAnswer, setOtaAnswer] = useState<string>("");

  const handleConfirm = async () => {
    if (otaAnswer === "ya") {
      await Swal.fire({
        icon: "info",
        iconColor: "#0ea5e9",
        title: "<strong>Terima Kasih atas Kejujuran Anda!</strong>",
        html: `
        <p class="text-gray-600 text-base leading-relaxed">
          Proses pemesanan dibatalkan untuk menghindari double booking.<br>
          Silakan gunakan booking OTA Anda atau batalkan terlebih dahulu jika ingin memesan langsung di sini.
        </p>
      `,
        confirmButtonText: "OK",
        confirmButtonColor: "#0ea5e9",
        color: "#374151",
        background: "#ffffff",
        backdrop: "rgba(0,0,0,0.4)",
        customClass: {
          title: "text-2xl font-bold text-gray-800",
          confirmButton: "px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all",
        },
        buttonsStyling: false,
      });

      setOtaAnswer("");
      setOpen(false);
    }
    else if (otaAnswer === "tidak") {
      await Swal.fire({
        icon: "success",
        title: "Sedang mengalihkan...",
        text: "Menuju halaman pemesanan kamar",
        timer: 1600,
        timerProgressBar: true,
        showConfirmButton: false,
        iconColor: "#10b981",
        background: "#ffffff",
      });

      window.location.href = "/user/rooms";
    }
  };

  // ================== Fetch Reviews ==================
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>('/public/reviews');
        const approvedReviews = response.data.filter((r) => r.rating >= 0);
        setReviews(approvedReviews.slice(0, 3)); // Only show top 3
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        setReviews([
          { id: 1, rating: 5, comment: 'Pelayanan memukau, kamar super nyaman.', guest_name: 'Sarah Johnson', created_at: '2025-01-15' },
          { id: 2, rating: 5, comment: 'Lokasi strategis, fasilitas mantap.', guest_name: 'Michael Chen', created_at: '2025-01-10' },
          { id: 3, rating: 4, comment: 'Spa top tier, staf ramah.', guest_name: 'Emma Williams', created_at: '2025-01-08' },
        ]);
      }
    };
    fetchReviews();
  }, []);

  // ================== Helpers ==================
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTypeName = (type?: string): string => {
    const normalized = type?.trim().toLowerCase();
    if (!normalized) return 'Room';
    const map: Record<string, string> = {
      superior: 'Superior Room',
      deluxe: 'Deluxe Room',
      executive: 'Executive Suite',
    };
    return map[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1) + ' Room';
  };

  // === RATING STARS COMPONENT ===
  const RatingStars = ({ value }: { value: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= value ? 'fill-current' : 'text-gray-700'}`}
          style={{ color: i <= value ? GOLD : undefined }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );

  return (
    <>
      <Header />
      <main className="bg-black text-gray-100 min-h-screen">

       {/* Hero Section - Background Image */}
<section className="relative h-screen overflow-hidden">
  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center "
    style={{
      backgroundImage: "url('/mutiara.jpg')",
    }}
    aria-hidden="true"
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black" />

  {/* Gold Radial Gradient */}
  <div
    className="absolute inset-0 opacity-40"
    style={{
      background: `radial-gradient(60% 80% at 50% 0%, ${GOLD} 0%, transparent 70%)`,
    }}
  />

  <div className="relative z-10 flex h-full items-center justify-center">
    <div className="text-center px-4 max-w-5xl space-y-8">
      <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-4 text-white">
        Welcome to <br />
        <span style={{ color: GOLD }}>Mutiara Hotel</span>
      </h1>

      <p className="text-xl md:text-3xl text-gray-300 font-light leading-relaxed max-w-3xl mx-auto">
        Discover unparalleled luxury and comfort in the heart of paradise
      </p>

      {/* tombol & konten lain tetap sama */}
    </div>
  </div>
</section>


        {/* Features Strip */}
        <section className="border-y border-gray-800 bg-gray-950 py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Wifi, text: 'Free WiFi' },
                { icon: Coffee, text: '24/7 Service' },
                { icon: Utensils, text: 'Restaurant' },
                { icon: Dumbbell, text: 'Fitness Center' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: GOLD }} />
                  <span className="font-medium text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rooms Section */}
        <section className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold text-white mb-4">
                Signature <span style={{ color: GOLD }}>Suites</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Experience luxury tailored to your perfection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {staticRooms.map((room) => (
                <Card
                  key={room.id}
                  className="bg-gray-900 border-gray-800 text-gray-100 overflow-hidden hover:border-yellow-800/60 hover:shadow-2xl hover:shadow-yellow-900/10 transition-all duration-500 group rounded-3xl"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.type}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700">
                      <span className="font-bold text-lg" style={{ color: GOLD }}>{formatPrice(room.price)}</span>
                      <span className="text-xs text-gray-400"> / night</span>
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-500 transition-colors">
                      {formatTypeName(room.type)}
                    </h3>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                      {room.description}
                    </p>

                    <div className="flex gap-4">
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="flex-1 text-black font-bold h-12 rounded-xl hover:opacity-90"
                            style={{ backgroundColor: GOLD }}
                          >
                            Book Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-gray-950 border-gray-800 text-gray-100">
                          <DialogHeader>
                            <DialogTitle className="text-2xl text-white">Konfirmasi Pemesanan</DialogTitle>
                            <DialogDescription className="text-gray-400">
                               Informasi ini membantu kami menyesuaikan strategi distribusi dan reservasi properti Anda.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-6">
                            <RadioGroup value={otaAnswer} onValueChange={setOtaAnswer} required>
                              <div className="flex items-center space-x-3 mb-4">
                                <RadioGroupItem value="ya" id="ya" className="border-gray-500 text-yellow-500" />
                                <Label htmlFor="ya" className="text-lg cursor-pointer text-gray-300"> Properti aktif di platform seperti Traveloka, Booking.com, Agoda, dll.</Label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="tidak" id="tidak" className="border-gray-500 text-yellow-500" />
                                <Label htmlFor="tidak" className="text-lg cursor-pointer text-gray-300">Tidak,  Belum terdaftar di OTA</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-700 text-gray-400 hover:bg-gray-800">Batal</Button>
                            <Button onClick={handleConfirm} disabled={!otaAnswer} className="font-bold text-black" style={{ backgroundColor: GOLD }}>Konfirmasi</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button asChild variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 h-12 rounded-xl">
                        <Link href={room.link}>Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-gray-950 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-2">Guest <span style={{ color: GOLD }}>Stories</span></h2>
                <p className="text-gray-400">What our guests say about their stay.</p>
              </div>
              <Button variant="link" className="text-gray-400 hover:text-white p-0">
                View all reviews <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review, i) => (
                <Card key={i} className="bg-black border-gray-800 p-8 rounded-2xl relative shadow-lg hover:border-gray-700 transition-colors">
                  <div className="mb-6">
                    <RatingStars value={review.rating} />
                  </div>
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">"{review.comment}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black" style={{ backgroundColor: GOLD }}>
                      {(review.guest_name || 'G')[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white">{review.guest_name || 'Guest'}</div>
                      <div className="text-xs text-gray-500">Verified Review</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50" />
          <div className="text-center relative z-10 px-6 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Ready for an <span style={{ color: GOLD }}>Unforgettable</span> Stay?</h2>
            <p className="text-2xl text-gray-400 mb-10 font-light">Book directly with us for the best rates and exclusive offers.</p>

            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="text-black font-bold px-10 py-8 text-xl rounded-full hover:scale-105 transition-transform shadow-2xl"
                style={{ backgroundColor: GOLD }}
                onClick={() => setOpen(true)}
              >
                Book Your Stay Now
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <ChatBot />
    </>
  );
}
