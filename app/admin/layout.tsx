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
import { Toaster } from 'sonner';
import { SiAlmalinux,} from "react-icons/si";
import { CiCircleList } from "react-icons/ci";
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type AuthCtx = {
  token: string;
  user: any;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  logout: () => void;
};
const     AuthContext = createContext<AuthCtx | null>(null);
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
        { icon: 'dashboard', label: 'Dashboard', href: '/admin/hotel/dashboard' },
        { icon: 'bed', label: 'Rooms', href: '/admin/hotel/room', },
        { icon: 'list', label: 'Type', href: '/admin/hotel/type',  },
        { icon: 'newspaper', label: 'News', href: '/admin/hotel/news',  },
        { icon: 'booking', label: 'Booking', href: '/admin/hotel/booking',  },
        { icon: 'gallery', label: 'Gallery', href: '/admin/hotel/gallery' },  
        { icon: 'review', label: 'Review', href: '/admin/hotel/review' },
      ],
    }] : []),
    ...(can(['admin_souvenir']) ? [{
      title: 'MANAGE SOUVENIR',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/admin/souvenir/dashboard' },
        { icon: 'product', label: 'Product', href: '/admin/souvenir/product', },
        { icon: 'category', label: 'Category', href: '/admin/souvenir/category' },
      ],
    }] : []),
    ...(can(['admin_buku']) ? [{
      title: 'MANAGE BUKU',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/admin/book/dashboard' },
        { icon: 'book', label: 'Product', href: '/admin/book/product',  },
        { icon: 'category', label: 'Category', href: '/admin/book/category' },
      ],
    }] : []),
    ...(can(['admin_cafe']) ? [{
      title: 'MANAGE CAFE',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/admin/cafe/dashboard' },
        { icon: 'cafe', label: 'Menu', href: '/admin/cafe/product', },
        { icon: 'category', label: 'Category', href: '/admin/cafe/category',  },
      ],
    }] : []),
    ...(role === 'superadmin' ? [{
      title: 'SUPERADMIN',
      items: [
        { icon: 'module', label: 'All Modules', href: '/admin/dashboard' },
        { icon: 'admin', label: 'Pending Admins', href: '/admin/pending' },
      ],
    }] : []),
  ];

  const Item = ({ icon, label, badge, href }: { icon: string; label: string; badge?: string; href: string }) => (
    <Link
      href={href}
      className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white dark:bg-black transition-all duration-200 "
      title={label}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-white dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-300 grid place-items-center shadow-sm group-hover:shadow-md transition-shadow">
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
  const mobileClasses = 'fixed inset-y-0 left-0 z-40 w-[260px] bg-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 md:static md:z-auto md:h-screen md:w-auto';
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
            <div className="text-lg font-extrabold tracking-tight bg-gray-900 dark:bg-white bg-clip-text text-transparent">
              {role === 'superadmin' ? 'SuperAdmin' : 'Admin Panel'}
            </div>
          )}
        </div>

        <div className="px-3 pb-20 overflow-y-auto h-[calc(100vh-72px)] flex flex-col">
          {menus.map((menu, i) => (
            <div key={i} className="mb-6">
              {effectiveExpanded && (
                <div className="px-2 mb-2 text-[13px] font-bold text-black dark:text-white flex items-center gap-2">
                  <SiAlmalinux />
                  {menu.title}
                </div>
              )}
              <nav className="space-y-1.5">
                {menu.items.map((item, j) => (
                  <Item key={j} icon={item.icon} label={item.label} href={item.href}/>
                ))}
              </nav>
            </div>
          ))}

          {/* SUPPORT */}
          <div className="mt-auto pt-6 border-t border-amber-200/50 dark:border-amber-800/30">
            {effectiveExpanded && (
              <div className="px-2 mb-2 text-[13px] font-bold text-blue-600 flex items-center gap-2">
                <SiAlmalinux className="w-3 h-3" />
                SUPPORT
              </div>
            )}
            <div className="space-y-1.5">
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
    <div className="h-[64px] w-full dark:border-amber-800/30 bg-white dark:bg-slate-900/80 backdrop-blur-xl flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-10 shadow-sm">
      <button
        className="h-10 w-10 rounded-xl grid place-items-center hover:shadow-md transition-all"
        onClick={() => (window.matchMedia('(min-width: 768px)').matches ? onToggleDesktop() : onOpenMobile())}
      >
        <CiCircleList className="h-10 h-10 text-black dark:white" />
      </button>

     <div className="flex w-full relative max-w-md">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
  <input
    type="text"
    placeholder="Search or type command…"
    className="
      w-full 
      pl-10 pr-4 py-2.5 
      text-sm 
      bg-white dark:bg-gray-800 
      border border-gray-300 dark:border-gray-700 
      rounded-lg 
      placeholder:text-gray-500 dark:placeholder:text-gray-400 
      text-gray-900 dark:text-gray-100 
      focus:outline-none 
      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
      focus:border-blue-500 dark:focus:border-blue-400 
      transition-all duration-200
      shadow-sm hover:shadow"  />
</div>

      <div className="flex w-full justify-end items-start gap-2 md:gap-3">
  {/* NOTIFIKASI */}
  <div className="relative" ref={refNotif}>
    <button
      onClick={() => setOpenNotif(v => !v)}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      {adminLogins.length > 0 && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
          {adminLogins.length > 9 ? '9+' : adminLogins.length}
        </span>
      )}
    </button>

    {/* Dropdown Notifikasi */}
    {openNotif && (
      <div className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden z-50">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Pending Admin Approval</h3>
          </div>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {adminLogins.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              Tidak ada login baru
            </div>
          ) : (
            adminLogins.map((l: any) => (
              <div
                key={l.id}
                className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {l.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Login sebagai <span className="font-semibold text-blue-600 dark:text-blue-400">Admin {l.role}</span> • {l.time}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(l.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>

  {/* TEMA */}
  <button
    onClick={toggleTheme}
    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
    {theme === 'dark' ? (
      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    ) : (
      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    )}
  </button>

  {/* PROFILE */}
  <div className="relative" ref={refProfile}>
    <button
      onClick={() => setOpenProfile(v => !v)}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="w-9 h-9 rounded-full ring-2 ring-gray-300 dark:ring-gray-600 overflow-hidden">
        <img
          src="https://i.pravatar.cc/40?img=12"
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
        {profileName || 'User'}
      </span>
      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    </button>

    {/* Dropdown Profile */}
    {openProfile && (
      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden z-50">
        <Link
          href="/admin/settings"
          className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setOpenProfile(false)}
        >
          Settings
        </Link>
        <button
          onClick={() => {
            setOpenProfile(false);
            onLogout();
          }}
          className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
<div className="min-h-screen bg-white flex items-center justify-center">
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
        <Toaster 
  position="top-right" 
  richColors 
  closeButton 
  toastOptions={{
    classNames: {
      toast: 'text-sm font-medium',
      success: 'bg-emerald-500 text-white',
      error: 'bg-red-500 text-white',
      loading: 'bg-blue-500 text-white',
    }
  }}
/>
      </div>
    </AuthContext.Provider>
  );
}