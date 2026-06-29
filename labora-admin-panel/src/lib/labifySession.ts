import { cookies } from 'next/headers';

export const ACCESS_COOKIE_NAME = 'labify_admin_access';
export const REFRESH_COOKIE_NAME = 'labify_admin_refresh';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

const COOKIE_DOMAIN = process.env.LABIFY_BFF_COOKIE_DOMAIN || undefined;
const SECURE = process.env.NODE_ENV === 'production';

function decodeJwtExpSeconds(jwt: string): number | null {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    const payloadJson = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    const payload = JSON.parse(payloadJson);
    if (typeof payload.exp === 'number') return payload.exp;
    return null;
  } catch {
    return null;
  }
}

function maxAgeFromJwt(jwt: string, fallbackSeconds: number): number {
  const exp = decodeJwtExpSeconds(jwt);
  if (exp === null) return fallbackSeconds;
  const now = Math.floor(Date.now() / 1000);
  const remaining = exp - now;
  return remaining > 0 ? remaining : fallbackSeconds;
}

export async function setSessionCookies(tokens: SessionTokens): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE_NAME, tokens.accessToken, {
    httpOnly: true,
    secure: SECURE,
    sameSite: 'lax',
    path: '/',
    domain: COOKIE_DOMAIN,
    maxAge: maxAgeFromJwt(tokens.accessToken, 60 * 60),
  });

  cookieStore.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    httpOnly: true,
    secure: SECURE,
    sameSite: 'lax',
    path: '/',
    domain: COOKIE_DOMAIN,
    maxAge: maxAgeFromJwt(tokens.refreshToken, 60 * 60 * 24 * 7),
  });
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE_NAME)?.value ?? null;
}

export async function getServerRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}
