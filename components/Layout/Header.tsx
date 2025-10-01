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
  // jalankan hanya di client
  if (typeof window === 'undefined') return;

  const loadUser = () => {
    try {
      const token = localStorage.getItem('token');
      const raw = localStorage.getItem('user');

      if (!token || !raw) return; // belum login / data belum ada

      // Tolak string "undefined" / "null"
      if (raw === 'undefined' || raw === 'null') {
        localStorage.removeItem('user');
        return;
      }

      const parsed = JSON.parse(raw);

      // Validasi minimal bentuk objek user
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
        // kalau struktur tidak sesuai, bersihkan agar tidak error lagi
        localStorage.removeItem('user');
      }
    } catch (err) {
      // JSON corrupt → bersihkan supaya tidak crash
      console.error('Invalid user JSON in localStorage:', err);
      localStorage.removeItem('user');
    }
  };

  loadUser();

  // Sinkron saat tab lain mengubah localStorage
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'user' || e.key === 'token') loadUser();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}, 
[]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Rooms', href: '/rooms' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'News', href: '/news' },
    { name: 'Contact', href: '/contact' },
  ];

  const mid = Math.ceil(navigation.length / 2);
  const leftNav = navigation.slice(0, mid);
  const rightNav = navigation.slice(mid);

  return (
    <>
      {/* Floating header */}
      <header
        className="
          fixed top-3 sm:top-5 left-0 right-0 z-50
          pointer-events-none
        "
        role="navigation"
        aria-label="Site"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div
            className="
              pointer-events-auto relative overflow-visible
              rounded-2xl border border-amber-200/60
              bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60
              shadow-xl
            "
          >
            {/* GRID: 1fr auto 1fr */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8 py-3">
              {/* Left: Desktop nav + mobile burger */}
              <div className="flex items-center">
                <nav className="hidden md:flex w-full justify-start items-center gap-10">
                  {leftNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-700 hover:text-yellow-600 font-sans transition-colors"
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
                    className="border-yellow-300 hover:border-yellow-400"
                    aria-label="Open menu"
                  >
                    <Menu size={20} />
                  </Button>
                </div>
              </div>

              {/* Center: LOGO saja */}
              <div className="justify-self-center">
                <Link
                  href="/"
                  aria-label="Mutiara Balige Hotel"
                  className="inline-flex items-center"
                >
                  <Image
                    src="/logo.png"
                    alt="Mutiara Balige"
                    width={160}
                    height={48}
                    className="h-10 w-auto sm:h-12 md:h-14"
                    priority
                  />
                </Link>
              </div>

              {/* Right: Desktop nav + user actions */}
              <div className="hidden md:flex items-center justify-end space-x-5">
                <nav className="flex items-center gap-10">
                  {rightNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-700 hover:text-yellow-600 font-sans transition-colors"
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
                        className="flex items-center space-x-2 border-yellow-300 hover:border-yellow-400"
                      >
                        <User size={16} />
                        <span>{user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link
                          href={user.role === 'admin' ? '/admin' : '/dashboard'}
                          className="flex items-center"
                        >
                          <Settings size={16} className="mr-2" />
                          {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center text-red-600"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="border-yellow-300 hover:border-yellow-400"
                    >
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
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
        className={`fixed left-0 top-0 z-[61] h-dvh w-72 bg-white shadow-2xl md:hidden
        transform transition-transform duration-300 ease-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <div className="border-t mt-3 pt-3 space-y-2">
            {user ? (
              <>
                <Button variant="outline" asChild className="w-full justify-start">
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
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700">
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
