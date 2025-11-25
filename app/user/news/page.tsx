'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ChatBot from '@/components/Chatbot/ChatBot';

type News = {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url?: string;
  status?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
};

type ListResponse = {
  data: News[];
  total: number;
  page: number;
  page_size: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Warna emas mewah
const GOLD = '#d4af37';
const GOLD_DARK = '#b8972e';

function toAbsoluteURL(path?: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function NewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [q, setQ] = useState('');
  const [qInput, setQInput] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const abort = new AbortController();
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const url = new URL(`${API_BASE}/public/news`);
        url.searchParams.set('page', String(page));
        url.searchParams.set('page_size', String(pageSize));
        if (q) url.searchParams.set('q', q);

        const res = await fetch(url.toString(), { signal: abort.signal, cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ListResponse = await res.json();
        setItems(json.data || []);
        setTotal(json.total || 0);
      } catch (e: any) {
        if (e.name !== 'AbortError') setErr(e.message || 'Gagal memuat berita');
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => abort.abort();
  }, [page, pageSize, q]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-gray-100 pt-16">
        {/* Hero Section - Black & Gold */}
        <section className="relative h-80 md:h-96 overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
            style={{
              backgroundImage:
                'ur[](https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(60% 80% at 50% 0%, ${GOLD} 0%, transparent 70%)`,
            }}
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                Hotel <span style={{ color: GOLD }}>News</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-300">
                Promo, acara, dan pengumuman terbaru dari Mutiara Hotel
              </p>
              <div className="mt-6 h-1 w-32 mx-auto rounded-full" style={{ backgroundColor: GOLD }} />
            </div>
          </div>
        </section>

        {/* Toolbar - Dark */}
        <section className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (setPage(1), setQ(qInput.trim()))}
                  placeholder="Cari berita (promo, event, dll)"
                  className="pl-11 bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-offset-0"
                  style={{ '--ring-color': GOLD } as React.CSSProperties}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="text-black font-medium hover:opacity-90 transition-all"
                  style={{ backgroundColor: GOLD }}
                  onClick={() => {
                    setPage(1);
                    setQ(qInput.trim());
                  }}
                >
                  Cari
                </Button>
                {q && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQ('');
                      setQInput('');
                      setPage(1);
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Reset
                  </Button>
                )}
              </div>
              <div className="md:ml-auto text-sm text-gray-400">
                {loading ? 'Memuat…' : `Menampilkan ${items.length} dari ${total} berita`}
              </div>
            </div>
          </div>
        </section>

        {/* List - Dark Theme */}
        <section className="py-14 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-lg"
                  >
                    <div className="absolute inset-0 animate-pulse">
                      <div className="h-52 bg-gradient-to-br from-gray-800 to-gray-900" />
                      <div className="p-6 space-y-4">
                        <div className="h-6 w-24 rounded-full bg-gray-700" />
                        <div className="h-7 w-11/12 bg-gray-700 rounded" />
                        <div className="h-5 w-full bg-gray-700 rounded" />
                        <div className="h-5 w-10/12 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && err && (
              <div className="text-center text-red-500 py-16 text-lg">{err}</div>
            )}

            {/* Empty */}
            {!loading && !err && items.length === 0 && (
              <div className="text-center text-gray-500 py-20 text-lg">
                Belum ada berita.
              </div>
            )}

            {/* News Grid */}
            {!loading && !err && items.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((n) => {
                    const img = toAbsoluteURL(n.image_url || '');
                    const excerpt =
                      stripHtml(n.content).slice(0, 140) +
                      (stripHtml(n.content).length > 140 ? '…' : '');
                    const date = n.published_at || n.created_at;
                    const dateStr = date ? new Date(date).toLocaleDateString('id-ID') : '';
                    const statusLabel = (n.status || '').toUpperCase();

                    return (
                      <Card
                        key={n.id}
                        className="overflow-hidden bg-gray-900 border border-gray-800 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-900/20 hover:-translate-y-2 hover:border-yellow-800"
                      >
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={
                              img ||
                              'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop'
                            }
                            alt={n.title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div
                            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-black"
                            style={{ backgroundColor: GOLD }}
                          >
                            {dateStr || 'Baru'}
                          </div>
                        </div>

                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-100 line-clamp-2 mb-3">
                            {n.title}
                          </h3>
                          <p className="text-gray-400 line-clamp-3 text-sm mb-5 leading-relaxed">
                            {excerpt}
                          </p>
                          <div className="flex justify-between items-center">
                            <Link href={`/user/news/${encodeURIComponent(n.slug)}`}>
                              <Button
                                size="sm"
                                className="text-black font-semibold hover:opacity-90 transition-all"
                                style={{ backgroundColor: GOLD }}
                              >
                                Baca Selengkapnya
                              </Button>
                            </Link>
                            {statusLabel && (
                              <span
                                className="text-xs px-3 py-1 rounded border font-medium tracking-wider"
                                style={{
                                  borderColor: GOLD,
                                  color: GOLD,
                                }}
                              >
                                {statusLabel}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination - Gold Accent */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-16">
                    <Button
                      variant="outline"
                      disabled={!canPrev}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="border-gray-700 text-gray-300 hover:bg-gray-900 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" /> Prev
                    </Button>

                    <div
                      className="px-6 py-3 rounded-full border-2 font-bold text-lg"
                      style={{ borderColor: GOLD, color: GOLD }}
                    >
                      {page} / {pages}
                    </div>

                    <Button
                      variant="outline"
                      disabled={!canNext}
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      className="border-gray-700 text-gray-300 hover:bg-gray-900 disabled:opacity-40"
                    >
                      Next <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}