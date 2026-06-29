import {
  getServerAccessToken,
  getServerRefreshToken,
  setSessionCookies,
  clearSessionCookies,
} from './labifySession';

const API_BASE = process.env.LABIFY_API_URL ?? 'http://localhost:8080';
const REFRESH_TIMEOUT_MS = 5_000;
const RETRY_BASE_DELAY_MS = 200;
const MAX_RETRIES = 3;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_MS = 30_000;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    public readonly code?: string,
  ) {
    super(`API error ${status}${code ? ` [${code}]` : ''}: ${body.substring(0, 200)}`);
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isTokenExpired(): boolean {
    return this.status === 401 && this.code === 'token_expired';
  }
}

interface CircuitBreakerState {
  failures: number;
  openedAt: number | null;
}

const breaker: CircuitBreakerState = { failures: 0, openedAt: null };

function isCircuitOpen(): boolean {
  if (breaker.openedAt === null) return false;
  const elapsed = Date.now() - breaker.openedAt;
  if (elapsed > CIRCUIT_BREAKER_RESET_MS) {
    breaker.failures = 0;
    breaker.openedAt = null;
    return false;
  }
  return true;
}

function recordFailure(): void {
  breaker.failures += 1;
  if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    breaker.openedAt = Date.now();
  }
}

function recordSuccess(): void {
  breaker.failures = 0;
  breaker.openedAt = null;
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: ApiFetchOptions = {},
): Promise<T> {
  if (isCircuitOpen()) {
    throw new ApiError(503, 'Circuit breaker open', 'circuit_open');
  }

  const url = `${API_BASE}${path}`;
  let response = await tryWithRefresh(url, init, /*alreadyRefreshed*/ false);

  if (!response.ok) {
    recordFailure();
    const body = await safeReadBody(response);
    throw new ApiError(response.status, body, extractCode(body));
  }

  recordSuccess();
  return parseBody<T>(response);
}

async function tryWithRefresh(
  url: string,
  init: ApiFetchOptions,
  alreadyRefreshed: boolean,
): Promise<Response> {
  const response = await fetchWithRetry(url, init);

  if (response.status !== 401 || alreadyRefreshed) {
    return response;
  }

  const body = await safeReadBody(response);
  const code = extractCode(body);
  if (code !== 'token_expired') {
    return new Response(body, { status: 401, statusText: response.statusText });
  }

  const refreshed = await tryRefresh();
  if (!refreshed) {
    await clearSessionCookies();
    return new Response('refresh_failed', { status: 401 });
  }

  return tryWithRefresh(url, init, /*alreadyRefreshed*/ true);
}

async function fetchWithRetry(url: string, init: ApiFetchOptions): Promise<Response> {
  const headers = await buildHeaders(init);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        headers,
        cache: 'no-store',
      });

      if (response.status >= 500 && attempt < MAX_RETRIES - 1) {
        await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) throw error;
      await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
    }
  }

  throw new ApiError(503, 'API unreachable');
}

async function buildHeaders(init: ApiFetchOptions): Promise<Headers> {
  const headers = new Headers(init.headers as HeadersInit | undefined);

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (init.auth !== false) {
    const token = await getServerAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await getServerRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as { accessToken: string; refreshToken: string };
    if (!data.accessToken || !data.refreshToken) return false;

    await setSessionCookies(data);
    return true;
  } catch {
    return false;
  }
}

function extractCode(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed?.code === 'string') return parsed.code;
  } catch {
  }
  return undefined;
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

async function parseBody<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
