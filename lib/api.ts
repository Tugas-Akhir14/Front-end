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

    // === 401: Token kadaluarsa / tidak valid ===
    if (res.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/auth/signin';
      return null;
    }

    // === PARSE JSON ===
    let data;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.error('[API] JSON Parse Error:', text);
      throw new Error('Server mengembalikan data tidak valid');
    }

    console.log('[API] Response Data:', data);

    // === ERROR DARI SERVER ===
    if (!res.ok) {
      const msg = data?.error || data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data; // ← INI YANG PENTING: RETURN JSON, BUKAN Response!
  } catch (err: any) {
    console.error('[API] Error:', err);
    throw err; // Biarkan error naik ke UI
  }
};

// Helper untuk PATCH
export const approveAdmin = (id: number) =>
  api(`/admins/approve/${id}`, { method: 'PATCH' });