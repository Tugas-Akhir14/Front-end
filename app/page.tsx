'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar, Coffee, Dumbbell, MapPin, Sparkles, Star, TrendingUp, Utensils, Wifi } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ChatBot from '@/components/Chatbot/ChatBot';
import axios from 'axios';
import Link from 'next/link';

// ================== Types dari backend ==================
type Room = {
  id: number;
  number: string;
  type: 'superior' | 'deluxe' | 'executive' | string;
  price: number;
  capacity: number;
  description?: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  guest_name: string | null;
  created_at: string;
};

// Vision & Mission publik
type VisionMission = {
  vision: string;
  missions: string[];     // diserialisasi dari datatypes.JSON -> array
  active?: boolean;
  updated_at?: string;
};

export default function Home() {
  const [reservationData, setReservationData] = useState<any>(null);

  // Rooms
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);

  // Vision Mission
  const [vm, setVm] = useState<VisionMission | null>(null);
  const [loadingVm, setLoadingVm] = useState(true);
  const [vmError, setVmError] = useState<string | null>(null);

  // ================== Fetch Reviews ==================
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>('/public/reviews');
        const approvedReviews = response.data.filter((r) => r.rating >= 4);
        setReviews(approvedReviews.slice(0, 6));
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        // Fallback statis yang SESUAI tipe Review
        setReviews([
          { id: 1, rating: 5, comment: 'Pelayanan memukau, kamar super nyaman.', guest_name: 'Sarah Johnson', created_at: '2025-01-15' },
          { id: 2, rating: 5, comment: 'Lokasi strategis, fasilitas mantap.', guest_name: 'Michael Chen', created_at: '2025-01-10' },
          { id: 3, rating: 4, comment: 'Spa top tier, staf ramah.', guest_name: 'Emma Williams', created_at: '2025-01-08' },
        ]);
      }
    };
    fetchReviews();
  }, []);

  // ================== Fetch Rooms ==================
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        setRoomsError(null);
        const response = await axios.get<{ data: Room[] }>('/public/rooms');
        const allRooms = response.data.data || [];

        const typeMap = new Map<string, Room>();
        const selected: Room[] = [];

        for (const room of allRooms) {
          if (!typeMap.has(room.type) && selected.length < 3) {
            typeMap.set(room.type, room);
            selected.push(room);
          }
        }

        setRooms(selected);
      } catch (err: any) {
        console.error('Failed to fetch rooms:', err);
        setRoomsError('Gagal memuat kamar. Silakan coba lagi nanti.');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  // ================== Fetch Vision & Mission (baru) ==================
  useEffect(() => {
    const fetchVm = async () => {
      try {
        setLoadingVm(true);
        setVmError(null);
        const { data } = await axios.get<{ data: VisionMission }>('/public/visi-misi');
        setVm(data?.data ?? null);
      } catch (err: any) {
        console.error('Failed to fetch vision-mission:', err);
        setVmError('Visi & misi belum tersedia.');
      } finally {
        setLoadingVm(false);
      }
    };
    fetchVm();
  }, []);

  const handleReservationRequest = (data: any) => {
    setReservationData(data);
  };

  // ================== Helpers ==================
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTypeName = (type: string) => {
    const map: Record<string, string> = {
      superior: 'Superior Room',
      deluxe: 'Deluxe Room',
      executive: 'Executive Suite',
    };
    return map[type] || type.charAt(0).toUpperCase() + type.slice(1) + ' Room';
  };

  const getFeatures = (room: Room): string[] => {
    const base = [
      `${room.capacity} Guest${room.capacity > 1 ? 's' : ''}`,
      'Air Conditioning',
      'Private Bathroom',
      'Room Service',
    ];
    if (room.type === 'deluxe' || room.type === 'executive') base.push('Balcony');
    if (room.type === 'executive') base.push('Living Area');
    return base;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-screen isolate overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/hotel.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" aria-hidden="true" />
          
          {/* Animated decorative elements */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center text-white max-w-5xl px-4 space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-yellow-600/20 backdrop-blur-sm px-6 py-3 rounded-full border border-yellow-600/30 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 text-sm font-bold tracking-wide">LUXURY HOSPITALITY</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                Welcome to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 animate-gradient">
                  Mutiara Hotel
                </span>
              </h1>
              
              <p className="text-xl md:text-3xl mb-12 text-gray-200 font-light leading-relaxed max-w-3xl mx-auto">
                Experience unparalleled luxury and comfort in the heart of paradise
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white border-2 border-yellow-500 hover:border-yellow-400 px-10 py-6 text-lg font-bold shadow-2xl hover:shadow-yellow-600/50 transition-all duration-300 transform hover:scale-105 rounded-full"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/50 text-yellow-600 hover:bg-black hover:text-yellow-600 text-lg px-10 py-6 font-bold transition-all duration-300 backdrop-blur-md hover:backdrop-blur-sm transform hover:scale-105 rounded-full"
                >
                  <Link href="/user/rooms">
                    <MapPin className="w-5 h-5 mr-2" />
                    Explore Rooms
                  </Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
                <div className="text-center space-y-2 transform hover:scale-110 transition-transform duration-300">
                  <Award className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide">Happy Guests</div>
                </div>
                <div className="text-center space-y-2 transform hover:scale-110 transition-transform duration-300">
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-2 fill-current" />
                  <div className="text-3xl font-bold text-yellow-400">4.9</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide">Rating</div>
                </div>
                <div className="text-center space-y-2 transform hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-yellow-400">10+</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide">Years Service</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        
         <section className="bg-gradient-to-r from-gray-900 via-black to-gray-900 py-8 border-y border-yellow-600/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Wifi, text: 'Free WiFi' },
                { icon: Coffee, text: '24/7 Service' },
                { icon: Utensils, text: 'Restaurant' },
                { icon: Dumbbell, text: 'Fitness Center' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center space-x-3 text-gray-300 hover:text-yellow-400 transition-colors duration-300 group">
                  <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>


   {/* ================== Vision & Mission (Dinamis) ================== */}
        <section className="relative py-20 bg-black overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header dengan animasi subtle */}
            <div className="text-center mb-16 space-y-4">
              <div className="inline-block">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-4">
                  Vision & Mission
                </h2>
                <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full" />
              </div>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Kompas nilai kami, agar setiap pengalaman menginap punya arah yang jelas: memanjakan tamu tanpa drama.
              </p>
            </div>

            {/* Loading / Error / Content */}
            {loadingVm ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[0, 1, 2].map((i) => (
                  <Card key={i} className="bg-gradient-to-br from-gray-900 to-gray-800 border-yellow-600/20 animate-pulse overflow-hidden">
                    <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-700" />
                    <CardContent className="p-6 space-y-3">
                      <div className="h-6 bg-gray-700 rounded-lg w-3/4" />
                      <div className="h-4 bg-gray-700 rounded-lg w-2/3" />
                      <div className="h-4 bg-gray-700 rounded-lg w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : vmError ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                  <span className="text-2xl text-red-400">⚠</span>
                </div>
                <p className="text-gray-400">{vmError}</p>
              </div>
            ) : !vm ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 border border-gray-700 mb-4">
                  <span className="text-2xl text-gray-500">📋</span>
                </div>
                <p className="text-gray-400">Visi & misi belum diatur.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vision Card - Enhanced with gradient and glow */}
                <Card className="lg:col-span-1 overflow-hidden border border-yellow-600/30 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 hover:border-yellow-500/60 transition-all duration-500 group relative">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:via-yellow-400/10 group-hover:to-yellow-600/5 transition-all duration-500" />
                  
                  {/* Icon/Visual Header */}
                  <div className="relative h-40 bg-gradient-to-br from-yellow-600/30 via-yellow-500/20 to-yellow-800/30 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
                    <div className="relative text-6xl group-hover:scale-110 transition-transform duration-500">
                      
                    </div>
                  </div>
                  
                  <CardContent className="relative p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
                      <h3 className="text-2xl font-bold text-white">Our Vision</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{vm.vision}</p>
                  </CardContent>
                </Card>

                {/* Missions Card - Enhanced dengan better visual hierarchy */}
                <Card className="lg:col-span-2 overflow-hidden border border-yellow-600/30 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 hover:border-yellow-500/60 transition-all duration-500 group relative">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:via-yellow-400/10 group-hover:to-yellow-600/5 transition-all duration-500" />
                  
                  <CardContent className="relative p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
                      <h3 className="text-2xl font-bold text-white">Our Missions</h3>
                    </div>
                    
                    {vm.missions?.length ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {vm.missions.map((m, idx) => (
                          <li 
                            key={idx} 
                            className="group/item relative pl-6 text-gray-300 hover:text-white transition-colors duration-300"
                          >
                            {/* Animated bullet point */}
                            <div className="absolute left-0 top-2 flex items-center">
                              <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 group-hover/item:w-3 group-hover/item:h-3 transition-all duration-300" />
                            </div>
                            
                            {/* Mission text dengan subtle background */}
                            <div className="relative p-3 rounded-lg bg-gradient-to-br from-transparent to-transparent group-hover/item:from-yellow-400/5 group-hover/item:to-yellow-600/5 transition-all duration-300">
                              <span className="leading-relaxed block">{m}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 border border-gray-700 mb-3">
                          <span className="text-xl text-gray-500">📝</span>
                        </div>
                        <p className="text-gray-400">Belum ada daftar misi.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>  

        {/* Rooms Section */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">Luxury Accommodations</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Choose from our selection of beautifully appointed rooms and suites
              </p>
            </div>

            {loadingRooms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-gray-900 border-yellow-600/30 animate-pulse">
                    <div className="h-64 bg-gray-800" />
                    <CardContent className="p-6 space-y-3">
                      <div className="h-6 bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-700 rounded w-1/2" />
                      <div className="space-y-2">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="h-4 bg-gray-700 rounded w-full" />
                        ))}
                      </div>
                      <div className="h-10 bg-gray-700 rounded mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : roomsError ? (
              <div className="text-center py-12 text-red-400">{roomsError}</div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Belum ada kamar tersedia.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                  <Card
                    key={room.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-yellow-600/30 bg-gray-900 hover:bg-gray-800 hover:border-yellow-500/50 hover:transform hover:-translate-y-2"
                  >
                    <div className="relative h-64">
                      {room.image ? (
                        <img
                          src={room.image}
                          alt={room.number}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className =
                                'w-full h-full bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 flex items-center justify-center';
                              fallback.innerHTML = `<svg class="w-16 h-16 text-yellow-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7h18M3 12h18M3 17h18" /><circle cx="7" cy="7" r="2" /><circle cx="17" cy="12" r="2" /><circle cx="7" cy="17" r="2" /></svg>`;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 flex items-center justify-center">
                          <svg className="w-16 h-16 text-yellow-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h18M3 12h18M3 17h18" />
                            <circle cx="7" cy="7" r="2" />
                            <circle cx="17" cy="12" r="2" />
                            <circle cx="7" cy="17" r="2" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full font-semibold border border-yellow-400 shadow-lg">
                        {formatPrice(room.price)}/night
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-semibold text-white mb-3">{formatTypeName(room.type)}</h3>
                      <ul className="space-y-2 mb-6">
                        {getFeatures(room).map((f, i) => (
                          <li key={i} className="text-gray-300 flex items-center">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 shadow-sm shadow-yellow-400/50"></span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white border-2 border-yellow-500 hover:border-yellow-400 font-semibold py-2.5 transition-all duration-300 shadow-lg shadow-yellow-600/20">
                        Reserve Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Testimonials - Dynamic dari API */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">What Our Guests Say</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Read reviews from our satisfied guests who experienced Mutiara at its finest
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  Memuat ulasan...
                </div>
              ) : (
                reviews.map((review, i) => (
                  <Card key={review.id || i} className="bg-gray-900 border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300 hover:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-5 h-5 transition-colors ${j < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-300 mb-4 italic leading-relaxed">"{review.comment}"</p>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-yellow-400">
                          {review.guest_name || 'Tamu'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {reviews.length > 0 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 font-semibold px-8 py-3 transition-all duration-300"
                >
                  Lihat Semua Ulasan ({reviews.length})
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-bold text-yellow-400 mb-4">Ready to Experience Luxury?</h2>
            <p className="text-xl mb-8 text-gray-300">
              Book your stay now and discover what makes Mutiara Hotel the premier destination
            </p>
            <div className="space-x-4 space-y-4 sm:space-y-0">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-500 text-white border-2 border-yellow-500 hover:border-yellow-400 text-lg px-8 py-3 font-semibold transition-all duration-300 shadow-lg shadow-yellow-600/20">
                Book Your Stay
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-3 font-semibold transition-all duration-300 backdrop-blur-sm">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatBot onReservationRequest={handleReservationRequest} />
    </>
  );
}
