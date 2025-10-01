'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/admins/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Amankan parse JSON (kalau response kosong/tidak valid)
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok) {
        // Simpan token & user jika tersedia
        if (data?.token) localStorage.setItem('token', data.token);
        if (data?.user) {
          try {
            localStorage.setItem('user', JSON.stringify(data.user));
          } catch {
            // fallback jika gagal stringify
            localStorage.removeItem('user');
          }
        }
        // SPA navigate
        router.push('/admin/dashboard');
      } else {
        setError(data?.error || 'Email atau password salah.');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="w-full max-w-md relative">
        {/* Grid monokrom halus di belakang */}
        <div
          className="
            absolute -inset-4 -z-10
            [background:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)]
            [background-size:24px_24px]
            opacity-[0.04]
            rounded-3xl
          "
          aria-hidden
        />
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-black/10">
          {/* Heading */}
          <div className="px-8 pt-8 pb-4 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">Sign in</h1>
            <p className="mt-2 text-sm text-black/60">Welcome Back👋</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6" noValidate>
            {error && (
              <div
                className="rounded-xl border border-black/15 bg-black/5 px-4 py-3 text-sm text-black"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-black">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="
                    pl-10 h-12
                    bg-white text-black placeholder:text-black/40
                    border border-black/20 rounded-xl
                    focus:border-black focus-visible:ring-0 focus-visible:ring-offset-0
                  "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-black">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="
                    pl-10 pr-10 h-12
                    bg-white text-black placeholder:text-black/40
                    border border-black/20 rounded-xl
                    focus:border-black focus-visible:ring-0 focus-visible:ring-offset-0
                  "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="
                w-full h-12
                bg-black text-white hover:bg-white hover:text-black
                border border-black rounded-xl
                font-semibold transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed
              "
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm text-black/70">
              don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium underline decoration-black/40 hover:decoration-black">
                Create Account
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-black/50">
          © {new Date().getFullYear()} Hotel Mutiara
        </div>
      </div>
    </div>
  );
}
