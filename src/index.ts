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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type AdForm = {
  title: string;
  body: string;
  category: string;
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
const USER_BOT_MENU_CREATE = 'user:create';
const USER_BOT_MENU_EDIT = 'user:edit';
const USER_BOT_MENU_DELETE = 'user:delete';
const USER_BOT_MENU_MY = 'user:my';
const USER_BOT_MENU_MY_AD = 'user:myad:';
const USER_BOT_DELETE_PREFIX = 'delete_';
const USER_BOT_DRAFT_PREFIX = 'draft:';
const USER_BOT_DRAFT_CANCEL = 'draft:confirm:cancel';
const USER_BOT_DRAFT_SEND = 'draft:confirm:send';
const USER_BOT_EDIT_DRAFT_CANCEL = 'draft:edit:cancel';
const USER_BOT_EDIT_DRAFT_SAVE = 'draft:edit:save';
let cachedTelegramUserBotUsername: string | null = null;
let cachedTelegramUserBotUsernamePromise: Promise<string | null> | null = null;

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
    ? `<a href="/my">мои объявления</a> <a href="/settings">настройки</a>${adminLink} <form method="post" action="/logout" style="display:inline"><button class="link-button" type="submit">выйти</button></form>`
    : `<a href="/login">войти</a> <a href="/register">зарегистрироваться</a>`;

  return `<div class="nav"><a href="/">главная</a> <a href="/new">подать объявление</a> ${authLinks}</div>`;
}

function shell(title: string, body: string, currentUser: CurrentUser | null = null): Response {
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
      margin: 0 0 10px;
      padding: 0 0 8px;
      border-bottom: 1px solid #eee;
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
  </style>
</head>
<body>
  ${body}
</body>
</html>`);
}

function renderAdList(ads: AdRow[]): string {
  if (!ads.length) {
    return '<div class="empty">Пока нет объявлений.</div>';
  }

  return ads
    .map((ad) => {
      const category = ad.category ? `${htmlEscape(categoryLabel(ad.category))} · ` : '';
      return `<div class="ad">
  <div class="title">${htmlEscape(ad.title)}</div>
  <div class="meta">${category}${htmlEscape(ad.created_at)}</div>
  <div class="body">${htmlEscape(ad.body)}</div>
</div>`;
    })
    .join('');
}

function renderHome(currentUser: CurrentUser | null = null): Response {
  const categories = CATEGORIES.map(
    (category) => `<li><a href="/category/${category.slug}">${htmlEscape(category.label)}</a></li>`
  ).join('');

  return shell(
    'жоржлист',
    `<h1>жоржлист</h1>
<p>Минимальная доска объявлений.</p>
${nav(currentUser)}
<div class="section">
  <h2>Категории</h2>
  <ul>
    ${categories}
  </ul>
</div>
<div class="section">
  <a href="/new">подать объявление</a>
</div>`
  );
}

function renderNewPage(currentUser: CurrentUser | null = null, error: string | null = null): Response {
  const options = CATEGORIES.map(
    (category) => `<option value="${category.slug}"${category.slug === 'misc' ? ' selected' : ''}>${htmlEscape(category.label)}</option>`
  ).join('');

  return shell(
    'подать объявление - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Подать объявление</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  <form method="post" action="/new">
    <label for="title">Заголовок</label>
    <input id="title" name="title" type="text" required maxlength="200" />

    <label for="category">Категория</label>
    <select id="category" name="category">
      ${options}
    </select>

    <label for="body">Текст</label>
    <textarea id="body" name="body" required maxlength="5000"></textarea>

    <button type="submit">Опубликовать</button>
  </form>
</div>`
  );
}

function renderCategoryPage(slug: string, ads: AdRow[], currentUser: CurrentUser | null = null): Response {
  const category = CATEGORIES.find((item) => item.slug === slug);
  if (!category) {
    return text('Not Found', 404);
  }

  return shell(
    `${category.label} - жоржлист`,
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>${htmlEscape(category.label)}</h2>
  ${renderAdList(ads)}
</div>`
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

    <label for="display_name">Имя</label>
    <input id="display_name" name="display_name" type="text" value="${htmlEscape(displayName)}" />

    <button type="submit">Создать аккаунт</button>
  </form>
  ${telegramAction}
</div>`
  );
}

function renderMyPage(currentUser: CurrentUser, ads: AdRow[]): Response {
  const items = ads.length
    ? ads
        .map((ad) => {
          const category = ad.category ? `${htmlEscape(categoryLabel(ad.category))} · ` : '';
          return `<div class="ad">
  <div class="title">${htmlEscape(ad.title)}</div>
  <div class="meta">${htmlEscape(ad.status)} · ${category}${htmlEscape(ad.created_at)}</div>
  <div class="body">${htmlEscape(ad.body)}</div>
  <div>
    <a href="/my/edit/${ad.id}">Редактировать</a>
    <form method="post" action="/my/delete/${ad.id}" style="display:inline">
      <button class="link-button" type="submit">Удалить</button>
    </form>
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
  <p>Пользователь: ${htmlEscape(currentUser.login)}</p>
  <p><a href="/new">подать объявление</a></p>
  ${items}
</div>`,
    currentUser
  );
}

function renderEditPage(
  currentUser: CurrentUser,
  ad: AdRow,
  error: string | null = null,
  formAction = `/my/edit/${ad.id}`
): Response {
  const options = CATEGORIES.map(
    (category) => `<option value="${category.slug}"${category.slug === ad.category ? ' selected' : ''}>${htmlEscape(category.label)}</option>`
  ).join('');

  return shell(
    'редактировать объявление - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Редактировать объявление</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  <form method="post" action="${htmlEscape(formAction)}">
    <label for="title">Заголовок</label>
    <input id="title" name="title" type="text" required maxlength="200" value="${htmlEscape(ad.title)}" />

    <label for="category">Категория</label>
    <select id="category" name="category">
      ${options}
    </select>

    <label for="body">Текст</label>
    <textarea id="body" name="body" required maxlength="5000">${htmlEscape(ad.body)}</textarea>

    <button type="submit">Сохранить</button>
  </form>
</div>`,
    currentUser
  );
}

function renderAdminPage(currentUser: CurrentUser, ads: AdRow[], message: string | null = null): Response {
  const items = ads.length
    ? ads
        .map((ad) => {
          const owner = ad.owner_user_id ? `owner #${ad.owner_user_id}` : 'no owner';
          const deleted = ad.deleted_at ? ` · deleted ${htmlEscape(ad.deleted_at)}` : '';
          const category = ad.category ? `${htmlEscape(categoryLabel(ad.category))} · ` : '';
          return `<div class="ad">
  <div class="title">#${ad.id} · ${htmlEscape(ad.title)}</div>
  <div class="meta">${htmlEscape(ad.status)} · ${category}${htmlEscape(owner)} · ${htmlEscape(ad.created_at)}${deleted}</div>
  <div class="body">${htmlEscape(ad.body)}</div>
  <div>
    <a href="/admin/edit/${ad.id}">Редактировать</a>
    <form method="post" action="/admin/delete/${ad.id}" style="display:inline">
      <button class="link-button" type="submit">Удалить</button>
    </form>
  </div>
</div>`;
        })
        .join('')
    : '<div class="empty">Пока нет объявлений.</div>';

  return shell(
    'админка - жоржлист',
    `<h1>жоржлист</h1>
${nav(currentUser)}
<div class="section">
  <h2>Админка</h2>
  ${message ? `<p class="empty">${htmlEscape(message)}</p>` : ''}
  <p>Пользователь: ${htmlEscape(currentUser.login)}</p>
  ${items}
</div>`,
    currentUser
  );
}

function renderSettingsPage(
  currentUser: CurrentUser,
  telegramIdentity: UserIdentityRow | null,
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
  const adminPanelBlock = currentUser.role === 'admin'
    ? '<p><a href="/admin">Открыть админку</a></p>'
    : `<p class="empty">Админка доступна только аккаунтам с ролью admin.</p>
<form method="post" action="/settings/admin/promote">
  <button type="submit">Сделать этот аккаунт admin</button>
</form>`;

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
      [{ text: 'Открыть сайт', url: buildPublicSiteUrl(env, '/') }],
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
      SELECT id, title, category, status, created_at
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

async function getOwnedAdForTelegramUser(
  env: Env,
  telegramUserId: string,
  adId: number
): Promise<{ id: number; title: string; category: string | null; status: string; created_at: string; body: string } | null> {
  const identity = await findTelegramIdentity(env, telegramUserId);
  if (!identity) {
    return null;
  }

  const result = await env.DB.prepare(
    `
      SELECT id, title, category, status, created_at, body
      FROM ads
      WHERE id = ?
        AND owner_user_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `
  )
    .bind(adId, identity.user_id)
    .first<{ id: number; title: string; category: string | null; status: string; created_at: string; body: string }>();

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

async function sendUserBotSingleAd(env: Env, chatId: number, ad: { id: number; title: string; category: string | null; status: string; created_at: string; body: string }): Promise<void> {
  const text = [
    `#${ad.id}`,
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    `Статус: ${ad.status}`,
    `Дата: ${ad.created_at}`,
    'Текст:',
    ad.body,
  ].join('\n');

  await sendUserBotMessage(env, chatId, text, userBotSingleAdMarkup(ad.id));
}

function buildTelegramAdText(
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category'>,
  statusLabel: string,
  itemKind: 'New' | 'Edited'
): string {
  return [
    `Type: ${itemKind}`,
    statusLabel,
    `ID: ${ad.id}`,
    `Title: ${ad.title}`,
    `Category: ${categoryLabel(ad.category)}`,
    'Text:',
    ad.body.length > 2800 ? `${ad.body.slice(0, 2799)}…` : ad.body,
  ].join('\n');
}

async function sendTelegramMessage(
  env: Env,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category'>,
  itemKind: 'New' | 'Edited' = 'New'
): Promise<void> {
  const response = await telegramApi(env, 'sendMessage', {
    chat_id: env.TELEGRAM_ADMIN_ID,
    text: buildTelegramAdText(ad, 'Pending', itemKind),
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Publish', callback_data: `publish:${ad.id}` },
          { text: 'Reject', callback_data: `reject:${ad.id}` },
        ],
      ],
    },
  });

  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
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
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category'>,
  statusLabel: string,
  itemKind: 'New' | 'Edited' = 'New'
): Promise<void> {
  const response = await telegramApi(env, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: buildTelegramAdText(ad, statusLabel, itemKind),
  });

  if (!response.ok) {
    throw new Error(`Telegram editMessageText failed with status ${response.status}`);
  }
}

async function getAdById(env: Env, id: number): Promise<AdRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, title, body, category, owner_user_id, status, created_at, updated_at, deleted_at
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

async function listPublishedAds(env: Env): Promise<AdRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT id, title, body, category, owner_user_id, status, created_at, updated_at, deleted_at
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
      SELECT id, title, body, category, owner_user_id, status, created_at, updated_at, deleted_at
      FROM ads
      ORDER BY created_at DESC, id DESC
    `
  ).all<AdRow>();

  return result.results;
}

async function listPublishedAdsByCategory(env: Env, category: string): Promise<AdRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT id, title, body, category, owner_user_id, status, created_at, updated_at, deleted_at
      FROM ads
      WHERE status = 'published'
        AND deleted_at IS NULL
        AND category = ?
      ORDER BY created_at DESC, id DESC
    `
  )
    .bind(category)
    .all<AdRow>();

  return result.results;
}

async function listPendingAds(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    `
      SELECT id, title, body, category, owner_user_id, status, created_at, updated_at, deleted_at
      FROM ads
      WHERE status = 'pending'
        AND deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
    `
  ).all<AdRow>();

  return json({ ads: result.results });
}

async function createAd(
  env: Env,
  ctx: ExecutionContext,
  title: string,
  body: string,
  categoryInput: string | null | undefined,
  ownerUserId: number | null = null
): Promise<{ id: number; category: CategorySlug }> {
  const category = normalizeCategory(categoryInput);
  const result = await env.DB.prepare(
    `
      INSERT INTO ads (title, body, category, status, owner_user_id, deleted_at, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', ?, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `
  )
    .bind(title, body, category, ownerUserId)
    .run();

  ctx.waitUntil(
    sendTelegramMessage(env, {
      id: Number(result.meta.last_row_id),
      title,
      body,
      category,
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
      SELECT id, title, body, category, owner_user_id, status, created_at, updated_at, deleted_at
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
  return {
    title: String(form.get('title') || '').trim(),
    body: String(form.get('body') || '').trim(),
    category: String(form.get('category') || '').trim(),
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

  return redirect('/my');
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

  return renderEditPage(currentUser, ad);
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

  const form = await request.formData();
  const title = String(form.get('title') || '').trim();
  const body = String(form.get('body') || '').trim();
  const category = String(form.get('category') || '').trim();

  if (!title || !body) {
    return renderEditPage(currentUser, ad, 'Заполни заголовок и текст');
  }

  const nextStatus = ad.status === 'published' || ad.status === 'rejected' ? 'pending' : ad.status;
  const normalizedCategory = normalizeCategory(category);
  await env.DB.prepare(
    `
      UPDATE ads
      SET title = ?,
          body = ?,
          category = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND owner_user_id = ?
        AND deleted_at IS NULL
    `
  )
    .bind(title, body, normalizedCategory, nextStatus, numericId, userId)
    .run();

  ctx.waitUntil(
    sendTelegramMessage(env, {
      id: numericId,
      title,
      body,
      category: normalizedCategory,
    }, 'Edited').catch((error: unknown) => {
      console.error('Telegram notification failed after edit', error);
    })
  );

  return redirect('/my');
}

async function updateAdStatus(env: Env, id: string, status: 'published' | 'rejected'): Promise<Response> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return json({ error: 'Invalid id' }, { status: 400 });
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

  return json({ ok: true, id: numericId, status });
}

async function handleTelegramWebhook(request: Request, env: Env): Promise<Response> {
  let update: TelegramUpdate;

  try {
    update = await request.json();
  } catch {
    return text('Bad Request', 400);
  }

  const callbackQuery = update.callback_query;
  if (!callbackQuery?.data || !callbackQuery.message) {
    return json({ ok: true });
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

  if (!draft || (draft.action !== 'create' && draft.action !== 'edit' && draft.action !== 'register')) {
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

  if (data === USER_BOT_MENU_MY) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotMyAds(env, telegramUserId, chatId);
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
  if (!message?.text || !message.from) {
    return json({ ok: true });
  }

  const telegramUserId = String(message.from.id);
  const chatId = message.chat.id;
  const telegramUsername = message.from.username || null;

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
      SELECT id, title, body, category, owner_user_id, status, created_at, updated_at, deleted_at
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
        SELECT users.id, users.login, users.display_name, users.role, users.created_at, users.updated_at
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

  return renderMyPage(currentUser, await listMyAds(env, currentUser.id));
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

  const message = new URL(request.url).searchParams.get('message');
  return renderAdminPage(currentUser, await listAllAds(env), message);
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
    return text('Not Found', 404);
  }

  return redirectWithMessage('/admin', 'Объявление удалено');
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

  const ad = await getAdById(env, numericId);
  if (!ad) {
    return text('Not Found', 404);
  }

  if (request.method === 'GET') {
    return renderEditPage(currentUser, ad, null, `/admin/edit/${ad.id}`);
  }

  if (request.method !== 'POST') {
    return text('Method Not Allowed', 405);
  }

  const form = await request.formData();
  const title = String(form.get('title') || '').trim();
  const body = String(form.get('body') || '').trim();
  const category = String(form.get('category') || '').trim();

  if (!title || !body) {
    return renderEditPage(currentUser, ad, 'Заполни заголовок и текст', `/admin/edit/${ad.id}`);
  }

  const normalizedCategory = normalizeCategory(category);
  await env.DB.prepare(
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
    .bind(title, body, normalizedCategory, numericId)
    .run();

  return redirectWithMessage('/admin', 'Объявление сохранено');
}

async function handleSettingsGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  const telegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
  const message = new URL(request.url).searchParams.get('message');
  let pendingTelegramAuth: TelegramAuthPayload | null = null;
  try {
    pendingTelegramAuth = await readPendingTelegramAuthValue(env, request);
  } catch {
    pendingTelegramAuth = null;
  }

  return renderSettingsPage(currentUser, telegramIdentity, message, pendingTelegramAuth);
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

  if (!isValidLogin(login)) {
    return renderSettingsPage(currentUser, telegramIdentity, 'Login должен быть 3-32 символа: латиница, цифры, _');
  }

  if (!isValidEmail(email)) {
    return renderSettingsPage(currentUser, telegramIdentity, 'Введите корректный email');
  }

  const existingLoginUser = await findUserByLogin(env, login);
  if (existingLoginUser && existingLoginUser.id !== currentUser.id) {
    return renderSettingsPage(currentUser, telegramIdentity, 'Этот login уже занят');
  }

  const existingEmailIdentity = await findEmailIdentity(env, email);
  if (existingEmailIdentity && existingEmailIdentity.user_id !== currentUser.id) {
    return renderSettingsPage(currentUser, telegramIdentity, 'Этот email уже зарегистрирован');
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
  const refreshedUser = (await getCurrentUser(request, env)) || {
    ...currentUser,
    login,
    email,
  };

  return renderSettingsPage(refreshedUser, updatedTelegramIdentity, 'Настройки сохранены');
}

async function handleSettingsAdminPromotePost(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/settings');
  }

  await env.DB.prepare(
    `
      UPDATE users
      SET role = 'admin',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(currentUser.id)
    .run();

  const refreshedUser = (await getCurrentUser(request, env)) || { ...currentUser, role: 'admin' };
  const telegramIdentity = await findTelegramIdentityByUserId(env, currentUser.id);
  return renderSettingsPage(refreshedUser, telegramIdentity, 'Роль admin включена');
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

  const form = await request.formData();
  const title = String(form.get('title') || '').trim();
  const body = String(form.get('body') || '').trim();
  const category = String(form.get('category') || '').trim();

  if (!title || !body) {
    return renderNewPage(currentUser, 'Заполни заголовок и текст');
  }

  await createAd(env, ctx, title, body, category, currentUser.id);
  return redirect('/');
}

async function handleCategoryGet(env: Env, slug: string, currentUser: CurrentUser | null = null): Promise<Response> {
  const category = CATEGORIES.find((item) => item.slug === slug);
  if (!category) {
    return text('Not Found', 404);
  }

  return renderCategoryPage(slug, await listPublishedAdsByCategory(env, slug), currentUser);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

    if (path === '/settings/admin/promote') {
      if (request.method === 'POST') return handleSettingsAdminPromotePost(request, env);
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

    return text('Not Found', 404);
  },
} satisfies ExportedHandler<Env>;
