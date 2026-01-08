'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Calendar, Users, MapPin, Phone, Mail, MessageSquare, Sparkles, Check, ArrowRight } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-300 text-xl animate-pulse">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-black text-gray-100">
        {/* Hero Section */}
        <div className="relative h-[500px] w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-60"
            style={{ backgroundImage: `url('${getBackgroundImage()}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"></div>
          {/* Gold Radial */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(60% 80% at 50% 0%, ${GOLD} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-center gap-2 mb-4 animate-fade-in">
              <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
              <span className="font-semibold tracking-wider text-sm text-gray-300">LUXURY BOOKING</span>
              <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 text-white tracking-tight">
              Book Your <span style={{ color: GOLD }}>Stay</span>
            </h1>

            {form.type && availability && (
              <div className="mt-8 px-8 py-4 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700 animate-fade-in-up">
                <p className="font-bold text-2xl capitalize text-white mb-1">
                  {roomTypes[form.type as keyof typeof roomTypes]?.name || form.type}
                </p>
                <p className="text-sm font-light text-gray-400">
                  <span style={{ color: GOLD, fontWeight: 'bold' }}>{formatRupiah(availability.price_per_night)}</span> / night
                </p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
            {[1, 2].map((s) => (
              <div key={s} className={`flex items-center gap-3 px-5 py-2 rounded-full backdrop-blur-md transition-all duration-500 border ${step === s ? 'bg-gray-900 border-yellow-700' : 'bg-black/50 border-gray-800'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === s ? 'text-black' : 'text-gray-500 bg-gray-800'}`} style={{ backgroundColor: step === s ? GOLD : undefined }}>
                  {step > s ? <Check size={16} /> : s}
                </div>
                <span className={`font-medium text-sm ${step === s ? 'text-white' : 'text-gray-500'}`}>
                  {s === 1 ? 'Select Room' : 'Confirm'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12 -mt-10 relative z-10">

          {error && (
            <div className="mb-8 p-6 bg-red-950/50 border border-red-900/50 rounded-2xl text-center font-medium backdrop-blur-md">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Step 1: Room Selection */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <Card className="bg-gray-900 border-gray-800 p-10 rounded-3xl shadow-xl">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-800">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black border border-gray-800">
                    <Calendar className="w-6 h-6" style={{ color: GOLD }} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Select Dates
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  {/* Check In/Out */}
                  {['check_in', 'check_out'].map((field) => (
                    <div key={field} className="group">
                      <label className="flex items-center gap-2 font-bold text-gray-400 mb-3 text-sm uppercase tracking-wider">
                        <Calendar size={16} style={{ color: GOLD }} />
                        {field === 'check_in' ? 'Check In' : 'Check Out'}
                      </label>
                      <input
                        type="date"
                        min={field === 'check_in' ? new Date().toISOString().split('T')[0] : (form.check_in || new Date().toISOString().split('T')[0])}
                        value={form[field as keyof typeof form] as string}
                        onChange={e => setForm({ ...form, [field]: e.target.value })}
                        className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all text-white outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Room Type */}
                <div className="mb-10">
                  <label className="flex items-center gap-2 font-bold text-gray-400 mb-4 text-sm uppercase tracking-wider">
                    <MapPin size={16} style={{ color: GOLD }} />
                    Room Type
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(roomTypes).map(([key, room]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, type: key })}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${form.type === key
                            ? 'bg-gray-800 border-yellow-600 shadow-lg'
                            : 'bg-black border-gray-800 hover:border-gray-700'
                          }`}
                      >
                        <h3 className={`font-bold text-lg mb-1 ${form.type === key ? 'text-white' : 'text-gray-400'}`}>
                          {room.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Max Capacity: {room.capacity}
                        </p>
                        {form.type === key && (
                          <div className="absolute top-4 right-4">
                            <Check size={18} style={{ color: GOLD }} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Rooms */}
                <div className="mb-10">
                  <label className="flex items-center gap-2 font-bold text-gray-400 mb-3 text-sm uppercase tracking-wider">
                    <Users size={16} style={{ color: GOLD }} />
                    Rooms Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.total_rooms}
                    onChange={e => setForm({ ...form, total_rooms: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-600 text-white outline-none text-center font-bold text-xl"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleCheck}
                  disabled={loading}
                  className="w-full h-16 text-lg font-bold text-black rounded-xl hover:opacity-90 transition-all"
                  style={{ backgroundColor: GOLD }}
                >
                  {loading ? 'Checking Availability...' : 'Continue to Reservation'}
                </Button>
              </Card>
            </div>
          )}

          {/* Step 2: Guest Information */}
          {step === 2 && availability && (
            <div className="space-y-8 animate-fade-in">
              <Card className="bg-gray-900 border-gray-800 p-10 rounded-3xl shadow-xl">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-800">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black border border-gray-800">
                    <Users className="w-6 h-6" style={{ color: GOLD }} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Guest Details
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      max={maxGuestsAllowed}
                      value={form.guests}
                      onChange={e => setForm({ ...form, guests: Math.min(maxGuestsAllowed, parseInt(e.target.value) || 1) })}
                      className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white outline-none focus:border-yellow-600 text-center font-bold text-xl"
                    />
                    <p className="text-xs text-gray-500 text-center">Max {maxGuestsAllowed} guests for {form.total_rooms} rooms</p>
                  </div>

                  {['name', 'phone', 'email'].map((field) => (
                    <div key={field} className={field === 'email' ? 'md:col-span-2 space-y-2' : 'space-y-2'}>
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        {{ name: 'Full Name', phone: 'WhatsApp Number', email: 'Email Address' }[field]}
                      </label>
                      <input
                        value={form[field as keyof typeof form] as string}
                        onChange={e => setForm({ ...form, [field]: e.target.value })}
                        placeholder={field === 'phone' ? 'e.g. 628123456789' : ''}
                        className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white outline-none focus:border-yellow-600"
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Special Requests</label>
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white outline-none focus:border-yellow-600 resize-none"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-black/50 p-8 rounded-2xl border border-gray-800 mb-8">
                  <h3 className="text-xl font-bold text-white mb-6">Booking Summary</h3>
                  <div className="space-y-4 text-gray-400">
                    <div className="flex justify-between">
                      <span>Room Type</span>
                      <span className="text-white font-medium capitalize">{roomTypes[form.type as keyof typeof roomTypes]?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="text-white font-medium">{nights} Nights ({form.total_rooms} Rooms)</span>
                    </div>
                    <div className="h-px bg-gray-800 my-4" />
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total Estimate</span>
                      <span style={{ color: GOLD }}>{formatRupiah(nights * availability.price_per_night * form.total_rooms)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => { setAvailability(null); setStep(1); }}
                    className="flex-1 h-14 border-gray-700 text-gray-300 hover:bg-gray-800 font-bold rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleBook}
                    disabled={loading}
                    className="flex-[2] h-14 text-black font-bold rounded-xl hover:opacity-90"
                    style={{ backgroundColor: GOLD }}
                  >
                    {loading ? 'Processing...' : 'Confirm & Book via WhatsApp'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}