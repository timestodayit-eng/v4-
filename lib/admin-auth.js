import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'landing_admin_session';

function safeEqual(a = '', b = '') {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function checkAdminCredentials(email, password) {
  const configuredEmail = process.env.ADMIN_EMAIL || '';
  const configuredPassword = process.env.ADMIN_PASSWORD || '';
  if (!configuredEmail || !configuredPassword) return false;
  return safeEqual(String(email).trim().toLowerCase(), configuredEmail.trim().toLowerCase()) &&
         safeEqual(String(password), configuredPassword);
}

export function createSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters.');
  const expiresAt = Date.now() + (8 * 60 * 60 * 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${expiresAt}.${nonce}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  try {
    if (!token) return false;
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) return false;
    const [expiresAt, nonce, signature] = String(token).split('.');
    if (!expiresAt || !nonce || !signature) return false;
    if (Date.now() > Number(expiresAt)) return false;
    const payload = `${expiresAt}.${nonce}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return safeEqual(signature, expected);
  } catch {
    return false;
  }
}

export function getAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function setAdminSession(token) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export function clearAdminSession() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });
}
