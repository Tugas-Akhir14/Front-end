'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Wifi, Car, Utensils, Dumbbell, Waves } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ChatBot from '@/components/Chatbot/ChatBot';

export default function Home() {
  const [reservationData, setReservationData] = useState(null);

  const features = [
    {
      icon: Wifi,
      title: 'Free Wi-Fi',
      description: 'High-speed internet throughout the hotel',
    },
    {
      icon: Car,
      title: 'Free Parking',
      description: 'Complimentary valet parking service',
    },
    {
      icon: Utensils,
      title: 'Fine Dining',
      description: 'Award-winning restaurant with local cuisine',
    },
    {
      icon: Dumbbell,
      title: 'Fitness Center',
      description: '24/7 access to modern gym equipment',
    },
    {
      icon: Waves,
      title: 'Pool & Spa',
      description: 'Relaxing pool and full-service spa',
    },
  ];

  const rooms = [
    {
      name: 'Standard Room',
      price: '$150',
      image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg',
      features: ['Queen bed', 'City view', 'Free Wi-Fi', 'Mini bar'],
    },
    {
      name: 'Deluxe Room',
      price: '$250',
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      features: ['King bed', 'Ocean view', 'Balcony', 'Premium amenities'],
    },
    {
      name: 'Presidential Suite',
      price: '$800',
      image: 'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg',
      features: ['Master bedroom', 'Living area', 'Private terrace', 'Butler service'],
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Absolutely amazing experience! The service was impeccable and the room was luxurious.',
    },
    {
      name: 'Michael Chen',
      rating: 5,
      comment: 'Perfect location and outstanding amenities. Will definitely come back!',
    },
    {
      name: 'Emma Williams',
      rating: 5,
      comment: 'The spa services were incredible and the staff went above and beyond.',
    },
  ];

  const handleReservationRequest = (data: any) => {
    setReservationData(data);
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
                <Button 
                  size="lg" 
                  className="bg-yellow-600 hover:bg-yellow-500 text-white border-2 border-yellow-500 hover:border-yellow-400 px-8 py-3 text-lg font-semibold transition-all duration-300 shadow-lg shadow-yellow-600/20"
                >
                  Book Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-3 font-semibold transition-all duration-300 backdrop-blur-sm"
                >
                  Explore Rooms
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Pure Black */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">World-Class Amenities</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Discover the finest amenities designed to make your stay unforgettable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="text-center p-6 hover:shadow-2xl transition-all duration-300 border-yellow-600/30 bg-gray-900 hover:bg-gray-800 hover:border-yellow-500/50 hover:transform hover:-translate-y-2"
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                      <feature.icon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Rooms Section - Pure Black */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">Luxury Accommodations</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Choose from our selection of beautifully appointed rooms and suites
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <Card 
                  key={index} 
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-yellow-600/30 bg-gray-900 hover:bg-gray-800 hover:border-yellow-500/50 hover:transform hover:-translate-y-2"
                >
                  <div className="relative h-64">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full font-semibold border border-yellow-400 shadow-lg">
                      {room.price}/night
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold text-white mb-3">{room.name}</h3>
                    <ul className="space-y-2 mb-6">
                      {room.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-gray-300 flex items-center">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 shadow-sm shadow-yellow-400/50"></span>
                          {feature}
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
          </div>
        </section>

        {/* Testimonials Section - Pure Black */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">What Our Guests Say</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Read reviews from our satisfied guests who experienced Mutiara at its finest
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-gray-900 border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300 hover:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 italic">"{testimonial.comment}"</p>
                    <p className="font-semibold text-yellow-400">{testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Pure Black */}
        <section className="py-20 bg-black text-white relative overflow-hidden">
          {/* Gold accent pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-bold text-yellow-400 mb-4">Ready to Experience Luxury?</h2>
            <p className="text-xl mb-8 text-gray-300">
              Book your stay now and discover what makes Mutiara Hotel the premier destination
            </p>
            <div className="space-x-4 space-y-4 sm:space-y-0">
              <Button 
                size="lg" 
                className="bg-yellow-600 hover:bg-yellow-500 text-white border-2 border-yellow-500 hover:border-yellow-400 text-lg px-8 py-3 font-semibold transition-all duration-300 shadow-lg shadow-yellow-600/20"
              >
                Book Your Stay
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-3 font-semibold transition-all duration-300 backdrop-blur-sm"
              >
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