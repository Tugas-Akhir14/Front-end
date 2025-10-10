'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Sun, Moon, Grid as GridIcon, ChevronDown, Search as SearchIcon } from 'lucide-react';

/* ===================== AUTH CONTEXT ===================== */
type AuthCtx = {
  token: string;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  logout: () => void;
};
const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam /app/admin/layout.tsx');
  return ctx;
}

/* ===================== SMALL UI HELPERS ===================== */
function I({ name, className, alt }: { name: string; className?: string; alt?: string }) {
  return <img src={`/icons/${name}.svg`} alt={alt ?? name} className={className} />;
}

function Badge({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'blue' }) {
  const cls = tone === 'green' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700';
  const clsDark = tone === 'green' ? 'dark:bg-emerald-500/20 dark:text-emerald-200' : 'dark:bg-blue-500/20 dark:text-blue-200';
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls} ${clsDark}`}>
      {children}
    </span>
  );
}

/* ===================== SIDEBAR ===================== */
type SidebarProps = {
  isCollapsed: boolean;          // state tetap (desktop)
  isPeeking: boolean;            // hover sementara (desktop)
  setIsPeeking: (v: boolean) => void;
  isMobileOpen: boolean;         // drawer (mobile)
  closeMobile: () => void;
};

function Sidebar({ isCollapsed, isPeeking, setIsPeeking, isMobileOpen, closeMobile }: SidebarProps) {
  const effectiveExpanded = !isCollapsed || isPeeking; // collapsed + hover => expand sementara

  const Item = ({
    icon,
    label,
    badge,
    href,
  }: {
    icon: React.ReactNode;
    label: string;
    badge?: React.ReactNode;
    href: string;
  }) => (
    <Link
      href={href}
      className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={label}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 grid place-items-center">
          {icon}
        </div>
        {/* Label & badge hanya saat expanded */}
        <div className={`${effectiveExpanded ? 'flex items-center gap-2 min-w-0' : 'hidden'}`}>
          <span className="text-[13px] text-slate-700 dark:text-slate-200 font-medium truncate">{label}</span>
          {badge}
        </div>
      </div>
      {/* Chevron hanya saat expanded (pakai lokal kecil saja) */}
      {effectiveExpanded && <I name="chevron-down" className="h-4 w-4 opacity-60 dark:opacity-70" />}
    </Link>
  );

  const desktopWidth = effectiveExpanded ? 'md:w-[260px]' : 'md:w-[72px]';
  const mobileClasses =
    'fixed inset-y-0 left-0 z-40 w-[260px] bg-white dark:bg-slate-900 md:static md:z-auto md:h-screen md:w-auto';
  const desktopClasses =
    'md:shrink-0 md:h-screen md:sticky md:top-0 md:border-r md:border-slate-200 md:bg-white dark:md:border-slate-800 dark:md:bg-slate-900';

  const mobileVisible = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobile}
      />

      {/* Sidebar container */}
      <aside
        className={`${mobileClasses} ${desktopClasses} ${desktopWidth} transition-all duration-200 ease-out transform md:transform-none ${mobileVisible}`}
        onMouseEnter={() => setIsPeeking(true)}
        onMouseLeave={() => setIsPeeking(false)}
      >
        <div className="px-4 py-5 flex items-center gap-3">
          <I name="bolt" className="h-9 w-9 rounded-xl" alt="Logo" />
          <div className={`${effectiveExpanded ? 'block' : 'hidden'} text-lg font-extrabold tracking-tight text-slate-900 dark:text-white`}>
            SuperAdmin
          </div>
        </div>

        <div className="px-3 pb-20 overflow-y-auto h-[calc(100vh-72px)] flex flex-col">
          <div className={`${effectiveExpanded ? 'px-2 mb-2' : 'hidden'} text-[13px] font-semibold text-slate-400 dark:text-slate-500`}>
            MENU
          </div>
          <nav className="space-y-1.5">
            <Item icon={<I name="grid" className="h-5 w-5" />} label="Dashboard" href="/admin/dashboard" />
            <Item icon={<I name="plug-in" className="h-5 w-5" />} label="Rooms" href="/admin/room" badge={<Badge>NEW</Badge>} />
            <Item icon={<I name="box" className="h-5 w-5" />} label="News" href="/admin/news" badge={<Badge>NEW</Badge>} />
            <Item icon={<I name="calendar" className="h-5 w-5" />} label="Galery" href="/admin/gallery" />
            <Item icon={<I name="user-circle" className="h-5 w-5" />} label="Visi Misi" href="/admin/visi-misi" />
            <Item icon={<I name="task" className="h-5 w-5" />} label="Profile" href="/admin/profile" />
          </nav>

          <div className="mt-auto pt-6">
            <div className={`${effectiveExpanded ? 'px-2 mb-2' : 'hidden'} text-[11px] font-semibold text-slate-400 dark:text-slate-500`}>
              SUPPORT
            </div>
            <div className="space-y-1.5">
              <div
                className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                title="Chat"
              >
                <I name="chat" className="h-5 w-5" /> {effectiveExpanded && <span>Chat</span>}
              </div>
              <div
                className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                title="Settings"
              >
                <I name="info" className="h-5 w-5" /> {effectiveExpanded && <span>Settings</span>}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ===================== TOPBAR ===================== */
type TopbarProps = {
  onToggleDesktop: () => void;   // toggle collapse (desktop)
  onOpenMobile: () => void;      // open drawer (mobile)
  isCollapsed: boolean;
  profileName: string;           // ← ditampilkan
  onLogout: () => void;          // ← untuk tombol logout
};

function Topbar({ onToggleDesktop, onOpenMobile, isCollapsed, profileName, onLogout }: TopbarProps) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [unread, setUnread] = useState<number>(3); // contoh badge unread
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const refProfile = useRef<HTMLDivElement>(null);
  const refNotif = useRef<HTMLDivElement>(null);

  // --- Theme: load & apply ---
  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && (localStorage.getItem('theme') as 'light' | 'dark' | null)) || null;
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initial = saved ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {}
  };

  // close dropdown saat klik di luar
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (refProfile.current && !refProfile.current.contains(e.target as Node)) {
        setOpenProfile(false);
      }
      if (refNotif.current && !refNotif.current.contains(e.target as Node)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="h-[64px] w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-10">
      {/* Tombol sidebar: mobile membuka drawer, desktop toggle collapse */}
      <button
        className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 grid place-items-center"
        aria-label="Toggle sidebar"
        aria-expanded={!isCollapsed}
        onClick={() => {
          if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
            onToggleDesktop(); // desktop
          } else {
            onOpenMobile();    // mobile
          }
        }}
      >
        <GridIcon className="h-5 w-5 text-slate-700 dark:text-slate-200" aria-hidden />
      </button>

      <div className="flex-1 max-w-1xl relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300">
          <SearchIcon className="h-4 w-4" aria-hidden />
        </span>
        <input
          placeholder="Search or type command…"
          className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* === Kanan: Notif + Theme Toggle + Profile === */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* NOTIFICATION BUTTON + DROPDOWN */}
        <div className="relative" ref={refNotif}>
          <button
            className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 grid place-items-center relative"
            aria-label="Notifications"
            aria-expanded={openNotif}
            onClick={() => setOpenNotif((v) => !v)}
          >
            <Bell className="h-5 w-5 text-slate-700 dark:text-slate-200" aria-hidden />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-[3px] rounded-full bg-orange-500 text-[10px] text-white ring-2 ring-white dark:ring-slate-900 grid place-items-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {openNotif && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xl z-50 overflow-hidden
                         transition-all duration-150 ease-out origin-top-right data-[state=open]:scale-100 data-[state=closed]:scale-95"
              data-state="open"
            >
              {/* Arrow */}
              <span className="pointer-events-none absolute -top-2 right-5 h-4 w-4 rotate-45 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-0 border-r-0"></span>

              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
                Notifications
              </div>

              {/* List */}
              <ul className="max-h-80 overflow-auto divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {/* Contoh item */}
                <li className="px-3 py-2 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 cursor-pointer">
                  <div className="text-slate-800 dark:text-slate-100">1 berita menunggu publikasi</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400">10m ago</div>
                </li>
                <li className="px-3 py-2 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 cursor-pointer">
                  <div className="text-slate-800 dark:text-slate-100">Sistem maintenance pukul 23:00</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400">1h ago</div>
                </li>

                {/* State kosong (tampilkan jika unread == 0 dan data kosong) */}
                {unread === 0 && (
                  <li className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada notifikasi baru
                  </li>
                )}
              </ul>

              <div className="p-2">
                <button
                  onClick={() => {
                    setUnread(0);
                    setOpenNotif(false);
                  }}
                  className="w-full text-xs py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-200"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* THEME TOGGLE */}
        <button
          className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 grid place-items-center"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-slate-200" aria-hidden />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" aria-hidden />
          )}
        </button>

        {/* PROFILE BUTTON + DROPDOWN */}
        <div className="relative" ref={refProfile}>
          <button
            onClick={() => setOpenProfile((v) => !v)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 pl-1 pr-3 py-1"
            aria-haspopup="menu"
            aria-expanded={openProfile}
          >
            <img src="https://i.pravatar.cc/40?img=12" alt="avatar" className="h-9 w-9 rounded-full object-cover" />
            <span className="hidden sm:block text-xs font-semibold max-w-[140px] truncate text-slate-900 dark:text-slate-100">
              {profileName || '—'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60 text-slate-700 dark:text-slate-300" aria-hidden />
          </button>

          {openProfile && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden z-50"
            >
              <Link
                href="/admin/settings"
                className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                role="menuitem"
                onClick={() => setOpenProfile(false)}
              >
                Settings
              </Link>
              <button
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                role="menuitem"
                onClick={() => {
                  setOpenProfile(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== LAYOUT (AUTH GUARD + PROVIDER) ===================== */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string>('');
  const [ready, setReady] = useState(false);

  // UI states
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse
  const [isPeeking, setIsPeeking] = useState(false);     // desktop hover peek
  const [isMobileOpen, setIsMobileOpen] = useState(false); // mobile drawer

  // profile
  const [profileName, setProfileName] = useState<string>('');

  // Ambil token dari sessionStorage saat mount (bersihkan kutip jika ada)
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('token') || '' : '';
    const cleaned = raw.replace(/^"+|"+$/g, ''); // hilangkan kutip ganda yang tak sengaja tersimpan
    if (!cleaned) {
      router.replace('/auth/signin');
      return;
    }
    setToken(cleaned);
    setReady(true);
  }, [router]);

  // Sinkronisasi logout/login lintas tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        const raw = sessionStorage.getItem('token') || '';
        const cleaned = raw.replace(/^"+|"+$/g, '');
        setToken(cleaned);
        if (!cleaned) router.replace('/auth/signin');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  // Tutup drawer saat resize ke desktop
  useEffect(() => {
    const handler = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const authFetch = useMemo(
    () => async (url: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers || {});
      const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

      if (!headers.has('Accept')) headers.set('Accept', 'application/json');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (!isFormData && init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      try {
        const res = await fetch(url, {
          ...init,
          headers,
          cache: 'no-store',
        });

        if (res.status === 401) {
          try {
            sessionStorage.removeItem('token');
          } catch {}
          router.replace('/auth/signin');
        }
        return res;
      } catch {
        throw new Error(`Network error saat fetch ${url}`);
      }
    },
    [token, router]
  );

  const logout = () => {
    try {
      sessionStorage.removeItem('token');
    } catch {}
    router.replace('/auth/signin');
  };

  // Helper: ambil full_name dari berbagai bentuk respons umum
  function extractFullName(payload: any): string {
    // fokus utama: cari full_name, bukan name
    const candidates: unknown[] = [
      payload?.full_name,
      payload?.data?.full_name,
      payload?.user?.full_name,
      payload?.profile?.full_name,
      // fallback sekunder kalau backend masih campur:
      payload?.fullName,
      payload?.data?.fullName,
      payload?.user?.fullName,
      payload?.profile?.fullName,
      // fallback terakhir:
      payload?.name,
      payload?.data?.name,
      payload?.user?.name,
      payload?.profile?.name,
    ];
    const found = candidates.find((x) => typeof x === 'string' && x.trim().length > 0);
    return (found as string | undefined)?.trim() ?? '';
  }

  // Fetch profile name setelah ready/token ada
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await authFetch('http://localhost:8080/admins/profile', { method: 'GET' });
        if (!res.ok) {
          setProfileName('User');
          return; // kalau 401 akan ditangani di authFetch
        }
        const j = await res.json().catch(() => ({} as any));
        const name = extractFullName(j);
        setProfileName(name || 'User');
      } catch {
        setProfileName('User');
      }
    }
    if (ready && token) loadProfile();
  }, [ready, token, authFetch]);

  if (!ready) {
    return <div className="p-6 text-sm text-gray-600">Loading admin…</div>;
  }

  return (
    <AuthContext.Provider value={{ token, authFetch, logout }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-[13px]">
        <div className="flex">
          <Sidebar
            isCollapsed={isCollapsed}
            isPeeking={isPeeking}
            setIsPeeking={setIsPeeking}
            isMobileOpen={isMobileOpen}
            closeMobile={() => setIsMobileOpen(false)}
          />

          <div className="flex-1 min-w-0">
            <Topbar
              onToggleDesktop={() => setIsCollapsed((v) => !v)}
              onOpenMobile={() => setIsMobileOpen(true)}
              isCollapsed={isCollapsed}
              profileName={profileName}
              onLogout={logout}
            />
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
