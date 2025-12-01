'use client';

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";

export type News = {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url?: string | null;
  status: "draft" | "published" | string;
  published_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return "—";
  }
}

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border";
  const styles =
    status === "published"
      ? "bg-green-50 text-green-800 border-green-200"
      : status === "draft"
      ? "bg-gray-100 text-gray-700 border-gray-300"
      : "bg-gray-50 text-gray-600 border-gray-200";
  return <span className={`${base} ${styles}`}>{status}</span>;
}

// Modal Edit
function EditModal({ item, onClose, onSuccess }: { item: News; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: item.title,
    slug: item.slug,
    content: item.content,
    status: item.status,
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(item.image_url || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Menyimpan perubahan...");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("slug", form.slug);
    formData.append("content", form.content);
    formData.append("status", form.status);
    if (form.image) formData.append("image", form.image);

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/news/${item.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memperbarui berita");
      }

      toast.success("Berita berhasil diperbarui!", { id: toastId });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan", { id: toastId });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Berita</h2>
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Judul</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Konten</label>
            <textarea
              required
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gambar (opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setForm({ ...form, image: file });
                if (file) setPreview(URL.createObjectURL(file));
              }}
              className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-black file:text-white file:font-semibold hover:file:bg-gray-800"
            />
            {preview && (
              <div className="mt-4">
                <img src={preview} alt="Preview" className="h-48 w-full object-cover rounded-xl border border-gray-300" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition">
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-60 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminNewsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "draft" | "published">("");
  const [news, setNews] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<News | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");

      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);

      const res = await fetch(`http://localhost:8080/api/news?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Gagal memuat berita");
      const payload = await res.json();
      setNews(payload.data || []);
      setTotal(payload.total || 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat data");
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = async (item: News) => {
    const result = await Swal.fire({
      title: `Hapus berita "${item.title}"?`,
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
        actions: "swal-actions",
      },
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading(`Menghapus "${item.title}"...`);

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/news/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus berita");
      }

      toast.success(`Berita berhasil dihapus!`, { id: toastId });
      fetchNews();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus", { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      {/* Custom Style untuk SweetAlert2 */}
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

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Berita</h1>
            <Link href="/admin/hotel/news/create" className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg">
              + Tambah Berita
            </Link>
          </div>

          {/* Toolbar */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari judul atau konten..."
              className="w-full sm:w-96 rounded-xl border border-gray-300 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
              className="rounded-xl border border-gray-300 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="ml-auto text-sm font-medium text-gray-600">
              Total: <span className="font-bold text-black">{total}</span> berita
            </div>
          </div>

          {/* States */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
              <p className="font-bold">Gagal memuat data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-800">Belum ada berita</p>
              <p className="text-gray-600 mt-2">Klik tombol "Tambah Berita" untuk memulai.</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Cover</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Judul & Slug</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Dipublikasikan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Diperbarui</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {news.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="h-16 w-24 rounded-xl overflow-hidden border border-gray-300 bg-gray-50">
                            <img src={item.image_url || "/placeholder.svg"} alt={item.title} className="h-full w-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">/{item.slug || "—"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.published_at)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.updated_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4">
                            <button onClick={() => setEditItem(item)} className="text-black font-bold hover:text-gray-700">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item)} className="text-red-600 font-bold hover:text-red-700">
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-6 py-3 rounded-xl bg-white border border-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Sebelumnya
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Halaman <span className="font-bold text-black">{page}</span> dari <span className="font-bold text-black">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-6 py-3 rounded-xl bg-white border border-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Selanjutnya
                </button>
              </div>  
            </>
          )}
        </div>

        {/* Modal Edit */}
        {editItem && <EditModal item={editItem} onClose={() => setEditItem(null)} onSuccess={fetchNews} />}
      </div>
    </>
  );
}