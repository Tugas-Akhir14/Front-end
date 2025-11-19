// components/Layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
        // GUNAKAN sessionStorage (SAMA DENGAN contact/page.tsx)
        const token = sessionStorage.getItem('access_token');
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
          setUser(null);
        }
      } catch (err) {
        console.error('Invalid user in sessionStorage:', err);
        sessionStorage.removeItem('user');
        setUser(null);
      }
    };

    loadUser();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'access_token') loadUser();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
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

  return (
    <>
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="pointer-events-auto rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-lg hover:bg-black/40 transition-all">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8 py-3">
              {/* Left */}
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

              {/* Right */}
              <div className="hidden md:flex items-center justify-end space-x-4">
                <nav className="flex gap-8">
                  {rightNav.map((item) => (
                    <Link key={item.name} href={item.href} className="text-white/90 hover:text-yellow-300 transition-colors hover:scale-105 text-base">
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center space-x-2 border-white/30 hover:border-white/50 bg-transparent text-white/90 text-sm">
                        <User size={16} />
                        <span>{user.full_name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-black/80 backdrop-blur-xl border-white/20 text-white text-sm">
                      <DropdownMenuItem asChild>
                        <Link href={getDashboardLink()} className="flex items-center text-white/90">
                          <Settings size={16} className="mr-3" />
                          {user.role === 'guest' ? 'Dashboard' : 'Admin Panel'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="text-red-300 hover:text-red-200">
                        <LogOut size={16} className="mr-3" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button variant="outline" asChild className="border-white/30 hover:border-white/50 bg-transparent text-white/90 text-sm">
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-yellow-500/90 hover:bg-yellow-500 text-white text-sm">
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
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
          <div className="border-t border-white/20 mt-3 pt-3 space-y-2">
            {user ? (
              <>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent text-white/90 border-white/30">
                  <Link href={getDashboardLink()} onClick={() => setIsMenuOpen(false)}>
                    {user.role === 'guest' ? 'Dashboard' : 'Admin Panel'}
                  </Link>
                </Button>
                <Button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full bg-red-500/90 hover:bg-red-500 text-white">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full bg-transparent text-white/90 border-white/30">
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild className="w-full bg-yellow-500/90 hover:bg-yellow-500 text-white">
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}