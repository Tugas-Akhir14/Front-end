// app/auth/signup/page.tsx → VERSI FINAL (semua dalam satu halaman)
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Lock, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const API_URL = 'http://localhost:8080';

export default function SignUp() {
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'guest'>('guest');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admins/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
          password,
          confirm_password: confirmPassword,
          role,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (res.status >= 200 && res.status < 300) {
        if (role === 'guest') {
          setSuccess('Kode OTP telah dikirim ke email Anda!');
          setStep('otp');
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } else {
          setSuccess('Registrasi berhasil! Menunggu persetujuan Superadmin.');
          setTimeout(() => router.push('/auth/signin'), 2000);
        }
      } else {
        setError(data.error || data.message || 'Gagal membuat akun');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Masukkan kode OTP 6 digit');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/public/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpCode }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (res.status >= 200 && res.status < 300) {
        setSuccess('Akun berhasil diverifikasi! Mengarahkan ke login...');
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        setError(data.error || data.message || 'Kode OTP tidak valid atau sudah kadaluarsa');
      }
    } catch (err) {
      setError('Gagal memverifikasi OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-20 w-40 h-40 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-yellow-200/20 to-amber-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/50 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg">
              <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-contain" priority />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              {step === 'register' ? 'Join Mutiara' : 'Verifikasi OTP'}
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              {step === 'register' ? 'Create your account for exclusive benefits' : 'Masukkan kode 6 digit yang dikirim ke email Anda'}
            </p>
          </div>

          {/* REGISTER FORM */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="px-8 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {error && (
                  <div className="md:col-span-2 rounded-2xl border border-red-300/50 bg-red-50/80 px-5 py-4 text-sm text-red-700 flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="md:col-span-2 rounded-2xl border border-green-300/50 bg-green-50/80 px-5 py-4 text-sm text-green-700 flex items-start gap-3 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="pl-12 h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-12 h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                      <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="pl-12 h-12 border-2 border-amber-200/50 rounded-xl focus:border-amber-400" placeholder="+62 812 3456 7890" />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as any)}>
                      <SelectTrigger className="h-12 border-2 border-amber-200/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">Guest (Booking Kamar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                      <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-12 pr-12 h-12 border-2 border-amber-200/50 rounded-xl" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                        {showPassword ? <EyeOff className="w-5 h-5 text-amber-500" /> : <Eye className="w-5 h-5 text-amber-500" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                      <Input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-12 pr-12 h-12 border-2 border-amber-200/50 rounded-xl" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5 text-amber-500" /> : <Eye className="w-5 h-5 text-amber-500" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-6">
                  <Button type="submit" className="w-full h-14 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-xl font-semibold shadow-lg" disabled={isLoading}>
                    {isLoading ? 'Membuat Akun...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* OTP FORM */}
          {step === 'otp' && (
            <div className="px-8 pb-10">
              <div className="max-w-md mx-auto space-y-6">
                {error && (
                  <div className="rounded-2xl border border-red-300/50 bg-red-50/80 px-5 py-4 text-sm text-red-700 flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
                {success && !error && (
                  <div className="rounded-2xl border border-green-300/50 bg-green-50/80 px-5 py-4 text-sm text-green-700 flex items-start gap-3 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
                    <Mail className="w-10 h-10 text-amber-600" />
                  </div>
                  <p className="text-gray-600">Kode OTP telah dikirim ke</p>
                  <p className="font-semibold text-amber-700 mt-1">{email}</p>
                </div>

                <form onSubmit={handleVerifyOtp}>
                  <div className="flex justify-center gap-3 mb-8">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <Button type="submit" className="w-full h-14 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-xl font-semibold shadow-lg" disabled={isLoading || otp.join('').length !== 6}>
                    {isLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                  </Button>
                </form>

                <div className="text-center">
                  <button type="button" onClick={() => setStep('register')} className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                    ← Kembali ke registrasi
                  </button>
                </div>
              </div>
            </div>

          )}

          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        </div>

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