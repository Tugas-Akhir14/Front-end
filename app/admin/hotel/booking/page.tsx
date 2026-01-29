'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, Calendar, User, Phone, Hotel,
  Clock, RefreshCw, Edit3, Users, MessageSquare,
  PlusCircle, Globe, Store, Ticket, Filter,
  Search, AlertCircle, X
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

/* =====================
   UTIL TOKEN
===================== */
function getToken(): string | null {
  const raw = sessionStorage.getItem('token');
  return raw ? raw.replace(/^"+|"+$/g, '') : null;
}

/* =====================
   INTERFACE
===================== */
interface Booking {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  room_number: string;
  room_type: string;
  check_in: string;
  check_out: string;
  rooms: number;
  total_nights: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
  notes: string | null;
  created_at: string;
  source: 'web' | 'onsite' | 'traveloka' | 'agoda' | 'tiket.com';
  ota_reference?: string | null;
}

interface FilterState {
  status: 'all' | Booking['status'];
  roomType: string;
  source: string;
  search: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State untuk filter
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    roomType: 'all',
    source: 'all',
    search: ''
  });

  // State untuk daftar filter unik
  const [availableRoomTypes, setAvailableRoomTypes] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').toLowerCase().trim();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  });

  /* =====================
     FETCH DATA
  ===================== */
  const fetchBookings = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: getAuthHeaders()
      });
      const json = await res.json();

      const mapped: Booking[] = (json.data?.data || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        phone: b.phone || '-',
        email: b.email || null,
        room_number: b.room?.number || '-',
        room_type: b.room?.room_type?.type
          ? b.room.room_type.type.charAt(0).toUpperCase() +
            b.room.room_type.type.slice(1)
          : '-',
        check_in: b.check_in,
        check_out: b.check_out,
        rooms: b.rooms || 1,
        total_nights: b.total_nights || 0,
        total_price: b.total_price || 0,
        status: b.status,
        notes: b.notes || null,
        created_at: b.created_at,
        source: b.source || 'web',
        ota_reference: b.ota_reference || null
      }));

      setBookings(mapped);
      
      // Ekstrak daftar tipe kamar dan sumber yang unik
      const uniqueRoomTypes = Array.from(
  new Set(mapped.map(b => b.room_type))
).filter(Boolean);

const uniqueSources = Array.from(
  new Set(mapped.map(b => b.source))
).filter(Boolean);

      
      setAvailableRoomTypes(uniqueRoomTypes);
      setAvailableSources(uniqueSources);
    } catch {
      toast.error('Gagal memuat data booking');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const i = setInterval(fetchBookings, 10000);
    return () => clearInterval(i);
  }, []);

  /* =====================
     FILTER LOGIC
  ===================== */
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Filter status
      const matchStatus = filters.status === 'all' || b.status === filters.status;
      
      // Filter tipe kamar
      const matchRoomType = filters.roomType === 'all' || b.room_type === filters.roomType;
      
      // Filter sumber
      const matchSource = filters.source === 'all' || b.source === filters.source;
      
      // Filter pencarian
      const matchSearch =
        !filters.search ||
        String(b.id).includes(filters.search) ||
        b.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.phone.includes(filters.search) ||
        b.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.room_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.room_type.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.ota_reference?.toLowerCase().includes(filters.search.toLowerCase());

      return matchStatus && matchRoomType && matchSource && matchSearch;
    });
  }, [bookings, filters]);

  /* =====================
     HANDLE FILTER CHANGES
  ===================== */
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      roomType: 'all',
      source: 'all',
      search: ''
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.roomType !== 'all') count++;
    if (filters.source !== 'all') count++;
    if (filters.search !== '') count++;
    return count;
  };

  /* =====================
     ACTION
  ===================== */
  const handleAction = async (id: number, action: 'confirm' | 'cancel') => {
    const toastId = toast.loading('Memproses...');
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/${action}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error();
      toast.success('Berhasil', { id: toastId });
      fetchBookings();
    } catch {
      toast.error('Gagal memproses', { id: toastId });
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const map: any = {
      pending: ['Menunggu', 'bg-yellow-100 text-amber-800 border-yellow-300'],
      confirmed: ['Dikonfirmasi', 'bg-emerald-100 text-emerald-800 border-emerald-300'],
      cancelled: ['Dibatalkan', 'bg-rose-100 text-rose-800 border-rose-300'],
      checked_in: ['Check-in', 'bg-blue-100 text-blue-800 border-blue-300'],
      checked_out: ['Check-out', 'bg-gray-100 text-gray-800 border-gray-300'],
    };
    const [text, cls] = map[status];
    return <Badge variant="outline" className={`${cls} font-medium`}>{text}</Badge>;
  };

  const getSourceBadge = (source: string, ref?: string | null) => {
    const map: any = {
      web: ['Website', <Globe className="w-3 h-3" />, 'bg-blue-50 text-blue-700 border-blue-200'],
      onsite: ['On-site', <Store className="w-3 h-3" />, 'bg-purple-50 text-purple-700 border-purple-200'],
      traveloka: ['Traveloka', <Ticket className="w-3 h-3" />, 'bg-orange-50 text-orange-700 border-orange-200'],
      agoda: ['Agoda', <Ticket className="w-3 h-3" />, 'bg-red-50 text-red-700 border-red-200'],
      'tiket.com': ['Tiket.com', <Ticket className="w-3 h-3" />, 'bg-green-50 text-green-700 border-green-200'],
    };
    const [text, icon, badgeClass] = map[source] || [source, <Globe className="w-3 h-3" />, 'bg-gray-50 text-gray-700'];
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className={`flex items-center gap-1 ${badgeClass}`}>
          {icon}
          {text}
        </Badge>
        {ref && <span className="text-xs text-gray-500 font-mono truncate max-w-[120px]">Ref: {ref}</span>}
      </div>
    );
  };

  const openUpdateDialog = (id: number, currentStatus: string) => {
    setSelectedBookingId(id);
    setNewStatus(currentStatus);
    setOpenDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedBookingId || !newStatus) return;
    const toastId = toast.loading('Mengupdate status...');
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${selectedBookingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      toast.success('Status berhasil diupdate', { id: toastId });
      setOpenDialog(false);
      fetchBookings();
    } catch {
      toast.error('Gagal mengupdate status', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-10 h-10 animate-spin text-amber-600" />
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
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/admin/hotel/booking/manual">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                      <PlusCircle className="w-5 h-5 mr-2" />
                      Tambah Manual
                    </Button>
                  </Link>
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

            {/* Filter Section */}
            <CardContent className="p-6 border-b border-yellow-200 bg-gradient-to-r from-amber-50/50 to-yellow-50/50">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Filter Booking</h3>
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {getActiveFilterCount()} aktif
                      </Badge>
                    )}
                  </div>
                  {getActiveFilterCount() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hapus Filter
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Cari Booking
                    </label>
                    <Input
                      placeholder="Cari ID, nama, telepon, atau kamar..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="border-yellow-300 focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger className="border-yellow-300">
                        <SelectValue placeholder="Pilih status" />
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
                  </div>

                  {/* Room Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tipe Kamar</label>
                    <Select
                      value={filters.roomType}
                      onValueChange={(value) => handleFilterChange('roomType', value)}
                    >
                      <SelectTrigger className="border-yellow-300">
                        <SelectValue placeholder="Pilih tipe kamar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe Kamar</SelectItem>
                        {availableRoomTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sumber Booking</label>
                    <Select
                      value={filters.source}
                      onValueChange={(value) => handleFilterChange('source', value)}
                    >
                      <SelectTrigger className="border-yellow-300">
                        <SelectValue placeholder="Pilih sumber" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Sumber</SelectItem>
                        {availableSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source === 'web' ? 'Website' : 
                             source === 'onsite' ? 'On-site' : 
                             source === 'traveloka' ? 'Traveloka' : 
                             source === 'agoda' ? 'Agoda' : 
                             source === 'tiket.com' ? 'Tiket.com' : source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {getActiveFilterCount() > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-yellow-200">
                    <span className="text-sm text-gray-600 font-medium">Filter aktif:</span>
                    {filters.status !== 'all' && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Status: {filters.status === 'pending' ? 'Menunggu' : 
                                 filters.status === 'confirmed' ? 'Dikonfirmasi' :
                                 filters.status === 'cancelled' ? 'Dibatalkan' :
                                 filters.status === 'checked_in' ? 'Check-in' : 'Check-out'}
                        <button
                          onClick={() => handleFilterChange('status', 'all')}
                          className="ml-2 hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.roomType !== 'all' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Kamar: {filters.roomType}
                        <button
                          onClick={() => handleFilterChange('roomType', 'all')}
                          className="ml-2 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.source !== 'all' && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Sumber: {filters.source === 'web' ? 'Website' : 
                                 filters.source === 'onsite' ? 'On-site' : 
                                 filters.source === 'traveloka' ? 'Traveloka' : 
                                 filters.source === 'agoda' ? 'Agoda' : 'Tiket.com'}
                        <button
                          onClick={() => handleFilterChange('source', 'all')}
                          className="ml-2 hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.search !== '' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Pencarian: "{filters.search}"
                        <button
                          onClick={() => handleFilterChange('search', '')}
                          className="ml-2 hover:text-green-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>

            <CardContent className="p-0">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-24 text-gray-500">
                  <Hotel className="w-20 h-20 mx-auto mb-4 text-yellow-200" />
                  <p className="text-xl font-medium">Tidak ada booking ditemukan</p>
                  {getActiveFilterCount() > 0 && (
                    <p className="text-gray-600 mt-2">
                      Coba ubah atau hapus beberapa filter
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50">
                        <TableHead className="font-bold">ID</TableHead>
                        <TableHead className="font-bold">Pelanggan</TableHead>
                        <TableHead className="font-bold">Sumber</TableHead>
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
                            {getSourceBadge(b.source, b.ota_reference)}
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
                                <span>{b.rooms} kamar</span>
                              </div>
                              {b.notes && (
                                <div className="flex items-start gap-2 text-gray-600 mt-2 text-xs">
                                  <MessageSquare className="w-4 h-4 mt-0.5" />
                                  <span className="italic line-clamp-2">"{b.notes}"</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="font-bold text-xl text-emerald-700">
                              Rp {b.total_price.toLocaleString('id-ID')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {b.rooms} kamar × {b.total_nights} malam
                            </div>
                          </TableCell>

                          <TableCell>{getStatusBadge(b.status)}</TableCell>

                          <TableCell>
                            <div className="flex justify-center gap-2">
                              {b.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-emerald-600 hover:bg-emerald-700" 
                                    onClick={() => handleAction(b.id, 'confirm')}
                                    title="Konfirmasi"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => handleAction(b.id, 'cancel')}
                                    title="Batalkan"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {b.status !== 'checked_out' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => openUpdateDialog(b.id, b.status)}
                                  title="Ubah Status"
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

              <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-yellow-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Auto-refresh setiap 10 detik
                </div>
                <div className="font-semibold text-gray-800 text-center">
                  Menampilkan <span className="text-amber-700">{filteredBookings.length}</span> dari {bookings.length} booking
                  {getActiveFilterCount() > 0 && (
                    <span className="text-gray-600 text-sm font-normal block mt-1">
                      (difilter berdasarkan {getActiveFilterCount()} kriteria)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    {filters.status === 'all' ? 'Semua Status' : 
                     filters.status === 'pending' ? 'Menunggu' :
                     filters.status === 'confirmed' ? 'Dikonfirmasi' :
                     filters.status === 'cancelled' ? 'Dibatalkan' :
                     filters.status === 'checked_in' ? 'Check-in' : 'Check-out'}
                  </Badge>
                  {filters.roomType !== 'all' && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {filters.roomType}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog Ubah Status */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="border-amber-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                Ubah Status Booking #{selectedBookingId}
              </DialogTitle>
              <DialogDescription>
                Pilih status baru untuk booking ini. Perubahan ini akan mempengaruhi ketersediaan kamar.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="border-amber-300">
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
              <Button 
                variant="outline" 
                onClick={() => setOpenDialog(false)}
                className="border-gray-300"
              >
                Batal
              </Button>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={!newStatus}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}