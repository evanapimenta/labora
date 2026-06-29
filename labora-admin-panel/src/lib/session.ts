const SECRET_KEY = process.env.JWT_SECRET || 'labora-admin-super-secret-key-development';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const str = base64.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(str);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

const encoder = new TextEncoder();

async function getCryptoKey() {
  return await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signToken(payload: any): Promise<string> {
  const key = await getCryptoKey();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwtPayload = {
    iss: 'Labify',
    sub: payload.email,
    id: payload.userId || payload.id,
    role: payload.scope || payload.role,
    name: payload.name,
    numericId: payload.id,
    username: payload.username,
    exp: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000)
  };

  const data = btoa(JSON.stringify(jwtPayload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const signatureBuffer = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${header}.${data}`)
  );

  const signature = arrayBufferToBase64(signatureBuffer);
  return `${header}.${data}.${signature}`;
}

export async function verifyToken(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    const key = await getCryptoKey();

    const verified = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      base64ToArrayBuffer(signature),
      encoder.encode(`${header}.${data}`)
    );

    if (!verified) return null;

    const payloadStr = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);

    const expMs = payload.exp > 9999999999 ? payload.exp : payload.exp * 1000;
    if (expMs < Date.now()) return null;

    const role = payload.role ?? payload.scope;
    const email = payload.sub ?? payload.email;
    const userId = payload.id && payload.sub ? payload.id : (payload.userId ?? payload.id);
    const numericId = payload.numericId ?? (typeof payload.id === 'number' ? payload.id : payload.userId);

    return {
      userId: String(userId),
      id: numericId,
      name: payload.name ?? email ?? 'Usuário',
      username: payload.username ?? email?.split('@')[0] ?? 'usuario',
      email: email,
      scope: role,
      role: role,
      iss: payload.iss ?? 'Labify'
    };
  } catch (e) {
    return null;
  }
}
