'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, ZoomIn, Sparkles, Camera, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ChatBot from '@/components/Chatbot/ChatBot';

const GOLD = '#d4af37';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const nextImage = () => {
    if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % items.length);
  };
  const prevImage = () => {
    if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  return (
    <div className="bg-black min-h-screen">
      <Header />

      <main className="pt-16">
        {/* Unified Hero Section */}
        <section className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-black">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 scale-105"
              style={{ backgroundImage: 'url(https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg)' }}
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
                  <Camera className="w-4 h-4" style={{ color: GOLD }} />
                  <span className="text-gray-300 text-sm font-bold tracking-widest uppercase">Visual Excellence</span>
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight text-white">
                Our <span style={{ color: GOLD }}>Gallery</span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in the opulent beauty and timeless elegance of our luxury sanctuary
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-96 rounded-3xl bg-gray-900 animate-pulse border border-gray-800" />
                ))}
              </div>
            )}

            {!loading && err && (
              <div className="text-center py-20">
                <div className="inline-block bg-red-950/20 border border-red-900/50 rounded-3xl p-12">
                  <X className="w-10 h-10 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Unavailable</h3>
                  <p className="text-red-300/70">{err}</p>
                </div>
              </div>
            )}

            {!loading && !err && items.length === 0 && (
              <div className="text-center py-32">
                <div className="inline-block bg-gray-900 border border-gray-800 rounded-3xl p-16">
                  <ImageIcon className="w-12 h-12 mb-6 mx-auto" style={{ color: GOLD }} />
                  <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
                  <p className="text-gray-500">Our exclusive collection will be revealed shortly</p>
                </div>
              </div>
            )}

            {!loading && !err && items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item, index) => (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden bg-gray-900 border-gray-800 rounded-3xl cursor-pointer hover:border-yellow-800 transition-all duration-500"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="relative h-96 overflow-hidden">
                      <img
                        src={toAbsoluteURL(item.url)}
                        alt={item.title || 'Gallery Photo'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop';
                        }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                      {/* Zoom Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-full border border-gray-700">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-bold text-xl text-white mb-1 line-clamp-1">{item.title || 'Untitled'}</h3>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {item.caption || 'Luxury Collection'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Lightbox */}
      {selectedIndex !== null && items[selectedIndex] && (
        <div className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-6xl">
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute -top-16 right-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Nav */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/80 transition-colors border border-gray-800 text-white z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/80 transition-colors border border-gray-800 text-white z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-gray-800">
              <img
                src={toAbsoluteURL(items[selectedIndex].url)}
                alt={items[selectedIndex].title || 'Gallery'}
                className="w-full h-auto max-h-[85vh] object-contain mx-auto"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8 pt-24 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{items[selectedIndex].title}</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">{items[selectedIndex].caption}</p>
              </div>
            </div>

            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-gray-500 font-medium">
              {selectedIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}
      <ChatBot />
    </div>
  );
}