'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Star, Send, LogIn, Loader2, Edit2, Trash2, Check, MessageSquare,
  MapPin, Phone, Clock, Facebook, Instagram, Twitter, Youtube
} from 'lucide-react';
import ChatBot from '@/components/Chatbot/ChatBot';

// Warna emas mewah sesuai News Page
const GOLD = '#d4af37';

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

  // === CRUD OPERATIONS ===
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
    <div className="flex gap-1 justify-start">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(i)}
          className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
        >
          <Star
            className={`w-6 h-6 ${i <= value
              ? 'fill-current'
              : 'text-gray-700'
              }`}
            style={{ color: i <= value ? GOLD : undefined }}
            strokeWidth={1.5}
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
    });

  if (loadingAuth) return <Skeleton className="h-64 w-full rounded-2xl bg-gray-900" />;

  return (
    <div className="space-y-12">
      {!isLoggedIn ? (
        <div className="bg-gray-900 border border-gray-800 p-12 rounded-2xl text-center shadow-lg hover:border-yellow-800/50 transition-colors">
          <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-80" style={{ color: GOLD }} strokeWidth={1} />
          <h3 className="text-3xl font-bold text-white mb-3">
            Bagikan Pengalaman Anda
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
            Masuk untuk menulis ulasan dan mengelola riwayat ulasan Anda.
          </p>
          <Button
            size="lg"
            className="text-black font-bold px-10 py-6 rounded-full transition-all duration-300 hover:opacity-90 shadow-lg shadow-amber-900/20"
            style={{ backgroundColor: GOLD }}
            onClick={() => (window.location.href = '/auth/signin')}
          >
            <LogIn className="mr-2 h-5 w-5" /> Masuk Sekarang
          </Button>
        </div>
      ) : userRole !== 'guest' ? (
        <Alert className="bg-gray-900 border-yellow-900/50 text-yellow-500">
          <AlertDescription className="text-center font-medium text-lg">
            Hanya akun tamu yang dapat mengelola ulasan.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Form Ulasan Baru */}
          <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-5 gap-12">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-3xl font-bold text-white">Tulis Ulasan</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Bagaimana pengalaman menginap Anda? Pendapat Anda sangat berarti bagi kami.
                  </p>
                  <div className="p-6 bg-black/40 rounded-xl border border-gray-800 mt-6">
                    <p className="text-sm text-gray-500 uppercase tracking-widest mb-3 font-semibold">Rating Anda</p>
                    <RatingStars value={rating} onChange={setRating} />
                  </div>
                </div>

                <div className="md:col-span-3 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Komentar</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={5}
                        placeholder="Ceritakan pengalaman Anda..."
                        className="bg-black border-gray-700 text-gray-200 focus:ring-1 focus:ring-yellow-600 rounded-xl text-lg p-4"
                        disabled={submitting}
                      />
                      <p className="text-sm text-right text-gray-500">
                        {comment.length} / {MIN_COMMENT} karakter
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Nama Tampilan (Opsional)</Label>
                      <Input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder={userName}
                        className="bg-black border-gray-700 text-gray-200 focus:ring-1 focus:ring-yellow-600 rounded-xl h-12"
                      />
                    </div>

                    {message && (
                      <div className={`p-4 rounded-xl text-base flex items-center gap-3 font-medium ${message.type === 'success'
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900'
                        : 'bg-red-950/50 text-red-400 border border-red-900'
                        }`}>
                        {message.type === 'success' ? <Check className="w-5 h-5" /> : <Loader2 className="w-5 h-5" />}
                        {message.text}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full text-black font-bold text-lg py-6 rounded-xl transition-all hover:opacity-90 shadow-lg"
                      style={{ backgroundColor: GOLD }}
                      disabled={submitting || rating === 0 || comment.trim().length < MIN_COMMENT}
                    >
                      {submitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-5 w-5" />
                      )}
                      Kirim Ulasan
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daftar Ulasan Saya */}
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-white mb-8 border-l-4 pl-6" style={{ borderColor: GOLD }}>
              Riwayat Ulasan
            </h3>

            {loadingReviews ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-2xl bg-gray-900" />
                ))}
              </div>
            ) : myReviews.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800">
                <p className="text-xl">Belum ada ulasan yang dikirim.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {myReviews.map((review) => {
                  const displayName = review.guest_name || review.admin?.full_name || 'Tamu';
                  const initial = displayName[0].toUpperCase();

                  return (
                    <Card
                      key={review.id}
                      className="group bg-gray-900 border-gray-800 hover:border-yellow-800/50 transition-all duration-300 rounded-2xl overflow-hidden"
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div
                              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-black shadow-lg"
                              style={{ backgroundColor: GOLD }}
                            >
                              {initial}
                            </div>
                          </div>

                          {/* Start Content */}
                          <div className="flex-grow space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xl font-bold text-white">{displayName}</h4>
                                <p className="text-gray-500 text-sm mt-1">{formatDate(review.created_at)}</p>
                              </div>
                              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-gray-800">
                                {editingId === review.id ? (
                                  <RatingStars value={editRating} onChange={setEditRating} />
                                ) : (
                                  <RatingStars value={review.rating} readonly />
                                )}
                                <span className="text-lg font-bold ml-2 text-white">
                                  {editingId === review.id ? editRating : review.rating}.0
                                </span>
                              </div>
                            </div>

                            {editingId === review.id ? (
                              <Textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                rows={3}
                                className="bg-black border-gray-700 text-gray-200 rounded-xl"
                              />
                            ) : (
                              <p className="text-gray-300 text-lg leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex md:flex-col gap-3 justify-end md:justify-start border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
                            {editingId === review.id ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(review.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                                >
                                  <Check className="w-4 h-4 mr-2" /> Simpan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 text-gray-400 hover:bg-gray-800 w-full"
                                  onClick={() => setEditingId(null)}
                                >
                                  Batal
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-400 hover:text-white hover:bg-gray-800 w-full justify-start"
                                  onClick={() => startEdit(review)}
                                >
                                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full justify-start"
                                  onClick={() => handleDelete(review.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-gray-100 pt-16 pb-32">
        {/* Hero Section - Matching News Page Style */}
        <section className="relative h-96 overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1596386461350-326ccbc75941?q=80&w=2070&auto=format&fit=crop)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(60% 80% at 50% 0%, ${GOLD} 0%, transparent 70%)`,
            }}
          />
          <div className="relative z-10 flex flex-col h-full items-center justify-center text-center px-4 pt-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Hubungi <span style={{ color: GOLD }}>Kami</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Layanan tamu 24 jam untuk kenyamanan masa menginap Anda
            </p>
            <div className="mt-8 h-1 w-32 mx-auto rounded-full" style={{ backgroundColor: GOLD }} />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 -mt-10 relative z-20">

          {/* Info Grid - Dark Cards like News Page */}
          <section className="grid md:grid-cols-3 gap-8">
            {[
              {
                label: "Alamat",
                value: "Jl. Tarutung No. 120\n22312 Balige, Indonesia",
                icon: MapPin
              },
              {
                label: "Kontak",
                value: "+62 632 322111\ninfo@hotelmutiarabalige.com",
                icon: Phone
              },
              {
                label: "Jam Operasional",
                value: "Resepsionis 24 Jam\nCheck-in 14:00 | Check-out 12:00",
                icon: Clock
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="bg-gray-900 border-gray-800 hover:border-yellow-800/50 hover:shadow-2xl hover:shadow-yellow-900/10 transition-all duration-500 rounded-2xl overflow-hidden group"
              >
                <CardContent className="p-10 text-center flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundColor: `${GOLD}20`, color: GOLD }}
                  >
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.label}</h3>
                  <p className="text-gray-400 whitespace-pre-line leading-relaxed text-lg">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Map & Social Split */}
          <section className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-10">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-6">Lokasi <span style={{ color: GOLD }}>Strategis</span></h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Hotel Mutiara Balige terletak strategis di jantung kota, menawarkan akses mudah ke Danau Toba, Museum T.B. Silalahi Center, dan pusat perbelanjaan lokal. Hanya 30 menit dari Bandara Silangit.
                </p>

                <div className="flex gap-6">
                  {[
                    { icon: Facebook, href: "https://www.facebook.com/mutiarabaligehotel/" },
                    { icon: Instagram, href: "https://www.instagram.com/mutiara.balige.hotel?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" },
                    { icon: Twitter, href: "#" },
                    { icon: Youtube, href: "#" }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      className="w-14 h-14 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-black transition-all duration-300 shadow-lg"
                      style={{ ':hover': { backgroundColor: GOLD, borderColor: GOLD } } as any}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = GOLD;
                        e.currentTarget.style.color = 'black';
                        e.currentTarget.style.borderColor = GOLD;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#9ca3af';
                        e.currentTarget.style.borderColor = '#374151';
                      }}
                    >
                      <social.icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-96 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.9764556938315!2d98.66581287475977!3d3.5951948964116457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30313106c3a68b55%3A0xc4867c6b88a3db0!2sJl.%20Sisingamangaraja%2C%20Medan%2C%20Sumatera%20Utara!5e0!3m2!1sen!2sid!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-700"
              ></iframe>
            </div>
          </section>

          {/* Review Section */}
          <section className="pt-10">
            <ReviewSection />
          </section>

        </div>
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}