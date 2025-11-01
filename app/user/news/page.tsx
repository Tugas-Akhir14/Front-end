'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

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

function toAbsoluteURL(path?: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ');
}

export default function NewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [q, setQ] = useState('');
  const [qInput, setQInput] = useState('');

  const totalPages = useMemo(() => {
    // placeholder; updated after fetch
    return undefined as unknown as number;
  }, []);

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
      <main className="pt-16">
        {/* Hero */}
        <section className="relative h-80 bg-gray-900">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg)' }}
          />
          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="text-center text-white max-w-3xl px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Hotel <span className="text-yellow-400">News</span></h1>
              <p className="text-lg md:text-xl text-gray-200">Promo, acara, dan pengumuman terbaru dari Mutiara Hotel</p>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  placeholder="Cari berita (promo, event, dll)"
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => { setPage(1); setQ(qInput.trim()); }}
                >
                  Cari
                </Button>
                {q && (
                  <Button variant="outline" onClick={() => { setQ(''); setQInput(''); setPage(1); }}>
                    Reset
                  </Button>
                )}
              </div>
              <div className="ml-auto text-sm text-gray-600">
                {loading ? 'Memuat…' : `Menampilkan ${items.length} dari ${total} berita`}
              </div>
            </div>
          </div>
        </section>

        {/* List */}
        <section className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && err && (
              <div className="text-center text-red-600">{err}</div>
            )}

            {!loading && !err && items.length === 0 && (
              <div className="text-center text-gray-600">Belum ada berita.</div>
            )}

            {!loading && !err && items.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((n) => {
                    const img = toAbsoluteURL(n.image_url || '');
                    const excerpt = stripHtml(n.content).slice(0, 140) + (n.content && n.content.length > 140 ? '…' : '');
                    const date = n.published_at || n.created_at;
                    const dateStr = date ? new Date(date).toLocaleDateString() : '';
                    return (
                      <Card key={n.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img || 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop'}
                            alt={n.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute top-4 left-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {dateStr || 'Baru'}
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">{n.title}</h3>
                          <p className="text-gray-600 line-clamp-3 mb-4">{excerpt}</p>
                          <div className="flex justify-between items-center">
                            <Link href={`/user/news/${encodeURIComponent(n.slug)}`}>
                              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">Baca Selengkapnya</Button>
                            </Link>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">{(n.status || '').toUpperCase()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      disabled={!canPrev}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <div className="px-4 py-2 text-sm text-gray-700">
                      Page {page} dari {pages}
                    </div>
                    <Button
                      variant="outline"
                      disabled={!canNext}
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
