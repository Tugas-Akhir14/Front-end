'use client';

import { useState } from 'react';
import {
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Star,
  Sparkles,
  Crown,
  Camera,
  Trees,
  Coffee,
  Wine,
  Tv,
  Music,
  Shirt,
  Clock,
  Users,
  Heart,
  Eye,
  MapPin,
  ArrowRight,
  Ship,
  Anchor,
  Compass,
  LifeBuoy,
  Gift,
  BookOpen,
  ShoppingBag,
} from 'lucide-react';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ChatBot from '@/components/Chatbot/ChatBot';

// ===== Types =====
type Facility = {
  id: number;
  name: string;
  description: string;
  image: string;
  icon: React.ComponentType<any>;
  features: string[];
  url: string;
  operatingHours: string;
  location: string;
  category: 'store' | 'cafe' | 'recreation' | 'premium';
};

// ===== Data Fasilitas =====
const facilitiesData: Facility[] = [
  {
    id: 1,
    name: 'Souvenir',
    description: 'Discover authentic local souvenirs and handcrafted gifts from Balige. Our curated selection features traditional Batak handicrafts, cultural artifacts, and unique keepsakes perfect for remembering your stay at Hotel Mutiara Balige.',
    image: '/souvenir.jpg',
    icon: Gift,
    features: ['Traditional Batak Crafts', 'Local Handicrafts', 'Cultural Artifacts', 'Gift Packaging Service', 'Authentic Souvenirs', 'Handmade Products', 'Cultural Items'],
    operatingHours: '6:00 AM - 10:00 PM',
    location: 'Level 5, West Wing',
    category: 'store',
    url: '/user/facilities/souvenir',
  },
  {
    id: 2,
    name: 'Book Store',
    description: 'Browse our collection of books featuring local literature, cultural guides, and travel inspiration. From Batak folklore to modern novels and regional history, find the perfect reading companion for your journey and explore the rich culture of Lake Toba.',
    image: '/buku.jpg',
    icon: BookOpen,
    features: ['Local Literature Collection', 'Cultural & History Books', 'Travel Guides', 'Children\'s Books', 'Magazines & Periodicals', 'Regional Authors'],
    operatingHours: '6:00 AM - 11:00 PM',
    location: 'Lobby Level, Main Building',
    category: 'store',
    url: '/user/facilities/book',
  },
  {
    id: 3,
    name: 'Kopi Dari Hati Cafe',
    description: 'Indulge in freshly brewed artisan coffee and delicious homemade pastries in our cozy cafe. From traditional Indonesian coffee to international blends, enjoy a warm atmosphere perfect for relaxation, casual meetings, or a delightful coffee break.',
    image: '/cafe.jpg',
    icon: Coffee,
    features: ['Artisan Coffee Selection', 'Homemade Pastries', 'Local & International Blends', 'Free Wi-Fi', 'Cozy Seating Area', 'Light Meals & Snacks', 'Takeaway Service'],
    operatingHours: '10:00 AM - 22:00 PM',
    location: 'Lobby Level, Main Building',
    category: 'cafe',
    url: '/user/facilities/cafe',
  },
  {
    id: 4,
    name: 'Ship Rent',
    description: 'Experience the beauty of Lake Toba with our boat rental service. Explore the pristine waters, visit nearby islands, or enjoy a peaceful cruise with family and friends in our well-maintained vessels with professional crew assistance.',
    image: '/pelabuhan.jpg',
    icon: Ship,
    features: ['Various Boat Types Available', 'Professional Crew Service', 'Lake Toba Tours', 'Island Hopping Trips', 'Safety Equipment Included', 'Flexible Rental Duration', 'Scenic Route Guidance'],
    operatingHours: '24 Hours',
    location: 'Level 4, East Wing',
    category: 'recreation',
    url: '/user/facilities/',
  },


];

// ===== Category Config (hitam & emas) =====
const CATEGORY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; hover: string }> = {
  store: {
    label: 'Store',
    bg: 'bg-gradient-to-r from-emerald-900/50 to-teal-900/50',
    text: 'text-emerald-400',
    border: 'border-emerald-600',
    hover: 'hover:shadow-emerald-500/20'
  },
  cafe: {
    label: 'Cafe',
    bg: 'bg-gradient-to-r from-amber-900/50 to-orange-900/50',
    text: 'text-amber-400',
    border: 'border-amber-600',
    hover: 'hover:shadow-amber-500/20'
  },

  recreation: {
    label: 'Recreation',
    bg: 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50',
    text: 'text-cyan-400',
    border: 'border-cyan-600',
    hover: 'hover:shadow-cyan-500/20'
  },

  premium: {
    label: 'Premium',
    bg: 'bg-gradient-to-r from-amber-900/50 to-yellow-900/50',
    text: 'text-amber-300',
    border: 'border-yellow-500',
    hover: 'hover:shadow-yellow-500/20'
  }
};

const getCategoryConfig = (category: string) => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.store;
};

// ===== KOMPONEN UTAMA =====
export default function Facilities() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFacilities = selectedCategory === 'all'
    ? facilitiesData
    : facilitiesData.filter(facility => facility.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Facilities', icon: Star },
    { id: 'store', name: 'Store', icon: ShoppingBag },
    { id: 'cafe', name: 'Cafe', icon: Coffee },
    { id: 'recreation', name: 'Recreation', icon: Ship },
    { id: 'premium', name: 'Premium', icon: Crown }
  ];

  return (
    <div className="bg-black min-h-screen">
      <main>
        <Header />

        {/* Hero Section - Hitam & Emas */}
        <section className="relative h-[600px] bg-gradient-to-br from-black via-gray-900 to-amber-950 overflow-hidden">
          {/* Subtle gold pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          {/* Background Image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20 transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg)' }}
          />

          {/* Gold glows */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>

          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="text-center max-w-5xl px-4 space-y-8">
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center space-x-3 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-amber-500/50 shadow-lg">
                  <span className="text-amber-300 text-sm font-bold tracking-widest uppercase">Premium Experience</span>
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                  Facilities
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
                Discover our world-class amenities designed to elevate your stay into an extraordinary experience
              </p>

              <div className="flex justify-center mb-10">
                <div className="h-px w-64 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20"></div>
        </section>

        {/* Category Filter */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-full border-2 transition-all duration-300 font-semibold shadow-md backdrop-blur-sm ${isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black border-amber-500 shadow-amber-500/30'
                      : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-amber-500 hover:shadow-lg hover:bg-amber-950/30'
                      }`}
                  >
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Facilities Layout */}
        <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block mb-4">
                <div className="flex items-center space-x-2 text-amber-500">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
                  <Star className="w-5 h-5 fill-current" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                Premium Amenities
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Experience unparalleled luxury with our exclusive facilities and services
              </p>
            </div>

            <div className="space-y-24">
              {filteredFacilities.map((facility, index) => {
                const categoryConfig = getCategoryConfig(facility.category);
                const IconComponent = facility.icon;
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={facility.id}
                    className={`flex flex-col lg:flex-row gap-12 items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                  >
                    {/* Image Section */}
                    <div className="lg:w-1/2 relative group">
                      <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10">
                        <img
                          src={facility.image}
                          alt={facility.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                        {/* Category Badge */}
                        <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border-2 backdrop-blur-sm ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border} shadow-lg`}>
                          {categoryConfig.label}
                        </div>

                        {/* Operating Hours */}
                        <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-sm text-amber-200 px-4 py-3 rounded-lg border border-amber-500/50 shadow-md">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">{facility.operatingHours}</span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-sm text-amber-200 px-4 py-3 rounded-lg border border-amber-500/50 shadow-md">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">{facility.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-1/2">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-amber-900/50 to-yellow-900/50 rounded-xl border border-amber-600 shadow-sm backdrop-blur-sm">
                          <IconComponent className="w-8 h-8 text-amber-400" />
                        </div>
                        <h3 className="text-4xl font-bold text-amber-200">{facility.name}</h3>
                      </div>

                      <div className="flex items-center space-x-2 mb-6">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                          ))}
                        </div>
                        <span className="text-amber-400 text-sm font-medium">5.0 Excellence</span>
                      </div>

                      <p className="text-gray-300 text-lg leading-relaxed mb-8">
                        {facility.description}
                      </p>

                      <div className="mb-8">
                        <h4 className="font-bold text-amber-400 mb-4 text-lg uppercase tracking-wider flex items-center">
                          <Eye className="w-5 h-5 mr-2 text-amber-500" />
                          Key Features
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {facility.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-300 text-base">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3 shadow-sm"></span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        asChild
                        className="group bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/30 border-2 border-amber-400 transform hover:scale-105"
                      >
                        <Link href={facility.url} aria-label="Explore Facility">
                          <span className="flex items-center gap-3">
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            Explore Facility
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredFacilities.length === 0 && (
              <div className="text-center text-gray-400 py-16">
                <p className="text-lg">No facilities found for the selected category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-8 bg-gray-900 rounded-2xl border border-amber-700 shadow-2xl shadow-amber-500/10 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-900/50 to-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-600">
                  <Sparkles className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-3xl font-bold text-amber-300 mb-2">6+</h3>
                <p className="text-gray-300 text-lg">Premium Facilities</p>
              </div>

              <div className="p-8 bg-gray-900 rounded-2xl border border-amber-700 shadow-2xl shadow-amber-500/10 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-900/50 to-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-600">
                  <Clock className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-3xl font-bold text-amber-300 mb-2">24/7</h3>
                <p className="text-gray-300 text-lg">Service Availability</p>
              </div>

              <div className="p-8 bg-gray-900 rounded-2xl border border-amber-700 shadow-2xl shadow-amber-500/10 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-900/50 to-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-600">
                  <Heart className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-3xl font-bold text-amber-300 mb-2">100%</h3>
                <p className="text-gray-300 text-lg">Guest Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <ChatBot />
      </main>
    </div>
  );
}