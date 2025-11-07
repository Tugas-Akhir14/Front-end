'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Star,
  Wifi,
  Car,
  Coffee,
  Tv,
  Dumbbell,
  Waves,
  Utensils,
  Users,
  Square,
  Sparkles,
} from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

// ===== Types from API =====
type RoomAPI = {
  id: number;
  number: string;
  type: 'superior' | 'deluxe' | 'executive' | string;
  price: number;
  capacity: number;
  description: string;
  image: string;
  status: 'available' | 'booked' | 'maintenance' | 'cleaning' | string;
  created_at: string;
  updated_at: string;
};

// ===== Badge Status Config =====
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border?: string }
> = {
  available: {
    label: 'Available',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  booked: {
    label: 'Booked',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  maintenance: {
    label: 'Maintenance',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  cleaning: {
    label: 'Cleaning',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
};

// ===== Fallback Status =====
const getStatusConfig = (status: string) => {
  const key = status?.toLowerCase();
  return STATUS_CONFIG[key] || {
    label: status || 'Unknown',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };
};

// ===== Helpers =====
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

const toTitle = (t: string) => {
  switch (t?.toLowerCase()) {
    case 'superior':
      return 'Superior Room';
    case 'deluxe':
      return 'Deluxe Room';
    case 'executive':
      return 'Executive Suite';
    default:
      return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Room';
  }
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

// Preset tipe kamar
const TYPE_PRESETS: Record<
  string,
  { features: string[]; amenities: React.ComponentType[]; size: string }
> = {
  superior: {
    features: ['Queen Size Bed', 'Free Wi-Fi', 'Smart TV', 'Coffee Maker', 'Private Bathroom'],
    amenities: [Wifi, Tv, Coffee],
    size: '24 m²',
  },
  deluxe: {
    features: ['King Size Bed', 'Sitting Area', 'Mini Bar', 'Work Desk', 'City View'],
    amenities: [Wifi, Tv, Coffee, Utensils],
    size: '32 m²',
  },
  executive: {
    features: ['Super King Bed', 'Living Room', 'Jacuzzi', 'Balcony', 'Butler Service'],
    amenities: [Wifi, Tv, Coffee, Utensils, Waves, Dumbbell, Car],
    size: '45 m²',
  },
};

const buildPreset = (type: string) => {
  const key = type?.toLowerCase();
  if (TYPE_PRESETS[key]) return TYPE_PRESETS[key];
  return {
    features: ['Comfortable Bed', 'Free Wi-Fi', 'Smart TV', 'Private Bathroom'],
    amenities: [Wifi, Tv],
    size: '28 m²',
  };
};

const hotelFeatures = [
  { icon: Wifi, title: 'Free High-Speed Wi-Fi', description: 'Stay connected with our complimentary high-speed internet' },
  { icon: Car, title: 'Valet Parking', description: 'Complimentary valet parking service for all guests' },
  { icon: Utensils, title: 'Fine Dining', description: 'Award-winning restaurants with international cuisine' },
  { icon: Dumbbell, title: 'Fitness Center', description: '24/7 state-of-the-art fitness facility' },
  { icon: Waves, title: 'Pool & Spa', description: 'Infinity pool and full-service Mutiara spa' },
  { icon: Star, title: '5-Star Service', description: 'Dedicated staff ensuring exceptional experience' },
];

// ===== KOMPONEN UTAMA =====
export default function Rooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API_BASE}/public/rooms`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: RoomAPI[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        if (alive) setRooms(data);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Gagal mengambil data kamar');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const cards = useMemo(() => {
    return rooms.map((r) => {
      const preset = buildPreset(r.type);
      const statusConfig = getStatusConfig(r.status);
      return {
        id: r.id,
        number: r.number,
        name: `${toTitle(r.type)} • No. ${r.number}`,
        priceLabel: `${formatRupiah(r.price)}/malam`,
        image: r.image || '/placeholder-room.jpg',
        description: r.description || 'Comfortable room with thoughtful amenities.',
        features: preset.features,
        size: preset.size,
        guests: `${r.capacity} Guests`,
        amenities: preset.amenities,
        status: r.status,
        statusLabel: statusConfig.label,
        statusStyle: {
          bg: statusConfig.bg,
          text: statusConfig.text,
          border: statusConfig.border,
        },
      };
    });
  }, [rooms]);

  const handleBookNow = (roomId: number, status: string) => {
    if (status?.toLowerCase() === 'available') {
      router.push(`/user/book?room=${roomId}`);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Hero Section - Elegant White & Gold */}
        <section className="relative h-96 bg-gradient-to-br from-white via-amber-50 to-white overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center max-w-4xl px-4">
              <div className="flex justify-center mb-6">
                <Sparkles className="w-12 h-12 text-amber-500" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                Mutiara Rooms
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-light">
                Discover the perfect accommodation for your luxurious stay
              </p>
              <div className="mt-8 h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>
          </div>
        </section>

        {/* Rooms Grid Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block mb-4">
                <span className="text-sm font-semibold text-amber-600 tracking-widest uppercase">Our Collection</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">Accommodation Options</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                Choose from our carefully curated selection of rooms and suites
              </p>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
                <p className="mt-4 text-gray-500">Memuat kamar...</p>
              </div>
            )}
            {err && !loading && (
              <div className="text-center py-20 text-rose-600 bg-rose-50 rounded-lg p-8">
                Error: {err}
              </div>
            )}

            {!loading && !err && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {cards.map((room) => (
                  <Card
                    key={room.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 bg-white group"
                  >
                    <div className="relative h-80 overflow-hidden">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/placeholder-room.jpg';
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* STATUS BADGE */}
                      <div
                        className={`absolute top-5 right-5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-sm ${room.statusStyle.bg} ${room.statusStyle.text} ${room.statusStyle.border ?? ''} shadow-lg`}
                      >
                        {room.statusLabel}
                      </div>

                      {/* Harga Badge */}
                      <div className="absolute top-5 left-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-full font-bold text-lg shadow-xl backdrop-blur-sm">
                        {room.priceLabel}
                      </div>

                      {/* Nomor Kamar */}
                      <div className="absolute top-20 left-5 bg-white/95 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        Room {room.number}
                      </div>

                      {/* Size & Guests */}
                      <div className="absolute bottom-5 left-5 bg-white/95 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1.5">
                            <Square className="w-4 h-4 text-amber-600" />
                            <span>{room.size}</span>
                          </div>
                          <div className="w-px h-4 bg-gray-300" />
                          <div className="flex items-center space-x-1.5">
                            <Users className="w-4 h-4 text-amber-600" />
                            <span>{room.guests}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8 bg-white">
                      <div className="flex justify-between items-start mb-5">
                        <h3 className="text-2xl font-bold text-gray-900">{room.name}</h3>
                        <div className="flex space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-8 text-base leading-relaxed">{room.description}</p>

                      <div className="mb-8">
                        <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Room Features</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {room.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-600 text-sm">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-3 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-100">
                        <div className="flex space-x-3">
                          {room.amenities.map((AmenityIcon, idx) => {
                            const Icon = AmenityIcon as React.ComponentType<{ className?: string }>;
                            return (
                              <div key={idx} className="p-2.5 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                                <Icon className="w-5 h-5 text-amber-600" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-base font-semibold transition-all shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400"
                          onClick={() => handleBookNow(room.id, room.status)}
                          disabled={room.status?.toLowerCase() !== 'available'}
                        >
                          {room.status?.toLowerCase() === 'available' ? 'Book Now' : 'Not Available'}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-2 border-amber-500 text-amber-600 hover:bg-amber-50 py-6 text-base font-semibold transition-all"
                          asChild
                        >
                          <Link href={`/rooms/${room.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !err && rooms.length === 0 && (
              <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-lg">
                Tidak ada kamar tersedia saat ini.
              </div>
            )}
          </div>
        </section>

        {/* Hotel Features */}
        <section className="py-24 bg-gradient-to-br from-amber-50 via-white to-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block mb-4">
                <span className="text-sm font-semibold text-amber-600 tracking-widest uppercase">Premium Amenities</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">Hotel Amenities</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                Enjoy world-class amenities and services
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotelFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="text-center p-8 hover:shadow-xl transition-all duration-300 border border-amber-100 bg-white group hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-10 h-10 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-5xl font-bold mb-6">Ready to Book?</h2>
            <p className="text-xl mb-10 opacity-95 font-light max-w-2xl mx-auto">
              Experience Mutiara luxury and comfort. Reserve your perfect room today and create unforgettable memories.
            </p>
            <div className="flex justify-center gap-6">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-gray-50 px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href="/user/book">Book Your Stay</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-10 py-6 text-lg font-semibold transition-all"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}