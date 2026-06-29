import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'labora-admin-super-secret-key-development';

function toBase64Url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function signToken(payload: any, expiresInSeconds: number = 24 * 60 * 60): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

  const jwtPayload = {
    iss: 'Labify',
    sub: payload.email,
    id: payload.userId || payload.id,
    role: payload.scope || payload.role,
    name: payload.name,
    numericId: payload.id,
    username: payload.username,
    exp: Math.floor((Date.now() + expiresInSeconds * 1000) / 1000)
  };

  const data = toBase64Url(JSON.stringify(jwtPayload));

  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(`${header}.${data}`);
  const signature = hmac.digest('base64url');

  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;

    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(`${header}.${data}`);
    const expectedSignature = hmac.digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(fromBase64Url(data));

    const expMs = payload.exp > 9999999999 ? payload.exp : payload.exp * 1000;
    if (expMs < Date.now()) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}
