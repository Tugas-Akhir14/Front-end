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
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 lg:px-12 bg-white">
        <div className="w-full max-w-md py-12">
          <div className="animate-fade-in-up">
            {/* Header with logo */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-xl font-semibold text-gray-800">Mutiara Balige Hotel</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Nice to see you again
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm flex items-start gap-3 animate-shake">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 animate-pulse"></div>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-600 text-sm font-normal">
                  Login
                </Label>
                <Input
                  type="email"
                  placeholder="Email or phone number"
                  className="h-12 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 bg-gray-50 hover:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 text-sm font-normal">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className="h-12 pr-12 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 bg-gray-50 hover:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>

              <div className="pt-4 space-y-4">

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                    Sign up now
                  </Link>
                </p>

                <p className="text-center">
                  <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium transition-all duration-300"
                  >
                    <span>←</span>
                    Kembali ke Beranda
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

     {/* Right side - Info Panel */}
<div
  className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center relative overflow-hidden bg-cover bg-center"
  style={{
    backgroundImage: "url('/mutiara.jpg')",
  }}
>
  {/* White overlay */}
  <div className="absolute inset-0 bg-white/60"></div>

  {/* Content */}
  <div className="relative z-10 text-black text-center px-12 max-w-xl">
   <Image
                    src="/logo.png"
                    alt="Logo"
                    width={170}
                    height={170}
                    className="object-contain"
                    priority
                  />

    <div
      className="space-y-3 text-xl mb-8 animate-fade-in"
      style={{ animationDelay: "0.2s" }}
    >

    </div>

    <button
      className="bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 animate-fade-in"
      style={{ animationDelay: "0.4s" }}
    >
      <Link href="/auth/signup" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                    Sign up now
                  </Link>
    </button>
  </div>
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

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}