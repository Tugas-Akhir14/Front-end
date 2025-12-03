// app/unauthorized/page.tsx

"use client"; // ← Tambahkan ini!

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">403</h1>
        <p className="text-xl mt-4">Akses Ditolak</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}