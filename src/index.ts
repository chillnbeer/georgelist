const CATEGORIES = [
  { slug: 'things', label: 'Вещи' },
  { slug: 'jobs', label: 'Работа' },
  { slug: 'services', label: 'Услуги' },
  { slug: 'rent', label: 'Аренда' },
  { slug: 'creative', label: 'Творчество' },
  { slug: 'misc', label: 'Разное' },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category.label])
) as Record<CategorySlug, string>;

type Env = {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_ADMIN_ID: string;
  USER_TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_USER_BOT_TOKEN?: string;
  USER_TELEGRAM_BOT_USERNAME?: string;
  TELEGRAM_USER_BOT_USERNAME?: string;
  PUBLIC_SITE_URL?: string;
  SITE_URL?: string;
};

type CurrentUser = {
  id: number;
  login: string;
  display_name: string | null;
  email: string | null;
  role: string;
  avatar_key: string | null;
  avatar_mime_type: string | null;
  avatar_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

type AdRow = {
  id: number;
  title: string;
  body: string;
  category: string | null;
  owner_user_id: number | null;
  status: string;
  image_key: string | null;
  image_mime_type: string | null;
  image_updated_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type PublicAdCardRow = {
  id: number;
  title: string;
  body: string;
  category: string | null;
  image_key: string | null;
  image_mime_type: string | null;
  image_updated_at: string | null;
  created_at: string;
  author_login: string | null;
  author_avatar_key: string | null;
};

type AdCardRow = {
  id: number;
  title: string;
  category: string | null;
  image_key: string | null;
  created_at: string;
  author_login: string | null;
  author_avatar_key: string | null;
};

type PublicUserRow = {
  id: number;
  login: string;
  display_name: string | null;
  avatar_key: string | null;
  avatar_mime_type: string | null;
  avatar_updated_at: string | null;
  created_at: string;
};

type AdForm = {
  title: string;
  body: string;
  category: string;
  image: File | null;
};

type AdImageUpload = {
  key: string;
  mimeType: string;
};

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  message?: {
    chat: {
      id: number;
    };
    message_id: number;
    text?: string;
    caption?: string;
  };
};

type TelegramUpdate = {
  callback_query?: TelegramCallbackQuery;
  message?: {
    message_id: number;
    chat: {
      id: number;
    };
    from?: {
      id: number;
      username?: string;
    };
    text?: string;
    photo?: Array<{
      file_id: string;
    }>;
    document?: {
      file_id: string;
      mime_type?: string;
      file_name?: string;
    };
  };
};

type UserIdentityRow = {
  id: number;
  user_id: number;
  provider: string;
  provider_user_id: string | null;
  email: string | null;
  password_hash: string | null;
  telegram_username: string | null;
  created_at: string;
};

type SessionRow = {
  id: number;
  user_id: number;
  session_token_hash: string;
  created_at: string;
  expires_at: string;
};

type TelegramAuthPayload = {
  id: string;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  auth_date: number;
  hash: string;
};

type BotDraftRow = {
  id: number;
  telegram_user_id: string;
  action: string;
  step: string;
  ad_id: number | null;
  login: string | null;
  email: string | null;
  category: string | null;
  title: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
};

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_HASH_ITERATIONS = 100000;
const TELEGRAM_AUTH_COOKIE_NAME = 'telegram_auth';
const TELEGRAM_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;
const TELEGRAM_AUTH_MAX_AGE_SECONDS = 60 * 60 * 24;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const AD_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const USER_BOT_MENU_CREATE = 'user:create';
const USER_BOT_MENU_SECTIONS = 'user:sections';
const USER_BOT_MENU_SEARCH = 'user:search';
const USER_BOT_MENU_EDIT = 'user:edit';
const USER_BOT_MENU_DELETE = 'user:delete';
const USER_BOT_MENU_SETTINGS = 'user:settings';
const USER_BOT_MENU_MY = 'user:my';
const USER_BOT_MENU_MY_AD = 'user:myad:';
const USER_BOT_SECTION_PREFIX = 'user:section:';
const USER_BOT_SECTION_AD_PREFIX = 'user:sectionad:';
const USER_BOT_SECTION_MORE_PREFIX = 'user:more:';
const USER_BOT_SEARCH_RESULTS = 'user:search:results';
const USER_BOT_SEARCH_AD_PREFIX = 'user:searchad:';
const USER_BOT_SEARCH_MORE_PREFIX = 'user:searchmore:';
const BOT_ADS_PAGE_SIZE = 5;
const USER_BOT_DELETE_PREFIX = 'delete_';
const USER_BOT_SETTINGS_PREFIX = 'user:settings:';
const USER_BOT_DRAFT_PREFIX = 'draft:';
const USER_BOT_DRAFT_CANCEL = 'draft:confirm:cancel';
const USER_BOT_DRAFT_SEND = 'draft:confirm:send';
const USER_BOT_EDIT_DRAFT_CANCEL = 'draft:edit:cancel';
const USER_BOT_EDIT_DRAFT_SAVE = 'draft:edit:save';
const ADMIN_BOT_MENU_HOME = 'admin:home';
const AD_SELECT_COLUMNS = `
  id,
  title,
  body,
  category,
  owner_user_id,
  status,
  image_key,
  image_mime_type,
  image_updated_at,
  created_at,
  updated_at,
  deleted_at
`;
const USER_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
let cachedTelegramUserBotUsername: string | null = null;
let cachedTelegramUserBotUsernamePromise: Promise<string | null> | null = null;
let cachedEnsureAdImageColumnsPromise: Promise<void> | null = null;
let cachedEnsureUserAvatarColumnsPromise: Promise<void> | null = null;
const NOOP_EXECUTION_CONTEXT = {
  waitUntil(): void {},
  passThroughOnException(): void {},
} as unknown as ExecutionContext;

function htmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function text(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  });
}

function redirect(location: string, status = 303): Response {
  return redirectWithHeaders(location, status);
}

function redirectWithHeaders(location: string, status = 303, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Location', location);
  return new Response(null, {
    status,
    headers: responseHeaders,
  });
}

function redirectWithMessage(path: string, message: string, status = 303, headers?: HeadersInit): Response {
  return redirectWithHeaders(`${path}?message=${encodeURIComponent(message)}`, status, headers);
}

function categoryLabel(slug: string | null): string {
  if (!slug) {
    return 'Разное';
  }

  return CATEGORY_LABELS[slug as CategorySlug] || 'Разное';
}

function normalizeCategory(slug: string | null | undefined): CategorySlug {
  const value = (slug || '').trim() as CategorySlug;
  return CATEGORIES.some((category) => category.slug === value) ? value : 'misc';
}

function escapeLikePattern(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
}

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function isImageMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType);
}

function getImageExtension(mimeType: string): string {
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

function buildMediaUrl(env: Env, key: string): string {
  return buildPublicSiteUrl(env, `/media/${encodeURIComponent(key)}`);
}

function normalizeMimeType(mimeType: string | null | undefined): string | null {
  const normalized = (mimeType || '').split(';', 1)[0].trim().toLowerCase();
  return normalized || null;
}

function getImageMimeTypeFromPath(filePath: string): string | null {
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

async function putMediaObject(env: Env, key: string, body: ArrayBuffer, mimeType: string): Promise<void> {
  if (!env.MEDIA_BUCKET) {
    throw new Error('Media bucket is not configured');
  }

  await env.MEDIA_BUCKET.put(key, body, {
    httpMetadata: {
      contentType: mimeType,
    },
  });
}

async function readImageUpload(file: File | null): Promise<AdImageUpload | null> {
  if (!file || file.size <= 0) {
    return null;
  }

  if (file.size > AD_IMAGE_MAX_BYTES) {
    throw new Error('Image is too large');
  }

  if (!isImageMimeType(file.type)) {
    throw new Error('Invalid image type');
  }

  return {
    key: `ads/${crypto.randomUUID()}.${getImageExtension(file.type)}`,
    mimeType: file.type,
  };
}

async function readAvatarUpload(file: File | null): Promise<AdImageUpload | null> {
  if (!file || file.size <= 0) {
    return null;
  }

  if (file.size > USER_AVATAR_MAX_BYTES) {
    throw new Error('Avatar is too large');
  }

  if (!isImageMimeType(file.type)) {
    throw new Error('Invalid avatar type');
  }

  return {
    key: `avatars/${crypto.randomUUID()}.${getImageExtension(file.type)}`,
    mimeType: file.type,
  };
}

async function putAdImage(env: Env, upload: AdImageUpload, file: File): Promise<void> {
  await putMediaObject(env, upload.key, await file.arrayBuffer(), upload.mimeType);
}

async function deleteAdImage(env: Env, key: string | null | undefined): Promise<void> {
  if (!key || !env.MEDIA_BUCKET) {
    return;
  }

  await env.MEDIA_BUCKET.delete(key);
}

async function deleteAvatarImage(env: Env, key: string | null | undefined): Promise<void> {
  await deleteAdImage(env, key);
}

async function downloadTelegramImage(
  env: Env,
  fileId: string
): Promise<{ bytes: ArrayBuffer; mimeType: string }> {
  const fileResponse = await userBotApi(env, 'getFile', { file_id: fileId });
  if (!fileResponse.ok) {
    throw new Error(`Telegram getFile failed with status ${fileResponse.status}`);
  }

  const payload = (await fileResponse.json()) as { ok?: boolean; result?: { file_path?: string; file_size?: number } };
  const filePath = payload.result?.file_path || null;
  if (!filePath) {
    throw new Error('Telegram file path is missing');
  }

  const token = await getTelegramUserBotToken(env);
  const downloadResponse = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
  if (!downloadResponse.ok) {
    throw new Error(`Telegram file download failed with status ${downloadResponse.status}`);
  }

  const bytes = await downloadResponse.arrayBuffer();
  if (bytes.byteLength > USER_AVATAR_MAX_BYTES) {
    throw new Error('Avatar is too large');
  }

  const mimeType = normalizeMimeType(downloadResponse.headers.get('content-type')) || getImageMimeTypeFromPath(filePath) || 'image/jpeg';
  if (!isImageMimeType(mimeType)) {
    throw new Error('Invalid avatar type');
  }

  return { bytes, mimeType };
}

async function putTelegramAvatar(env: Env, fileId: string): Promise<AdImageUpload & { bytes: ArrayBuffer }> {
  const { bytes, mimeType } = await downloadTelegramImage(env, fileId);
  return {
    key: `avatars/${crypto.randomUUID()}.${getImageExtension(mimeType)}`,
    mimeType,
    bytes,
  };
}

function isFileLike(value: File | string | null): value is File {
  return typeof value !== 'string' && value instanceof File;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= 1) {
    return '…';
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }

  return result === 0;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function sha256Bytes(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
  return new Uint8Array(digest);
}

async function hmacSha256Hex(secret: string | Uint8Array, value: string): Promise<string> {
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

function hexToBytes(hex: string): Uint8Array | null {
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

function formatSqliteTimestamp(date: Date): string {
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

function generateSessionToken(): string {
  return crypto.randomUUID();
}

async function hashSessionToken(token: string): Promise<string> {
  return sha256Hex(token);
}

function base64UrlEncode(value: string): string {
  return bytesToBase64(textEncoder.encode(value))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlDecode(value: string): string {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return textDecoder.decode(base64ToBytes(normalized + '='.repeat(padLength)));
}

async function hashPassword(password: string): Promise<string> {
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

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
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

function parseCookieHeader(cookieHeader: string | null): Map<string, string> {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) {
      continue;
    }

    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name) {
      try {
        cookies.set(name, decodeURIComponent(value));
      } catch {
        cookies.set(name, value);
      }
    }
  }

  return cookies;
}

function getCookieValue(request: Request, name: string): string | null {
  return parseCookieHeader(request.headers.get('Cookie')).get(name) || null;
}

function sanitizeNextPath(value: string | null | undefined): string {
  const next = (value || '').trim();
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/my';
  }

  return next;
}

function buildTelegramAuthCallbackUrl(request: Request, mode: 'login' | 'link', nextPath: string | null = null): string {
  const url = new URL('/telegram/auth', request.url);
  url.searchParams.set('mode', mode);
  if (nextPath) {
    url.searchParams.set('next', nextPath);
  }

  return url.toString();
}

function buildSessionCookie(token: string, secure: boolean): string {
  return [
    `session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function clearSessionCookie(secure: boolean): string {
  return [
    'session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function buildTelegramAuthCookie(value: string, secure: boolean): string {
  return [
    `${TELEGRAM_AUTH_COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${TELEGRAM_AUTH_COOKIE_MAX_AGE_SECONDS}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function clearTelegramAuthCookie(secure: boolean): string {
  return [
    `${TELEGRAM_AUTH_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

async function getTelegramUserBotToken(env: Env): Promise<string> {
  const token = env.USER_TELEGRAM_BOT_TOKEN || env.TELEGRAM_USER_BOT_TOKEN;
  if (!token) {
    throw new Error('Missing user Telegram bot token');
  }

  return token;
}

async function getTelegramUserBotUsername(env: Env): Promise<string | null> {
  if (cachedTelegramUserBotUsername) {
    return cachedTelegramUserBotUsername;
  }

  const configuredUsername = env.USER_TELEGRAM_BOT_USERNAME || env.TELEGRAM_USER_BOT_USERNAME || null;
  if (configuredUsername) {
    cachedTelegramUserBotUsername = configuredUsername;
    return configuredUsername;
  }

  if (!cachedTelegramUserBotUsernamePromise) {
    cachedTelegramUserBotUsernamePromise = (async () => {
      const token = await getTelegramUserBotToken(env);
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { ok?: boolean; result?: { username?: string } };
      const username = data.result?.username || null;
      if (username) {
        cachedTelegramUserBotUsername = username;
      }

      return username;
    })().finally(() => {
      cachedTelegramUserBotUsernamePromise = null;
    });
  }

  return cachedTelegramUserBotUsernamePromise;
}

async function getTelegramAuthSecret(env: Env): Promise<string> {
  return getTelegramUserBotToken(env);
}

async function verifyTelegramLoginPayload(params: URLSearchParams, env: Env): Promise<TelegramAuthPayload | null> {
  const id = params.get('id') || '';
  const firstName = params.get('first_name') || '';
  const authDateText = params.get('auth_date') || '';
  const hash = params.get('hash') || '';

  if (!id || !firstName || !authDateText || !hash) {
    return null;
  }

  const authDate = Number(authDateText);
  if (!Number.isInteger(authDate) || authDate <= 0) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > TELEGRAM_AUTH_MAX_AGE_SECONDS) {
    return null;
  }

  const allowedKeys = ['auth_date', 'first_name', 'hash', 'id', 'last_name', 'photo_url', 'username'];
  const dataCheckString = allowedKeys
    .filter((key) => key !== 'hash')
    .map((key) => [key, params.get(key)] as const)
    .filter(([, value]) => value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secret = await getTelegramAuthSecret(env);
  const computedHash = await hmacSha256Hex(await sha256Bytes(secret), dataCheckString);
  if (computedHash !== hash.toLowerCase()) {
    return null;
  }

  return {
    id,
    first_name: firstName,
    last_name: params.get('last_name'),
    username: params.get('username'),
    photo_url: params.get('photo_url'),
    auth_date: authDate,
    hash,
  };
}

async function buildPendingTelegramAuthValue(env: Env, payload: TelegramAuthPayload): Promise<string> {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256Hex(await getTelegramAuthSecret(env), encoded);
  return `${encoded}.${signature}`;
}

async function readPendingTelegramAuthValue(env: Env, request: Request): Promise<TelegramAuthPayload | null> {
  const rawValue = getCookieValue(request, TELEGRAM_AUTH_COOKIE_NAME);
  if (!rawValue) {
    return null;
  }

  const [encoded, signature] = rawValue.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = await hmacSha256Hex(await getTelegramAuthSecret(env), encoded);
  const expectedBytes = hexToBytes(expectedSignature);
  const providedBytes = hexToBytes(signature);
  if (!expectedBytes || !providedBytes || !constantTimeEqual(expectedBytes, providedBytes)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as TelegramAuthPayload;
    if (!payload?.id || !payload?.first_name || !payload?.auth_date) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now - payload.auth_date > TELEGRAM_AUTH_MAX_AGE_SECONDS) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function nav(currentUser: CurrentUser | null = null): string {
  const adminLink = currentUser && currentUser.role === 'admin' ? ' <a href="/admin">админка</a>' : '';
  const authLinks = currentUser
    ? `<a href="/u/${encodeURIComponent(currentUser.login)}">мой профиль</a> <a href="/settings">настройки</a>${adminLink} <form method="post" action="/logout" style="display:inline"><button class="link-button" type="submit">выйти</button></form>`
    : `<a href="/login">войти</a> <a href="/register">зарегистрироваться</a>`;

  return `<div class="nav"><a href="/">главная</a> <a href="/new">создать объявление</a> ${authLinks}</div>`;
}

function shell(title: string, body: string, currentUser: CurrentUser | null = null, status = 200): Response {
  return html(`<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${htmlEscape(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 12px;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.35;
    }
    h1 {
      margin: 0 0 8px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 34px;
      font-weight: 400;
    }
    h2 {
      margin: 14px 0 6px;
      font-size: 16px;
      font-weight: 700;
    }
    p { margin: 0 0 10px; }
    a {
      color: #00f;
      text-decoration: underline;
    }
    .nav {
      margin: 0 0 10px;
    }
    .nav form {
      display: inline;
      margin: 0;
    }
    .link-button {
      color: #00f;
      text-decoration: underline;
      background: none;
      border: 0;
      padding: 0;
      font: inherit;
      cursor: pointer;
    }
    label {
      display: block;
      margin: 6px 0 2px;
    }
    input, textarea, select {
      width: 100%;
      max-width: 640px;
      margin: 0 0 4px;
      padding: 4px 6px;
      border: 1px solid #bbb;
      background: #fff;
      color: #000;
      font: inherit;
      box-sizing: border-box;
    }
    textarea {
      min-height: 100px;
      resize: vertical;
    }
    button {
      margin-top: 4px;
      border: 1px solid #999;
      background: #f5f5f5;
      color: #000;
      padding: 4px 8px;
      font: inherit;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.7;
      cursor: wait;
    }
    .section { margin: 0 0 14px; }
    .ad {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 14px;
      background: #fff;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
    }
    .ad-content {
      min-width: 0;
    }
    .ad-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .ad-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-top: 8px;
    }
    .title {
      margin: 0 0 2px;
      font-size: 16px;
      font-weight: 700;
    }
    .meta {
      margin: 0 0 4px;
      color: #555;
      font-size: 12px;
    }
    .body {
      white-space: pre-wrap;
    }
    .ad-image,
    .ad-page-image,
    .image-preview {
      width: 100%;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      background: #f2f2f2;
      border: 1px solid #ddd;
      box-sizing: border-box;
    }
    .ad-page-image,
    .image-preview {
      max-width: 420px;
      margin: 0 0 12px;
    }
    .avatar {
      width: 112px;
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid #ddd;
      background: #f2f2f2;
      box-sizing: border-box;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #777;
      font-size: 13px;
      text-align: center;
      padding: 10px;
    }
    .avatar-mini {
      width: 24px;
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid #ddd;
      background: #f2f2f2;
      display: inline-block;
      flex: 0 0 auto;
    }
    .avatar-mini img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .avatar-mini-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #777;
      font-size: 9px;
      text-align: center;
      padding: 0;
      line-height: 1;
    }
    .ad-author {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      color: #444;
      font-size: 12px;
    }
    .ad-image img,
    .ad-page-image img,
    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .ad-image-placeholder,
    .ad-page-image-placeholder,
    .image-preview-placeholder,
    .avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #777;
      font-size: 13px;
      text-align: center;
      padding: 10px;
    }
    .not-found-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }
    .empty {
      color: #666;
      font-style: italic;
    }
    .status {
      margin-top: 6px;
      min-height: 1.2em;
    }
    hr {
      border: 0;
      border-top: 1px solid #ddd;
      margin: 10px 0;
    }
    .ad-page {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
      align-items: start;
    }
    .ad-page-media {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      background: #f5f5f5;
    }
    .ad-page-media img {
      width: 100%;
      display: block;
      object-fit: contain;
    }
    .ad-page-media-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 180px;
      color: #aaa;
      font-size: 13px;
    }
    .ad-page-title {
      margin: 0 0 12px;
      font-size: 22px;
      line-height: 1.3;
      font-weight: 700;
    }
    .ad-page-author {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }
    .ad-page-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .badge {
      background: #eee;
      border-radius: 3px;
      padding: 2px 8px;
      font-size: 12px;
      color: #555;
    }
    .ad-page-body {
      white-space: pre-wrap;
      line-height: 1.65;
      margin-bottom: 16px;
      font-size: 15px;
    }
    .ad-page-footer {
      color: #999;
      font-size: 12px;
    }
    @media (max-width: 700px) {
      .ad-page {
        grid-template-columns: 1fr;
      }
      .ad-page-image,
      .image-preview {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`, status);
}

function renderAdList(env: Env, ads: AdCardRow[]): string {
  if (!ads.length) {
    return '<div class="empty">Пока нет объявлений.</div>';
  }

  return `<div class="ad-grid">${ads
    .map((ad) => {
      const category = ad.category ? `${htmlEscape(categoryLabel(ad.category))} · ` : '';
      const author = ad.author_login
        ? `<div class="ad-author">${renderAvatar(env, ad.author_avatar_key, ad.author_login, 'avatar-mini')}<a href="/u/${encodeURIComponent(ad.author_login)}">${htmlEscape(ad.author_login)}</a></div>`
        : '';
      return `<div class="ad">
  ${renderAdImage(env, ad.image_key, ad.title, 'ad-image')}
  <div class="ad-content">
    <div class="title"><a href="/ad/${ad.id}">${htmlEscape(ad.title)}</a></div>
    <div class="meta">${category}${htmlEscape(ad.created_at)}</div>
    ${author}
  </div>
</div>`;
    })
    .join('')}</div>`;
}

function renderSearchForm(query = ''): string {
  return `<div class="section">
  <h2>Поиск</h2>
  <form method="get" action="/search">
    <input name="q" type="search" value="${htmlEscape(query)}" placeholder="Искать объявления" />
    <button type="submit">Найти</button>
  </form>
</div>`;
}

function renderAdImage(env: Env, key: string | null, alt: string, className: string): string {
  if (!key) {
    return `<div class="${className} ${className}-placeholder"><span>Нет фото</span></div>`;
  }

  return `<div class="${className}"><img src="${htmlEscape(buildMediaUrl(env, key))}" alt="${htmlEscape(alt)}" loading="lazy" /></div>`;
}

function renderAvatar(env: Env, key: string | null, alt: string, className = 'avatar'): string {
  if (!key) {
    return `<div class="${className} ${className}-placeholder"><span>${htmlEscape(alt.slice(0, 2).toUpperCase() || 'UA')}</span></div>`;
  }

  return `<div class="${className}"><img src="${htmlEscape(buildMediaUrl(env, key))}" alt="${htmlEscape(alt)}" loading="lazy" /></div>`;
}

function renderNotFoundPage(currentUser: CurrentUser | null = null): Response {
  return shell(
    'страница не найдена - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>страница не найдена</h2>
  <p>такого объявления, пользователя или страницы здесь нет</p>
  <div class="not-found-links">
    <a href="/">на главную</a>
    <a href="/category/misc">В разделы</a>
    <a href="/new">подать объявление</a>
  </div>
  </div>`,
    currentUser,
    404
  );
}

function renderHome(currentUser: CurrentUser | null = null): Response {
  const categories = CATEGORIES.map(
    (category) => `<li><a href="/category/${category.slug}">${htmlEscape(category.label)}</a></li>`
  ).join('');

  return shell(
    'жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Категории</h2>
  <ul>
    ${categories}
  </ul>
</div>
${renderSearchForm()}`
  );
}

function renderSearchPage(env: Env, query: string, ads: AdCardRow[], currentUser: CurrentUser | null = null): Response {
  const hasQuery = query.trim().length > 0;
  const content = hasQuery
    ? ads.length
      ? renderAdList(env, ads)
      : '<div class="empty">Ничего не найдено.</div>'
    : '<div class="empty">Введите запрос.</div>';

  return shell(
    'поиск - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Поиск</h2>
  <form method="get" action="/search">
    <input name="q" type="search" value="${htmlEscape(query)}" placeholder="Искать объявления" />
    <button type="submit">Найти</button>
  </form>
</div>
<div class="section">
  ${content}
</div>`,
    currentUser
  );
}

function renderNewPage(currentUser: CurrentUser | null = null, error: string | null = null): Response {
  const options = CATEGORIES.map(
    (category) => `<option value="${category.slug}"${category.slug === 'misc' ? ' selected' : ''}>${htmlEscape(category.label)}</option>`
  ).join('');

  return shell(
    'создать объявление - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Создать объявление</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  <form method="post" action="/new" enctype="multipart/form-data">
    <label for="title">Заголовок</label>
    <input id="title" name="title" type="text" required maxlength="200" />

    <label for="category">Категория</label>
    <select id="category" name="category">
      ${options}
    </select>

    <label for="image">Картинка</label>
    <input id="image" name="image" type="file" accept="image/*" />

    <label for="body">Текст</label>
    <textarea id="body" name="body" required maxlength="5000"></textarea>

    <button type="submit">Опубликовать</button>
  </form>
</div>`
  );
}

function renderCategoryPage(env: Env, slug: string, ads: AdCardRow[], currentUser: CurrentUser | null = null): Response {
  const category = CATEGORIES.find((item) => item.slug === slug);
  if (!category) {
    return renderNotFoundPage(currentUser);
  }

  return shell(
    `${category.label} - жоржлист`,
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>${htmlEscape(category.label)}</h2>
      ${renderAdList(env, ads)}
</div>
${renderSearchForm()}`
  );
}

function renderPublicAdPage(env: Env, ad: PublicAdCardRow, currentUser: CurrentUser | null = null): Response {
  const media = ad.image_key
    ? `<div class="ad-page-media"><img src="${htmlEscape(buildMediaUrl(env, ad.image_key))}" alt="${htmlEscape(ad.title)}" /></div>`
    : `<div class="ad-page-media"><div class="ad-page-media-placeholder">без фото</div></div>`;

  const author = ad.author_login
    ? `<div class="ad-page-author">
  ${renderAvatar(env, ad.author_avatar_key, ad.author_login, 'avatar-mini')}
  <a href="/u/${encodeURIComponent(ad.author_login)}">${htmlEscape(ad.author_login)}</a>
</div>`
    : '';

  return shell(
    `${ad.title} - жоржлист`,
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <div class="ad-page">
    ${media}
    <div>
      <h2 class="ad-page-title">${htmlEscape(ad.title)}</h2>
      ${author}
      <div class="ad-page-badges"><span class="badge">${htmlEscape(categoryLabel(ad.category))}</span></div>
      <div class="ad-page-body">${htmlEscape(ad.body)}</div>
      <div class="ad-page-footer">${htmlEscape(ad.created_at)}</div>
    </div>
  </div>
</div>
${renderSearchForm()}`,
    currentUser
  );
}

function renderPublicUserPage(env: Env, user: PublicUserRow, ads: AdCardRow[], currentUser: CurrentUser | null = null): Response {
  const isOwner = currentUser?.login === user.login;
  const adItems = ads.length
    ? `<div class="ad-grid">${ads
        .map((ad) => {
          const category = ad.category ? `${htmlEscape(categoryLabel(ad.category))} · ` : '';
          const actions = isOwner
            ? `<div class="ad-actions">
      <a href="/my/edit/${ad.id}">Редактировать</a>
      <form method="post" action="/my/delete/${ad.id}" style="display:inline">
        <button class="link-button" type="submit" onclick="return confirm('Удалить объявление?')">Удалить</button>
      </form>
    </div>`
            : '';
          return `<div class="ad">
  ${renderAdImage(env, ad.image_key, ad.title, 'ad-image')}
  <div class="ad-content">
    <div class="title"><a href="/ad/${ad.id}">${htmlEscape(ad.title)}</a></div>
    <div class="meta">${category}${htmlEscape(ad.created_at)}</div>
    ${actions}
  </div>
</div>`;
        })
        .join('')}</div>`
    : '<div class="empty">Пока нет объявлений.</div>';

  return shell(
    `${user.login} - жоржлист`,
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  ${renderAvatar(env, user.avatar_key, user.login)}
  <h2>${htmlEscape(user.login)}</h2>
  <p>${htmlEscape(String(ads.length))} объявлений</p>
</div>
<div class="section">
  ${adItems}
</div>
${renderSearchForm()}`,
    currentUser
  );
}

function renderLoginPage(error: string | null = null, nextPath = '/my', email = ''): Response {
  return shell(
    'войти - жоржлист',
    `<h1>жоржлист</h1>
${nav()}
<div class="section">
  <h2>Войти</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  <form method="post" action="/login">
    <input type="hidden" name="next" value="${htmlEscape(nextPath)}" />

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required value="${htmlEscape(email)}" />

    <label for="password">Пароль</label>
    <input id="password" name="password" type="password" required />

    <button type="submit">Войти</button>
  </form>
  <p><a href="/login/telegram?next=${htmlEscape(nextPath)}">Войти через Telegram</a></p>
</div>`
  );
}

function renderRegisterPage(
  error: string | null = null,
  nextPath = '/my',
  login = '',
  email = '',
  displayName = '',
  note: string | null = null,
  telegramAuthLink: string | null = null
): Response {
  const telegramAction = telegramAuthLink
    ? `<p><a href="${htmlEscape(telegramAuthLink)}">Зарегистрироваться через Telegram</a></p>`
    : '';
  return shell(
    'зарегистрироваться - жоржлист',
    `<h1>жоржлист</h1>
${nav()}
<div class="section">
  <h2>Зарегистрироваться</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  ${note ? `<p>${htmlEscape(note)}</p>` : ''}
  <form method="post" action="/register">
    <input type="hidden" name="next" value="${htmlEscape(nextPath)}" />

    <label for="login">Login</label>
    <input id="login" name="login" type="text" required value="${htmlEscape(login)}" />

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required value="${htmlEscape(email)}" />

    <label for="password">Пароль</label>
    <input id="password" name="password" type="password" required />

    <button type="submit">Создать аккаунт</button>
  </form>
  ${telegramAction}
</div>`
  );
}

function renderMyPage(env: Env, currentUser: CurrentUser, ads: AdRow[], message: string | null = null): Response {
  const items = ads.length
    ? ads
        .map((ad) => {
          const category = ad.category ? `${htmlEscape(categoryLabel(ad.category))} · ` : '';
          return `<div class="ad">
  ${renderAdImage(env, ad.image_key, ad.title, 'ad-image')}
  <div class="ad-content">
    <div class="title"><a href="/ad/${ad.id}">${htmlEscape(ad.title)}</a></div>
    <div class="meta">${htmlEscape(ad.status)} · ${category}${htmlEscape(ad.created_at)}</div>
    <div class="ad-actions">
      <a href="/my/edit/${ad.id}">Редактировать</a>
      <form method="post" action="/my/delete/${ad.id}" style="display:inline">
        <button class="link-button" type="submit" onclick="return confirm('Удалить объявление?')">Удалить</button>
      </form>
    </div>
  </div>
</div>`;
        })
        .join('')
    : '<div class="empty">Пока нет твоих объявлений.</div>';

  return shell(
    'мои объявления - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Мои объявления</h2>
  ${message ? `<p class="empty">${htmlEscape(message)}</p>` : ''}
  <div class="ad-grid">${items}</div>
</div>`,
    currentUser
  );
}

function renderEditPage(
  env: Env,
  currentUser: CurrentUser,
  ad: AdRow,
  error: string | null = null,
  formAction = `/my/edit/${ad.id}`
): Response {
  const options = CATEGORIES.map(
    (category) => `<option value="${category.slug}"${category.slug === ad.category ? ' selected' : ''}>${htmlEscape(category.label)}</option>`
  ).join('');
  const currentImagePreview = ad.image_key
    ? `<div class="image-preview"><img src="${htmlEscape(buildMediaUrl(env, ad.image_key))}" alt="${htmlEscape(ad.title)}" /></div>`
    : '<div class="image-preview image-preview-placeholder"><span>Без фото</span></div>';

  return shell(
    'редактировать объявление - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Редактировать объявление</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  <form method="post" action="${htmlEscape(formAction)}" enctype="multipart/form-data">
    <label for="title">Заголовок</label>
    <input id="title" name="title" type="text" required maxlength="200" value="${htmlEscape(ad.title)}" />

    <label for="category">Категория</label>
    <select id="category" name="category">
      ${options}
    </select>

    <label>Текущая картинка</label>
    ${currentImagePreview}

    <label for="image">Заменить картинку</label>
    <input id="image" name="image" type="file" accept="image/*" />

    <label for="body">Текст</label>
    <textarea id="body" name="body" required maxlength="5000">${htmlEscape(ad.body)}</textarea>

    <button type="submit">Сохранить</button>
  </form>
</div>`,
    currentUser
  );
}

type AdminUserRow = {
  id: number;
  login: string;
  email: string | null;
  role: string;
  created_at: string;
};

type AdminSection = 'users' | 'ads';

type AdminPagination = {
  page: number;
  totalPages: number;
};

const ADMIN_PAGE_SIZE = 5;

function parseAdminSection(value: string | null): AdminSection {
  return value === 'users' ? 'users' : 'ads';
}

function parseAdminPage(value: string | null): number {
  const page = Number(value || '1');
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function buildAdminUrl(section: AdminSection, page: number, message: string | null = null): string {
  const params = new URLSearchParams({
    section,
    page: String(page),
  });

  if (message) {
    params.set('message', message);
  }

  return `/admin?${params.toString()}`;
}

function buildAdminActionUrl(path: string, section: AdminSection, page: number): string {
  const params = new URLSearchParams({
    section,
    page: String(page),
  });

  return `${path}?${params.toString()}`;
}

async function countAllUsers(env: Env): Promise<number> {
  const result = await env.DB.prepare(
    `
      SELECT COUNT(*) AS count
      FROM users
    `
  )
    .first<{ count: number }>();

  return result?.count ?? 0;
}

async function listAdminUsersPage(env: Env, page: number): Promise<AdminUserRow[]> {
  const offset = (page - 1) * ADMIN_PAGE_SIZE;
  const result = await env.DB.prepare(
    `
      SELECT users.id,
             users.login,
             (SELECT email FROM user_identities WHERE user_id = users.id AND provider = 'email' LIMIT 1) AS email,
             users.role,
             users.created_at
      FROM users
      ORDER BY users.id ASC
      LIMIT ?
      OFFSET ?
    `
  )
    .bind(ADMIN_PAGE_SIZE, offset)
    .all<AdminUserRow>();

  return result.results ?? [];
}

async function countAllAds(env: Env): Promise<number> {
  const result = await env.DB.prepare(
    `
      SELECT COUNT(*) AS count
      FROM ads
      WHERE deleted_at IS NULL
    `
  )
    .first<{ count: number }>();

  return result?.count ?? 0;
}

async function listAdminAdsPage(env: Env, page: number): Promise<AdRow[]> {
  const offset = (page - 1) * ADMIN_PAGE_SIZE;
  const result = await env.DB.prepare(
    `
      SELECT ${AD_SELECT_COLUMNS}
      FROM ads
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
      LIMIT ?
      OFFSET ?
    `
  )
    .bind(ADMIN_PAGE_SIZE, offset)
    .all<AdRow>();

  return result.results ?? [];
}

function renderAdminPagination(section: AdminSection, pagination: AdminPagination): string {
  if (pagination.totalPages <= 1) {
    return `<p class="empty">Страница 1 из 1</p>`;
  }

  const prevLink = pagination.page > 1 ? `<a href="${buildAdminUrl(section, pagination.page - 1)}">Назад</a>` : '<span class="empty">Назад</span>';
  const nextLink = pagination.page < pagination.totalPages ? `<a href="${buildAdminUrl(section, pagination.page + 1)}">Вперёд</a>` : '<span class="empty">Вперёд</span>';
  return `<div class="pager">
  ${prevLink}
  <span>Страница ${pagination.page} из ${pagination.totalPages}</span>
  ${nextLink}
</div>`;
}

function renderAdminTabs(section: AdminSection): string {
  const usersTab = section === 'users' ? '<strong>Пользователи</strong>' : `<a href="${buildAdminUrl('users', 1)}">Пользователи</a>`;
  const adsTab = section === 'ads' ? '<strong>Объявления</strong>' : `<a href="${buildAdminUrl('ads', 1)}">Объявления</a>`;
  return `<div class="pager">${usersTab}<span>·</span>${adsTab}</div>`;
}

function renderAdminUsersSection(
  currentUser: CurrentUser,
  users: AdminUserRow[],
  pagination: AdminPagination,
  message: string | null = null
): Response {
  const items = users.length
    ? users
        .map((user) => {
          const email = user.email ? ` · ${htmlEscape(user.email)}` : '';
          const isSelf = user.id === currentUser.id;
          const promoteAction = user.role === 'admin'
            ? '<span class="empty">admin</span>'
            : `<form method="post" action="${htmlEscape(buildAdminActionUrl(`/admin/users/${user.id}/promote`, 'users', pagination.page))}" style="display:inline">
  <button class="link-button" type="submit">Сделать admin</button>
</form>`;
          const demoteAction = isSelf
            ? '<span class="empty">Это ваш аккаунт</span>'
            : user.role === 'admin'
            ? `<form method="post" action="${htmlEscape(buildAdminActionUrl(`/admin/users/${user.id}/demote`, 'users', pagination.page))}" style="display:inline">
  <button class="link-button" type="submit">Сделать user</button>
</form>`
            : '<span class="empty">user</span>';
          const deleteAction = isSelf
            ? '<span class="empty">Нельзя удалить себя</span>'
            : `<form method="post" action="${htmlEscape(buildAdminActionUrl(`/admin/users/${user.id}/delete`, 'users', pagination.page))}" style="display:inline">
  <button class="link-button" type="submit" onclick="return confirm('Удалить пользователя?')">Удалить</button>
</form>`;
          return `<div class="ad">
  <div class="title">#${user.id} · ${htmlEscape(user.login)}${email}</div>
  <div class="meta">${htmlEscape(user.role)} · ${htmlEscape(user.created_at)}</div>
  <div>
    ${promoteAction}
    ${demoteAction}
    ${deleteAction}
  </div>
</div>`;
        })
        .join('')
    : '<div class="empty">Пользователей на этой странице нет.</div>';

  return shell(
    'админка - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Админка</h2>
  ${renderAdminTabs('users')}
  ${message ? `<p class="empty">${htmlEscape(message)}</p>` : ''}
  <p>Пользователь: ${htmlEscape(currentUser.login)}</p>
  <h3>Пользователи</h3>
  ${items}
  ${renderAdminPagination('users', pagination)}
</div>`,
    currentUser
  );
}

function renderAdminAdsSection(
  env: Env,
  currentUser: CurrentUser,
  ads: AdRow[],
  pagination: AdminPagination,
  message: string | null = null
): Response {
  const items = ads.length
    ? ads
        .map((ad) => {
          const owner = ad.owner_user_id ? `owner #${ad.owner_user_id}` : 'no owner';
          const category = ad.category ? `${htmlEscape(categoryLabel(ad.category))} · ` : '';
          return `<div class="ad">
  ${renderAdImage(env, ad.image_key, ad.title, 'ad-image')}
  <div class="ad-content">
    <div class="title"><a href="/ad/${ad.id}">#${ad.id} · ${htmlEscape(ad.title)}</a></div>
    <div class="meta">${htmlEscape(ad.status)} · ${category}${htmlEscape(owner)} · ${htmlEscape(ad.created_at)}</div>
    <div class="ad-actions">
      <a href="${htmlEscape(buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', pagination.page))}">Редактировать</a>
      <form method="post" action="${htmlEscape(buildAdminActionUrl(`/admin/delete/${ad.id}`, 'ads', pagination.page))}" style="display:inline">
        <button class="link-button" type="submit" onclick="return confirm('Удалить объявление?')">Удалить</button>
      </form>
    </div>
  </div>
</div>`;
        })
        .join('')
    : '<div class="empty">Объявлений на этой странице нет.</div>';

  return shell(
    'админка - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Админка</h2>
  ${renderAdminTabs('ads')}
  ${message ? `<p class="empty">${htmlEscape(message)}</p>` : ''}
  <p>Пользователь: ${htmlEscape(currentUser.login)}</p>
  <h3>Объявления</h3>
  <div class="ad-grid">${items}</div>
  ${renderAdminPagination('ads', pagination)}
</div>`,
    currentUser
  );
}

async function listAllUsers(env: Env): Promise<AdminUserRow[]> {
  return env.DB.prepare(
    `
      SELECT users.id,
             users.login,
             (SELECT email FROM user_identities WHERE user_id = users.id AND provider = 'email' LIMIT 1) AS email,
             users.role,
             users.created_at
      FROM users
      ORDER BY users.id ASC
    `
  )
    .all<AdminUserRow>()
    .then((result) => result.results ?? []);
}

function renderSettingsPage(
  env: Env,
  currentUser: CurrentUser,
  telegramIdentity: UserIdentityRow | null,
  emailIdentity: UserIdentityRow | null,
  message: string | null = null,
  pendingTelegramAuth: TelegramAuthPayload | null = null
): Response {
  const telegramStatus = telegramIdentity
    ? `Telegram: ${htmlEscape(telegramIdentity.telegram_username ? `@${telegramIdentity.telegram_username}` : telegramIdentity.provider_user_id || '')}`
    : 'Telegram: не привязан';
  const telegramAction = telegramIdentity
    ? '<p>Привязка уже настроена.</p>'
    : pendingTelegramAuth
      ? `<form method="post" action="/settings/link-telegram/confirm">
  <button type="submit">Перепривязать Telegram к текущему аккаунту</button>
</form>`
      : '<p><a href="/settings/link-telegram">Привязать Telegram</a></p>';
  const statusMessage = message || (pendingTelegramAuth && !telegramIdentity ? 'Этот Telegram уже привязан к другому аккаунту' : null);
  const emailValue = currentUser.email || '';
  const passwordBlock = emailIdentity
    ? `<div class="section">
    <h3>Сменить пароль</h3>
    <p>${htmlEscape(emailIdentity.password_hash ? 'Пароль: установлен' : 'Пароль: не задан')}</p>
    <form method="post" action="/settings/password">
      <label for="current_password">Текущий пароль</label>
      <input id="current_password" name="current_password" type="password" autocomplete="current-password" />

      <label for="new_password">Новый пароль</label>
      <input id="new_password" name="new_password" type="password" minlength="8" autocomplete="new-password" />

      <label for="confirm_password">Подтверждение нового пароля</label>
      <input id="confirm_password" name="confirm_password" type="password" minlength="8" autocomplete="new-password" />

      <button type="submit">Сменить пароль</button>
    </form>
  </div>`
    : `<div class="section">
    <h3>Сменить пароль</h3>
    <p class="empty">Сначала добавь email на сайте, чтобы можно было задать пароль.</p>
  </div>`;
  const adminPanelBlock = currentUser.role === 'admin'
    ? '<p><a href="/admin">Открыть админку</a></p>'
    : '<p class="empty">Админка доступна только аккаунтам с ролью admin.</p>';
  const avatarBlock = `
  <div class="section">
    <h3>Аватар</h3>
    ${renderAvatar(env, currentUser.avatar_key, currentUser.login)}
    <form method="post" action="/settings/avatar" enctype="multipart/form-data">
      <label for="avatar">Загрузить или заменить</label>
      <input id="avatar" name="avatar" type="file" accept="image/*" />
      <button type="submit">Сохранить аватар</button>
    </form>
    ${currentUser.avatar_key ? `<form method="post" action="/settings/avatar/delete"><button type="submit">Удалить аватар</button></form>` : '<p class="empty">Аватар не загружен.</p>'}
  <p><a href="/u/${encodeURIComponent(currentUser.login)}">Открыть публичный профиль</a></p>
  </div>`;

  return shell(
    'настройки - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Настройки</h2>
  <p>Роль: ${htmlEscape(currentUser.role)}</p>
  <form method="post" action="/settings">
    <label for="login">Login</label>
    <input id="login" name="login" type="text" required value="${htmlEscape(currentUser.login)}" />

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required value="${htmlEscape(emailValue)}" />

    <button type="submit">Сохранить</button>
  </form>
  <p>${telegramStatus}</p>
  ${statusMessage ? `<p class="empty">${htmlEscape(statusMessage)}</p>` : ''}
  ${telegramAction}
  ${avatarBlock}
  ${passwordBlock}
  ${adminPanelBlock}
</div>`,
    currentUser
  );
}

function renderTelegramWidgetPage(
  title: string,
  heading: string,
  description: string,
  botUsername: string,
  authUrl: string,
  currentUser: CurrentUser | null = null
): Response {
  return shell(
    title,
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>${htmlEscape(heading)}</h2>
  <p>${htmlEscape(description)}</p>
  <script async src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="${htmlEscape(botUsername)}"
    data-size="large"
    data-auth-url="${htmlEscape(authUrl)}"></script>
</div>`,
    currentUser
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:';
}

async function findEmailIdentity(env: Env, email: string): Promise<UserIdentityRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, user_id, provider, provider_user_id, email, password_hash, telegram_username, created_at
      FROM user_identities
      WHERE provider = 'email'
        AND email = ?
      LIMIT 1
    `
  )
    .bind(email)
    .first<UserIdentityRow>();

  return result ?? null;
}

async function findEmailIdentityByUserId(env: Env, userId: number): Promise<UserIdentityRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, user_id, provider, provider_user_id, email, password_hash, telegram_username, created_at
      FROM user_identities
      WHERE provider = 'email'
        AND user_id = ?
      LIMIT 1
    `
  )
    .bind(userId)
    .first<UserIdentityRow>();

  return result ?? null;
}

async function findUserByLogin(env: Env, login: string): Promise<CurrentUser | null> {
  const result = await env.DB.prepare(
    `
      SELECT users.id,
             users.login,
             users.display_name,
             (SELECT email FROM user_identities WHERE user_id = users.id AND provider = 'email' LIMIT 1) AS email,
             users.role,
             users.avatar_key,
             users.avatar_mime_type,
             users.avatar_updated_at,
             users.created_at,
             users.updated_at
      FROM users
      WHERE users.login = ?
      LIMIT 1
    `
  )
    .bind(login)
    .first<CurrentUser>();

  return result ?? null;
}

async function findUserById(env: Env, userId: number): Promise<CurrentUser | null> {
  const result = await env.DB.prepare(
    `
      SELECT users.id,
             users.login,
             users.display_name,
             (SELECT email FROM user_identities WHERE user_id = users.id AND provider = 'email' LIMIT 1) AS email,
             users.role,
             users.avatar_key,
             users.avatar_mime_type,
             users.avatar_updated_at,
             users.created_at,
             users.updated_at
      FROM users
      WHERE users.id = ?
      LIMIT 1
    `
  )
    .bind(userId)
    .first<CurrentUser>();

  return result ?? null;
}

async function getCurrentUser(request: Request, env: Env): Promise<CurrentUser | null> {
  const sessionToken = getCookieValue(request, 'session');
  if (!sessionToken) {
    return null;
  }

  const sessionTokenHash = await hashSessionToken(sessionToken);
  const result = await env.DB.prepare(
    `
      SELECT users.id,
             users.login,
             users.display_name,
             (SELECT email FROM user_identities WHERE user_id = users.id AND provider = 'email' LIMIT 1) AS email,
             users.role,
             users.avatar_key,
             users.avatar_mime_type,
             users.avatar_updated_at,
             users.created_at,
             users.updated_at
      FROM sessions
      INNER JOIN users ON users.id = sessions.user_id
      WHERE sessions.session_token_hash = ?
        AND sessions.expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `
  )
    .bind(sessionTokenHash)
    .first<CurrentUser>();

  return result ?? null;
}

async function createSessionForUser(env: Env, userId: number): Promise<string> {
  const sessionToken = generateSessionToken();
  const sessionTokenHash = await hashSessionToken(sessionToken);
  const expiresAt = formatSqliteTimestamp(new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000));

  await env.DB.prepare(
    `
      INSERT INTO sessions (user_id, session_token_hash, created_at, expires_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?)
    `
  )
    .bind(userId, sessionTokenHash, expiresAt)
    .run();

  return sessionToken;
}

async function deleteSessionByToken(env: Env, sessionToken: string): Promise<void> {
  const sessionTokenHash = await hashSessionToken(sessionToken);
  await env.DB.prepare(
    `
      DELETE FROM sessions
      WHERE session_token_hash = ?
    `
  )
    .bind(sessionTokenHash)
    .run();
}

async function createEmailUser(
  env: Env,
  login: string,
  displayName: string | null,
  email: string,
  passwordHash: string
): Promise<number> {
  const results = await env.DB.batch([
    env.DB.prepare(
      `
        INSERT INTO users (login, display_name, role, created_at, updated_at)
        VALUES (?, ?, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    ).bind(login, displayName),
    env.DB.prepare(
      `
        INSERT INTO user_identities (
          user_id,
          provider,
          provider_user_id,
          email,
          password_hash,
          telegram_username,
          created_at
        )
        VALUES (last_insert_rowid(), 'email', NULL, ?, ?, NULL, CURRENT_TIMESTAMP)
      `
    ).bind(email, passwordHash),
  ]);

  return Number(results[0].meta.last_row_id);
}

async function telegramApi(env: Env, method: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

async function userBotApi(env: Env, method: string, payload: Record<string, unknown>): Promise<Response> {
  const token = env.USER_TELEGRAM_BOT_TOKEN || env.TELEGRAM_USER_BOT_TOKEN;

  if (!token) {
    throw new Error('Missing user Telegram bot token');
  }

  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

function getPublicSiteUrl(env: Env): string {
  return (env.PUBLIC_SITE_URL || env.SITE_URL || 'https://georgelist.chillnbeer.workers.dev').replace(/\/+$/, '');
}

function buildPublicSiteUrl(env: Env, path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getPublicSiteUrl(env)}${normalizedPath}`;
}

async function sendUserBotMessage(
  env: Env,
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'sendMessage', payload);
  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }
}

async function answerUserCallbackQuery(env: Env, callbackQueryId: string, text?: string): Promise<void> {
  await userBotApi(env, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}

function userBotMenuMarkup(env: Env): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Создать', callback_data: USER_BOT_MENU_CREATE }],
      [{ text: 'Мои объявления', callback_data: USER_BOT_MENU_MY }],
      [{ text: 'Объявления', callback_data: USER_BOT_MENU_SECTIONS }],
      [{ text: 'Поиск', callback_data: USER_BOT_MENU_SEARCH }],
      [{ text: 'Настройки', callback_data: USER_BOT_MENU_SETTINGS }],
      [{ text: 'Открыть сайт', url: buildPublicSiteUrl(env, '/') }],
    ],
  };
}

function userBotSectionsMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Вещи', callback_data: `${USER_BOT_SECTION_PREFIX}things` }],
      [{ text: 'Работа', callback_data: `${USER_BOT_SECTION_PREFIX}jobs` }],
      [{ text: 'Услуги', callback_data: `${USER_BOT_SECTION_PREFIX}services` }],
      [{ text: 'Аренда', callback_data: `${USER_BOT_SECTION_PREFIX}rent` }],
      [{ text: 'Творчество', callback_data: `${USER_BOT_SECTION_PREFIX}creative` }],
      [{ text: 'Разное', callback_data: `${USER_BOT_SECTION_PREFIX}misc` }],
      [{ text: 'Назад', callback_data: USER_BOT_MENU_MY }],
    ],
  };
}

function userBotSectionAdsMarkup(category: string, ads: Array<{ id: number; title: string }>): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_SECTION_AD_PREFIX}${category}:${ad.id}` },
      ]),
      [{ text: 'Назад к объявлениям', callback_data: USER_BOT_MENU_SECTIONS }],
    ],
  };
}

function userBotSectionAdMarkup(category: string): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Назад к разделу', callback_data: `${USER_BOT_SECTION_PREFIX}${category}` }],
      [{ text: 'Назад к объявлениям', callback_data: USER_BOT_MENU_SECTIONS }],
    ],
  };
}

function userBotSearchMarkup(ads: Array<{ id: number; title: string }>): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_SEARCH_AD_PREFIX}${ad.id}` },
      ]),
      [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }],
      [{ text: 'Назад к объявлениям', callback_data: USER_BOT_MENU_SECTIONS }],
    ],
  };
}

function userBotSearchAdMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Назад к поиску', callback_data: USER_BOT_SEARCH_RESULTS }],
      [{ text: 'Назад к объявлениям', callback_data: USER_BOT_MENU_SECTIONS }],
    ],
  };
}

function userBotMyAdsMarkup(ads: Array<{ id: number; title: string }>): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_MENU_MY_AD}${ad.id}` },
      ]),
      [{ text: 'Назад', callback_data: USER_BOT_MENU_MY }],
    ],
  };
}

function userBotSingleAdMarkup(adId: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: 'Редактировать', callback_data: `${USER_BOT_MENU_MY_AD}${adId}:edit` },
        { text: 'Удалить', callback_data: `${USER_BOT_DELETE_PREFIX}${adId}` },
      ],
      [{ text: 'Назад', callback_data: USER_BOT_MENU_MY }],
    ],
  };
}

function userBotSettingsMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Изменить логин', callback_data: `${USER_BOT_SETTINGS_PREFIX}login` }],
      [{ text: 'Изменить email', callback_data: `${USER_BOT_SETTINGS_PREFIX}email` }],
      [{ text: 'Изменить аватар', callback_data: `${USER_BOT_SETTINGS_PREFIX}avatar` }],
      [{ text: 'Удалить аватар', callback_data: `${USER_BOT_SETTINGS_PREFIX}avatar-delete` }],
      [{ text: 'Назад', callback_data: `${USER_BOT_SETTINGS_PREFIX}back` }],
    ],
  };
}

function userBotCategoryMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Вещи', callback_data: `${USER_BOT_DRAFT_PREFIX}category:things` }],
      [{ text: 'Работа', callback_data: `${USER_BOT_DRAFT_PREFIX}category:jobs` }],
      [{ text: 'Услуги', callback_data: `${USER_BOT_DRAFT_PREFIX}category:services` }],
      [{ text: 'Аренда', callback_data: `${USER_BOT_DRAFT_PREFIX}category:rent` }],
      [{ text: 'Творчество', callback_data: `${USER_BOT_DRAFT_PREFIX}category:creative` }],
      [{ text: 'Разное', callback_data: `${USER_BOT_DRAFT_PREFIX}category:misc` }],
    ],
  };
}

function userBotConfirmMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: 'Отправить', callback_data: USER_BOT_DRAFT_SEND },
        { text: 'Отмена', callback_data: USER_BOT_DRAFT_CANCEL },
      ],
    ],
  };
}

function userBotEditConfirmMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: 'Сохранить', callback_data: USER_BOT_EDIT_DRAFT_SAVE },
        { text: 'Отмена', callback_data: USER_BOT_EDIT_DRAFT_CANCEL },
      ],
    ],
  };
}

async function sendUserBotMenu(env: Env, chatId: number, greeting: string, login: string | null = null): Promise<void> {
  const lines = [greeting];
  if (login) {
    lines.push(`Login: ${login}`);
  }
  lines.push(`Сайт: ${buildPublicSiteUrl(env, '/')}`);
  lines.push('');
  lines.push('Что делаем?');
  await sendUserBotMessage(env, chatId, lines.join('\n'), userBotMenuMarkup(env));
}

async function sendUserBotSections(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Объявления', userBotSectionsMarkup());
}

async function sendUserBotSettings(
  env: Env,
  chatId: number,
  telegramUserId: string,
  message: string | null = null
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  const user = await findUserById(env, telegramIdentity.user_id);
  if (!user) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  const emailIdentity = await findEmailIdentityByUserId(env, user.id);
  const telegramLine = telegramIdentity.telegram_username
    ? `@${telegramIdentity.telegram_username}`
    : telegramIdentity.provider_user_id || 'привязан';
  const lines = [
    ...(message ? [message, ''] : []),
    'Настройки',
    `Login: ${user.login}`,
    `Email: ${emailIdentity?.email || user.email || 'не задан'}`,
    `Telegram: ${telegramLine}`,
    `Аватар: ${user.avatar_key ? 'есть' : 'нет'}`,
  ];

  await sendUserBotMessage(env, chatId, lines.join('\n'), userBotSettingsMarkup());
}

async function sendUserBotSettingsLoginPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Введи новый login');
}

async function sendUserBotSettingsEmailPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Введи новый email');
}

async function sendUserBotSettingsAvatarPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Пришли изображение для аватара');
}

async function sendUserBotSearchPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Введи текст для поиска');
}

async function sendUserBotAdCards(
  env: Env,
  chatId: number,
  ads: AdCardRow[],
  hasMore: boolean,
  moreCallbackData: string,
  backRow: Array<{ text: string; callback_data: string }>
): Promise<void> {
  for (const ad of ads) {
    const caption = [ad.title, categoryLabel(ad.category), ad.author_login ? `Автор: ${ad.author_login}` : null]
      .filter(Boolean)
      .join('\n');
    const markup = { inline_keyboard: [[{ text: 'Подробнее →', callback_data: `${USER_BOT_SECTION_AD_PREFIX}${ad.category}:${ad.id}` }]] };

    if (ad.image_key) {
      const res = await userBotApi(env, 'sendPhoto', {
        chat_id: chatId,
        photo: buildMediaUrl(env, ad.image_key),
        caption,
        reply_markup: markup,
      });
      if (!res.ok) {
        await sendUserBotMessage(env, chatId, `[без фото]\n${caption}`, markup);
      }
    } else {
      await sendUserBotMessage(env, chatId, `[без фото]\n${caption}`, markup);
    }
  }

  const navRows: Array<Array<{ text: string; callback_data: string }>> = [];
  if (hasMore) navRows.push([{ text: 'Показать ещё', callback_data: moreCallbackData }]);
  navRows.push(backRow);
  await sendUserBotMessage(env, chatId, '—', { inline_keyboard: navRows });
}

async function sendUserBotSearchResults(env: Env, chatId: number, query: string, offset = 0): Promise<void> {
  const ads = await searchPublishedAdsPage(env, query, BOT_ADS_PAGE_SIZE + 1, offset);
  const hasMore = ads.length > BOT_ADS_PAGE_SIZE;
  const page = ads.slice(0, BOT_ADS_PAGE_SIZE);

  if (!page.length) {
    await sendUserBotMessage(env, chatId, offset === 0 ? 'Ничего не найдено' : 'Больше объявлений нет', {
      inline_keyboard: [
        [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }],
        [{ text: 'Назад к объявлениям', callback_data: USER_BOT_MENU_SECTIONS }],
      ],
    });
    return;
  }

  if (offset === 0) await sendUserBotMessage(env, chatId, `Поиск: ${query.trim()}`);

  await sendUserBotAdCards(
    env, chatId, page, hasMore,
    `${USER_BOT_SEARCH_MORE_PREFIX}${offset + BOT_ADS_PAGE_SIZE}`,
    [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }, { text: 'Назад к объявлениям', callback_data: USER_BOT_MENU_SECTIONS }]
  );
}

function buildUserBotPublicAdText(
  ad: Pick<PublicAdCardRow, 'title' | 'body' | 'category' | 'author_login' | 'created_at'>
): string {
  return [
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    ad.author_login ? `Автор: ${ad.author_login}` : null,
    'Текст:',
    truncateText(ad.body, 700),
    `Дата: ${ad.created_at}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

async function sendUserBotPublicAdCard(
  env: Env,
  chatId: number,
  ad: PublicAdCardRow,
  replyMarkup: Record<string, unknown>
): Promise<void> {
  const text = buildUserBotPublicAdText(ad);

  if (ad.image_key) {
    const response = await userBotApi(env, 'sendPhoto', {
      chat_id: chatId,
      photo: buildMediaUrl(env, ad.image_key),
      caption: text,
      reply_markup: replyMarkup,
    });

    if (!response.ok) {
      throw new Error(`Telegram sendPhoto failed with status ${response.status}`);
    }
    return;
  }

  await sendUserBotMessage(env, chatId, text, replyMarkup);
}

async function sendUserBotSearchAdDetail(env: Env, chatId: number, adId: number): Promise<void> {
  const ad = await getPublishedAdCardById(env, adId);
  if (!ad) {
    await sendUserBotMessage(env, chatId, 'Объявление не найдено', {
      inline_keyboard: [
        [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }],
        [{ text: 'Назад к объявлениям', callback_data: USER_BOT_MENU_SECTIONS }],
      ],
    });
    return;
  }

  await sendUserBotPublicAdCard(env, chatId, ad, userBotSearchAdMarkup());
}

async function sendUserBotSectionAds(env: Env, chatId: number, category: string, offset = 0): Promise<void> {
  const categoryKey = normalizeCategory(category);
  const ads = await listPublishedAdsByCategoryPage(env, categoryKey, BOT_ADS_PAGE_SIZE + 1, offset);
  const hasMore = ads.length > BOT_ADS_PAGE_SIZE;
  const page = ads.slice(0, BOT_ADS_PAGE_SIZE);

  if (!page.length) {
    await sendUserBotMessage(
      env, chatId,
      offset === 0 ? `${categoryLabel(categoryKey)}\n\nОбъявлений пока нет` : 'Больше объявлений нет',
      userBotSectionsMarkup()
    );
    return;
  }

  if (offset === 0) await sendUserBotMessage(env, chatId, categoryLabel(categoryKey));

  await sendUserBotAdCards(
    env, chatId, page, hasMore,
    `${USER_BOT_SECTION_MORE_PREFIX}${categoryKey}:${offset + BOT_ADS_PAGE_SIZE}`,
    [{ text: 'К разделам', callback_data: USER_BOT_MENU_SECTIONS }]
  );
}

async function sendUserBotSectionAdDetail(env: Env, chatId: number, category: string, adId: number): Promise<void> {
  const categoryKey = normalizeCategory(category);
  const ad = await getPublishedAdCardById(env, adId, categoryKey);

  if (!ad) {
    await sendUserBotMessage(env, chatId, 'Объявление не найдено', userBotSectionsMarkup());
    return;
  }

  await sendUserBotPublicAdCard(env, chatId, ad, userBotSectionAdMarkup(categoryKey));
}

function isAdminTelegramChat(env: Env, chatId: number): boolean {
  return String(chatId) === String(env.TELEGRAM_ADMIN_ID);
}

function adminBotMenuMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Объявления', callback_data: 'admin:ads:page:1' }],
      [{ text: 'Пользователи', callback_data: 'admin:users:page:1' }],
      [{ text: 'Обновить', callback_data: ADMIN_BOT_MENU_HOME }],
    ],
  };
}

function adminBotPageMarkup(section: AdminSection, page: number, totalPages: number): Array<Array<{ text: string; callback_data: string }>> {
  const row: Array<{ text: string; callback_data: string }> = [];
  if (page > 1) {
    row.push({ text: 'Назад', callback_data: `admin:${section}:page:${page - 1}` });
  }
  row.push({ text: `Стр. ${page}/${totalPages}`, callback_data: `admin:${section}:page:${page}` });
  if (page < totalPages) {
    row.push({ text: 'Вперёд', callback_data: `admin:${section}:page:${page + 1}` });
  }
  return [row];
}

function adminBotAdsMarkup(
  ads: Array<{ id: number; title: string }>,
  page: number,
  totalPages: number
): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `admin:ad:${page}:${ad.id}` },
      ]),
      ...adminBotPageMarkup('ads', page, totalPages),
      [{ text: 'Назад', callback_data: ADMIN_BOT_MENU_HOME }],
    ],
  };
}

function adminBotUsersMarkup(
  users: Array<{ id: number; login: string; role: string }>,
  page: number,
  totalPages: number
): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...users.map((user) => [
        { text: `${user.login}${user.role === 'admin' ? ' · admin' : ''}`, callback_data: `admin:user:${page}:${user.id}` },
      ]),
      ...adminBotPageMarkup('users', page, totalPages),
      [{ text: 'Назад', callback_data: ADMIN_BOT_MENU_HOME }],
    ],
  };
}

function adminBotAdMarkup(adId: number, page: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: 'Редактировать', callback_data: `admin:ad:${page}:${adId}:edit` },
        { text: 'Удалить', callback_data: `admin:ad:${page}:${adId}:delete` },
      ],
      [
        { text: 'Publish', callback_data: `admin:ad:${page}:${adId}:publish` },
        { text: 'Reject', callback_data: `admin:ad:${page}:${adId}:reject` },
      ],
      [{ text: 'Назад', callback_data: `admin:ads:page:${page}` }],
    ],
  };
}

function adminBotUserMarkup(userId: number, role: string, page: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      role === 'admin'
        ? [
            { text: 'Сделать user', callback_data: `admin:user:${page}:${userId}:demote` },
            { text: 'Уже admin', callback_data: `admin:user:${page}:${userId}` },
          ]
        : [{ text: 'Сделать admin', callback_data: `admin:user:${page}:${userId}:promote` }],
      [
        { text: 'Удалить', callback_data: `admin:user:${page}:${userId}:delete` },
        { text: 'Назад', callback_data: `admin:users:page:${page}` },
      ],
    ],
  };
}

async function sendAdminBotMessage(
  env: Env,
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await telegramApi(env, 'sendMessage', payload);
  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }
}

async function answerAdminCallbackQuery(env: Env, callbackQueryId: string, text?: string): Promise<void> {
  await telegramApi(env, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}

async function sendAdminBotHome(env: Env, chatId: number, message = 'Админ-панель'): Promise<void> {
  await sendAdminBotMessage(env, chatId, message, adminBotMenuMarkup());
}

async function sendAdminBotAds(env: Env, chatId: number, page = 1): Promise<void> {
  const totalAds = await countAllAds(env);
  const totalPages = Math.max(1, Math.ceil(totalAds / ADMIN_PAGE_SIZE));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const ads = await listAdminAdsPage(env, normalizedPage);
  if (!ads.length) {
    await sendAdminBotMessage(env, chatId, 'Пока нет объявлений', adminBotMenuMarkup());
    return;
  }

  await sendAdminBotMessage(
    env,
    chatId,
    `Объявления: страница ${normalizedPage}/${totalPages}`,
    adminBotAdsMarkup(ads.map((ad) => ({ id: ad.id, title: ad.title })), normalizedPage, totalPages)
  );
}

async function sendAdminBotUsers(env: Env, chatId: number, page = 1): Promise<void> {
  const totalUsers = await countAllUsers(env);
  const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_PAGE_SIZE));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const users = await listAdminUsersPage(env, normalizedPage);
  if (!users.length) {
    await sendAdminBotMessage(env, chatId, 'Пока нет пользователей', adminBotMenuMarkup());
    return;
  }

  await sendAdminBotMessage(
    env,
    chatId,
    `Пользователи: страница ${normalizedPage}/${totalPages}`,
    adminBotUsersMarkup(users.map((user) => ({ id: user.id, login: user.login, role: user.role })), normalizedPage, totalPages)
  );
}

function buildAdminBotAdText(
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'status' | 'owner_user_id' | 'deleted_at' | 'image_key'>,
  bodyLimit = 2800
): string {
  return [
    `#${ad.id}`,
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    `Статус: ${ad.status}`,
    `Owner: ${ad.owner_user_id ?? 'none'}`,
    `Удалено: ${ad.deleted_at ? 'yes' : 'no'}`,
    'Текст:',
    truncateText(ad.body, bodyLimit),
  ].join('\n');
}

async function sendAdminBotAdDetail(env: Env, chatId: number, ad: AdRow, page: number): Promise<void> {
  const replyMarkup = adminBotAdMarkup(ad.id, page);

  if (ad.image_key) {
    const response = await telegramApi(env, 'sendPhoto', {
      chat_id: chatId,
      photo: buildMediaUrl(env, ad.image_key),
      caption: buildAdminBotAdText(ad, 700),
      reply_markup: replyMarkup,
    });

    if (!response.ok) {
      throw new Error(`Telegram sendPhoto failed with status ${response.status}`);
    }
    return;
  }

  await sendAdminBotMessage(env, chatId, buildAdminBotAdText(ad), replyMarkup);
}

async function sendAdminBotUserDetail(env: Env, chatId: number, user: AdminUserRow, page: number): Promise<void> {
  const text = [
    `#${user.id}`,
    `Login: ${user.login}`,
    `Email: ${user.email || '—'}`,
    `Role: ${user.role}`,
    `Created: ${user.created_at}`,
  ].join('\n');

  await sendAdminBotMessage(env, chatId, text, adminBotUserMarkup(user.id, user.role, page));
}

async function deleteAdminAd(env: Env, adId: number): Promise<'deleted' | 'missing' | 'already'> {
  const result = await env.DB.prepare(
    `
      UPDATE ads
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
    `
  )
    .bind(adId)
    .run();

  if ((result.meta.changes ?? 0) > 0) {
    return 'deleted';
  }

  const existing = await env.DB.prepare(
    `
      SELECT id, deleted_at
      FROM ads
      WHERE id = ?
      LIMIT 1
    `
  )
    .bind(adId)
    .first<{ id: number; deleted_at: string | null }>();

  if (!existing) {
    return 'missing';
  }

  return existing.deleted_at ? 'already' : 'missing';
}

async function promoteAdminUser(env: Env, userId: number): Promise<'promoted' | 'already' | 'missing'> {
  const user = await findUserById(env, userId);
  if (!user) {
    return 'missing';
  }

  if (user.role === 'admin') {
    return 'already';
  }

  await env.DB.prepare(
    `
      UPDATE users
      SET role = 'admin',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(userId)
    .run();

  return 'promoted';
}

async function demoteAdminUser(env: Env, userId: number): Promise<'demoted' | 'already' | 'missing'> {
  const user = await findUserById(env, userId);
  if (!user) {
    return 'missing';
  }

  if (user.role !== 'admin') {
    return 'already';
  }

  await env.DB.prepare(
    `
      UPDATE users
      SET role = 'user',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(userId)
    .run();

  return 'demoted';
}

async function deleteAdminUser(env: Env, userId: number): Promise<'deleted' | 'self' | 'missing'> {
  const user = await findUserById(env, userId);
  if (!user) {
    return 'missing';
  }

  const adsResult = await env.DB.prepare(
    `
      UPDATE ads
      SET owner_user_id = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE owner_user_id = ?
    `
  )
    .bind(userId)
    .run();

  await env.DB.batch([
    env.DB.prepare(
      `
        DELETE FROM sessions
        WHERE user_id = ?
      `
    ).bind(userId),
    env.DB.prepare(
      `
        DELETE FROM user_identities
        WHERE user_id = ?
      `
    ).bind(userId),
    env.DB.prepare(
      `
        DELETE FROM users
        WHERE id = ?
      `
    ).bind(userId),
  ]);

  return (adsResult.meta.changes ?? 0) >= 0 ? 'deleted' : 'missing';
}

async function sendUserBotCategoryPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Выбери категорию', userBotCategoryMarkup());
}

async function sendUserBotLoginPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Придумай login');
}

async function sendUserBotEmailPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Теперь напиши email');
}

async function sendUserBotEditCategoryPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Выбери новую категорию', userBotCategoryMarkup());
}

async function sendUserBotTitlePrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Теперь напиши заголовок');
}

async function sendUserBotEditTitlePrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Введи новый заголовок');
}

async function sendUserBotBodyPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Теперь напиши текст объявления');
}

async function sendUserBotEditBodyPrompt(env: Env, chatId: number): Promise<void> {
  await sendUserBotMessage(env, chatId, 'Введи новый текст объявления');
}

async function handleUserBotSettingsLoginUpdate(
  env: Env,
  telegramUserId: string,
  chatId: number,
  login: string
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  const currentUser = await findUserById(env, telegramIdentity.user_id);
  if (!currentUser) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  if (!isValidLogin(login)) {
    await sendUserBotSettingsLoginPrompt(env, chatId);
    await sendUserBotMessage(env, chatId, 'Login должен быть 3-32 символа: латиница, цифры, _');
    return;
  }

  const existingLoginUser = await findUserByLogin(env, login);
  if (existingLoginUser && existingLoginUser.id !== currentUser.id) {
    await sendUserBotSettingsLoginPrompt(env, chatId);
    await sendUserBotMessage(env, chatId, 'Этот login уже занят');
    return;
  }

  await env.DB.prepare(
    `
      UPDATE users
      SET login = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(login, currentUser.id)
    .run();

  await clearBotDraft(env, telegramUserId);
  await sendUserBotSettings(env, chatId, telegramUserId, 'Login изменён');
}

async function handleUserBotSettingsEmailUpdate(
  env: Env,
  telegramUserId: string,
  chatId: number,
  email: string
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  const currentUser = await findUserById(env, telegramIdentity.user_id);
  if (!currentUser) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  if (!isValidEmail(email)) {
    await sendUserBotSettingsEmailPrompt(env, chatId);
    await sendUserBotMessage(env, chatId, 'Введите корректный email');
    return;
  }

  const existingIdentity = await findEmailIdentity(env, email);
  if (existingIdentity && existingIdentity.user_id !== currentUser.id) {
    await sendUserBotSettingsEmailPrompt(env, chatId);
    await sendUserBotMessage(env, chatId, 'Этот email уже зарегистрирован');
    return;
  }

  const currentEmailIdentity = await findEmailIdentityByUserId(env, currentUser.id);
  if (currentEmailIdentity) {
    await env.DB.prepare(
      `
        UPDATE user_identities
        SET email = ?
        WHERE id = ?
      `
    )
      .bind(email, currentEmailIdentity.id)
      .run();
  } else {
    await env.DB.prepare(
      `
        INSERT INTO user_identities (
          user_id,
          provider,
          provider_user_id,
          email,
          password_hash,
          telegram_username,
          created_at
        )
        VALUES (?, 'email', NULL, ?, NULL, NULL, CURRENT_TIMESTAMP)
      `
    )
      .bind(currentUser.id, email)
      .run();
  }

  await clearBotDraft(env, telegramUserId);
  await sendUserBotSettings(env, chatId, telegramUserId, 'Email изменён');
}

async function handleUserBotSettingsAvatarUpdate(
  env: Env,
  telegramUserId: string,
  chatId: number,
  fileId: string
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  const currentUser = await findUserById(env, telegramIdentity.user_id);
  if (!currentUser) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  const existingAvatarKey = currentUser.avatar_key;
  let upload: (AdImageUpload & { bytes: ArrayBuffer }) | null = null;

  try {
    upload = await putTelegramAvatar(env, fileId);
    await putMediaObject(env, upload.key, upload.bytes, upload.mimeType);
    await env.DB.prepare(
      `
        UPDATE users
        SET avatar_key = ?,
            avatar_mime_type = ?,
            avatar_updated_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    )
      .bind(upload.key, upload.mimeType, currentUser.id)
      .run();

    if (existingAvatarKey) {
      await deleteAvatarImage(env, existingAvatarKey);
    }
  } catch (error) {
    if (upload) {
      await deleteAvatarImage(env, upload.key);
    }
    console.error('Failed to update user bot avatar', error);
    await sendUserBotSettingsAvatarPrompt(env, chatId);
    await sendUserBotMessage(env, chatId, 'Не удалось сохранить аватар');
    return;
  }

  await clearBotDraft(env, telegramUserId);
  await sendUserBotSettings(env, chatId, telegramUserId, 'Аватар обновлён');
}

async function handleUserBotSettingsAvatarDelete(
  env: Env,
  telegramUserId: string,
  chatId: number
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  const currentUser = await findUserById(env, telegramIdentity.user_id);
  if (!currentUser) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  if (!currentUser.avatar_key) {
    await sendUserBotSettings(env, chatId, telegramUserId, 'Аватарки нет');
    return;
  }

  await env.DB.prepare(
    `
      UPDATE users
      SET avatar_key = NULL,
          avatar_mime_type = NULL,
          avatar_updated_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(currentUser.id)
    .run();

  await deleteAvatarImage(env, currentUser.avatar_key);
  await sendUserBotSettings(env, chatId, telegramUserId, 'Аватар удалён');
}

async function sendUserBotConfirmation(env: Env, chatId: number, draft: BotDraftRow): Promise<void> {
  const text = [
    'Проверь объявление:',
    `Категория: ${categoryLabel(draft.category)}`,
    `Заголовок: ${draft.title || ''}`,
    'Текст:',
    draft.body || '',
  ].join('\n');

  await sendUserBotMessage(env, chatId, text, userBotConfirmMarkup());
}

async function sendUserBotEditConfirmation(env: Env, chatId: number, draft: BotDraftRow): Promise<void> {
  const text = [
    'Проверь изменения:',
    `Категория: ${categoryLabel(draft.category)}`,
    `Заголовок: ${draft.title || ''}`,
    'Текст:',
    draft.body || '',
  ].join('\n');

  await sendUserBotMessage(env, chatId, text, userBotEditConfirmMarkup());
}

async function sendUserBotMyAds(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  const identity = await findTelegramIdentity(env, telegramUserId);
  if (!identity) {
    await sendUserBotMenu(env, chatId, 'Пользователь не найден');
    return;
  }

  const result = await env.DB.prepare(
    `
      SELECT id, title, category, status, image_key, image_mime_type, image_updated_at, created_at
      FROM ads
      WHERE owner_user_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `
  )
    .bind(identity.user_id)
    .all<{ id: number; title: string; category: string | null; status: string; created_at: string }>();

  if (!result.results.length) {
    await sendUserBotMessage(env, chatId, 'У тебя пока нет объявлений', userBotMenuMarkup(env));
    return;
  }

  await sendUserBotMessage(env, chatId, 'Твои объявления:', userBotMyAdsMarkup(result.results));
}

async function getOwnedAdForTelegramUser(env: Env, telegramUserId: string, adId: number): Promise<AdRow | null> {
  const identity = await findTelegramIdentity(env, telegramUserId);
  if (!identity) {
    return null;
  }

  const result = await env.DB.prepare(
    `
      SELECT id, title, category, status, image_key, image_mime_type, image_updated_at, created_at, body
      FROM ads
      WHERE id = ?
        AND owner_user_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `
  )
    .bind(adId, identity.user_id)
    .first<AdRow>();

  return result ?? null;
}

async function deleteOwnedAdForTelegramUser(env: Env, telegramUserId: string, adId: number): Promise<boolean> {
  const identity = await findTelegramIdentity(env, telegramUserId);
  if (!identity) {
    return false;
  }

  const result = await env.DB.prepare(
    `
      UPDATE ads
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND owner_user_id = ?
        AND deleted_at IS NULL
    `
  )
    .bind(adId, identity.user_id)
    .run();

  return (result.meta.changes ?? 0) > 0;
}

async function startUserBotEditFlow(
  env: Env,
  telegramUserId: string,
  chatId: number,
  adId: number
): Promise<boolean> {
  const ad = await getOwnedAdForTelegramUser(env, telegramUserId, adId);
  if (!ad) {
    await sendUserBotMenu(env, chatId, 'Объявление не найдено');
    return false;
  }

  await upsertBotDraft(env, telegramUserId, 'edit', 'title', ad.category, ad.title, ad.body, ad.id);
  await sendUserBotEditTitlePrompt(env, chatId);
  return true;
}

function buildUserBotOwnedAdText(
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'status' | 'created_at'>
): string {
  return [
    `#${ad.id}`,
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    `Статус: ${ad.status}`,
    `Дата: ${ad.created_at}`,
    'Текст:',
    truncateText(ad.body, 700),
  ].join('\n');
}

async function sendUserBotSingleAd(env: Env, chatId: number, ad: AdRow): Promise<void> {
  const text = buildUserBotOwnedAdText(ad);

  if (ad.image_key) {
    const response = await userBotApi(env, 'sendPhoto', {
      chat_id: chatId,
      photo: buildMediaUrl(env, ad.image_key),
      caption: text,
      reply_markup: userBotSingleAdMarkup(ad.id),
    });

    if (!response.ok) {
      throw new Error(`Telegram sendPhoto failed with status ${response.status}`);
    }
    return;
  }

  await sendUserBotMessage(env, chatId, text, userBotSingleAdMarkup(ad.id));
}

function buildTelegramAdText(
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category'>,
  statusLabel: string,
  itemKind: 'New' | 'Edited',
  bodyLimit = 2800
): string {
  return [
    `Type: ${itemKind}`,
    statusLabel,
    `ID: ${ad.id}`,
    `Title: ${ad.title}`,
    `Category: ${categoryLabel(ad.category)}`,
    'Text:',
    truncateText(ad.body, bodyLimit),
  ].join('\n');
}

async function sendTelegramMessage(
  env: Env,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'image_key'>,
  itemKind: 'New' | 'Edited' = 'New'
): Promise<void> {
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: 'Publish', callback_data: `publish:${ad.id}` },
        { text: 'Reject', callback_data: `reject:${ad.id}` },
      ],
    ],
  };

  const response = ad.image_key
    ? await telegramApi(env, 'sendPhoto', {
        chat_id: env.TELEGRAM_ADMIN_ID,
        photo: buildMediaUrl(env, ad.image_key),
        caption: buildTelegramAdText(ad, 'Pending', itemKind, 700),
        reply_markup: replyMarkup,
      })
    : await telegramApi(env, 'sendMessage', {
        chat_id: env.TELEGRAM_ADMIN_ID,
        text: buildTelegramAdText(ad, 'Pending', itemKind),
        reply_markup: replyMarkup,
      });

  if (!response.ok) {
    throw new Error(`Telegram send${ad.image_key ? 'Photo' : 'Message'} failed with status ${response.status}`);
  }
}

async function answerCallbackQuery(env: Env, callbackQueryId: string, text?: string): Promise<void> {
  await telegramApi(env, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}

async function editTelegramMessage(
  env: Env,
  chatId: number,
  messageId: number,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'image_key'>,
  statusLabel: string,
  itemKind: 'New' | 'Edited' = 'New'
): Promise<void> {
  const response = ad.image_key
    ? await telegramApi(env, 'editMessageCaption', {
        chat_id: chatId,
        message_id: messageId,
        caption: buildTelegramAdText(ad, statusLabel, itemKind, 700),
      })
    : await telegramApi(env, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: buildTelegramAdText(ad, statusLabel, itemKind),
      });

  if (!response.ok) {
    throw new Error(`Telegram editMessage${ad.image_key ? 'Caption' : 'Text'} failed with status ${response.status}`);
  }
}

async function notifyAdOwnerStatusChange(
  env: Env,
  ad: Pick<AdRow, 'id' | 'title' | 'category' | 'owner_user_id'>,
  status: 'published' | 'rejected'
): Promise<void> {
  if (!ad.owner_user_id) {
    return;
  }

  const telegramIdentity = await findTelegramIdentityByUserId(env, ad.owner_user_id);
  if (!telegramIdentity?.provider_user_id) {
    return;
  }

  const chatId = Number(telegramIdentity.provider_user_id);
  if (!Number.isInteger(chatId) || chatId <= 0) {
    return;
  }

  const statusLabel = status === 'published' ? 'опубликовано' : 'отклонено';
  const text = [
    status === 'published' ? 'Твоё объявление опубликовано' : 'Твоё объявление отклонено',
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    `Статус: ${status}`,
  ].join('\n');

  try {
    const response = await userBotApi(env, 'sendMessage', {
      chat_id: chatId,
      text,
    });

    if (!response.ok) {
      throw new Error(`Telegram sendMessage failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to notify user about ad ${statusLabel}`, error);
  }
}

async function startAdminBotEditFlow(env: Env, chatId: number, adId: number, page: number): Promise<boolean> {
  const ad = await getAdById(env, adId);
  if (!ad) {
    await sendAdminBotHome(env, chatId, 'Объявление не найдено');
    return false;
  }

  await upsertBotDraft(env, String(chatId), `admin-edit:${page}`, 'title', ad.category, ad.title, ad.body, ad.id);
  await sendAdminBotMessage(env, chatId, 'Введи новый заголовок');
  return true;
}

async function handleAdminBotText(
  env: Env,
  chatId: number,
  text: string,
  ctx: ExecutionContext
): Promise<void> {
  const draft = await getBotDraft(env, String(chatId));

  if (!draft || !draft.action.startsWith('admin-edit')) {
    const normalized = text.trim();
    if (normalized === '/start' || normalized === '/menu') {
      await sendAdminBotHome(env, chatId);
      return;
    }

    if (normalized === '/ads') {
      await sendAdminBotAds(env, chatId, 1);
      return;
    }

    if (normalized === '/users') {
      await sendAdminBotUsers(env, chatId, 1);
      return;
    }

    return;
  }

  if (!draft.ad_id) {
    await clearBotDraft(env, String(chatId));
    await sendAdminBotHome(env, chatId, 'Черновик потерян');
    return;
  }

  const originalAd = await getAdById(env, draft.ad_id);

  if (draft.step === 'title') {
    const title = text.trim();
    if (!title) {
      await sendAdminBotMessage(env, chatId, 'Заголовок не должен быть пустым');
      return;
    }

    await upsertBotDraft(env, String(chatId), draft.action, 'body', draft.category, title, draft.body, draft.ad_id);
    await sendAdminBotMessage(env, chatId, 'Введи новый текст');
    return;
  }

  if (draft.step === 'body') {
    const body = text.trim();
    if (!body) {
      await sendAdminBotMessage(env, chatId, 'Текст не должен быть пустым');
      return;
    }

    await upsertBotDraft(env, String(chatId), draft.action, 'category', draft.category, draft.title, body, draft.ad_id);
    await sendAdminBotMessage(env, chatId, 'Введи новую категорию: things, jobs, services, rent, creative, misc');
    return;
  }

  if (draft.step === 'category') {
    const category = normalizeCategory(text.trim());
    const adId = draft.ad_id;
    const page = Number(draft.action.split(':')[1] || '1');
    const normalizedPage = Number.isInteger(page) && page > 0 ? page : 1;

    const result = await env.DB.prepare(
      `
        UPDATE ads
        SET title = ?,
            body = ?,
            category = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(draft.title || '', draft.body || '', category, adId)
      .run();

    await clearBotDraft(env, String(chatId));

    if ((result.meta.changes ?? 0) === 0) {
      await sendAdminBotAds(env, chatId, normalizedPage);
      return;
    }

    await sendAdminBotAds(env, chatId, normalizedPage);
    ctx.waitUntil(
      sendTelegramMessage(env, {
        id: adId,
        title: draft.title || '',
        body: draft.body || '',
        category,
        image_key: originalAd?.image_key ?? null,
      }, 'Edited').catch((error: unknown) => {
        console.error('Telegram notification failed after admin edit', error);
      })
    );
  }
}

async function handleAdminBotCallback(
  update: TelegramUpdate,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const callbackQuery = update.callback_query;
  if (!callbackQuery?.data || !callbackQuery.message) {
    return json({ ok: true });
  }

  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  const [action, id] = data.split(':', 2);
  if (id && (action === 'publish' || action === 'reject')) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      await answerAdminCallbackQuery(env, callbackQuery.id, 'Invalid id').catch(() => {});
      return json({ ok: true });
    }

    const ad = await getAdById(env, numericId);
    if (!ad) {
      await answerAdminCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    const status = action === 'publish' ? 'published' : 'rejected';
    const result = await env.DB.prepare(
      `
        UPDATE ads
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(status, numericId)
      .run();

    if (result.meta.changes === 0) {
      await answerAdminCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    const itemKind: 'New' | 'Edited' =
      (callbackQuery.message.caption || callbackQuery.message.text || '').startsWith('Type: Edited') ? 'Edited' : 'New';

    try {
      await editTelegramMessage(
        env,
        callbackQuery.message.chat.id,
        callbackQuery.message.message_id,
        ad,
        status === 'published' ? 'Published' : 'Rejected',
        itemKind
      );
    } catch (error) {
      console.error('Failed to edit Telegram message', error);
    }

    await notifyAdOwnerStatusChange(env, ad, status);

    await answerAdminCallbackQuery(env, callbackQuery.id, status === 'published' ? 'Published' : 'Rejected').catch(() => {});
    return json({ ok: true });
  }

  if (data === ADMIN_BOT_MENU_HOME) {
    await answerAdminCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendAdminBotHome(env, chatId);
    return json({ ok: true });
  }

  if (action === 'admin' && id === 'ads' && data.split(':')[2] === 'page') {
    const page = Number(data.split(':')[3] || '1');
    await answerAdminCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendAdminBotAds(env, chatId, Number.isInteger(page) && page > 0 ? page : 1);
    return json({ ok: true });
  }

  if (action === 'admin' && id === 'users' && data.split(':')[2] === 'page') {
    const page = Number(data.split(':')[3] || '1');
    await answerAdminCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendAdminBotUsers(env, chatId, Number.isInteger(page) && page > 0 ? page : 1);
    return json({ ok: true });
  }

  if (action === 'admin' && id === 'ad') {
    const page = Number(data.split(':')[2] || '1');
    const adId = Number(data.split(':')[3] || '0');
    const command = data.split(':')[4] || 'view';

    if (!Number.isInteger(page) || page <= 0 || !Number.isInteger(adId) || adId <= 0) {
      await answerAdminCallbackQuery(env, callbackQuery.id, 'Invalid ad').catch(() => {});
      return json({ ok: true });
    }

    if (command === 'edit') {
      const started = await startAdminBotEditFlow(env, chatId, adId, page);
      if (!started) {
        await answerAdminCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
        return json({ ok: true });
      }

      await answerAdminCallbackQuery(env, callbackQuery.id).catch(() => {});
      return json({ ok: true });
    }

    if (command === 'delete') {
      const result = await deleteAdminAd(env, adId);
      await answerAdminCallbackQuery(
        env,
        callbackQuery.id,
        result === 'deleted' ? 'Ad deleted' : result === 'already' ? 'Already deleted' : 'Ad not found'
      ).catch(() => {});
      await sendAdminBotAds(env, chatId, page);
      return json({ ok: true });
    }

    if (command === 'publish' || command === 'reject') {
      const status = command === 'publish' ? 'published' : 'rejected';
      const response = await updateAdStatus(env, String(adId), status);
      if (response.status === 404) {
        await answerAdminCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
        return json({ ok: true });
      }

      await answerAdminCallbackQuery(env, callbackQuery.id, status === 'published' ? 'Published' : 'Rejected').catch(() => {});
      await sendAdminBotAds(env, chatId, page);
      return json({ ok: true });
    }

    const ad = await getAdById(env, adId);
    if (!ad) {
      await answerAdminCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    await answerAdminCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendAdminBotAdDetail(env, chatId, ad, page);
    return json({ ok: true });
  }

  if (action === 'admin' && id === 'user') {
    const page = Number(data.split(':')[2] || '1');
    const userId = Number(data.split(':')[3] || '0');
    const command = data.split(':')[4] || 'view';

    if (!Number.isInteger(page) || page <= 0 || !Number.isInteger(userId) || userId <= 0) {
      await answerAdminCallbackQuery(env, callbackQuery.id, 'Invalid user').catch(() => {});
      return json({ ok: true });
    }

    if (command === 'promote') {
      const result = await promoteAdminUser(env, userId);
      await answerAdminCallbackQuery(env, callbackQuery.id, result === 'promoted' ? 'Admin added' : result === 'already' ? 'Already admin' : 'User not found').catch(() => {});
      await sendAdminBotUsers(env, chatId, page);
      return json({ ok: true });
    }

    if (command === 'demote') {
      if (userId === chatId) {
        await answerAdminCallbackQuery(env, callbackQuery.id, 'Cannot demote yourself').catch(() => {});
        return json({ ok: true });
      }

      const result = await demoteAdminUser(env, userId);
      await answerAdminCallbackQuery(env, callbackQuery.id, result === 'demoted' ? 'User added' : result === 'already' ? 'Already user' : 'User not found').catch(() => {});
      await sendAdminBotUsers(env, chatId, page);
      return json({ ok: true });
    }

    if (command === 'delete') {
      if (userId === chatId) {
        await answerAdminCallbackQuery(env, callbackQuery.id, 'Cannot delete yourself').catch(() => {});
        return json({ ok: true });
      }

      const result = await deleteAdminUser(env, userId);
      await answerAdminCallbackQuery(env, callbackQuery.id, result === 'deleted' ? 'User deleted' : 'User not found').catch(() => {});
      await sendAdminBotUsers(env, chatId, page);
      return json({ ok: true });
    }

    const user = await findUserById(env, userId);
    if (!user) {
      await answerAdminCallbackQuery(env, callbackQuery.id, 'User not found').catch(() => {});
      return json({ ok: true });
    }

    await answerAdminCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendAdminBotUserDetail(env, chatId, {
      id: user.id,
      login: user.login,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    }, page);
    return json({ ok: true });
  }

  await answerAdminCallbackQuery(env, callbackQuery.id, 'Unknown action').catch(() => {});
  return json({ ok: true });
}

async function getAdById(env: Env, id: number): Promise<AdRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT ${AD_SELECT_COLUMNS}
      FROM ads
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `
  )
    .bind(id)
    .first<AdRow>();

  return result ?? null;
}

async function getPublishedAdCardById(env: Env, id: number, category: string | null = null): Promise<PublicAdCardRow | null> {
  const sql = [
    `
      SELECT ads.id,
             ads.title,
             ads.body,
             ads.category,
             ads.image_key,
             ads.image_mime_type,
             ads.image_updated_at,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.id = ?
        AND ads.status = 'published'
        AND ads.deleted_at IS NULL
    `,
  ];

  if (category) {
    sql.push('        AND ads.category = ?');
  }

  sql.push('      LIMIT 1');

  const statement = await env.DB.prepare(sql.join('\n'));
  const result = category
    ? await statement.bind(id, category).first<PublicAdCardRow>()
    : await statement.bind(id).first<PublicAdCardRow>();

  return result ?? null;
}

async function getPublicUserByLogin(env: Env, login: string): Promise<PublicUserRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id,
             login,
             display_name,
             avatar_key,
             avatar_mime_type,
             avatar_updated_at,
             created_at
      FROM users
      WHERE login = ?
      LIMIT 1
    `
  )
    .bind(login)
    .first<PublicUserRow>();

  return result ?? null;
}

async function listPublishedAdsByUser(env: Env, userId: number): Promise<AdCardRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             ads.category,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      INNER JOIN users ON users.id = ads.owner_user_id
      WHERE owner_user_id = ?
        AND status = 'published'
        AND deleted_at IS NULL
      ORDER BY ads.created_at DESC, ads.id DESC
    `
  )
    .bind(userId)
    .all<AdCardRow>();

  return result.results ?? [];
}

async function listPublishedAds(env: Env): Promise<AdRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ${AD_SELECT_COLUMNS}
      FROM ads
      WHERE status = 'published'
        AND deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
    `
  ).all<AdRow>();

  return result.results;
}

async function listAllAds(env: Env): Promise<AdRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ${AD_SELECT_COLUMNS}
      FROM ads
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
    `
  ).all<AdRow>();

  return result.results;
}

async function listPublishedAdsByCategory(env: Env, category: string): Promise<AdCardRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             ads.category,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.status = 'published'
        AND ads.deleted_at IS NULL
        AND ads.category = ?
      ORDER BY ads.created_at DESC, ads.id DESC
    `
  )
    .bind(category)
    .all<AdCardRow>();

  return result.results;
}

async function listPublishedAdsByCategoryPage(env: Env, category: string, limit: number, offset: number): Promise<AdCardRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             ads.category,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.status = 'published'
        AND ads.deleted_at IS NULL
        AND ads.category = ?
      ORDER BY ads.created_at DESC, ads.id DESC
      LIMIT ? OFFSET ?
    `
  )
    .bind(category, limit, offset)
    .all<AdCardRow>();

  return result.results;
}

async function searchPublishedAds(env: Env, query: string): Promise<AdCardRow[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const pattern = `%${escapeLikePattern(trimmed.toLowerCase())}%`;
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             ads.category,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.status = 'published'
        AND ads.deleted_at IS NULL
        AND (
          LOWER(ads.title) LIKE ? ESCAPE '\\'
          OR LOWER(ads.body) LIKE ? ESCAPE '\\'
        )
      ORDER BY ads.created_at DESC, ads.id DESC
    `
  )
    .bind(pattern, pattern)
    .all<AdCardRow>();

  return result.results;
}

async function searchPublishedAdsPage(env: Env, query: string, limit: number, offset: number): Promise<AdCardRow[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const pattern = `%${escapeLikePattern(trimmed.toLowerCase())}%`;
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             ads.category,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.status = 'published'
        AND ads.deleted_at IS NULL
        AND (
          LOWER(ads.title) LIKE ? ESCAPE '\\'
          OR LOWER(ads.body) LIKE ? ESCAPE '\\'
        )
      ORDER BY ads.created_at DESC, ads.id DESC
      LIMIT ? OFFSET ?
    `
  )
    .bind(pattern, pattern, limit, offset)
    .all<AdCardRow>();

  return result.results;
}

async function listPendingAds(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    `
      SELECT ${AD_SELECT_COLUMNS}
      FROM ads
      WHERE status = 'pending'
        AND deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
    `
  ).all<AdRow>();

  return json({ ads: result.results });
}

async function ensureAdImageColumns(env: Env): Promise<void> {
  if (cachedEnsureAdImageColumnsPromise) {
    return cachedEnsureAdImageColumnsPromise;
  }

  cachedEnsureAdImageColumnsPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(ads)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));

    if (!columnNames.has('image_key')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN image_key TEXT`).run();
    }

    if (!columnNames.has('image_mime_type')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN image_mime_type TEXT`).run();
    }

    if (!columnNames.has('image_updated_at')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN image_updated_at TEXT`).run();
    }
  })().finally(() => {
    cachedEnsureAdImageColumnsPromise = null;
  });

  return cachedEnsureAdImageColumnsPromise;
}

async function ensureUserAvatarColumns(env: Env): Promise<void> {
  if (cachedEnsureUserAvatarColumnsPromise) {
    return cachedEnsureUserAvatarColumnsPromise;
  }

  cachedEnsureUserAvatarColumnsPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(users)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));

    if (!columnNames.has('avatar_key')) {
      await env.DB.prepare(`ALTER TABLE users ADD COLUMN avatar_key TEXT`).run();
    }

    if (!columnNames.has('avatar_mime_type')) {
      await env.DB.prepare(`ALTER TABLE users ADD COLUMN avatar_mime_type TEXT`).run();
    }

    if (!columnNames.has('avatar_updated_at')) {
      await env.DB.prepare(`ALTER TABLE users ADD COLUMN avatar_updated_at TEXT`).run();
    }
  })().finally(() => {
    cachedEnsureUserAvatarColumnsPromise = null;
  });

  return cachedEnsureUserAvatarColumnsPromise;
}

async function createAd(
  env: Env,
  ctx: ExecutionContext,
  title: string,
  body: string,
  categoryInput: string | null | undefined,
  ownerUserId: number | null = null,
  image: File | null = null
): Promise<{ id: number; category: CategorySlug }> {
  const category = normalizeCategory(categoryInput);
  let imageUpload: AdImageUpload | null = null;

  if (image) {
    imageUpload = await readImageUpload(image);
    if (imageUpload) {
      await putAdImage(env, imageUpload, image);
    }
  }

  let result;
  try {
    result = await env.DB.prepare(
      `
        INSERT INTO ads (
          title,
          body,
          category,
          status,
          owner_user_id,
          image_key,
          image_mime_type,
          image_updated_at,
          deleted_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, 'pending', ?, ?, ?, CASE WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
      .bind(title, body, category, ownerUserId, imageUpload?.key || null, imageUpload?.mimeType || null, imageUpload?.key || null)
      .run();
  } catch (error) {
    if (imageUpload) {
      await deleteAdImage(env, imageUpload.key);
    }
    throw error;
  }

  ctx.waitUntil(
    sendTelegramMessage(env, {
      id: Number(result.meta.last_row_id),
      title,
      body,
      category,
      image_key: imageUpload?.key ?? null,
    }, 'New').catch((error: unknown) => {
      console.error('Telegram notification failed', error);
    })
  );

  return {
    id: Number(result.meta.last_row_id),
    category,
  };
}

async function getOwnedAdById(env: Env, id: number, userId: number): Promise<AdRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT ${AD_SELECT_COLUMNS}
      FROM ads
      WHERE id = ?
        AND owner_user_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `
  )
    .bind(id, userId)
    .first<AdRow>();

  return result ?? null;
}

async function parseAdForm(request: Request): Promise<AdForm> {
  const form = await request.formData();
  const imageValue = form.get('image');
  return {
    title: String(form.get('title') || '').trim(),
    body: String(form.get('body') || '').trim(),
    category: String(form.get('category') || '').trim(),
    image: isFileLike(imageValue) && imageValue.size > 0 ? imageValue : null,
  };
}

async function handleMyDeletePost(request: Request, env: Env, userId: number, id: string): Promise<Response> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const ownedAd = await getOwnedAdById(env, numericId, userId);
  if (!ownedAd) {
    return text('Not Found', 404);
  }

  await env.DB.prepare(
    `
      UPDATE ads
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND owner_user_id = ?
    `
  )
    .bind(numericId, userId)
    .run();

  return redirect('/my?message=Объявление удалено');
}

async function handleMyEditGet(env: Env, userId: number, id: string, currentUser: CurrentUser): Promise<Response> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const ad = await getOwnedAdById(env, numericId, userId);
  if (!ad) {
    return text('Not Found', 404);
  }

  return renderEditPage(env, currentUser, ad);
}

async function handleMyEditPost(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  userId: number,
  id: string,
  currentUser: CurrentUser
): Promise<Response> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const ad = await getOwnedAdById(env, numericId, userId);
  if (!ad) {
    return text('Not Found', 404);
  }

  const { title, body, category, image } = await parseAdForm(request);

  if (!title || !body) {
    return renderEditPage(env, currentUser, ad, 'Заполни заголовок и текст');
  }

  const nextStatus = ad.status === 'published' || ad.status === 'rejected' ? 'pending' : ad.status;
  const normalizedCategory = normalizeCategory(category);
  let newImage: AdImageUpload | null = null;
  try {
    if (image) {
      newImage = await readImageUpload(image);
      if (newImage) {
        await putAdImage(env, newImage, image);
      }
    }

    const oldImageKey = ad.image_key;
    await env.DB.prepare(
      `
        UPDATE ads
        SET title = ?,
            body = ?,
            category = ?,
            status = ?,
            image_key = ?,
            image_mime_type = ?,
            image_updated_at = CASE
              WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP
              ELSE image_updated_at
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND owner_user_id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(
        title,
        body,
        normalizedCategory,
        nextStatus,
        newImage?.key ?? ad.image_key,
        newImage?.mimeType ?? ad.image_mime_type,
        newImage?.key ?? null,
        numericId,
        userId
      )
      .run();

    if (newImage && oldImageKey) {
      await deleteAdImage(env, oldImageKey);
    }
  } catch (error) {
    if (newImage) {
      await deleteAdImage(env, newImage.key);
    }
    console.error('Failed to update ad with image', error);
    return renderEditPage(env, currentUser, ad, 'Не удалось сохранить картинку', `/my/edit/${ad.id}`);
  }

  ctx.waitUntil(
    sendTelegramMessage(env, {
      id: numericId,
      title,
      body,
      category: normalizedCategory,
      image_key: newImage?.key ?? ad.image_key,
    }, 'Edited').catch((error: unknown) => {
      console.error('Telegram notification failed after edit', error);
    })
  );

  return redirect('/my?message=Объявление сохранено');
}

async function updateAdStatus(env: Env, id: string, status: 'published' | 'rejected'): Promise<Response> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return json({ error: 'Invalid id' }, { status: 400 });
  }

  const ad = await getAdById(env, numericId);
  if (!ad) {
    return text('Not Found', 404);
  }

  const result = await env.DB.prepare(
    `
      UPDATE ads
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
    `
  )
    .bind(status, numericId)
    .run();

  if (result.meta.changes === 0) {
    return text('Not Found', 404);
  }

  await notifyAdOwnerStatusChange(env, ad, status);

  return json({ ok: true, id: numericId, status });
}

async function handleTelegramWebhook(request: Request, env: Env): Promise<Response> {
  let update: TelegramUpdate;

  try {
    update = await request.json();
  } catch {
    return text('Bad Request', 400);
  }

  if (update.message?.text && update.message.from) {
    const chatId = update.message.chat.id;
    if (isAdminTelegramChat(env, chatId)) {
      await handleAdminBotText(env, chatId, update.message.text, NOOP_EXECUTION_CONTEXT).catch((error: unknown) => {
        console.error('Failed to handle admin bot text', error);
      });
      return json({ ok: true });
    }
  }

  const callbackQuery = update.callback_query;
  if (!callbackQuery?.data || !callbackQuery.message) {
    return json({ ok: true });
  }

  if (isAdminTelegramChat(env, callbackQuery.message.chat.id)) {
    return handleAdminBotCallback(update, env, NOOP_EXECUTION_CONTEXT);
  }

  const [action, id] = callbackQuery.data.split(':', 2);
  if (!id || (action !== 'publish' && action !== 'reject')) {
    await answerCallbackQuery(env, callbackQuery.id, 'Unknown action').catch(() => {});
    return json({ ok: true });
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    await answerCallbackQuery(env, callbackQuery.id, 'Invalid id').catch(() => {});
    return json({ ok: true });
  }

  const ad = await getAdById(env, numericId);
  if (!ad) {
    await answerCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
    return json({ ok: true });
  }

  const status = action === 'publish' ? 'published' : 'rejected';
  const result = await env.DB.prepare(
    `
      UPDATE ads
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
    `
  )
    .bind(status, numericId)
    .run();

  if (result.meta.changes === 0) {
    await answerCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
    return json({ ok: true });
  }

  const itemKind: 'New' | 'Edited' =
    callbackQuery.message.text?.startsWith('Type: Edited') ? 'Edited' : 'New';

  try {
    await editTelegramMessage(
      env,
      callbackQuery.message.chat.id,
      callbackQuery.message.message_id,
      ad,
      status === 'published' ? 'Published' : 'Rejected',
      itemKind
    );
  } catch (error) {
    console.error('Failed to edit Telegram message', error);
  }

  await notifyAdOwnerStatusChange(env, ad, status);

  await answerCallbackQuery(env, callbackQuery.id, status === 'published' ? 'Published' : 'Rejected').catch(() => {});

  return json({ ok: true });
}

async function replyUserBot(env: Env, chatId: number, text: string): Promise<void> {
  const response = await userBotApi(env, 'sendMessage', {
    chat_id: chatId,
    text,
  });

  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }
}

async function findTelegramIdentity(env: Env, providerUserId: string): Promise<UserIdentityRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, user_id, provider, provider_user_id, email, password_hash, telegram_username, created_at
      FROM user_identities
      WHERE provider = 'telegram'
        AND provider_user_id = ?
      LIMIT 1
    `
  )
    .bind(providerUserId)
    .first<UserIdentityRow>();

  return result ?? null;
}

async function createTelegramUser(
  env: Env,
  login: string,
  email: string,
  telegramUserId: string,
  telegramUsername: string | null
): Promise<number> {
  const userResult = await env.DB.prepare(
    `
      INSERT INTO users (login, display_name, role, created_at, updated_at)
      VALUES (?, ?, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `
  )
    .bind(login, login)
    .run();

  const userId = Number(userResult.meta.last_row_id);

  await env.DB.batch([
    env.DB.prepare(
      `
        INSERT INTO user_identities (
          user_id,
          provider,
          provider_user_id,
          email,
          password_hash,
          telegram_username,
          created_at
        )
        VALUES (?, 'telegram', ?, NULL, NULL, ?, CURRENT_TIMESTAMP)
      `
    ).bind(userId, telegramUserId, telegramUsername),
    env.DB.prepare(
      `
        INSERT INTO user_identities (
          user_id,
          provider,
          provider_user_id,
          email,
          password_hash,
          telegram_username,
          created_at
        )
        VALUES (?, 'email', NULL, ?, NULL, NULL, CURRENT_TIMESTAMP)
      `
    ).bind(userId, email),
  ]);

  return userId;
}

async function createTelegramSignupUser(
  env: Env,
  telegramUserId: string,
  displayName: string,
  telegramUsername: string | null
): Promise<number> {
  let login = `tg_${telegramUserId}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existingLogin = await findUserByLogin(env, login);
    if (!existingLogin) {
      const userResult = await env.DB.prepare(
        `
          INSERT INTO users (login, display_name, role, created_at, updated_at)
          VALUES (?, ?, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
      )
        .bind(login, displayName)
        .run();

      const userId = Number(userResult.meta.last_row_id);

      await env.DB.prepare(
        `
          INSERT INTO user_identities (
            user_id,
            provider,
            provider_user_id,
            email,
            password_hash,
            telegram_username,
            created_at
          )
          VALUES (?, 'telegram', ?, NULL, NULL, ?, CURRENT_TIMESTAMP)
        `
      )
        .bind(userId, telegramUserId, telegramUsername)
        .run();

      return userId;
    }

    login = `tg_${telegramUserId}_${crypto.randomUUID().slice(0, 8)}`;
  }

  throw new Error('Unable to generate a unique Telegram login');
}

async function attachTelegramIdentityToUser(
  env: Env,
  userId: number,
  telegramUserId: string,
  telegramUsername: string | null
): Promise<'linked' | 'already' | 'conflict'> {
  const identityByTelegram = await findTelegramIdentity(env, telegramUserId);
  if (identityByTelegram && identityByTelegram.user_id !== userId) {
    return 'conflict';
  }

  const identityByUser = await findTelegramIdentityByUserId(env, userId);
  if (identityByUser && identityByUser.provider_user_id && identityByUser.provider_user_id !== telegramUserId) {
    return 'conflict';
  }

  if (identityByTelegram && identityByTelegram.user_id === userId) {
    if (identityByTelegram.telegram_username !== telegramUsername) {
      await env.DB.prepare(
        `
          UPDATE user_identities
          SET telegram_username = ?
          WHERE id = ?
        `
      )
        .bind(telegramUsername, identityByTelegram.id)
        .run();
    }

    return 'already';
  }

  if (identityByUser) {
    await env.DB.prepare(
      `
        UPDATE user_identities
        SET provider_user_id = ?,
            telegram_username = ?
        WHERE id = ?
      `
    )
      .bind(telegramUserId, telegramUsername, identityByUser.id)
      .run();

    return 'linked';
  }

  await env.DB.prepare(
    `
      INSERT INTO user_identities (
        user_id,
        provider,
        provider_user_id,
        email,
        password_hash,
        telegram_username,
        created_at
      )
      VALUES (?, 'telegram', ?, NULL, NULL, ?, CURRENT_TIMESTAMP)
    `
  )
    .bind(userId, telegramUserId, telegramUsername)
    .run();

  return 'linked';
}

async function relinkTelegramIdentityToUser(
  env: Env,
  userId: number,
  telegramUserId: string,
  telegramUsername: string | null
): Promise<'linked' | 'already' | 'conflict'> {
  const identityByTelegram = await findTelegramIdentity(env, telegramUserId);
  if (!identityByTelegram) {
    return attachTelegramIdentityToUser(env, userId, telegramUserId, telegramUsername);
  }

  if (identityByTelegram.user_id === userId) {
    if (identityByTelegram.telegram_username !== telegramUsername) {
      await env.DB.prepare(
        `
          UPDATE user_identities
          SET telegram_username = ?
          WHERE id = ?
        `
      )
        .bind(telegramUsername, identityByTelegram.id)
        .run();
    }

    return 'already';
  }

  const identityByUser = await findTelegramIdentityByUserId(env, userId);
  if (identityByUser && identityByUser.id !== identityByTelegram.id) {
    return 'conflict';
  }

  await env.DB.prepare(
    `
      UPDATE user_identities
      SET user_id = ?,
          telegram_username = ?
      WHERE id = ?
    `
  )
    .bind(userId, telegramUsername, identityByTelegram.id)
    .run();

  return 'linked';
}

async function findTelegramIdentityByUserId(env: Env, userId: number): Promise<UserIdentityRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, user_id, provider, provider_user_id, email, password_hash, telegram_username, created_at
      FROM user_identities
      WHERE provider = 'telegram'
        AND user_id = ?
      LIMIT 1
    `
  )
    .bind(userId)
    .first<UserIdentityRow>();

  return result ?? null;
}

async function getBotDraft(env: Env, telegramUserId: string): Promise<BotDraftRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, telegram_user_id, action, step, ad_id, login, email, category, title, body, created_at, updated_at
      FROM bot_drafts
      WHERE telegram_user_id = ?
      LIMIT 1
    `
  )
    .bind(telegramUserId)
    .first<BotDraftRow>();

  return result ?? null;
}

async function upsertBotDraft(
  env: Env,
  telegramUserId: string,
  action: string,
  step: string,
  category: string | null = null,
  title: string | null = null,
  body: string | null = null,
  adId: number | null = null,
  login: string | null = null,
  email: string | null = null
): Promise<void> {
  await env.DB.prepare(
    `
      INSERT INTO bot_drafts (
        telegram_user_id,
        action,
        step,
        ad_id,
        login,
        email,
        category,
        title,
        body,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        action = excluded.action,
        step = excluded.step,
        ad_id = excluded.ad_id,
        login = excluded.login,
        email = excluded.email,
        category = excluded.category,
        title = excluded.title,
        body = excluded.body,
        updated_at = CURRENT_TIMESTAMP
    `
  )
    .bind(telegramUserId, action, step, adId, login, email, category, title, body)
    .run();
}

async function clearBotDraft(env: Env, telegramUserId: string): Promise<void> {
  await env.DB.prepare(
    `
      DELETE FROM bot_drafts
      WHERE telegram_user_id = ?
    `
  )
    .bind(telegramUserId)
    .run();
}

async function getTelegramIdentityUserId(env: Env, telegramUserId: string): Promise<number | null> {
  const identity = await findTelegramIdentity(env, telegramUserId);
  return identity ? identity.user_id : null;
}

async function handleUserBotStart(
  env: Env,
  telegramUserId: string,
  chatId: number,
  telegramUsername: string | null
): Promise<void> {
  await clearBotDraft(env, telegramUserId);

  const existingIdentity = await findTelegramIdentity(env, telegramUserId);
  if (existingIdentity) {
    const user = await findUserById(env, existingIdentity.user_id);
    await sendUserBotMenu(env, chatId, 'С возвращением в жоржлист', user?.login || null);
    return;
  }

  await upsertBotDraft(env, telegramUserId, 'register', 'login', null, null, null, null, null, null);
  await sendUserBotLoginPrompt(env, chatId);
}

function isValidLogin(login: string): boolean {
  return /^[a-zA-Z0-9_]{3,32}$/.test(login);
}

async function handleUserBotMenuAction(
  env: Env,
  telegramUserId: string,
  chatId: number,
  action: string
): Promise<void> {
  if (action === USER_BOT_MENU_CREATE) {
    await upsertBotDraft(env, telegramUserId, 'create', 'category');
    await sendUserBotCategoryPrompt(env, chatId);
    return;
  }

  if (action === USER_BOT_MENU_SECTIONS) {
    await sendUserBotSections(env, chatId);
    return;
  }

  if (action === USER_BOT_MENU_SEARCH) {
    await upsertBotDraft(env, telegramUserId, 'search', 'query');
    await sendUserBotSearchPrompt(env, chatId);
    return;
  }

  if (action === USER_BOT_MENU_SETTINGS) {
    await sendUserBotSettings(env, chatId, telegramUserId);
    return;
  }

  if (action === USER_BOT_MENU_EDIT) {
    await sendUserBotMessage(env, chatId, 'Редактирование скоро будет');
    return;
  }

  if (action === USER_BOT_MENU_DELETE) {
    await sendUserBotMessage(env, chatId, 'Удаление скоро будет');
    return;
  }
}

async function handleUserBotDraftAction(
  env: Env,
  telegramUserId: string,
  chatId: number,
  action: string,
  value: string,
  ctx: ExecutionContext
): Promise<void> {
  const draft = await getBotDraft(env, telegramUserId);
  if (!draft || (draft.action !== 'create' && draft.action !== 'edit')) {
    await sendUserBotMenu(env, chatId, 'Начни с /start');
    return;
  }

  if (draft.action === 'create' && action === 'category') {
    const category = normalizeCategory(value);
    await upsertBotDraft(env, telegramUserId, 'create', 'title', category, null, null, draft.ad_id);
    await sendUserBotTitlePrompt(env, chatId);
    return;
  }

  if (draft.action === 'edit' && action === 'category') {
    const category = normalizeCategory(value);
    await upsertBotDraft(env, telegramUserId, 'edit', 'body', category, draft.title, draft.body, draft.ad_id);
    await sendUserBotEditBodyPrompt(env, chatId);
    return;
  }

  if (action === 'confirm') {
    if ((draft.action === 'create' && value === 'cancel') || (draft.action === 'edit' && value === 'cancel')) {
      await clearBotDraft(env, telegramUserId);
      await sendUserBotMenu(env, chatId, 'Отменено');
      return;
    }

    if (draft.action === 'create') {
      if (value !== 'send') {
        await sendUserBotMenu(env, chatId, 'Неизвестное действие');
        return;
      }

      const identity = await findTelegramIdentity(env, telegramUserId);
      if (!identity) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Пользователь не найден');
        return;
      }

      if (!draft.title || !draft.body) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Черновик пуст');
        return;
      }

      try {
        await createAd(env, ctx, draft.title, draft.body, draft.category, identity.user_id);
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Объявление отправлено на модерацию');
      } catch (error) {
        console.error('Failed to create ad from user bot', error);
        await sendUserBotMenu(env, chatId, 'Не удалось отправить объявление');
      }
      return;
    }

    if (draft.action === 'edit') {
      if (value !== 'save') {
        await sendUserBotMenu(env, chatId, 'Неизвестное действие');
        return;
      }

      const identity = await findTelegramIdentity(env, telegramUserId);
      if (!identity || !draft.ad_id) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Пользователь не найден');
        return;
      }

      if (!draft.title || !draft.body) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Черновик пуст');
        return;
      }

      const category = normalizeCategory(draft.category);
      const ad = await getOwnedAdForTelegramUser(env, telegramUserId, draft.ad_id);
      if (!ad) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Объявление не найдено');
        return;
      }

      try {
        await env.DB.prepare(
          `
            UPDATE ads
            SET title = ?,
                body = ?,
                category = ?,
                status = 'pending',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND owner_user_id = ?
              AND deleted_at IS NULL
          `
        )
          .bind(draft.title, draft.body, category, ad.id, identity.user_id)
          .run();

        ctx.waitUntil(
          sendTelegramMessage(env, {
            id: ad.id,
            title: draft.title,
            body: draft.body,
            category,
            image_key: ad.image_key,
          }, 'Edited').catch((error: unknown) => {
            console.error('Telegram notification failed', error);
          })
        );

        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Объявление обновлено и отправлено на модерацию');
      } catch (error) {
        console.error('Failed to update ad from user bot', error);
        await sendUserBotMenu(env, chatId, 'Не удалось обновить объявление');
      }
    }
  }
}

async function handleUserBotText(
  env: Env,
  telegramUserId: string,
  chatId: number,
  telegramUsername: string | null,
  text: string,
  ctx: ExecutionContext
): Promise<void> {
  if (text === '/start') {
    await handleUserBotStart(env, telegramUserId, chatId, telegramUsername);
    return;
  }

  const draft = await getBotDraft(env, telegramUserId);

  if (!draft || (draft.action !== 'create' && draft.action !== 'edit' && draft.action !== 'register' && draft.action !== 'search' && draft.action !== 'settings')) {
    return;
  }

  if (draft.action === 'search') {
    const query = text.trim();
    if (!query) {
      await sendUserBotSearchPrompt(env, chatId);
      return;
    }

    await upsertBotDraft(env, telegramUserId, 'search', 'results', null, query);
    await sendUserBotSearchResults(env, chatId, query);
    return;
  }

  if (draft.action === 'settings') {
    if (draft.step === 'login') {
      await handleUserBotSettingsLoginUpdate(env, telegramUserId, chatId, text.trim());
      return;
    }

    if (draft.step === 'email') {
      await handleUserBotSettingsEmailUpdate(env, telegramUserId, chatId, text.trim().toLowerCase());
      return;
    }

    if (draft.step === 'avatar') {
      await sendUserBotSettingsAvatarPrompt(env, chatId);
      return;
    }

    await clearBotDraft(env, telegramUserId);
    await sendUserBotSettings(env, chatId, telegramUserId);
    return;
  }

  if (draft.action === 'register') {
    if (draft.step === 'login') {
      const login = text.trim();
      if (!isValidLogin(login)) {
        await sendUserBotMessage(env, chatId, 'Login должен быть 3-32 символа: латиница, цифры, _');
        return;
      }

      const existingUser = await findUserByLogin(env, login);
      if (existingUser) {
        await sendUserBotMessage(env, chatId, 'Такой login уже занят');
        return;
      }

      await upsertBotDraft(env, telegramUserId, 'register', 'email', null, null, null, null, login, null);
      await sendUserBotEmailPrompt(env, chatId);
      return;
    }

    if (draft.step === 'email') {
      const email = text.trim().toLowerCase();
      if (!isValidEmail(email)) {
        await sendUserBotMessage(env, chatId, 'Введите корректный email');
        return;
      }

      const existingIdentity = await findEmailIdentity(env, email);
      if (existingIdentity && existingIdentity.password_hash) {
        await sendUserBotMessage(env, chatId, 'Этот email уже зарегистрирован');
        return;
      }

      if (!draft.login) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Начни сначала');
        return;
      }

      try {
        await createTelegramUser(env, draft.login, email, telegramUserId, telegramUsername);
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Ты зарегистрирован в жоржлист', draft.login);
      } catch (error) {
        console.error('Failed to create user from telegram bot', error);
        await sendUserBotMenu(env, chatId, 'Не удалось зарегистрировать аккаунт');
      }
      return;
    }

    return;
  }

  if (draft.step === 'title') {
    if (draft.action === 'create') {
      await upsertBotDraft(env, telegramUserId, 'create', 'body', draft.category, text, null, draft.ad_id);
      await sendUserBotBodyPrompt(env, chatId);
      return;
    }

    if (draft.action === 'edit') {
      await upsertBotDraft(env, telegramUserId, 'edit', 'category', draft.category, text, draft.body, draft.ad_id);
      await sendUserBotEditCategoryPrompt(env, chatId);
      return;
    }

    return;
  }

  if (draft.action === 'edit' && draft.step === 'category') {
    await sendUserBotEditCategoryPrompt(env, chatId);
    return;
  }

  if (draft.step === 'body') {
    if (draft.action === 'create') {
      if (!draft.title) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Начни заново');
        return;
      }

      await upsertBotDraft(env, telegramUserId, 'create', 'confirm', draft.category, draft.title, text, draft.ad_id);
      const nextDraft = await getBotDraft(env, telegramUserId);
      if (nextDraft) {
        await sendUserBotConfirmation(env, chatId, nextDraft);
      }
      return;
    }

    if (draft.action === 'edit') {
      if (!draft.title) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, chatId, 'Начни заново');
        return;
      }

      await upsertBotDraft(env, telegramUserId, 'edit', 'confirm', draft.category, draft.title, text, draft.ad_id);
      const nextDraft = await getBotDraft(env, telegramUserId);
      if (nextDraft) {
        await sendUserBotEditConfirmation(env, chatId, nextDraft);
      }
    }
  }
}

async function handleUserBotCallback(
  update: TelegramUpdate,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const callbackQuery = update.callback_query;
  if (!callbackQuery?.data || !callbackQuery.message) {
    return json({ ok: true });
  }

  const telegramUserId = String(callbackQuery.message.chat.id);
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data === USER_BOT_MENU_EDIT) {
    await answerUserCallbackQuery(env, callbackQuery.id, 'Редактирование скоро будет').catch(() => {});
    await sendUserBotMessage(env, chatId, 'Редактирование скоро будет', userBotMenuMarkup(env));
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_DELETE) {
    await answerUserCallbackQuery(env, callbackQuery.id, 'Удаление скоро будет').catch(() => {});
    await sendUserBotMessage(env, chatId, 'Удаление скоро будет', userBotMenuMarkup(env));
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_CREATE) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotMenuAction(env, telegramUserId, chatId, data);
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_SECTIONS) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotMenuAction(env, telegramUserId, chatId, data);
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_MY) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotMyAds(env, telegramUserId, chatId);
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_SEARCH) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await upsertBotDraft(env, telegramUserId, 'search', 'query');
    await sendUserBotSearchPrompt(env, chatId);
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_SETTINGS) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSettings(env, chatId, telegramUserId);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SECTION_PREFIX)) {
    const suffix = data.slice(USER_BOT_SECTION_PREFIX.length);
    if (suffix) {
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSectionAds(env, chatId, suffix);
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSections(env, chatId);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SECTION_AD_PREFIX)) {
    const payload = data.slice(USER_BOT_SECTION_AD_PREFIX.length);
    const [category, idText] = payload.split(':', 2);
    const adId = Number(idText);

    if (!category || !Number.isInteger(adId) || adId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid ad').catch(() => {});
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSectionAdDetail(env, chatId, category, adId);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SECTION_MORE_PREFIX)) {
    const payload = data.slice(USER_BOT_SECTION_MORE_PREFIX.length);
    const lastColon = payload.lastIndexOf(':');
    const category = payload.slice(0, lastColon);
    const offset = Number(payload.slice(lastColon + 1));
    if (!category || !Number.isInteger(offset) || offset < 0) {
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      return json({ ok: true });
    }
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSectionAds(env, chatId, category, offset);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SEARCH_MORE_PREFIX)) {
    const offset = Number(data.slice(USER_BOT_SEARCH_MORE_PREFIX.length));
    const draft = await getBotDraft(env, telegramUserId);
    const query = draft?.action === 'search' && draft.title ? draft.title : '';
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    if (!query) {
      await sendUserBotSearchPrompt(env, chatId);
      return json({ ok: true });
    }
    await sendUserBotSearchResults(env, chatId, query, Number.isInteger(offset) && offset >= 0 ? offset : 0);
    return json({ ok: true });
  }

  if (data === USER_BOT_SEARCH_RESULTS) {
    const draft = await getBotDraft(env, telegramUserId);
    const query = draft?.action === 'search' && draft.title ? draft.title : '';
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    if (!query) {
      await sendUserBotSearchPrompt(env, chatId);
      return json({ ok: true });
    }

    await sendUserBotSearchResults(env, chatId, query);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SEARCH_AD_PREFIX)) {
    const adId = Number(data.slice(USER_BOT_SEARCH_AD_PREFIX.length));
    if (!Number.isInteger(adId) || adId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid ad').catch(() => {});
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSearchAdDetail(env, chatId, adId);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_DELETE_PREFIX)) {
    const adId = Number(data.slice(USER_BOT_DELETE_PREFIX.length));
    if (!Number.isInteger(adId) || adId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid ad').catch(() => {});
      return json({ ok: true });
    }

    const deleted = await deleteOwnedAdForTelegramUser(env, telegramUserId, adId);
    if (!deleted) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id, 'Объявление удалено').catch(() => {});
    await sendUserBotMessage(env, chatId, 'Объявление удалено');
    await sendUserBotMyAds(env, telegramUserId, chatId);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SETTINGS_PREFIX)) {
    const action = data.slice(USER_BOT_SETTINGS_PREFIX.length);

    if (action === 'back') {
      await clearBotDraft(env, telegramUserId);
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotMenu(env, chatId, 'С возвращением в жоржлист');
      return json({ ok: true });
    }

    if (action === 'login') {
      await upsertBotDraft(env, telegramUserId, 'settings', 'login');
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSettingsLoginPrompt(env, chatId);
      return json({ ok: true });
    }

    if (action === 'email') {
      await upsertBotDraft(env, telegramUserId, 'settings', 'email');
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSettingsEmailPrompt(env, chatId);
      return json({ ok: true });
    }

    if (action === 'avatar') {
      await upsertBotDraft(env, telegramUserId, 'settings', 'avatar');
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSettingsAvatarPrompt(env, chatId);
      return json({ ok: true });
    }

    if (action === 'avatar-delete') {
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await handleUserBotSettingsAvatarDelete(env, telegramUserId, chatId);
      return json({ ok: true });
    }
  }

  if (data.startsWith(USER_BOT_MENU_MY_AD)) {
    const payload = data.slice(USER_BOT_MENU_MY_AD.length);
    const [idText, action] = payload.split(':', 2);
    const adId = Number(idText);

    if (!Number.isInteger(adId) || adId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid ad').catch(() => {});
      return json({ ok: true });
    }

    if (action === 'edit') {
      const started = await startUserBotEditFlow(env, telegramUserId, chatId, adId);
      if (!started) {
        await answerUserCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
        return json({ ok: true });
      }

      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      return json({ ok: true });
    }

    if (action === 'delete') {
      const deleted = await deleteOwnedAdForTelegramUser(env, telegramUserId, adId);
      if (!deleted) {
        await answerUserCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
        return json({ ok: true });
      }

      await answerUserCallbackQuery(env, callbackQuery.id, 'Объявление удалено').catch(() => {});
      await sendUserBotMessage(env, chatId, 'Объявление удалено');
      await sendUserBotMyAds(env, telegramUserId, chatId);
      return json({ ok: true });
    }

    const ad = await getOwnedAdForTelegramUser(env, telegramUserId, adId);
    if (!ad) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSingleAd(env, chatId, ad);
    return json({ ok: true });
  }

  if (data.startsWith(`${USER_BOT_DRAFT_PREFIX}category:`)) {
    const category = data.slice(`${USER_BOT_DRAFT_PREFIX}category:`.length);
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotDraftAction(env, telegramUserId, chatId, 'category', category, ctx);
    return json({ ok: true });
  }

  if (data === USER_BOT_DRAFT_SEND) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotDraftAction(env, telegramUserId, chatId, 'confirm', 'send', ctx);
    return json({ ok: true });
  }

  if (data === USER_BOT_DRAFT_CANCEL) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotDraftAction(env, telegramUserId, chatId, 'confirm', 'cancel', ctx);
    return json({ ok: true });
  }

  if (data === USER_BOT_EDIT_DRAFT_SAVE) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotDraftAction(env, telegramUserId, chatId, 'confirm', 'save', ctx);
    return json({ ok: true });
  }

  if (data === USER_BOT_EDIT_DRAFT_CANCEL) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotDraftAction(env, telegramUserId, chatId, 'confirm', 'cancel', ctx);
    return json({ ok: true });
  }

  await answerUserCallbackQuery(env, callbackQuery.id, 'Unknown action').catch(() => {});
  return json({ ok: true });
}

async function handleUserWebhook(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let update: TelegramUpdate;

  try {
    update = await request.json();
  } catch {
    return text('Bad Request', 400);
  }

  if (update.callback_query) {
    return handleUserBotCallback(update, env, ctx);
  }

  const message = update.message;
  if (!message?.from) {
    return json({ ok: true });
  }

  const telegramUserId = String(message.from.id);
  const chatId = message.chat.id;
  const telegramUsername = message.from.username || null;

  const avatarFileId = message.photo?.length ? message.photo[message.photo.length - 1]?.file_id : message.document?.mime_type?.startsWith('image/') ? message.document.file_id : null;
  if (avatarFileId) {
    const draft = await getBotDraft(env, telegramUserId);
    if (draft?.action === 'settings' && draft.step === 'avatar') {
      await handleUserBotSettingsAvatarUpdate(env, telegramUserId, chatId, avatarFileId);
      return json({ ok: true });
    }
  }

  if (!message.text) {
    return json({ ok: true });
  }

  if (message.text === '/start') {
    await handleUserBotStart(env, telegramUserId, chatId, telegramUsername);
    return json({ ok: true });
  }

  await handleUserBotText(env, telegramUserId, chatId, telegramUsername, message.text, ctx);

  return json({ ok: true });
}

async function listMyAds(env: Env, userId: number): Promise<AdRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ${AD_SELECT_COLUMNS}
      FROM ads
      WHERE owner_user_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
    `
  )
    .bind(userId)
    .all<AdRow>();

  return result.results;
}

async function handleLoginGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (currentUser) {
    return redirect('/my');
  }

  const url = new URL(request.url);
  const nextPath = sanitizeNextPath(url.searchParams.get('next'));
  const message = url.searchParams.get('message');
  return renderLoginPage(message, nextPath);
}

async function handleRegisterGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (currentUser) {
    return redirect('/my');
  }

  const url = new URL(request.url);
  const nextPath = sanitizeNextPath(url.searchParams.get('next'));
  const message = url.searchParams.get('message');
  const note = url.searchParams.get('source') === 'telegram' ? 'Telegram подтвержден. Заверши регистрацию, чтобы привязать его к аккаунту.' : null;
  const telegramAuthLink = `/register/telegram?next=${encodeURIComponent('/settings')}`;
  return renderRegisterPage(message, nextPath, '', '', '', note, telegramAuthLink);
}

async function handleLoginPost(request: Request, env: Env): Promise<Response> {
  const form = await request.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const nextPath = sanitizeNextPath(String(form.get('next') || ''));
  const pendingTelegramAuth = await readPendingTelegramAuthValue(env, request);

  if (!isValidEmail(email) || !password) {
    return renderLoginPage('Введите email и пароль', nextPath, email);
  }

  const identity = await findEmailIdentity(env, email);
  if (!identity?.password_hash) {
    return renderLoginPage('Неверный email или пароль', nextPath, email);
  }

  const isPasswordValid = await verifyPassword(password, identity.password_hash);
  if (!isPasswordValid) {
    return renderLoginPage('Неверный email или пароль', nextPath, email);
  }

  const sessionToken = await createSessionForUser(env, identity.user_id);
  const headers = new Headers();
  headers.set('Location', nextPath);
  headers.append('Set-Cookie', buildSessionCookie(sessionToken, isSecureRequest(request)));
  if (pendingTelegramAuth) {
    headers.append('Set-Cookie', clearTelegramAuthCookie(isSecureRequest(request)));
  }
  return new Response(null, { status: 303, headers });
}

async function handleRegisterPost(request: Request, env: Env): Promise<Response> {
  const form = await request.formData();
  const login = String(form.get('login') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const displayName = String(form.get('display_name') || '').trim();
  const nextPath = sanitizeNextPath(String(form.get('next') || ''));
  const pendingTelegramAuth = await readPendingTelegramAuthValue(env, request);

  if (!isValidLogin(login)) {
    return renderRegisterPage('Login должен быть 3-32 символа: латиница, цифры, _', nextPath, login, email, displayName);
  }

  if (!isValidEmail(email)) {
    return renderRegisterPage('Введите корректный email', nextPath, login, email, displayName);
  }

  if (password.length < 8) {
    return renderRegisterPage('Пароль должен быть не короче 8 символов', nextPath, login, email, displayName);
  }

  const existingIdentity = await findEmailIdentity(env, email);
  if (existingIdentity && existingIdentity.password_hash) {
    return renderRegisterPage('Этот email уже зарегистрирован', nextPath, login, email, displayName);
  }

  const passwordHash = await hashPassword(password);

  if (existingIdentity && !existingIdentity.password_hash) {
    const currentUser = await env.DB.prepare(
      `
        SELECT users.id, users.login, users.display_name, users.role, users.avatar_key, users.avatar_mime_type, users.avatar_updated_at, users.created_at, users.updated_at
        FROM users
        INNER JOIN user_identities ON user_identities.user_id = users.id
        WHERE user_identities.id = ?
        LIMIT 1
      `
    )
      .bind(existingIdentity.id)
      .first<CurrentUser>();

    if (!currentUser || currentUser.login !== login) {
      return renderRegisterPage('Этот email уже зарегистрирован', nextPath, login, email, displayName);
    }

    await env.DB.prepare(
      `
        UPDATE user_identities
        SET password_hash = ?
        WHERE id = ?
      `
    )
      .bind(passwordHash, existingIdentity.id)
      .run();

    if (pendingTelegramAuth) {
      const attachResult = await attachTelegramIdentityToUser(
        env,
        currentUser.id,
        pendingTelegramAuth.id,
        pendingTelegramAuth.username
      );
      if (attachResult === 'conflict') {
        return renderRegisterPage(
          'Telegram уже привязан к другому аккаунту',
          nextPath,
          login,
          email,
          displayName
        );
      }
    }
    const sessionToken = await createSessionForUser(env, currentUser.id);
    const headers = new Headers();
    headers.set('Location', nextPath);
    headers.append('Set-Cookie', buildSessionCookie(sessionToken, isSecureRequest(request)));
    if (pendingTelegramAuth) {
      headers.append('Set-Cookie', clearTelegramAuthCookie(isSecureRequest(request)));
    }
    return new Response(null, { status: 303, headers });
  }

  const existingLogin = await findUserByLogin(env, login);
  if (existingLogin) {
    return renderRegisterPage('Этот login уже занят', nextPath, login, email, displayName);
  }

  const userId = await createEmailUser(env, login, displayName || login, email, passwordHash);

  if (pendingTelegramAuth) {
    const attachResult = await attachTelegramIdentityToUser(
      env,
      userId,
      pendingTelegramAuth.id,
      pendingTelegramAuth.username
    );
    if (attachResult === 'conflict') {
      return renderRegisterPage(
        'Telegram уже привязан к другому аккаунту',
        nextPath,
        login,
        email,
        displayName
      );
    }
  }

  const sessionToken = await createSessionForUser(env, userId);
  const headers = new Headers();
  headers.set('Location', nextPath);
  headers.append('Set-Cookie', buildSessionCookie(sessionToken, isSecureRequest(request)));
  if (pendingTelegramAuth) {
    headers.append('Set-Cookie', clearTelegramAuthCookie(isSecureRequest(request)));
  }

  return new Response(null, { status: 303, headers });
}

async function handleLogoutPost(request: Request, env: Env): Promise<Response> {
  const sessionToken = getCookieValue(request, 'session');
  if (sessionToken) {
    await deleteSessionByToken(env, sessionToken);
  }

  return redirectWithHeaders('/', 303, {
    'Set-Cookie': clearSessionCookie(isSecureRequest(request)),
  });
}

async function handleMyGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/my');
  }

  const message = new URL(request.url).searchParams.get('message');
  return renderMyPage(env, currentUser, await listMyAds(env, currentUser.id), message);
}

async function handleMyDeleteRoute(request: Request, env: Env, id: string): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/my');
  }

  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  return handleMyDeletePost(request, env, currentUser.id, id);
}

async function handleMyEditRoute(request: Request, env: Env, ctx: ExecutionContext, id: string): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/my');
  }

  if (request.method === 'GET') {
    return handleMyEditGet(env, currentUser.id, id, currentUser);
  }

  if (request.method === 'POST') {
    return handleMyEditPost(request, env, ctx, currentUser.id, id, currentUser);
  }

  return text('Method Not Allowed', 405);
}

async function handleAdminGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/admin');
  }

  if (currentUser.role !== 'admin') {
    return text('Forbidden', 403);
  }

  const url = new URL(request.url);
  const section = parseAdminSection(url.searchParams.get('section'));
  const requestedPage = parseAdminPage(url.searchParams.get('page'));
  const message = url.searchParams.get('message');

  if (section === 'users') {
    const totalUsers = await countAllUsers(env);
    const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    return renderAdminUsersSection(
      currentUser,
      await listAdminUsersPage(env, page),
      { page, totalPages },
      message
    );
  }

  const totalAds = await countAllAds(env);
  const totalPages = Math.max(1, Math.ceil(totalAds / ADMIN_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  return renderAdminAdsSection(env, currentUser, await listAdminAdsPage(env, page), { page, totalPages }, message);
}

async function handleAdminDeleteRoute(request: Request, env: Env, id: string): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/admin');
  }

  if (currentUser.role !== 'admin') {
    return text('Forbidden', 403);
  }

  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const url = new URL(request.url);
  const page = parseAdminPage(url.searchParams.get('page'));

  const result = await env.DB.prepare(
    `
      UPDATE ads
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
    `
  )
    .bind(numericId)
    .run();

  if ((result.meta.changes ?? 0) === 0) {
    const existingAd = await env.DB.prepare(
      `
        SELECT id, deleted_at
        FROM ads
        WHERE id = ?
        LIMIT 1
      `
    )
      .bind(numericId)
      .first<{ id: number; deleted_at: string | null }>();

    if (!existingAd) {
      return text('Not Found', 404);
    }

    if (existingAd.deleted_at) {
      return redirectWithHeaders(buildAdminUrl('ads', page, 'Объявление уже удалено'));
    }

    return text('Not Found', 404);
  }

  return redirectWithHeaders(buildAdminUrl('ads', page, 'Объявление удалено'));
}

async function handleAdminUserActionRoute(request: Request, env: Env, id: string, action: 'promote' | 'demote' | 'delete'): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/admin');
  }

  if (currentUser.role !== 'admin') {
    return text('Forbidden', 403);
  }

  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const url = new URL(request.url);
  const page = parseAdminPage(url.searchParams.get('page'));

  if (action === 'delete' && numericId === currentUser.id) {
    return redirectWithHeaders(buildAdminUrl('users', page, 'Нельзя удалить себя'));
  }

  const target = await findUserById(env, numericId);
  if (!target) {
    return text('Not Found', 404);
  }

  if (action === 'promote') {
    const result = await promoteAdminUser(env, numericId);
    if (result === 'missing') {
      return text('Not Found', 404);
    }
    return redirectWithHeaders(buildAdminUrl('users', page, result === 'promoted' ? `Пользователь ${target.login} теперь admin` : 'Пользователь уже admin'));
  }

  if (action === 'demote') {
    if (numericId === currentUser.id) {
      return redirectWithHeaders(buildAdminUrl('users', page, 'Нельзя понизить себя'));
    }

    const result = await demoteAdminUser(env, numericId);
    if (result === 'missing') {
      return text('Not Found', 404);
    }
    return redirectWithHeaders(buildAdminUrl('users', page, result === 'demoted' ? `Пользователь ${target.login} теперь user` : 'Пользователь уже user'));
  }

  const result = await deleteAdminUser(env, numericId);
  if (result === 'missing') {
    return text('Not Found', 404);
  }

  return redirectWithHeaders(buildAdminUrl('users', page, `Пользователь ${target.login} удалён`));
}

async function handleAdminEditRoute(request: Request, env: Env, ctx: ExecutionContext, id: string): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/admin');
  }

  if (currentUser.role !== 'admin') {
    return text('Forbidden', 403);
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const page = parseAdminPage(new URL(request.url).searchParams.get('page'));

  const ad = await getAdById(env, numericId);
  if (!ad) {
    return text('Not Found', 404);
  }

  if (request.method === 'GET') {
    return renderEditPage(env, currentUser, ad, null, buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', page));
  }

  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  const { title, body, category, image } = await parseAdForm(request);

  if (!title || !body) {
    return renderEditPage(env, currentUser, ad, 'Заполни заголовок и текст', buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', page));
  }

  let newImage: AdImageUpload | null = null;
  try {
    const normalizedCategory = normalizeCategory(category);
    if (image) {
      newImage = await readImageUpload(image);
      if (newImage) {
        await putAdImage(env, newImage, image);
      }
    }

    const oldImageKey = ad.image_key;
    await env.DB.prepare(
      `
        UPDATE ads
        SET title = ?,
            body = ?,
            category = ?,
            image_key = ?,
            image_mime_type = ?,
            image_updated_at = CASE
              WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP
              ELSE image_updated_at
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(
        title,
        body,
        normalizedCategory,
        newImage?.key ?? ad.image_key,
        newImage?.mimeType ?? ad.image_mime_type,
        newImage?.key ?? null,
        numericId
      )
      .run();

    if (newImage && oldImageKey) {
      await deleteAdImage(env, oldImageKey);
    }
  } catch (error) {
    if (newImage) {
      await deleteAdImage(env, newImage.key);
    }
    console.error('Failed to update admin ad with image', error);
    return renderEditPage(env, currentUser, ad, 'Не удалось сохранить картинку', buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', page));
  }

  return redirectWithHeaders(buildAdminUrl('ads', page, 'Объявление сохранено'));
}

async function handleAdminPromoteUserRoute(request: Request, env: Env, id: string): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/admin');
  }

  if (currentUser.role !== 'admin') {
    return text('Forbidden', 403);
  }

  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  if (numericId === currentUser.id) {
    return redirectWithHeaders(buildAdminUrl('users', 1, 'Нельзя назначить admin самому себе'));
  }

  const targetUser = await findUserById(env, numericId);
  if (!targetUser) {
    return text('Not Found', 404);
  }

  if (targetUser.role === 'admin') {
    return redirectWithHeaders(buildAdminUrl('users', 1, 'Пользователь уже admin'));
  }

  await env.DB.prepare(
    `
      UPDATE users
      SET role = 'admin',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(numericId)
    .run();

  return redirectWithHeaders(buildAdminUrl('users', 1, `Пользователь ${targetUser.login} теперь admin`));
}

async function handleSettingsGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  const telegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
  const emailIdentity = await findEmailIdentityByUserId(env, currentUser.id);
  const message = new URL(request.url).searchParams.get('message');
  let pendingTelegramAuth: TelegramAuthPayload | null = null;
  try {
    pendingTelegramAuth = await readPendingTelegramAuthValue(env, request);
  } catch {
    pendingTelegramAuth = null;
  }

  return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, message, pendingTelegramAuth);
}

async function handleSettingsLinkTelegramGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  const telegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
  if (telegramIdentity) {
    return redirectWithMessage('/settings', 'Telegram уже привязан');
  }

  const botUsername = await getTelegramUserBotUsername(env);
  if (!botUsername) {
    return text('Telegram login widget unavailable', 500);
  }

  const authUrl = buildTelegramAuthCallbackUrl(request, 'link');
  return renderTelegramWidgetPage(
    'привязать telegram - жоржлист',
    'Привязать Telegram',
    'Подтверди вход в Telegram, чтобы привязать его к аккаунту.',
    botUsername,
    authUrl,
    currentUser
  );
}

async function handleSettingsLinkTelegramConfirmPost(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  let pendingTelegramAuth: TelegramAuthPayload | null = null;
  try {
    pendingTelegramAuth = await readPendingTelegramAuthValue(env, request);
  } catch {
    pendingTelegramAuth = null;
  }

  if (!pendingTelegramAuth) {
    return redirectWithMessage('/settings', 'Нужно сначала подтвердить Telegram');
  }

  const result = await relinkTelegramIdentityToUser(
    env,
    currentUser.id,
    pendingTelegramAuth.id,
    pendingTelegramAuth.username
  );

  const headers = new Headers();
  headers.append('Set-Cookie', clearTelegramAuthCookie(isSecureRequest(request)));

  if (result === 'conflict') {
    return redirectWithMessage('/settings', 'У этого аккаунта уже есть другой Telegram', 303, headers);
  }

  if (result === 'already') {
    return redirectWithMessage('/settings', 'Telegram уже привязан', 303, headers);
  }

  return redirectWithMessage('/settings', 'Telegram перепривязан', 303, headers);
}

async function handleLoginTelegramGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (currentUser) {
    return redirect('/my');
  }

  const botUsername = await getTelegramUserBotUsername(env);
  if (!botUsername) {
    return text('Telegram login widget unavailable', 500);
  }

  const url = new URL(request.url);
  const nextPath = sanitizeNextPath(url.searchParams.get('next') || '/settings');
  const authUrl = buildTelegramAuthCallbackUrl(request, 'login', nextPath);

  return renderTelegramWidgetPage(
    'войти через telegram - жоржлист',
    'Войти через Telegram',
    'Нажми кнопку ниже и подтверди вход в Telegram.',
    botUsername,
    authUrl
  );
}

async function handleRegisterTelegramGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (currentUser) {
    return redirect('/my');
  }

  const botUsername = await getTelegramUserBotUsername(env);
  if (!botUsername) {
    return text('Telegram login widget unavailable', 500);
  }

  const url = new URL(request.url);
  const nextPath = sanitizeNextPath(url.searchParams.get('next'));
  const authUrl = buildTelegramAuthCallbackUrl(request, 'login', nextPath);

  return renderTelegramWidgetPage(
    'регистрация через telegram - жоржлист',
    'Зарегистрироваться через Telegram',
    'Нажми кнопку ниже, чтобы начать регистрацию через Telegram.',
    botUsername,
    authUrl
  );
}

async function handleSettingsPost(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  const form = await request.formData();
  const login = String(form.get('login') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();

  const telegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
  const emailIdentity = await findEmailIdentityByUserId(env, currentUser.id);

  if (!isValidLogin(login)) {
    return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Login должен быть 3-32 символа: латиница, цифры, _');
  }

  if (!isValidEmail(email)) {
    return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Введите корректный email');
  }

  const existingLoginUser = await findUserByLogin(env, login);
  if (existingLoginUser && existingLoginUser.id !== currentUser.id) {
    return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Этот login уже занят');
  }

  const existingEmailIdentity = await findEmailIdentity(env, email);
  if (existingEmailIdentity && existingEmailIdentity.user_id !== currentUser.id) {
    return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Этот email уже зарегистрирован');
  }

  const currentEmailIdentity = await findEmailIdentityByUserId(env, currentUser.id);

  await env.DB.batch([
    env.DB.prepare(
      `
        UPDATE users
        SET login = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    ).bind(login, currentUser.id),
    env.DB.prepare(
      `
        UPDATE user_identities
        SET email = ?
        WHERE user_id = ?
          AND provider = 'email'
      `
    ).bind(email, currentUser.id),
  ]);

  if (!currentEmailIdentity) {
    await env.DB.prepare(
      `
        INSERT INTO user_identities (
          user_id,
          provider,
          provider_user_id,
          email,
          password_hash,
          telegram_username,
          created_at
        )
        VALUES (?, 'email', NULL, ?, NULL, NULL, CURRENT_TIMESTAMP)
      `
    )
      .bind(currentUser.id, email)
      .run();
  }

  const updatedTelegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
  const updatedEmailIdentity = await findEmailIdentityByUserId(env, currentUser.id);
  const refreshedUser = (await getCurrentUser(request, env)) || {
    ...currentUser,
    login,
    email,
  };

  return renderSettingsPage(env, refreshedUser, updatedTelegramIdentity, updatedEmailIdentity, 'Настройки сохранены');
}

async function handleSettingsAvatarPost(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  const telegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
  const emailIdentity = await findEmailIdentityByUserId(env, currentUser.id);
  const form = await request.formData();
  const avatarValue = form.get('avatar');
  const avatar = isFileLike(avatarValue) && avatarValue.size > 0 ? avatarValue : null;
  if (!avatar) {
    return redirectWithMessage('/settings', 'Выбери файл с аватаркой');
  }

  const existingAvatarKey = currentUser.avatar_key;
  let newAvatar: AdImageUpload | null = null;

  try {
    newAvatar = await readAvatarUpload(avatar);
    if (!newAvatar) {
      return redirectWithMessage('/settings', 'Выбери файл с аватаркой');
    }

    await putAdImage(env, newAvatar, avatar);
    await env.DB.prepare(
      `
        UPDATE users
        SET avatar_key = ?,
            avatar_mime_type = ?,
            avatar_updated_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    )
      .bind(newAvatar.key, newAvatar.mimeType, currentUser.id)
      .run();

    if (existingAvatarKey) {
      await deleteAvatarImage(env, existingAvatarKey);
    }
  } catch (error) {
    if (newAvatar) {
      await deleteAvatarImage(env, newAvatar.key);
    }
    console.error('Failed to update avatar', error);
    return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Не удалось сохранить аватар');
  }

  return redirectWithMessage('/settings', 'Аватар обновлён');
}

async function handleSettingsAvatarDeletePost(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  const existingAvatarKey = currentUser.avatar_key;
  await env.DB.prepare(
    `
      UPDATE users
      SET avatar_key = NULL,
          avatar_mime_type = NULL,
          avatar_updated_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(currentUser.id)
    .run();

  if (existingAvatarKey) {
    await deleteAvatarImage(env, existingAvatarKey);
  }

  return redirectWithMessage('/settings', 'Аватар удалён');
}

async function handleSettingsPasswordPost(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  const telegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
  const emailIdentity = await findEmailIdentityByUserId(env, currentUser.id);
  if (!emailIdentity) {
    return renderSettingsPage(env, currentUser, telegramIdentity, null, 'Сначала добавь email на сайте');
  }

  const form = await request.formData();
  const currentPassword = String(form.get('current_password') || '');
  const newPassword = String(form.get('new_password') || '');
  const confirmPassword = String(form.get('confirm_password') || '');

  if (newPassword.length < 8) {
    return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Новый пароль должен быть не короче 8 символов');
  }

  if (newPassword !== confirmPassword) {
    return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Подтверждение нового пароля не совпадает');
  }

  if (emailIdentity.password_hash) {
    if (!currentPassword) {
      return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Введите текущий пароль');
    }

    const isPasswordValid = await verifyPassword(currentPassword, emailIdentity.password_hash);
    if (!isPasswordValid) {
      return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, 'Неверный текущий пароль');
    }
  }

  const passwordHash = await hashPassword(newPassword);
  await env.DB.prepare(
    `
      UPDATE user_identities
      SET password_hash = ?
      WHERE id = ?
    `
  )
    .bind(passwordHash, emailIdentity.id)
    .run();

  return redirectWithMessage('/settings', 'Пароль изменён');
}

async function handleTelegramAuthCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode');
  if (mode !== 'login' && mode !== 'link') {
    return text('Bad Request', 400);
  }

  const auth = await verifyTelegramLoginPayload(url.searchParams, env);
  if (!auth) {
    const target = mode === 'login' ? '/login' : '/settings';
    return redirectWithMessage(target, 'Неверные данные Telegram');
  }

  const telegramUserId = auth.id;
  const telegramUsername = auth.username || null;

  if (mode === 'link') {
    const currentUser = await getCurrentUser(request, env);
    if (!currentUser) {
      return redirect('/login?next=/settings');
    }

    const existingIdentity = await findTelegramIdentity(env, telegramUserId);
    if (existingIdentity && existingIdentity.user_id !== currentUser.id) {
      const pendingTelegramAuth = await buildPendingTelegramAuthValue(env, auth);
      const headers = new Headers();
      headers.set('Location', '/settings?message=' + encodeURIComponent('Этот Telegram уже привязан к другому аккаунту'));
      headers.append('Set-Cookie', buildTelegramAuthCookie(pendingTelegramAuth, isSecureRequest(request)));
      return new Response(null, { status: 303, headers });
    }

    const currentTelegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
    if (currentTelegramIdentity && currentTelegramIdentity.provider_user_id !== telegramUserId) {
      return redirectWithMessage('/settings', 'У этого аккаунта уже есть другой Telegram');
    }

    const result = await attachTelegramIdentityToUser(env, currentUser.id, telegramUserId, telegramUsername);
    if (result === 'already') {
      return redirectWithMessage('/settings', 'Telegram уже привязан');
    }
    if (result === 'conflict') {
      return redirectWithMessage('/settings', 'Telegram уже привязан к другому аккаунту');
    }

    return redirectWithMessage('/settings', 'Telegram успешно привязан');
  }

  const nextPath = sanitizeNextPath(url.searchParams.get('next'));
  const existingIdentity = await findTelegramIdentity(env, telegramUserId);
  if (existingIdentity) {
    const sessionToken = await createSessionForUser(env, existingIdentity.user_id);
    return redirectWithHeaders(nextPath, 303, {
      'Set-Cookie': buildSessionCookie(sessionToken, isSecureRequest(request)),
    });
  }

  const userId = await createTelegramSignupUser(env, telegramUserId, auth.first_name, telegramUsername);
  const sessionToken = await createSessionForUser(env, userId);
  return redirectWithHeaders(nextPath, 303, {
    'Set-Cookie': buildSessionCookie(sessionToken, isSecureRequest(request)),
  });
}

async function handleApiAdsGet(env: Env): Promise<Response> {
  return json({ ads: await listPublishedAds(env) });
}

async function handleApiAdsPost(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let payload: { title?: string; body?: string; category?: string };

  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = String(payload.title || '').trim();
  const body = String(payload.body || '').trim();
  const category = String(payload.category || '').trim();

  if (!title || !body) {
    return json({ error: 'title and body are required' }, { status: 400 });
  }

  const ad = await createAd(env, ctx, title, body, category, null);
  return json(
    {
      ok: true,
      id: ad.id,
      status: 'pending',
      owner_user_id: null,
    },
    { status: 201 }
  );
}

async function handleNewGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/new');
  }

  return renderNewPage(currentUser);
}

async function handleNewPost(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/new');
  }

  const { title, body, category, image } = await parseAdForm(request);

  if (!title || !body) {
    return renderNewPage(currentUser, 'Заполни заголовок и текст');
  }

  try {
    await createAd(env, ctx, title, body, category, currentUser.id, image);
  } catch (error) {
    console.error('Failed to create ad with image', error);
    return renderNewPage(currentUser, 'Не удалось загрузить картинку');
  }
  return redirect('/my?message=Объявление создано');
}

async function handleCategoryGet(env: Env, slug: string, currentUser: CurrentUser | null = null): Promise<Response> {
  const category = CATEGORIES.find((item) => item.slug === slug);
  if (!category) {
    return renderNotFoundPage(currentUser);
  }

  return renderCategoryPage(env, slug, await listPublishedAdsByCategory(env, slug), currentUser);
}

async function handleAdGet(env: Env, id: string, currentUser: CurrentUser | null = null): Promise<Response> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const ad = await getPublishedAdCardById(env, numericId);
  if (!ad) {
    return renderNotFoundPage(currentUser);
  }

  return renderPublicAdPage(env, ad, currentUser);
}

async function handlePublicUserGet(env: Env, login: string, currentUser: CurrentUser | null = null): Promise<Response> {
  let decodedLogin = login;
  try {
    decodedLogin = decodeURIComponent(login);
  } catch {
    return text('Not Found', 404);
  }

  const user = await getPublicUserByLogin(env, decodedLogin);
  if (!user) {
    return renderNotFoundPage(currentUser);
  }

  return renderPublicUserPage(env, user, await listPublishedAdsByUser(env, user.id), currentUser);
}

async function handleMediaGet(env: Env, key: string): Promise<Response> {
  const decodedKey = decodeURIComponent(key);
  if (!decodedKey || !env.MEDIA_BUCKET) {
    return text('Not Found', 404);
  }

  const object = await env.MEDIA_BUCKET.get(decodedKey);
  if (!object) {
    return text('Not Found', 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  if (!headers.get('Content-Type')) {
    headers.set('Content-Type', 'application/octet-stream');
  }

  return new Response(object.body, { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    await ensureAdImageColumns(env);
    await ensureUserAvatarColumns(env);
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/') {
      return renderHome(await getCurrentUser(request, env));
    }

    if (path === '/register') {
      if (request.method === 'GET') return handleRegisterGet(request, env);
      if (request.method === 'POST') return handleRegisterPost(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/login') {
      if (request.method === 'GET') return handleLoginGet(request, env);
      if (request.method === 'POST') return handleLoginPost(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/login/telegram') {
      if (request.method === 'GET') return handleLoginTelegramGet(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/register/telegram') {
      if (request.method === 'GET') return handleRegisterTelegramGet(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/logout') {
      if (request.method === 'POST') return handleLogoutPost(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/my') {
      if (request.method === 'GET') return handleMyGet(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/settings') {
      if (request.method === 'GET') return handleSettingsGet(request, env);
      if (request.method === 'POST') return handleSettingsPost(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/settings/avatar') {
      if (request.method === 'POST') return handleSettingsAvatarPost(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/settings/password') {
      if (request.method === 'POST') return handleSettingsPasswordPost(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/settings/avatar/delete') {
      if (request.method === 'POST') return handleSettingsAvatarDeletePost(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/admin') {
      if (request.method === 'GET') return handleAdminGet(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/settings/link-telegram') {
      if (request.method === 'GET') return handleSettingsLinkTelegramGet(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path === '/settings/link-telegram/confirm') {
      if (request.method === 'POST') return handleSettingsLinkTelegramConfirmPost(request, env);
      return text('Method Not Allowed', 405);
    }

    if (path.startsWith('/my/delete/')) {
      return handleMyDeleteRoute(request, env, path.slice('/my/delete/'.length));
    }

    if (path.startsWith('/my/edit/')) {
      return handleMyEditRoute(request, env, ctx, path.slice('/my/edit/'.length));
    }

    if (path.startsWith('/admin/delete/')) {
      return handleAdminDeleteRoute(request, env, path.slice('/admin/delete/'.length));
    }

    if (path.startsWith('/admin/users/') && path.endsWith('/promote')) {
      return handleAdminUserActionRoute(request, env, path.slice('/admin/users/'.length, -'/promote'.length), 'promote');
    }

    if (path.startsWith('/admin/users/') && path.endsWith('/demote')) {
      return handleAdminUserActionRoute(request, env, path.slice('/admin/users/'.length, -'/demote'.length), 'demote');
    }

    if (path.startsWith('/admin/users/') && path.endsWith('/delete')) {
      return handleAdminUserActionRoute(request, env, path.slice('/admin/users/'.length, -'/delete'.length), 'delete');
    }

    if (path.startsWith('/admin/edit/')) {
      return handleAdminEditRoute(request, env, ctx, path.slice('/admin/edit/'.length));
    }

    if (path === '/new') {
      if (request.method === 'GET') return handleNewGet(request, env);
      if (request.method === 'POST') return handleNewPost(request, env, ctx);
      return text('Method Not Allowed', 405);
    }

    if (path.startsWith('/category/') && request.method === 'GET') {
      return handleCategoryGet(env, path.slice('/category/'.length), await getCurrentUser(request, env));
    }

    if (path.startsWith('/ad/') && request.method === 'GET') {
      return handleAdGet(env, path.slice('/ad/'.length), await getCurrentUser(request, env));
    }

    if (path.startsWith('/u/') && request.method === 'GET') {
      return handlePublicUserGet(env, path.slice('/u/'.length), await getCurrentUser(request, env));
    }

    if (path.startsWith('/media/') && request.method === 'GET') {
      return handleMediaGet(env, path.slice('/media/'.length));
    }

    if (path === '/search' && request.method === 'GET') {
      const query = url.searchParams.get('q') || '';
      return renderSearchPage(env, query, await searchPublishedAds(env, query), await getCurrentUser(request, env));
    }

    if (path === '/api/ads') {
      if (request.method === 'GET') return handleApiAdsGet(env);
      if (request.method === 'POST') return handleApiAdsPost(request, env, ctx);
      return text('Method Not Allowed', 405);
    }

    if (path === '/telegram/auth' && request.method === 'GET') {
      return handleTelegramAuthCallback(request, env);
    }

    if (path === '/api/debug/pending' && request.method === 'GET') {
      return listPendingAds(env);
    }

    if (request.method === 'POST') {
      const publishMatch = path.match(/^\/api\/debug\/publish\/(\d+)$/);
      if (publishMatch) {
        return updateAdStatus(env, publishMatch[1], 'published');
      }

      const rejectMatch = path.match(/^\/api\/debug\/reject\/(\d+)$/);
      if (rejectMatch) {
        return updateAdStatus(env, rejectMatch[1], 'rejected');
      }

      if (path === '/telegram/webhook') {
        return handleTelegramWebhook(request, env);
      }

      if (path === '/telegram/user-webhook') {
        return handleUserWebhook(request, env, ctx);
      }
    }

    return renderNotFoundPage(await getCurrentUser(request, env));
  },
} satisfies ExportedHandler<Env>;
