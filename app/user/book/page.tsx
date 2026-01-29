// app/user/book/page.tsx
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Sparkles, AlertCircle, Calendar, CreditCard } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

async function getRoom(id: string) {
  try {
    const res = await fetch(`${API_BASE}/public/rooms`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const rooms = json.data || [];
    return rooms.find((r: any) => r.id === parseInt(id));
  } catch {
    return null;
  }
}

const toTitle = (t: string) => {
  switch (t?.toLowerCase()) {
    case 'superior': return 'Superior Room';
    case 'deluxe': return 'Deluxe Room';
    case 'executive': return 'Executive Suite';
    default: return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Room';
  }
};

export default async function UserBookPage({ searchParams }: { searchParams: { room?: string } }) {
  const roomId = searchParams.room;

  if (!roomId) notFound();

  const room = await getRoom(roomId);

  if (!room || room.status !== 'available') {
    return (
      <>
        <Header />
        <main className="min-h-screen py-20 bg-gradient-to-br from-white via-rose-50 to-white">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-rose-100">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-rose-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Kamar Tidak Tersedia</h1>
              <p className="text-lg text-gray-600 mb-8">
                Maaf, kamar yang Anda pilih sedang tidak tersedia untuk pemesanan saat ini.
              </p>
              <a
                href="/rooms"
                className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
              >
                Lihat Kamar Lainnya
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-16 bg-gradient-to-br from-white via-amber-50 to-white">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-100 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Form Pemesanan Kamar
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Isi data di bawah ini dengan lengkap, lalu lanjutkan ke WhatsApp untuk konfirmasi pemesanan
            </p>
            <div className="mt-6 h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </div>

          {/* Room Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">
                  Kamar Terpilih
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {toTitle(room.type)} • No. {room.number}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Harga per malam</p>
                <p className="text-2xl font-bold text-amber-600">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(room.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Detail Pemesanan</h2>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8">
              <BookingForm
                roomId={room.id}
                roomNumber={room.number}
                roomType={toTitle(room.type)}
                pricePerNight={room.price}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <CreditCard className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Informasi Pembayaran</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Setelah mengisi formulir, Anda akan diarahkan ke WhatsApp untuk konfirmasi pemesanan. 
                  Tim kami akan membantu Anda menyelesaikan proses pembayaran dan memberikan informasi lebih lanjut.
                </p>
              </div>
            </div>
          </div>

          {/* Steps Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-amber-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Isi Formulir</h4>
              <p className="text-sm text-gray-600">Lengkapi data pemesanan Anda</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-amber-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Konfirmasi WhatsApp</h4>
              <p className="text-sm text-gray-600">Hubungi kami melalui WhatsApp</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-amber-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Selesai</h4>
              <p className="text-sm text-gray-600">Dapatkan konfirmasi pemesanan</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}