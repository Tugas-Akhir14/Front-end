// app/admin/hotel/review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// === CONFIG ===
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const ADMIN_API = `${API_URL}/api`;

// === TYPES ===
interface Review {
  id: number;
  rating: number;
  comment: string;
  guest_name: string | null;
  ip_address: string | null;
  created_at: string;
}

// === RATING STARS (dengan emas premium) ===
function RatingStars({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'text-lg' : 'text-xl';
  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`transition-all duration-200 ${
            star <= value
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600 drop-shadow-sm'
              : 'text-gray-300'
          }`}
          style={{ textShadow: star <= value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// === API FUNCTIONS ===
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('token');
  }
  return null;
};

const getPendingReviews = async (token: string): Promise<Review[]> => {
  const res = await fetch(`${ADMIN_API}/reviews/pending`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Gagal memuat ulasan pending');
  }
  return res.json();
};

const approveReview = async (id: number, token: string) => {
  const res = await fetch(`${ADMIN_API}/reviews/${id}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Gagal menyetujui ulasan');
  }
  return res.json();
};

const deleteReview = async (id: number, token: string) => {
  const res = await fetch(`${ADMIN_API}/reviews/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Gagal menghapus ulasan');
  }
  return res.json();
};

// === MAIN PAGE ===
export default function AdminHotelReviewPage() {
  const [token, setToken] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getToken();
    setToken(storedToken);
  }, []);

  const fetchReviews = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingReviews(token);
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token]);

  const handleApprove = async (id: number) => {
    if (!token) return;
    try {
      await approveReview(id, token);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui ulasan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm('Yakin ingin menghapus ulasan ini? Tindakan ini tidak bisa dibatalkan.')) {
      return;
    }
    try {
      await deleteReview(id, token);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus ulasan');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md border border-yellow-200">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-amber-800 font-bold text-lg mb-3">Akses Ditolak</p>
          <p className="text-gray-700 mb-6">Anda harus login sebagai admin untuk mengakses halaman ini.</p>
          <a
            href="/login"
            className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 text-sm font-bold text-black shadow-md hover:from-amber-600 hover:to-yellow-700 transition-all"
          >
            Login Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Moderasi Ulasan Hotel
            </h1>
            <a
              href="/"
              className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18m-8-9l-7 7 7 7" />
              </svg>
              Kembali
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800">
            Hanya ulasan yang <span className="font-bold">belum disetujui</span> yang ditampilkan di sini.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-amber-700">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="font-medium">Memuat ulasan pending...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
            <p className="font-bold text-rose-700 text-lg">Gagal memuat ulasan</p>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-yellow-200">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-bold text-xl">Tidak ada ulasan menunggu</p>
            <p className="text-gray-600 mt-2">Semua ulasan sudah ditinjau.</p>
          </div>
        )}

        {/* List */}
        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-5">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white p-6 rounded-2xl shadow-md border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-5">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <RatingStars value={r.rating} size="md" />
                      <span className="font-bold text-gray-800 text-lg">
                        {r.guest_name || 'Tamu'}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-base">{r.comment}</p>
                    <p className="text-xs text-gray-500 mt-4 flex items-center gap-2">
                      <svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(r.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                      {r.ip_address && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-mono text-amber-700">IP: {r.ip_address}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex gap-3 self-stretch lg:self-center">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="flex-1 lg:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-sm shadow-md hover:from-amber-600 hover:to-yellow-700 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Setujui
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="flex-1 lg:flex-initial px-6 py-3 rounded-xl border-2 border-rose-300 text-rose-700 font-bold text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}