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
import { link } from 'node:fs';

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
    link:'/user/type/superior'
  },
  {
    id: 2,
    number: '205',
    type: 'deluxe' as const,
    price: 630000,
    capacity: 2,
    image: '/deluxe.jpg',
    description: 'Spacious deluxe room with balcony and premium facilities',
    link:'/user/type/deluxe'
  },
  {
    id: 3,
    number: '301',
    type: 'executive' as const,
    price: 725000,
    capacity: 2,
    image: '/executive.jpg',
    description: 'Luxurious executive suite with living area and premium services',
    link:'/user/type/executive'
  }
];

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);

  // ================== Fetch Reviews ==================
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>('/public/reviews');
        const approvedReviews = response.data.filter((r) => r.rating >= 0);
        setReviews(approvedReviews.slice(0, 6));
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        // Fallback statis
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

  const getFeatures = (type: string): string[] => {
    const base = [
      '2 Guests',
      'Air Conditioning',
      'Private Bathroom',
      'Room Service',
    ];
    
    if (type === 'deluxe' || type === 'executive') base.push('Balcony');
    if (type === 'executive') base.push('Living Area');
    
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
      <main className="bg-black">
        {/* Hero Section - Black & Gold */}
        <section className="relative h-screen isolate overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/hotel.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-gray-900/70 to-black/90" aria-hidden="true" />
          
          {/* Animated decorative elements */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-60 h-60 bg-yellow-500/15 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center max-w-5xl px-4 space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-900/50 to-yellow-900/50 px-6 py-3 rounded-full border-2 border-amber-600 mb-4 shadow-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight text-white">
                Welcome to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 animate-gradient">
                  Mutiara Hotel
                </span>
              </h1>
              
              <p className="text-xl md:text-3xl mb-12 text-gray-300 font-light leading-relaxed max-w-3xl mx-auto">
                Experience unparalleled luxury and comfort in the heart of paradise
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-2 border-amber-400 hover:border-amber-500 px-10 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full"
                >  
                  <Link href={"user/rooms"}>
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Now
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-amber-400 text-amber-300 hover:bg-amber-950 hover:text-amber-200 text-lg px-10 py-6 font-bold transition-all duration-300 transform hover:scale-105 rounded-full bg-black/50 backdrop-blur-sm"
                >
                  <Link href="/user/">
                    <MapPin className="w-5 h-5 mr-2" />
                    Explore Rooms
                  </Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
                <div className="text-center space-y-2 transform hover:scale-110 transition-transform duration-300 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-amber-600/50">
                  <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-amber-400">500+</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide">Happy Guests</div>
                </div>
                <div className="text-center space-y-2 transform hover:scale-110 transition-transform duration-300 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-amber-600/50">
                  <Star className="w-10 h-10 text-amber-400 mx-auto mb-2 fill-current" />
                  <div className="text-3xl font-bold text-amber-400">4.9</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide">Rating</div>
                </div>
                <div className="text-center space-y-2 transform hover:scale-110 transition-transform duration-300 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-amber-600/50">
                  <TrendingUp className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-amber-400">10+</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide">Years Service</div>
                </div>
              </div>
            </div>
          </div>        
        </section>

        <section className="bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 py-8 border-y-2 border-amber-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Wifi, text: 'Free WiFi' },
                { icon: Coffee, text: '24/7 Service' },
                { icon: Utensils, text: 'Restaurant' },
                { icon: Dumbbell, text: 'Fitness Center' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center space-x-3 text-amber-200 hover:text-amber-400 transition-colors duration-300 group">
                  <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

 {/* Ultra Luxury Rooms Section – 2025 Edition */}
<section className="py-32 bg-black relative overflow-hidden">
  {/* Dynamic Gradient Orbs Background */}
  <div className="absolute inset-0 opacity-30">
    <div className="absolute top-0 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-drift-slow"></div>
    <div className="absolute bottom-0 -right-40 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-drift-slow" style={{animationDelay: '3s'}}></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-700/10 rounded-full blur-3xl animate-pulse"></div>
  </div>

  {/* Subtle Golden Particles */}
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-amber-400/60 rounded-full animate-float"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.8}s`,
          animationDuration: `${8 + Math.random() * 8}s`,
        }}
      />
    ))}
  </div>

  {/* Elegant Top & Bottom Glow Lines */}
  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-amber-400/50 shadow-2xl"></div>
  <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-amber-400/50 shadow-2xl"></div>

  <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
    {/* Header – Pure Opulence */}
    <div className="text-center mb-24">
      {/* Exclusive Badge */}
      <div className="inline-flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-amber-600/50 rounded-full px-10 py-4 mb-10 shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-500 group">
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <svg key={i} className="w-7 h-7 text-amber-400 drop-shadow-glow" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>
        <span className="text-amber-300 font-medium tracking-widest text-sm uppercase">Signature Collection</span>
      </div>

      {/* Ornamental Divider */}
      <div className="flex items-center justify-center gap-8 mb-10 opacity-60">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        <div className="w-4 h-4 rotate-45 bg-amber-500/20 border border-amber-500 shadow-lg shadow-amber-500/50"></div>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
      </div>

      {/* Hero Title */}
      <h2 className="text-6xl md:text-8xl font-bold tracking-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 
          animate-gradient-x bg-[length:300%_auto] drop-shadow-2xl">
          Timeless Elegance
        </span>
        <br />
        <span className="text-5xl md:text-7xl text-gray-400 font-light tracking-wider">
          Redefined
        </span>
      </h2>

      <p className="mt-8 text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light">
        Each suite is a masterpiece of contemporary design, where <span className="text-amber-400 font-medium">gold-kissed luxury</span> meets 
        unparalleled comfort — crafted exclusively for the modern connoisseur.
      </p>
    </div>

    {/* Luxury Room Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {staticRooms.map((room, index) => (
        <div
          key={room.id}
          className="group relative animate-fadeInUp"
          style={{ animationDelay: `${index * 200}ms` }}
        >
          {/* Glass Card with Floating Effect */}
          <div className="relative h-full bg-gradient-to-br from-gray-950/80 via-black/90 to-amber-950/30 
            backdrop-blur-2xl rounded-3xl border border-amber-800/30 overflow-hidden
            shadow-2xl shadow-black/50
            transition-all duration-700 hover:shadow-amber-500/20 hover:-translate-y-6 hover:border-amber-600/60">
            
            {/* Image + Overlay */}
            <div className="relative h-80 overflow-hidden">
              <img
                src={room.image || "/placeholder-suite.jpg"}
                alt={formatTypeName(room.type)}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

              {/* Floating Price Tag */}
              <div className="absolute top-6 right-6 bg-gradient-to-br from-amber-500 to-yellow-600 
                text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-2xl border border-amber-300
                transform group-hover:scale-110 transition-all duration-500">
                {formatPrice(room.price)} <span className="text-sm opacity-90">/ night</span>
              </div>

              {/* Room Label */}
              <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md border border-amber-600/50 
                text-amber-300 px-5 py-3 rounded-xl text-sm font-semibold tracking-wider">
                Suite {room.number}
              </div>

              {/* 5-Star Glow */}
              <div className="absolute bottom-6 right-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current drop-shadow-glow" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 lg:p-10">
              <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-6">
                {formatTypeName(room.type)}
              </h3>

              <ul className="space-y-5 mb-10">
                {getFeatures(room.type).map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-300 group/item">
                    <div className="mr-4 w-2 h-2 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50 
                      group-hover/item:scale-150 transition-transform duration-300"></div>
                    <span className="text-base font-light tracking-wide group-hover/item:text-amber-300 transition-colors">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div className="flex flex-col gap-4">
                <Button asChild size="lg" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 
                  hover:from-amber-600 hover:to-yellow-700 text-white font-semibold text-lg py-7 rounded-2xl 
                  shadow-xl hover:shadow-2xl hover:shadow-amber-500/40 border border-amber-400 
                  transition-all duration-400 group/btn">
                  <Link href="/user/rooms" className="flex items-center justify-center">
                    Reserve This Suite
                    <svg className="w-5 h-5 ml-3 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="lg" className="w-full border border-amber-700 text-amber-400 
                  hover:bg-amber-950/40 hover:text-amber-300 py-7 rounded-2xl font-medium transition-all duration-400">
                  <Link href={room.link}>Explore Details →</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

        {/* Testimonials - Dynamic dari API */}
        <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"></div>
          </div>

          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-900/50 to-yellow-900/50 border-2 border-amber-600 rounded-full mb-6 backdrop-blur-sm">
                <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6"></div>

              <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 bg-clip-text mb-6">
                Guest Experiences
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Discover why discerning travelers choose Mutiara for their most memorable stays
              </p>

              <div className="flex items-center justify-center space-x-3 mt-8">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-300 text-lg font-medium">5.0 Excellence Rating</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mb-6"></div>
                  <p className="text-gray-300 text-xl">Loading testimonials...</p>
                </div>
              ) : (
                reviews.map((review, i) => (
                  <Card 
                    key={review.id || i} 
                    className="bg-gray-900 border-2 border-amber-700 hover:border-amber-500 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/30 group relative overflow-hidden"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-900/50 to-transparent rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-900/50 to-transparent rounded-tr-full"></div>

                    <CardContent className="p-8 relative z-10">
                      <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-amber-700 to-yellow-700 rounded-full flex items-center justify-center opacity-60">
                        <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>

                      <div className="flex mb-6 space-x-1">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="relative">
                            <Star
                              className={`w-6 h-6 transition-all duration-300 ${
                                j < review.rating 
                                  ? 'text-amber-500 fill-amber-500 drop-shadow-lg' 
                                  : 'text-gray-600'
                              }`}
                            />
                            {j < review.rating && (
                              <Star
                                className="w-6 h-6 text-amber-500 fill-amber-500 absolute top-0 left-0 animate-ping opacity-20"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mb-6">
                        <p className="text-gray-300 text-base leading-relaxed italic relative">
                          <span className="text-amber-500 text-4xl font-serif absolute -left-2 -top-2">"</span>
                          <span className="relative z-10">{review.comment}</span>
                          <span className="text-amber-500 text-4xl font-serif">"</span>
                        </p>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent mb-6"></div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center border-2 border-amber-400 shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {(review.guest_name || 'G')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-amber-300 text-sm">
                              {review.guest_name || 'Valued Guest'}
                            </p>
                            <p className="text-xs text-gray-400">Verified Guest</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            {formatDate(review.created_at)}
                          </p>
                          <div className="flex items-center justify-end mt-1">
                            <svg className="w-3 h-3 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-400">Verified</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <div className="absolute inset-0 bg-gradient-to-r from-amber-900/0 via-amber-900/10 to-amber-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Card>
                ))
              )}
            </div>

            {reviews.length > 0 && (
              <div className="text-center mt-16">
                <div className="flex items-center justify-center mb-8">
                  <div className="h-px w-32 bg-gradient-to-r from-transparent to-amber-600"></div>
                  <svg className="w-6 h-6 text-amber-500 mx-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="h-px w-32 bg-gradient-to-l from-transparent to-amber-600"></div>
                </div>

                <Button
                  variant="outline"
                  className="border-2 border-amber-500 text-amber-300 hover:bg-amber-500 hover:text-white font-bold px-10 py-4 text-base transition-all duration-300 rounded-lg group/btn relative overflow-hidden shadow-lg hover:shadow-amber-500/50 bg-black/50 backdrop-blur-sm"
                >
                  <span className="relative z-10 flex items-center">
                    View All Reviews ({reviews.length})
                    <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-amber-500 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
                </Button>

                <div className="flex items-center justify-center space-x-8 mt-12">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Verified Reviews</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>5-Star Rated</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>1000+ Happy Guests</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-b from-amber-950 to-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-4">Ready to Experience Luxury?</h2>
            <p className="text-xl mb-8 text-gray-300">
              Book your stay now and discover what makes Mutiara Hotel the premier destination
            </p>
            <div className="space-x-4 space-y-4 sm:space-y-0">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-2 border-amber-400 hover:border-amber-500 text-lg px-8 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-amber-500/30">
                <Link href="user/rooms">
                  Book Your Stay
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-amber-500 text-amber-300 hover:bg-amber-950 hover:text-amber-200 text-lg px-8 py-3 font-semibold transition-all duration-300 bg-black/50 backdrop-blur-sm">
                Contact Us
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
