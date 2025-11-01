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
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border";
  const styles =
    status === "published"
      ? "bg-green-50 text-green-700 border-green-200"
      : status === "draft"
      ? "bg-gray-50 text-gray-700 border-gray-200"
      : "bg-zinc-50 text-zinc-700 border-zinc-200";
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Edit Berita</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konten</label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gambar (opsional)</label>
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
              className="w-full text-sm"
            />
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="Preview" className="h-32 w-full object-cover rounded-lg border" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-2">Hapus Berita?</h2>
        <p className="text-sm text-zinc-600 mb-4">
          Apakah Anda yakin ingin menghapus berita <strong>{item.title}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Hapus"}
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

  // Modal states
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
    fetchNews(); // refresh list
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Berita</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/hotel/news/create"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90"
            >
              + Tambah Berita
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Cari judul/konten…"
            className="w-full sm:w-64 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
            className="rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">Semua status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div className="ml-auto text-sm text-zinc-600">
            Total: <span className="font-medium">{total}</span> <span className="text-zinc-400">(10/halaman)</span>
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-zinc-700">
            Memuat berita…
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Gagal memuat berita</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 p-10 text-center">
            <p className="text-zinc-700 font-medium">Belum ada berita.</p>
            <p className="text-zinc-500 text-sm mt-1">
              Klik tombol <span className="font-semibold">Tambah Berita</span> untuk membuat berita baru.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200 bg-white">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Cover</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Judul & Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Dipublikasikan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Diperbarui</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/60">
                      <td className="px-4 py-3">
                        <div className="h-14 w-20 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900 line-clamp-1">{item.title}</span>
                          <span className="text-xs text-zinc-500">/{item.slug || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-zinc-700">{formatDate(item.published_at)}</td>
                      <td className="px-4 py-3 align-top text-sm text-zinc-700">{formatDate(item.updated_at)}</td>
                      <td className="px-4 py-3 align-top text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditItem(item)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="text-red-600 hover:text-red-800 font-medium"
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
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 rounded-xl border border-zinc-200 text-sm disabled:opacity-50"
              >
                ← Sebelumnya
              </button>
              <div className="text-sm text-zinc-600">
                Halaman <span className="font-medium">{page}</span> dari{" "}
                <span className="font-medium">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-xl border border-zinc-200 text-sm disabled:opacity-50"
              >
                Selanjutnya →
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