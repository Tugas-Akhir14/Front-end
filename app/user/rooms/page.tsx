'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Calendar, Users, MapPin, Phone, Mail, MessageSquare, Sparkles, Check, ArrowRight, BedDouble, DollarSign, AlertCircle } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const GOLD = '#d4af37';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token')?.replace(/^"+|"+$/g, '') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.error || err.message))
);

const useAuth = () => {
  if (typeof window === 'undefined') return { user: null };
  const user = sessionStorage.getItem('user');
  return { user: user ? JSON.parse(user) : null };
};

const formatRupiah = (n: number) => {
  if (!n || isNaN(n)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

const calculateNights = (cin: string, cout: string) => {
  if (!cin || !cout) return 0;
  const diff = (new Date(cout).getTime() - new Date(cin).getTime()) / (1000 * 3600 * 24);
  return Math.max(1, Math.ceil(diff));
};

// Konstanta dari backend (untuk hitung extra charge di frontend)
const BASE_GUESTS_INCLUDED = 2;  // 2 tamu gratis per kamar
const EXTRA_GUEST_PRICE = 150000;  // Rp150.000/orang/malam

// Gambar placeholder (ganti dengan URL dari backend nanti via field image)
const roomImages: Record<string, string> = {
  superior: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  executive: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
  default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
};

const roomTypesInfo = {
  superior: { name: 'Superior Room', capacity: 2 },
  deluxe: { name: 'Deluxe Room', capacity: 2 },
  executive: { name: 'Executive Suite', capacity: 3 },
};

interface AvailabilityItem {
  room_type: string;
  base_price: number;
  current_price: number;
  discount_percent: number;
  available_rooms: number;
  total_rooms: number;
}

export default function RoomBookingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu untuk melakukan pemesanan.",
        variant: "destructive",
      });
      router.push('/auth/signin');
    }
  }, [user, router, toast]);

  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityItem | null>(null);
  const [availabilities, setAvailabilities] = useState<AvailabilityItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    check_in: '',
    check_out: '',
    type: '',
    total_rooms: 1,
    guests: 2,
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: '',
  });

  const maxGuestsAllowed = form.total_rooms * 4;
  const nights = calculateNights(form.check_in, form.check_out);

  // Hitung extra charge (sama seperti backend)
  const totalBaseGuests = form.total_rooms * BASE_GUESTS_INCLUDED;
  const totalExtraGuests = Math.max(0, form.guests - totalBaseGuests);
  const extraCharge = totalExtraGuests * EXTRA_GUEST_PRICE * nights;

  const getBackgroundImage = () => {
    return roomImages[form.type.toLowerCase() as keyof typeof roomImages] || roomImages.default;
  };

const handleCheckAvailability = async () => {
  setLoading(true);
  setError(null);
  setAvailabilities([]);

  if (!form.check_in || !form.check_out) {
    setError('Pilih tanggal check-in dan check-out terlebih dahulu');
    setLoading(false);
    return;
  }

  if (new Date(form.check_out) <= new Date(form.check_in)) {
    setError('Tanggal check-out harus setelah check-in');
    setLoading(false);
    return;
  }

  try {
    const params = new URLSearchParams({
      check_in: form.check_in,
      check_out: form.check_out,
    });

    const res = await fetch(
      `http://localhost:8080/public/availability?${params.toString()}`
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const available = (data.data || []).filter(
      (r: AvailabilityItem) => r.available_rooms >= form.total_rooms
    );

    if (available.length === 0) {
      setError('Tidak ada kamar tersedia untuk tanggal tersebut');
      return;
    }

    setAvailabilities(available);
  } catch (err: any) {
    setError(err.message || 'Gagal memeriksa ketersediaan');
  } finally {
    setLoading(false);
  }
};


  const handleBookNow = async () => {
    setLoading(true);

    if (form.guests > maxGuestsAllowed) {
      toast({
        title: "Batas Tamu Tercapai",
        description: `Maksimal ${maxGuestsAllowed} tamu untuk ${form.total_rooms} kamar`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!form.name.trim() || !form.phone.trim()) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Nama dan nomor WhatsApp wajib diisi",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      let phone = form.phone.replace(/[^\d]/g, '');
      if (phone.startsWith('0')) phone = '62' + phone.slice(1);
      if (!phone.startsWith('62')) phone = '62' + phone;

      const payload = {
        room_type: form.type.toLowerCase(),
        rooms: form.total_rooms,
        name: form.name.trim(),
        phone: phone,
        email: form.email.trim() || undefined,
        check_in: form.check_in,
        check_out: form.check_out,
        guests: form.guests,
        notes: form.notes.trim() || undefined,
      };

      const res = await api.post('/public/bookings', payload);

      const whatsappUrl = res.data?.whatsapp_url;

      if (!whatsappUrl) {
        throw new Error('Link WhatsApp tidak ditemukan dari server');
      }

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: "Pemesanan Berhasil Dibuat!",
        description: "Pesan WhatsApp telah dibuka. Silakan kirim ke admin untuk konfirmasi.",
      });

      // Reset form setelah sukses
      setForm({
        check_in: '',
        check_out: '',
        type: '',
        total_rooms: 1,
        guests: 2,
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        notes: '',
      });
      setAvailability(null);
      setStep(1);
    } catch (err: any) {
      toast({
        title: "Gagal Melakukan Pemesanan",
        description: err.message || 'Terjadi kesalahan, silakan coba lagi',
        variant: "destructive",
      });
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-300 text-xl animate-pulse">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-black text-gray-100">
        {/* Hero Section dengan Background Dinamis */}
        <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-60"
            style={{ backgroundImage: `url('${getBackgroundImage()}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

          {/* Gold Accent */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 50% 20%, ${GOLD} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <Sparkles className="w-6 h-6" style={{ color: GOLD }} />
              <span className="font-semibold tracking-widest text-sm md:text-base text-gray-300 uppercase">
                Luxury Experience
              </span>
              <Sparkles className="w-6 h-6" style={{ color: GOLD }} />
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white">
              Book Your <span style={{ color: GOLD }}>Dream Stay</span>
            </h1>

            {form.type && (
              <div className="mt-6 px-10 py-5 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700 animate-fade-in-up">
                <p className="font-bold text-2xl md:text-3xl capitalize text-white mb-2">
                  {roomTypesInfo[form.type as keyof typeof roomTypesInfo]?.name || form.type}
                </p>
                {availability && (
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg">
                    <span className="text-gray-300">
                      {formatRupiah(availability.current_price)} / malam
                    </span>
                    {availability.discount_percent > 0 && (
                      <span className="text-green-400 font-medium">
                        Hemat {availability.discount_percent}% 
                        (dari {formatRupiah(availability.base_price)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-6 z-20">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-lg transition-all duration-500 border ${
                  step === s
                    ? 'bg-gray-900 border-yellow-600 shadow-lg shadow-yellow-900/30'
                    : 'bg-black/60 border-gray-800'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    step === s ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {step > s ? <Check size={20} /> : s}
                </div>
                <span className={`font-semibold text-base ${step === s ? 'text-white' : 'text-gray-400'}`}>
                  {s === 1 ? 'Pilih Kamar' : 'Konfirmasi'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Content */}
        <div className="max-w-6xl mx-auto px-6 py-16 -mt-16 relative z-10">
          {error && (
            <div className="mb-10 p-6 bg-red-950/60 border border-red-800/50 rounded-2xl text-center backdrop-blur-md">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-400" />
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          )}

          {/* STEP 1: Cek Ketersediaan Kamar */}
{step === 1 && (
  <Card className="bg-gray-900/90 border-gray-800 p-8 md:p-12 rounded-3xl">
    
    <h2 className="text-3xl font-bold text-white mb-10">
      Cek Ketersediaan Kamar
    </h2>

    {/* Input */}
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <input
        type="date"
        value={form.check_in}
        onChange={(e) => setForm({ ...form, check_in: e.target.value })}
        className="p-4 bg-black border border-gray-700 rounded-xl text-white"
      />

      <input
        type="date"
        value={form.check_out}
        onChange={(e) => setForm({ ...form, check_out: e.target.value })}
        className="p-4 bg-black border border-gray-700 rounded-xl text-white"
      />

      <input
        type="number"
        min={1}
        value={form.total_rooms}
        onChange={(e) =>
          setForm({ ...form, total_rooms: Math.max(1, Number(e.target.value)) })
        }
        className="p-4 bg-black border border-gray-700 rounded-xl text-white text-center"
      />
    </div>

    <Button
      onClick={handleCheckAvailability}
      disabled={loading}
      className="w-full h-14 mb-10"
      style={{ backgroundColor: GOLD, color: '#000' }}
    >
      {loading ? 'Memeriksa...' : 'Cek Ketersediaan'}
    </Button>

    {/* HASIL */}
    {availabilities.length > 0 && (
      <div className="grid md:grid-cols-3 gap-6">
        {availabilities.map((room) => (
          <div
            key={room.room_type}
            onClick={() => {
              setForm({ ...form, type: room.room_type });
              setAvailability(room);
              setStep(2);
            }}
            className="cursor-pointer p-6 border border-gray-700 rounded-2xl hover:border-yellow-500 transition"
          >
            <h3 className="text-xl font-bold text-white capitalize">
              {roomTypesInfo[room.room_type as keyof typeof roomTypesInfo]?.name}
            </h3>

            <p className="text-gray-400 mt-2">
              Tersedia: {room.available_rooms} kamar
            </p>

            <p className="text-yellow-400 font-bold mt-4">
              {formatRupiah(room.current_price)} / malam
            </p>
          </div>
        ))}
      </div>
    )}
  </Card>
)}


          {/* STEP 2: Detail Tamu & Konfirmasi */}
          {step === 2 && availability && (
            <Card className="bg-gray-900/90 border-gray-800 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-5 mb-12 pb-8 border-b border-gray-800">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-black border border-gray-800">
                  <Users className="w-7 h-7" style={{ color: GOLD }} />
                </div>
                <h2 className="text-4xl font-bold text-white">Detail Tamu</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-10 mb-12">
                {/* Jumlah Tamu */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 font-bold text-gray-300 mb-4 text-lg">
                    <Users size={20} style={{ color: GOLD }} />
                    Jumlah Tamu Total
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxGuestsAllowed}
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: Math.min(maxGuestsAllowed, parseInt(e.target.value) || 1) })}
                    className="w-full p-5 bg-black border border-gray-700 rounded-2xl text-white text-center text-2xl font-bold focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/30 transition"
                  />
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Maksimal {maxGuestsAllowed} tamu untuk {form.total_rooms} kamar (4 orang/kamar)
                  </p>
                  {totalExtraGuests > 0 && (
                    <p className="text-sm text-yellow-400 mt-2 text-center">
                      Extra {totalExtraGuests} bed : +{formatRupiah(extraCharge)} ({formatRupiah(EXTRA_GUEST_PRICE)}/orang/malam)
                    </p>
                  )}
                </div>

                {/* Nama */}
                <div>
                  <label className="flex items-center gap-3 font-bold text-gray-300 mb-4 text-lg">
                    <Users size={20} style={{ color: GOLD }} />
                    Nama Lengkap
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama lengkap sesuai KTP"
                    className="w-full p-5 bg-black border border-gray-700 rounded-2xl text-white focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/30 transition"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="flex items-center gap-3 font-bold text-gray-300 mb-4 text-lg">
                    <Phone size={20} style={{ color: GOLD }} />
                    Nomor WhatsApp
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="6281234567890"
                    className="w-full p-5 bg-black border border-gray-700 rounded-2xl text-white focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/30 transition"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 font-bold text-gray-300 mb-4 text-lg">
                    <Mail size={20} style={{ color: GOLD }} />
                    Email (opsional)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@contoh.com"
                    className="w-full p-5 bg-black border border-gray-700 rounded-2xl text-white focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/30 transition"
                  />
                </div>

                {/* Catatan Khusus */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 font-bold text-gray-300 mb-4 text-lg">
                    <MessageSquare size={20} style={{ color: GOLD }} />
                    Catatan Khusus
                  </label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Contoh: minta kamar menghadap kolam, lantai rendah, atau kebutuhan khusus lainnya..."
                    className="w-full p-5 bg-black border border-gray-700 rounded-2xl text-white focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/30 transition resize-none"
                  />
                </div>
              </div>

              {/* Ringkasan Booking */}
              <div className="bg-black/60 p-8 rounded-2xl border border-gray-800 mb-12">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                  <DollarSign size={28} style={{ color: GOLD }} />
                  Ringkasan Pemesanan
                </h3>

                <div className="space-y-6 text-gray-300">
                  <div className="flex justify-between text-lg">
                    <span>Tipe Kamar</span>
                    <span className="font-medium capitalize">
                      {roomTypesInfo[form.type as keyof typeof roomTypesInfo]?.name || form.type}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg">
                    <span>Durasi Menginap</span>
                    <span className="font-medium">{nights} Malam ({form.total_rooms} Kamar)</span>
                  </div>

                  <div className="flex justify-between text-lg">
                    <span>Jumlah Tamu</span>
                    <span className="font-medium">{form.guests} Orang</span>
                  </div>

                  <div className="h-px bg-gray-800 my-6" />

                  <div className="flex justify-between text-lg">
                    <span>Subtotal Kamar</span>
                    <span className="font-medium">
                      {formatRupiah(availability.current_price * nights * form.total_rooms)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg">
                    <span>Extra Bed</span>
                    <span className="font-medium">
                      {formatRupiah(extraCharge)}
                    </span>
                  </div>

                  <div className="h-px bg-gray-800 my-6" />

                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span>Total Estimasi</span>
                    <span style={{ color: GOLD }}>
                      {formatRupiah((availability.current_price * nights * form.total_rooms) + extraCharge)}
                    </span>
                  </div>

                  {availability.discount_percent > 0 && (
                    <div className="text-right text-green-400 text-sm mt-2">
                      Hemat {formatRupiah((availability.base_price - availability.current_price) * nights * form.total_rooms)} 
                      ({availability.discount_percent}% diskon aktif)
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAvailability(null);
                    setStep(1);
                  }}
                  className="flex-1 h-16 text-lg font-bold border-gray-700 text-gray-300 hover:bg-gray-800 rounded-2xl"
                >
                  Kembali
                </Button>

                <Button
                  onClick={handleBookNow}
                  disabled={loading}
                  className="flex-[2] h-16 text-xl font-bold rounded-2xl transition-all"
                  style={{ backgroundColor: GOLD, color: '#000' }}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    'Konfirmasi & Booking via WhatsApp'
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}