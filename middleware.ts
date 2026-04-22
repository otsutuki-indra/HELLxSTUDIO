import { verifySession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value;

  // Check if route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const userId = await verifySession(token);
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      const userId = await verifySession(token);
      if (userId) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|icon.svg).*)'],
};
