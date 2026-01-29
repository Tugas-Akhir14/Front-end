'use client';

import React from 'react';

interface BookingFormProps {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
  roomId,
  roomNumber,
  roomType,
  pricePerNight,
}) => {
  return (
    <div>
      <h2>Booking Kamar {roomNumber}</h2>
      <p>Tipe: {roomType}</p>
      <p>Harga per malam: {pricePerNight}</p>
    </div>
  );
};

export default BookingForm;


// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/hooks/use-toast';
// import { Loader2, Calendar, Users, Phone, Mail, User, MessageSquare, LogIn } from 'lucide-react';

// interface BookingFormProps {
//   roomId: number;
//   roomNumber: string;
//   roomType: string;
//   pricePerNight: number;
// }

// export default function BookingForm({ roomId, roomNumber, roomType, pricePerNight }: BookingFormProps) {
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     check_in: '',
//     check_out: '',
//     guests: 2,
//     notes: '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const token = typeof window !== 'undefined' ? sessionStorage.getItem('token')?.replace(/^"+|"+$/g, '') : null;

//     if (!token) {
//       toast({
//         title: 'Login Diperlukan',
//         description: 'Silakan login terlebih dahulu.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     if (form.guests > 4) {
//       toast({
//         title: "Batas Tamu",
//         description: "Maksimal 4 tamu per kamar",
//         variant: "destructive",
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       let phone = form.phone.replace(/[^\d]/g, '');
//       if (phone.startsWith('0')) phone = '62' + phone.slice(1);
//       if (!phone.startsWith('62')) phone = '62' + phone;

//       const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}/public/bookings`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           room_id: roomId,
//           name: form.name.trim(),
//           phone: phone,
//           email: form.email.trim() || null,
//           check_in: form.check_in,
//           check_out: form.check_out,
//           guests: form.guests,
//           notes: form.notes.trim() || null,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Gagal booking');
//       }

//       window.open(data.data.whatsapp_url, '_blank', 'noopener,noreferrer');

//       toast({
//         title: 'Booking Berhasil!',
//         description: 'Pesan WhatsApp telah dibuka.',
//       });

//       setForm({ name: '', phone: '', email: '', check_in: '', check_out: '', guests: 2, notes: '' });
//     } catch (err: any) {
//       toast({
//         title: 'Gagal',
//         description: err.message,
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 p-6 rounded-xl">
//         <h3 className="font-bold text-xl mb-3 text-amber-900">Kamar Dipilih</h3>
//         <p className="text-lg"><strong className="text-amber-800">{roomType}</strong> • No. {roomNumber}</p>
//         <p className="text-xl font-bold text-amber-700 mt-2">Rp {pricePerNight.toLocaleString('id-ID')}/malam</p>
//       </div>

//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
//         <LogIn className="w-5 h-5 text-blue-600 mt-0.5" />
//         <div>
//           <p className="font-medium text-blue-900">Login diperlukan</p>
//           <p className="text-sm text-blue-700">Pastikan sudah login sebelum booking.</p>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 gap-4">
//         <div>
//           <Label className="flex items-center gap-2 mb-2">
//             <User className="w-4 h-4 text-amber-600" /> Nama Lengkap
//           </Label>
//           <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
//         </div>
//         <div>
//           <Label className="flex items-center gap-2 mb-2">
//             <Phone className="w-4 h-4 text-amber-600" /> No. WhatsApp
//           </Label>
//           <Input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
//             placeholder="6281234567890" pattern="62[0-9]{9,13}" title="Harus diawali 62" />
//           <p className="text-xs text-gray-500 mt-1">Contoh: 6281234567890</p>
//         </div>
//       </div>

//       <div>
//         <Label className="flex items-center gap-2 mb-2">
//           <Mail className="w-4 h-4 text-amber-600" /> Email (opsional)
//         </Label>
//         <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" />
//       </div>

//       <div className="grid md:grid-cols-2 gap-4">
//         <div>
//           <Label className="flex items-center gap-2 mb-2">
//             <Calendar className="w-4 h-4 text-amber-600" /> Check-in
//           </Label>
//           <Input required type="date" min={new Date().toISOString().split('T')[0]} value={form.check_in}
//             onChange={e => setForm({ ...form, check_in: e.target.value })} />
//         </div>
//         <div>
//           <Label className="flex items-center gap-2 mb-2">
//             <Calendar className="w-4 h-4 text-amber-600" /> Check-out
//           </Label>
//           <Input required type="date" min={form.check_in || new Date().toISOString().split('T')[0]} value={form.check_out}
//             onChange={e => setForm({ ...form, check_out: e.target.value })} />
//         </div>
//       </div>

//       <div>
//         <Label className="flex items-center gap-2 mb-2">
//           <Users className="w-4 h-4 text-amber-600" /> Jumlah Tamu (maks 4)
//         </Label>
//         <Input required type="number" min="1" max="4" value={form.guests}
//           onChange={(e) => {
//             const val = parseInt(e.target.value) || 1;
//             if (val > 4) {
//               toast({ title: "Batas Tamu", description: "Maksimal 4 orang per kamar", variant: "destructive" });
//               return;
//             }
//             setForm({ ...form, guests: val });
//           }} />
//         <p className="text-xs text-gray-600 mt-2">2 tamu termasuk • Tamu ke-3 & ke-4 +Rp150.000/org/malam</p>
//       </div>

//       <div>
//         <Label className="flex items-center gap-2 mb-2">
//           <MessageSquare className="w-4 h-4 text-amber-600" /> Catatan (opsional)
//         </Label>
//         <Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
//           placeholder="Minta extra bed, view laut, dll..." />
//       </div>

//       <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6 rounded-xl" size="lg" disabled={loading}>
//         {loading ? (
//           <>
//             <Loader2 className="mr-3 h-5 w-5 animate-spin" />
//             Mengirim ke WhatsApp...
//           </>
//         ) : (
//           'Lanjut ke WhatsApp'
//         )}
//       </Button>
//     </form>
//   );
// }