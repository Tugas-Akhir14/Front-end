'use client';

import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Calendar, Users, DollarSign, BedDouble, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Availability {
  room_type: string;
  price_per_night: number;
  available_rooms: number;
  total_rooms: number;
}

const ROOM_TYPES = ['superior', 'deluxe', 'executive'];

export default function HotelAvailabilityPage() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [type, setType] = useState<string>(''); // '' = semua tipe
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleCheckAvailability = async () => {
    if (!checkIn || !checkOut) {
      toast.error('Silakan pilih tanggal check-in dan check-out');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error('Tanggal check-out harus setelah check-in');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Token tidak ditemukan. Silakan login ulang.');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('check_in', checkIn);
      params.append('check_out', checkOut);
      if (type) {
        params.append('type', type);
      }

      // PERBAIKAN UTAMA: Endpoint langsung ke backend, bukan /api proxy
      const res = await fetch(`http://localhost:8080/api/availability?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend mengembalikan { error: "..." } saat gagal
        throw new Error(data.error || 'Gagal mengambil data ketersediaan');
      }

      const results: Availability[] = data.data || [];

      setAvailability(results);

      if (results.length === 0) {
        toast.error('Tidak ada kamar tersedia pada tanggal tersebut');
      } else {
        toast.success(`Ditemukan ${results.length} tipe kamar tersedia`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan jaringan');
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const nights = checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
    ? differenceInDays(new Date(checkOut), new Date(checkIn))
    : 0;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Cek Ketersediaan Kamar
          </h1>
          <p className="text-gray-600">
            Pantau ketersediaan kamar untuk pemesanan manual, OTA, atau walk-in
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BedDouble className="inline w-4 h-4 mr-1" />
                Tipe Kamar (Opsional)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Tipe</option>
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCheckAvailability}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <>Memuat...</>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Cek Ketersediaan
                  </>
                )}
              </button>
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-blue-800 font-medium">
                Lama menginap: <span className="font-bold">{nights} malam</span>
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {!hasSearched ? (
          <div className="bg-gray-100 rounded-xl p-20 text-center text-gray-500">
            <BedDouble className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Pilih tanggal untuk melihat ketersediaan kamar</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-72" />
            ))}
          </div>
        ) : availability.length === 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              Tidak Ada Kamar Tersedia
            </h3>
            <p className="text-red-700">
              Semua kamar sudah terbooking pada tanggal yang dipilih.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availability.map((item) => {
              const isFull = item.available_rooms === 0;
              const isLimited = item.available_rooms > 0 && item.available_rooms < item.total_rooms * 0.5;

              return (
                <div
                  key={item.room_type}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-4 transition-all hover:shadow-2xl ${
                    isFull
                      ? 'border-red-400'
                      : isLimited
                      ? 'border-yellow-400'
                      : 'border-green-400'
                  }`}
                >
                  <div
                    className={`p-8 text-white text-center ${
                      isFull
                        ? 'bg-red-600'
                        : isLimited
                        ? 'bg-yellow-600'
                        : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                    }`}
                  >
                    <h3 className="text-2xl font-bold">{item.room_type}</h3>
                    <p className="text-lg mt-2 opacity-90">
                      {item.available_rooms} / {item.total_rooms} kamar tersedia
                    </p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Harga per malam</span>
                      <span className="text-3xl font-bold text-gray-900">
                        {formatRupiah(item.price_per_night)}
                      </span>
                    </div>

                    {nights > 0 && (
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-gray-600">Estimasi ({nights} malam)</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatRupiah(item.price_per_night * nights)}
                        </span>
                      </div>
                    )}

                    <div className="text-center pt-4">
                      <Users className="w-6 h-6 inline text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        Max 4 tamu/kamar (2 include breakfast)
                      </span>
                    </div>

                    <div className="text-center pt-4">
                      {isFull ? (
                        <span className="inline-flex items-center px-6 py-3 rounded-full bg-red-100 text-red-800 text-lg font-bold">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          FULL BOOKED
                        </span>
                      ) : isLimited ? (
                        <span className="inline-flex items-center px-6 py-3 rounded-full bg-yellow-100 text-yellow-800 font-bold">
                          Terbatas
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-6 py-3 rounded-full bg-green-100 text-green-800 font-bold">
                          Tersedia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}