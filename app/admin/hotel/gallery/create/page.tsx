'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'http://localhost:8080';

type Room = {
  id: number;
  number: string;
  type: string;
};

export default function AdminGalleryCreatePage() {
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // form state
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [roomId, setRoomId] = useState<string>(''); // optional
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // fetch rooms for dropdown (optional)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tokenRaw = sessionStorage.getItem('token');
        if (!tokenRaw) {
          setError('Token tidak ditemukan. Silakan login kembali.');
          return;
        }
        const token = tokenRaw.replace(/^"+|"+$/g, '');

        // ambil beberapa room untuk pilihan
        const res = await fetch(`${API_BASE}/api/rooms?limit=100&offset=0`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Gagal memuat kamar (status ${res.status})`);
        const payload = await res.json();
        if (mounted) {
          setRooms(payload.data || []);
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Gagal memuat data kamar.');
      } finally {
        if (mounted) setLoadingRooms(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // handle image selection + preview
  function onPickFile(f: File | null) {
    setImage(f);
    if (preview) URL.revokeObjectURL(preview);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!image) {
      setError('Gambar wajib diunggah.');
      return;
    }

    setSubmitting(true);
    try {
      const tokenRaw = sessionStorage.getItem('token');
      if (!tokenRaw) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        return;
      }
      const token = tokenRaw.replace(/^"+|"+$/g, '');

      const form = new FormData();
      form.append('image', image);
      form.append('title', title);
      form.append('caption', caption);
      if (roomId) form.append('room_id', roomId);

      const res = await fetch(`${API_BASE}/api/galleries`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        const msg = t?.error || `Gagal menyimpan galeri (status ${res.status})`;
        throw new Error(msg);
      }

      setSuccess('Berhasil menambahkan item galeri.');
      // redirect setelah sedikit jeda biar alert kebaca
      setTimeout(() => router.push('/admin/hotel/gallery'), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tambah Galeri</h1>
          <p className="text-sm text-zinc-600">Unggah gambar untuk galeri hotel. Room opsional.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Gambar <span className="text-red-500">*</span></label>
            <div className="flex items-start gap-4">
              <div className="h-32 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-zinc-500">Preview</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-zinc-200 file:bg-white file:px-3 file:py-2 file:text-sm file:shadow-sm hover:file:bg-zinc-50"
                />
                <p className="mt-1 text-xs text-zinc-500">Format: JPG, PNG, WEBP. Maks 10–15 MB tergantung servermu.</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Lobby Hotel Malam Hari"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium mb-1">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Deskripsi singkat gambar…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Optional Room */}
          <div>
            <label className="block text-sm font-medium mb-1">Kamar (opsional)</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={loadingRooms}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
            >
              <option value="">Tanpa keterkaitan kamar</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.number} · {r.type}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !image}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow disabled:opacity-60"
            >
              {submitting ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
