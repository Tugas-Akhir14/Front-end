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
  Crown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
  const cls = tone === 'green' 
    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700' 
    : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700';
  const clsDark = tone === 'green' 
    ? 'dark:from-amber-500/20 dark:to-yellow-500/20 dark:text-amber-300' 
    : 'dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-300';
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cls} ${clsDark} shadow-sm`}>
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
      className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-amber-900/20 dark:hover:to-yellow-900/20 transition-all duration-200 border border-transparent hover:border-amber-200/50 dark:hover:border-amber-700/50"
      title={label}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-300 grid place-items-center shadow-sm group-hover:shadow-md transition-shadow">
          <I name={icon} className="h-5 w-5" />
        </div>
        {effectiveExpanded && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] text-slate-700 dark:text-slate-200 font-medium truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">{label}</span>
            {badge && <Badge>{badge}</Badge>}
          </div>
        )}
      </div>
      {effectiveExpanded && <I name="chevron-down" className="h-4 w-4 opacity-60 dark:opacity-70 text-amber-600" />}
    </Link>
  );

  const desktopWidth = effectiveExpanded ? 'md:w-[260px]' : 'md:w-[72px]';
  const mobileClasses = 'fixed inset-y-0 left-0 z-40 w-[260px] bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 md:static md:z-auto md:h-screen md:w-auto';
  const desktopClasses = 'md:shrink-0 md:h-screen md:sticky md:top-0 md:border-r md:border-amber-200/50 dark:md:border-amber-800/30';
  const mobileVisible = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobile}
      />
      <aside
        className={`${mobileClasses} ${desktopClasses} ${desktopWidth} transition-all duration-200 ease-out transform md:transform-none ${mobileVisible} shadow-xl md:shadow-none`}
        onMouseEnter={() => setIsPeeking(true)}
        onMouseLeave={() => setIsPeeking(false)}
      >
        <div className="px-4 py-5 flex items-center gap-3 border-b border-amber-200/50 dark:border-amber-800/30">
          <div className="h-9 w-9 rounded-xl grid place-items-center shadow-lg">
              
                        <Image
                          src="/logo.png"
                          alt="Logo"
                          width={32}
                          height={32}
                          className="object-contain"
                          priority
                        />
                      
          </div>
          {effectiveExpanded && (
            <div className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              {role === 'superadmin' ? 'SuperAdmin' : 'Admin Panel'}
            </div>
          )}
        </div>

        <div className="px-3 pb-20 overflow-y-auto h-[calc(100vh-72px)] flex flex-col">
          {menus.map((menu, i) => (
            <div key={i} className="mb-6">
              {effectiveExpanded && (
                <div className="px-2 mb-2 text-[13px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
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
          <div className="mt-auto pt-6 border-t border-amber-200/50 dark:border-amber-800/30">
            {effectiveExpanded && (
              <div className="px-2 mb-2 text-[13px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                SUPPORT
              </div>
            )}
            <div className="space-y-1.5">
              <div className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-amber-900/20 dark:hover:to-yellow-900/20 cursor-pointer flex items-center gap-3 transition-all" title="Chat">
                <I name="chat" className="h-5 h-5" /> {effectiveExpanded && <span>Chat</span>}
              </div>
              <div className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-amber-900/20 dark:hover:to-yellow-900/20 cursor-pointer flex items-center gap-3 transition-all" title="Settings">
                <I name="info" className="h-5 h-5" /> {effectiveExpanded && <span>Settings</span>}
              </div>
              <button
                onClick={logout}
                className="w-full px-3 py-2.5 text-[12px] text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center gap-3 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
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

/* ===================== TOPBAR ===================== */
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
    <div className="h-[64px] w-full border-b border-amber-200/50 dark:border-amber-800/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-10 shadow-sm">
      <button
        className="h-10 w-10 rounded-xl border-2 border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 grid place-items-center hover:shadow-md transition-all"
        onClick={() => (window.matchMedia('(min-width: 768px)').matches ? onToggleDesktop() : onOpenMobile())}
      >
        <GridIcon className="h-5 h-5 text-amber-700 dark:text-amber-300" />
      </button>

      <div className="flex w-full relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-amber-400" />
        <input
          placeholder="Search or type command…"
          className="w-full rounded-xl bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-200/50 dark:border-amber-700/50 pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-amber-600/50 dark:placeholder:text-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600 focus:border-amber-400 dark:focus:border-amber-500 transition-all"
        />
      </div>

      <div className="flex w-full justify-end items-start gap-2 md:gap-3">
        {/* NOTIFIKASI */}
        <div className="relative" ref={refNotif}>
          <button
            className="h-10 w-10 rounded-full border-2 border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 grid place-items-center relative hover:shadow-md transition-all"
            onClick={() => setOpenNotif((v) => !v)}
          >
            <Bell className="h-5 h-5 text-amber-700 dark:text-amber-300" />
            {adminLogins.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 grid place-items-center shadow-lg">
                {adminLogins.length > 9 ? '9+' : adminLogins.length}
              </span>
            )}
          </button>

          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border-2 border-amber-200/50 dark:border-amber-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
              <span className="pointer-events-none absolute -top-2 right-5 h-4 w-4 rotate-45 bg-white dark:bg-slate-800 border-2 border-amber-200/50 dark:border-amber-700/50 border-b-0 border-r-0"></span>
              <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-b border-amber-200/50 dark:border-amber-700/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Admin Login Baru</span>
                </div>
              </div>
              <ul className="max-h-80 overflow-auto divide-y divide-amber-100 dark:divide-amber-800/30 text-sm">
                {adminLogins.length === 0 ? (
                  <li className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">Tidak ada login baru</li>
                ) : (
                  adminLogins.map((l) => (
                    <li key={l.id} className="px-4 py-3 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{l.full_name}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Login sebagai <span className="font-medium text-amber-600 dark:text-amber-400">{l.role}</span> • {l.time}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-md"
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
          className="h-10 w-10 rounded-full border-2 border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 grid place-items-center hover:shadow-md transition-all"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-5 h-5 text-amber-300" /> : <Moon className="h-5 h-5 text-amber-700" />}
        </button>

        {/* Profile */}
        <div className="relative" ref={refProfile}>
          <button
            onClick={() => setOpenProfile((v) => !v)}
            className="flex items-center gap-3 rounded-xl border-2 border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 pl-1 pr-3 py-1 hover:shadow-md transition-all"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5">
              <img src="https://i.pravatar.cc/40?img=12" alt="avatar" className="h-full w-full rounded-full object-cover" />
            </div>
            <span className="hidden sm:block text-xs font-semibold max-w-[140px] truncate text-slate-900 dark:text-slate-100">
              {profileName || '—'}
            </span>
            <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border-2 border-amber-200/50 dark:border-amber-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
              <Link
                href="/admin/settings"
                className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-amber-900/20 dark:hover:to-yellow-900/20 transition-all"
                onClick={() => setOpenProfile(false)}
              >
                Settings
              </Link>
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border-t border-amber-200/50 dark:border-amber-700/50"
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl">
            
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm text-amber-700 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, authFetch, logout }}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 text-slate-900 dark:text-slate-100 text-[13px]">
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