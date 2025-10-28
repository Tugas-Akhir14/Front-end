'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../layout';

export type Gallery = {
  id: number;
  title: string;
  caption: string;
  url: string;          // contoh: "/uploads/gallery/xxx.jpg"
  created_at: string;
  updated_at: string;
};

const API_BASE = 'http://localhost:8080'; // backend origin

function fileURL(path: string | null | undefined) {
  if (!path) return '/placeholder.svg';
  // jika sudah absolute, langsung kembalikan
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // pastikan path punya leading slash
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  } catch {
    return '—';
  }
}

export default function AdminGalleryPage() {
  const { authFetch } = useAuth();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenRaw = sessionStorage.getItem('token');
        if (!tokenRaw) {
          setError('Token tidak ditemukan. Silakan login kembali.');
          return;
        }

        const limit = pageSize;
        const offset = (page - 1) * pageSize;

        const res = await fetch(`${API_BASE}/api/galleries?limit=${limit}&offset=${offset}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenRaw.replace(/^"+|"+$/g, '')}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Gagal memuat galeri. Status ${res.status}`);
        }

        const payload = await res.json();
        setGalleries(payload.data || []);
        setTotal(payload.total || 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gagal memuat data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize]);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Galeri</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/gallery/create"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black"
            >
              + Tambah Foto
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            placeholder="Cari gambar…"
            className="w-full sm:w-64 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <div className="ml-auto text-sm text-zinc-600">
            Total: <span className="font-medium">{total}</span> <span className="text-zinc-400">({pageSize}/halaman)</span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-zinc-700">Memuat galeri…</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Gagal memuat galeri</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 p-10 text-center">
            <p className="text-zinc-700 font-medium">Belum ada gambar.</p>
            <p className="text-zinc-500 text-sm mt-1">
              Klik tombol <span className="font-semibold">Tambah Foto</span> untuk membuat galeri baru.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200 bg-white">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Cover</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Judul</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Diperbarui</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {galleries.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/60">
                      <td className="px-4 py-3">
                        <div className="h-14 w-20 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                          <img
                            src={fileURL(item.url)}
                            alt={item.title || 'image'}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">{item.title || '—'}</td>
                      <td className="px-4 py-3 align-top">Published</td>
                      <td className="px-4 py-3 align-top text-sm text-zinc-700">{formatDate(item.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 rounded-xl border border-zinc-200 text-sm disabled:opacity-50"
              >
                ← Sebelumnya
              </button>
              <div className="text-sm text-zinc-600">
                Halaman <span className="font-medium">{page}</span> dari{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-xl border border-zinc-200 text-sm disabled:opacity-50"
              >
                Selanjutnya →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
