"use client";

import { useEffect, useMemo, useState } from "react";

type VisionMission = {
  id?: number;
  vision: string;
  missions: string[];
  updated_at?: string;
  created_at?: string;
};

export default function VisiMisiPage() {
  const [data, setData] = useState<VisionMission | null>(null);
  const [vision, setVision] = useState("");
  const [missions, setMissions] = useState<string[]>([""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL + "/api", []);

  function getToken() {
    const raw = sessionStorage.getItem("token");
    return raw ? raw.replace(/^"+|"+$/g, "") : "";
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    setOkMsg(null);
    try {
      const res = await fetch(`${apiBase}/visi-misi`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.status === 404) {
        // belum diset
        setData(null);
        setVision("");
        setMissions([""]);
      } else if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      } else {
        const j = await res.json();
        const row: VisionMission = j.data || j;
        setData(row);
        setVision(row.vision || "");
        setMissions((row.missions && row.missions.length ? row.missions : [""]).map(String));
      }
    } catch (e: any) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateMission(idx: number, val: string) {
    setMissions((prev) => prev.map((m, i) => (i === idx ? val : m)));
  }
  function addMission() {
    setMissions((prev) => [...prev, ""]);
  }
  function removeMission(idx: number) {
    setMissions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setOkMsg(null);
    try {
      const body = {
        vision: vision.trim(),
        missions: missions.map((m) => m.trim()).filter((m) => m.length > 0),
      };
      const res = await fetch(`${apiBase}/visi-misi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setOkMsg("Visi & Misi berhasil disimpan.");
      // refresh tampilan dari server
      await fetchData();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/30">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header with decorative elements */}
        <header className="mb-10 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl -z-10"></div>
          
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-full px-6 py-2 shadow-lg">
              <span className="text-2xl">🎯</span>
              <span className="text-amber-700 text-sm font-bold tracking-wider uppercase">Management</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-3">
            Visi & Misi
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kelola visi dan misi situs dengan tampilan elegan dan profesional
          </p>
          
          <div className="flex justify-center mt-4">
            <div className="h-1 w-24 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-full"></div>
          </div>
        </header>

        {/* Alerts with enhanced styling */}
        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <span className="font-bold text-red-700">Gagal:</span>
                <span className="text-red-600 ml-2">{error}</span>
              </div>
            </div>
          </div>
        )}
        {okMsg && (
          <div className="mb-6 rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-green-700 font-medium">{okMsg}</span>
            </div>
          </div>
        )}

        {/* Main Card with enhanced design */}
        <div className="rounded-2xl border-2 border-amber-300 bg-white shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-b-2 border-amber-300 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">📝</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {loading ? "Memuat Data..." : data ? "Perbarui Visi & Misi" : "Set Visi & Misi Baru"}
              </h2>
            </div>
          </div>

          <div className="px-8 py-8 space-y-8">
            {/* Vision Section */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                <span className="text-xl">🎯</span>
                Visi
              </label>
              <div className="relative">
                <textarea
                  className="w-full rounded-xl border-2 border-amber-300 bg-white p-4 text-gray-800 outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all shadow-sm hover:shadow-md resize-none"
                  rows={5}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Tulis visi organisasi Anda dengan jelas dan inspiratif..."
                />
              </div>
              {data?.updated_at && (
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <span className="text-base">🕐</span>
                  <span>Terakhir diperbarui: {new Date(data.updated_at).toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            {/* Missions Section */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                <span className="text-xl">🚀</span>
                Misi
              </label>
              <div className="space-y-3">
                {missions.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="flex-1 relative">
                      <div className="absolute left-4 top-4 text-amber-500 font-bold text-sm">
                        #{i + 1}
                      </div>
                      <input
                        className="w-full rounded-xl border-2 border-amber-300 bg-white pl-12 pr-4 py-3 text-gray-800 outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all shadow-sm hover:shadow-md"
                        value={m}
                        onChange={(e) => updateMission(i, e.target.value)}
                        placeholder={`Misi ke-${i + 1}: Tulis tujuan spesifik...`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMission(i)}
                      className="rounded-xl border-2 border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm hover:shadow-md group-hover:scale-105"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMission}
                  className="w-full rounded-xl border-2 border-amber-300 border-dashed bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-4 text-sm font-bold text-amber-700 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-400 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <span className="text-xl">➕</span>
                  Tambah Misi Baru
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-amber-200">
              <button
                type="button"
                onClick={fetchData}
                disabled={loading || saving}
                className="rounded-xl border-2 border-amber-300 bg-white px-6 py-3 text-sm font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span className="text-lg">🔄</span>
                Muat Ulang
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-500 to-yellow-600 px-8 py-3 text-sm font-bold text-white hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="text-lg">💾</span>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section with enhanced design */}
        <section className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">👁️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Pratinjau</h3>
          </div>
          
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-white to-amber-50/30 p-8 shadow-xl">
            {/* Vision Preview */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-yellow-600 rounded-full"></div>
                <p className="text-xs uppercase tracking-widest font-bold text-amber-700">Visi</p>
              </div>
              <div className="bg-white rounded-xl border-2 border-amber-200 p-6 shadow-md">
                <p className="text-gray-800 leading-relaxed text-lg">
                  {vision || <span className="text-gray-400 italic">Belum ada visi yang diisi...</span>}
                </p>
              </div>
            </div>

            {/* Mission Preview */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-yellow-600 rounded-full"></div>
                <p className="text-xs uppercase tracking-widest font-bold text-amber-700">Misi</p>
              </div>
              <div className="bg-white rounded-xl border-2 border-amber-200 p-6 shadow-md">
                <ol className="space-y-4">
                  {(missions.filter(Boolean).length ? missions.filter(Boolean) : ["Belum ada misi yang diisi..."]).map((m, i) => (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <p className="text-gray-800 leading-relaxed pt-1 flex-1">
                        {m || <span className="text-gray-400 italic">—</span>}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span className="text-base">💡</span>
            Visi dan misi akan ditampilkan di halaman publik website
          </p>
        </div>
      </div>
    </div>
  );
}