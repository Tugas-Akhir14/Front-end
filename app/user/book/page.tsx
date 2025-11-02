// app/user/book/page.tsx
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

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
        <main className="min-h-screen py-20 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Kamar Tidak Tersedia</h1>
            <p className="text-gray-600">Maaf, kamar yang Anda pilih sedang tidak tersedia.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Form Pemesanan Kamar</h1>
            <p className="text-lg text-gray-600">Isi data di bawah ini, lalu lanjutkan ke WhatsApp</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <BookingForm
              roomId={room.id}
              roomNumber={room.number}
              roomType={toTitle(room.type)}
              pricePerNight={room.price}
              // HAPUS onSuccess → INI YANG BIKIN ERROR!
            />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Setelah mengisi form, Anda akan diarahkan ke WhatsApp untuk konfirmasi.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}