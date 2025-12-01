// app/admin/hotel/review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const HOTEL_REVIEWS_API = `${API_URL}/api/reviews`; // atau /api/hotel/reviews → sesuaikan

interface Review {
  id: number;
  rating: number;
  comment: string;
  guest_name: string | null;
  ip_address: string | null;
  created_at: string;
}

// === RATING STARS ===
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

// === Ambil token dari sessionStorage ===
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token');
};

// === API: Fetch ulasan DENGAN token (wajib!) ===
const fetchHotelReviews = async (token: string): Promise<Review[]> => {
  const res = await fetch(HOTEL_REVIEWS_API, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // <<< INI YANG HILANG SEBELUMNYA!
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text();
    let errorMsg = 'Gagal memuat ulasan';
    try {
      const json = JSON.parse(errText);
      errorMsg = json.error || json.message || errText;
    } catch {
      errorMsg = errText || `Status: ${res.status}`;
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();

  // Normalisasi response
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.reviews && Array.isArray(data.reviews)) return data.reviews;

  throw new Error('Format respons tidak didukung');
};

// === MAIN COMPONENT ===
export default function AdminHotelReviewPage() {
  const [token, setToken] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil token saat mount
  useEffect(() => {
    const storedToken = getToken();
    setToken(storedToken);
  }, []);

  const loadReviews = async () => {
    if (!token) {
      setError('Token tidak ditemukan. Silakan login ulang.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchHotelReviews(token);
      const sorted = data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReviews(sorted);
    } catch (err: any) {
      console.error('Fetch reviews error:', err);
      setError(err.message || 'Gagal memuat ulasan');
    } finally {
      setLoading(false);
    }
  };

  // Load ulasan saat token tersedia
  useEffect(() => {
    if (token !== null) {
      loadReviews();
    }
  }, [token]);

  // === Jika belum login (token null) ===
  if (token === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md border border-yellow-200">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
      <header className="bg-white shadow-lg border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Daftar Ulasan Hotel
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Total: <span className="font-bold text-amber-700">{reviews.length}</span> ulasan ditampilkan
              </p>
            </div>  
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-amber-700">
              <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="font-medium">Memuat ulasan...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
            <p className="font-bold text-rose-700 text-lg">Gagal memuat ulasan</p>
            <p className="text-sm text-rose-600 mt-2 break-words">{error}</p>
            <button onClick={loadReviews} className="mt-4 text-rose-700 underline font-medium">
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-yellow-200">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2a2 2 0 00-2 2v3m-8-5h6" />
              </svg>
            </div>
            <p className="text-gray-800 font-bold text-xl">Belum ada ulasan</p>
            <p className="text-gray-600 mt-2">Belum ada ulasan yang ditampilkan di website.</p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-amber-200 transition-all">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <RatingStars value={r.rating} size="md" />
                  <span className="font-bold text-gray-800 text-lg">{r.guest_name || 'Tamu'}</span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">Ditampilkan</span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{r.comment}</p>
                <div className="mt-4 text-xs text-gray-500 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {format(new Date(r.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                  </span>
                  {r.ip_address && (
                    <>
                      <span>•</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">IP: {r.ip_address}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}