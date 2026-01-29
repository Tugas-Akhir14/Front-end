// lib/api.ts → VERSI FINAL & 100% BERHASIL
export type User = {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_approved: boolean;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: User;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = async (endpoint: string, options: RequestInit = {}) => {
  const rawToken = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const token = rawToken?.replace(/^"+|"+$/g, '') || null;

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    });

    console.log('[API] Request:', endpoint, options.method || 'GET');
    console.log('[API] Status:', res.status);

    // 401 → token kadaluarsa
    if (res.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
      return null;
    }

    // Parse body dulu
    let data: any = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('[API] JSON Parse Error:', text);
        throw new Error('Server mengembalikan data tidak valid');
      }
    }

    console.log('[API] Response Data:', data);
    const isSuccess = res.status >= 200 && res.status < 300;

    if (!isSuccess) {
      const msg = data?.error || data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  } catch (err: any) {
    console.error('[API] Error:', err);
    throw err;
  }
};
export const approveAdmin = (id: number) =>
  api(`/api/admins/approve/${id}`, { method: 'PATCH' });