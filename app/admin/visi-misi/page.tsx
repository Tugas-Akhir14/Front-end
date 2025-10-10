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

  const apiBase = useMemo(() => "http://localhost:8080/api", []);

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
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Visi & Misi</h1>
          <p className="text-sm text-neutral-600">
            Kelola visi dan misi situs. Tema monokrom (hitam–putih).
          </p>
        </header>

        {/* Alert */}
        {error && (
          <div className="mb-4 rounded border border-black bg-white px-4 py-3 text-sm">
            <span className="font-medium">Gagal:</span> {error}
          </div>
        )}
        {okMsg && (
          <div className="mb-4 rounded border border-black bg-white px-4 py-3 text-sm">
            {okMsg}
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-black">
          <div className="border-b border-black px-6 py-4">
            <h2 className="text-lg font-medium">
              {loading ? "Memuat…" : data ? "Perbarui Visi & Misi" : "Set Visi & Misi"}
            </h2>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Vision */}
            <div>
              <label className="mb-2 block text-sm font-medium">Visi</label>
              <textarea
                className="w-full rounded-lg border border-black bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-black"
                rows={4}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Tulis visi…"
              />
              {data?.updated_at && (
                <p className="mt-2 text-xs text-neutral-600">
                  Terakhir diperbarui: {new Date(data.updated_at).toLocaleString("id-ID")}
                </p>
              )}
            </div>

            {/* Missions */}
            <div>
              <label className="mb-2 block text-sm font-medium">Misi</label>
              <div className="space-y-3">
                {missions.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="flex-1 rounded-lg border border-black bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-black"
                      value={m}
                      onChange={(e) => updateMission(i, e.target.value)}
                      placeholder={`Misi #${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeMission(i)}
                      className="rounded-lg border border-black px-3 py-2 text-xs hover:bg-black hover:text-white"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMission}
                  className="rounded-lg border border-black px-3 py-2 text-xs hover:bg-black hover:text-white"
                >
                  + Tambah Misi
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={fetchData}
                disabled={loading || saving}
                className="rounded-lg border border-black px-4 py-2 text-sm hover:bg-black hover:text-white disabled:opacity-50"
              >
                Muat Ulang
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-lg border border-black bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <section className="mt-10">
          <h3 className="mb-3 text-lg font-medium">Pratinjau</h3>
          <div className="rounded-2xl border border-black p-6">
            <p className="mb-2 text-xs uppercase tracking-wider text-neutral-700">Visi</p>
            <p className="mb-6 leading-relaxed">{vision || "—"}</p>

            <p className="mb-2 text-xs uppercase tracking-wider text-neutral-700">Misi</p>
            <ol className="list-decimal space-y-2 pl-5">
              {(missions.filter(Boolean).length ? missions : ["—"]).map((m, i) => (
                <li key={i} className="leading-relaxed">
                  {m || "—"}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
