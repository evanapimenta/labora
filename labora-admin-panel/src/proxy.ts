import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/session';

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000'];

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.BFF_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED_ORIGINS;
}

const CORS_BASE_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

function applyCorsHeaders(response: NextResponse, origin: string) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.append('Vary', 'Origin');
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const origin = request.headers.get('origin');

  const allowedOrigins = getAllowedOrigins();
  const isAllowedOrigin = !!origin && allowedOrigins.includes(origin);

  const isApiRoute = pathname.startsWith('/api/');
  const isActionRoute = pathname.startsWith('/actions/');

  if (isApiRoute && method === 'OPTIONS') {
    const headers: Record<string, string> = { ...CORS_BASE_HEADERS };
    if (isAllowedOrigin) {
      headers['Access-Control-Allow-Origin'] = origin!;
      headers['Vary'] = 'Origin';
    }
    return new NextResponse(null, { status: 204, headers });
  }

  const isMutable =
    method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

  if (isMutable && (isApiRoute || isActionRoute)) {
    if (!origin || !isAllowedOrigin) {
      return new NextResponse(
        JSON.stringify({ error: 'origin_not_allowed', message: 'Origin não autorizada.' }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      );
    }
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (isApiRoute) {
    const response = NextResponse.next();
    if (isAllowedOrigin) {
      applyCorsHeaders(response, origin!);
    }
    return response;
  }

  const sessionCookie = request.cookies.get('session')?.value;
  let verifiedToken = sessionCookie ? await verifyToken(sessionCookie) : null;

  const isAuthPage = pathname === '/login' || pathname === '/primeiro-acesso';

  if (!verifiedToken && !isAuthPage) {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (refreshToken) {
      try {
        const API_BASE = process.env.INTERNAL_API_URL || 'http://localhost:3001';
        const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.success && data.accessToken && data.refreshToken) {
            verifiedToken = await verifyToken(data.accessToken);

            if (verifiedToken) {
              const response = NextResponse.next();
              response.cookies.set('session', data.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24,
                path: '/'
              });
              response.cookies.set('refreshToken', data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
              });
              return response;
            }
          }
        }
      } catch (error) {
        console.error('[Proxy] Erro ao tentar renovar token:', error);
      }
    }
  }

  if (isAuthPage && verifiedToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isAuthPage && !verifiedToken) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    response.cookies.delete('refreshToken');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
