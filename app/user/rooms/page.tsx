'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
  deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  executive: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
  default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
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

  // 4 tamu per kamar → dinamis
  const maxGuestsAllowed = form.total_rooms * 4;
  const nights = calculateNights(form.check_in, form.check_out);
  const totalPrice = nights * (availability?.price_per_night || 0) * form.total_rooms;

  const getBackgroundImage = () => roomImages[form.type as keyof typeof roomImages] || roomImages.default;

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const result = data.find((item: any) => item.type?.toLowerCase() === form.type.toLowerCase());

      if (!result) {
        setError('Tipe kamar tidak ditemukan');
        setLoading(false);
        return;
      }

      if (result.available_rooms < form.total_rooms) {
        setError(
          result.available_rooms === 0
            ? `Maaf, semua kamar ${form.type} sudah terbooking`
            : `Hanya tersedia ${result.available_rooms} kamar, Anda meminta ${form.total_rooms}`
        );
        setLoading(false);
        return;
      }

      setAvailability(result);
    } catch (err: any) {
      setError(err.message || 'Gagal memeriksa ketersediaan');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validasi tamu sebelum kirim
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
      // Normalisasi nomor HP
      let phone = form.phone.replace(/[^\d]/g, '');
      if (phone.startsWith('0')) phone = '62' + phone.slice(1);
      if (!phone.startsWith('62')) phone = '62' + phone;

      const payload = {
        room_type: form.type.toLowerCase(),
        total_rooms: form.total_rooms,
        name: form.name.trim(),
        phone: phone,
        email: form.email.trim() || null,
        check_in: form.check_in,
        check_out: form.check_out,
        guests: form.guests,
        notes: form.notes.trim() || null,
      };

      const res = await api.post('/public/guest-bookings', payload);

      const whatsappUrl = res?.data?.whatsapp_url || res?.whatsapp_url;
      if (!whatsappUrl) throw new Error('Link WhatsApp tidak ditemukan');

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: "Booking Berhasil!",
        description: "Pesan WhatsApp telah dibuka. Silakan konfirmasi pembayaran.",
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
        <div className="text-amber-400 text-xl">Redirecting...</div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="relative h-96 w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${getBackgroundImage()}')` }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
            Pesan Kamar Hotel
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl">
            Nikmati pengalaman menginap yang tak terlupakan
          </p>
          {form.type && (
            <div className="mt-6 px-8 py-4 bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-400/30">
              <p className="text-amber-300 font-bold text-xl capitalize">{form.type} Room</p>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-200 p-6 -mt-16 relative z-20">
        <div className="max-w-4xl mx-auto pt-16 space-y-10">

          {error && (
            <div className="p-6 bg-red-900/50 border border-red-700 text-red-300 rounded-xl text-center font-medium backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCheck} className="bg-gray-900/90 backdrop-blur-md p-10 rounded-2xl border border-amber-700 shadow-2xl shadow-amber-500/10 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold text-amber-400 mb-3 text-lg">Check In</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]} value={form.check_in}
                  onChange={e => setForm({ ...form, check_in: e.target.value })}
                  className="w-full p-4 bg-gray-800 border border-amber-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
              </div>
              <div>
                <label className="block font-semibold text-amber-400 mb-3 text-lg">Check Out</label>
                <input type="date" required min={form.check_in || new Date().toISOString().split('T')[0]} value={form.check_out}
                  onChange={e => setForm({ ...form, check_out: e.target.value })}
                  className="w-full p-4 bg-gray-800 border border-amber-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
              </div>
              <div>
                <label className="block font-semibold text-amber-400 mb-3 text-lg">Tipe Kamar</label>
                <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full p-4 bg-gray-800 border border-amber-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all">
                  <option value="">Pilih Tipe Kamar</option>
                  <option value="superior">Superior</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-amber-400 mb-3 text-lg">Jumlah Kamar</label>
                <input type="number" min="1" max="10" required value={form.total_rooms}
                  onChange={e => setForm({ ...form, total_rooms: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full p-4 bg-gray-800 border border-amber-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
              </div>
            </div>

            {nights > 0 && availability && (
              <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-8 rounded-xl border border-amber-700 backdrop-blur-sm text-center">
                <h3 className="font-bold text-amber-400 text-2xl mb-4">Estimasi Total</h3>
                <p className="text-5xl font-bold text-emerald-400">{formatRupiah(totalPrice)}</p>
                <p className="text-gray-300 mt-3">{nights} malam × {form.total_rooms} kamar</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-5 rounded-xl hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50 shadow-lg hover:shadow-amber-500/30 transform hover:scale-105 duration-300 text-xl">
              {loading ? 'Memeriksa...' : 'Cek Ketersediaan'}
            </button>
          </form>

          {availability && (
            <form onSubmit={handleBook} className="bg-gray-900/90 backdrop-blur-md p-10 rounded-2xl border border-emerald-700 shadow-2xl shadow-emerald-500/10 space-y-8">
              <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 p-8 rounded-xl border border-emerald-700 text-center backdrop-blur-sm">
                <h3 className="text-3xl font-bold capitalize text-emerald-400">{form.type} Room</h3>
                <p className="text-emerald-300 text-xl font-semibold mt-2">{form.total_rooms} kamar tersedia</p>
                <p className="text-5xl font-bold text-emerald-400 mt-6">{formatRupiah(totalPrice)}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-semibold text-emerald-400 mb-3 text-lg">
                    Jumlah Tamu <span className="text-sm font-normal text-gray-400">(maks {maxGuestsAllowed})</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxGuestsAllowed}
                    required
                    value={form.guests}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val > maxGuestsAllowed) {
                        toast({
                          title: "Batas Tercapai",
                          description: `Maksimal ${maxGuestsAllowed} tamu (4 per kamar)`,
                          variant: "destructive",
                        });
                        return;
                      }
                      setForm({ ...form, guests: val });
                    }}
                    className="w-full p-4 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <p className="text-sm text-gray-400 mt-2">4 tamu/kamar • Extra +Rp150.000/org/malam</p>
                </div>

                <div>
                  <label className="block font-semibold text-emerald-400 mb-3 text-lg">Nama Lengkap</label>
                  <input required placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full p-4 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-400 mb-3 text-lg">No. WhatsApp</label>
                  <input required placeholder="6281234567890" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-4 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-400 mb-3 text-lg">Email (opsional)</label>
                  <input type="email" placeholder="email@contoh.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-4 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-emerald-400 mb-3 text-lg">Catatan (opsional)</label>
                <textarea rows={4} placeholder="Minta extra bed, connecting room, view laut..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-4 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-emerald-500 resize-none transition-all" />
              </div>

              <div className="flex gap-6">
                <button type="button" onClick={() => { setAvailability(null); setError(null); }}
                  className="flex-1 bg-gray-800 text-gray-300 font-bold py-4 rounded-xl hover:bg-gray-700 border border-gray-600 transition-all">
                  Ubah Pencarian
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 duration-300 text-xl">
                  {loading ? 'Memproses...' : 'Pesan via WhatsApp'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}