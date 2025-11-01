// app/pending/page.tsx
'use client';
export default function Pending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-yellow-600">Menunggu Persetujuan</h1>
        <p className="mt-4 text-gray-600">Akun Anda sedang menunggu approval dari Superadmin.</p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="mt-6 px-6 py-2 bg-black text-white rounded-lg"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}