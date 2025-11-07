'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, X, ChevronLeft, ChevronRight, Volume2, VolumeX, ZoomIn, Sparkles, Crown, Camera, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

type APIGalleryItem = {
  id: number;
  url: string;
  title?: string | null;
  caption?: string | null;
  room_id?: number | null;
  mime_type?: string | null;
  size?: number | null;
};

type APIListResponse = {
  data: APIGalleryItem[];
  total?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

function toAbsoluteURL(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

export default function Gallery() {
  const [items, setItems] = useState<APIGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const abort = new AbortController();

    async function fetchGallery() {
      setLoading(true);
      setErr(null);
      try {
        let res = await fetch(`${API_BASE}/public/gallery`, { signal: abort.signal, cache: 'no-store' });
        if (res.status === 404) {
          res = await fetch(`${API_BASE}/public/galleries`, { signal: abort.signal, cache: 'no-store' });
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as APIListResponse | APIGalleryItem[];
        const data = Array.isArray(json) ? json : json.data;

        const cleaned = (data || []).filter(Boolean);
        setItems(cleaned);
      } catch (e: any) {
        if (e.name !== 'AbortError') setErr(e.message || 'Gagal memuat galeri');
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
    return () => abort.abort();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (videoRef.current) {
        const iframe = videoRef.current;
        iframe.src = `https://www.youtube.com/embed/4PLYhb7Wq7Y?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0&loop=1&playlist=4PLYhb7Wq7Y`;
      }
    }, 600);
    return () => clearTimeout(t);
  }, [isMuted]);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const nextImage = () => {
    if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % items.length);
  };
  const prevImage = () => {
    if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };
  const toggleMute = () => {
    setIsMuted(v => !v);
    if (videoRef.current) {
      const iframe = videoRef.current;
      iframe.src = `https://www.youtube.com/embed/4PLYhb7Wq7Y?autoplay=1&mute=${!isMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0&loop=1&playlist=4PLYhb7Wq7Y`;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="pt-16">

        <Header />

        {/* Hero dengan tema putih gold */}
        <section className="relative h-[600px] bg-gradient-to-br from-white via-amber-50 to-yellow-50 overflow-hidden">
          {/* Animated gold pattern background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #d4af37 2px, transparent 2px)',
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-amber-50/60 to-transparent z-10"></div>
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105 opacity-30"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg)' }}
          />
          
          {/* Floating sparkles */}
          <div className="absolute top-20 left-10 animate-pulse z-20">
            <Sparkles className="w-10 h-10 text-amber-500 opacity-70" />
          </div>
          <div className="absolute top-32 right-20 animate-pulse z-20" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-8 h-8 text-yellow-600 opacity-70" />
          </div>
          <div className="absolute bottom-40 left-1/3 animate-pulse z-20" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-9 h-9 text-amber-600 opacity-70" />
          </div>
          
          {/* Gold glow effects */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-amber-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-yellow-300/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          
          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="text-center max-w-5xl px-4 space-y-8">
              
              {/* Badge */}
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-amber-100 to-yellow-100 backdrop-blur-md px-6 py-3 rounded-full border-2 border-amber-300">
                  <Camera className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700 text-sm font-bold tracking-widest uppercase">Visual Excellence</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  Gallery
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-10 text-gray-700 font-light max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in the opulent beauty and timeless elegance of our luxury sanctuary
              </p>
              
              {/* Decorative line */}
              <div className="flex justify-center mb-10">
                <div className="h-px w-64 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
               
              </div>
            </div>
          </div>
          
          {/* Bottom gradient transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-20"></div>
        </section>


        {/* Gallery Section */}
        <section id="gallery-section" className="py-28 bg-gradient-to-b from-white via-amber-50/30 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header section */}
            <div className="text-center mb-24 relative">
              {/* Top decorative line */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-2">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400"></div>
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400"></div>
                </div>
              </div>
              
              <div className="inline-block mb-6">
                <span className="text-amber-700 text-sm font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-amber-100 to-yellow-100 px-8 py-3 rounded-full border-2 border-amber-300">
                  Exclusive Collection
                </span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  Our Portfolio
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                Each image tells a story of luxury, comfort, and timeless sophistication
              </p>
              
              {/* Bottom decorative line */}
              <div className="flex justify-center mt-10">
                <div className="w-24 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 rounded-full"></div>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="relative">
                    <div className="h-96 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-white animate-pulse border-2 border-amber-200">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent animate-shimmer rounded-2xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && err && (
              <div className="text-center py-20">
                <div className="inline-block bg-gradient-to-br from-red-50 to-white border-2 border-red-300 rounded-3xl p-12 shadow-xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-300">
                    <X className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600 mb-3">Unable to Load Gallery</h3>
                  <p className="text-red-500">{err}</p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !err && items.length === 0 && (
              <div className="text-center py-24">
                <div className="inline-block bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300 rounded-3xl p-16 shadow-xl">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-amber-300">
                    <ImageIcon className="w-12 h-12 text-amber-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Gallery Coming Soon</h3>
                  <p className="text-gray-600 text-lg">Our exclusive collection will be revealed shortly</p>
                </div>
              </div>
            )}

            {/* Gallery grid */}
            {!loading && !err && items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item, index) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 transform hover:-translate-y-4 cursor-pointer group border-2 border-amber-300 hover:border-amber-400 bg-white rounded-2xl"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="relative h-96 overflow-hidden">
                      {/* Image */}
                      <img
                        src={toAbsoluteURL(item.url)}
                        alt={item.title || 'Gallery Photo'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop';
                        }}
                      />
                      
                      {/* Light overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-amber-50/30 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300"></div>
                      
                      {/* Badge */}
                      <div className="absolute top-5 left-5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl transform group-hover:scale-110 transition-transform duration-300 border-2 border-amber-400">
                        <Camera className="w-3 h-3 inline mr-1" />
                        LUXURY
                      </div>
                      
                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-800">{item.title || 'Untitled'}</h3>
                        <p className="text-gray-700 text-sm opacity-90 line-clamp-2">
                          {item.caption || 'Experience the epitome of luxury'}
                        </p>
                      </div>
                      
                      {/* Hover overlay with zoom icon */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-yellow-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-md rounded-full p-8 transform scale-0 group-hover:scale-100 transition-transform duration-500 shadow-2xl border-2 border-amber-400">
                          <ZoomIn className="w-12 h-12 text-amber-600" />
                        </div>
                      </div>
                      
                      {/* Corner glow effect */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-300/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-full"></div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Enhanced CTA section */}
            <div className="text-center mt-32">
              <Card className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-white p-20 rounded-3xl shadow-2xl border-4 border-amber-400 relative overflow-hidden">
                {/* Decorative background patterns */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
                    backgroundSize: '40px 40px'
                  }}></div>
                </div>
                
                {/* Floating decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
                
                <CardContent className="p-0 relative z-10">
                  <div className="max-w-3xl mx-auto space-y-10">
                    
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-3 rounded-full mb-4 border border-white/30">
                      <span className="text-sm font-bold tracking-widest">EXCLUSIVE INVITATION</span>
                    </div>
                    
                    <h3 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                      Create Your Own Legacy
                    </h3>
                    
                    <p className="text-white/90 text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                      Step into a world where every moment becomes a treasured memory
                    </p>
                    
                    {/* Decorative line */}
                    <div className="flex justify-center mb-10">
                      <div className="w-32 h-1 bg-white/30 rounded-full"></div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                      <Button 
                        size="lg" 
                        className="bg-white text-amber-700 hover:bg-gray-50 text-lg px-12 py-7 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white"
                      >
                        Reserve Now
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-white text-white hover:bg-white hover:text-amber-700 text-lg px-12 py-7 font-bold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                      >
                        Contact Concierge
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <Footer />
      </main>

      {/* Enhanced Lightbox with white & gold theme */}
      {selectedIndex !== null && items[selectedIndex] && (
        <div className="fixed inset-0 z-50 bg-white/98 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="relative max-w-7xl max-h-full w-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 bg-gradient-to-br from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-700 rounded-full p-5 transition-all duration-200 shadow-xl hover:scale-110 transform border-2 border-amber-300"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={prevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-br from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-700 rounded-full p-5 transition-all duration-200 shadow-xl hover:scale-110 transform border-2 border-amber-300"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-br from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-700 rounded-full p-5 transition-all duration-200 shadow-xl hover:scale-110 transform border-2 border-amber-300"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            {/* Image counter */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-8 py-4 rounded-full text-sm font-bold shadow-xl border-2 border-amber-300">
              {selectedIndex + 1} / {items.length}
            </div>

            {/* Main content */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300 border-2 border-amber-300">
              <img
                src={toAbsoluteURL(items[selectedIndex].url)}
                alt={items[selectedIndex].title || 'Gallery Photo'}
                className="w-full h-auto max-h-[70vh] object-contain bg-gray-50"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop';
                }}
              />
              <div className="p-10 bg-gradient-to-r from-amber-50 to-yellow-50 border-t-4 border-amber-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">
                      {items[selectedIndex].title || 'Untitled'}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {items[selectedIndex].caption || 'Experience the epitome of luxury at Mutiara Hotel'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-5 py-3 rounded-full text-sm font-bold ml-4 border-2 border-amber-400">
                    <Camera className="w-4 h-4 inline mr-1" />
                    LUXURY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}