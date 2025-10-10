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
  name: string;
  role: 'user' | 'admin';
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const raw = localStorage.getItem('user');

        if (!token || !raw) return;

        if (raw === 'undefined' || raw === 'null') {
          localStorage.removeItem('user');
          return;
        }

        const parsed = JSON.parse(raw);

        const isValid =
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.id === 'number' &&
          typeof parsed.email === 'string' &&
          typeof parsed.name === 'string' &&
          (parsed.role === 'user' || parsed.role === 'admin');

        if (isValid) {
          setUser(parsed as User);
        } else {
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Invalid user JSON in localStorage:', err);
        localStorage.removeItem('user');
      }
    };

    loadUser();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') loadUser();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Rooms', href: '/user/rooms' },
    { name: 'Gallery', href: '/user/gallery' },
    { name: 'News', href: '/user/news' },
    { name: 'Contact', href: '/user/contact' },
  ];

  const mid = Math.ceil(navigation.length / 2);
  const leftNav = navigation.slice(0, mid);
  const rightNav = navigation.slice(mid);

  return (
    <>
      {/* Floating header dengan tinggi lebih tipis */}
      <header
        className="fixed top-3 sm:top-5 left-0 right-0 z-50 pointer-events-none"
        role="navigation"
        aria-label="Site"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="pointer-events-auto relative overflow-visible rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20 shadow-lg shadow-black/10 hover:bg-black/40 transition-all duration-300">
            {/* GRID: 1fr auto 1fr - dengan tinggi lebih kecil */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8 py-3">
              {/* Left: Desktop nav + mobile burger */}
              <div className="flex items-center">
                <nav className="hidden md:flex w-full justify-start items-center gap-8">
                  {leftNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-white/90 hover:text-yellow-300 font-sans transition-colors duration-200 hover:scale-105 text-base"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Mobile burger */}
                <div className="md:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMenuOpen(true)}
                    className="border-white/30 hover:border-white/50 bg-transparent text-white/90 hover:text-white"
                    aria-label="Open menu"
                  >
                    <Menu size={18} />
                  </Button>
                </div>
              </div>

              {/* Center: LOGO TETAP BESAR dengan posisi lebih rendah */}
              <div className="justify-self-center my-[-3.5em] mb-[-4em]">
                <Link
                  href="/"
                  aria-label="Mutiara Balige Hotel"
                  className="inline-flex items-center hover:scale-105 transition-transform duration-200"
                >
                  <Image
                    src="/logo.png"
                    alt="Mutiara Balige"
                    width={320}
                    height={100}
                    className="h-20 w-auto sm:h-24 md:h-28 brightness-110 contrast-110"
                    priority
                  />
                </Link>
              </div>

              {/* Right: Desktop nav + user actions */}
              <div className="hidden md:flex items-center justify-end space-x-4">
                <nav className="flex items-center gap-8">
                  {rightNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-white/90 hover:text-yellow-300 font-sans transition-colors duration-200 hover:scale-105 text-base"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2 border-white/30 hover:border-white/50 bg-transparent text-white/90 hover:text-white backdrop-blur-sm text-sm"
                      >
                        <User size={16} />
                        <span>{user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 bg-black/80 backdrop-blur-xl border-white/20 text-white text-sm"
                    >
                      <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10 py-2">
                        <Link
                          href={user.role === 'admin' ? '/admin' : '/dashboard'}
                          className="flex items-center text-white/90"
                        >
                          <Settings size={16} className="mr-3" />
                          {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center text-red-300 hover:text-red-200 hover:bg-white/10 focus:bg-white/10 py-2"
                      >
                        <LogOut size={16} className="mr-3" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="border-white/30 hover:border-white/50 bg-transparent text-white/90 hover:text-white backdrop-blur-sm text-sm px-4 py-1.5"
                    >
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-yellow-500/90 hover:bg-yellow-500 text-white backdrop-blur-sm text-sm px-4 py-1.5">
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop + Sidebar */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity md:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      />
      <aside
        className={`fixed left-0 top-0 z-[61] h-dvh w-72 bg-black/95 backdrop-blur-xl shadow-2xl md:hidden transform transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
          <span className="font-semibold text-white/90">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="text-white/90 hover:bg-white/10"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md text-white/90 hover:bg-white/10 hover:text-yellow-300 font-medium transition-colors duration-200 text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <div className="border-t border-white/20 mt-3 pt-3 space-y-2">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  asChild 
                  className="w-full justify-start bg-transparent text-white/90 border-white/30 hover:bg-white/10 hover:text-white text-base"
                >
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-red-500/90 hover:bg-red-500 text-white backdrop-blur-sm text-base"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  asChild 
                  className="w-full bg-transparent text-white/90 border-white/30 hover:bg-white/10 hover:text-white text-base"
                >
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-yellow-500/90 hover:bg-yellow-500 text-white backdrop-blur-sm text-base">
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