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

// === RATING STARS (inline) ===
function RatingStars({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'text-lg' : 'text-xl';
  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= value ? 'text-yellow-400' : 'text-gray-300'}
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
    return sessionStorage.getItem('token'); // ← sesuai kode kamu
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

// === BARU: DELETE REVIEW ===
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

  // Ambil token dari sessionStorage
  useEffect(() => {
    const storedToken = getToken();
    setToken(storedToken);
  }, []);

  // Fetch ulasan pending
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

  // Handle Approve
  const handleApprove = async (id: number) => {
    if (!token) return;
    try {
      await approveReview(id, token);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui ulasan');
    }
  };

  // Handle Delete
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

  // Jika belum login
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">Anda harus login sebagai admin.</p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Login Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Moderasi Ulasan Hotel
            </h1>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Hanya ulasan yang belum disetujui yang ditampilkan.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-600 py-8">Memuat ulasan pending...</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-600 py-8">
            Gagal memuat: {error}
          </p>
        )}

        {/* Empty */}
        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            Tidak ada ulasan yang menunggu persetujuan.
          </div>
        )}

        {/* List */}
        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <RatingStars value={r.rating} size="sm" />
                      <span className="font-medium text-gray-800">
                        {r.guest_name || 'Tamu'}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      {format(new Date(r.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                      {r.ip_address && ` • IP: ${r.ip_address}`}
                    </p>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
                    >
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