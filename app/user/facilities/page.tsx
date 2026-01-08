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
import { Card } from '@/components/ui/card';
import ChatBot from '@/components/Chatbot/ChatBot';

const GOLD = '#d4af37';

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

// Unified Monochromatic Theme Config (All Gold/Dark)
const CATEGORY_CONFIG: Record<string, { label: string }> = {
  store: { label: 'Store' },
  cafe: { label: 'Cafe' },
  recreation: { label: 'Recreation' },
  premium: { label: 'Premium' }
};

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
    <div className="bg-black min-h-screen text-gray-100">
      <main>
        <Header />

        {/* Hero Section - Unified Gold/Dark Theme */}
        <section className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-black">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 scale-105"
              style={{ backgroundImage: 'url(https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black" />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(60% 80% at 50% 0%, ${GOLD} 0%, transparent 70%)`,
              }}
            />
          </div>

          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center max-w-5xl px-4 space-y-8 animate-fade-in">
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center space-x-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-gray-700">
                  <Star className="w-4 h-4" style={{ color: GOLD }} />
                  <span className="text-gray-200 text-sm font-bold tracking-widest uppercase">Premium Experience</span>
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight text-white">
                Our <span style={{ color: GOLD }}>Facilities</span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
                Discover our world-class amenities designed to elevate your stay into an extraordinary experience
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter - Unified Theme */}
        <section className="py-12 bg-gray-950 border-y border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-full border transition-all duration-300 font-medium ${isActive
                        ? 'bg-white text-black border-white shadow-xl scale-105'
                        : 'bg-black text-gray-400 border-gray-800 hover:border-gray-600 hover:bg-gray-900'
                      }`}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: isActive ? '#000' : GOLD }} />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Facilities Layout */}
        <section className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-32">
              {filteredFacilities.map((facility, index) => {
                const config = CATEGORY_CONFIG[facility.category] || { label: 'Facility' };
                const IconComponent = facility.icon;
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={facility.id}
                    className={`flex flex-col lg:flex-row gap-16 items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                  >
                    {/* Image Section */}
                    <div className="lg:w-1/2 relative group">
                      <div className="relative h-96 rounded-3xl overflow-hidden border border-gray-800 group-hover:border-gray-700 transition-colors">
                        <img
                          src={facility.image}
                          alt={facility.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                        {/* Category Badge */}
                        <div className="absolute top-6 left-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-black/80 backdrop-blur-md border border-gray-700" style={{ color: GOLD }}>
                          {config.label}
                        </div>

                        {/* Info Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-800 text-sm text-gray-300">
                            <Clock className="w-4 h-4" style={{ color: GOLD }} />
                            {facility.operatingHours}
                          </div>
                          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-800 text-sm text-gray-300">
                            <MapPin className="w-4 h-4" style={{ color: GOLD }} />
                            {facility.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-1/2">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
                          <IconComponent className="w-8 h-8" style={{ color: GOLD }} />
                        </div>
                        <h3 className="text-4xl font-bold text-white">{facility.name}</h3>
                      </div>

                      <p className="text-gray-400 text-lg leading-relaxed mb-10 font-light">
                        {facility.description}
                      </p>

                      <div className="mb-10">
                        <h4 className="font-bold mb-6 text-sm uppercase tracking-wider text-gray-500">
                          Highlights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {facility.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-300">
                              <span className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: GOLD }}></span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        asChild
                        className="h-14 px-8 rounded-full text-black font-bold text-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: GOLD }}
                      >
                        <Link href={facility.url}>
                          <span className="flex items-center gap-3">
                            <ArrowRight className="w-5 h-5" />
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
              <div className="text-center text-gray-500 py-32">
                <p className="text-xl">No facilities found for this category.</p>
              </div>
            )}
          </div>
        </section>

        <Footer />
        <ChatBot />
      </main>
    </div>
  );
}