// lib/api.ts
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

export type RegisterResponse = {
  message: string;
  data: {
    id: number;
    full_name: string;
    role: string;
    is_approved: boolean;
  };
};

const API_URL = 'http://localhost:8080';

// lib/api.ts
export const api = async (endpoint: string, options: RequestInit = {}) => {
  const rawToken = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const token = rawToken?.replace(/^"+|"+$/g, '') || null; // HAPUS KUTIP!

  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
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

    // TAMBAH LOG UNTUK DEBUG
    console.log('[API] Request:', endpoint, options.method);
    console.log('[API] Response status:', res.status);

    if (res.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/auth/signin';
      return null;
    }

    return res;
  } catch (err) {
    console.error('[API] Network error:', err);
    return null;
  }
};
// lib/api.ts
export const approveAdmin = (id: number) =>
  api(`/admins/approve/${id}`, { method: 'PATCH' });