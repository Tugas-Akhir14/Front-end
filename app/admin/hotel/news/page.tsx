'use client';
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../../layout";

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
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "draft"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return <span className={`${base} ${styles}`}>{status}</span>;
}

// Modal Edit
function EditModal({ item, onClose, onSuccess }: { item: News; onClose: () => void; onSuccess: () => void }) {
  const { authFetch } = useAuth();
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
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("slug", form.slug);
    formData.append("content", form.content);
    formData.append("status", form.status);
    if (form.image) formData.append("image", form.image);

    try {
      const res = await fetch(`http://localhost:8080/api/news/${item.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memperbarui berita");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-yellow-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Berita</h2>
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-xl border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konten</label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-xl border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gambar (opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setForm({ ...form, image: file });
                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
              className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-amber-500 file:to-yellow-600 file:text-black hover:file:from-amber-600 hover:file:to-yellow-700"
            />
            {preview && (
              <div className="mt-3">
                <img src={preview} alt="Preview" className="h-40 w-full object-cover rounded-xl border-2 border-amber-200 shadow-sm" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl hover:from-amber-600 hover:to-yellow-700 disabled:opacity-60 shadow-md transition-all flex items-center gap-2"
            >
              {loading ? (
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
        </form>
      </div>
    </div>
  );
}

// Modal Delete
function DeleteModal({ item, onClose, onSuccess }: { item: News; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/news/${item.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus berita");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-yellow-200">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Hapus Berita?</h2>
        <p className="text-sm text-gray-600 mb-5">
          Apakah Anda yakin ingin menghapus berita <strong className="text-amber-700">{item.title}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        {error && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl hover:from-rose-600 hover:to-red-700 disabled:opacity-60 shadow-md transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminNewsPage() {
  const { authFetch } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "draft" | "published">("");
  const [news, setNews] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editItem, setEditItem] = useState<News | null>(null);
  const [deleteItem, setDeleteItem] = useState<News | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

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
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Gagal memuat berita. Status ${res.status}`);
      const payload = await res.json();
      setNews(payload.data || []);
      setTotal(payload.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, status]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSuccess = () => {
    fetchNews();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Manajemen Berita
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/hotel/news/create"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-5 py-2.5 text-sm font-bold text-black shadow-md hover:from-amber-600 hover:to-yellow-700 transition-all"
            >
              + Tambah Berita
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Cari judul/konten..."
            className="w-full sm:w-80 rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-500"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
            className="rounded-xl bg-white border border-yellow-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Semua status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div className="ml-auto text-sm text-gray-700 font-medium">
            Total: <span className="text-amber-700 font-bold">{total}</span> <span className="text-gray-500">(10/halaman)</span>
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading ? (
          <div className="rounded-xl border border-yellow-200 bg-amber-50 p-6 text-amber-700 font-medium text-center">
            Memuat berita...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p className="font-bold text-lg">Gagal memuat berita</p>
            <p className="text-sm mt-1 opacity-90">{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="rounded-xl border border-yellow-200 p-12 text-center bg-white shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-8 w-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v1h6V5a3 3 0 0 1 3-3z" />
                <path d="M3 10h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold text-lg">Belum ada berita.</p>
            <p className="text-gray-600 text-sm mt-1">
              Klik tombol <span className="font-bold text-amber-700">Tambah Berita</span> untuk membuat berita baru.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-lg">
              <table className="min-w-full divide-y divide-yellow-100">
                <thead className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Cover</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Judul & Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Dipublikasikan</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Diperbarui</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-100">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="h-14 w-20 overflow-hidden rounded-xl border-2 border-amber-200 bg-amber-50">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 line-clamp-1">{item.title}</span>
                          <span className="text-xs text-amber-700">/{item.slug || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-gray-700">{formatDate(item.published_at)}</td>
                      <td className="px-4 py-3 align-top text-sm text-gray-600">{formatDate(item.updated_at)}</td>
                      <td className="px-4 py-3 align-top text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setEditItem(item)}
                            className="text-amber-700 hover:text-amber-800 font-bold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="text-rose-600 hover:text-rose-700 font-bold transition-colors"
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-5 py-2.5 rounded-xl border border-yellow-300 text-sm font-medium disabled:opacity-50 hover:bg-yellow-50 transition-colors"
              >
                Sebelumnya
              </button>
              <div className="text-sm text-gray-700 font-medium">
                Halaman <span className="text-amber-700 font-bold">{page}</span> dari{" "}
                <span className="text-amber-700 font-bold">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-5 py-2.5 rounded-xl border border-yellow-300 text-sm font-medium disabled:opacity-50 hover:bg-yellow-50 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={handleSuccess}
        />
      )}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}