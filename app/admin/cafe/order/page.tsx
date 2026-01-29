'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, ArrowLeft, Search, CreditCard, Ban } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Swal from 'sweetalert2';
import Link from 'next/link';
import axios from 'axios';
import Image from "next/image";


// === AXIOS INSTANCE DENGAN TOKEN ===
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')?.replace(/^"+|"+$/g, '');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number; 
  price: number;
  product: {
    nama: string;
    gambar: string;
  };
}

interface Order {
  id: number;
  customer_name: string;
  total_price: number;
  status: 'pending' | 'processing' | 'paid' | 'done' | 'cancelled';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export default function CafeOrderAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setOrders(data.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(
    (order) =>
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)  
  );

  // Confirm Payment
  const handleConfirmPayment = async (order: Order) => {
    const result = await Swal.fire({
      title: `Konfirmasi Pembayaran #${order.id}?`,
      text: `Setelah konfirmasi, status akan menjadi "paid".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Konfirmasi!',
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

    const toastId = toast.loading('Memproses konfirmasi...');

    try {
      await api.patch(`/api/orders/${order.id}/confirm-payment`);
      toast.success('Pembayaran berhasil dikonfirmasi!', { id: toastId });
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengonfirmasi pembayaran', { id: toastId });
    }
  };

  // Cancel Order
  const handleCancelOrder = async (order: Order) => {
    const result = await Swal.fire({
      title: `Batalkan Pesanan #${order.id}?`,
      text: 'Tindakan ini tidak dapat dibatalkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Batalkan!',
      cancelButtonText: 'Tidak',
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

    const toastId = toast.loading('Membatalkan pesanan...');

    try {
      await api.patch(`/api/orders/${order.id}/cancel`);
      toast.success('Pesanan berhasil dibatalkan!', { id: toastId });
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal membatalkan pesanan', { id: toastId });
    }
  };

  // Open Detail Modal
  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      done: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      {/* SweetAlert Style */}
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

      <div className="min-h-screen bg-white p-6">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/admin/cafe"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Dashboard Cafe</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pesanan Cafe</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama customer atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Table Pesanan */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Memuat pesanan...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Tidak ada pesanan ditemukan</div>
          ) : (
            <table className="w-full">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-amber-800">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-amber-800">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-amber-800">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-amber-800">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-amber-800">Waktu</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-amber-800">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/50 transition">
                    <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                    <td className="px-6 py-4 text-sm">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm font-medium">Rp {order.total_price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => openDetailModal(order)}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {order.status !== 'paid' && order.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => handleConfirmPayment(order)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CreditCard className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Modal */}
        {isDetailModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detail Pesanan #{selectedOrder.id}</h2>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-amber-600">Rp {selectedOrder.total_price.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Waktu Pesan</p>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Item Pesanan</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}${item.product.gambar}`}
                      alt={item.product.nama}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.nama}</p>
                      <p className="text-sm text-gray-600">
                        x {item.quantity} @ Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-bold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}