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
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Star, Send, MessageSquare } from 'lucide-react';

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
    <div className="flex gap-2" aria-label={`Rating ${value} dari 5`} role="radiogroup">
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white pt-32 pb-16">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Decorative Lines */}
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

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-yellow-500"></div>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-yellow-500"></div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Form Ulasan */}
            <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-yellow-500/20 shadow-2xl shadow-yellow-500/10 relative overflow-hidden group">
              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>

              <CardHeader className="space-y-2 pb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Tinggalkan Ulasan Anda
                  </CardTitle>
                </div>
                <p className="text-gray-400 text-sm">Bagikan pengalaman menginap Anda bersama kami</p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-7" noValidate>
                  {/* Rating Section */}
                  <div className="p-6 bg-black/40 rounded-xl border border-yellow-500/20">
                    <Label className="text-yellow-400 text-lg font-semibold flex items-center gap-2 mb-4">
                      Berikan Rating <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex justify-center">
                      <RatingStars value={rating} onChange={setRating} />
                    </div>
                    {rating > 0 && (
                      <p className="text-center text-yellow-500 mt-4 font-medium animate-fadeIn">
                        {rating === 5 ? '🌟 Luar Biasa!' : rating === 4 ? '😊 Sangat Baik!' : rating === 3 ? '👍 Baik' : rating === 2 ? '😐 Cukup' : '😔 Kurang'}
                      </p>
                    )}
                  </div>

                  {/* Comment Section */}
                  <div>
                    <Label htmlFor="comment" className="text-yellow-400 text-lg font-semibold flex items-center gap-2 mb-3">
                      Komentar <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={6}
                      minLength={MIN_COMMENT}
                      placeholder="Ceritakan pengalaman Anda di sini... Apa yang Anda sukai? Bagaimana pelayanan kami?"
                      className="mt-1 bg-zinc-800/50 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 transition-all resize-none"
                      disabled={loading}
                      aria-describedby="comment-help"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p id="comment-help" className="text-xs text-gray-500">
                        Minimal {MIN_COMMENT} karakter
                      </p>
                      <p className={`text-xs font-medium ${comment.trim().length >= MIN_COMMENT ? 'text-green-400' : 'text-gray-500'}`}>
                        {comment.trim().length}/{MIN_COMMENT}
                      </p>
                    </div>
                  </div>

                  {/* Name Section */}
                  <div>
                    <Label htmlFor="name" className="text-yellow-400 text-lg font-semibold flex items-center gap-2 mb-3">
                      Nama <span className="text-gray-500 text-sm font-normal">(opsional)</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Nama Anda"
                      className="bg-zinc-800/50 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 transition-all h-12"
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-6 text-lg transition-all duration-300 shadow-lg shadow-yellow-500/30 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                    aria-busy={loading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Kirim Ulasan
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>

                  {/* Message Display */}
                  <div aria-live="polite" className="min-h-0">
                    {message && (
                      <div
                        className={`text-sm font-medium text-center p-4 rounded-xl mt-2 animate-fadeIn ${
                          message.type === 'success'
                            ? 'bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 border border-green-500/50 shadow-lg shadow-green-500/20'
                            : 'bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-300 border border-red-500/50 shadow-lg shadow-red-500/20'
                        }`}
                      >
                        {message.text}
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Info Kontak */}
              <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-yellow-500/20 shadow-2xl shadow-yellow-500/10 relative overflow-hidden group">
                {/* Corner Decorations */}
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60"></div>
                
                <CardHeader className="space-y-2 pb-6">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Informasi Kontak
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Hubungi kami melalui saluran berikut</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 group/item">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30 group-hover/item:scale-110 transition-transform duration-300">
                      <MapPin className="w-7 h-7 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg mb-1">Alamat</p>
                      <p className="text-gray-400 leading-relaxed">
                        Sibola Hotangsas, Balige, Toba, North Sumatra
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 group/item">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30 group-hover/item:scale-110 transition-transform duration-300">
                      <Phone className="w-7 h-7 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg mb-1">Telepon</p>
                      <a href="tel:+622112345678" className="text-gray-400 hover:text-yellow-400 transition-colors">
                        +62 21 1234 5678
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 group/item">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30 group-hover/item:scale-110 transition-transform duration-300">
                      <Mail className="w-7 h-7 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg mb-1">Email</p>
                      <a href="mailto:info@mutiarahotel.com" className="text-gray-400 hover:text-yellow-400 transition-colors">
                        info@mutiarahotel.com
                      </a>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="pt-6 border-t border-yellow-500/20">
                    <p className="font-bold text-yellow-400 mb-4 text-lg">Ikuti Kami</p>
                    <div className="flex gap-4">
                      <a 
                        href="#" 
                        aria-label="Facebook" 
                        className="w-12 h-12 bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30 hover:border-yellow-500/60 hover:scale-110 transition-all duration-300 group/social"
                      >
                        <Facebook className="w-6 h-6 text-yellow-400 group-hover/social:text-yellow-300" />
                      </a>
                      <a 
                        href="#" 
                        aria-label="Instagram" 
                        className="w-12 h-12 bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30 hover:border-yellow-500/60 hover:scale-110 transition-all duration-300 group/social"
                      >
                        <Instagram className="w-6 h-6 text-yellow-400 group-hover/social:text-yellow-300" />
                      </a>
                      <a 
                        href="#" 
                        aria-label="Twitter" 
                        className="w-12 h-12 bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/30 hover:border-yellow-500/60 hover:scale-110 transition-all duration-300 group/social"
                      >
                        <Twitter className="w-6 h-6 text-yellow-400 group-hover/social:text-yellow-300" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-yellow-500/20 shadow-2xl shadow-yellow-500/10 overflow-hidden relative group">
                {/* Corner Decoration */}
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-yellow-500/30 transition-all duration-500 group-hover:border-yellow-500/60 z-10"></div>
                
                <CardHeader className="space-y-2">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Lokasi Kami
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Temukan kami di peta</p>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    {/* Gold Frame Effect */}
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
                      title="Lokasi Mutiara Hotel di Sibola Hotangsas, Balige"
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
                      <span className="underline underline-offset-4">Buka petunjuk arah di Google Maps</span>
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
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}