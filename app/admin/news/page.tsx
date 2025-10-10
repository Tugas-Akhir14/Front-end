      'use client';

      import Link from "next/link";
      import { useEffect, useMemo, useState } from "react";
      import { useAuth } from "../layout";

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

      export default function AdminNewsPage() {
        const { authFetch } = useAuth();

        // query state -> sesuai handler: page, page_size, q, status
        const [page, setPage] = useState(1);
        const [pageSize] = useState(10); // fixed 10/halaman (opsi 5/halaman dihilangkan)
        const [q, setQ] = useState("");
        const [status, setStatus] = useState<"" | "draft" | "published">("");

        const [news, setNews] = useState<News[]>([]);
        const [total, setTotal] = useState(0);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

      useEffect(() => {
        (async () => {
          setLoading(true);
          setError(null);
          try {
            const token = sessionStorage.getItem("token");  // Pastikan token diambil dengan benar
            if (!token) {
              setError("Token tidak ditemukan. Silakan login kembali.");
              return;
            }

            const params = new URLSearchParams({
              page: String(page),
              page_size: String(pageSize),
            });
            if (q.trim()) params.set("q", q.trim());
            if (status) params.set("status", status);

            const res = await fetch(`http://localhost:8080/api/news`, {
              method: "GET",
               credentials: "include",  // Pastikan cookie dikirimkan
              headers: {
                "Content-Type": "application/json",
                
                "Authorization": `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Gagal memuat berita. Status ${res.status}`);
            }

            const payload = await res.json();
            setNews(payload.data || []);
            setTotal(payload.total || 0);
          } catch (e) {
          setError(e instanceof Error ? e.message : "Gagal memuat data.");
      } finally {
            setLoading(false);
          }
        })();
      }, [page, pageSize, q, status]);


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
                    href="/admin/news/create"
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    + Tambah Berita
                  </Link>
                </div>
              </div>

              {/* Toolbar: Search & Status (page size control dihilangkan) */}
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
          </div>
        );
      }
