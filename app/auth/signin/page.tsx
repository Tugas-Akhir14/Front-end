// app/auth/signin/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api, LoginResponse } from '@/lib/api';

export default function SignIn() {
  const router = useRouter();
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
      console.log('[LOGIN] Mengirim:', { email, password }); // DEBUG

      const res = await api('/admins/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      // TAMBAH CEK NULL
      if (!res) {
        setError('Tidak ada respons dari server');
        return;
      }

      console.log('[LOGIN] Status:', res.status); // DEBUG

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log('[LOGIN] Error data:', data); // DEBUG
        setError(data.error || 'Email atau password salah');
        return;
      }

      const data: LoginResponse = await res.json();
      console.log('[LOGIN] Success data:', data); // DEBUG

      // PASTIKAN TOKEN & USER ADA
      if (!data.token || !data.user) {
        setError('Respons tidak lengkap dari server');
        return;
      }

      // SIMPAN TANPA KUTIP!
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      console.log('[LOGIN] Token disimpan:', data.token);
      console.log('[LOGIN] User disimpan:', data.user);

      // CEK APPROVAL
      if (data.user.role.startsWith('admin_') && !data.user.is_approved) {
        router.push('/pending');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      console.error('[LOGIN] Catch error:', err);
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-4 -z-10 [background:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] rounded-3xl" />
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-black/10">
          <div className="px-8 pt-8 pb-4 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">Sign in</h1>
            <p className="mt-2 text-sm text-black/60">Welcome Back</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6" noValidate>
            {error && (
              <div className="rounded-xl border border-black/15 bg-black/5 px-4 py-3 text-sm text-black" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-12 bg-white text-black placeholder:text-black/40 border border-black/20 rounded-xl focus:border-black focus-visible:ring-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-white text-black placeholder:text-black/40 border border-black/20 rounded-xl focus:border-black focus-visible:ring-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-black text-white hover:bg-white hover:text-black border border-black rounded-xl font-semibold"
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