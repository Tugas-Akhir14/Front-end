"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type RoomType = {
  id: number;
  type: "superior" | "deluxe" | "executive";
  price: number;
  description?: string;
};

export default function RoomCreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Form state
  const [number, setNumber] = useState("");
  const [roomTypeId, setRoomTypeId] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("1");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // Token
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const raw =
      sessionStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      null;
    const cleaned = raw ? raw.replace(/^"+|"+$/g, "") : null;
    setToken(cleaned);
  }, []);

  // Ambil daftar room types
  useEffect(() => {
    async function fetchRoomTypes() {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/room-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil tipe kamar");
        const json = await res.json();
        setRoomTypes(json.data || []);
        if (json.data?.length > 0) {
          setRoomTypeId(String(json.data[0].id));
        }
      } catch (err: any) {
        setError("Gagal memuat tipe kamar: " + err.message);
      } finally {
        setLoadingTypes(false);
      }
    }
    fetchRoomTypes();
  }, [token]);

  function validate(): string | null {
    if (!number.trim()) return "Nomor kamar wajib diisi.";
    if (!roomTypeId) return "Tipe kamar wajib dipilih.";
    const capacityNum = Number(capacity);
    if (!capacity || Number.isNaN(capacityNum) || capacityNum <= 0)
      return "Kapasitas harus berupa angka > 0.";
    return null;
  }

  function onImageChange(file: File | null) {
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!token) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      setSubmitting(true);

      const form = new FormData();
      // SESUAI DENGAN form:"..." di backend
      form.append("number", number.trim());
      form.append("room_type_id", roomTypeId);
      form.append("capacity", String(Math.trunc(Number(capacity))));
      form.append("description", description.trim());
      if (image) {
        form.append("image", image, image.name);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // JANGAN SET Content-Type → FormData otomatis set boundary
        },
        body: form,
      });

      if (!res.ok) {
        const data = await safeJson(res);
        const msg =
          data?.error ||
          data?.message ||
          `Gagal membuat kamar (status ${res.status}).`;
        throw new Error(msg);
      }

      router.push("/admin/hotel/room");
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingTypes) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-amber-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-amber-100 rounded"></div>
            <div className="h-10 bg-amber-100 rounded"></div>
            <div className="h-10 bg-amber-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl border border-yellow-200">
        <h1 className="text-2xl font-bold bg-black bg-clip-text text-transparent mb-6">
          Tambah Kamar Baru
        </h1>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 p-4 shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {!token && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 p-4">
            <p>Token tidak ditemukan. Pastikan sudah login.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nomor Kamar
            </label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full rounded-xl border border-yellow-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipe Kamar
            </label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className="w-full rounded-xl border border-yellow-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.type.charAt(0).toUpperCase() + rt.type.slice(1)} — {rupiah(rt.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kapasitas (orang)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded-xl border border-yellow-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deskripsi (opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-yellow-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              placeholder="Kamar luas dengan pemandangan taman..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Gambar (opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:from-amber-600 hover:file:to-yellow-700"
            />
            {preview && (
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Pratinjau:</p>
                <img
                  src={preview}
                  alt="preview"
                  className="h-40 w-full rounded-xl object-cover border-2 border-amber-200 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || loadingTypes}
              className="px-6 py-3 rounded-xl bg-gray-100 text-black font-bold shadow-md hover:from-amber-600 hover:to-yellow-700 disabled:opacity-60 flex items-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Kamar"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function rupiah(n: number) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `Rp ${n}`;
  }
}