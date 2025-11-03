'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Crown,
  Camera,
} from 'lucide-react';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';

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
    bg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    text: 'text-black',
    border: 'border-amber-300',
  },
  booked: {
    label: 'Booked',
    bg: 'bg-gradient-to-r from-gray-700 to-gray-800',
    text: 'text-white',
    border: 'border-gray-600',
  },
  maintenance: {
    label: 'Maintenance',
    bg: 'bg-gradient-to-r from-orange-600 to-amber-600',
    text: 'text-white',
    border: 'border-orange-500',
  },
  cleaning: {
    label: 'Cleaning',
    bg: 'bg-gradient-to-r from-slate-700 to-gray-700',
    text: 'text-white',
    border: 'border-slate-600',
  },
};

// ===== Fallback Status =====
const getStatusConfig = (status: string) => {
  const key = status?.toLowerCase();
  return STATUS_CONFIG[key] || { label: status || 'Unknown', bg: 'bg-gray-800', text: 'text-white' };
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

  const handleBookNow = (roomId: number, status: string) => {
    if (status === 'available') {
      // router.push(`/user/book?room=${roomId}`);
      console.log('Book room:', roomId);
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <main>
        <Header />  
        {/* Hero Section */}
        <section className="relative h-[600px] bg-gradient-to-br from-black via-gray-900 to-amber-950 overflow-hidden">
          {/* Animated gold pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #d4af37 2px, transparent 2px)',
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105 opacity-40"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg)' }}
          />
          
          {/* Floating sparkles */}
          <div className="absolute top-20 left-10 animate-pulse z-20">
            <Sparkles className="w-10 h-10 text-amber-400 opacity-60" />
          </div>
          <div className="absolute top-32 right-20 animate-pulse z-20" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-8 h-8 text-yellow-300 opacity-60" />
          </div>
          <div className="absolute bottom-40 left-1/3 animate-pulse z-20" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-9 h-9 text-amber-500 opacity-60" />
          </div>
          
          {/* Gold glow effects */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          
          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="text-center text-white max-w-5xl px-4 space-y-8">
              
              {/* Badge */}
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-amber-900/40 to-yellow-900/40 backdrop-blur-md px-6 py-3 rounded-full border-2 border-amber-600/30">
                  <span className="text-amber-300 text-sm font-bold tracking-widest uppercase">Visual Excellence</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                  Rooms
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-10 text-amber-100/90 font-light max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in the opulent beauty and timeless elegance of our luxury sanctuary
              </p>
              
              {/* Decorative line */}
              <div className="flex justify-center mb-10">
                <div className="h-px w-64 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
               
              </div>
            </div>
          </div>
          
          {/* Bottom gradient transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20"></div>
        </section>

        {/* Rooms Grid Section */}
        <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block mb-4">
                <div className="flex items-center space-x-2 text-amber-400">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400"></div>
                  <Star className="w-5 h-5 fill-current" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400"></div>
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                Our Exclusive Rooms
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Indulge in sophistication and comfort with our handpicked collection
              </p>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div className="text-center text-amber-400 text-lg">Loading luxury rooms...</div>
            )}
            {err && !loading && (
              <div className="text-center text-red-400">Error: {err}</div>
            )}

            {!loading && !err && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cards.map((room) => (
                  <Card
                    key={room.id}
                    className="overflow-hidden bg-gradient-to-br from-gray-900 to-black border-2 border-amber-900/30 hover:border-amber-600/50 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-900/20"
                  >
                    <div className="relative h-80 group">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-room.jpg';
                        }}
                      />
                      
                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60"></div>

                      {/* STATUS BADGE */}
                      <div
                        className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${room.statusStyle.bg} ${room.statusStyle.text} ${room.statusStyle.border || ''} shadow-2xl backdrop-blur-sm`}
                      >
                        {room.statusLabel}
                      </div>

                      {/* Harga Badge */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-5 py-2.5 rounded-full font-bold text-lg shadow-2xl border-2 border-amber-300">
                        {room.priceLabel}
                      </div>

                      {/* Nomor Kamar */}
                      <div className="absolute top-20 left-4 bg-black/80 backdrop-blur-sm text-amber-400 px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-amber-600/30">
                        Room {room.number}
                      </div>

                      {/* Size & Guests */}
                      <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm text-amber-100 px-4 py-2 rounded-lg text-sm border border-amber-600/30">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1.5">
                            <Square className="w-4 h-4 text-amber-400" />
                            <span>{room.size}</span>
                          </div>
                          <div className="h-4 w-px bg-amber-600/30"></div>
                          <div className="flex items-center space-x-1.5">
                            <Users className="w-4 h-4 text-amber-400" />
                            <span>{room.guests}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8 bg-gradient-to-b from-gray-900 to-black">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-bold text-amber-100">{room.name}</h3>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-400 mb-8 text-base leading-relaxed">{room.description}</p>

                      <div className="mb-8">
                        <h4 className="font-bold text-amber-300 mb-4 text-sm uppercase tracking-wider">Room Features</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {room.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-300 text-sm">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-3 shadow-lg shadow-amber-400/50"></span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-8 pb-6 border-b border-amber-900/30">
                        <div className="flex space-x-3">
                          {room.amenities.map((AmenityIcon, idx) => (
                            <div key={idx} className="p-2.5 bg-gradient-to-br from-amber-900/20 to-black rounded-lg border border-amber-800/30 hover:border-amber-600/50 transition-colors">
                              <AmenityIcon className="w-5 h-5 text-amber-400" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold py-6 text-base transition-all shadow-lg hover:shadow-amber-900/50 border-2 border-amber-400 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:border-gray-700"
                          onClick={() => handleBookNow(room.id, room.status)}
                          disabled={room.status !== 'available'}
                        >
                          {room.status === 'available' ? 'Reserve Now' : 'Not Available'}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-2 border-amber-600 text-amber-400 hover:bg-amber-950 hover:text-amber-300 py-6 text-base transition-all font-semibold"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !err && rooms.length === 0 && (
              <div className="text-center text-gray-500">No rooms available at this time.</div>
            )}
          </div>
        </section>

        {/* Hotel Features */}
        <section className="py-24 bg-gradient-to-b from-black via-amber-950/10 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block mb-4">
                <div className="flex items-center space-x-2 text-amber-400">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400"></div>
                  <Sparkles className="w-5 h-5" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400"></div>
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                Premium Amenities
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                World-class facilities for an unforgettable experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotelFeatures.map((feature, index) => (
                <Card key={index} className="text-center p-8 bg-gradient-to-br from-gray-900 to-black border-2 border-amber-900/30 hover:border-amber-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20 group">
                  <CardContent className="pt-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-900/30 to-amber-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-800/30 group-hover:border-amber-600/50 transition-colors">
                      <feature.icon className="w-9 h-9 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-100 mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

   
        <Footer />
      </main>
    </div>
  );
}