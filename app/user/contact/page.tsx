// app/user/contact/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail, Phone, MapPin, Facebook, Instagram, Twitter,
  Star, Send, MessageSquare, LogIn, Loader2
} from 'lucide-react';

// === KOMPONEN TERPISAH: Review Section ===
function ReviewSection() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null); // AMBIL ROLE

  const MIN_COMMENT = 10;

useEffect(() => {
  const checkAuth = () => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');

    console.log('[DEBUG] Token:', token ? 'ADA' : 'TIDAK ADA');
    console.log('[DEBUG] User:', userData);

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('[DEBUG] Parsed User:', user);
        setIsLoggedIn(true);
        setUserName(user.full_name || 'Tamu');
        setUserRole(user.role || null);
      } catch (e) {
        console.error('[ERROR] Parse user gagal:', e);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
    setLoadingAuth(false);
  };

  checkAuth();
  window.addEventListener('storage', checkAuth);
  return () => window.removeEventListener('storage', checkAuth);
}, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = sessionStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Sesi login hilang. Silakan login ulang.' });
      return;
    }

    // CEK ROLE: HANYA GUEST BOLEH
    if (userRole !== 'guest') {
      setMessage({ type: 'error', text: 'Hanya tamu (guest) yang dapat mengirim ulasan.' });
      return;
    }

    if (rating === 0) {
      setMessage({ type: 'error', text: 'Pilih rating bintang' });
      return;
    }
    if (comment.trim().length < MIN_COMMENT) {
      setMessage({ type: 'error', text: `Komentar minimal ${MIN_COMMENT} karakter` });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/public/reviews', { // SESUAI BACKEND
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          guest_name: guestName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        setMessage({ type: 'success', text: 'Ulasan terkirim! Menunggu moderasi.' });
        setRating(0);
        setComment('');
        setGuestName('');
      } else {
        let errorMsg = data?.error || 'Gagal kirim ulasan';
        if (res.status === 401) errorMsg = 'Token tidak valid. Silakan login ulang.';
        else if (res.status === 403) errorMsg = 'Hanya tamu yang dapat mengirim ulasan.';
        else if (res.status === 429) errorMsg = 'Anda baru saja mengirim ulasan. Tunggu 3 menit.';
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Koneksi error. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  };


  // === Rating Stars Component ===
  const RatingStars = ({ value, onChange, readonly = false }: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
  }) => (
    <div className="flex gap-2" role="radiogroup" aria-label={`Rating ${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${star} bintang`}
            disabled={readonly || loading}
            onClick={() => !readonly && onChange?.(star)}
            className={`relative transition-all duration-300 ${readonly ? '' : 'hover:scale-125 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md'} ${active ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}`}
          >
            <Star
              className={`w-10 h-10 transition-all duration-300 ${active ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'} ${readonly ? '' : 'hover:text-yellow-400'}`}
            />
          </button>
        );
      })}
    </div>
  );

  // === Loading Skeleton ===
  if (loadingAuth) {
    return (
      <Card className="bg-gradient-to-br from-zinc-900 to-black border-yellow-500/20 p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </Card>
    );
  }

  // // === Belum Login ===
  if (!isLoggedIn) {
    return (
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-yellow-500/20 shadow-2xl shadow-yellow-500/10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>

        <CardHeader className="pb-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-yellow-500/10 rounded-full border border-yellow-500/30">
              <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Login untuk Memberi Ulasan
            </CardTitle>
            <p className="text-gray-400 max-w-md">
              Hanya tamu terdaftar yang bisa meninggalkan ulasan bintang & komentar.
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex justify-center pb-12">
          <Button
            onClick={() => (window.location.href = '/auth/signin')}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-xl px-12 py-7 shadow-2xl shadow-yellow-500/40 transition-all duration-300 flex items-center gap-3 group"
          >
            <LogIn className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Masuk Sekarang
          </Button>
        </CardContent>
      </Card>
    );
  }




  // === BUKAN GUEST: TIDAK BOLEH KIRIM ===
  if (isLoggedIn && userRole !== 'guest') {
    return (
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-yellow-500/20 shadow-2xl shadow-yellow-500/10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>

        <CardHeader className="pb-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30">
              <Star className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-4xl font-bold text-red-400">
              Akses Ditolak
            </CardTitle>
            <p className="text-gray-400 max-w-md">
              Hanya akun <span className="text-yellow-400 font-semibold">tamu (guest)</span> yang dapat mengirim ulasan.
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex justify-center pb-12">
          <Button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = '/auth/signin';
            }}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xl px-12 py-7 shadow-2xl shadow-red-500/40 transition-all duration-300 flex items-center gap-3 group"
          >
            <LogIn className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Logout & Ganti Akun
          </Button>
        </CardContent>
      </Card>
    );
  }

  // === Sudah Login & Guest: Form Ulasan ===
  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-yellow-500/20 shadow-2xl shadow-yellow-500/10 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>

      <CardHeader className="space-y-2 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Tinggalkan Ulasan Anda
            </CardTitle>
          </div>
          <div className="text-sm text-yellow-400">
            Halo, {userName}!
          </div>
        </div>
        <p className="text-gray-400 text-sm">Bagikan pengalaman menginap Anda bersama kami</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-7" noValidate>
          {/* Rating */}
          <div className="p-6 bg-black/40 rounded-xl border border-yellow-500/20">
            <Label className="text-yellow-400 text-lg font-semibold flex items-center gap-2 mb-4">
              Berikan Rating <span className="text-red-500">*</span>
            </Label>
            <div className="flex justify-center">
              <RatingStars value={rating} onChange={setRating} />
            </div>
            {rating > 0 && (
              <p className="text-center text-yellow-500 mt-4 font-medium animate-fadeIn">
                {rating === 5 ? 'Luar Biasa!' : rating === 4 ? 'Sangat Baik!' : rating === 3 ? 'Baik' : rating === 2 ? 'Cukup' : 'Kurang'}
              </p>
            )}
          </div>

          {/* Komentar */}
          <div>
            <Label htmlFor="comment" className="text-yellow-400 text-lg font-semibold flex items-center gap-2 mb-3">
              Komentar <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              placeholder="Ceritakan pengalaman Anda di sini..."
              className="mt-1 bg-zinc-800/50 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 resize-none"
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-2 text-xs">
              <p className="text-gray-500">Minimal {MIN_COMMENT} karakter</p>
              <p className={comment.trim().length >= MIN_COMMENT ? 'text-green-400' : 'text-gray-500'}>
                {comment.trim().length}/{MIN_COMMENT}
              </p>
            </div>
          </div>

          {/* Nama (opsional) */}
          <div>
            <Label htmlFor="name" className="text-yellow-400 text-lg font-semibold flex items-center gap-2 mb-3">
              Nama <span className="text-gray-500 text-sm">(opsional)</span>
            </Label>
            <Input
              id="name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nama Anda"
              className="bg-zinc-800/50 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 h-12"
              disabled={loading}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || rating === 0 || comment.trim().length < MIN_COMMENT}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-6 text-lg shadow-lg shadow-yellow-500/30 relative overflow-hidden group disabled:opacity-70"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim Ulasan
                </>
              )}
            </span>
          </Button>

          {/* Message */}
          {message && (
            <div className={`text-center p-4 rounded-xl mt-2 animate-fadeIn text-sm font-medium ${
              message.type === 'success'
                ? 'bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 border border-green-500/50'
                : 'bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-300 border border-red-500/50'
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// === MAIN PAGE (TIDAK DIUBAH) ===
export default function ContactPage() {
  const encodedAddress = useMemo(
    () => encodeURIComponent('Sibola Hotangsas, Balige, Toba, North Sumatra'),
    []
  );

  const googleMapsEmbed = useMemo(
    () => `https://www.google.com/maps?q=${encodedAddress}&output=embed`,
    [encodedAddress]
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white pt-32 pb-16">
        {/* Hero Section */} {/* ... sama persis ... */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block mb-6">
              <div className="flex items-center justify-center gap-3 px-6 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full backdrop-blur-sm">
                <MessageSquare className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-500 font-semibold">Kami Mendengarkan Anda</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                Hubungi Kami
              </span>
              <br />
              <span className="text-yellow-500">atau Tinggalkan Ulasan</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Kami senang mendengar dari Anda. Beri tahu kami pengalaman Anda di{' '}
              <span className="text-yellow-500 font-semibold">Mutiara Hotel</span>
            </p>

            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-yellow-500"></div>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-yellow-500"></div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <ReviewSection />
            {/* Contact Info + Map (sama persis) */}
            <div className="space-y-8">
              {/* ... semua Card Contact & Map tetap sama ... */}
              <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-yellow-500/20 shadow-2xl shadow-yellow-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>
                <CardHeader className="space-y-2 pb-6">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Informasi Kontak
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Hubungi kami melalui saluran berikut</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Alamat, Telepon, Email, Social (sama) */}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-yellow-500/20 shadow-2xl shadow-yellow-500/10 overflow-hidden relative group">
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60 z-10"></div>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Lokasi Kami
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Temukan kami di peta</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <div className="absolute inset-0 border-4 border-yellow-500/20 pointer-events-none z-10"></div>
                    <iframe
                      src={googleMapsEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
                      title="Lokasi Mutiara Hotel"
                    />
                  </div>
                  <div className="p-6 bg-gradient-to-r from-black/80 to-zinc-900/80 backdrop-blur-sm border-t border-yellow-500/20">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors group/link"
                    >
                      <MapPin className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                      <span className="underline underline-offset-4">Buka di Google Maps</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </>
  );
}