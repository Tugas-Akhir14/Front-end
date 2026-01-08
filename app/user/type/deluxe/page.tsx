'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Maximize, Users, Bed, Wifi, Wind, Check, Coffee, Tv, Music, Bath, Shirt } from "lucide-react";
import Link from "next/link";
import ChatBot from '@/components/Chatbot/ChatBot';

const GOLD = '#d4af37';

export default function DeluxeRoomDetail() {
  const features = [
    { icon: Maximize, label: "52 m²" },
    { icon: Users, label: "2 Adults" },
    { icon: Bed, label: "King / Twin" },
    { icon: Bath, label: "Rain Shower" },
  ];

  const amenities = [
    { icon: Wifi, label: "High-speed Wi-Fi 500 Mbps" },
    { icon: Tv, label: "65” Smart TV" },
    { icon: Music, label: "Marshall Bluetooth Speaker" },
    { icon: Coffee, label: "Nespresso Machine" },
    { icon: Shirt, label: "Walk-in Wardrobe" },
    { icon: Check, label: "Electronic Safe" },
    { icon: Check, label: "Daily Turndown Service" },
    { icon: Check, label: "Smart Lighting" },
  ];

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/deluxe.jpg"
            alt="Deluxe Room"
            className="w-full h-full object-cover transition-transform duration-1000 md:scale-105"
          />
          <div className="absolute inset-0 bg-black/40" />
           {/* Gold Radial Gradient */}
           <div
              className="absolute inset-0 opacity-50"
              style={{
                background: `radial-gradient(circle at center, ${GOLD} 0%, transparent 70%)`,
                mixBlendMode: 'overlay'
              }}
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        {/* Back Button */}
        <Link
          href="/user/rooms"
          className="absolute top-8 left-8 z-30 flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-all group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-wide">Back to Rooms</span>
        </Link>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-6 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              Deluxe <span style={{ color: GOLD }}>Room</span>
            </h1>
            <p className="text-xl text-gray-200 font-light max-w-2xl mx-auto tracking-wide">
              Refined comfort with brushed gold accents and a warm, inviting atmosphere
            </p>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-16">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Quick Specs Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
               {features.map((f, i) => (
                  <div key={i} className="flex flex-col items-center justify-center gap-2 text-center">
                     <f.icon className="w-6 h-6" style={{ color: GOLD }} />
                     <span className="text-gray-300 font-medium">{f.label}</span>
                  </div>
               ))}
            </div>

            {/* Description */}
            <div>
               <h2 className="text-3xl font-bold text-white mb-6">Room Overview</h2>
               <p className="text-gray-400 leading-relaxed text-lg font-light">
                  Designed for the discerning traveler, our Deluxe Room offers a generous 52 m² of elegant space. 
                  Featuring Egyptian cotton linens and premium local amenities, this room provides a sanctuary of 
                  calm. Whether for business or leisure, enjoy smart room controls and dedicated workspaces.
               </p>
            </div>

            {/* Amenities Grid */}
            <div>
               <h2 className="text-3xl font-bold text-white mb-8">Amenities</h2>
               <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                  {amenities.map((item, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors bg-gray-900/30">
                        <item.icon className="w-5 h-5" style={{ color: GOLD }} />
                        <span className="text-gray-300">{item.label}</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sticky Booking Card */}
          <div className="lg:col-span-1">
             <div className="sticky top-8">
                <Card className="bg-gray-900 border-gray-800 p-8 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden relative">
                   {/* Glow effect */}
                   <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-600/20 blur-3xl rounded-full pointer-events-none" />
                   
                   <div className="relative z-10 text-center space-y-8">
                      <div>
                         <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Starting from</p>
                         <h3 className="text-5xl font-bold text-white mb-2">
                           IDR 630k
                           <span className="text-lg text-gray-500 font-normal ml-1">/ night</span>
                         </h3>
                         <p className="text-teal-400 text-sm font-medium">Includes Breakfast for 2</p>
                      </div>

                      <div className="space-y-4">
                         <Button 
                           asChild
                           className="w-full h-14 text-lg font-bold text-black rounded-xl hover:scale-[1.02] transition-transform shadow-lg"
                           style={{ backgroundColor: GOLD }}
                         >
                            <Link href="/user/rooms">Book Now</Link>
                         </Button>
                         <Button 
                           asChild
                           variant="outline"
                           className="w-full h-14 text-lg font-medium border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl"
                         >
                            <Link href="/user/contact">Contact Us</Link>
                         </Button>
                      </div>

                      <div className="pt-6 border-t border-gray-800 text-xs text-center text-gray-500 space-y-1">
                         <p>Free Cancellation 24h before check-in</p>
                         <p>Best Rate Guarantee</p>
                      </div>
                   </div>
                </Card>
             </div>
          </div>

        </div>
      </section>
      <ChatBot />
    </div>
  );
}