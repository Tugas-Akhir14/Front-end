"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_BASE = "http://localhost:8080";

type StatusType = "draft" | "published";

export default function AdminNewsCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<StatusType>("draft");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // validasi minimal
    if (!title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }
    if (!content.trim()) {
      setError("Konten wajib diisi.");
      return;
    }

    const tokenRaw = sessionStorage.getItem("token");
    const token = tokenRaw ? tokenRaw.replace(/^"+|"+$/g, "") : null;
    if (!token) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", content.trim());
      fd.append("status", status);
      if (image) fd.append("image", image); // nama field harus "image" sesuai handler

      const res = await fetch(`${BACKEND_BASE}/api/news`, {
        method: "POST",
        headers: {
          // JANGAN set "Content-Type". Biarkan browser isi boundary otomatis.
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const msg =
          typeof payload?.error === "string"
            ? payload.error
            : `Gagal membuat berita. Status ${res.status}`;
        throw new Error(msg);
      }

      // sukses: kembali ke daftar
      router.push("/admin/news");
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat membuat berita.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Tambah Berita</h1>
          <Link
            href="/admin/news"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            ← Kembali
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Tulis judul berita…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Konten</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Isi berita di sini…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
                className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <p className="text-xs text-zinc-500 mt-1">
                Jika memilih Published, tanggal publikasi akan diisi otomatis oleh backend.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cover (opsional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm hover:file:bg-zinc-50"
              />
              {preview && (
                <div className="mt-2 h-28 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                  {/* preview lokal */}
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
