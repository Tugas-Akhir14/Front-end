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
    deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?lib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    executive: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?lib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
    default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?lib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
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

    const maxGuestsAllowed = form.total_rooms * 4;
    const nights = calculateNights(form.check_in, form.check_out);

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
      } catch (err: any) {
        setError(err.message || 'Gagal memeriksa ketersediaan');
      } finally {
        setLoading(false);
      }
    };

    const handleBook = async (e: React.FormEvent) => {
      e.preventDefault();
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
          rooms: form.total_rooms,           // ← sesuai backend baru
          name: form.name.trim(),
          phone: phone,
          email: form.email.trim() || null,
          check_in: form.check_in,
          check_out: form.check_out,
          guests: form.guests,
          notes: form.notes.trim() || null,
        };

        // PAKAI ENDPOINT YANG BENAR: /public/bookings (bukan guest-bookings!)
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

        <div className="relative h-96 w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${getBackgroundImage()}')` }}>
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Pesan Kamar Sekarang
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              Pilih tanggal, tipe kamar, dan jumlah kamar yang Anda inginkan
            </p>
            {form.type && (
              <div className="mt-8 px-10 py-5 bg-amber-600/30 backdrop-blur-md rounded-2xl border border-amber-400">
                <p className="text-amber-300 font-bold text-2xl capitalize">{form.type} Room</p>
              </div>
            )}
          </div>
        </div>

        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-200 py-20 px-6">
          <div className="max-w-5xl mx-auto space-y-12">

            {error && (
              <div className="p-6 bg-red-900/70 border border-red-600 rounded-2xl text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCheck} className="bg-gray-900/95 backdrop-blur-xl p-10 rounded-3xl border border-amber-700 shadow-2xl">
              <h2 className="text-3xl font-bold text-amber-400 mb-8 text-center">Cek Ketersediaan Kamar</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block font-semibold text-amber-400 mb-2">Check In</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={form.check_in}
                    onChange={e => setForm({ ...form, check_in: e.target.value })}
                    className="w-full p-4 bg-gray-800 border border-amber-600 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block font-semibold text-amber-400 mb-2">Check Out</label>
                  <input type="date" required min={form.check_in || new Date().toISOString().split('T')[0]} value={form.check_out}
                    onChange={e => setForm({ ...form, check_out: e.target.value })}
                    className="w-full p-4 bg-gray-800 border border-amber-600 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block font-semibold text-amber-400 mb-2">Tipe Kamar</label>
                  <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full p-4 bg-gray-800 border border-amber-600 rounded-xl focus:ring-2 focus:ring-amber-500">
                    <option value="">Pilih Tipe</option>
                    <option value="superior">Superior</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-amber-400 mb-2">Jumlah Kamar</label>
                  <input type="number" min="1" max="10" required value={form.total_rooms}
                    onChange={e => setForm({ ...form, total_rooms: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full p-4 bg-gray-800 border border-amber-600 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              {availability && nights > 0 && (
                <div className="mt-10 p-8 bg-gradient-to-r from-amber-900/40 to-yellow-900/40 rounded-2xl border border-amber-600 text-center">
                  <p className="text-2xl text-amber-300 mb-4">Estimasi Harga</p>
                  <p className="text-6xl font-bold text-emerald-400">
                    {formatRupiah(nights * availability.price_per_night * form.total_rooms)}
                  </p>
                  <p className="text-gray-300 mt-4">{nights} malam × {form.total_rooms} kamar × {formatRupiah(availability.price_per_night)}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full mt-10 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-6 rounded-2xl text-2xl hover:scale-105 transition-all disabled:opacity-50">
                {loading ? 'Memeriksa...' : 'Cek Ketersediaan'}
              </button>
            </form>

            {availability && (
              <form onSubmit={handleBook} className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 backdrop-blur-xl p-12 rounded-3xl border-4 border-emerald-600 shadow-2xl shadow-emerald-600/30">
                <h2 className="text-4xl font-bold text-emerald-400 text-center mb-10">Lengkapi Data Pemesan</h2>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div>
                    <label className="block text-emerald-400 font-bold text-xl mb-3">Jumlah Tamu (maks {maxGuestsAllowed})</label>
                    <input type="number" min="1" max={maxGuestsAllowed} required value={form.guests}
                      onChange={e => setForm({ ...form, guests: Math.min(maxGuestsAllowed, parseInt(e.target.value) || 1) })}
                      className="w-full p-5 text-2xl bg-gray-900 border-2 border-emerald-600 rounded-2xl rounded-xl focus:ring-4 focus:ring-emerald-500" />
                    <p className="text-sm text-gray-400 mt-3">Extra tamu: +Rp150.000/org/malam</p>
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold text-xl mb-3">Nama Lengkap</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full p-5 text-xl bg-gray-900 border-2 border-emerald-600 rounded-xl focus:ring-4 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold text-xl mb-3">No. WhatsApp (62...)</label>
                    <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="6281234567890"
                      className="w-full p-5 text-xl bg-gray-900 border-2 border-emerald-600 rounded-xl focus:ring-4 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold text-xl mb-3">Email (opsional)</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full p-5 text-xl bg-gray-900 border-2 border-emerald-600 rounded-xl focus:ring-4 focus:ring-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold text-xl mb-3">Catatan Tambahan</label>
                  <textarea rows={5} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Minta connecting room, extra bed, view laut, dll..."
                    className="w-full p-5 text-lg bg-gray-900 border-2 border-emerald-600 rounded-xl focus:ring-4 focus:ring-emerald-500 resize-none" />
                </div>

                <div className="flex gap-6 mt-12">
                  <button type="button" onClick={() => setAvailability(null)}
                    className="flex-1 bg-gray-800 py-5 rounded-2xl font-bold text-xl hover:bg-gray-700 transition-all">
                    Ubah Pencarian
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-6 rounded-2xl text-2xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 shadow-2xl hover:shadow-emerald-500/50 transition-all">
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