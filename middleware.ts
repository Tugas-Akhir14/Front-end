// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const userCookie = req.cookies.get('user')?.value;

  if (!token || !userCookie) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  let user;
  try {
    user = JSON.parse(userCookie);
  } catch {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Cek approval
  if (user.role.startsWith('admin_') && !user.is_approved) {
    if (req.nextUrl.pathname !== '/pending') {
      return NextResponse.redirect(new URL('/pending', req.url));
    }
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;

  // Superadmin bisa semua
  if (user.role === 'superadmin') {
    return NextResponse.next();
  }

  // Role-based access
  const allowedPaths: Record<string, string[]> = {
    admin_hotel: ['/admin/hotel'],
    admin_souvenir: ['/admin/souvenir'],
    admin_buku: ['/admin/book'],
    admin_cafe: ['/admin/cafe'],
  };

  const allowed = allowedPaths[user.role] || [];
  const hasAccess = allowed.some(p => pathname.startsWith(p));

  if (pathname.startsWith('/admin') && !hasAccess) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/pending', '/unauthorized'],
};