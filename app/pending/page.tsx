// app/pending/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Clock } from 'lucide-react';

export default function PendingApproval() {
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/auth/signin';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="bg-yellow-100 rounded-full w-24 h-24 mx-auto flex items-center justify-center animate-pulse">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menunggu Persetujuan</h1>
          <p className="mt-3 text-gray-600">
            Akun Anda telah berhasil terdaftar. Mohon tunggu persetujuan dari <strong>Superadmin</strong>.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Anda akan menerima notifikasi setelah akun disetujui.
          </p>
        </div>
        <Button onClick={handleLogout} variant="outline" size="lg" className="gap-2">
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}