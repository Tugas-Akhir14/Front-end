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
  Star, Send, LogIn, Loader2, Edit2, Trash2, Check, MessageSquare,
  MapPin, Phone, Clock, Facebook, Instagram, Twitter, Youtube, Linkedin
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
  // === AUTH STATES ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Tamu');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // === FORM STATES ===
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // === MY REVIEWS ===
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const MIN_COMMENT = 10;

  // === AUTH CHECK ===
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

  // === LOAD MY REVIEWS ===
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

  // === CRUD OPERATIONS (tetap sama) ===
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

  // === RATING STARS COMPONENT ===
  const RatingStars = ({ value, onChange, readonly = false }: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
  }) => (
    <div className="flex gap-2 justify-center md:justify-start">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(i)}
          className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'hover:scale-125 cursor-pointer active:scale-110'}`}
        >
          <Star
            className={`w-10 h-10 drop-shadow-md ${i <= value
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-600'
              }`}
          />
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

  if (loadingAuth) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <>
      {!isLoggedIn ? (
        <Card className="shadow-2xl border-amber-600/40 bg-gradient-to-br from-black/90 to-black/60 backdrop-blur-xl text-center py-20 rounded-3xl">
          <CardHeader>
            <MessageSquare className="w-24 h-24 mx-auto text-amber-500 mb-6 animate-pulse" />
            <CardTitle className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Login untuk Mengelola Ulasan Anda
            </CardTitle>
            <p className="text-gray-300 text-lg mt-4 max-w-xl mx-auto">
              Lihat, tambah, edit, atau hapus ulasan Anda kapan saja
            </p>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg px-10 py-7 shadow-xl"
              onClick={() => (window.location.href = '/auth/signin')}
            >
              <LogIn className="mr-3 h-6 w-6" /> Masuk Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : userRole !== 'guest' ? (
        <Alert className="border-2 border-amber-600/60 bg-black/80 backdrop-blur-lg rounded-2xl shadow-2xl">
          <AlertDescription className="text-center text-2xl font-medium text-amber-400 py-8">
            Hanya akun <span className="font-bold text-amber-300">tamu</span> yang dapat mengelola ulasan.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Form Ulasan Baru */}
          <Card className="shadow-2xl border-amber-600/40 bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-b border-amber-700/50">
              <CardTitle className="text-4xl font-bold flex items-center gap-4 text-amber-400">
                <Star className="w-12 h-12 text-amber-400 fill-amber-400 drop-shadow-lg" />
                Tinggalkan Ulasan Baru
              </CardTitle>
              <p className="text-xl text-gray-300 mt-3">Halo, <span className="font-semibold text-amber-300">{userName}</span>!</p>
            </CardHeader>
            <CardContent className="pt-10 pb-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="text-center p-10 bg-gradient-to-br from-amber-950/40 to-amber-900/30 rounded-2xl border border-amber-700/60 shadow-inner">
                  <Label className="block text-2xl font-bold text-amber-400 mb-6">
                    Berikan Rating Anda <span className="text-red-500">*</span>
                  </Label>
                  <RatingStars value={rating} onChange={setRating} />
                </div>

                <div className="space-y-3">
                  <Label className="text-xl text-amber-300">Komentar Anda <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    placeholder="Ceritakan pengalaman menginap Anda secara detail..."
                    className="bg-black/50 border-amber-800/70 text-gray-100 placeholder-gray-500 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 rounded-xl text-lg"
                    disabled={submitting}
                  />
                  <p className="text-sm text-right text-gray-400">
                    {comment.length} / minimal {MIN_COMMENT} karakter
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-xl text-amber-300">Nama Tampilan (opsional)</Label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nama yang akan ditampilkan"
                    className="bg-black/50 border-amber-800/70 text-gray-100 placeholder-gray-500 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 rounded-xl text-lg"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xl py-8 rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                  disabled={submitting || rating === 0 || comment.trim().length < MIN_COMMENT}
                >
                  {submitting ? (
                    <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                  ) : (
                    <Send className="mr-3 h-7 w-7" />
                  )}
                  Kirim Ulasan
                </Button>

                {message && (
                  <Alert className={`rounded-xl border-2 ${message.type === 'success'
                    ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300'
                    : 'bg-red-950/70 border-red-600 text-red-300'
                    }`}>
                    <AlertDescription className="text-lg font-medium">
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Daftar Ulasan Saya */}
          <div className="mt-20">
            <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Ulasan Saya
            </h2>

            {loadingReviews ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-3xl bg-gray-900/70" />
                ))}
              </div>
            ) : myReviews.length === 0 ? (
              <Card className="text-center py-24 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl border-amber-700/40 rounded-3xl shadow-2xl">
                <MessageSquare className="w-28 h-28 mx-auto text-gray-600 mb-6 opacity-60" />
                <p className="text-3xl font-bold text-gray-300">Belum ada ulasan</p>
                <p className="text-xl text-gray-500 mt-4">Kirim ulasan pertama Anda di atas!</p>
              </Card>
            ) : (
              <div className="space-y-10">
                {myReviews.map((review) => {
                  const displayName = review.guest_name || review.admin?.full_name || 'Tamu';
                  const initial = displayName[0].toUpperCase();

                  return (
                    <Card
                      key={review.id}
                      className="shadow-2xl bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl border-amber-700/50 hover:border-amber-500 transition-all duration-500 rounded-3xl overflow-hidden group"
                    >
                      <CardContent className="pt-10 pb-12 px-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-3xl shadow-2xl ring-4 ring-amber-600/30">
                              {initial}
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-amber-400">{displayName}</p>
                              <p className="text-gray-400 mt-1">
                                {formatDate(review.created_at)}
                                {review.updated_at && review.updated_at !== review.created_at && (
                                  <span className="text-amber-400 ml-2 text-sm">(diedit)</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            {editingId === review.id ? (
                              <>
                                <Button
                                  size="lg"
                                  onClick={() => saveEdit(review.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                                >
                                  <Check className="w-6 h-6" />
                                </Button>
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="border-amber-600 text-amber-400 hover:bg-amber-950/50"
                                  onClick={() => setEditingId(null)}
                                >
                                  Batal
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="lg"
                                  variant="ghost"
                                  className="text-amber-400 hover:bg-amber-950/50"
                                  onClick={() => startEdit(review)}
                                >
                                  <Edit2 className="w-6 h-6" />
                                </Button>
                                <Button
                                  size="lg"
                                  variant="ghost"
                                  className="text-red-400 hover:bg-red-950/50"
                                  onClick={() => handleDelete(review.id)}
                                >
                                  <Trash2 className="w-6 h-6" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                          {editingId === review.id ? (
                            <RatingStars value={editRating} onChange={setEditRating} />
                          ) : (
                            <RatingStars value={review.rating} readonly />
                          )}
                          <span className="text-3xl font-bold text-amber-400">
                            {editingId === review.id ? editRating : review.rating}.0
                          </span>
                        </div>

                        {editingId === review.id ? (
                          <Textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={5}
                            className="bg-black/50 border-amber-700/70 text-gray-100 rounded-xl text-lg"
                          />
                        ) : (
                          <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap bg-black/30 p-6 rounded-2xl border border-amber-800/40">
                            {review.comment}
                          </p>
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
      <main className="min-h-screen bg-black pt-32 pb-32">
        {/* Hero */}
        <section className="text-center py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-amber-600/10 to-amber-900/20"></div>
          <div className="relative z-10 max-w-5xl mx-auto px-6">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent">
                Hubungi Kami
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Kami siap memberikan pengalaman menginap terbaik dengan layanan kelas dunia
            </p>
          </div>
        </section>

        {/* Info Cards */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Alamat", icon: MapPin, content: "Jl. Sisingamangaraja No. 1\nMedan, Sumatera Utara\nIndonesia 20217" },
              { title: "Kontak", icon: Phone, content: "☎ +62 812-3456-7890\n✉ info@grandhotel.com" },
              { title: "Jam Operasional", icon: Clock, content: "Check-in: 14:00\nCheck-out: 12:00\nResepsionis: 24 Jam" },
            ].map((item, i) => (
              <Card
                key={i}
                className="bg-gradient-to-br from-black/90 to-gray-950 border-2 border-amber-700/50 hover:border-amber-500 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-600/30 group rounded-3xl overflow-hidden"
              >
                <CardContent className="pt-12 pb-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <item.icon className="w-12 h-12 text-black" />
                  </div>
                  <h3 className="text-3xl font-bold text-amber-400 mb-6">{item.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="max-w-5xl mx-auto px-6 mb-24">
          <Card className="bg-gradient-to-br from-black/90 to-gray-950 border-2 border-amber-700/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="py-20 text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-amber-400 mb-12">Ikuti Kami di Media Sosial</h3>
              <div className="flex justify-center gap-12 flex-wrap">
                {[
                  { icon: Facebook, label: "Facebook", url: "https://www.facebook.com/mutiarabaligehotel/" },
                  { icon: Instagram, label: "Instagram", url: "#" },
                  { icon: Twitter, label: "Twitter", url: "#" },
                  { icon: Youtube, label: "YouTube", url: "#" },

                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    className="group"
                    aria-label={social.label}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center hover:scale-125 transition-all duration-300 shadow-2xl group-hover:shadow-amber-500/60">
                      <social.icon className="w-10 h-10 text-black" />
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Google Maps */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <Card className="bg-gradient-to-br from-black/90 to-gray-950 border-2 border-amber-700/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center py-12 bg-gradient-to-b from-amber-900/20 to-transparent">
              <CardTitle className="text-5xl font-bold text-amber-400">Lokasi Kami</CardTitle>
              <p className="text-xl text-gray-300 mt-4">Berada Dekat Dengan Pusat Kota Balige</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-b-3xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.9764556938315!2d98.66581287475977!3d3.5951948964116457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30313106c3a68b55%3A0xc4867c6b88a3db0!2sJl.%20Sisingamangaraja%2C%20Medan%2C%20Sumatera%20Utara!5e0!3m2!1sen!2sid!4v1234567890"
                  width="100%"
                  height="500"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Section */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent">
                Review
              </span>
            </h2>
            <p className="text-2xl text-gray-400">Berikan Ulasan Anda</p>
          </div>
          <ReviewSection />
        </div>
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}