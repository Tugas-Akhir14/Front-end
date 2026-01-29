'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../layout';
import { Toaster, toast } from 'sonner';
import Swal from 'sweetalert2';

export type Gallery = {
  id: number;
  title: string;
  caption: string;
  url: string;
  created_at: string;
  updated_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

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
        toast.error('Sesi telah berakhir. Silakan login kembali.');
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
      const msg = e instanceof Error ? e.message : 'Gagal memuat data.';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
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
      toast.error('Token tidak ditemukan. Silakan login kembali.');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);

    const toastId = toast.loading('Menyimpan perubahan...');

    try {
      // Update metadata
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

      // Update image jika ada
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

      toast.success('Perubahan berhasil disimpan!', { id: toastId });
      closeModal();
      await loadData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal menyimpan perubahan.';
      toast.error(msg, { id: toastId });
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const result = await Swal.fire({
      title: 'Hapus Foto Galeri?',
      text: 'Foto ini akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel',
        actions: 'swal-actions',
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading('Menghapus foto...');

    const token = getToken();
    if (!token) {
      toast.error('Token tidak ditemukan.', { id: toastId });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/galleries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `Gagal menghapus (status ${res.status})`);
      }

      toast.success('Foto berhasil dihapus!', { id: toastId });

      if (galleries.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        loadData();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal menghapus foto.';
      toast.error(msg, { id: toastId });
    }
  }

  return (
    <>
      {/* Sonner Toaster */}
      <Toaster position="top-right" richColors closeButton />

      {/* SweetAlert2 Custom Style (sama persis seperti sebelumnya) */}
      <style jsx global>{`
        .swal-popup { border-radius: 1rem !important; }
        .swal-actions { gap: 1rem !important; justify-content: center !important; padding: 0 1.5rem !important; }
        .swal-cancel {
          min-width: 120px !important;
          padding: 0.75rem 1.5rem !important;
          background-color: #6b7280 !important;
          color: white !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3) !important;
        }
        .swal-cancel:hover { background-color: #4b5563 !important; }
        .swal-confirm {
          min-width: 140px !important;
          padding: 0.75rem 1.5rem !important;
          background: linear-gradient(to right, #ef4444, #dc2626) !important;
          color: white !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4) !important;
        }
        .swal-confirm:hover { background: linear-gradient(to right, #dc2626, #b91c1c) !important; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Manajemen Galeri
            </h1>
            <Link
              href="/admin/hotel/gallery/create"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-5 py-2.5 text-sm font-bold text-black shadow-md hover:from-amber-600 hover:to-yellow-700 transition-all"
            >
              + Tambah Foto
            </Link>
          </div>

          {notice && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 shadow-sm">
              {notice}
            </div>
          )}

          {loading ? (
            <div className="rounded-xl border border-yellow-200 bg-amber-50 p-6 text-amber-700 font-medium text-center">
              Memuat galeri...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-bold text-lg">Gagal</p>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          ) : galleries.length === 0 ? (
            <div className="rounded-xl border border-yellow-200 p-12 text-center bg-white shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-8 w-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="m8 13 2.5-2.5 4 4L21 9" />
                  <circle cx="7" cy="8" r="1.5" />
                </svg>
              </div>
              <p className="text-gray-800 font-semibold text-lg">Belum ada data galeri.</p>
              <p className="text-gray-600 text-sm mt-1">
                Klik <span className="font-bold text-amber-700">+ Tambah Foto</span> untuk memulai.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-lg">
                <table className="min-w-full divide-y divide-yellow-100">
                  <thead className="bg-gradient-to-r from-yellow-50 to-amber-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Gambar</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Caption</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-100">
                    {galleries.map((item) => (
                      <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="h-14 w-20 overflow-hidden rounded-xl border-2 border-amber-200 bg-amber-50">
                            <img
                              src={fileURL(item.url)}
                              alt={item.title || `image-${item.id}`}
                              className="h-full w-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top font-medium text-amber-700">{item.id}</td>
                        <td className="px-4 py-3 align-top font-medium text-gray-800">{item.title || '—'}</td>
                        <td className="px-4 py-3 align-top">
                          <div className="line-clamp-3 text-sm text-gray-700">{item.caption || '—'}</div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-3 py-1.5 rounded-xl text-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold shadow-sm hover:from-amber-600 hover:to-yellow-700 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1.5 rounded-xl text-sm border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
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

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-5 py-2.5 rounded-xl border border-yellow-300 text-sm font-medium disabled:opacity-50 hover:bg-yellow-50 transition-colors"
                >
                  Sebelumnya
                </button>
                <div className="text-sm text-gray-700 font-medium">
                  Halaman <span className="text-amber-700 font-bold">{page}</span> dari{' '}
                  <span className="text-amber-700 font-bold">{totalPages}</span>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-5 py-2.5 rounded-xl border border-yellow-300 text-sm font-medium disabled:opacity-50 hover:bg-yellow-50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Edit */}
        {isModalOpen && editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-yellow-200">
              <div className="flex items-center justify-between border-b border-yellow-200 px-6 py-4 bg-gradient-to-r from-yellow-50 to-amber-50">
                <h2 className="text-lg font-bold text-gray-800">Edit Galeri #{editing.id}</h2>
                <button onClick={closeModal} className="text-gray-600 hover:text-gray-800 p-1">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div className="flex gap-5">
                  <div className="h-32 w-44 overflow-hidden rounded-xl border-2 border-amber-200 bg-amber-50 shrink-0">
                    <img
                      src={preview ?? fileURL(editing.url)}
                      alt="preview"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ganti Gambar (opsional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setEditImage(f);
                        if (preview) URL.revokeObjectURL(preview);
                        setPreview(f ? URL.createObjectURL(f) : null);
                      }}
                      className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-amber-500 file:to-yellow-600 file:text-black hover:file:from-amber-600 hover:file:to-yellow-700"
                    />
                    <p className="mt-2 text-xs text-gray-600">Biarkan kosong jika tidak ingin mengganti gambar.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Judul gambar"
                    className="w-full rounded-xl border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Caption</label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={3}
                    placeholder="Deskripsi singkat"
                    className="w-full rounded-xl border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30 resize-none"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-yellow-200 px-6 py-4 bg-gradient-to-r from-yellow-50 to-amber-50">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-sm font-bold shadow-md hover:from-amber-600 hover:to-yellow-700 disabled:opacity-60 transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}