'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

// === AXIOS SETUP (INI YANG BENAR & AMAN) ===
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Tambah token otomatis
api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('token');
  if (raw) {
    const token = raw.replace(/^"+|"+$/g, '');
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// HANYA return response.data → biarkan apa adanya
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.error || error.message || 'Terjadi kesalahan';
    return Promise.reject(new Error(msg));
  }
);

// === HELPER ===
const useAuth = () => {
  if (typeof window === 'undefined') return { user: null };
  const user = sessionStorage.getItem('user');
  return { user: user ? JSON.parse(user) : null };
};

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const calculateNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24);
  return Math.max(1, Math.ceil(diff));
};

const isValidDateRange = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return false;
  const cin = new Date(checkIn);
  const cout = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return cin >= today && cout > cin;
};

// Data gambar kamar berdasarkan tipe
const roomImages = {
  superior: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  executive: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
  default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
};

export default function RoomBookingPage() {
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
    guests: 1,
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: '',
  });

  // Get background image based on selected room type
  const getBackgroundImage = () => {
    if (form.type && roomImages[form.type as keyof typeof roomImages]) {
      return roomImages[form.type as keyof typeof roomImages];
    }
    return roomImages.default;
  };

  // === CEK KETERSEDIAAN (INI YANG DIUBAH TOTAL) ===
  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAvailability(null);

    if (!isValidDateRange(form.check_in, form.check_out)) {
      setError('Check-in harus hari ini atau setelahnya, dan check-out harus setelah check-in.');
      setLoading(false);
      return;
    }
    if (!form.type) {
      setError('Pilih tipe kamar terlebih dahulu.');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        check_in: form.check_in,
        check_out: form.check_out,
        type: form.type.toLowerCase(),
      });

      console.log('Request:', `/public/availability?${params}`);

      const response = await api.get(`/public/availability?${params}`);

      // PENANGANAN RESPONSE YANG BENAR (bisa {data: [...] } atau langsung [...])
      let data: any[] = [];

      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          data = response.data;           // ← format { data: [...] }
        } else if (Array.isArray(response)) {
          data = response;                // ← langsung array
        }
      }

      console.log('Final data:', data);

      if (!Array.isArray(data) || data.length === 0) {
        setError('Tidak ada kamar tersedia untuk tanggal dan tipe ini.');
        setLoading(false);
        return;
      }

      const result = data.find(
        (item: any) => item.type && item.type.toLowerCase() === form.type.toLowerCase()
      );

      if (!result) {
        setError(`Tipe kamar "${form.type}" tidak ditemukan dalam hasil.`);
        setLoading(false);
        return;
      }

      if (result.available_rooms < form.total_rooms) {
        setError(
          result.available_rooms === 0
            ? `Maaf, semua kamar ${form.type} sudah terbooking.`
            : `Hanya tersedia ${result.available_rooms} kamar, Anda meminta ${form.total_rooms}.`
        );
        setLoading(false);
        return;
      }

      setAvailability(result);
    } catch (err: any) {
      console.error('Error cek availability:', err);
      setError(err.message || 'Gagal memeriksa ketersediaan');
    } finally {
      setLoading(false);
    }
  };

  // === BOOKING ===
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        room_type: form.type.toLowerCase(),
        total_rooms: form.total_rooms,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        check_in: form.check_in,
        check_out: form.check_out,
        guests: form.guests,
        notes: form.notes.trim(),
      };

      const res = await api.post('/public/guest-bookings', payload);

      if (res.whatsapp_url) {
        window.open(res.whatsapp_url, '_blank');
      }

      alert('Booking berhasil! Silakan konfirmasi pembayaran via WhatsApp.');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan booking');
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

  const nights = calculateNights(form.check_in, form.check_out);
  const totalPrice = nights * (availability?.price_per_night || 0) * form.total_rooms;

  return (
    <>
      <Header />
      
      {/* Hero Section dengan Background Gambar Kamar */}
      <div 
        className="relative h-96 w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${getBackgroundImage()}')` }}
      >
        {/* Overlay gelap untuk kontras teks */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        {/* Konten di atas gambar */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
            Pesan Kamar Hotel
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl">
            Nikmati pengalaman menginap yang tak terlupakan dengan kenyamanan terbaik
          </p>
          
          {/* Room Type Indicator */}
          {form.type && (
            <div className="mt-4 px-6 py-3 bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-400/30">
              <p className="text-amber-300 font-semibold capitalize text-lg">
                {form.type} Room
              </p>
            </div>
          )}
        </div>

        {/* Gradient transition ke konten berikutnya */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-200 p-6 -mt-16 relative z-20">
        <div className="max-w-4xl mx-auto pt-16">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-xl text-center font-medium backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* === FORM UTAMA === */}
          <form onSubmit={handleCheck} className="bg-gray-900/90 backdrop-blur-md p-8 rounded-2xl border border-amber-700 shadow-2xl shadow-amber-500/10 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-amber-400 mb-2">Check In</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-gray-800 border border-amber-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={form.check_in}
                  onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-amber-400 mb-2">Check Out</label>
                <input
                  type="date"
                  required
                  min={form.check_in || new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-gray-800 border border-amber-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={form.check_out}
                  onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-amber-400 mb-2">Tipe Kamar</label>
                <select
                  required
                  className="w-full p-3 bg-gray-800 border border-amber-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="" className="text-gray-500">Pilih Tipe Kamar</option>
                  <option value="superior" className="text-gray-200">Superior</option>
                  <option value="deluxe" className="text-gray-200">Deluxe</option>
                  <option value="executive" className="text-gray-200">Executive</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-amber-400 mb-2">Jumlah Kamar</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={form.total_rooms}
                  onChange={(e) => setForm({ ...form, total_rooms: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full p-3 bg-gray-800 border border-amber-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* ESTIMASI HARGA */}
            {nights > 0 && form.type && (
              <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-6 rounded-xl border border-amber-700 backdrop-blur-sm">
                <h3 className="font-bold text-amber-400 mb-3 text-lg">Estimasi Biaya</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Jumlah Malam</p>
                    <p className="font-bold text-amber-300">{nights} malam</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Harga per Malam</p>
                    <p className="font-bold text-emerald-400">
                      {availability ? formatRupiah(availability.price_per_night) : 'Memeriksa...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Jumlah Kamar</p>
                    <p className="font-bold text-amber-300">{form.total_rooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Estimasi</p>
                    <p className="font-bold text-2xl text-emerald-400">
                      {availability ? formatRupiah(totalPrice) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-4 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-amber-500/30 transform hover:scale-105 duration-300"
            >
              {loading ? 'Memeriksa Ketersediaan...' : 'Cek Ketersediaan'}
            </button>
          </form>

          {/* === HASIL CEK & FORM BOOKING === */}
          {availability && (
            <form onSubmit={handleBook} className="mt-8 bg-gray-900/90 backdrop-blur-md p-8 rounded-2xl border border-emerald-700 shadow-2xl shadow-emerald-500/10 space-y-6">
              <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 p-6 rounded-xl border border-emerald-700 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold capitalize text-emerald-400">
                  {availability.type}
                </p>
                <p className="text-emerald-300 font-semibold text-lg">
                  {availability.available_rooms} kamar tersedia
                </p>
                <p className="text-sm text-gray-400">
                  {formatRupiah(availability.price_per_night)} / malam
                </p>
                <p className="mt-2 text-lg font-bold text-emerald-300">
                  Total: {formatRupiah(totalPrice)}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-emerald-400 mb-2">Jumlah Tamu</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full p-3 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-400 mb-2">Nama Lengkap</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-400 mb-2">No. HP (WhatsApp)</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="628123456789"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-400 mb-2">Email (opsional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-emerald-400 mb-2">Catatan (opsional)</label>
                <textarea
                  placeholder="Catatan khusus untuk hotel..."
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-emerald-600 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setAvailability(null);
                    setError(null);
                  }}
                  className="flex-1 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-700 border border-gray-600 hover:border-gray-500 transition-all duration-300"
                >
                  Ubah Pencarian
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 duration-300 transition-all"
                >
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