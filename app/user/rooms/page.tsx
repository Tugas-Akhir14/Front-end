'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // TAMBAHKAN INI
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
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  booked: {
    label: 'Booked',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
  },
  maintenance: {
    label: 'Maintenance',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
  },
  cleaning: {
    label: 'Cleaning',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
};

// ===== Fallback Status =====
const getStatusConfig = (status: string) => {
  const key = status?.toLowerCase();
  return STATUS_CONFIG[key] || { label: status || 'Unknown', bg: 'bg-gray-100', text: 'text-gray-800' };
};

// ===== Helpers =====
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

const toTitle = (t: string) => {
  switch (t?.toLowerCase()) {
    case 'superior': return 'Superior Room';
    case 'deluxe': return 'Deluxe Room';
    case 'executive': return 'Executive Suite';
    default: return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Room';
  }
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// Preset tipe kamar
const TYPE_PRESETS: Record<string, { features: string[]; amenities: React.ComponentType[]; size: string }> = {
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
  const router = useRouter(); // PINDAHKAN KE SINI
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
        const data: RoomAPI[] = Array.isArray(json?.data) ? json.data : [];
        if (alive) setRooms(data);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Gagal mengambil data kamar');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
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

  // PINDAHKAN handleBookNow KE SINI
  const handleBookNow = (roomId: number, status: string) => {
    if (status === 'available') {
      router.push(`/user/book?room=${roomId}`);
    }
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-80 bg-gradient-to-r from-blue-900 to-purple-900">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Our <span className="text-yellow-400">Mutiara Rooms</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200">
                Discover the perfect accommodation for your stay
              </p>
            </div>
          </div>
        </section>

        {/* Rooms Grid Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Accommodation Options</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose from our carefully curated selection of rooms and suites.
              </p>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div className="text-center text-gray-600">Memuat kamar...</div>
            )}
            {err && !loading && (
              <div className="text-center text-red-600">Error: {err}</div>
            )}

            {!loading && !err && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {cards.map((room) => (
                  <Card
                    key={room.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="relative h-80">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-room.jpg';
                        }}
                      />

                      {/* STATUS BADGE */}
                      <div
                        className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${room.statusStyle.bg} ${room.statusStyle.text} ${room.statusStyle.border || ''} shadow-md`}
                      >
                        {room.statusLabel}
                      </div>

                      {/* Harga Badge */}
                      <div className="absolute top-4 left-4 bg-yellow-600 text-white px-4 py-2 rounded-full font-semibold text-lg shadow-lg">
                        {room.priceLabel}
                      </div>

                      {/* Nomor Kamar */}
                      <div className="absolute top-16 left-4 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow">
                        No. {room.number}
                      </div>

                      {/* Size & Guests */}
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                        <div className="flex items-center space-x-2">
                          <Square className="w-4 h-4" />
                          <span>{room.size}</span>
                          <Users className="w-4 h-4 ml-2" />
                          <span>{room.guests}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{room.name}</h3>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6 text-lg">{room.description}</p>

                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Room Features:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {room.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-600">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-2">
                          {room.amenities.map((AmenityIcon, idx) => (
                            <div key={idx} className="p-2 bg-gray-100 rounded-lg">
                              <AmenityIcon className="w-5 h-5 text-gray-600" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-lg transition-all"
                          onClick={() => handleBookNow(room.id, room.status)} // PAKAI INI
                          disabled={room.status !== 'available'}
                        >
                          {room.status === 'available' ? 'Book Now' : 'Not Available'}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-yellow-600 text-yellow-600 hover:bg-yellow-50 py-3 text-lg"
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
              <div className="text-center text-gray-500">Tidak ada kamar tersedia saat ini.</div>
            )}
          </div>
        </section>

        {/* Hotel Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Hotel Amenities</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Enjoy world-class amenities and services.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotelFeatures.map((feature, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow border-yellow-100">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-yellow-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Book?</h2>
            <p className="text-xl mb-8 opacity-90">
              Experience Mutiara comfort. Book your room today.
            </p>
            <div className="space-x-4">
              <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100" asChild>
                <Link href="/">Book Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-yellow-600" asChild>
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