import { textEncoder, bytesToHex, bytesToBase64, base64ToBytes, constantTimeEqual } from './utils';
import { PASSWORD_HASH_ITERATIONS } from './constants';

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export async function sha256Bytes(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
  return new Uint8Array(digest);
}

export async function hmacSha256Hex(secret: string | Uint8Array, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    typeof secret === 'string' ? textEncoder.encode(secret) : secret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(value));
  return bytesToHex(new Uint8Array(signature));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const key = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256
  );

  return `pbkdf2_sha256$${PASSWORD_HASH_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(derivedBits))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, iterationsText, saltBase64, hashBase64] = storedHash.split('$');
  if (algorithm !== 'pbkdf2_sha256' || !iterationsText || !saltBase64 || !hashBase64) {
    return false;
  }

  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false;
  }

  const salt = base64ToBytes(saltBase64);
  const expectedHash = base64ToBytes(hashBase64);
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    key,
    expectedHash.length * 8
  );

  return constantTimeEqual(new Uint8Array(derivedBits), expectedHash);
}

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export async function hashSessionToken(token: string): Promise<string> {
  return sha256Hex(token);
}
