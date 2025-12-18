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
      {/* Animated decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-amber-100/20 to-yellow-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-1/4 left-1/4 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
          <Sparkles className="w-6 h-6 text-amber-300/40" />
        </div>
        <div className="absolute top-3/4 right-1/4 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1.5s' }}>
          <Sparkles className="w-5 h-5 text-yellow-300/40" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.8s' }}>
          <Sparkles className="w-4 h-4 text-amber-400/30" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card with slide-up animation */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/50 p-8 relative overflow-hidden animate-fade-in-up">
          {/* Animated golden accent borders */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-shimmer"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
          
          {/* Corner decorations */}
          <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-amber-300/30 rounded-tr-3xl"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-amber-300/30 rounded-bl-3xl"></div>
          
          {/* Header with enlarged logo and bounce animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full animate-ping"></div>
              <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={96}
                  height={96}
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent animate-fade-in">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600 mt-2 flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              Sign in to continue your journey
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-300/50 text-red-700 rounded-2xl text-sm flex items-start gap-3 shadow-sm animate-shake">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 animate-pulse"></div>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 transition-all duration-300 group-focus-within:text-amber-600 group-focus-within:scale-110" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-12 h-14 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-amber-300 hover:shadow-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 transition-all duration-300 group-focus-within:text-amber-600 group-focus-within:scale-110" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-14 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-amber-300 hover:shadow-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-6 relative overflow-hidden group animate-fade-in"
              style={{ animationDelay: '0.5s' }}
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              {isLoading ? (
                <span className="flex items-center gap-2 relative z-10">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 relative z-10">
                  <Lock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Sign In
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </span>
              )}
            </Button>

            <div className="pt-4 space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    or
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link href="/auth/signup" className="font-semibold text-amber-600 hover:text-amber-700 transition-all duration-300 hover:underline hover:underline-offset-4 inline-flex items-center gap-1">
                  Daftar Sekarang
                  <Sparkles className="w-3 h-3" />
                </Link>
              </p>

              <p className="text-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-all duration-300 group hover:gap-3"
                >
                  <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                  Kembali ke Beranda
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        {/* Bottom decorative text with icon */}
        <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <Lock className="w-3 h-3 text-amber-500" />
          Secure & Protected Login
          <Sparkles className="w-3 h-3 text-amber-500" />
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}