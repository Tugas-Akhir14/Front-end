// src/app/admin/hotel/booking/manual/page.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';

type Source = 'onsite' | 'traveloka' | 'agoda' | 'tiket.com';

export default function ManualBookingPage() {
  const [roomType, setRoomType] = useState<'superior' | 'deluxe' | 'executive'>('superior');
  const [rooms, setRooms] = useState<number>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState<number>(1);
  const [notes, setNotes] = useState('');

  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);

  const [source, setSource] = useState<Source>('onsite');
  const [otaReference, setOtaReference] = useState('');
  const [initialStatus, setInitialStatus] = useState<'pending' | 'confirmed' | 'checked_in'>('pending');

  const [loading, setLoading] = useState(false);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi dasar
    if (!checkIn || !checkOut) {
      Swal.fire('Error', 'Tanggal check-in dan check-out harus diisi', 'error');
      return;
    }

    if (checkOut <= checkIn) {
      Swal.fire('Error', 'Tanggal check-out harus setelah check-in', 'error');
      return;
    }

    if (name.trim() === '') {
      Swal.fire('Error', 'Nama tamu harus diisi', 'error');
      return;
    }

    setLoading(true);

    const token = sessionStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'Token tidak ditemukan. Silakan login ulang.', 'error');
      setLoading(false);
      return;
    }

    // Payload yang bersih — tidak ada null, hanya kirim field yang perlu
    const payload: any = {
      room_type: roomType,
      rooms: Number(rooms),
      name: name.trim(),
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      guests: Number(guests),
      source: source,
    };

    // Tambahkan field opsional hanya jika ada isi
    if (phone.trim()) payload.phone = phone.trim();
    if (email.trim()) payload.email = email.trim();
    if (notes.trim()) payload.notes = notes.trim();
    if (source !== 'onsite' && otaReference.trim()) payload.ota_reference = otaReference.trim();
    if (initialStatus !== 'pending') payload.status = initialStatus;

    console.log('Mengirim payload:', payload);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Response dari backend:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pemesanan manual');
      }

      // SUKSES → SweetAlert cantik
      Swal.fire({
        icon: 'success',
        title: 'Pemesanan Berhasil!',
        html: `
          <p>Pemesanan manual telah dibuat.</p>
          <strong>ID Booking: ${data.data?.booking_ids?.join(', ') || 'N/A'}</strong>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981',
      });

      // Reset form setelah sukses
      setName('');
      setPhone('');
      setEmail('');
      setGuests(1);
      setNotes('');
      setCheckIn(undefined);
      setCheckOut(undefined);
      setOtaReference('');
      setInitialStatus('pending');
      setRooms(1);
      setRoomType('superior');

    } catch (err: any) {
      console.error('Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Membuat Pemesanan',
        text: err.message || 'Terjadi kesalahan saat menghubungi server',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const isOTA = source !== 'onsite';

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Buat Pemesanan Manual</CardTitle>
          <CardDescription>
            Tambah pemesanan langsung (walk-in / on-site atau dari OTA seperti Traveloka, Agoda, Tiket.com)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipe Kamar & Jumlah Kamar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_type">Tipe Kamar</Label>
                <Select value={roomType} onValueChange={(v) => setRoomType(v as any)}>
                  <SelectTrigger id="room_type">
                    <SelectValue placeholder="Pilih tipe kamar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superior">Superior</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Jumlah Kamar</Label>
                <Input
                  id="rooms"
                  type="number"
                  min="1"
                  value={rooms}
                  onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>

            {/* Nama Tamu */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Tamu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap tamu"
                required
              />
            </div>

            {/* Kontak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">No. WhatsApp (opsional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="6281234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            {/* Tanggal Menginap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-in <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !checkIn && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, 'PPP') : 'Pilih tanggal check-in'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Check-out <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !checkOut && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, 'PPP') : 'Pilih tanggal check-out'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        (checkIn ? date <= checkIn : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Jumlah Malam & Tamu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah Malam</Label>
                <Input value={calculateNights()} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Jumlah Tamu</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max={rooms * 4}
                  value={guests}
                  onChange={(e) =>
                    setGuests(Math.max(1, Math.min(rooms * 4, parseInt(e.target.value) || 1)))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Maksimal {rooms * 4} tamu ({rooms} kamar × 4 orang)
                </p>
              </div>
            </div>

            {/* Sumber Pemesanan */}
            <div className="space-y-2">
              <Label htmlFor="source">Sumber Pemesanan</Label>
              <Select value={source} onValueChange={(v) => setSource(v as Source)}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Pilih sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">On-site (Walk-in)</SelectItem>
                  <SelectItem value="traveloka">Traveloka</SelectItem>
                  <SelectItem value="agoda">Agoda</SelectItem>
                  <SelectItem value="tiket.com">Tiket.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* OTA Reference */}
            {isOTA && (
              <div className="space-y-2">
                <Label htmlFor="ota_reference">No. Referensi OTA (opsional)</Label>
                <Input
                  id="ota_reference"
                  value={otaReference}
                  onChange={(e) => setOtaReference(e.target.value)}
                  placeholder="Contoh: TVK123456789 atau AGD-987654"
                />
              </div>
            )}

            {/* Status Awal */}
            <div className="space-y-2">
              <Label htmlFor="status">Status Awal Pemesanan</Label>
              <Select value={initialStatus} onValueChange={(v) => setInitialStatus(v as any)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending (default)</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <textarea
                id="notes"
                className="w-full min-h-32 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan, misalnya: sudah bayar DP, request late check-out, dll."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={loading} size="lg" className="min-w-48">
                {loading ? 'Membuat Pemesanan...' : 'Buat Pemesanan Manual'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}