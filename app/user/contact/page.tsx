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
import ChatBot from '@/components/Chatbot/ChatBot';

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
  // Auth states (tidak diubah)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Tamu');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Form states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // My reviews
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const MIN_COMMENT = 10;

  // === AUTH CHECK (tidak diubah) ===
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

  // === LOAD MY REVIEWS (tidak diubah) ===
  const loadMyReviews = async () => {
    if (!isLoggedIn || !userId) return;
    setLoadingReviews(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/public/reviews/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyReviews(Array.isArray(data) ? data : []);
      } else {
        setMyReviews([]);
      }
    } catch (e) {
      console.error(e);
      setMyReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userRole === 'guest') loadMyReviews();
  }, [isLoggedIn, userRole]);

  // === SUBMIT, EDIT, DELETE (logika tetap sama) ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (!token || userRole !== 'guest' || rating === 0 || comment.trim().length < MIN_COMMENT) return;

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
        setRating(0); setComment(''); setGuestName('');
        loadMyReviews();
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
        body: JSON.stringify({ rating: editRating, comment: editComment.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        loadMyReviews();
        setMessage({ type: 'success', text: 'Ulasan berhasil diperbarui!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Koneksi error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus ulasan ini?')) return;
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`/public/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      loadMyReviews();
      setMessage({ type: 'success', text: 'Ulasan berhasil dihapus' });
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghapus ulasan' });
    }
  };  
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
          <Star className={`w-8 h-8 ${i <= value ? 'text-amber-500 fill-amber-500' : 'text-gray-600'}`} />
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
      {!isLoggedIn ? (
        <Card className="shadow-2xl border-amber-600/40 bg-black/50 backdrop-blur text-center py-16">
          <CardHeader>
            <MessageSquare className="w-20 h-20 mx-auto text-amber-500 mb-4" />
            <CardTitle className="text-4xl text-amber-400">Login untuk Mengelola Ulasan Anda</CardTitle>
            <p className="text-gray-400 mt-4">Lihat, tambah, edit, atau hapus ulasan Anda</p>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-black font-bold" onClick={() => (window.location.href = '/auth/signin')}>
              <LogIn className="mr-2" /> Masuk Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : userRole !== 'guest' ? (
        <Alert className="border-amber-600/50 bg-black/60">
          <AlertDescription className="text-center text-lg font-medium text-amber-400">
            Hanya akun <span className="font-bold">tamu</span> yang dapat mengelola ulasan.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card className="shadow-2xl border-amber-600/40 bg-black/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3 text-amber-400">
                <Star className="text-amber-500 fill-amber-500" />
                Tinggalkan Ulasan Baru
              </CardTitle>
              <p className="text-gray-300 mt-2">Halo, {userName}!</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center p-6 bg-amber-950/30 rounded-xl border border-amber-700/50">
                  <Label className="block text-lg font-semibold text-amber-400 mb-4">
                    Rating Anda <span className="text-red-500">*</span>
                  </Label>
                  <RatingStars value={rating} onChange={setRating} />
                </div>

                <div>
                  <Label className="text-amber-300">Komentar <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="Ceritakan pengalaman menginap Anda..."
                    className="mt-2 bg-black/40 border-amber-800/50 text-gray-100 placeholder-gray-500 focus:border-amber-600"
                    disabled={submitting}
                  />
                  <p className="text-sm text-right mt-1 text-gray-400">
                    {comment.length} / {MIN_COMMENT}+ karakter
                  </p>
                </div>

                <div>
                  <Label className="text-amber-300">Nama Tampilan (opsional)</Label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nama Anda"
                    className="mt-2 bg-black/40 border-amber-800/50 text-gray-100 placeholder-gray-500 focus:border-amber-600"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold"
                  disabled={submitting || rating === 0 || comment.trim().length < MIN_COMMENT}
                >
                  {submitting ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                  Kirim Ulasan
                </Button>

                {message && (
                  <Alert className={message.type === 'success' ? 'bg-amber-950/60 border-amber-600' : 'bg-red-950/60 border-red-700'}>
                    <AlertDescription className={message.type === 'success' ? 'text-amber-300' : 'text-red-300'}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
          <div className="mt-12">
            <h2 className="text-4xl font-bold text-center mb-10 flex items-center justify-center gap-4 text-amber-400">
              <Star className="text-amber-500 fill-amber-500" />
              Ulasan Saya
              <Star className="text-amber-500 fill-amber-500" />
            </h2>

            {loadingReviews ? (
              <div className="space-y-6">
                {[1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl bg-gray-900/50" />)}
              </div>
            ) : myReviews.length === 0 ? (
              <Card className="text-center py-16 bg-black/40 border-amber-800/40">
                <MessageSquare className="w-20 h-20 mx-auto text-gray-600 mb-4" />
                <p className="text-2xl text-gray-300">Anda belum pernah memberikan ulasan</p>
                <p className="text-gray-500 mt-2">Kirim ulasan pertama Anda di atas!</p>
              </Card>
            ) : (
              <div className="space-y-8">
                {myReviews.map((review) => {
                  const displayName = review.guest_name || review.admin?.full_name || 'Tamu';
                  const initial = displayName[0].toUpperCase();

                  return (
                    <Card key={review.id} className="shadow-2xl bg-black/60 border-amber-700/40 hover:border-amber-600 transition-all">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg">
                              {initial}
                            </div>
                            <div>
                              <p className="font-semibold text-xl text-amber-400">{displayName}</p>
                              <p className="text-sm text-gray-400">
                                {formatDate(review.created_at)}
                                {review.updated_at && review.updated_at !== review.created_at && ' (diedit)'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {editingId === review.id ? (
                              <>
                                <Button size="sm" onClick={() => saveEdit(review.id)} className="bg-green-700 hover:bg-green-600">
                                  <Check className="w-5 h-5" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-amber-700 text-amber-400" onClick={() => setEditingId(null)}>
                                  Batal
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => startEdit(review)}>
                                  <Edit2 className="w-5 h-5 text-amber-500" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(review.id)}>
                                  <Trash2 className="w-5 h-5 text-red-500" />
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
                          <span className="ml-3 text-lg font-semibold text-amber-500">
                            {editingId === review.id ? editRating : review.rating}.0
                          </span>
                        </div>

                        {editingId === review.id ? (
                          <Textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={4}
                            className="mt-3 bg-black/40 border-amber-800/50 text-gray-100"
                          />
                        ) : (
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
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
      <main className="min-h-screen bg-black pt-32 pb-24">
        {/* Hero */}
        <section className="text-center py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-transparent to-amber-600/10"></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                Hubungi Kami
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto px-4">
              Kami siap melayani Anda dengan pengalaman menginap terbaik
            </p>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Alamat", icon: "location", content: "Jl. Sisingamangaraja No. 1\nMedan, Sumatera Utara\nIndonesia 20217" },
              { title: "Kontak", icon: "contact", content: "☎ +62 812-3456-7890\n✉ info@grandhotel.com" },
              { title: "Jam Operasional", icon: "clock", content: "Check-in: 14:00\nCheck-out: 12:00\nResepsionis: 24/7" },
            ].map((item, i) => (
              <Card key={i} className="bg-gradient-to-br from-black to-gray-950 border-2 border-amber-700/40 hover:border-amber-600 transition-all hover:shadow-2xl hover:shadow-amber-600/20 group">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <div className="w-8 h-8 bg-black rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-bold text-amber-400 mb-3">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <Card className="bg-gradient-to-br from-black to-gray-950 border-2 border-amber-700/40 shadow-2xl shadow-amber-600/10">
            <CardContent className="py-12 text-center">
              <h3 className="text-3xl font-bold text-amber-400 mb-8">Ikuti Kami</h3>
              <div className="flex justify-center gap-8 flex-wrap">
                {/* Sosmed icons – warna emas */}
                {['fb', 'ig', 'tw', 'tt', 'in'].map((_, i) => (
                  <div key={i} className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-amber-500/50">
                    <div className="w-7 h-7 bg-black rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <Card className="bg-gradient-to-br from-black to-gray-950 border-2 border-amber-700/40 shadow-2xl shadow-amber-600/10 overflow-hidden">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-amber-400">Lokasi Kami</CardTitle>
              <p className="text-gray-400 mt-2">Temukan kami di pusat kota Medan</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-[450px] relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.9764556938315!2d98.66581287475977!3d3.5951948964116457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30313106c3a68b55%3A0xc4867c6b88a3db0!2sJl.%20Sisingamangaraja%2C%20Medan%2C%20Sumatera%20Utara!5e0!3m2!1sen!2sid!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Section */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                Kelola Ulasan Anda
              </span>
            </h2>
            <p className="text-xl text-gray-400">Tambah, edit, atau hapus ulasan Anda kapan saja</p>
          </div>
          <ReviewSection />
        </div>
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}