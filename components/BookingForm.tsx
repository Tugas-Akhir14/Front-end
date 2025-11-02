// components/BookingForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Users, Phone, Mail, User, MessageSquare } from 'lucide-react';

interface BookingFormProps {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
}

export default function BookingForm({ roomId, roomNumber, roomType, pricePerNight }: BookingFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', check_in: '', check_out: '', guests: 1, notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TAMBAHKAN LOG UNTUK DEBUG
    console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

    try {
      const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/public/bookings`;
      console.log('Request to:', API_URL);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          name: form.name,
          phone: form.phone,
          email: form.email,
          check_in: form.check_in,
          check_out: form.check_out,
          guests: form.guests,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal membuat booking');

      // BUKA WHATSAPP
      setTimeout(() => {
        window.open(data.data.whatsapp_url, '_blank', 'noopener,noreferrer');
      }, 0);

      toast({
        title: 'Booking Berhasil!',
        description: 'Silakan konfirmasi via WhatsApp.',
      });

    } catch (err: any) {
      console.error('Booking error:', err);
      toast({
        title: 'Gagal',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Informasi Kamar</h3>
        <p className="text-sm">
          <strong>{roomType}</strong> • No. {roomNumber}
        </p>
        <p className="text-sm text-green-600 font-medium">
          Rp {pricePerNight.toLocaleString('id-ID')}/malam
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Nama Lengkap
          </Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> No. WhatsApp
          </Label>
          <Input
            id="phone"
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="6281234567890"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email (opsional)
        </Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="john@example.com"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="check_in" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Check-in
          </Label>
          <Input
            id="check_in"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={form.check_in}
            onChange={(e) => setForm({ ...form, check_in: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="check_out" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Check-out
          </Label>
          <Input
            id="check_out"
            type="date"
            required
            min={form.check_in || new Date().toISOString().split('T')[0]}
            value={form.check_out}
            onChange={(e) => setForm({ ...form, check_out: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="guests" className="flex items-center gap-2">
          <Users className="w-4 h-4" /> Jumlah Tamu
        </Label>
        <Input
          id="guests"
          type="number"
          min="1"
          max="10"
          value={form.guests}
          onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) || 1 })}
        />
      </div>

      <div>
        <Label htmlFor="notes" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Catatan (opsional)
        </Label>
        <Textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Contoh: Saya ingin kamar dengan view laut..."
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengirim ke WhatsApp...
          </>
        ) : (
          <>
            Lanjut ke WhatsApp
          </>
        )}
      </Button>
    </form>
  );
}