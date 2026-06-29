import { cookies } from 'next/headers';

const API_BASE = process.env.INTERNAL_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`API Error ${status}: ${body.substring(0, 200)}`);
  }
}

export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers);

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch {
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const bodyText = await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, bodyText);
  }

  try {
    return JSON.parse(bodyText) as T;
  } catch {
    return bodyText as unknown as T;
  }
}

export async function apiFetchWithAudit<T = any>(
  path: string,
  init: RequestInit = {},
  user: any,
  ip?: string
): Promise<T> {
  const headers = new Headers(init.headers);

  if (user) {
    headers.set('x-user-numeric-id', String(user.id));
    headers.set('x-user-name', String(user.name));
    headers.set('x-user-email', String(user.email));
    const role = user.scope === 'SYSTEM' ? 'Sistema' : user.scope === 'LAB' ? 'Lab Admin' : 'Filial Admin';
    headers.set('x-user-role', role);
  }

  if (ip) {
    headers.set('x-user-ip', ip);
  }

  return apiFetch<T>(path, {
    ...init,
    headers,
  });
}
