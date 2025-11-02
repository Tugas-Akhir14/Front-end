// app/admin/layout.tsx
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
import {
  Bell,
  Sun,
  Moon,
  Grid as GridIcon,
  ChevronDown,
  Search as SearchIcon,
  LogOut as LogOutIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type AuthCtx = {
  token: string;
  user: any;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  logout: () => void;
};
const AuthContext = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
};

/* ===================== UI HELPERS ===================== */
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

/* ===================== SIDEBAR DINAMIS ===================== */
type SidebarProps = {
  isCollapsed: boolean;
  isPeeking: boolean;
  setIsPeeking: (v: boolean) => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
};

function Sidebar({ isCollapsed, isPeeking, setIsPeeking, isMobileOpen, closeMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const role = user?.role;
  const effectiveExpanded = !isCollapsed || isPeeking;

  // HAK AKSES
  const can = (roles: string[]) => roles.includes(role) || role === 'superadmin';

  // MENU DINAMIS
  const menus = [
    ...(can(['admin_hotel']) ? [{
      title: 'MANAGE HOTEL',
      items: [
        { icon: 'grid', label: 'Dashboard', href: '/admin/hotel/dashboard' },
        { icon: 'plug-in', label: 'Rooms', href: '/admin/hotel/room', badge: 'NEW' },
        { icon: 'box', label: 'News', href: '/admin/hotel/news', badge: 'NEW' },
        { icon: 'time', label: 'Booking', href: '/admin/hotel/booking', badge: 'NEW' },
        { icon: 'calendar', label: 'Gallery', href: '/admin/hotel/gallery' },
        { icon: 'user-circle', label: 'Visi Misi', href: '/admin/hotel/visi-misi' },
        { icon: 'user-circle', label: 'Review', href: '/admin/hotel/review' },
      ],
    }] : []),
    ...(can(['admin_souvenir']) ? [{
      title: 'MANAGE SOUVENIR',
      items: [
        { icon: 'grid', label: 'Dashboard', href: '/admin/souvenir/dashboard' },
        { icon: 'plug-in', label: 'Product', href: '/admin/souvenir/product', badge: 'NEW' },
        { icon: 'calendar', label: 'Category', href: '/admin/souvenir/category' },
      ],
    }] : []),
    ...(can(['admin_buku']) ? [{
      title: 'MANAGE BUKU',
      items: [
        { icon: 'grid', label: 'Dashboard', href: '/admin/book/dashboard' },
        { icon: 'plug-in', label: 'Product', href: '/admin/book/product', badge: 'NEW' },
        { icon: 'calendar', label: 'Category', href: '/admin/book/category' },
      ],
    }] : []),
    ...(can(['admin_cafe']) ? [{
      title: 'MANAGE CAFE',
      items: [
        { icon: 'grid', label: 'Dashboard', href: '/admin/cafe/dashboard' },
        { icon: 'plug-in', label: 'Product', href: '/admin/cafe/product', badge: 'NEW' },
        { icon: 'plug-in', label: 'Category', href: '/admin/cafe/category', badge: 'NEW' },
      ],
    }] : []),
    ...(role === 'superadmin' ? [{
      title: 'SUPERADMIN',
      items: [
        { icon: 'shield', label: 'All Modules', href: '/admin/dashboard' },
        { icon: 'users', label: 'Pending Admins', href: '/admin/pending' },
      ],
    }] : []),
  ];

  const Item = ({ icon, label, badge, href }: { icon: string; label: string; badge?: string; href: string }) => (
    <Link
      href={href}
      className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={label}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 grid place-items-center">
          <I name={icon} className="h-5 w-5" />
        </div>
        {effectiveExpanded && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] text-slate-700 dark:text-slate-200 font-medium truncate">{label}</span>
            {badge && <Badge>{badge}</Badge>}
          </div>
        )}
      </div>
      {effectiveExpanded && <I name="chevron-down" className="h-4 w-4 opacity-60 dark:opacity-70" />}
    </Link>
  );

  const desktopWidth = effectiveExpanded ? 'md:w-[260px]' : 'md:w-[72px]';
  const mobileClasses = 'fixed inset-y-0 left-0 z-40 w-[260px] bg-white dark:bg-slate-900 md:static md:z-auto md:h-screen md:w-auto';
  const desktopClasses = 'md:shrink-0 md:h-screen md:sticky md:top-0 md:border-r md:border-slate-200 md:bg-white dark:md:border-slate-800 dark:md:bg-slate-900';
  const mobileVisible = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/30 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobile}
      />
      <aside
        className={`${mobileClasses} ${desktopClasses} ${desktopWidth} transition-all duration-200 ease-out transform md:transform-none ${mobileVisible}`}
        onMouseEnter={() => setIsPeeking(true)}
        onMouseLeave={() => setIsPeeking(false)}
      >
        <div className="px-4 py-5 flex items-center gap-3">
          <I name="bolt" className="h-9 w-9 rounded-xl" alt="Logo" />
          {effectiveExpanded && (
            <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {role === 'superadmin' ? 'SuperAdmin' : 'Admin Panel'}
            </div>
          )}
        </div>

        <div className="px-3 pb-20 overflow-y-auto h-[calc(100vh-72px)] flex flex-col">
          {menus.map((menu, i) => (
            <div key={i} className="mb-6">
              {effectiveExpanded && (
                <div className="px-2 mb-2 text-[13px] font-semibold text-slate-400 dark:text-slate-500">
                  {menu.title}
                </div>
              )}
              <nav className="space-y-1.5">
                {menu.items.map((item, j) => (
                  <Item key={j} icon={item.icon} label={item.label} href={item.href} badge={item.badge} />
                ))}
              </nav>
            </div>
          ))}

          {/* SUPPORT */}
          <div className="mt-auto pt-6">
            {effectiveExpanded && (
              <div className="px-2 mb-2 text-[13px] font-semibold text-slate-400 dark:text-slate-500">SUPPORT</div>
            )}
            <div className="space-y-1.5">
              <div className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3" title="Chat">
                <I name="chat" className="h-5 h-5" /> {effectiveExpanded && <span>Chat</span>}
              </div>
              <div className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3" title="Settings">
                <I name="info" className="h-5 h-5" /> {effectiveExpanded && <span>Settings</span>}
              </div>
              <button
                onClick={logout}
                className="w-full px-3 py-2.5 text-[12px] text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center gap-3"
                title="Logout"
              >
                <LogOutIcon className="h-5 h-5" /> {effectiveExpanded && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ===================== TOPBAR (TIDAK BERUBAH) ===================== */
type TopbarProps = {
  onToggleDesktop: () => void;
  onOpenMobile: () => void;
  isCollapsed: boolean;
  profileName: string;
  onLogout: () => void;
  adminLogins: { id: number; full_name: string; role: string; time: string }[];
  handleApprove: (id: number) => void;
};

function Topbar({ onToggleDesktop, onOpenMobile, isCollapsed, profileName, onLogout, adminLogins, handleApprove }: TopbarProps) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const refProfile = useRef<HTMLDivElement>(null);
  const refNotif = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark' | null) || null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (refProfile.current && !refProfile.current.contains(e.target as Node)) setOpenProfile(false);
      if (refNotif.current && !refNotif.current.contains(e.target as Node)) setOpenNotif(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="h-[64px] w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-10">
      <button
        className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 grid place-items-center"
        onClick={() => (window.matchMedia('(min-width: 768px)').matches ? onToggleDesktop() : onOpenMobile())}
      >
        <GridIcon className="h-5 h-5 text-slate-700 dark:text-slate-200" />
      </button>

      <div className="flex-1 max-w-1xl relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-300" />
        <input
          placeholder="Search or type command…"
          className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* NOTIFIKASI */}
        <div className="relative" ref={refNotif}>
          <button
            className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 grid place-items-center relative"
            onClick={() => setOpenNotif((v) => !v)}
          >
            <Bell className="h-5 h-5 text-slate-700 dark:text-slate-200" />
            {adminLogins.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-[3px] rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white dark:ring-slate-900 grid place-items-center">
                {adminLogins.length > 9 ? '9+' : adminLogins.length}
              </span>
            )}
          </button>

          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/95 backdrop-blur shadow-xl z-50 overflow-hidden">
              <span className="pointer-events-none absolute -top-2 right-5 h-4 w-4 rotate-45 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-0 border-r-0"></span>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-300">Admin Login Baru</div>
              <ul className="max-h-80 overflow-auto divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {adminLogins.length === 0 ? (
                  <li className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">Tidak ada login baru</li>
                ) : (
                  adminLogins.map((l) => (
                    <li key={l.id} className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 dark:text-slate-100">{l.full_name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Login sebagai <span className="text-blue-600">{l.role}</span> • {l.time}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="ml-3 h-7 px-3 text-xs"
                          onClick={() => handleApprove(l.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Theme */}
        <button
          className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 grid place-items-center"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-5 h-5 text-slate-200" /> : <Moon className="h-5 h-5 text-slate-700" />}
        </button>

        {/* Profile */}
        <div className="relative" ref={refProfile}>
          <button
            onClick={() => setOpenProfile((v) => !v)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 pl-1 pr-3 py-1"
          >
            <img src="https://i.pravatar.cc/40?img=12" alt="avatar" className="h-9 w-9 rounded-full object-cover" />
            <span className="hidden sm:block text-xs font-semibold max-w-[140px] truncate text-slate-900 dark:text-slate-100">
              {profileName || '—'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60 text-slate-700 dark:text-slate-300" />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50">
              <Link
                href="/admin/settings"
                className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                onClick={() => setOpenProfile(false)}
              >
                Settings
              </Link>
              <button
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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

/* ===================== LAYOUT UTAMA ===================== */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileName, setProfileName] = useState<string>('');
  const [adminLogins, setAdminLogins] = useState<any[]>([]);

  const authFetch = useMemo(
    () => async (url: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers || {});
      if (!headers.has('Accept')) headers.set('Accept', 'application/json');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const res = await fetch(`http://localhost:8080${url}`, { ...init, headers, cache: 'no-store' });
      if (res.status === 401) {
        sessionStorage.clear();
        router.replace('/auth/signin');
      }
      return res;
    },
    [token, router]
  );

  const logout = () => {
    sessionStorage.clear();
    router.replace('/auth/signin');
  };

  useEffect(() => {
    const raw = sessionStorage.getItem('token') || '';
    const cleaned = raw.replace(/^"+|"+$/g, '');
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');

    if (!cleaned || !userData.id) {
      router.replace('/auth/signin');
      return;
    }

    setToken(cleaned);
    setUser(userData);
    setProfileName(userData.full_name || 'User');
    setReady(true);

    if (userData.role?.startsWith('admin_') && !userData.is_approved) {
      router.replace('/pending');
    }
  }, [router]);

  useEffect(() => {
    if (!ready || user?.role !== 'superadmin') return;

    const interval = setInterval(async () => {
      try {
        const res = await authFetch('/api/pending-admins');
        if (res?.ok) {
          const data = await res.json();
          const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          const logins = data.data
            .filter((a: any) => !a.is_approved)
            .map((a: any) => ({
              id: a.id,
              full_name: a.full_name,
              role: a.role.replace('admin_', '').toUpperCase(),
              time: now,
            }));
          setAdminLogins(logins);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [ready, user?.role, authFetch]);

  const handleApprove = async (adminId: number) => {
    try {
      const res = await authFetch(`/api/admins/approve/${adminId}`, { method: 'PATCH' });
      if (res?.ok) {
        setAdminLogins((prev) => prev.filter((a) => a.id !== adminId));
        alert(`Admin ${adminId} berhasil di-approve!`);
      }
    } catch (err) {
      alert('Gagal approve admin');
    }
  };

  if (!ready) {
    return <div className="p-6 text-sm text-gray-600">Loading admin…</div>;
  }

  return (
    <AuthContext.Provider value={{ token, user, authFetch, logout }}>
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
              adminLogins={adminLogins}
              handleApprove={handleApprove}
            />
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </div>
      </div>
    </AuthContext.Provider>
  );
}