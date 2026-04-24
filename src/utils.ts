import { CATEGORIES, AD_TYPES, CATEGORY_LABELS, AD_TYPE_LABELS, type CategorySlug, type AdTypeSlug, AD_LOCATION_RADIUS_OPTIONS, AD_LOCATION_DEFAULT_RADIUS } from './constants';

export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder();

export function htmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function categoryLabel(slug: string | null): string {
  if (!slug) {
    return 'Разное';
  }

  return CATEGORY_LABELS[slug as CategorySlug] || 'Разное';
}

export function normalizeCategory(slug: string | null | undefined): CategorySlug {
  const value = (slug || '').trim() as CategorySlug;
  return CATEGORIES.some((category) => category.slug === value) ? value : 'misc';
}

export function typeLabel(slug: string | null): string {
  if (!slug) {
    return 'Продаю';
  }

  return AD_TYPE_LABELS[slug as AdTypeSlug] || 'Продаю';
}

export function normalizeAdType(slug: string | null | undefined): AdTypeSlug {
  const value = (slug || '').trim() as AdTypeSlug;
  return AD_TYPES.some((type) => type.slug === value) ? value : 'sell';
}

export function buildCategoryRows(
  callbackPrefix: string,
  categories: typeof CATEGORIES = CATEGORIES
): Array<Array<{ text: string; callback_data: string }>> {
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let index = 0; index < categories.length; index += 2) {
    rows.push(
      categories.slice(index, index + 2).map((category) => ({
        text: category.label,
        callback_data: `${callbackPrefix}${category.slug}`,
      }))
    );
  }
  return rows;
}

export function buildTypeRows(callbackPrefix: string): Array<Array<{ text: string; callback_data: string }>> {
  return AD_TYPES.map((type) => [
    {
      text: type.label,
      callback_data: `${callbackPrefix}${type.slug}`,
    },
  ]);
}

export function escapeLikePattern(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
}

export function isImageMimeType(mimeType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType);
}

export function getImageExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/avif':
      return 'avif';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}

export function normalizeMimeType(mimeType: string | null | undefined): string | null {
  const normalized = (mimeType || '').split(';', 1)[0].trim().toLowerCase();
  return normalized || null;
}

export function getImageMimeTypeFromPath(filePath: string): string | null {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'avif':
      return 'image/avif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return null;
  }
}

export function isFileLike(value: File | string | null): value is File {
  return typeof value !== 'string' && value instanceof File;
}

export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= 1) {
    return '…';
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }

  return result === 0;
}

export function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    const byte = Number.parseInt(hex.slice(index, index + 2), 16);
    if (!Number.isFinite(byte)) {
      return null;
    }
    bytes[index / 2] = byte;
  }

  return bytes;
}

export function formatSqliteTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getUTCFullYear(),
    '-',
    pad(date.getUTCMonth() + 1),
    '-',
    pad(date.getUTCDate()),
    ' ',
    pad(date.getUTCHours()),
    ':',
    pad(date.getUTCMinutes()),
    ':',
    pad(date.getUTCSeconds()),
  ].join('');
}

export function base64UrlEncode(value: string): string {
  return bytesToBase64(textEncoder.encode(value))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export function base64UrlDecode(value: string): string {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return textDecoder.decode(base64ToBytes(normalized + '='.repeat(padLength)));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidLogin(login: string): boolean {
  return /^[a-zA-Z0-9_]{3,32}$/.test(login);
}

export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:';
}

export function sanitizeNextPath(value: string | null | undefined): string {
  const next = (value || '').trim();
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/my';
  }

  return next;
}

export function parseOptionalNumberField(value: string | File | null): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseOptionalTextField(value: string | File | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeLocationRadius(radius: number | null | undefined): number | null {
  if (radius === null || radius === undefined || !Number.isFinite(radius)) {
    return null;
  }

  const normalized = Math.trunc(radius);
  return AD_LOCATION_RADIUS_OPTIONS.includes(normalized as (typeof AD_LOCATION_RADIUS_OPTIONS)[number])
    ? normalized
    : AD_LOCATION_DEFAULT_RADIUS;
}

export function formatLocationRadius(radius: number | null | undefined): string {
  const normalized = normalizeLocationRadius(radius);
  if (normalized === 500) return '500 м';
  if (normalized === 1000) return '1 км';
  if (normalized === 3000) return '3 км';
  if (normalized === 5000) return '5 км';
  return 'зона встречи';
}
