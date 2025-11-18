// app/auth/signin/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8080/admins/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Email atau password salah');
        return;
      }

      const data = await res.json();

      // SIMPAN KE sessionStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // SIMPAN KE COOKIE (untuk middleware)
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user=${JSON.stringify(data.user)}; path=/; max-age=86400; SameSite=Lax`;

      const role = data.user.role;
      const approved = data.user.is_approved;

      if (!approved && role.startsWith('admin_')) {
        window.location.href = '/pending';
        return;
      }

      const redirectMap: Record<string, string> = {
        superadmin: '/admin/hotel/dashboard',
        admin_hotel: '/admin/hotel/dashboard',
        admin_souvenir: '/admin/souvenir/dashboard',
        admin_buku: '/admin/book/dashboard',
        admin_cafe: '/admin/cafe/dashboard',
        guest: '/',
      };

      const target = redirectMap[role] || '/admin/dashboard';

      // PAKSA FULL RELOAD
      window.location.href = target;

    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-amber-100/20 to-yellow-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/50 p-8 relative overflow-hidden">
          {/* Golden accent border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          
          {/* Header with enlarged logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={96}
                height={96}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600 mt-2">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-300/50 text-red-700 rounded-2xl text-sm flex items-start gap-3 shadow-sm">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></div>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 transition-colors group-focus-within:text-amber-600" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-12 h-14 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white/50 backdrop-blur-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 transition-colors group-focus-within:text-amber-600" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-14 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white/50 backdrop-blur-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <Sparkles className="w-4 h-4" />
                </span>
              )}
            </Button>

            <div className="pt-4 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link href="/auth/signup" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                  Daftar Sekarang
                </Link>
              </p>

              <p className="text-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors group"
                >
                  <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                  Kembali ke Beranda
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        {/* Bottom decorative text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Secure & Protected Login
        </p>
      </div>
    </div>
  );
}