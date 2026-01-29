'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, Clock } from 'lucide-react';

type News = {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url?: string;
  published_at?: string;
  created_at?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function toAbsoluteURL(path?: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/public/news/slug/${encodeURIComponent(slug)}`, {
          signal: abort.signal,
          cache: 'no-store'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setItem(json.data);
      } catch (e: any) {
        if (e.name !== 'AbortError') setErr(e.message || 'Gagal memuat berita');
      } finally {
        setLoading(false);
      }
    }
    if (slug) run();
    return () => abort.abort();
  }, [slug]);

  const dateStr = item?.published_at || item?.created_at
    ? new Date(item?.published_at || item?.created_at || '').toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const timeStr = item?.published_at || item?.created_at
    ? new Date(item?.published_at || item?.created_at || '').toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <>
      <Header />
      <main className="pt-16 bg-black min-h-screen">
        {/* Hero Section with Parallax Effect */}
        <section className="relative h-[70vh] overflow-hidden">
          {/* Gold Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10"></div>
          
          {/* Decorative Gold Lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent z-20"></div>
          
          {/* Background Image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transform scale-105 transition-transform duration-700"
            style={{
              backgroundImage: `url(${toAbsoluteURL(item?.image_url) || 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop'})`
            }}
          />
          
          {/* Content */}
          <div className="relative z-20 flex h-full items-end pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              {/* Back Button */}
              <div className="mb-8">
                <Link href="/user/news">
                  <Button 
                    variant="outline" 
                    className="border-yellow-500/30 bg-black/40 backdrop-blur-sm text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                  </Button>
                </Link>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {item?.title || (
                  <span className="inline-block w-3/4 h-12 bg-gradient-to-r from-yellow-500/20 to-transparent rounded animate-pulse"></span>
                )}
              </h1>
              
              {/* Meta Info */}
              {(dateStr || timeStr) && (
                <div className="flex flex-wrap items-center gap-6 text-yellow-500/90">
                  {dateStr && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-lg">{dateStr}</span>
                    </div>
                  )}
                  {timeStr && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-lg">{timeStr}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Gold Accent */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20"></div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-gradient-to-b from-black via-zinc-950 to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading && (
              <div className="space-y-6">
                <div className="h-96 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 animate-pulse" />
                <div className="h-8 rounded bg-zinc-900 animate-pulse w-3/4" />
                <div className="h-8 rounded bg-zinc-900 animate-pulse w-full" />
                <div className="h-8 rounded bg-zinc-900 animate-pulse w-5/6" />
              </div>
            )}

            {!loading && err && (
              <Card className="bg-red-950/50 border-red-500/30">
                <CardContent className="p-8 text-center">
                  <p className="text-red-400 text-lg">{err}</p>
                </CardContent>
              </Card>
            )}

            {!loading && !err && item && (
              <div className="space-y-8">
                {/* Featured Image Card */}
                <Card className="overflow-hidden border-yellow-500/20 bg-gradient-to-br from-zinc-900 to-black shadow-2xl shadow-yellow-500/5">
                  <div className="relative h-[500px] bg-zinc-900 overflow-hidden group">
                    {/* Gold Corner Accents */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-yellow-500/50 z-10"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-yellow-500/50 z-10"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-yellow-500/50 z-10"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-yellow-500/50 z-10"></div>
                    
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={toAbsoluteURL(item.image_url) || 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop'}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </Card>

                {/* Content Card */}
                <Card className="border-yellow-500/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black shadow-2xl shadow-yellow-500/5">
                  <CardContent className="p-8 md:p-12">
                    {/* Gold Divider */}
                    <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 mb-8 rounded-full"></div>
                    
                    {/* Article Content */}
                    <div
                      className="prose prose-lg prose-invert max-w-none
                        prose-headings:text-yellow-500 prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg
                        prose-a:text-yellow-500 prose-a:no-underline hover:prose-a:text-yellow-400 prose-a:transition-colors
                        prose-strong:text-yellow-500 prose-strong:font-semibold
                        prose-blockquote:border-l-yellow-500 prose-blockquote:bg-zinc-800/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic
                        prose-code:text-yellow-500 prose-code:bg-zinc-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                        prose-img:rounded-xl prose-img:shadow-2xl prose-img:shadow-yellow-500/10
                        prose-hr:border-yellow-500/30
                        prose-ul:text-gray-300 prose-ol:text-gray-300
                        prose-li:marker:text-yellow-500"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </CardContent>
                </Card>

                {/* Bottom Navigation */}
                <div className="flex justify-center pt-8">
                  <Link href="/user/news">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-semibold hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 shadow-lg shadow-yellow-500/20"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Kembali ke Daftar Berita
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}