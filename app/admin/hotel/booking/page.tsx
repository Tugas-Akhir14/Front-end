'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster, toast } from 'sonner';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Calendar, User, Phone, Hotel, DollarSign, Clock, RefreshCw, Edit3 } from 'lucide-react';

function getToken(): string | null {
  const raw = sessionStorage.getItem('token');
  return raw ? raw.replace(/^"+|"+$/g, '') : null;
}

interface Booking {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  room_number: string;
  room_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

export default function AdminBookingPage() {
  const { toast: shadcnToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Dialog update status
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const getAuthHeaders = () => {
    const token = getToken();
    return token
      ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  };

  const fetchBookings = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Sesi telah berakhir. Silakan login kembali.');
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      const rawBookings = json.data?.data || [];

      const mappedBookings: Booking[] = rawBookings.map((b: any) => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        email: b.email,
        room_number: b.room.number,
        room_type: b.room.room_type.type.charAt(0).toUpperCase() + b.room.room_type.type.slice(1),
        check_in: b.check_in,
        check_out: b.check_out,
        guests: b.guests,
        total_price: b.total_price,
        status: b.status,
        created_at: b.created_at,
      }));

      setBookings(mappedBookings);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data booking');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: number, action: 'confirm' | 'cancel') => {
    const actionText = action === 'confirm' ? 'konfirmasi' : 'batalkan';
    const result = await Swal.fire({
      title: `Yakin ingin ${actionText} booking ini?`,
      text: `Booking #${id} akan di${actionText}. Tindakan ini tidak dapat dibatalkan!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Ya, ${actionText}!`,
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup',
        confirmButton: action === 'confirm' ? 'swal-confirm' : 'swal-cancel',
        cancelButton: 'swal-cancel',
        actions: 'swal-actions',
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading(`Sedang memproses ${actionText} booking #${id}...`);

    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/${action}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal update status');
      }

      toast.success(`Booking #${id} berhasil di${actionText}!`, { id: toastId });
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses aksi', { id: toastId });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedBookingId || !newStatus) return;

    const result = await Swal.fire({
      title: 'Ubah Status Booking?',
      text: `Status akan diubah menjadi "${newStatus}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Ubah!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel',
        actions: 'swal-actions',
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading('Menyimpan perubahan status...');

    try {
      const res = await fetch(`${API_BASE}/api/bookings/${selectedBookingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal mengubah status');
      }

      toast.success(`Status berhasil diubah menjadi "${newStatus}"!`, { id: toastId });
      setOpenDialog(false);
      setNewStatus('');
      setSelectedBookingId(null);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status', { id: toastId });
    }
  };

  const openUpdateDialog = (id: number, currentStatus: string) => {
    setSelectedBookingId(id);
    setNewStatus(currentStatus);
    setOpenDialog(true);
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-amber-800 hover:bg-yellow-200 font-medium">Menunggu</Badge>;
      case 'confirmed':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-medium">Dikonfirmasi</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 font-medium">Dibatalkan</Badge>;
      case 'checked_in':
        return <Badge className="bg-blue-100 text-blue-800 font-medium">Check-in</Badge>;
      case 'checked_out':
        return <Badge className="bg-gray-100 text-gray-800 font-medium">Check-out</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-amber-50">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-gray-700 font-medium">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sonner Toaster */}
      <Toaster position="top-right" richColors closeButton />

      {/* SweetAlert2 Custom Style (sama persis seperti halaman News) */}
      <style jsx global>{`
        .swal-popup { border-radius: 1rem !important; }
        .swal-actions { gap: 1rem !important; justify-content: center !important; padding: 0 1.5rem !important; }
        .swal-cancel {
          min-width: 120px !important;
          padding: 0.75rem 1.5rem !important;
          background-color: #6b7280 !important;
          color: white !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3) !important;
        }
        .swal-cancel:hover { background-color: #4b5563 !important; }
        .swal-confirm {
          min-width: 140px !important;
          padding: 0.75rem 1.5rem !important;
          background: linear-gradient(to right, #ef4444, #dc2626) !important;
          color: white !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4) !important;
        }
        .swal-confirm:hover { background: linear-gradient(to right, #dc2626, #b91c1c) !important; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border border-yellow-200/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-b border-yellow-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
                    <Hotel className="w-7 h-7 text-amber-600" />
                    Manajemen Booking
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Kelola semua pemesanan kamar hotel secara real-time
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                    <SelectTrigger className="w-40 border-yellow-300 focus:ring-yellow-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchBookings}
                    disabled={refreshing}
                    className="border-yellow-300 text-amber-700 hover:bg-yellow-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Hotel className="w-16 h-16 mx-auto mb-4 text-yellow-200" />
                  <p className="text-lg font-medium">Tidak ada booking ditemukan.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-yellow-50 to-amber-50">
                        <TableHead className="font-bold text-gray-800">ID</TableHead>
                        <TableHead className="font-bold text-gray-800">Pelanggan</TableHead>
                        <TableHead className="font-bold text-gray-800">Kamar</TableHead>
                        <TableHead className="font-bold text-gray-800">Tanggal</TableHead>
                        <TableHead className="text-right font-bold text-gray-800">Total</TableHead>
                        <TableHead className="font-bold text-gray-800">Status</TableHead>
                        <TableHead className="text-center font-bold text-gray-800">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id} className="hover:bg-yellow-50/50 transition-colors border-b border-yellow-100">
                          <TableCell className="font-mono text-sm text-amber-700 font-semibold">#{booking.id}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 font-medium text-gray-800">
                                <User className="w-3.5 h-3.5 text-amber-600" />
                                {booking.name}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="w-3.5 h-3.5 text-amber-600" />
                                {booking.phone}
                              </div>
                              {booking.email && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {booking.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-800">{booking.room_type}</div>
                              <div className="text-sm text-gray-600">No. {booking.room_number}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1 text-emerald-700">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(booking.check_in), 'dd MMM yyyy')}
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(booking.check_out), 'dd MMM yyyy')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.guests} tamu
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-semibold text-emerald-700 flex items-center justify-end gap-1">
                              <DollarSign className="w-4 h-4" />
                              {booking.total_price.toLocaleString('id-ID')}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              {booking.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black shadow-md"
                                    onClick={() => handleAction(booking.id, 'confirm')}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="bg-rose-500 hover:bg-rose-600"
                                    onClick={() => handleAction(booking.id, 'cancel')}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}

                              {booking.status !== 'checked_out' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-400 text-blue-700 hover:bg-blue-50"
                                  onClick={() => openUpdateDialog(booking.id, booking.status)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-t border-yellow-200 flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Auto-refresh setiap 10 detik
                </div>
                <div className="font-semibold">
                  Total: <span className="text-amber-700">{filteredBookings.length}</span> booking
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog Update Status */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ubah Status Booking</DialogTitle>
              <DialogDescription>
                Pilih status baru untuk booking #{selectedBookingId}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  <SelectItem value="checked_in">Check-in</SelectItem>
                  <SelectItem value="checked_out">Check-out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateStatus} disabled={!newStatus}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}