// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';


export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'guest' | 'admin_hotel' | 'admin_souvenir' | 'admin_buku' | 'admin_cafe'>('guest');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api('/admins/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
          password,
          confirm_password: confirmPassword,
          role,
        }),
      });

      if (!res?.ok) {
        const data = await res?.json().catch(() => ({}));
        setError(data.error || 'Gagal membuat akun');
        return;
      }

      setSuccess(
        role === 'guest'
          ? 'Registrasi berhasil! Silakan login.'
          : 'Registrasi berhasil! Menunggu persetujuan Superadmin.'
      );

      setTimeout(() => router.push('/auth/signin'), 2000);
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="w-full max-w-3xl relative">
        <div className="absolute -inset-4 -z-10 [background:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] rounded-3xl" />
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-black/10">
          <div className="px-8 pt-8 pb-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
            <p className="mt-2 text-sm text-black/60">Join Mutiara for exclusive benefits</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {error && (
                <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="md:col-span-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest</SelectItem>
                      <SelectItem value="admin_hotel">Admin Hotel</SelectItem>
                      <SelectItem value="admin_souvenir">Admin Souvenir</SelectItem>
                      <SelectItem value="admin_buku">Admin Buku</SelectItem>
                      <SelectItem value="admin_cafe">Admin Cafe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
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

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? 'Membuat Akun...' : 'Create Account'}
                </Button>
              </div>

              <div className="md:col-span-2 text-center">
                <p className="text-black/70">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="font-semibold underline decoration-black/40 hover:decoration-black">
                    Sign in here
                  </Link>
                </p>
              </div>
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