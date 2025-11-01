'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Wifi, Car, Utensils, Dumbbell, Waves } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ChatBot from '@/components/Chatbot/ChatBot';
import axios from 'axios';

// Tipe data dari backend
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

// === TAMBAH: TYPE UNTUK REVIEW ===
type Review = {
  id: number;
  rating: number;
  comment: string;
  guest_name: string | null;
  created_at: string;
};

export default function Home() {
  const [reservationData, setReservationData] = useState(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]); // TAMBAH: State untuk reviews
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const features = [
    { icon: Wifi, title: 'Free Wi-Fi', description: 'High-speed internet throughout the hotel' },
    { icon: Car, title: 'Free Parking', description: 'Complimentary valet parking service' },
    { icon: Utensils, title: 'Fine Dining', description: 'Award-winning restaurant with local cuisine' },
    { icon: Dumbbell, title: 'Fitness Center', description: '24/7 access to modern gym equipment' },
    { icon: Waves, title: 'Pool & Spa', description: 'Relaxing pool and full-service spa' },
  ];

  // === TAMBAH: Fetch Reviews ===
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>('/public/reviews');
        const approvedReviews = response.data.filter((r) => r.rating >= 4); // Hanya tampilkan rating 4-5
        setReviews(approvedReviews.slice(0, 6)); // Maksimal 6 ulasan
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        // Fallback ke data statis jika API gagal
        setReviews([
          { id: 1, name: 'Sarah Johnson', rating: 5, comment: 'Absolutely amazing experience! The service was impeccable and the room was luxurious.', created_at: '2025-01-15' },
          { id: 2, name: 'Michael Chen', rating: 5, comment: 'Perfect location and outstanding amenities. Will definitely come back!', created_at: '2025-01-10' },
          { id: 3, name: 'Emma Williams', rating: 5, comment: 'The spa services were incredible and the staff went above and beyond.', created_at: '2025-01-08' },
        ]);
      }
    };

    fetchReviews();
  }, []);

  const handleReservationRequest = (data: any) => {
    setReservationData(data);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);

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
        setError('Gagal memuat kamar. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

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

  // === TAMBAH: Format tanggal ===
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
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Welcome to <span className="text-yellow-400">Mutiara Hotel</span>
              </h1>
              <p className="text-xl font-sans md:text-2xl mb-8 text-gray-200">
                Experience unparalleled luxury and comfort in the heart of paradise
              </p>
              <div className="space-x-4">
                <Button size="lg" className="bg-yellow-600 hover:bg-yellow-500 text-white border-2 border-yellow-500 hover:border-yellow-400 px-8 py-3 text-lg font-semibold transition-all duration-300 shadow-lg shadow-yellow-600/20">
                  Book Now
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-3 font-semibold transition-all duration-300 backdrop-blur-sm">
                  Explore Rooms
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">World-Class Amenities</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Discover the finest amenities designed to make your stay unforgettable
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <Card key={i} className="text-center p-6 hover:shadow-2xl transition-all duration-300 border-yellow-600/30 bg-gray-900 hover:bg-gray-800 hover:border-yellow-500/50 hover:transform hover:-translate-y-2">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                      <f.icon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-gray-300">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
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

            {loading ? (
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
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Belum ada kamar tersedia.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-yellow-600/30 bg-gray-900 hover:bg-gray-800 hover:border-yellow-500/50 hover:transform hover:-translate-y-2">
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
                              fallback.className = 'w-full h-full bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 flex items-center justify-center';
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

        {/* Testimonials - UPDATE: Dynamic dari API */}
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
                // Fallback loading
                <div className="col-span-full text-center py-12 text-gray-400">
                  Memuat ulasan...
                </div>
              ) : (
                // Dynamic reviews dari API
                reviews.map((review, i) => (
                  <Card key={review.id || i} className="bg-gray-900 border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300 hover:bg-gray-800">
                    <CardContent className="p-6">
                      {/* Rating Stars */}
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star 
                            key={j} 
                            className={`w-5 h-5 transition-colors ${
                              j < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                      {/* Comment */}
                      <p className="text-gray-300 mb-4 italic leading-relaxed">"{review.comment}"</p>
                      {/* Guest Name & Date */}
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
            {/* Show All Button */}
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