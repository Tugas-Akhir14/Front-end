// app/admin/pending/page.tsx

'use client';

import { useAuth } from '@/app/admin/layout'; // penting: import dari layout langsung
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, UserCheck } from 'lucide-react';

interface PendingAdmin {
  id: number;
  full_name: string;
  role: string;
  time: string;
}

export default function PendingAdminsPage() {
  const { user, authFetch } = useAuth();
  const [admins, setAdmins] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Polling pending admins
  useEffect(() => {
    if (user?.role !== 'superadmin') return;

    const fetchPendingAdmins = async () => {
      try {
        const res = await authFetch('/api/pending-admins');
        if (res?.ok) {
          const { data } = await res.json();
          const now = new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          });

          const formatted = data
            .filter((a: any) => !a.is_approved)
            .map((a: any) => ({
              id: a.id,
              full_name: a.full_name || 'Tanpa Nama',
              role: a.role.replace('admin_', '').toUpperCase(),
              time: now,
            }));

          setAdmins(formatted);
        }
      } catch (err) {
        console.error('Error fetching pending admins:', err);
      } finally {
        setLoading(false);
      }
    };

    // Jalankan sekali saat mount
    fetchPendingAdmins();

    // Lalu setiap 10 detik
    const interval = setInterval(fetchPendingAdmins, 10_000);

    return () => clearInterval(interval);
  }, [user?.role, authFetch]);

  const handleApprove = async (id: number, fullName: string) => {
    if (!confirm(`Approve ${fullName} sebagai admin?`)) return;

    try {
      const res = await authFetch(`/api/admins/approve/${id}`, {
        method: 'PATCH',
      });

      if (res?.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== id));
        alert(`${fullName} berhasil di-approve!`);
      } else {
        const error = await res.json().catch(() => ({}));
        alert('Gagal approve: ' + (error.message || 'Server error'));
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  // Proteksi akses
  if (user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <UserCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="text-gray-600 mt-2">
            Hanya <strong>Superadmin</strong> yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/50 dark:from-slate-900 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3 justify-center md:justify-start">
            <UserCheck className="w-10 h-10 text-amber-600" />
            Pending Admin Approval
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Daftar admin baru yang menunggu persetujuan. Data otomatis diperbarui setiap 10 detik.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-amber-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Memuat data pending...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-16 text-center rounded-2xl">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Semua admin telah di-approve!
            </h2>
            <p className="text-gray-500 mt-2">
              Tidak ada permintaan persetujuan baru saat ini.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-amber-200 dark:border-amber-800/30"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {admin.full_name}
                      </h3>
                      <span className="inline-block mt-2 px-4 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-md">
                        ADMIN {admin.role}
                      </span>
                    </div>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <Clock className="w-4 h-4" />
                    Menunggu sejak <strong>{admin.time}</strong>
                  </div>

                  <Button
                    onClick={() => handleApprove(admin.id, admin.full_name)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Approve Admin Ini
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Polling otomatis aktif · Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
        </div>
      </div>
    </div>
  );
}