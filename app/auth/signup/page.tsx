'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validate = () => {
    const name = fullName.trim();
    const mail = email.trim();
    const phone = phoneNumber.trim();

    if (!name || !mail || !phone || !password || !confirmPassword) {
      setError('Lengkapi semua field.');
      return false;
    }
    // basic email check
    if (!/^\S+@\S+\.\S+$/.test(mail)) {
      setError('Format email tidak valid.');
      return false;
    }
    // simple phone check (angka, +, spasi, tanda hubung)
    if (!/^[+0-9\s-]{8,}$/.test(phone)) {
      setError('Nomor telepon tidak valid.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/admins/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
          password,
          confirm_password: confirmPassword,
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        // simpan jika backend mengembalikan token/user (opsional)
        if (data?.token) localStorage.setItem('token', data.token);
        if (data?.user) {
          try {
            localStorage.setItem('user', JSON.stringify(data.user));
          } catch {
            localStorage.removeItem('user');
          }
        }
        router.push('/auth/signin');
      } else {
        setError(data?.error || 'Failed to create account');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="w-full max-w-3xl relative">
        {/* Background grid halus */}
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
            <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
            <p className="mt-2 text-sm text-black/60">Join Mutiara for exclusive benefits</p>
          </div>

          {/* Form (grid 2 kolom di ≥ md) */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alert error (full width) */}
              {error && (
                <div
                  className="md:col-span-2 rounded-xl border border-black/15 bg-black/5 px-4 py-3 text-sm text-black"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}

              {/* KIRI */}
              <div className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-black">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="
                        pl-10
                        border-black/20 focus:border-black
                        focus-visible:ring-0 focus-visible:ring-offset-0
                        placeholder:text-black/40
                      "
                      placeholder="Enter your full name"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="
                        pl-10
                        border-black/20 focus:border-black
                        focus-visible:ring-0 focus-visible:ring-offset-0
                        placeholder:text-black/40
                      "
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-black">Phone Number</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="
                        pl-10
                        border-black/20 focus:border-black
                        focus-visible:ring-0 focus-visible:ring-offset-0
                        placeholder:text-black/40
                      "
                      placeholder="e.g. +62 812-3456-7890"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              {/* KANAN */}
              <div className="space-y-6">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="
                        pl-10 pr-10
                        border-black/20 focus:border-black
                        focus-visible:ring-0 focus-visible:ring-offset-0
                        placeholder:text-black/40
                      "
                      placeholder="Create a password"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        absolute right-3 top-1/2 -translate-y-1/2
                        text-black/50 hover:text-black
                        transition-colors
                      "
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-black/50">Min. 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-black">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="
                        pl-10 pr-10
                        border-black/20 focus:border-black
                        focus-visible:ring-0 focus-visible:ring-offset-0
                        placeholder:text-black/40
                      "
                      placeholder="Confirm your password"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="
                        absolute right-3 top-1/2 -translate-y-1/2
                        text-black/50 hover:text-black
                        transition-colors
                      "
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tombol submit (full width) */}
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  className="
                    w-full py-3 text-base font-semibold
                    bg-black text-white hover:bg-white hover:text-black
                    border border-black
                    rounded-xl transition-colors
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>

              {/* Link signin (full width) */}
              <div className="md:col-span-2 text-center">
                <p className="text-black/70">
                  Already have an account?{' '}
                  <Link
                    href="/auth/signin"
                    className="font-semibold underline decoration-black/40 hover:decoration-black"
                  >
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
