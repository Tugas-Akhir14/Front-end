'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';

// ===== Types =====
type Facility = {
  id: number;
  name: string;
  description: string;
  image: string;
  icon: React.ComponentType<any>;
  features: string[];
  operatingHours: string;
  location: string;
  category: 'wellness' | 'dining' | 'business' | 'recreation' | 'service' | 'premium';
};

// ===== Data Fasilitas =====
const facilitiesData: Facility[] = [
  {
    id: 1,
    name: 'Infinity Pool & Spa',
    description: 'Experience ultimate relaxation with our stunning infinity pool overlooking the city skyline and full-service Mutiara spa treatments. Our wellness facility offers a serene escape with professional therapists, heated pools, and private cabanas for complete privacy and comfort.',
    image: 'https://images.pexels.com/photos/2613948/pexels-photo-2613948.jpeg',
    icon: Waves,
    features: ['Heated Infinity Pool', 'Professional Spa Treatments', 'Poolside Bar', 'Private Cabanas', 'Therapy Jacuzzi', 'Steam Room', 'Sauna'],
    operatingHours: '6:00 AM - 10:00 PM',
    location: 'Level 5, West Wing',
    category: 'wellness'
  },
  {
    id: 2,
    name: 'Fine Dining Restaurant',
    description: 'Award-winning culinary experience with international cuisine prepared by our world-class chefs in an elegant setting. Featuring seasonal menus, extensive wine collections, and private dining rooms for special occasions.',
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    icon: Utensils,
    features: ['International Buffet', 'À La Carte Menu', 'Wine Pairing', 'Chef Table Experience', 'Private Dining Rooms', 'Live Cooking Stations'],
    operatingHours: '6:00 AM - 11:00 PM',
    location: 'Lobby Level, Main Building',
    category: 'dining'
  },
  {
    id: 3,
    name: 'Executive Fitness Center',
    description: 'State-of-the-art fitness facility with premium equipment, personal training, and wellness programs. Our 24/7 fitness center includes dedicated zones for cardio, strength training, yoga, and functional fitness.',
    image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg',
    icon: Dumbbell,
    features: ['24/7 Access', 'Personal Trainers', 'Yoga Studio', 'Cardio Zone', 'Weight Training', 'Group Classes', 'Wellness Coaching'],
    operatingHours: '24 Hours',
    location: 'Level 4, East Wing',
    category: 'wellness'
  },
  {
    id: 4,
    name: 'Business Center & Meeting Rooms',
    description: 'Fully equipped business facilities with modern technology for productive meetings and corporate events. Ideal for conferences, board meetings, and private working sessions with comprehensive support services.',
    image: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg',
    icon: Users,
    features: ['High-Speed Internet', 'Audio-Visual Equipment', 'Conference Rooms', 'Printing Services', 'Video Conferencing', 'Secretarial Services'],
    operatingHours: '7:00 AM - 9:00 PM',
    location: 'Level 3, Business Wing',
    category: 'business'
  },
  {
    id: 5,
    name: 'Valet & Concierge Services',
    description: 'Premium service experience with dedicated concierge team and complimentary valet parking. Our professional staff is available 24/7 to assist with transportation, reservations, and personalized local experiences.',
    image: 'https://images.pexels.com/photos/4488280/pexels-photo-4488280.jpeg',
    icon: Car,
    features: ['24/7 Valet Service', 'Personal Concierge', 'Transportation Arrangements', 'Luggage Service', 'Local Guidance', 'Event Planning'],
    operatingHours: '24 Hours',
    location: 'Main Entrance',
    category: 'service'
  },
  {
    id: 6,
    name: 'Royal Lounge & Bar',
    description: 'Exclusive lounge area with premium beverages, live music, and sophisticated ambiance for elite guests. Featuring crafted cocktails, fine wines, and elegant entertainment in a luxurious setting.',
    image: 'https://images.pexels.com/photos/3397937/pexels-photo-3397937.jpeg',
    icon: Crown,
    features: ['Premium Cocktails', 'Live Music', 'Private Booths', 'Cigar Lounge', 'Butler Service', 'Wine Tasting'],
    operatingHours: '4:00 PM - 1:00 AM',
    location: 'Penthouse Level',
    category: 'premium'
  }
];

// ===== Category Config =====
const CATEGORY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  wellness: {
    label: 'Wellness',
    bg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    text: 'text-white',
    border: 'border-emerald-400'
  },
  dining: {
    label: 'Dining',
    bg: 'bg-gradient-to-r from-amber-600 to-orange-600',
    text: 'text-white',
    border: 'border-amber-400'
  },
  business: {
    label: 'Business',
    bg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    text: 'text-white',
    border: 'border-blue-400'
  },
  recreation: {
    label: 'Recreation',
    bg: 'bg-gradient-to-r from-purple-600 to-pink-600',
    text: 'text-white',
    border: 'border-purple-400'
  },
  service: {
    label: 'Service',
    bg: 'bg-gradient-to-r from-gray-600 to-slate-600',
    text: 'text-white',
    border: 'border-gray-400'
  },
  premium: {
    label: 'Premium',
    bg: 'bg-gradient-to-r from-amber-500 to-yellow-600',
    text: 'text-black',
    border: 'border-amber-300'
  }
};

const getCategoryConfig = (category: string) => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.service;
};

// ===== KOMPONEN UTAMA =====
export default function Facilities() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFacilities = selectedCategory === 'all' 
    ? facilitiesData 
    : facilitiesData.filter(facility => facility.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Facilities', icon: Star },
    { id: 'wellness', name: 'Wellness', icon: Heart },
    { id: 'dining', name: 'Dining', icon: Utensils },
    { id: 'business', name: 'Business', icon: Users },
    { id: 'premium', name: 'Premium', icon: Crown },
    { id: 'service', name: 'Services', icon: Sparkles }
  ];

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
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg)' }}
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
                  <span className="text-amber-300 text-sm font-bold tracking-widest uppercase">Premium Experience</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                  Facilities
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-10 text-amber-100/90 font-light max-w-3xl mx-auto leading-relaxed">
                Discover our world-class amenities designed to elevate your stay into an extraordinary experience
              </p>
              
              {/* Decorative line */}
              <div className="flex justify-center mb-10">
                <div className="h-px w-64 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>
            </div>
          </div>
          
          {/* Bottom gradient transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20"></div>
        </section>

        {/* Category Filter */}
        <section className="py-16 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-full border-2 transition-all duration-300 font-semibold ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black border-amber-300 shadow-2xl shadow-amber-900/50'
                        : 'bg-gray-900/80 text-amber-100 border-amber-900/30 hover:border-amber-600/50 hover:bg-gray-800/80'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Facilities Horizontal Layout */}
        <section className="py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900">
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
                    className={`flex flex-col lg:flex-row gap-12 items-center ${
                      isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Image Section */}
                    <div className="lg:w-1/2 relative group">
                      <div className="relative h-96 rounded-2xl overflow-hidden">
                        <img
                          src={facility.image}
                          alt={facility.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                        
                        {/* Category Badge */}
                        <div
                          className={`absolute top-6 left-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border} shadow-2xl backdrop-blur-sm`}
                        >
                          {categoryConfig.label}
                        </div>

                        {/* Operating Hours */}
                        <div className="absolute bottom-6 left-6 bg-black/90 backdrop-blur-sm text-amber-100 px-4 py-3 rounded-lg border border-amber-600/30">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">{facility.operatingHours}</span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="absolute bottom-6 right-6 bg-black/90 backdrop-blur-sm text-amber-100 px-4 py-3 rounded-lg border border-amber-600/30">
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
                        <div className="p-3 bg-gradient-to-br from-amber-900/30 to-amber-950/50 rounded-xl border border-amber-800/30">
                          <IconComponent className="w-8 h-8 text-amber-400" />
                        </div>
                        <h3 className="text-4xl font-bold text-amber-100">{facility.name}</h3>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-amber-300 text-sm font-medium">5.0 Excellence</span>
                      </div>

                      <p className="text-gray-300 text-lg leading-relaxed mb-8">
                        {facility.description}
                      </p>

                      {/* Features Grid */}
                      <div className="mb-8">
                        <h4 className="font-bold text-amber-300 mb-4 text-lg uppercase tracking-wider flex items-center">
                          <Eye className="w-5 h-5 mr-2" />
                          Key Features
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {facility.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-300 text-base">
                              <span className="w-2 h-2 bg-amber-400 rounded-full mr-3 shadow-lg shadow-amber-400/50"></span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button className="group bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-2xl hover:shadow-amber-900/50 border-2 border-amber-400 flex items-center space-x-3">
                        <span>Explore Facility</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredFacilities.length === 0 && (
              <div className="text-center text-gray-500 py-16">
                <p className="text-lg">No facilities found for the selected category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-gradient-to-b from-black via-amber-950/10 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-8 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-amber-900/30">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-900/30 to-amber-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-800/30">
                  <Sparkles className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-3xl font-bold text-amber-100 mb-2">6+</h3>
                <p className="text-gray-400 text-lg">Premium Facilities</p>
              </div>

              <div className="p-8 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-amber-900/30">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-900/30 to-amber-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-800/30">
                  <Clock className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-3xl font-bold text-amber-100 mb-2">24/7</h3>
                <p className="text-gray-400 text-lg">Service Availability</p>
              </div>

              <div className="p-8 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-amber-900/30">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-900/30 to-amber-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-800/30">
                  <Heart className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-3xl font-bold text-amber-100 mb-2">100%</h3>
                <p className="text-gray-400 text-lg">Guest Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}