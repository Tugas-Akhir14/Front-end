'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

type News = {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url?: string;
  published_at?: string;
  created_at?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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
    ? new Date(item?.published_at || item?.created_at || '').toLocaleString()
    : '';

  return (
    <>
      <Header />
      <main className="pt-16">
        <section className="relative h-64 bg-gray-900">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${toAbsoluteURL(item?.image_url) || 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop'})`
            }}
          />
          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-3xl md:text-5xl font-bold">{item?.title || 'Loading…'}</h1>
              <p className="mt-2 text-gray-200">{dateStr}</p>
            </div>
          </div>
        </section>

        <section className="py-10 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link href="/user/news">
                <Button variant="outline"><ChevronLeft className="w-4 h-4 mr-1" /> Kembali</Button>
              </Link>
            </div>

            {loading && (
              <div className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
            )}

            {!loading && err && (
              <div className="text-center text-red-600">{err}</div>
            )}

            {!loading && !err && item && (
              <Card className="overflow-hidden">
                <div className="relative h-72 bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={toAbsoluteURL(item.image_url) || 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="prose max-w-none p-6">
                  {/* Render konten apa adanya; kalau backend kirim HTML aman, kalau plaintext tetap tampil */}
                  <div
                    className="prose-lg prose-img:rounded-xl prose-headings:scroll-mt-24"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
