// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Lock, Eye, EyeOff, Sparkles, Crown } from 'lucide-react';
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
          ? 'Registrasi berhasil! Silakan verifikasi email Anda.'
          : 'Registrasi berhasil! Silakan verifikasi email Anda.'
      );
      
      setTimeout(() => router.push('/auth/signup/verify-otp'), 2000);
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-20 w-40 h-40 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-yellow-200/20 to-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-amber-100/20 to-yellow-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/50 overflow-hidden relative">
          {/* Top golden accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16  rounded-2xl mb-4 shadow-lg">
              <Image
                src="/logo.png"
                alt="Logo"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Join Mutiara
            </h1>
            <p className="mt-3 text-sm text-gray-600">Create your account for exclusive benefits</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Error Message */}
              {error && (
                <div className="md:col-span-2 rounded-2xl border border-red-300/50 bg-red-50/80 backdrop-blur-sm px-5 py-4 text-sm text-red-700 flex items-start gap-3 shadow-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="md:col-span-2 rounded-2xl border border-green-300/50 bg-green-50/80 backdrop-blur-sm px-5 py-4 text-sm text-green-700 flex items-start gap-3 shadow-sm">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Left Column */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5 transition-colors group-focus-within:text-amber-600" />
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5 transition-colors group-focus-within:text-amber-600" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Phone Number</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5 transition-colors group-focus-within:text-amber-600" />
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Account Type</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as any)}>
                    <SelectTrigger className="h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white/50 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-amber-200">
                      <SelectItem value="guest" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-500" />
                          Guest
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5 transition-colors group-focus-within:text-amber-600" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-12 pr-12 h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="••••••••"
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

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5 transition-colors group-focus-within:text-amber-600" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-12 pr-12 h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 mt-2">
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <Sparkles className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </div>

              {/* Sign In Link */}
              <div className="md:col-span-2 text-center pt-2">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-amber-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-500">Already a member?</span>
                  </div>
                </div>

                <p className="text-gray-600">
                  <Link
                    href="/auth/signin"
                    className="font-semibold text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1 group"
                  >
                    Sign in here
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </p>
              </div>
            </div>
          </form>

          {/* Bottom golden accent */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            © {new Date().getFullYear()} Hotel Mutiara - Premium Experience
            <Sparkles className="w-3 h-3 text-amber-500" />
          </p>
        </div>
      </div>
    </div>
  );
}