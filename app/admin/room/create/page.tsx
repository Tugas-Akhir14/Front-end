"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type RoomType = "superior" | "deluxe" | "executive";

export default function RoomCreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [number, setNumber] = useState("");
  const [type, setType] = useState<RoomType>("superior");
  const [price, setPrice] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("1");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // Token: samain dengan halaman list (sessionStorage["token"])
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const raw =
      sessionStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      null;
    // bersihkan kutip tak berguna
    const cleaned = raw ? raw.replace(/^"+|"+$/g, "") : null;
    setToken(cleaned);
  }, []);

  function validate(): string | null {
    if (!number.trim()) return "Nomor kamar wajib diisi.";
    if (!type) return "Tipe kamar wajib dipilih.";
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0)
      return "Harga harus berupa angka > 0.";
    const capacityNum = Number(capacity);
    if (!capacity || Number.isNaN(capacityNum) || capacityNum <= 0)
      return "Kapasitas harus berupa angka > 0.";
    return null;
  }

  function onImageChange(file: File | null) {
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
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

      // FormData untuk multipart/form-data
      const form = new FormData();
      form.append("number", number.trim());
      form.append("type", type);
      form.append("price", String(Math.trunc(Number(price))));     // pastikan integer
      form.append("capacity", String(Math.trunc(Number(capacity))));// pastikan integer
      form.append("description", description || "");
      if (image) form.append("image", image, image.name);

      const res = await fetch("http://localhost:8080/api/rooms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // JANGAN set Content-Type di sini
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

      // sukses: balik ke list
      router.push("/admin/room");
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan tak bernama.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Tambah Kamar</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {!token && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800">
          Token tidak ditemukan. Pastikan sudah login dan token tersimpan di{" "}
          <span className="font-mono">sessionStorage["token"]</span> atau{" "}
          <span className="font-mono">localStorage</span>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm">Nomor Kamar</label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full rounded-md border p-2 outline-none"
            placeholder="Contoh: 101"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Tipe</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as RoomType)}
            className="w-full rounded-md border p-2"
          >
            <option value="superior">Superior</option>
            <option value="deluxe">Deluxe</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm">Harga</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1" // backend kamu integer, jangan 0.01
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border p-2 outline-none"
            placeholder="Contoh: 750000"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Kapasitas</label>
          <input
            type="number"
            min="1"
            step="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full rounded-md border p-2 outline-none"
            placeholder="Contoh: 2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border p-2 outline-none"
            rows={4}
            placeholder="Tulis deskripsi kamar..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Gambar (opsional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            className="w-full rounded-md border p-2"
          />
          {preview && (
            <div className="mt-3">
              <p className="text-sm mb-1">Pratinjau:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="preview"
                className="h-40 w-auto rounded-md border object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-4 py-2"
          >
            Batal
          </button>
        </div>
      </form>
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
