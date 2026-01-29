"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

// =====================
// AXIOS INSTANCE
// =====================
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem("token");
  if (raw) {
    const token = raw.replace(/^"+|"+$/g, "");
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// =====================
// Types sesuai output backend
// =====================
export type AdminProfile = {
  ID: number;
  full_name: string;
  email: string;
  phone_number?: string | null;
  password?: string; // hashed – JANGAN ditampilkan
  confirm_password?: string; // JANGAN ditampilkan
};

export type ProfileResponse = {
  data: AdminProfile;
  message?: string;
};

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-zinc-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 bg-zinc-200 rounded" />
          <div className="h-3 w-1/4 bg-zinc-200 rounded" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-zinc-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    const hasToken = !!sessionStorage.getItem("token");
    if (!hasToken) {
      setLoading(false);
      setError("Tidak ada token. Silakan login kembali.");
      return;
    }

    try {
      const res = await api.get<ProfileResponse>("/admins/profile");
      setProfile(res.data.data);
      if (res.data.message) setInfo(res.data.message);
    } catch (err: any) {
      const status = err?.response?.status;
      setError(status === 401 ? "Sesi berakhir/unauthorized. Silakan login kembali." : "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Profil Admin</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchProfile}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="font-semibold">Terjadi kesalahan</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </div>
        ) : profile ? (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold">
                  {initials(profile.full_name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-zinc-900 truncate">{profile.full_name}</h2>
                  <p className="text-sm text-zinc-500 truncate">Admin ID: {profile.ID}</p>
                </div>
              </div>

              {info && (
                <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 px-3 py-2 text-sm">
                  {info}
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Email</p>
                  <p className="text-zinc-900 break-all">{profile.email || "—"}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Nomor HP</p>
                  <p className="text-zinc-900">{profile.phone_number || "—"}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  disabled
                  title="Belum tersedia"
                  className="rounded-xl bg-black/80 text-white px-4 py-2 text-sm opacity-60 cursor-not-allowed"
                >
                  Edit Profil (segera)
                </button>
                <button
                  disabled
                  title="Belum tersedia"
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm opacity-60 cursor-not-allowed"
                >
                  Ganti Password (segera)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6">
            <p className="text-zinc-700">Profil tidak tersedia.</p>
          </div>
        )}
      </main>
    </div>
  );
}