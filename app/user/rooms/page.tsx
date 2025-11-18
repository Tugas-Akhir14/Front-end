'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-amber-800 text-xl">Redirecting...</div>
      </div>
    );
  }

  const nights = calculateNights(form.check_in, form.check_out);
  const totalPrice = nights * (availability?.price_per_night || 0) * form.total_rooms;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Pesan Kamar Hotel
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-300 text-rose-700 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* FORM CEK KETERSEDIAAN */}
        <form onSubmit={handleCheck} className="bg-white p-8 rounded-2xl border border-amber-200 shadow-xl space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-amber-800 mb-2">Check In</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={form.check_in}
                onChange={(e) => setForm({ ...form, check_in: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-amber-800 mb-2">Check Out</label>
              <input
                type="date"
                required
                min={form.check_in || new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={form.check_out}
                onChange={(e) => setForm({ ...form, check_out: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-amber-800 mb-2">Tipe Kamar</label>
              <select
                required
                className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">Pilih Tipe Kamar</option>
                <option value="superior">Superior</option>
                <option value="deluxe">Deluxe</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-amber-800 mb-2">Jumlah Kamar</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={form.total_rooms}
                onChange={(e) => setForm({ ...form, total_rooms: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {nights > 0 && form.type && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-3">Estimasi Biaya</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-600">Malam</p><p className="font-bold">{nights}</p></div>
                <div><p className="text-gray-600">Harga/Malam</p><p className="font-bold text-emerald-700">{availability ? formatRupiah(availability.price_per_night) : '—'}</p></div>
                <div><p className="text-gray-600">Kamar</p><p className="font-bold">{form.total_rooms}</p></div>
                <div><p className="text-gray-600">Total</p><p className="font-bold text-2xl text-emerald-700">{availability ? formatRupiah(totalPrice) : '—'}</p></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-4 rounded-xl hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? 'Memeriksa Ketersediaan...' : 'Cek Ketersediaan'}
          </button>
        </form>

        {/* FORM BOOKING */}
        {availability && (
          <form onSubmit={handleBook} className="mt-8 bg-white p-8 rounded-2xl border border-emerald-200 shadow-xl space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200 text-center">
              <p className="text-2xl font-bold capitalize text-emerald-800">{availability.type}</p>
              <p className="text-emerald-600 font-semibold text-lg">{availability.available_rooms} kamar tersedia</p>
              <p className="text-sm text-gray-600">{formatRupiah(availability.price_per_night)} / malam</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">Total: {formatRupiah(totalPrice)}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">Jumlah Tamu</label>
                <input type="number" min="1" required value={form.guests} onChange={(e) => setForm({ ...form, guests: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">Nama Lengkap</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="John Doe" />
              </div>
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">No. HP (WhatsApp)</label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="628123456789" />
              </div>
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">Email (opsional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="email@contoh.com" />
              </div>
            </div>

            <textarea
              placeholder="Catatan (opsional)"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <div className="flex gap-4">
              <button type="button" onClick={() => { setAvailability(null); setError(null); }} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition">
                Ubah Pencarian
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-md">
                {loading ? 'Memproses...' : 'Pesan via WhatsApp'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}