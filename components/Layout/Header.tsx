
      // components/Layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Settings, Star, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'guest' | 'admin_hotel' | 'admin_souvenir' | 'admin_book' | 'admin_cafe' | 'superadmin';
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadUser = () => {
      try {
        const token = sessionStorage.getItem('token');
        const raw = sessionStorage.getItem('user');

        if (!token || !raw) {
          setUser(null);
          return;
        }

        const parsed = JSON.parse(raw);
        const isValid =
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.id === 'number' &&
          typeof parsed.email === 'string' &&
          typeof parsed.full_name === 'string' &&
          ['guest', 'admin_hotel', 'admin_souvenir', 'admin_book', 'admin_cafe', 'superadmin'].includes(parsed.role);

        if (isValid) {
          setUser(parsed as User);
        } else {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Invalid user in sessionStorage:', err);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/user/about' },
    { name: 'Gallery', href: '/user/gallery' },
    { name: 'News', href: '/user/news' },
    { name: 'Contact', href: '/user/contact' },
    { name: 'Facilities', href: '/user/facilities' },
  ];

  const mid = Math.ceil(navigation.length / 2);
  const leftNav = navigation.slice(0, mid);
  const rightNav = navigation.slice(mid);

  const getDashboardLink = () => {
    if (!user) return '/auth/signin';
    return user.role === 'guest' ? '/dashboard' : '/admin';
  };

  // PROFILE DROPDOWN — VERSI FINAL YANG KAMU MAU
  const ProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-white/30 hover:border-white/50 bg-transparent text-white/90 hover:text-yellow-300 transition-all rounded-full"
        >
          <User size={20} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-black/95 backdrop-blur-xl border-white/20 text-white p-0 overflow-hidden rounded-2xl">
        {user ? (
          // USER SUDAH LOGIN → TAMPILKAN PROFIL LENGKAP
          <div className="p-5">
            {/* Header Profil */}
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center border-3 border-amber-400 shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white truncate">{user.full_name}</h3>
                <p className="text-sm text-gray-300 truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium text-amber-400">VIP Member</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
                <Calendar className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Bookings</p>
                <p className="text-lg font-bold text-amber-400">5</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
                <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Points</p>
                <p className="text-lg font-bold text-amber-400">1,250</p>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-white/20" />

            {/* Menu Actions */}
            <div className="space-y-1 pt-3">
              <DropdownMenuItem asChild>
                <Link href="/user/profile" className="flex items-center px-3 py-3 hover:bg-amber-500/20 rounded-lg cursor-pointer transition-all">
                  <User size={18} className="mr-3 text-amber-400" />
                  <span className="font-medium">See Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={getDashboardLink()} className="flex items-center px-3 py-3 hover:bg-amber-500/20 rounded-lg cursor-pointer transition-all">
                  <Settings size={18} className="mr-3 text-amber-400" />
                  <span className="font-medium">
                    {user.role === 'guest' ? 'My Dashboard' : 'Admin Panel'}
                  </span>
                </Link>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-white/20 my-3" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg cursor-pointer transition-all font-medium"
            >
              <LogOut size={18} className="mr-3" />
              Logout
            </DropdownMenuItem>
          </div>
        ) : (
          // USER BELUM LOGIN → TAMPILKAN CARD LOGIN
          <div className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center border-4 border-amber-400 mx-auto mb-4 shadow-xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2">Welcome Back!</h3>
            <p className="text-sm text-gray-400 mb-6">Sign in to manage your bookings & profile</p>

            <div className="space-y-3">
              <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-6">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-amber-500 text-amber-400 hover:bg-amber-500/20 font-medium">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-5">
              Join now and earn rewards on every stay
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* ... bagian header lainnya tetap sama ... */}
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="pointer-events-auto rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-lg hover:bg-black/40 transition-all">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8 py-3">
              {/* Left Nav */}
              <div className="flex items-center">
                <nav className="hidden md:flex gap-8">
                  {leftNav.map((item) => (
                    <Link key={item.name} href={item.href} className="text-white/90 hover:text-yellow-300 transition-colors hover:scale-105 text-base">
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="md:hidden">
                  <Button variant="outline" size="sm" onClick={() => setIsMenuOpen(true)} className="border-white/30 hover:border-white/50 bg-transparent text-white/90">
                    <Menu size={18} />
                  </Button>
                </div>
              </div>

              {/* Logo */}
              <div className="justify-self-center my-[-3.5em] mb-[-4em]">
                <Link href="/" className="inline-flex hover:scale-105 transition-transform">
                  <Image src="/logo.png" alt="Mutiara Balige" width={320} height={100} className="h-20 w-auto sm:h-24 md:h-28 brightness-110" priority />
                </Link>
              </div>

              {/* Right Nav + Profile */}
              <div className="hidden md:flex items-center justify-end space-x-6">
                <nav className="flex gap-8">
                  {rightNav.map((item) => (
                    <Link key={item.name} href={item.href} className="text-white/90 hover:text-yellow-300 transition-colors hover:scale-105 text-base">
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Profile Dropdown (yang baru) */}
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </header>

      

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-[60] bg-black/40 transition-opacity md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)} />
      <aside className={`fixed left-0 top-0 z-[61] h-dvh w-72 bg-black/95 backdrop-blur-xl shadow-2xl md:hidden transform transition-transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between px-4 py-3 border-b border-white/20">
          <span className="font-semibold text-white/90">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="text-white/90">
            <X size={18} />
          </Button>
        </div>
        <div className="px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-white/90 hover:bg-white/10 hover:text-yellow-300 text-base">
              {item.name}
            </Link>
          ))}
          
          {/* Mobile Profile Section */}
          <div className="border-t border-white/20 mt-3 pt-3 space-y-3">
            {user ? (
              <>
                {/* Mobile Profile Info */}
                <div className="flex items-center space-x-3 px-3 py-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center border-2 border-amber-400">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{user.full_name}</h4>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                
                <Button variant="outline" asChild className="w-full justify-start bg-transparent text-white/90 border-white/30">
                  <Link href="/user/profile" onClick={() => setIsMenuOpen(false)}>
                    <User size={16} className="mr-3" />
                    My Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent text-white/90 border-white/30">
                  <Link href={getDashboardLink()} onClick={() => setIsMenuOpen(false)}>
                    <Settings size={16} className="mr-3" />
                    {user.role === 'guest' ? 'Dashboard' : 'Admin Panel'}
                  </Link>
                </Button>
                <Button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full bg-red-500/90 hover:bg-red-500 text-white">
                  <LogOut size={16} className="mr-3" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <div className="text-center px-3 py-2">
                  <p className="text-sm text-gray-400 mb-3">Sign in to access your profile</p>
                </div>
                <Button variant="outline" asChild className="w-full bg-transparent text-white/90 border-white/30">
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-yellow-500/90 hover:bg-yellow-500 text-white">
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}