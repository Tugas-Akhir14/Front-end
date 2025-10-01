import React from "react";

/** Helper image icon dari /public/icons */
function I({ name, className, alt }: { name: string; className?: string; alt?: string }) {
  return <img src={`/icons/${name}.svg`} alt={alt ?? name} className={className} />;
}

/** Sidebar */
function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "blue" }) {
  const cls = tone === "green" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700";
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{children}</span>;
}

function Sidebar() {
  const Item = ({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-100 cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 grid place-items-center">
          {icon}
        </div>
        {/* ↓ 15px -> 13px */}
        <span className="text-[13px] text-slate-700 font-medium">{label}</span>
        {badge}
      </div>
      <I name="chevron-down" className="h-4 w-4 opacity-60 group-hover:opacity-100" />
    </div>
  );

  return (
    <aside className="w-[260px] shrink-0 h-screen sticky top-0 border-r border-slate-200 bg-white">
      <div className="px-5 py-6 flex items-center gap-3">
        <I name="bolt" className="h-9 w-9 rounded-xl" alt="Logo" />
        {/* ↓ text-xl -> text-lg */}
        <div className="text-lg font-extrabold tracking-tight">SuperAdmin</div>
      </div>

      <div className="px-5 pb-20 overflow-y-auto h-[calc(100vh-72px)] flex flex-col">
        {/* ↓ text-xs -> 11px */}
        <div className="text-[13px] font-semibold text-slate-400 px-2 mb-2">MENU</div>
        <nav className="space-y-1.5">
          <Item icon={<I name="grid" className="h-5 w-5" />} label="Dashboard" />
          <Item icon={<I name="plug-in" className="h-5 w-5" />} label="Rooms" badge={<Badge>NEW</Badge>} />
          <Item icon={<I name="box" className="h-5 w-5" />} label="News" badge={<Badge>NEW</Badge>} />
          <Item icon={<I name="calendar" className="h-5 w-5" />} label="Galery" />
          <Item icon={<I name="user-circle" className="h-5 w-5" />} label="Visi Misi" />
          <Item icon={<I name="task" className="h-5 w-5" />} label="Profile" />
        </nav>

        <div className="mt-auto pt-6">
          <div className="text-[11px] font-semibold text-slate-400 px-2 mb-2">SUPPORT</div>
          <div className="space-y-1.5">
            {/* ↓ tambah text-[13px] */}
            <div className="px-4 py-3 text-[12px] text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer flex items-center gap-3">
              <I name="chat" className="h-5 w-5" /> Chat
            </div>
            <div className="px-4 py-3 text-[12px] text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer flex items-center gap-3">
              <I name="info" className="h-5 w-5" /> Settings
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Topbar */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function Topbar() {
  return (
    <div className="h-[72px] w-full border-b border-slate-200 bg-white flex items-center px-6 gap-4 sticky top-0 z-10">
      <button className="h-10 w-10 rounded-xl border border-slate-200 grid place-items-center">
        <I name="grid" className="h-5 w-5" alt="Menu" />
      </button>

      <div className="flex-1 max-w-1xl relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>
        {/* ↓ 15px -> text-sm (±14px) */}
        <input
          placeholder="Search or type command…"
          className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="h-10 w-10 rounded-full border border-slate-200 grid place-items-center">
          <I name="time" className="h-5 w-5" alt="Theme" />
        </button>
        <button className="h-10 w-10 rounded-full border border-slate-200 grid place-items-center relative">
          <I name="bell" className="h-5 w-5" alt="Notifications" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/40?img=12" alt="avatar" className="h-10 w-10 rounded-full object-cover" />
          {/* ↓ text-sm -> text-xs */}
          <div className="text-xs font-semibold">Superpedroo</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // ↓ set default 13px untuk seluruh layout
    <div className="min-h-screen bg-slate-50 text-slate-900 text-[13px]">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          {children}
        </div>
      </div>
    </div>
  );
}
