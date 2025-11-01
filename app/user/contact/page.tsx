// app/user/contact/page.tsx
'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Star } from 'lucide-react';

export default function ContactPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const MIN_COMMENT = 10;

  const encodedAddress = useMemo(
    () => encodeURIComponent('Sibola Hotangsas, Balige, Toba, North Sumatra'),
    []
  );

  const googleMapsEmbed = useMemo(
    () => `https://www.google.com/maps?q=${encodedAddress}&output=embed`,
    [encodedAddress]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return setMessage({ type: 'error', text: 'Pilih rating bintang' });
    if (comment.trim().length < MIN_COMMENT) {
      return setMessage({ type: 'error', text: `Komentar minimal ${MIN_COMMENT} karakter` });
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          guest_name: guestName.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data?.success ?? true)) {
        setMessage({ type: 'success', text: 'Terima kasih! Ulasan Anda akan ditampilkan setelah moderasi.' });
        setRating(0);
        setComment('');
        setGuestName('');
      } else {
        setMessage({ type: 'error', text: data?.error || 'Gagal mengirim ulasan' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Koneksi gagal. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  const RatingStars = ({
    value,
    onChange,
    readonly = false,
  }: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
  }) => (
    <div className="flex gap-1" aria-label={`Rating ${value} dari 5`} role="radiogroup">
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
            className={`transition-all ${readonly ? '' : 'hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md'}`}
          >
            <Star
              className={`w-8 h-8 ${active ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'} ${readonly ? '' : 'hover:text-yellow-400'}`}
            />
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-32 pb-16">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-black to-yellow-900/20 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-yellow-500">Hubungi Kami</span> atau Tinggalkan Ulasan
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Kami senang mendengar dari Anda. Beri tahu kami pengalaman Anda di Mutiara Hotel.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form Ulasan */}
            <Card className="bg-gray-900 border-yellow-600/30 shadow-2xl shadow-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                  <Star className="w-6 h-6 fill-yellow-500" />
                  Tinggalkan Ulasan Anda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div>
                    <Label className="text-yellow-400">Rating <span className="text-red-500">*</span></Label>
                    <div className="mt-2">
                      <RatingStars value={rating} onChange={setRating} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment" className="text-yellow-400">
                      Komentar <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      minLength={MIN_COMMENT}
                      placeholder="Ceritakan pengalaman Anda di sini..."
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                      disabled={loading}
                      aria-describedby="comment-help"
                    />
                    <p id="comment-help" className="text-xs text-gray-400 mt-1">
                      {comment.trim().length}/{MIN_COMMENT} karakter minimal
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-yellow-400">Nama (opsional)</Label>
                    <Input
                      id="name"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Nama Anda"
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 text-lg transition-all duration-300 shadow-lg shadow-yellow-600/30 disabled:opacity-70"
                    aria-busy={loading}
                  >
                    {loading ? 'Mengirim...' : 'Kirim Ulasan'}
                  </Button>

                  <div aria-live="polite" className="min-h-0">
                    {message && (
                      <p
                        className={`text-sm font-medium text-center p-3 rounded-md mt-2 ${
                          message.type === 'success'
                            ? 'bg-green-900/50 text-green-300 border border-green-700'
                            : 'bg-red-900/50 text-red-300 border border-red-700'
                        }`}
                      >
                        {message.text}
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Kontak & Map */}
            <div className="space-y-8">
              {/* Info Kontak */}
              <Card className="bg-gray-900 border-yellow-600/30 shadow-2xl shadow-yellow-900/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-yellow-500">Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/50">
                      <MapPin className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Alamat</p>
                      <p className="text-gray-300">
                        Sibola Hotangsas, Balige, Toba, North Sumatra
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/50">
                      <Phone className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Telepon</p>
                      <p className="text-gray-300">+62 21 1234 5678</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/50">
                      <Mail className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <p className="text-gray-300">info@mutiarahotel.com</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-yellow-600/30">
                    <p className="font-semibold text-yellow-400 mb-3">Ikuti Kami</p>
                    <div className="flex gap-4">
                      <a href="#" aria-label="Facebook" className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/50 hover:bg-yellow-600/40 transition">
                        <Facebook className="w-5 h-5 text-yellow-400" />
                      </a>
                      <a href="#" aria-label="Instagram" className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/50 hover:bg-yellow-600/40 transition">
                        <Instagram className="w-5 h-5 text-yellow-400" />
                      </a>
                      <a href="#" aria-label="Twitter" className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/50 hover:bg-yellow-600/40 transition">
                        <Twitter className="w-5 h-5 text-yellow-400" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="bg-gray-900 border-yellow-600/30 shadow-2xl shadow-yellow-900/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-yellow-500">Lokasi Kami</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video relative rounded-b-xl overflow-hidden">
                    <iframe
                      src={googleMapsEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                      title="Lokasi Mutiara Hotel di Sibola Hotangsas, Balige"
                    />
                  </div>
                  <div className="p-4 bg-black/60">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-yellow-300 font-medium underline underline-offset-2"
                    >
                      Buka petunjuk arah di Google Maps
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
