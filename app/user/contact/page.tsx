'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Star, Send, LogIn, Loader2, Edit2, Trash2, Check, MessageSquare
} from 'lucide-react';

interface Admin {
  id: number;
  full_name?: string;
  email: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  guest_name?: string;
  created_at: string;
  updated_at?: string;
  admin?: Admin | null;
}

function ReviewSection() {
  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Tamu');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // My Reviews Only
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const MIN_COMMENT = 10;

  // Cek login
  useEffect(() => {
    const check = () => {
      const token = sessionStorage.getItem('token');
      const userStr = sessionStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUserName(user.full_name || user.email.split('@')[0]);
          setUserRole(user.role);
          setUserId(user.id);
        } catch {
          setIsLoggedIn(false);
        }
      }
      setLoadingAuth(false);
    };
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  // Load hanya ulasan milik sendiri
  const loadMyReviews = async () => {
    if (!isLoggedIn || !userId) return;

    setLoadingReviews(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/public/reviews/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMyReviews(Array.isArray(data) ? data : []);
      } else {
        setMyReviews([]);
      }
    } catch (e) {
      console.error('Failed to load my reviews:', e);
      setMyReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load ulasan setiap kali login berubah atau setelah CRUD
  useEffect(() => {
    if (isLoggedIn && userRole === 'guest') {
      loadMyReviews();
    }
  }, [isLoggedIn, userRole]);

  // Submit ulasan baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (!token || userRole !== 'guest') return;
    if (rating === 0 || comment.trim().length < MIN_COMMENT) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/public/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          guest_name: guestName.trim() || undefined,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Ulasan berhasil dikirim!' });
        setRating(0);
        setComment('');
        setGuestName('');
        loadMyReviews(); // Refresh hanya milik sendiri
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Gagal mengirim ulasan' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Koneksi error, coba lagi' });
    } finally {
      setSubmitting(false);
    }
  };

  // Edit
  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const saveEdit = async (id: number) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/public/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment.trim(),
        }),
      });

      if (res.ok) {
        setEditingId(null);
        loadMyReviews();
        setMessage({ type: 'success', text: 'Ulasan berhasil diperbarui!' });
      } else {
        setMessage({ type: 'error', text: 'Gagal update ulasan' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Koneksi error' });
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus ulasan ini?')) return;
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`/public/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadMyReviews();
      setMessage({ type: 'success', text: 'Ulasan berhasil dihapus' });
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghapus ulasan' });
    }
  };

  // Rating Stars
  const RatingStars = ({ value, onChange, readonly = false }: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(i)}
          className={`transition-all ${readonly ? '' : 'hover:scale-125 cursor-pointer'}`}
        >
          <Star className={`w-8 h-8 ${i <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loadingAuth) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <>
      {/* FORM ULASAN */}
      {!isLoggedIn ? (
        <Card className="shadow-xl border-yellow-200 text-center py-16">
          <CardHeader>
            <MessageSquare className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
            <CardTitle className="text-4xl">Login untuk Mengelola Ulasan Anda</CardTitle>
            <p className="text-gray-600 mt-4">Lihat, tambah, edit, atau hapus ulasan Anda</p>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={() => (window.location.href = '/auth/signin')}>
              <LogIn className="mr-2" /> Masuk Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : userRole !== 'guest' ? (
        <Alert className="border-red-300 bg-red-50">
          <AlertDescription className="text-center text-lg font-medium">
            Hanya akun <span className="text-yellow-600 font-bold">tamu</span> yang dapat mengelola ulasan.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Form Tambah Ulasan */}
          <Card className="shadow-xl border-yellow-200">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Star className="text-yellow-500 fill-yellow-500" />
                Tinggalkan Ulasan Baru
              </CardTitle>
              <p className="text-gray-600 mt-2">Halo, {userName}!</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center p-6 bg-yellow-50 rounded-xl">
                  <Label className="block text-lg font-semibold text-yellow-800 mb-4">
                    Rating Anda <span className="text-red-500">*</span>
                  </Label>
                  <RatingStars value={rating} onChange={setRating} />
                </div>

                <div>
                  <Label>Komentar <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="Ceritakan pengalaman menginap Anda..."
                    className="mt-2"
                    disabled={submitting}
                  />
                  <p className="text-sm text-right mt-1 text-gray-500">
                    {comment.length} / {MIN_COMMENT}+ karakter
                  </p>
                </div>

                <div>
                  <Label>Nama Tampilan (opsional)</Label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nama Anda"
                    className="mt-2"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                  disabled={submitting || rating === 0 || comment.trim().length < MIN_COMMENT}
                >
                  {submitting ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                  Kirim Ulasan
                </Button>

                {message && (
                  <Alert className={message.type === 'success' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Daftar Ulasan Saya */}
          <div className="mt-12">
            <h2 className="text-4xl font-bold text-center mb-10 flex items-center justify-center gap-4">
              <Star className="text-yellow-500 fill-yellow-500" />
              Ulasan Saya
              <Star className="text-yellow-500 fill-yellow-500" />
            </h2>

            {loadingReviews ? (
              <div className="space-y-6">
                {[1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
              </div>
            ) : myReviews.length === 0 ? (
              <Card className="text-center py-16 bg-gray-50">
                <MessageSquare className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-2xl text-gray-600">Anda belum pernah memberikan ulasan</p>
                <p className="text-gray-500 mt-2">Kirim ulasan pertama Anda di atas!</p>
              </Card>
            ) : (
              <div className="space-y-8">
                {myReviews.map((review) => {
                  const displayName = review.guest_name || review.admin?.full_name || 'Tamu';
                  const initial = displayName[0].toUpperCase();

                  return (
                    <Card key={review.id} className="shadow-lg hover:shadow-xl transition-all border-yellow-100">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {initial}
                            </div>
                            <div>
                              <p className="font-semibold text-xl">{displayName}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(review.created_at)}
                                {review.updated_at && review.updated_at !== review.created_at && ' (diedit)'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {editingId === review.id ? (
                              <>
                                <Button size="sm" onClick={() => saveEdit(review.id)} className="bg-green-600 hover:bg-green-700">
                                  <Check className="w-5 h-5" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                  Batal
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => startEdit(review)}>
                                  <Edit2 className="w-5 h-5 text-yellow-600" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(review.id)}>
                                  <Trash2 className="w-5 h-5 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          {editingId === review.id ? (
                            <RatingStars value={editRating} onChange={setEditRating} />
                          ) : (
                            <RatingStars value={review.rating} readonly />
                          )}
                          <span className="ml-3 text-lg font-semibold text-yellow-600">
                            {editingId === review.id ? editRating : review.rating}.0
                          </span>
                        </div>

                        {editingId === review.id ? (
                          <Textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={4}
                            className="mt-3"
                            placeholder="Edit ulasan Anda..."
                          />
                        ) : (
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-32 pb-24">
        <section className="text-center py-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-800 to-yellow-600 bg-clip-text text-transparent">
              Kelola Ulasan Anda
            </span>
          </h1>
          <p className="text-xl text-gray-600">Tambah, edit, atau hapus ulasan Anda kapan saja</p>
        </section>

        <div className="max-w-4xl mx-auto px-4">
          <ReviewSection />
        </div>
      </main>
      <Footer />
    </>
  );
}