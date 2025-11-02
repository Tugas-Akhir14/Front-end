'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, X, ChevronLeft, ChevronRight, Volume2, VolumeX, ZoomIn, ImageIcon } from 'lucide-react';
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
    <>
      <Header />
      <main className="pt-16">

        {/* Hero dengan animasi gradient */}
        <section className="relative h-[500px] bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
          {/* Animated background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-transparent animate-pulse"></div>
          
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg)' }}
          />
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4 space-y-6 animate-fade-in">
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center space-x-2 bg-yellow-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-600/30">
                  <ImageIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-semibold tracking-wide">VISUAL EXPERIENCE</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Gallery</span>
              </h1>
              
              <p className="text-lg md:text-2xl mb-8 text-gray-200 font-light max-w-3xl mx-auto leading-relaxed">
                Discover the beauty and luxury of Mutiara Hotel through our visual journey
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Virtual Tour
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-6 text-lg font-semibold transition-all duration-300"
                  onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <ZoomIn className="w-5 h-5 mr-2" />
                  View Gallery
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bottom wave decoration */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <svg className="w-full h-16 fill-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </section>


        {/* Gallery Section dengan enhanced styling */}
        <section id="gallery-section" className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header section dengan dekorasi */}
            <div className="text-center mb-20 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
              
              <div className="inline-block mt-8 mb-6">
                <span className="text-yellow-600 text-sm font-bold tracking-widest uppercase bg-yellow-50 px-6 py-2 rounded-full">
                  Explore Our Collection
                </span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Photo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">Gallery</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover the exquisite details and breathtaking views that await you at Mutiara Hotel
              </p>
              
              <div className="mt-8 flex justify-center">
                <div className="w-20 h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"></div>
              </div>
            </div>

            {/* Loading skeleton dengan animasi lebih smooth */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="relative">
                    <div className="h-96 rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state dengan styling lebih baik */}
            {!loading && err && (
              <div className="text-center py-16">
                <div className="inline-block bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">Gagal Memuat Galeri</h3>
                  <p className="text-red-600">{err}</p>
                </div>
              </div>
            )}

            {/* Empty state dengan styling lebih menarik */}
            {!loading && !err && items.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-block bg-gray-50 border-2 border-gray-200 rounded-2xl p-12 shadow-lg">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Foto</h3>
                  <p className="text-gray-600 text-lg">Galeri foto akan segera hadir</p>
                </div>
              </div>
            )}

            {/* Gallery grid dengan enhanced card design */}
            {!loading && !err && items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item, index) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer group border-0 bg-white rounded-2xl"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="relative h-96 overflow-hidden">
                      {/* Image dengan overlay effect */}
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
                      
                      {/* Badge dengan animasi */}
                      <div className="absolute top-5 left-5 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="w-4 h-4 inline mr-1" />
                        Photo
                      </div>
                      
                      {/* Gradient overlay bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-bold text-xl mb-2 line-clamp-2">{item.title || 'Untitled'}</h3>
                        <p className="text-gray-200 text-sm opacity-90 line-clamp-2">
                          {item.caption || 'Explore the beauty of Mutiara Hotel'}
                        </p>
                      </div>
                      
                      {/* Hover overlay dengan icon */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/30 to-yellow-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/30 backdrop-blur-md rounded-full p-6 transform scale-0 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                          <ZoomIn className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      
                      {/* Corner decoration */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-full"></div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Enhanced CTA section */}
            <div className="text-center mt-24">
              <Card className="bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white p-16 rounded-3xl shadow-2xl border-0 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
                
                <CardContent className="p-0 relative z-10">
                  <div className="max-w-3xl mx-auto space-y-8">
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
                      <span className="text-sm font-bold tracking-wide">SPECIAL OFFER</span>
                    </div>
                    
                    <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                      Ready to Experience It Yourself?
                    </h3>
                    
                    <p className="text-yellow-50 text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed">
                      Book your stay now and create your own beautiful memories at Mutiara Hotel
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button 
                        size="lg" 
                        className="bg-white text-yellow-700 hover:bg-gray-100 text-lg px-10 py-6 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full"
                      >
                        Book Your Stay
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-white text-white hover:bg-white hover:text-yellow-700 text-lg px-10 py-6 font-bold transition-all duration-300 transform hover:scale-105 rounded-full"
                      >
                        Contact Us
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Lightbox */}
      {selectedIndex !== null && items[selectedIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-7xl max-h-full w-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-4 transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-110 transform"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Navigation buttons dengan styling lebih baik */}
            <button
              onClick={prevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-4 transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-110 transform"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-4 transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-110 transform"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            {/* Image counter */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl">
              {selectedIndex + 1} / {items.length}
            </div>

            {/* Main content dengan animasi */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300">
              <img
                src={toAbsoluteURL(items[selectedIndex].url)}
                alt={items[selectedIndex].title || 'Gallery Photo'}
                className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop';
                }}
              />
              <div className="p-8 bg-gradient-to-r from-gray-50 to-white border-t-4 border-yellow-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                      {items[selectedIndex].title || 'Untitled'}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {items[selectedIndex].caption || 'Explore the beauty of Mutiara Hotel'}
                    </p>
                  </div>
                  <div className="bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold ml-4">
                    Photo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}