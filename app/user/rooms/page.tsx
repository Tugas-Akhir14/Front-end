'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Calendar, Users, MapPin, Phone, Mail, MessageSquare, Sparkles, Check } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useToast } from '@/hooks/use-toast';

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

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const calculateNights = (cin: string, cout: string) => {
  if (!cin || !cout) return 0;
  const diff = (new Date(cout).getTime() - new Date(cin).getTime()) / (1000 * 3600 * 24);
  return Math.max(1, Math.ceil(diff));
};

const roomImages: Record<string, string> = {
  superior: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?lib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  executive: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?lib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
  default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?lib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
};

const roomTypes = {
  superior: { name: 'Superior Room', capacity: 2 },
  deluxe: { name: 'Deluxe Room', capacity: 2 },
  executive: { name: 'Executive Suite', capacity: 3 }
};

export default function RoomBookingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/signin');
  }, [user, router]);

  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
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

  const getBackgroundImage = () => roomImages[form.type as keyof typeof roomImages] || roomImages.default;

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setAvailability(null);

    if (!form.check_in || !form.check_out || new Date(form.check_out) <= new Date(form.check_in)) {
      setError('Check-out harus setelah check-in');
      setLoading(false);
      return;
    }
    if (!form.type) {
      setError('Pilih tipe kamar terlebih dahulu');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        check_in: form.check_in,
        check_out: form.check_out,
        type: form.type.toLowerCase(),
      });

      const res = await api.get(`/public/availability?${params}`);
      const data = Array.isArray(res) ? res : res.data || [];

      const result = data.find((item: any) => 
        item.room_type?.toLowerCase() === form.type.toLowerCase() || 
        item.type?.toLowerCase() === form.type.toLowerCase()
      );

      if (!result || result.available_rooms < form.total_rooms) {
        setError(
          result?.available_rooms === 0
            ? `Maaf, semua kamar ${form.type} sudah terbooking`
            : `Hanya tersedia ${result?.available_rooms || 0} kamar ${form.type}`
        );
        setLoading(false);
        return;
      }

      setAvailability(result);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Gagal memeriksa ketersediaan');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setLoading(true);

    if (form.guests > maxGuestsAllowed) {
      toast({
        title: "Batas Tamu Tercapai!",
        description: `Maksimal ${maxGuestsAllowed} tamu untuk ${form.total_rooms} kamar (4 orang/kamar)`,
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
        email: form.email.trim() || null,
        check_in: form.check_in,
        check_out: form.check_out,
        guests: form.guests,
        notes: form.notes.trim() || null,
      };

      const res = await api.post('/public/bookings', payload);

      const whatsappUrl = res.data?.whatsapp_url || res.whatsapp_url;
      if (!whatsappUrl) throw new Error('Link WhatsApp tidak ditemukan');

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: "Booking Berhasil!",
        description: "Pesan WhatsApp telah dibuka. Admin akan segera menghubungi Anda.",
        variant: "default",
      });

      router.push('/');
    } catch (err: any) {
      toast({
        title: "Gagal Booking",
        description: err.message || 'Terjadi kesalahan saat booking',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Redirecting ke login...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        {/* Hero Section */}
        <div className="relative h-[500px] w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('${getBackgroundImage()}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-gray-900"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-center gap-2 mb-4 animate-pulse">
              <Sparkles className="text-amber-400" size={24} />
              <span className="text-amber-400 font-semibold tracking-wider">LUXURY BOOKING</span>
              <Sparkles className="text-amber-400" size={24} />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Pesan Kamar Impian Anda
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-8 leading-relaxed">
              Pengalaman menginap tak terlupakan menanti Anda
            </p>

            {form.type && availability && (
              <div className="mt-6 px-12 py-6 bg-gradient-to-r from-amber-600/40 to-yellow-600/40 backdrop-blur-xl rounded-3xl border-2 border-amber-400/50 shadow-2xl shadow-amber-500/20 transform hover:scale-105 transition-all duration-300">
                <p className="text-amber-200 font-bold text-3xl capitalize tracking-wide">
                  {roomTypes[form.type as keyof typeof roomTypes]?.name || form.type}
                </p>
                <p className="text-amber-400/80 text-sm mt-1">
                  {formatRupiah(availability.price_per_night)} / malam
                </p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
            <div className={`flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 ${step === 1 ? 'bg-amber-500/90 scale-110' : 'bg-gray-800/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-white text-amber-600' : 'bg-gray-700 text-gray-400'}`}>
                {step > 1 ? <Check size={18} /> : '1'}
              </div>
              <span className={`font-semibold ${step === 1 ? 'text-white' : 'text-gray-400'}`}>Pilih Kamar</span>
            </div>
            <div className={`flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 ${step === 2 ? 'bg-emerald-500/90 scale-110' : 'bg-gray-800/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-white text-emerald-600' : 'bg-gray-700 text-gray-400'}`}>
                2
              </div>
              <span className={`font-semibold ${step === 2 ? 'text-white' : 'text-gray-400'}`}>Reservasi</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-16 -mt-12 relative z-10">
          
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-900/80 to-red-800/80 border-2 border-red-500 rounded-2xl text-center font-medium backdrop-blur-sm shadow-2xl">
              <p className="text-red-200 text-lg">{error}</p>
            </div>
          )}

          {/* Step 1: Room Selection */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl p-12 rounded-3xl border-2 border-amber-600/30 shadow-2xl shadow-amber-900/20">
                
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    Tentukan Tanggal & Kamar
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Check In */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-amber-400 font-bold text-lg mb-3">
                      <Calendar size={20} />
                      Tanggal Check In
                    </label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]} 
                      value={form.check_in}
                      onChange={e => setForm({ ...form, check_in: e.target.value })}
                      className="w-full p-5 text-lg bg-gray-950/80 border-2 border-amber-600/50 rounded-2xl focus:ring-4 focus:ring-amber-500/50 focus:border-amber-500 transition-all group-hover:border-amber-500/70 text-white" 
                    />
                  </div>

                  {/* Check Out */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-amber-400 font-bold text-lg mb-3">
                      <Calendar size={20} />
                      Tanggal Check Out
                    </label>
                    <input 
                      type="date" 
                      min={form.check_in || new Date().toISOString().split('T')[0]} 
                      value={form.check_out}
                      onChange={e => setForm({ ...form, check_out: e.target.value })}
                      className="w-full p-5 text-lg bg-gray-950/80 border-2 border-amber-600/50 rounded-2xl focus:ring-4 focus:ring-amber-500/50 focus:border-amber-500 transition-all group-hover:border-amber-500/70 text-white" 
                    />
                  </div>
                </div>

                {/* Room Type - Card Style */}
                <div className="mb-8">
                  <label className="flex items-center gap-2 text-amber-400 font-bold text-lg mb-4">
                    <MapPin size={20} />
                    Pilih Tipe Kamar
                  </label>
                  <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(roomTypes).map(([key, room]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, type: key })}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                          form.type === key
                            ? 'bg-gradient-to-br from-amber-600/40 to-yellow-600/40 border-amber-400 shadow-2xl shadow-amber-500/30 scale-105'
                            : 'bg-gray-950/50 border-gray-700 hover:border-amber-600/50 hover:scale-102'
                        }`}
                      >
                        <div className="text-left">
                          <h3 className={`font-bold text-xl mb-2 ${form.type === key ? 'text-amber-300' : 'text-gray-300'}`}>
                            {room.name}
                          </h3>
                          <p className={`text-sm ${form.type === key ? 'text-amber-200/80' : 'text-gray-500'}`}>
                            Kapasitas: {room.capacity} orang
                          </p>
                        </div>
                        {form.type === key && (
                          <div className="mt-4 flex items-center gap-2 text-amber-300">
                            <Check size={18} />
                            <span className="text-sm font-semibold">Dipilih</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Rooms */}
                <div className="group">
                  <label className="flex items-center gap-2 text-amber-400 font-bold text-lg mb-3">
                    <Users size={20} />
                    Jumlah Kamar
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={form.total_rooms}
                    onChange={e => setForm({ ...form, total_rooms: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full p-5 text-2xl text-center font-bold bg-gray-950/80 border-2 border-amber-600/50 rounded-2xl focus:ring-4 focus:ring-amber-500/50 focus:border-amber-500 transition-all group-hover:border-amber-500/70 text-white" 
                  />
                </div>

                {/* Price Estimation */}
                {availability && nights > 0 && (
                  <div className="mt-10 p-10 bg-gradient-to-br from-amber-900/30 via-yellow-900/30 to-amber-900/30 rounded-3xl border-2 border-amber-500/50 text-center backdrop-blur-sm shadow-2xl">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Sparkles className="text-amber-400" size={24} />
                      <p className="text-2xl text-amber-300 font-semibold">Estimasi Total</p>
                    </div>
                    <p className="text-7xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-4">
                      {formatRupiah(nights * availability.price_per_night * form.total_rooms)}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-gray-300 text-lg">
                      <span>{nights} malam</span>
                      <span>×</span>
                      <span>{form.total_rooms} kamar</span>
                      <span>×</span>
                      <span>{formatRupiah(availability.price_per_night)}</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleCheck} 
                  disabled={loading}
                  className="w-full mt-10 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-bold py-7 rounded-2xl text-2xl hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? 'Memeriksa Ketersediaan...' : 'Lanjut ke Reservasi →'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Guest Information */}
          {step === 2 && availability && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-emerald-950/95 via-green-900/95 to-emerald-950/95 backdrop-blur-2xl p-12 rounded-3xl border-2 border-emerald-500/40 shadow-2xl shadow-emerald-900/30">
                
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="text-white" size={24} />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    Informasi Tamu
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Number of Guests */}
                  <div className="group md:col-span-2">
                    <label className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-3">
                      <Users size={20} />
                      Jumlah Tamu (maksimal {maxGuestsAllowed})
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max={maxGuestsAllowed} 
                      value={form.guests}
                      onChange={e => setForm({ ...form, guests: Math.min(maxGuestsAllowed, parseInt(e.target.value) || 1) })}
                      className="w-full p-6 text-3xl text-center font-bold bg-gray-950/80 border-2 border-emerald-600/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all group-hover:border-emerald-500/70 text-white" 
                    />
                    <p className="text-sm text-emerald-300/70 mt-3 text-center">
                      ℹ️ Extra tamu: +Rp150.000/orang/malam
                    </p>
                  </div>

                  {/* Full Name */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-3">
                      <Users size={20} />
                      Nama Lengkap
                    </label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      className="w-full p-5 text-lg bg-gray-950/80 border-2 border-emerald-600/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all group-hover:border-emerald-500/70 text-white placeholder-gray-500" 
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-3">
                      <Phone size={20} />
                      Nomor WhatsApp
                    </label>
                    <input 
                      value={form.phone} 
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="6281234567890"
                      className="w-full p-5 text-lg bg-gray-950/80 border-2 border-emerald-600/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all group-hover:border-emerald-500/70 text-white placeholder-gray-500" 
                    />
                  </div>

                  {/* Email */}
                  <div className="group md:col-span-2">
                    <label className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-3">
                      <Mail size={20} />
                      Email (opsional)
                    </label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full p-5 text-lg bg-gray-950/80 border-2 border-emerald-600/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all group-hover:border-emerald-500/70 text-white placeholder-gray-500" 
                    />
                  </div>

                  {/* Notes */}
                  <div className="group md:col-span-2">
                    <label className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-3">
                      <MessageSquare size={20} />
                      Permintaan Khusus
                    </label>
                    <textarea 
                      rows={5} 
                      value={form.notes} 
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      placeholder="Contoh: Connecting room, extra bed, view laut, early check-in, honeymoon package, dll..."
                      className="w-full p-5 text-lg bg-gray-950/80 border-2 border-emerald-600/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all group-hover:border-emerald-500/70 resize-none text-white placeholder-gray-500" 
                    />
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="mt-10 p-8 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-2xl border border-emerald-500/30">
                  <h3 className="text-2xl font-bold text-emerald-400 mb-6">Ringkasan Pesanan</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between items-center">
                      <span>Tipe Kamar:</span>
                      <span className="font-bold text-emerald-400 capitalize">{roomTypes[form.type as keyof typeof roomTypes]?.name || form.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Jumlah Kamar:</span>
                      <span className="font-bold text-emerald-400">{form.total_rooms} kamar</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Durasi:</span>
                      <span className="font-bold text-emerald-400">{nights} malam</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Jumlah Tamu:</span>
                      <span className="font-bold text-emerald-400">{form.guests} orang</span>
                    </div>
                    <div className="h-px bg-emerald-500/30 my-4"></div>
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-3xl bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                        {formatRupiah(nights * availability.price_per_night * form.total_rooms)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-6 mt-12">
                  <button 
                    onClick={() => {
                      setAvailability(null);
                      setStep(1);
                    }}
                    className="flex-1 bg-gray-800 border-2 border-gray-700 py-6 rounded-2xl font-bold text-xl hover:bg-gray-700 hover:border-gray-600 transition-all"
                  >
                    ← Ubah Pencarian
                  </button>
                  
                  <button 
                    onClick={handleBook} 
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white font-bold py-7 rounded-2xl text-2xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? 'Memproses...' : (
                        <>
                          <Phone size={24} />
                          Pesan via WhatsApp
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}