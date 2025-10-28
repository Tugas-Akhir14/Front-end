'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../layout';

export type Gallery = {
  id: number;
  title: string;
  caption: string;
  url: string;
  created_at: string;
  updated_at: string;
};

const API_BASE = 'http://localhost:8080';

function fileURL(path?: string | null) {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

function getToken(): string | null {
  const raw = sessionStorage.getItem('token');
  return raw ? raw.replace(/^"+|"+$/g, '') : null;
}

export default function AdminGalleryPage() {
  const { authFetch } = useAuth();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Gallery | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  async function loadData(p = page) {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        return;
      }
      const limit = pageSize;
      const offset = (p - 1) * pageSize;
      const res = await fetch(`${API_BASE}/api/galleries?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Gagal memuat galeri. Status ${res.status}`);
      const payload = await res.json();
      setGalleries(payload.data || []);
      setTotal(payload.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  function openEditModal(item: Gallery) {
    setEditing(item);
    setEditTitle(item.title || '');
    setEditCaption(item.caption || '');
    setEditImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setIsModalOpen(true);
    setNotice(null);
    setError(null);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditing(null);
    setEditImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSaving(false);
  }

  async function handleSave() {
    if (!editing) return;
    const token = getToken();
    if (!token) {
      setError('Token tidak ditemukan. Silakan login kembali.');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      // 1) Update metadata (title/caption)
      const metaRes = await fetch(`${API_BASE}/api/galleries/${editing.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          caption: editCaption,
        }),
      });
      if (!metaRes.ok) {
        const t = await metaRes.json().catch(() => ({}));
        throw new Error(t?.error || `Gagal mengupdate metadata (status ${metaRes.status})`);
      }

      // 2) Jika ada file baru, update gambar
      if (editImage) {
        const form = new FormData();
        form.append('image', editImage);
        const imgRes = await fetch(`${API_BASE}/api/galleries/${editing.id}/image`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: form,
        });
        if (!imgRes.ok) {
          const t = await imgRes.json().catch(() => ({}));
          throw new Error(t?.error || `Gagal mengupdate gambar (status ${imgRes.status})`);
        }
      }

      setNotice('Perubahan tersimpan.');
      closeModal();
      // refresh list
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ya = confirm('Yakin hapus item galeri ini? Tindakan ini tidak bisa dibatalkan.');
    if (!ya) return;
    const token = getToken();
    if (!token) {
      setError('Token tidak ditemukan. Silakan login kembali.');
      return;
    }
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`${API_BASE}/api/galleries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `Gagal menghapus (status ${res.status})`);
      }
      setNotice('Item galeri telah dihapus.');
      // jika halaman jadi kosong, mundurkan page
      if (galleries.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        loadData();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus item.');
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Galeri</h1>
          <Link
            href="/admin/galery/create"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black"
          >
            + Tambah Foto
          </Link>
        </div>

        {notice && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-zinc-700">Memuat galeri…</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Gagal</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 p-10 text-center">
            <p className="text-zinc-700 font-medium">Belum ada data.</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200 bg-white">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Gambar</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Caption</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {galleries.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/60">
                      <td className="px-4 py-3">
                        <div className="h-14 w-20 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                          <img
                            src={fileURL(item.url)}
                            alt={item.title || `image-${item.id}`}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">{item.id}</td>
                      <td className="px-4 py-3 align-top">{item.title || '—'}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="line-clamp-3 text-sm">{item.caption || '—'}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 rounded-xl border border-zinc-200 text-sm disabled:opacity-50"
              >
                ← Sebelumnya
              </button>
              <div className="text-sm text-zinc-600">
                Halaman <span className="font-medium">{page}</span> dari{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-xl border border-zinc-200 text-sm disabled:opacity-50"
              >
                Selanjutnya →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal Edit */}
      {isModalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-lg font-semibold">Edit Galeri #{editing.id}</h2>
              <button onClick={closeModal} className="text-zinc-500 hover:text-zinc-700">✕</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex gap-4">
                <div className="h-28 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shrink-0">
                  <img
                    src={preview ?? fileURL(editing.url)}
                    alt="preview"
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Ganti Gambar (opsional)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setEditImage(f);
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview(f ? URL.createObjectURL(f) : null);
                    }}
                    className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-zinc-200 file:bg-white file:px-3 file:py-2 file:text-sm file:shadow-sm hover:file:bg-zinc-50"
                  />
                  <p className="mt-1 text-xs text-zinc-500">Biarkan kosong jika tidak ingin mengganti gambar.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Judul gambar"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Caption</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  rows={3}
                  placeholder="Deskripsi singkat"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow disabled:opacity-60"
              >
                {saving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
