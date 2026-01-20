'use client';

import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Calendar, Users, DollarSign, BedDouble, AlertCircle, Search, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Availability {
  room_type: string;
  base_price: number;
  current_price: number;
  discount_percent: number;
  available_rooms: number;
  total_rooms: number;
  image?: string;
}

const ROOM_TYPES = ['superior', 'deluxe', 'executive'];

// Mapping path gambar lokal (harus ada di public/images/rooms/)
const ROOM_IMAGES: Record<string, string> = {
  superior: '/images/rooms/superior.jpg',
  deluxe: '/images/rooms/deluxe.jpg',
  executive: '/images/rooms/executive.jpg',
  // fallback jika tipe tidak dikenal
  default: '/images/rooms/placeholder.jpg',
};

// Fallback eksternal jika lokal gagal (Unsplash)
const FALLBACK_IMAGES: Record<string, string> = {
  superior: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  executive: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
  default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
};

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

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      toast.error('Tanggal check-out harus setelah check-in');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      toast.error('Check-in tidak boleh di masa lalu');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setAvailability([]);

    try {
      const params = new URLSearchParams();
      params.append('check_in', checkIn);
      params.append('check_out', checkOut);
      if (type) {
        params.append('type', type);
      }

      const res = await fetch(`http://localhost:8080/public/availability?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengambil data ketersediaan');
      }

      const results: Availability[] = (data.data || []).map((item: any) => {
        const roomTypeLower = item.room_type.toLowerCase();
        let imageUrl = ROOM_IMAGES[roomTypeLower] || ROOM_IMAGES.default;

        return {
          ...item,
          image: imageUrl,
        };
      });

      setAvailability(results);

      if (results.length === 0) {
        toast.error('Tidak ada kamar tersedia pada tanggal tersebut');
      } else {
        toast.success(`Ditemukan ${results.length} tipe kamar tersedia`);
      }
    } catch (err: any) {
      console.error('Availability error:', err);
      toast.error(err.message || 'Terjadi kesalahan jaringan. Coba lagi nanti.');
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const nights = checkIn && checkOut
    ? differenceInDays(new Date(checkOut), new Date(checkIn))
    : 0;

  const formatRupiah = (amount: number) => {
    if (!amount || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Cek Ketersediaan Kamar Hotel
          </h1>
          <p className="text-lg text-gray-600">
            Temukan kamar yang tersedia dan harga terbaik untuk tanggal menginap Anda
          </p>
        </div>

        {/* Form Pencarian */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <BedDouble className="w-5 h-5 mr-2 text-blue-600" />
                Tipe Kamar
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Semua Tipe Kamar</option>
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                    Memuat...
                  </span>
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
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <p className="text-blue-800 font-medium text-lg">
                Estimasi menginap: <span className="font-bold">{nights} malam</span>
              </p>
            </div>
          )}
        </div>

        {/* Hasil Pencarian */}
        {!hasSearched ? (
          <div className="bg-gray-100 rounded-2xl p-16 text-center text-gray-500 border border-dashed border-gray-300">
            <BedDouble className="w-20 h-20 mx-auto mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              Belum ada pencarian
            </h3>
            <p className="text-lg">
              Pilih tanggal check-in dan check-out untuk melihat ketersediaan kamar
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse h-96" />
            ))}
          </div>
        ) : availability.length === 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-16 text-center">
            <AlertCircle className="w-20 h-20 mx-auto mb-6 text-red-500" />
            <h3 className="text-2xl font-bold text-red-800 mb-4">
              Tidak Ada Kamar Tersedia
            </h3>
            <p className="text-lg text-red-700 max-w-2xl mx-auto">
              Maaf, semua kamar sudah terbooking untuk tanggal yang Anda pilih. 
              Coba tanggal lain atau hubungi kami untuk info lebih lanjut.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availability.map((item) => {
              const isFull = item.available_rooms === 0;
              const isLimited = item.available_rooms > 0 && item.available_rooms < Math.floor(item.total_rooms * 0.5);
              const hasDiscount = item.discount_percent > 0;
              const savings = item.base_price - item.current_price;

              // Gunakan gambar lokal, fallback ke Unsplash jika gagal
              const imageSrc = item.image || ROOM_IMAGES[item.room_type.toLowerCase()] || ROOM_IMAGES.default;
              const fallbackSrc = FALLBACK_IMAGES[item.room_type.toLowerCase()] || FALLBACK_IMAGES.default;

              return (
                <div
                  key={item.room_type}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                    isFull
                      ? 'border-red-400'
                      : isLimited
                      ? 'border-yellow-400'
                      : 'border-green-400'
                  }`}
                >
                  {/* Gambar Kamar */}
                  <div className="relative h-56 bg-gray-200">
                    <Image
                      src={imageSrc}
                      alt={`${item.room_type} room`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                      onError={(e) => {
                        // Ganti ke fallback Unsplash jika lokal gagal
                        (e.target as HTMLImageElement).src = fallbackSrc;
                        console.warn(`Gambar lokal gagal: ${imageSrc} → menggunakan fallback`);
                      }}
                    />

                    {/* Badge Status */}
                    <div className="absolute top-4 right-4">
                      {isFull ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-600 text-white text-sm font-bold shadow-md">
                          FULL BOOKED
                        </span>
                      ) : isLimited ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500 text-white text-sm font-bold shadow-md">
                          TERBATAS
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-600 text-white text-sm font-bold shadow-md">
                          TERSEDIA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Konten */}
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 capitalize">
                        {item.room_type}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.available_rooms} dari {item.total_rooms} kamar tersedia
                      </p>
                    </div>

                    {/* Harga */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-600">Harga per malam</span>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-blue-700">
                            {formatRupiah(item.current_price)}
                          </span>
                          {hasDiscount && (
                            <span className="block text-sm text-green-600 font-medium">
                              Hemat {formatRupiah(savings)} ({item.discount_percent}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {nights > 0 && (
                        <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                          <span className="text-gray-600">Total estimasi ({nights} malam)</span>
                          <span className="text-2xl font-bold text-gray-900">
                            {formatRupiah(item.current_price * nights)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info Tambahan */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span>Max 4 tamu per kamar (2 include breakfast)</span>
                      </div>
                    </div>

                    {/* Tombol Pesan */}
                    {!isFull && (
                      <button
                        onClick={() => {
                          toast.success(`Memulai pemesanan ${item.room_type}`);
                          // Bisa redirect ke halaman booking dengan query params
                          // router.push(`/booking?type=${item.room_type}&checkIn=${checkIn}&checkOut=${checkOut}`)
                        }}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md"
                      >
                        Pesan Sekarang
                      </button>
                    )}
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