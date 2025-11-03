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
<section className="py-24 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.3),transparent_50%)]"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(212,175,55,0.3),transparent_50%)]"></div>
  </div>

  {/* Top decorative line */}
  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="text-center mb-20">
      {/* Section badge */}
      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-900/20 to-yellow-950/20 border border-yellow-900/40 rounded-full px-6 py-2 mb-6">
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-yellow-500 text-sm font-semibold uppercase tracking-wider">Premium Collection</span>
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>

      {/* Decorative line */}
      <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-6"></div>

      <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 bg-clip-text mb-6">
        Luxury Accommodations
      </h2>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
        Immerse yourself in opulence with our exquisitely appointed rooms and suites, 
        crafted for the most discerning guests
      </p>
    </div>

    {loadingRooms ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 animate-pulse">
            <div className="h-72 bg-gradient-to-br from-gray-800 to-gray-900 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="h-7 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg w-3/4" />
              <div className="h-5 bg-gradient-to-r from-gray-800 to-gray-700 rounded w-1/2" />
              <div className="space-y-3 py-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-700 rounded-full" />
                    <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded flex-1" />
                  </div>
                ))}
              </div>
              <div className="h-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg mt-6" />
            </CardContent>
          </Card>
        ))}
      </div>
    ) : roomsError ? (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/20 border-2 border-red-500/50 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 text-lg">{roomsError}</p>
      </div>
    ) : rooms.length === 0 ? (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-900/20 border-2 border-yellow-500/30 rounded-full mb-6">
          <svg className="w-10 h-10 text-yellow-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <p className="text-gray-400 text-xl">No rooms available at the moment</p>
        <p className="text-gray-500 text-sm mt-2">Please check back later for availability</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room, index) => (
          <Card
            key={room.id}
            className="overflow-hidden hover:shadow-2xl hover:shadow-yellow-900/30 transition-all duration-500 border-2 border-yellow-900/30 bg-gradient-to-br from-gray-900 to-black hover:border-yellow-500/60 hover:transform hover:-translate-y-3 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-72 overflow-hidden">
              {room.image ? (
                <img
                  src={room.image}
                  alt={room.number}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className =
                        'w-full h-full bg-gradient-to-br from-yellow-900/20 via-yellow-800/10 to-black flex items-center justify-center';
                      fallback.innerHTML = `
                        <svg class="w-20 h-20 text-yellow-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      `;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-900/20 via-yellow-800/10 to-black flex items-center justify-center">
                  <svg className="w-20 h-20 text-yellow-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              )}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80"></div>
              
              {/* Price badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-5 py-2.5 rounded-lg font-bold text-base shadow-2xl border-2 border-yellow-400 backdrop-blur-sm">
                {formatPrice(room.price)}/night
              </div>

              {/* Room number */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-yellow-500 px-4 py-2 rounded-lg text-sm font-bold shadow-xl border border-yellow-900/50">
                Room {room.number}
              </div>

              {/* Star rating */}
              <div className="absolute bottom-4 right-4 flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-lg" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <CardContent className="p-8 bg-gradient-to-br from-gray-900 to-black">
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text mb-6">
                {formatTypeName(room.type)}
              </h3>
              
              <div className="space-y-3 mb-8">
                {getFeatures(room).map((f, i) => (
                  <div key={i} className="flex items-center text-gray-300 group/item hover:text-gray-100 transition-colors">
                    <div className="relative mr-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50 group-hover/item:scale-125 transition-transform"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>

              {/* Decorative divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-900/50 to-transparent mb-6"></div>

              <Button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-4 text-base transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 border-2 border-yellow-400 hover:border-yellow-300 rounded-lg group/btn relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  Reserve Now
                  <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>

  {/* Bottom decorative line */}
  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
</section>

     {/* Testimonials - Dynamic dari API */}
<section className="py-24 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
  </div>

  {/* Top decorative line */}
  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="text-center mb-20">
      {/* Quote icon decoration */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 border-2 border-yellow-500/30 rounded-full mb-6">
        <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Decorative line */}
      <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-6"></div>

      <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 bg-clip-text mb-6">
        Guest Experiences
      </h2>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
        Discover why discerning travelers choose Mutiara for their most memorable stays
      </p>

      {/* Star rating summary */}
      <div className="flex items-center justify-center space-x-3 mt-8">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-gray-400 text-lg font-medium">5.0 Excellence Rating</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-6"></div>
          <p className="text-gray-400 text-xl">Loading testimonials...</p>
        </div>
      ) : (
        reviews.map((review, i) => (
          <Card 
            key={review.id || i} 
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 hover:border-yellow-500/60 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-900/20 group relative overflow-hidden"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-500/10 to-transparent rounded-tr-full"></div>

            <CardContent className="p-8 relative z-10">
              {/* Quote icon */}
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-yellow-900/40 to-yellow-950/40 rounded-full flex items-center justify-center opacity-50">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Star rating */}
              <div className="flex mb-6 space-x-1">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="relative">
                    <Star
                      className={`w-6 h-6 transition-all duration-300 ${
                        j < review.rating 
                          ? 'text-yellow-500 fill-yellow-500 drop-shadow-lg' 
                          : 'text-gray-700'
                      }`}
                    />
                    {j < review.rating && (
                      <Star
                        className="w-6 h-6 text-yellow-500 fill-yellow-500 absolute top-0 left-0 animate-ping opacity-20"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Review text */}
              <div className="mb-6">
                <p className="text-gray-300 text-base leading-relaxed italic relative">
                  <span className="text-yellow-500/50 text-4xl font-serif absolute -left-2 -top-2">"</span>
                  <span className="relative z-10">{review.comment}</span>
                  <span className="text-yellow-500/50 text-4xl font-serif">"</span>
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-900/40 to-transparent mb-6"></div>

              {/* Guest info */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center border-2 border-yellow-400/50 shadow-lg">
                    <span className="text-black font-bold text-sm">
                      {(review.guest_name || 'G')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-yellow-500 text-sm">
                      {review.guest_name || 'Valued Guest'}
                    </p>
                    <p className="text-xs text-gray-500">Verified Guest</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {formatDate(review.created_at)}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-500">Verified</span>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>
        ))
      )}
    </div>

    {reviews.length > 0 && (
      <div className="text-center mt-16">
        {/* Decorative divider before button */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-32 bg-gradient-to-r from-transparent to-yellow-900/50"></div>
          <svg className="w-6 h-6 text-yellow-500 mx-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="h-px w-32 bg-gradient-to-l from-transparent to-yellow-900/50"></div>
        </div>

        <Button
          variant="outline"
          className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold px-10 py-4 text-base transition-all duration-300 rounded-lg group/btn relative overflow-hidden shadow-lg hover:shadow-yellow-500/50"
        >
          <span className="relative z-10 flex items-center">
            View All Reviews ({reviews.length})
            <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-yellow-500 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
        </Button>

        {/* Trust badges */}
        <div className="flex items-center justify-center space-x-8 mt-12">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified Reviews</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>5-Star Rated</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>1000+ Happy Guests</span>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Bottom decorative line */}
  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
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
              <Button size="lg" variant="outline" className="border-2 border-white text-black hover:bg-black hover:text-white text-lg px-8 py-3 font-semibold transition-all duration-300 backdrop-blur-sm">
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
