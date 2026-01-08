'use client';

import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ChatBot from '@/components/Chatbot/ChatBot';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Waves, Coffee, Dumbbell, Car, Wifi, Shield, Sparkles, Camera } from 'lucide-react';
import Link from 'next/link';

const GOLD = '#d4af37';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-gray-100 overflow-hidden">
        {/* Hero Section - Unified Theme */}
        <section className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-black">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 scale-105"
              style={{ backgroundImage: 'url(https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black" />
            {/* Signature Gold Radial Gradient */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(60% 80% at 50% 0%, ${GOLD} 0%, transparent 70%)`,
              }}
            />
          </div>

          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center max-w-5xl px-4 space-y-8 animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 text-white">
                About <span style={{ color: GOLD }}>Us</span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in the opulent beauty and timeless elegance of our luxury sanctuary
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold text-white">
                Luxury Meets <span style={{ color: GOLD }}>Culture</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed font-light">
                Hotel Mutiara Balige is not just a place to stay — we are a <span style={{ color: GOLD }}>living legacy</span> blending
                modern luxury with the warm hospitality of Batak Toba culture. Every corner is designed to honor
                our local heritage while providing the highest international standards.
              </p>
              <p className="text-lg text-gray-400">
                Located in the heart of Balige, just minutes from the shores of Lake Toba, we offer perfect access
                to natural beauty, culinary delights, and authentic local experiences.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-gray-900 border-gray-800 p-10 rounded-3xl overflow-hidden hover:border-yellow-700/50 transition-colors duration-500">
                <div className="space-y-10">
                  {[
                    { icon: Sparkles, title: "Aesthetic Design", desc: "Elegant architecture inspired by local motifs" },
                    { icon: Waves, title: "Lake Toba View", desc: "Breathtaking panoramic views" },
                    { icon: Coffee, title: "Serene Spaces", desc: "Relaxing spots to unwind and rejuvenate" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group/item">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-black border border-gray-800 shadow-md">
                        <item.icon className="w-7 h-7" style={{ color: GOLD }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-24 bg-gray-950 border-y border-gray-900">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold mb-16 text-white">
              Our <span style={{ color: GOLD }}>Commitment</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <Card className="bg-black border-gray-800 p-12 rounded-3xl hover:border-yellow-800/50 transition-all duration-500 group">
                <div className="text-4xl font-bold mb-6 text-gray-100 group-hover:text-white">Vision</div>
                <p className="text-xl text-gray-400 leading-relaxed font-light">
                  To be the premier destination in Lake Toba, seamlessly combining world-class luxury
                  with cultural preservation and environmental sustainability.
                </p>
              </Card>

              <Card className="bg-black border-gray-800 p-12 rounded-3xl hover:border-yellow-800/50 transition-all duration-500 group">
                <div className="text-4xl font-bold mb-6 text-gray-100 group-hover:text-white">Mission</div>
                <ul className="text-left text-gray-400 space-y-4 text-lg mt-8 font-light">
                  {[
                    "Unmatched service with Batak hospitality",
                    "Modern facilities of international standard",
                    "Supporting local tourism and economy"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }}></span>
                      {text}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Facilities Grid */}
        <section className="py-24 px-6 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4 text-white">Premium <span style={{ color: GOLD }}>Facilities</span></h2>
              <p className="text-xl text-gray-400">Everything you need in one luxurious place</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Waves, label: "Infinity Pool" },
                { icon: Dumbbell, label: "Fitness Center" },
                { icon: Coffee, label: "Lake View Café" },
                { icon: Car, label: "Valet Parking" },
                { icon: Wifi, label: "High-Speed WiFi" },
                { icon: Sparkles, label: "Spa & Wellness" },
                { icon: MapPin, label: "Grand Ballroom" },
                { icon: Shield, label: "24/7 Security" },
              ].map((f, i) => (
                <Card key={i} className="bg-gray-900 border-gray-800 text-center py-8 rounded-2xl hover:border-yellow-800 hover:-translate-y-1 transition-all duration-300">
                  <f.icon className="w-10 h-10 mx-auto mb-4" style={{ color: GOLD }} />
                  <p className="text-gray-200 font-medium">
                    {f.label}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="py-24 bg-gray-950 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold text-white mb-12">Strategic <span style={{ color: GOLD }}>Location</span></h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { icon: MapPin, title: "Balige Center", desc: "5 mins from city center" },
                { icon: Waves, title: "Lake Toba", desc: "10 mins to the shore" },
                { icon: Car, title: "Silangit Airport", desc: "45 mins drive" },
              ].map((loc, i) => (
                <div key={i} className="bg-black border border-gray-800 p-10 rounded-3xl hover:border-gray-700 transition-colors">
                  <loc.icon className="w-12 h-12 mx-auto mb-6" style={{ color: GOLD }} />
                  <h3 className="text-xl font-bold text-white mb-2">{loc.title}</h3>
                  <p className="text-gray-400 font-light">{loc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center bg-black relative">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
              Start Your <span style={{ color: GOLD }}>Journey</span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 font-light">
              Book now and experience true luxury by Lake Toba
            </p>
            <Button
              asChild
              size="lg"
              className="text-black font-bold text-xl px-12 py-8 rounded-full shadow-xl hover:shadow-yellow-900/30 hover:scale-105 transition-all"
              style={{ backgroundColor: GOLD }}
            >
              <Link href="/user/rooms">Book Now</Link>
            </Button>
          </div>
        </section>
      </div>

      <Footer />
      <ChatBot />
    </>
  );
}