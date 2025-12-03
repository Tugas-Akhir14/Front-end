'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  CheckCircle2, XCircle, Calendar, User, Phone, Hotel, DollarSign,
  Clock, RefreshCw, Edit3, Users, Home, MessageSquare, AlertCircle
} from 'lucide-react';

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
  rooms: number;           // jumlah kamar yang dipesan
  total_nights: number;
  total_price: number;
  extra_guests: number;
  extra_charge: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
  notes: string | null;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Dialog update status
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
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
        rooms: b.rooms,
        total_nights: b.total_nights,
        total_price: b.total_price,
        extra_guests: b.extra_guests || 0,
        extra_charge: b.extra_charge || 0,
        status: b.status,
        notes: b.notes,
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
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup',
        confirmButton: action === 'confirm' ? 'swal-confirm' : 'swal-cancel',
        cancelButton: 'swal-cancel',
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading(`Sedang ${actionText} booking #${id}...`);

    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/${action}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error('Gagal update status');

      toast.success(`Booking #${id} berhasil di${actionText}!`, { id: toastId });
      fetchBookings();
    } catch (err: any) {
      toast.error('Gagal memproses aksi', { id: toastId });
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

      if (!res.ok) throw new Error('Gagal mengubah status');

      toast.success(`Status berhasil diubah menjadi "${newStatus}"!`, { id: toastId });
      setOpenDialog(false);
      setNewStatus('');
      setSelectedBookingId(null);
      fetchBookings();
    } catch (err: any) {
      toast.error('Gagal mengubah status', { id: toastId });
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
    const map: Record<string, { text: string; className: string }> = {
      pending: { text: 'Menunggu', className: 'bg-yellow-100 text-amber-800' },
      confirmed: { text: 'Dikonfirmasi', className: 'bg-emerald-100 text-emerald-800' },
      cancelled: { text: 'Dibatalkan', className: 'bg-rose-100 text-rose-800' },
      checked_in: { text: 'Check-in', className: 'bg-blue-100 text-blue-800' },
      checked_out: { text: 'Check-out', className: 'bg-gray-100 text-gray-800' },
    };
    const item = map[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={`${item.className} font-medium`}>{item.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-amber-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-xl text-gray-700 font-medium">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <style jsx global>{`
        .swal-popup { border-radius: 1rem !important; }
        .swal-confirm {
          background: linear-gradient(to right, #f59e0b, #d97706) !important;
          color: white !important;
          padding: 0.75rem 2rem !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
        }
        .swal-cancel {
          background-color: #6b7280 !important;
          color: white !important;
          padding: 0.75rem 2rem !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-2xl border border-yellow-200/60 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-yellow-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                    <Hotel className="w-9 h-9 text-amber-600" />
                    Manajemen Booking Kamar
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2 text-base">
                    Kelola semua pemesanan secara real-time • Total: {bookings.length} booking
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                    <SelectTrigger className="w-48 border-yellow-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      <SelectItem value="checked_in">Check-in</SelectItem>
                      <SelectItem value="checked_out">Check-out</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={fetchBookings}
                    disabled={refreshing}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-24 text-gray-500">
                  <Hotel className="w-20 h-20 mx-auto mb-4 text-yellow-200" />
                  <p className="text-xl font-medium">Tidak ada booking ditemukan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50">
                        <TableHead className="font-bold">ID</TableHead>
                        <TableHead className="font-bold">Pelanggan</TableHead>
                        <TableHead className="font-bold">Kamar & Tipe</TableHead>
                        <TableHead className="font-bold">Tanggal Menginap</TableHead>
                        <TableHead className="font-bold">Detail</TableHead>
                        <TableHead className="text-right font-bold">Total Bayar</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="text-center font-bold">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((b) => (
                        <TableRow key={b.id} className="hover:bg-amber-50/60 transition-colors">
                          <TableCell className="font-mono font-bold text-amber-700">#{b.id}</TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 font-semibold">
                                <User className="w-4 h-4 text-amber-600" />
                                {b.name}  
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                {b.phone}
                              </div>
                              {b.email && <div className="text-xs text-gray-500">{b.email}</div>}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="font-medium">{b.room_type}</div>
                            <div className="text-sm text-gray-600">Kamar No. {b.room_number}</div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(b.check_in), 'dd MMM yyyy', { locale: localeId })}
                              </div>
                              <div className="flex items-center gap-2 text-rose-700">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(b.check_out), 'dd MMM yyyy', { locale: localeId })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {b.total_nights} malam
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-amber-600" />
                                <span>{b.guests} tamu</span>
                                {b.rooms > 1 && <Badge variant="outline" className="ml-2">{b.rooms} kamar</Badge>}
                              </div>
                              {b.extra_guests > 0 && (
                                <div className="flex items-center gap-2 text-orange-600">
                                  <AlertCircle className="w-4 h-4" />
                                  +{b.extra_guests} tamu tambahan (+Rp {b.extra_charge.toLocaleString('id-ID')})
                                </div>
                              )}
                              {b.notes && (
                                <div className="flex items-start gap-2 text-gray-600 mt-2 text-xs">
                                  <MessageSquare className="w-4 h-4 mt-0.5" />
                                  <span className="italic">"{b.notes}"</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="font-bold text-xl text-emerald-700">
                              Rp {b.total_price.toLocaleString('id-ID')}
                            </div>
                          </TableCell>

                          <TableCell>{getStatusBadge(b.status)}</TableCell>

                          <TableCell>
                            <div className="flex justify-center gap-2">
                              {b.status === 'pending' && (
                                <>
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction(b.id, 'confirm')}>
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleAction(b.id, 'cancel')}>
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {b.status !== 'checked_out' && (
                                <Button size="sm" variant="outline" onClick={() => openUpdateDialog(b.id, b.status)}>
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

              <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-yellow-200 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Auto-refresh setiap 10 detik
                </div>
                <div className="font-semibold text-gray-800">
                  Menampilkan <span className="text-amber-700">{filteredBookings.length}</span> dari {bookings.length} booking
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog Ubah Status */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ubah Status Booking #{selectedBookingId}</DialogTitle>
              <DialogDescription>Pilih status baru untuk booking ini</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status baru" />
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
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Batal</Button>
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