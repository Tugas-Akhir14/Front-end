'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// === AXIOS + TOKEN + AUTO-UNWRAP { data: ... } ===
const api = axios.create({ baseURL: 'http://localhost:8080' });

api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('token');
  if (raw) {
    const token = raw.replace(/^"+|"+$/g, "");
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// PERBAIKAN: Otomatis unwrap { data: [...] } → langsung array
api.interceptors.response.use(
  (res) => {
    const payload = res.data;
    if (payload && typeof payload === 'object' && 'data' in payload && !Array.isArray(payload)) {
      return payload.data; // ← UNWRAP!
    }
    return payload;
  },
  (err) => Promise.reject(new Error(err.response?.data?.error || err.message))
);

// === AUTH ===
const useAuth = () => {
  if (typeof window === 'undefined') return { user: null };
  const user = sessionStorage.getItem('user');
  return { user: user ? JSON.parse(user) : null };
};

// === FORMAT & HITUNG ===
const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const calculateNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24));
  return Math.max(1, diff);
};

const isValidDateRange = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return false;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inDate >= today && outDate > inDate;
};

export default function RoomBookingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/signin');
  }, [user, router]);

  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any | null>(null);
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

  // === CEK KETERSEDIAAN ===
  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAvailability(null);

    // Validasi tanggal
    if (!isValidDateRange(form.check_in, form.check_out)) {
      setError('Check-in harus hari ini atau setelahnya, dan check-out harus setelah check-in.');
      setLoading(false);
      return;
    }

    // Validasi tipe
    if (!form.type) {
      setError('Pilih tipe kamar terlebih dahulu.');
      setLoading(false);
      return;
    }

    // Validasi jumlah kamar
    if (form.total_rooms < 1) {
      setError('Jumlah kamar minimal 1.');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('check_in', form.check_in);
      params.append('check_out', form.check_out);
      params.append('type', form.type.toLowerCase());

      console.log('REQUEST:', `/public/availability?${params.toString()}`);

      const data = await api.get(`/public/availability?${params.toString()}`); // ← LANGSUNG ARRAY

      console.log('RECEIVED DATA:', data);

      // HARUS ARRAY
      if (!Array.isArray(data)) {
        console.error('NOT ARRAY:', typeof data, data);
        setError('Respons server tidak valid (bukan array).');
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        setError('Tidak ada kamar tersedia untuk tanggal dan tipe ini.');
        setLoading(false);
        return;
      }

      // CARI TIPE YANG COCOK
      const result = data.find((item: any) =>
        item.type && item.type.toLowerCase() === form.type.toLowerCase()
      );

      if (!result) {
        setError(`Tipe kamar "${form.type}" tidak ditemukan.`);
        setLoading(false);
        return;
      }

      if (result.available_rooms === 0) {
        setError(`Maaf, semua kamar tipe ${form.type} sudah dipesan.`);
        setLoading(false);
        return;
      }

      if (result.available_rooms < form.total_rooms) {
        setError(`Hanya ${result.available_rooms} kamar tersedia. Anda meminta ${form.total_rooms}.`);
        setLoading(false);
        return;
      }

      setAvailability(result);
    } catch (err: any) {
      console.error('ERROR:', err);
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

      console.log('BOOKING PAYLOAD:', payload);

      const res = await api.post('/public/guest-bookings', payload);

      console.log('BOOKING RESPONSE:', res);

      const waUrl = res.whatsapp_url;
      if (waUrl) {
        window.open(waUrl, '_blank');
      }

      alert('Booking berhasil! Silakan konfirmasi via WhatsApp.');
      router.push('/');
    } catch (err: any) {
      console.error('BOOKING ERROR:', err);
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
  const pricePerNight = availability?.price_per_night || 0;
  const estimatedTotal = nights * pricePerNight * form.total_rooms;

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

        {/* === FORM UTAMA === */}
        <form onSubmit={handleCheck} className="bg-white p-8 rounded-2xl border border-amber-200 shadow-xl space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-amber-800 mb-2">Check In</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={form.check_out}
                onChange={(e) => setForm({ ...form, check_out: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-amber-800 mb-2">Tipe Kamar</label>
              <select
                required
                className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* ESTIMASI HARGA */}
          {nights > 0 && form.type && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-3">Estimasi Biaya</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Jumlah Malam</p>
                  <p className="font-bold">{nights} malam</p>
                </div>
                <div>
                  <p className="text-gray-600">Harga per Malam</p>
                  <p className="font-bold text-emerald-700">
                    {availability ? formatRupiah(pricePerNight) : 'Memeriksa...'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Jumlah Kamar</p>
                  <p className="font-bold">{form.total_rooms}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Estimasi</p>
                  <p className="font-bold text-2xl text-emerald-700">
                    {availability ? formatRupiah(estimatedTotal) : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-4 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all disabled:opacity-50 shadow-md"
          >
            {loading ? 'Memeriksa Ketersediaan...' : 'Cek Ketersediaan'}
          </button>
        </form>

        {/* === HASIL CEK & FORM BOOKING === */}
        {availability && (
          <form onSubmit={handleBook} className="mt-8 bg-white p-8 rounded-2xl border border-emerald-200 shadow-xl space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200 text-center">
              <p className="text-2xl font-bold capitalize text-emerald-800">
                {availability.type}
              </p>
              <p className="text-emerald-600 font-semibold text-lg">
                {availability.available_rooms} kamar tersedia
              </p>
              <p className="text-sm text-gray-600">
                {formatRupiah(availability.price_per_night)} / malam
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-700">
                Total: {formatRupiah(nights * availability.price_per_night * form.total_rooms)}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">Jumlah Tamu</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">Nama Lengkap</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">No. HP (WhatsApp)</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="628123456789"
                />
              </div>
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">Email (opsional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            <textarea
              placeholder="Catatan (opsional)"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setAvailability(null);
                  setError(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
              >
                Ubah Pencarian
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 shadow-md transition-all"
              >
                {loading ? 'Memproses...' : 'Pesan via WhatsApp'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}