import { decode as decodePng } from 'fast-png';
import * as jpeg from 'jpeg-js';

const CATEGORIES = [
  { slug: 'auto', label: 'Авто' },
  { slug: 'electronics', label: 'Электроника' },
  { slug: 'clothes', label: 'Одежда' },
  { slug: 'furniture', label: 'Мебель' },
  { slug: 'housing', label: 'Жильё' },
  { slug: 'rent', label: 'Аренда' },
  { slug: 'jobs', label: 'Работа' },
  { slug: 'services', label: 'Услуги' },
  { slug: 'education', label: 'Обучение' },
  { slug: 'pets', label: 'Животные' },
  { slug: 'hobby', label: 'Хобби' },
  { slug: 'creative', label: 'Творчество' },
  { slug: 'things', label: 'Вещи' },
  { slug: 'misc', label: 'Разное' },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];

const AD_TYPES = [
  { slug: 'sell', label: 'Продаю' },
  { slug: 'buy', label: 'Куплю' },
  { slug: 'free', label: 'Отдаю' },
] as const;

type AdTypeSlug = (typeof AD_TYPES)[number]['slug'];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category.label])
) as Record<CategorySlug, string>;

const AD_TYPE_LABELS = Object.fromEntries(AD_TYPES.map((type) => [type.slug, type.label])) as Record<AdTypeSlug, string>;

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
  contact: string | null;
  category: string | null;
  type: string | null;
  owner_user_id: number | null;
  owner_login: string | null;
  owner_avatar_key: string | null;
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
  contact: string | null;
  category: string | null;
  type: string | null;
  owner_user_id: number | null;
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
  type: string | null;
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
  contact: string;
  category: string;
  type: string;
  image: File | null;
};

type AdImageUpload = {
  key: string;
  mimeType: string;
};

type CompressedAdImageUpload = {
  key: string;
  mimeType: string;
  bytes: ArrayBuffer;
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
  ui_chat_id: number | null;
  ui_message_id: number | null;
  ad_id: number | null;
  login: string | null;
  email: string | null;
  category: string | null;
  ad_type: string | null;
  reply_user_id: number | null;
  reply_ad_id: number | null;
  password_current: string | null;
  password_new: string | null;
  title: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
};

type ChatThreadRow = {
  id: number;
  ad_id: number;
  user_low_id: number;
  user_high_id: number;
  last_message_sender_user_id: number | null;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

type ChatThreadListRow = {
  id: number;
  ad_id: number;
  ad_title: string;
  other_user_id: number;
  other_login: string;
  other_avatar_key: string | null;
  last_message_sender_user_id: number | null;
  last_message_text: string | null;
  last_message_at: string | null;
};

type ChatMessageRow = {
  id: number;
  conversation_id: number;
  sender_user_id: number;
  body: string;
  created_at: string;
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
const USER_BOT_MENU_HOME = 'user:home';
const USER_BOT_CANCEL_FLOW = 'user:cancel';
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
const USER_BOT_CHAT_PREFIX = 'user:chat:';
const USER_BOT_CHAT_REPLY_PREFIX = 'user:chatreply:';
const USER_BOT_CHAT_START_PREFIX = 'user:chatstart:';
const USER_BOT_CHAT_LIST = 'user:chats';
const USER_BOT_DRAFT_PREFIX = 'draft:';
const USER_BOT_DRAFT_TYPE_PREFIX = 'draft:type:';
const USER_BOT_DRAFT_CANCEL = 'draft:confirm:cancel';
const USER_BOT_DRAFT_SEND = 'draft:confirm:send';
const USER_BOT_EDIT_DRAFT_CANCEL = 'draft:edit:cancel';
const USER_BOT_EDIT_DRAFT_SAVE = 'draft:edit:save';
const ADMIN_BOT_MENU_HOME = 'admin:home';
const AD_SELECT_COLUMNS = `
  id,
  title,
  body,
  contact,
  category,
  type,
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
const AD_IMAGE_MAX_DIMENSION = 1600;
const AD_IMAGE_JPEG_QUALITY = 82;
let cachedTelegramUserBotUsername: string | null = null;
let cachedTelegramUserBotUsernamePromise: Promise<string | null> | null = null;
let cachedEnsureAdImageColumnsPromise: Promise<void> | null = null;
let cachedEnsureUserAvatarColumnsPromise: Promise<void> | null = null;
let cachedEnsureAdContactColumnPromise: Promise<void> | null = null;
let cachedEnsureAdTypeColumnPromise: Promise<void> | null = null;
let cachedEnsureBotDraftColumnsPromise: Promise<void> | null = null;
let cachedEnsureChatTablesPromise: Promise<void> | null = null;
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

function typeLabel(slug: string | null): string {
  if (!slug) {
    return 'Продаю';
  }

  return AD_TYPE_LABELS[slug as AdTypeSlug] || 'Продаю';
}

function normalizeAdType(slug: string | null | undefined): AdTypeSlug {
  const value = (slug || '').trim() as AdTypeSlug;
  return AD_TYPES.some((type) => type.slug === value) ? value : 'sell';
}

function buildCategoryRows(
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

function buildTypeRows(callbackPrefix: string): Array<Array<{ text: string; callback_data: string }>> {
  return AD_TYPES.map((type) => [
    {
      text: type.label,
      callback_data: `${callbackPrefix}${type.slug}`,
    },
  ]);
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

function resizeRgba(source: Uint8Array, sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): Uint8Array {
  if (sourceWidth === targetWidth && sourceHeight === targetHeight) {
    return source;
  }

  const output = new Uint8Array(targetWidth * targetHeight * 4);
  const xScale = sourceWidth / targetWidth;
  const yScale = sourceHeight / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    const sampleY = (y + 0.5) * yScale - 0.5;
    const clampedY = Math.max(0, Math.min(sourceHeight - 1, sampleY));
    const y0 = Math.floor(clampedY);
    const y1 = Math.min(sourceHeight - 1, y0 + 1);
    const yLerp = clampedY - y0;
    const row0 = y0 * sourceWidth * 4;
    const row1 = y1 * sourceWidth * 4;

    for (let x = 0; x < targetWidth; x += 1) {
      const sampleX = (x + 0.5) * xScale - 0.5;
      const clampedX = Math.max(0, Math.min(sourceWidth - 1, sampleX));
      const x0 = Math.floor(clampedX);
      const x1 = Math.min(sourceWidth - 1, x0 + 1);
      const xLerp = clampedX - x0;

      const base00 = row0 + x0 * 4;
      const base10 = row0 + x1 * 4;
      const base01 = row1 + x0 * 4;
      const base11 = row1 + x1 * 4;
      const outBase = (y * targetWidth + x) * 4;

      for (let channel = 0; channel < 4; channel += 1) {
        const top = source[base00 + channel] * (1 - xLerp) + source[base10 + channel] * xLerp;
        const bottom = source[base01 + channel] * (1 - xLerp) + source[base11 + channel] * xLerp;
        output[outBase + channel] = Math.round(top * (1 - yLerp) + bottom * yLerp);
      }
    }
  }

  return output;
}

function flattenRgbaToWhite(source: Uint8Array): Uint8Array {
  const output = new Uint8Array(source);

  for (let index = 0; index < output.length; index += 4) {
    const alpha = output[index + 3] / 255;
    const inverseAlpha = 1 - alpha;
    output[index] = Math.round(output[index] * alpha + 255 * inverseAlpha);
    output[index + 1] = Math.round(output[index + 1] * alpha + 255 * inverseAlpha);
    output[index + 2] = Math.round(output[index + 2] * alpha + 255 * inverseAlpha);
    output[index + 3] = 255;
  }

  return output;
}

async function compressAdImage(file: File): Promise<CompressedAdImageUpload> {
  const sourceBytes = await file.arrayBuffer();

  try {
    let width = 0;
    let height = 0;
    let rgbaPixels: Uint8Array | null = null;

    if (file.type === 'image/png') {
      const decoded = decodePng(new Uint8Array(sourceBytes));
      width = decoded.width;
      height = decoded.height;
      rgbaPixels = new Uint8Array(decoded.data);
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      const decoded = jpeg.decode(new Uint8Array(sourceBytes), { useTArray: true });
      width = decoded.width;
      height = decoded.height;
      rgbaPixels = new Uint8Array(decoded.data);
    } else {
      throw new Error('Unsupported image type for compression');
    }

    const scale = Math.min(1, AD_IMAGE_MAX_DIMENSION / Math.max(width, height));
    const resizedWidth = Math.max(1, Math.round(width * scale));
    const resizedHeight = Math.max(1, Math.round(height * scale));
    const resizedPixels = resizeRgba(rgbaPixels, width, height, resizedWidth, resizedHeight);
    const flattenedPixels = flattenRgbaToWhite(resizedPixels);
    const encoded = jpeg.encode(
      {
        data: flattenedPixels,
        width: resizedWidth,
        height: resizedHeight,
      },
      AD_IMAGE_JPEG_QUALITY
    );
    const outputBytes = encoded.data.buffer.slice(
      encoded.data.byteOffset,
      encoded.data.byteOffset + encoded.data.byteLength
    ) as ArrayBuffer;
    return {
      key: `ads/${crypto.randomUUID()}.jpg`,
      mimeType: 'image/jpeg',
      bytes: outputBytes,
    };
  } catch {
    return {
      key: `ads/${crypto.randomUUID()}.${getImageExtension(file.type)}`,
      mimeType: file.type,
      bytes: sourceBytes,
    };
  }
}

async function readImageUpload(file: File | null): Promise<CompressedAdImageUpload | null> {
  if (!file || file.size <= 0) {
    return null;
  }

  if (file.size > AD_IMAGE_MAX_BYTES) {
    throw new Error('Image is too large');
  }

  if (!isImageMimeType(file.type)) {
    throw new Error('Invalid image type');
  }

  return compressAdImage(file);
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

async function putCompressedAdImage(env: Env, upload: CompressedAdImageUpload): Promise<void> {
  await putMediaObject(env, upload.key, upload.bytes, upload.mimeType);
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
    .admin-user-title {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .admin-user-title a {
      color: inherit;
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
    .ad-owner {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .settings-account,
    .settings-password {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-width: 640px;
    }
    .settings-account button,
    .settings-password button {
      align-self: flex-start;
      margin-top: 8px;
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
    .ad-page-contact {
      margin-bottom: 12px;
      padding: 10px 12px;
      background: #f0f4ff;
      border-radius: 4px;
      font-size: 14px;
    }
    .ad-page-footer {
      color: #999;
      font-size: 12px;
    }
    .ad-message-section form {
      display: grid;
      gap: 8px;
    }
    .ad-message-section textarea {
      max-width: 720px;
      min-height: 140px;
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
      const type = renderTypeBadge(ad.type);
      const author = ad.author_login
        ? `<div class="ad-author">${renderAvatar(env, ad.author_avatar_key, ad.author_login, 'avatar-mini')}<a href="/u/${encodeURIComponent(ad.author_login)}">${htmlEscape(ad.author_login)}</a></div>`
        : '';
      return `<div class="ad">
  ${renderAdImage(env, ad.image_key, ad.title, 'ad-image')}
  <div class="ad-content">
    <div class="title">${type}<a href="/ad/${ad.id}">${htmlEscape(ad.title)}</a></div>
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

function renderTypeFilter(
  currentType: string | null,
  categoryPath: string | null = null
): string {
  const paramsFor = (type: string | null): string => {
    const params = new URLSearchParams();
    if (type) {
      params.set('type', type);
    }
    const query = params.toString();
    if (categoryPath) {
      return `${categoryPath}${query ? `?${query}` : ''}`;
    }
    return query ? `/?${query}` : '/';
  };

  const allLink = currentType ? `<a href="${htmlEscape(paramsFor(null))}">Все</a>` : '<strong>Все</strong>';
  const sellLink = currentType === 'sell' ? '<strong>Продаю</strong>' : `<a href="${htmlEscape(paramsFor('sell'))}">Продаю</a>`;
  const buyLink = currentType === 'buy' ? '<strong>Куплю</strong>' : `<a href="${htmlEscape(paramsFor('buy'))}">Куплю</a>`;
  const freeLink = currentType === 'free' ? '<strong>Отдаю</strong>' : `<a href="${htmlEscape(paramsFor('free'))}">Отдаю</a>`;

  return `<div class="type-filter">${allLink}<span>·</span>${sellLink}<span>·</span>${buyLink}<span>·</span>${freeLink}</div>`;
}

function renderTypeSelect(selected = 'sell'): string {
  return `<select id="type" name="type">
    ${AD_TYPES.map((type) => `<option value="${type.slug}"${type.slug === selected ? ' selected' : ''}>${htmlEscape(type.label)}</option>`).join('')}
  </select>`;
}

function renderTypeBadge(type: string | null): string {
  return `<span class="badge">${htmlEscape(typeLabel(type))}</span>`;
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

    <label for="type">Тип объявления</label>
    ${renderTypeSelect('sell')}

    <label for="image">Картинка</label>
    <input id="image" name="image" type="file" accept="image/*" />

    <label for="body">Текст</label>
    <textarea id="body" name="body" required maxlength="5000"></textarea>

    <label for="contact">Как связаться</label>
    <input id="contact" name="contact" type="text" maxlength="300" placeholder="Телефон, Telegram, email..." />

    <button type="submit">Опубликовать</button>
  </form>
</div>`
  );
}

function renderCategoryPage(
  env: Env,
  slug: string,
  ads: AdCardRow[],
  currentUser: CurrentUser | null = null,
  typeFilter: string | null = null
): Response {
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
  ${renderTypeFilter(typeFilter, `/category/${encodeURIComponent(category.slug)}`)}
  ${renderAdList(env, ads)}
</div>
${renderSearchForm()}`
  );
}

function renderAdMessageSection(
  ad: PublicAdCardRow,
  currentUser: CurrentUser | null,
  canMessageAuthor: boolean,
  message: string | null = null
): string {
  const title = '<h2>Написать автору</h2>';

  if (!ad.owner_user_id) {
    return `<div class="section ad-message-section">
  ${title}
  <p class="empty">У объявления не указан автор.</p>
</div>`;
  }

  if (currentUser && currentUser.id === ad.owner_user_id) {
    return `<div class="section ad-message-section">
  ${title}
  <p class="empty">Это ваше объявление.</p>
</div>`;
  }

  if (!canMessageAuthor) {
    return `<div class="section ad-message-section">
  ${title}
  <p class="empty">У автора не привязан Telegram.</p>
</div>`;
  }

  if (!currentUser) {
    return `<div class="section ad-message-section">
  ${title}
  <p class="empty">Чтобы написать автору, войди в аккаунт.</p>
</div>`;
  }

  return `<div class="section ad-message-section">
  ${title}
  ${message ? `<p class="empty">${htmlEscape(message)}</p>` : ''}
  <form method="post" action="/ad/${ad.id}/message">
    <textarea name="message" required maxlength="1000" rows="6" placeholder="Напишите сообщение автору"></textarea>
    <button type="submit">Отправить</button>
  </form>
</div>`;
}

function renderPublicAdPage(
  env: Env,
  ad: PublicAdCardRow,
  currentUser: CurrentUser | null = null,
  canMessageAuthor = false,
  message: string | null = null
): Response {
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
      <h2 class="ad-page-title">${renderTypeBadge(ad.type)}${htmlEscape(ad.title)}</h2>
      ${author}
      <div class="ad-page-badges"><span class="badge">${htmlEscape(categoryLabel(ad.category))}</span></div>
      <div class="ad-page-body">${htmlEscape(ad.body)}</div>
      ${ad.contact ? `<div class="ad-page-contact"><strong>Контакты:</strong> ${htmlEscape(ad.contact)}</div>` : ''}
      <div class="ad-page-footer">${htmlEscape(ad.created_at)}</div>
    </div>
  </div>
</div>
${renderAdMessageSection(ad, currentUser, canMessageAuthor, message)}
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
          const type = renderTypeBadge(ad.type);
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
    <div class="title">${type}<a href="/ad/${ad.id}">${htmlEscape(ad.title)}</a></div>
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
          const type = renderTypeBadge(ad.type);
          return `<div class="ad">
  ${renderAdImage(env, ad.image_key, ad.title, 'ad-image')}
  <div class="ad-content">
    <div class="title">${type}<a href="/ad/${ad.id}">${htmlEscape(ad.title)}</a></div>
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

    <label for="type">Тип объявления</label>
    ${renderTypeSelect(normalizeAdType(ad.type).toString())}

    <label>Текущая картинка</label>
    ${currentImagePreview}

    <label for="image">Заменить картинку</label>
    <input id="image" name="image" type="file" accept="image/*" />

    <label for="body">Текст</label>
    <textarea id="body" name="body" required maxlength="5000">${htmlEscape(ad.body)}</textarea>

    <label for="contact">Как связаться</label>
    <input id="contact" name="contact" type="text" maxlength="300" placeholder="Телефон, Telegram, email..." value="${htmlEscape(ad.contact || '')}" />

    <button type="submit">Сохранить</button>
  </form>
</div>`,
    currentUser
  );
}

type AdminUserRow = {
  id: number;
  login: string;
  avatar_key: string | null;
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
             users.avatar_key,
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
      SELECT ads.id,
             ads.title,
             ads.body,
             ads.contact,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.owner_user_id,
             ads.status,
             ads.image_key,
             ads.image_mime_type,
             ads.image_updated_at,
             ads.created_at,
             ads.updated_at,
             ads.deleted_at,
             users.login AS owner_login,
             users.avatar_key AS owner_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE deleted_at IS NULL
      ORDER BY ads.created_at DESC, ads.id DESC
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
  env: Env,
  currentUser: CurrentUser,
  users: AdminUserRow[],
  pagination: AdminPagination,
  message: string | null = null
): Response {
  const items = users.length
    ? users
      .map((user) => {
        const email = user.email ? ` · ${htmlEscape(user.email)}` : '';
        const profileUrl = `/u/${encodeURIComponent(user.login)}`;
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
  <div class="title admin-user-title">${renderAvatar(env, user.avatar_key, user.login, 'avatar-mini')}<a href="${htmlEscape(profileUrl)}">${htmlEscape(user.login)}</a>${email}</div>
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
          const owner = ad.owner_user_id
            ? ad.owner_login
              ? `<div class="ad-owner">${renderAvatar(env, ad.owner_avatar_key, ad.owner_login, 'avatar-mini')}<a href="/u/${encodeURIComponent(ad.owner_login)}">${htmlEscape(ad.owner_login)}</a></div>`
              : `<div class="meta">owner #${ad.owner_user_id}</div>`
            : '<div class="meta">no owner</div>';
          const category = ad.category ? `${htmlEscape(categoryLabel(ad.category))} · ` : '';
          const moderationActions = ad.status === 'pending'
            ? `<form method="post" action="${htmlEscape(buildAdminActionUrl(`/admin/publish/${ad.id}`, 'ads', pagination.page))}" style="display:inline">
        <button class="link-button" type="submit">Publish</button>
      </form>
      <form method="post" action="${htmlEscape(buildAdminActionUrl(`/admin/reject/${ad.id}`, 'ads', pagination.page))}" style="display:inline">
        <button class="link-button" type="submit">Reject</button>
      </form>`
            : '';
          return `<div class="ad">
  ${renderAdImage(env, ad.image_key, ad.title, 'ad-image')}
  <div class="ad-content">
    <div class="title"><a href="/ad/${ad.id}">#${ad.id} · ${htmlEscape(ad.title)}</a></div>
    <div class="meta">${htmlEscape(ad.status)} · ${category}${htmlEscape(ad.created_at)}</div>
    ${owner}
    <div class="ad-actions">
      <a href="${htmlEscape(buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', pagination.page))}">Редактировать</a>
      <form method="post" action="${htmlEscape(buildAdminActionUrl(`/admin/delete/${ad.id}`, 'ads', pagination.page))}" style="display:inline">
        <button class="link-button" type="submit" onclick="return confirm('Удалить объявление?')">Удалить</button>
      </form>
      ${moderationActions}
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
             users.avatar_key,
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
    <form class="settings-password" method="post" action="/settings/password">
      ${
        emailIdentity.password_hash
          ? `<label for="current_password">Текущий пароль</label>
      <input id="current_password" name="current_password" type="password" autocomplete="current-password" />`
          : `<p class="empty">Текущий пароль не нужен: пароль ещё не задан.</p>`
      }

      <label for="new_password">Новый пароль</label>
      <input id="new_password" name="new_password" type="password" minlength="8" autocomplete="new-password" />

      <label for="confirm_password">Подтверждение нового пароля</label>
      <input id="confirm_password" name="confirm_password" type="password" minlength="8" autocomplete="new-password" />

      <button type="submit">${htmlEscape(emailIdentity.password_hash ? 'Сменить пароль' : 'Задать пароль')}</button>
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
  <form class="settings-account" method="post" action="/settings">
    <label for="login">Login</label>
    <input id="login" name="login" type="text" required value="${htmlEscape(currentUser.login)}" />

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required value="${htmlEscape(emailValue)}" />

    <button type="submit">Сохранить настройки</button>
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

async function sendUserBotMessageWithId(
  env: Env,
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<number | null> {
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

  const body = (await response.json().catch(() => null)) as { ok?: boolean; result?: { message_id?: number } } | null;
  return typeof body?.result?.message_id === 'number' ? body.result.message_id : null;
}

async function editUserBotMessage(
  env: Env,
  chatId: number,
  messageId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'editMessageText', payload);
  if (!response.ok) {
    throw new Error(`Telegram editMessageText failed with status ${response.status}`);
  }
}

async function sendUserBotPhotoMessageWithId(
  env: Env,
  chatId: number,
  photo: string,
  caption: string,
  replyMarkup?: Record<string, unknown>
): Promise<number | null> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    photo,
    caption,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'sendPhoto', payload);
  if (!response.ok) {
    throw new Error(`Telegram sendPhoto failed with status ${response.status}`);
  }

  const body = (await response.json().catch(() => null)) as { ok?: boolean; result?: { message_id?: number } } | null;
  return typeof body?.result?.message_id === 'number' ? body.result.message_id : null;
}

async function editUserBotMediaMessage(
  env: Env,
  chatId: number,
  messageId: number,
  photo: string,
  caption: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    media: {
      type: 'photo',
      media: photo,
      caption,
    },
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'editMessageMedia', payload);
  if (!response.ok) {
    throw new Error(`Telegram editMessageMedia failed with status ${response.status}`);
  }
}

type UserBotScreenRef = {
  chatId: number;
  messageId: number;
};

function readBotDraftUiRef(draft: BotDraftRow | null): UserBotScreenRef | null {
  if (!draft || draft.ui_chat_id === null || draft.ui_message_id === null) {
    return null;
  }

  return {
    chatId: draft.ui_chat_id,
    messageId: draft.ui_message_id,
  };
}

async function rememberUserBotScreen(env: Env, telegramUserId: string, chatId: number, messageId: number): Promise<void> {
  const existing = await getBotDraft(env, telegramUserId);
  if (!existing) {
    await env.DB.prepare(
      `
        INSERT INTO bot_drafts (
          telegram_user_id,
          action,
          step,
          ui_chat_id,
          ui_message_id,
          created_at,
          updated_at
        )
        VALUES (?, 'idle', 'menu', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
      .bind(telegramUserId, chatId, messageId)
      .run();
    return;
  }

  await env.DB.prepare(
    `
      UPDATE bot_drafts
      SET ui_chat_id = ?,
          ui_message_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE telegram_user_id = ?
    `
  )
    .bind(chatId, messageId, telegramUserId)
    .run();
}

async function showUserBotScreen(
  env: Env,
  telegramUserId: string,
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const draft = await getBotDraft(env, telegramUserId);
  const uiRef = readBotDraftUiRef(draft);

  if (uiRef && uiRef.chatId === chatId) {
    try {
      await editUserBotMessage(env, chatId, uiRef.messageId, text, replyMarkup);
      return;
    } catch (error) {
      console.error('Failed to edit user bot screen', error);
    }
  }

  const messageId = await sendUserBotMessageWithId(env, chatId, text, replyMarkup);
  if (messageId !== null) {
    await rememberUserBotScreen(env, telegramUserId, chatId, messageId);
  }
}

async function showUserBotPhotoScreen(
  env: Env,
  telegramUserId: string,
  chatId: number,
  photo: string,
  caption: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const draft = await getBotDraft(env, telegramUserId);
  const uiRef = readBotDraftUiRef(draft);

  if (uiRef && uiRef.chatId === chatId) {
    try {
      await editUserBotMediaMessage(env, chatId, uiRef.messageId, photo, caption, replyMarkup);
      return;
    } catch (error) {
      console.error('Failed to edit user bot photo screen', error);
    }
  }

  const messageId = await sendUserBotPhotoMessageWithId(env, chatId, photo, caption, replyMarkup);
  if (messageId !== null) {
    await rememberUserBotScreen(env, telegramUserId, chatId, messageId);
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
      [{ text: 'Диалоги', callback_data: USER_BOT_CHAT_LIST }],
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
      ...buildCategoryRows(USER_BOT_SECTION_PREFIX),
      [{ text: 'Назад', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

function userBotSectionAdsMarkup(category: string, ads: Array<{ id: number; title: string }>): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_SECTION_AD_PREFIX}${category}:${ad.id}` },
      ]),
      [{ text: 'Назад', callback_data: USER_BOT_MENU_SECTIONS }],
    ],
  };
}

function userBotSectionAdMarkup(category: string): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Назад', callback_data: `${USER_BOT_SECTION_PREFIX}${category}` }],
      [{ text: 'В меню', callback_data: USER_BOT_MENU_HOME }],
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
      [{ text: 'Назад', callback_data: USER_BOT_MENU_SEARCH }],
    ],
  };
}

function userBotSearchAdMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Назад', callback_data: USER_BOT_SEARCH_RESULTS }],
      [{ text: 'В меню', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

function userBotMyAdsMarkup(ads: Array<{ id: number; title: string }>): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_MENU_MY_AD}${ad.id}` },
      ]),
      [{ text: 'Назад', callback_data: USER_BOT_MENU_HOME }],
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

function userBotChatsMarkup(threads: ChatThreadListRow[]): Record<string, unknown> {
  const rows = threads.map((thread) => {
    const title = `${thread.other_login} · ${thread.ad_title}`.slice(0, 60);
    return [
      {
        text: title || `#${thread.id}`,
        callback_data: `${USER_BOT_CHAT_PREFIX}${thread.id}`,
      },
    ];
  });

  rows.push([{ text: 'Назад', callback_data: USER_BOT_MENU_HOME }]);
  return { inline_keyboard: rows };
}

function userBotChatMarkup(conversationId: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Ответить', callback_data: `${USER_BOT_CHAT_REPLY_PREFIX}${conversationId}` }],
      [{ text: 'Диалоги', callback_data: USER_BOT_CHAT_LIST }],
      [{ text: 'В меню', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

function userBotIncomingChatMarkup(conversationId: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Открыть чат', callback_data: `${USER_BOT_CHAT_PREFIX}${conversationId}` }],
      [{ text: 'Диалоги', callback_data: USER_BOT_CHAT_LIST }],
    ],
  };
}

function userBotChatPromptMarkup(conversationId: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Отмена', callback_data: `${USER_BOT_CHAT_PREFIX}${conversationId}` }],
      [{ text: 'Диалоги', callback_data: USER_BOT_CHAT_LIST }],
    ],
  };
}

function userBotSettingsMarkup(hasPassword: boolean): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Изменить логин', callback_data: `${USER_BOT_SETTINGS_PREFIX}login` }],
      [{ text: 'Изменить email', callback_data: `${USER_BOT_SETTINGS_PREFIX}email` }],
      [{ text: hasPassword ? 'Сменить пароль' : 'Задать пароль', callback_data: `${USER_BOT_SETTINGS_PREFIX}password` }],
      [{ text: 'Изменить аватар', callback_data: `${USER_BOT_SETTINGS_PREFIX}avatar` }],
      [{ text: 'Удалить аватар', callback_data: `${USER_BOT_SETTINGS_PREFIX}avatar-delete` }],
      [{ text: 'Назад', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

function userBotCategoryMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [...buildCategoryRows(`${USER_BOT_DRAFT_PREFIX}category:`), [{ text: 'Отмена', callback_data: USER_BOT_CANCEL_FLOW }]],
  };
}

function userBotTypeMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [...buildTypeRows(USER_BOT_DRAFT_TYPE_PREFIX), [{ text: 'Отмена', callback_data: USER_BOT_CANCEL_FLOW }]],
  };
}

function userBotCancelHomeMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [[{ text: 'Отмена', callback_data: USER_BOT_CANCEL_FLOW }]],
  };
}

function userBotCancelSettingsMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [[{ text: 'Отмена', callback_data: `${USER_BOT_SETTINGS_PREFIX}cancel` }]],
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

async function sendUserBotMenu(
  env: Env,
  telegramUserId: string,
  chatId: number,
  greeting: string,
  login: string | null = null
): Promise<void> {
  const lines = [greeting];
  if (login) {
    lines.push(`Login: ${login}`);
  }
  lines.push(`Сайт: ${buildPublicSiteUrl(env, '/')}`);
  lines.push('');
  lines.push('Что делаем?');
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotMenuMarkup(env));
}

async function sendUserBotSections(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Объявления', userBotSectionsMarkup());
}

async function sendUserBotSettings(
  env: Env,
  telegramUserId: string,
  chatId: number,
  message: string | null = null
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const user = await findUserById(env, telegramIdentity.user_id);
  if (!user) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const emailIdentity = await findEmailIdentityByUserId(env, user.id);
  const hasPassword = Boolean(emailIdentity?.password_hash);
  const telegramLine = telegramIdentity.telegram_username
    ? `@${telegramIdentity.telegram_username}`
    : telegramIdentity.provider_user_id || 'привязан';
  const lines = [
    ...(message ? [message, ''] : []),
    'Настройки',
    `Login: ${user.login}`,
    `Email: ${emailIdentity?.email || user.email || 'не задан'}`,
    `Пароль: ${hasPassword ? 'задан' : 'не задан'}`,
    `Telegram: ${telegramLine}`,
    `Аватар: ${user.avatar_key ? 'есть' : 'нет'}`,
  ];

  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotSettingsMarkup(hasPassword));
}

async function sendUserBotSettingsLoginPrompt(env: Env, telegramUserId: string, chatId: number, message: string | null = null): Promise<void> {
  const lines = [...(message ? [message, ''] : []), 'Введи новый login'];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelSettingsMarkup());
}

async function sendUserBotSettingsEmailPrompt(env: Env, telegramUserId: string, chatId: number, message: string | null = null): Promise<void> {
  const lines = [...(message ? [message, ''] : []), 'Введи новый email'];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelSettingsMarkup());
}

async function sendUserBotSettingsAvatarPrompt(env: Env, telegramUserId: string, chatId: number, message: string | null = null): Promise<void> {
  const lines = [...(message ? [message, ''] : []), 'Пришли изображение для аватара'];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelSettingsMarkup());
}

async function sendUserBotSettingsPasswordPrompt(
  env: Env,
  telegramUserId: string,
  chatId: number,
  hasPassword: boolean,
  step: 'current' | 'new' | 'confirm',
  message: string | null = null
): Promise<void> {
  const stepLabel =
    step === 'current'
      ? 'Введи текущий пароль'
      : step === 'new'
        ? 'Введи новый пароль'
        : 'Повтори новый пароль';
  const statusLine = hasPassword ? 'Пароль уже задан.' : 'Пароль ещё не задан.';
  const lines = [...(message ? [message, ''] : []), 'Смена пароля', statusLine, stepLabel];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelSettingsMarkup());
}

function buildChatScreenTitle(otherLogin: string, adTitle: string): string {
  return [`Диалог с ${otherLogin}`, `По объявлению: ${adTitle}`].join('\n');
}

async function sendUserBotChats(
  env: Env,
  telegramUserId: string,
  chatId: number,
  message: string | null = null
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const threads = await listConversationsForUser(env, telegramIdentity.user_id);
  if (!threads.length) {
    const lines = [...(message ? [message, ''] : []), 'Диалоги', 'Пока нет диалогов'];
    await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotMenuMarkup(env));
    return;
  }

  const lines = [...(message ? [message, ''] : []), 'Диалоги', 'Выбери чат'];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotChatsMarkup(threads));
}

async function sendUserBotChatView(
  env: Env,
  telegramUserId: string,
  chatId: number,
  conversationId: number,
  message: string | null = null
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const conversation = await getConversationById(env, conversationId);
  if (!conversation || (conversation.user_low_id !== telegramIdentity.user_id && conversation.user_high_id !== telegramIdentity.user_id)) {
    await sendUserBotChats(env, telegramUserId, chatId, 'Диалог не найден');
    return;
  }

  const ad = await getPublishedAdCardById(env, conversation.ad_id);
  if (!ad) {
    await sendUserBotChats(env, telegramUserId, chatId, 'Объявление не найдено');
    return;
  }

  const otherUserId = conversation.user_low_id === telegramIdentity.user_id ? conversation.user_high_id : conversation.user_low_id;
  const otherUser = await findUserById(env, otherUserId);
  const messages = await listConversationMessages(env, conversation.id, 8, 0);
  const lines = [
    ...(message ? [message, ''] : []),
    buildChatScreenTitle(otherUser?.login || 'пользователь', ad.title),
    '',
    ...(messages.length
      ? messages.map((row) => {
          const senderLogin = row.sender_user_id === telegramIdentity.user_id ? 'Вы' : otherUser?.login || 'пользователь';
          const time = row.created_at ? row.created_at.slice(11, 16) : '';
          return `${time ? `${time} ` : ''}${senderLogin}: ${row.body}`;
        })
      : ['Пока нет сообщений']),
  ];

  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotChatMarkup(conversation.id));
}

async function sendUserBotChatPrompt(
  env: Env,
  telegramUserId: string,
  chatId: number,
  conversationId: number,
  message: string | null = null
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const conversation = await getConversationById(env, conversationId);
  if (!conversation || (conversation.user_low_id !== telegramIdentity.user_id && conversation.user_high_id !== telegramIdentity.user_id)) {
    await sendUserBotChats(env, telegramUserId, chatId, 'Диалог не найден');
    return;
  }

  const ad = await getPublishedAdCardById(env, conversation.ad_id);
  const otherUserId = conversation.user_low_id === telegramIdentity.user_id ? conversation.user_high_id : conversation.user_low_id;
  const otherUser = await findUserById(env, otherUserId);
  const lines = [
    ...(message ? [message, ''] : []),
    buildChatScreenTitle(otherUser?.login || 'пользователь', ad?.title || `#${conversation.ad_id}`),
    '',
    'Напиши сообщение',
  ];

  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotChatPromptMarkup(conversation.id));
}

async function sendUserBotReplyPrompt(
  env: Env,
  telegramUserId: string,
  chatId: number,
  senderLogin: string | null,
  adTitle: string | null,
  message: string | null = null
): Promise<void> {
  const lines = [
    ...(message ? [message, ''] : []),
    'Ответ пользователю',
    senderLogin ? `Пользователь: ${senderLogin}` : 'Пользователь: неизвестен',
    adTitle ? `По объявлению: ${adTitle}` : '',
    '',
    'Напиши сообщение',
  ].filter((line) => line !== '');
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelHomeMarkup());
}

async function sendUserBotSearchPrompt(env: Env, telegramUserId: string, chatId: number, message: string | null = null): Promise<void> {
  const lines = [...(message ? [message, ''] : []), 'Введи текст для поиска'];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelHomeMarkup());
}

function buildUserBotAdListText(
  title: string,
  ads: Array<{
    id: number;
    title: string;
    category: string | null;
    type: string | null;
    author_login?: string | null;
    status?: string | null;
  }>,
  offset = 0,
  hasMore = false,
  moreLabel: string | null = null
): string {
  const lines = [title];

  if (!ads.length) {
    lines.push('', 'Пока ничего нет');
    return lines.join('\n');
  }

  for (const [index, ad] of ads.entries()) {
    const number = offset + index + 1;
    const meta = [ad.type ? `Тип: ${typeLabel(ad.type)}` : null, ad.category ? categoryLabel(ad.category) : null, ad.author_login ? `Автор: ${ad.author_login}` : null, ad.status ? `Статус: ${ad.status}` : null]
      .filter((value): value is string => value !== null)
      .join(' · ');
    lines.push('', `${number}. ${ad.title}`);
    if (meta) {
      lines.push(meta);
    }
  }

  if (hasMore && moreLabel) {
    lines.push('', moreLabel);
  }

  return lines.join('\n');
}

async function sendUserBotAdCards(
  env: Env,
  telegramUserId: string,
  chatId: number,
  title: string,
  ads: AdCardRow[],
  hasMore: boolean,
  moreCallbackData: string,
  backRow: Array<{ text: string; callback_data: string }>,
  offset = 0
): Promise<void> {
  const markupRows: Array<Array<{ text: string; callback_data: string }>> = [];

  for (const ad of ads) {
    markupRows.push([{ text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_SECTION_AD_PREFIX}${ad.category}:${ad.id}` }]);
  }

  if (hasMore) {
    markupRows.push([{ text: 'Показать ещё', callback_data: moreCallbackData }]);
  }
  markupRows.push(backRow);

  await showUserBotScreen(
    env,
    telegramUserId,
    chatId,
    buildUserBotAdListText(title, ads, offset, hasMore, hasMore ? 'Ещё есть объявления' : null),
    { inline_keyboard: markupRows }
  );
}

async function sendUserBotSearchResults(env: Env, telegramUserId: string, chatId: number, query: string, offset = 0): Promise<void> {
  const ads = await searchPublishedAdsPage(env, query, BOT_ADS_PAGE_SIZE + 1, offset);
  const hasMore = ads.length > BOT_ADS_PAGE_SIZE;
  const page = ads.slice(0, BOT_ADS_PAGE_SIZE);

  if (!page.length) {
    await showUserBotScreen(
      env,
      telegramUserId,
      chatId,
      offset === 0 ? `Поиск: ${query.trim()}\n\nНичего не найдено` : `Поиск: ${query.trim()}\n\nБольше объявлений нет`,
      {
        inline_keyboard: [
          [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }],
          [{ text: 'Назад', callback_data: USER_BOT_MENU_SEARCH }],
        ],
      }
    );
    return;
  }

  await sendUserBotAdCards(
    env,
    telegramUserId,
    chatId,
    `Поиск: ${query.trim()}`,
    page,
    hasMore,
    `${USER_BOT_SEARCH_MORE_PREFIX}${offset + BOT_ADS_PAGE_SIZE}`,
    [{ text: 'Назад', callback_data: USER_BOT_MENU_SEARCH }],
    offset
  );
}

function buildUserBotPublicAdText(
  ad: Pick<PublicAdCardRow, 'title' | 'body' | 'contact' | 'category' | 'type' | 'author_login' | 'created_at'>
): string {
  return [
    `Тип: ${typeLabel(ad.type)}`,
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    ad.author_login ? `Автор: ${ad.author_login}` : null,
    'Текст:',
    truncateText(ad.body, 700),
    ad.contact ? `Контакты: ${ad.contact}` : null,
    `Дата: ${ad.created_at}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

async function sendUserBotPublicAdCard(
  env: Env,
  telegramUserId: string,
  chatId: number,
  ad: PublicAdCardRow,
  replyMarkup: Record<string, unknown>
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  const canStartChat =
    telegramIdentity &&
    ad.owner_user_id !== null &&
    ad.owner_user_id !== telegramIdentity.user_id &&
    Boolean(await findTelegramIdentityByUserId(env, ad.owner_user_id));
  const inlineKeyboard = Array.isArray((replyMarkup as { inline_keyboard?: unknown }).inline_keyboard)
    ? ((replyMarkup as { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> }).inline_keyboard || []).map((row) => [...row])
    : [];

  if (canStartChat) {
    inlineKeyboard.unshift([{ text: 'Написать автору', callback_data: `${USER_BOT_CHAT_START_PREFIX}${ad.id}` }]);
  }

  const mergedReplyMarkup = inlineKeyboard.length ? { inline_keyboard: inlineKeyboard } : replyMarkup;

  if (ad.image_key) {
    await showUserBotPhotoScreen(
      env,
      telegramUserId,
      chatId,
      buildMediaUrl(env, ad.image_key),
      [
        `Тип: ${typeLabel(ad.type)}`,
        `Заголовок: ${ad.title}`,
        `Категория: ${categoryLabel(ad.category)}`,
        ad.author_login ? `Автор: ${ad.author_login}` : null,
        truncateText(ad.body, 700),
        ad.contact ? `Контакты: ${ad.contact}` : null,
        `Дата: ${ad.created_at}`,
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
      mergedReplyMarkup
    );
    return;
  }

  const text = buildUserBotPublicAdText(ad);
  await showUserBotScreen(env, telegramUserId, chatId, text, mergedReplyMarkup);
}

async function sendUserBotSearchAdDetail(env: Env, telegramUserId: string, chatId: number, adId: number): Promise<void> {
  const ad = await getPublishedAdCardById(env, adId);
  if (!ad) {
    await showUserBotScreen(env, telegramUserId, chatId, 'Объявление не найдено', {
      inline_keyboard: [
        [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }],
        [{ text: 'Назад', callback_data: USER_BOT_MENU_SEARCH }],
      ],
    });
    return;
  }

  await sendUserBotPublicAdCard(env, telegramUserId, chatId, ad, userBotSearchAdMarkup());
}

async function sendUserBotSectionAds(env: Env, telegramUserId: string, chatId: number, category: string, offset = 0): Promise<void> {
  const categoryKey = normalizeCategory(category);
  const ads = await listPublishedAdsByCategoryPage(env, categoryKey, BOT_ADS_PAGE_SIZE + 1, offset);
  const hasMore = ads.length > BOT_ADS_PAGE_SIZE;
  const page = ads.slice(0, BOT_ADS_PAGE_SIZE);

  if (!page.length) {
    await showUserBotScreen(
      env,
      telegramUserId,
      chatId,
      offset === 0 ? `${categoryLabel(categoryKey)}\n\nОбъявлений пока нет` : `${categoryLabel(categoryKey)}\n\nБольше объявлений нет`,
      userBotSectionsMarkup()
    );
    return;
  }

  await sendUserBotAdCards(
    env,
    telegramUserId,
    chatId,
    categoryLabel(categoryKey),
    page,
    hasMore,
    `${USER_BOT_SECTION_MORE_PREFIX}${categoryKey}:${offset + BOT_ADS_PAGE_SIZE}`,
    [{ text: 'Назад', callback_data: USER_BOT_MENU_SECTIONS }],
    offset
  );
}

async function sendUserBotSectionAdDetail(env: Env, telegramUserId: string, chatId: number, category: string, adId: number): Promise<void> {
  const categoryKey = normalizeCategory(category);
  const ad = await getPublishedAdCardById(env, adId, categoryKey);

  if (!ad) {
    await showUserBotScreen(env, telegramUserId, chatId, 'Объявление не найдено', userBotSectionsMarkup());
    return;
  }

  await sendUserBotPublicAdCard(env, telegramUserId, chatId, ad, userBotSectionAdMarkup(categoryKey));
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

async function buildAdminBotAdText(
  env: Env,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'contact' | 'category' | 'type' | 'status' | 'owner_user_id' | 'deleted_at' | 'image_key'>,
  bodyLimit = 2800
): Promise<string> {
  const owner = ad.owner_user_id ? await findUserById(env, ad.owner_user_id) : null;
  return [
    `#${ad.id}`,
    `Заголовок: ${ad.title}`,
    `Тип: ${typeLabel(ad.type)}`,
    `Категория: ${categoryLabel(ad.category)}`,
    `Статус: ${ad.status}`,
    `Owner: ${owner?.login ? `${owner.login} (#${ad.owner_user_id})` : ad.owner_user_id ?? 'none'}`,
    `Удалено: ${ad.deleted_at ? 'yes' : 'no'}`,
    'Текст:',
    truncateText(ad.body, bodyLimit),
    ad.contact ? `Контакты: ${ad.contact}` : null,
  ].filter((line): line is string => line !== null).join('\n');
}

async function sendAdminBotAdDetail(env: Env, chatId: number, ad: AdRow, page: number): Promise<void> {
  const replyMarkup = adminBotAdMarkup(ad.id, page);
  const text = await buildAdminBotAdText(env, ad);

  if (ad.image_key) {
    const response = await telegramApi(env, 'sendPhoto', {
      chat_id: chatId,
      photo: buildMediaUrl(env, ad.image_key),
      caption: await buildAdminBotAdText(env, ad, 700),
      reply_markup: replyMarkup,
    });

    if (!response.ok) {
      throw new Error(`Telegram sendPhoto failed with status ${response.status}`);
    }
    return;
  }

  await sendAdminBotMessage(env, chatId, text, replyMarkup);
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

async function sendUserBotCategoryPrompt(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Выбери категорию', userBotCategoryMarkup());
}

async function sendUserBotTypePrompt(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Выбери тип объявления', userBotTypeMarkup());
}

async function sendUserBotLoginPrompt(env: Env, telegramUserId: string, chatId: number, message: string | null = null): Promise<void> {
  const lines = [...(message ? [message, ''] : []), 'Придумай login'];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelHomeMarkup());
}

async function sendUserBotEmailPrompt(env: Env, telegramUserId: string, chatId: number, message: string | null = null): Promise<void> {
  const lines = [...(message ? [message, ''] : []), 'Теперь напиши email'];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelHomeMarkup());
}

async function sendUserBotEditCategoryPrompt(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Выбери новую категорию', userBotCategoryMarkup());
}

async function sendUserBotTitlePrompt(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Теперь напиши заголовок', userBotCancelHomeMarkup());
}

async function sendUserBotEditTitlePrompt(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Введи новый заголовок', userBotCancelHomeMarkup());
}

async function sendUserBotBodyPrompt(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Теперь напиши текст объявления', userBotCancelHomeMarkup());
}

async function sendUserBotEditBodyPrompt(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Введи новый текст объявления', userBotCancelHomeMarkup());
}

async function handleUserBotSettingsLoginUpdate(
  env: Env,
  telegramUserId: string,
  chatId: number,
  login: string
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const currentUser = await findUserById(env, telegramIdentity.user_id);
  if (!currentUser) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  if (!isValidLogin(login)) {
    await sendUserBotSettingsLoginPrompt(env, telegramUserId, chatId, 'Login должен быть 3-32 символа: латиница, цифры, _');
    return;
  }

  const existingLoginUser = await findUserByLogin(env, login);
  if (existingLoginUser && existingLoginUser.id !== currentUser.id) {
    await sendUserBotSettingsLoginPrompt(env, telegramUserId, chatId, 'Этот login уже занят');
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
  await sendUserBotSettings(env, telegramUserId, chatId, 'Login изменён');
}

async function handleUserBotSettingsEmailUpdate(
  env: Env,
  telegramUserId: string,
  chatId: number,
  email: string
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const currentUser = await findUserById(env, telegramIdentity.user_id);
  if (!currentUser) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  if (!isValidEmail(email)) {
    await sendUserBotSettingsEmailPrompt(env, telegramUserId, chatId, 'Введите корректный email');
    return;
  }

  const existingIdentity = await findEmailIdentity(env, email);
  if (existingIdentity && existingIdentity.user_id !== currentUser.id) {
    await sendUserBotSettingsEmailPrompt(env, telegramUserId, chatId, 'Этот email уже зарегистрирован');
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
  await sendUserBotSettings(env, telegramUserId, chatId, 'Email изменён');
}

async function handleUserBotSettingsAvatarUpdate(
  env: Env,
  telegramUserId: string,
  chatId: number,
  fileId: string
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const currentUser = await findUserById(env, telegramIdentity.user_id);
  if (!currentUser) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
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
    await sendUserBotSettingsAvatarPrompt(env, telegramUserId, chatId, 'Не удалось сохранить аватар');
    return;
  }

  await clearBotDraft(env, telegramUserId);
  await sendUserBotSettings(env, telegramUserId, chatId, 'Аватар обновлён');
}

async function handleUserBotSettingsAvatarDelete(
  env: Env,
  telegramUserId: string,
  chatId: number
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  if (!telegramIdentity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const currentUser = await findUserById(env, telegramIdentity.user_id);
  if (!currentUser) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  if (!currentUser.avatar_key) {
    await sendUserBotSettings(env, telegramUserId, chatId, 'Аватарки нет');
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
  await sendUserBotSettings(env, telegramUserId, chatId, 'Аватар удалён');
}

async function sendUserBotConfirmation(env: Env, chatId: number, draft: BotDraftRow): Promise<void> {
  const text = [
    'Проверь объявление:',
    `Категория: ${categoryLabel(draft.category)}`,
    `Тип: ${typeLabel(draft.ad_type)}`,
    `Заголовок: ${draft.title || ''}`,
    'Текст:',
    draft.body || '',
  ].join('\n');

  await showUserBotScreen(env, draft.telegram_user_id, chatId, text, userBotConfirmMarkup());
}

async function sendUserBotEditConfirmation(env: Env, chatId: number, draft: BotDraftRow): Promise<void> {
  const text = [
    'Проверь изменения:',
    `Категория: ${categoryLabel(draft.category)}`,
    `Тип: ${typeLabel(draft.ad_type)}`,
    `Заголовок: ${draft.title || ''}`,
    'Текст:',
    draft.body || '',
  ].join('\n');

  await showUserBotScreen(env, draft.telegram_user_id, chatId, text, userBotEditConfirmMarkup());
}

async function sendUserBotMyAds(env: Env, telegramUserId: string, chatId: number, message: string | null = null): Promise<void> {
  const identity = await findTelegramIdentity(env, telegramUserId);
  if (!identity) {
    await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
    return;
  }

  const result = await env.DB.prepare(
    `
      SELECT id, title, category, type, status, image_key, image_mime_type, image_updated_at, created_at
      FROM ads
      WHERE owner_user_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `
  )
  .bind(identity.user_id)
  .all<{ id: number; title: string; category: string | null; type: string | null; status: string; created_at: string }>();

  if (!result.results.length) {
    await showUserBotScreen(
      env,
      telegramUserId,
      chatId,
      [message, 'У тебя пока нет объявлений'].filter(Boolean).join('\n'),
      userBotMenuMarkup(env)
    );
    return;
  }

  const text = buildUserBotAdListText(
    'Твои объявления:',
    result.results.map((ad) => ({
      id: ad.id,
      title: ad.title,
      category: ad.category,
      type: ad.type,
      status: ad.status,
    })),
    0,
    false,
    null
  );
  await showUserBotScreen(env, telegramUserId, chatId, [message, text].filter(Boolean).join('\n\n'), userBotMyAdsMarkup(result.results));
}

async function getOwnedAdForTelegramUser(env: Env, telegramUserId: string, adId: number): Promise<AdRow | null> {
  const identity = await findTelegramIdentity(env, telegramUserId);
  if (!identity) {
    return null;
  }

  const result = await env.DB.prepare(
    `
      SELECT id, title, category, type, status, image_key, image_mime_type, image_updated_at, created_at, body
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
    await sendUserBotMenu(env, telegramUserId, chatId, 'Объявление не найдено');
    return false;
  }

  await upsertBotDraft(env, telegramUserId, 'edit', 'title', ad.category, ad.title, ad.body, ad.id, null, null, null, null, ad.type);
  await sendUserBotEditTitlePrompt(env, telegramUserId, chatId);
  return true;
}

function buildUserBotOwnedAdText(
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'status' | 'created_at'>
): string {
  return [
    `#${ad.id}`,
    `Тип: ${typeLabel(ad.type)}`,
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    `Статус: ${ad.status}`,
    `Дата: ${ad.created_at}`,
    'Текст:',
    truncateText(ad.body, 700),
  ].join('\n');
}

async function sendUserBotSingleAd(env: Env, telegramUserId: string, chatId: number, ad: AdRow): Promise<void> {
  const replyMarkup = userBotSingleAdMarkup(ad.id);
  if (ad.image_key) {
    await showUserBotPhotoScreen(
      env,
      telegramUserId,
      chatId,
      buildMediaUrl(env, ad.image_key),
      [
        `Тип: ${typeLabel(ad.type)}`,
        `Заголовок: ${ad.title}`,
        `Категория: ${categoryLabel(ad.category)}`,
        `Статус: ${ad.status}`,
        `Дата: ${ad.created_at}`,
        truncateText(ad.body, 700),
      ].join('\n'),
      replyMarkup
    );
    return;
  }

  const text = buildUserBotOwnedAdText(ad);
  await showUserBotScreen(env, telegramUserId, chatId, text, replyMarkup);
}

function buildTelegramAdText(
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type'>,
  statusLabel: string,
  itemKind: 'New' | 'Edited',
  bodyLimit = 2800
): string {
  return [
    `Type: ${itemKind}`,
    statusLabel,
    `ID: ${ad.id}`,
    `Title: ${ad.title}`,
    `Ad type: ${typeLabel(ad.type)}`,
    `Category: ${categoryLabel(ad.category)}`,
    'Text:',
    truncateText(ad.body, bodyLimit),
  ].join('\n');
}

async function sendTelegramMessage(
  env: Env,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'image_key'>,
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
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'image_key'>,
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
    await sendAdminBotMessage(env, chatId, `Введи новую категорию: ${CATEGORIES.map((category) => category.slug).join(', ')}`);
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
        type: originalAd?.type ?? 'sell',
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
      avatar_key: user.avatar_key,
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
             ads.contact,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.owner_user_id,
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
             COALESCE(ads.type, 'sell') AS type,
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
             COALESCE(ads.type, 'sell') AS type,
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

async function listPublishedAdsByCategoryAndType(env: Env, category: string, type: string | null): Promise<AdCardRow[]> {
  const normalizedType = type ? normalizeAdType(type) : null;
  const query = normalizedType
    ? `
      SELECT ads.id,
             ads.title,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.status = 'published'
        AND ads.deleted_at IS NULL
        AND ads.category = ?
        AND COALESCE(ads.type, 'sell') = ?
      ORDER BY ads.created_at DESC, ads.id DESC
    `
    : `
      SELECT ads.id,
             ads.title,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
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
    `;

  const statement = await env.DB.prepare(query);
  const result = normalizedType
    ? await statement.bind(category, normalizedType).all<AdCardRow>()
    : await statement.bind(category).all<AdCardRow>();

  return result.results;
}

async function listPublishedAdsByCategoryPage(env: Env, category: string, limit: number, offset: number): Promise<AdCardRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
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
             COALESCE(ads.type, 'sell') AS type,
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
             COALESCE(ads.type, 'sell') AS type,
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

async function ensureAdContactColumn(env: Env): Promise<void> {
  if (cachedEnsureAdContactColumnPromise) {
    return cachedEnsureAdContactColumnPromise;
  }

  cachedEnsureAdContactColumnPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(ads)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));
    if (!columnNames.has('contact')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN contact TEXT`).run();
    }
  })().finally(() => {
    cachedEnsureAdContactColumnPromise = null;
  });

  return cachedEnsureAdContactColumnPromise;
}

async function ensureAdTypeColumn(env: Env): Promise<void> {
  if (cachedEnsureAdTypeColumnPromise) {
    return cachedEnsureAdTypeColumnPromise;
  }

  cachedEnsureAdTypeColumnPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(ads)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));
    const hasTypeColumn = columnNames.has('type');

    if (!hasTypeColumn) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN type TEXT`).run();
    }

    await env.DB.prepare(
      `
        UPDATE ads
        SET
          category = CASE
            WHEN category = 'sale' OR category = 'wanted' OR category = 'free' THEN 'misc'
            ELSE category
          END,
          type = CASE
            WHEN category = 'sale' THEN 'sell'
            WHEN category = 'wanted' THEN 'buy'
            WHEN category = 'free' THEN 'free'
            WHEN type IS NULL THEN 'sell'
            ELSE type
          END
        WHERE type IS NULL
           OR category IN ('sale', 'wanted', 'free')
      `
    ).run();
  })().finally(() => {
    cachedEnsureAdTypeColumnPromise = null;
  });

  return cachedEnsureAdTypeColumnPromise;
}

async function ensureBotDraftColumns(env: Env): Promise<void> {
  if (cachedEnsureBotDraftColumnsPromise) {
    return cachedEnsureBotDraftColumnsPromise;
  }

  cachedEnsureBotDraftColumnsPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(bot_drafts)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));

    if (!columnNames.has('ui_chat_id')) {
      await env.DB.prepare(`ALTER TABLE bot_drafts ADD COLUMN ui_chat_id INTEGER`).run();
    }

    if (!columnNames.has('ui_message_id')) {
      await env.DB.prepare(`ALTER TABLE bot_drafts ADD COLUMN ui_message_id INTEGER`).run();
    }

    if (!columnNames.has('ad_type')) {
      await env.DB.prepare(`ALTER TABLE bot_drafts ADD COLUMN ad_type TEXT`).run();
    }

    if (!columnNames.has('reply_user_id')) {
      await env.DB.prepare(`ALTER TABLE bot_drafts ADD COLUMN reply_user_id INTEGER`).run();
    }

    if (!columnNames.has('reply_ad_id')) {
      await env.DB.prepare(`ALTER TABLE bot_drafts ADD COLUMN reply_ad_id INTEGER`).run();
    }

    if (!columnNames.has('password_current')) {
      await env.DB.prepare(`ALTER TABLE bot_drafts ADD COLUMN password_current TEXT`).run();
    }

    if (!columnNames.has('password_new')) {
      await env.DB.prepare(`ALTER TABLE bot_drafts ADD COLUMN password_new TEXT`).run();
    }
  })().finally(() => {
    cachedEnsureBotDraftColumnsPromise = null;
  });

  return cachedEnsureBotDraftColumnsPromise;
}

async function ensureChatTables(env: Env): Promise<void> {
  if (cachedEnsureChatTablesPromise) {
    return cachedEnsureChatTablesPromise;
  }

  cachedEnsureChatTablesPromise = (async () => {
    await env.DB.prepare(
      `
        CREATE TABLE IF NOT EXISTS bot_conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ad_id INTEGER NOT NULL,
          user_low_id INTEGER NOT NULL,
          user_high_id INTEGER NOT NULL,
          last_message_sender_user_id INTEGER,
          last_message_text TEXT,
          last_message_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(ad_id, user_low_id, user_high_id)
        )
      `
    ).run();

    await env.DB.prepare(
      `
        CREATE TABLE IF NOT EXISTS bot_chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          sender_user_id INTEGER NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES bot_conversations(id) ON DELETE CASCADE
        )
      `
    ).run();

    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS bot_conversations_last_message_at_idx ON bot_conversations(last_message_at)`
    ).run();

    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS bot_chat_messages_conversation_id_idx ON bot_chat_messages(conversation_id, id)`
    ).run();
  })().finally(() => {
    cachedEnsureChatTablesPromise = null;
  });

  return cachedEnsureChatTablesPromise;
}

function normalizeConversationUserIds(userAId: number, userBId: number): [number, number] {
  return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
}

async function getConversationById(env: Env, conversationId: number): Promise<ChatThreadRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, ad_id, user_low_id, user_high_id, last_message_sender_user_id, last_message_text, last_message_at, created_at, updated_at
      FROM bot_conversations
      WHERE id = ?
      LIMIT 1
    `
  )
    .bind(conversationId)
    .first<ChatThreadRow>();

  return result ?? null;
}

async function getConversationForUsers(env: Env, adId: number, userAId: number, userBId: number): Promise<ChatThreadRow | null> {
  const [lowUserId, highUserId] = normalizeConversationUserIds(userAId, userBId);
  const result = await env.DB.prepare(
    `
      SELECT id, ad_id, user_low_id, user_high_id, last_message_sender_user_id, last_message_text, last_message_at, created_at, updated_at
      FROM bot_conversations
      WHERE ad_id = ?
        AND user_low_id = ?
        AND user_high_id = ?
      LIMIT 1
    `
  )
    .bind(adId, lowUserId, highUserId)
    .first<ChatThreadRow>();

  return result ?? null;
}

async function getOrCreateConversation(env: Env, adId: number, userAId: number, userBId: number): Promise<ChatThreadRow> {
  const existing = await getConversationForUsers(env, adId, userAId, userBId);
  if (existing) {
    return existing;
  }

  const [lowUserId, highUserId] = normalizeConversationUserIds(userAId, userBId);
  await env.DB.prepare(
    `
      INSERT INTO bot_conversations (
        ad_id,
        user_low_id,
        user_high_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(ad_id, user_low_id, user_high_id) DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP
    `
  )
    .bind(adId, lowUserId, highUserId)
    .run();

  const created = await getConversationForUsers(env, adId, userAId, userBId);
  if (!created) {
    throw new Error('Failed to create conversation');
  }

  return created;
}

async function listConversationsForUser(env: Env, userId: number): Promise<ChatThreadListRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT
        c.id,
        c.ad_id,
        a.title AS ad_title,
        CASE
          WHEN c.user_low_id = ? THEN c.user_high_id
          ELSE c.user_low_id
        END AS other_user_id,
        u.login AS other_login,
        u.avatar_key AS other_avatar_key,
        c.last_message_sender_user_id,
        c.last_message_text,
        c.last_message_at
      FROM bot_conversations c
      JOIN ads a ON a.id = c.ad_id AND a.deleted_at IS NULL
      JOIN users u ON u.id = CASE
        WHEN c.user_low_id = ? THEN c.user_high_id
        ELSE c.user_low_id
      END
      WHERE c.user_low_id = ?
         OR c.user_high_id = ?
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC, c.id DESC
    `
  )
    .bind(userId, userId, userId, userId)
    .all<ChatThreadListRow>();

  return result.results;
}

async function listConversationMessages(env: Env, conversationId: number, limit = 8, offset = 0): Promise<ChatMessageRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT id, conversation_id, sender_user_id, body, created_at
      FROM bot_chat_messages
      WHERE conversation_id = ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `
  )
    .bind(conversationId, limit, offset)
    .all<ChatMessageRow>();

  return result.results.reverse();
}

async function storeConversationMessage(
  env: Env,
  conversationId: number,
  senderUserId: number,
  body: string
): Promise<ChatMessageRow> {
  const insert = await env.DB.prepare(
    `
      INSERT INTO bot_chat_messages (
        conversation_id,
        sender_user_id,
        body,
        created_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `
  )
    .bind(conversationId, senderUserId, body)
    .run();

  const rowId = Number(insert.meta.last_row_id);
  const message = await env.DB.prepare(
    `
      SELECT id, conversation_id, sender_user_id, body, created_at
      FROM bot_chat_messages
      WHERE id = ?
      LIMIT 1
    `
  )
    .bind(rowId)
    .first<ChatMessageRow>();

  if (!message) {
    throw new Error('Failed to store conversation message');
  }

  await env.DB.prepare(
    `
      UPDATE bot_conversations
      SET last_message_sender_user_id = ?,
          last_message_text = ?,
          last_message_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(senderUserId, body, conversationId)
    .run();

  return message;
}

async function createAd(
  env: Env,
  ctx: ExecutionContext,
  title: string,
  body: string,
  contact: string | null | undefined,
  categoryInput: string | null | undefined,
  typeInput: string | null | undefined,
  ownerUserId: number | null = null,
  image: File | null = null
): Promise<{ id: number; category: CategorySlug }> {
  const category = normalizeCategory(categoryInput);
  const type = normalizeAdType(typeInput);
  let imageUpload: CompressedAdImageUpload | null = null;

  if (image) {
    imageUpload = await readImageUpload(image);
    if (imageUpload) {
      await putCompressedAdImage(env, imageUpload);
    }
  }

  let result;
  try {
    result = await env.DB.prepare(
      `
        INSERT INTO ads (
          title,
          body,
          contact,
          category,
          type,
          status,
          owner_user_id,
          image_key,
          image_mime_type,
          image_updated_at,
          deleted_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, CASE WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
      .bind(title, body, contact || null, category, type, ownerUserId, imageUpload?.key || null, imageUpload?.mimeType || null, imageUpload?.key || null)
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
      type,
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
    contact: String(form.get('contact') || '').trim(),
    category: String(form.get('category') || '').trim(),
    type: String(form.get('type') || '').trim(),
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

  const { title, body, contact, category, type, image } = await parseAdForm(request);

  if (!title || !body) {
    return renderEditPage(env, currentUser, ad, 'Заполни заголовок и текст');
  }

  const nextStatus = ad.status === 'published' || ad.status === 'rejected' ? 'pending' : ad.status;
  const normalizedCategory = normalizeCategory(category);
  const normalizedType = normalizeAdType(type);
  let newImage: CompressedAdImageUpload | null = null;
  try {
    if (image) {
      newImage = await readImageUpload(image);
      if (newImage) {
        await putCompressedAdImage(env, newImage);
      }
    }

    const oldImageKey = ad.image_key;
    await env.DB.prepare(
      `
        UPDATE ads
        SET title = ?,
            body = ?,
            contact = ?,
            category = ?,
            type = ?,
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
        contact || null,
        normalizedCategory,
        normalizedType,
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
      type: normalizedType,
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

async function sendChatMessageToUser(
  env: Env,
  recipientTelegramUserId: string,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const chatId = Number(recipientTelegramUserId);
  if (!Number.isInteger(chatId) || chatId <= 0) {
    throw new Error('Invalid recipient chat id');
  }

  const response = await userBotApi(env, 'sendMessage', {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
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
      SELECT id, telegram_user_id, action, step, ui_chat_id, ui_message_id, ad_id, login, email, category, ad_type, reply_user_id, reply_ad_id, password_current, password_new, title, body, created_at, updated_at
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
  email: string | null = null,
  uiChatId: number | null = null,
  uiMessageId: number | null = null,
  adType: string | null = null,
  replyUserId: number | null = null,
  replyAdId: number | null = null,
  passwordCurrent: string | null = null,
  passwordNew: string | null = null
): Promise<void> {
  await env.DB.prepare(
    `
      INSERT INTO bot_drafts (
        telegram_user_id,
        action,
        step,
        ui_chat_id,
        ui_message_id,
        ad_id,
        login,
        email,
        category,
        ad_type,
        reply_user_id,
        reply_ad_id,
        password_current,
        password_new,
        title,
        body,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        action = excluded.action,
        step = excluded.step,
        ui_chat_id = CASE
          WHEN excluded.ui_chat_id IS NULL THEN ui_chat_id
          ELSE excluded.ui_chat_id
        END,
        ui_message_id = CASE
          WHEN excluded.ui_message_id IS NULL THEN ui_message_id
          ELSE excluded.ui_message_id
        END,
        ad_id = excluded.ad_id,
        login = excluded.login,
        email = excluded.email,
        category = excluded.category,
        ad_type = excluded.ad_type,
        reply_user_id = excluded.reply_user_id,
        reply_ad_id = excluded.reply_ad_id,
        password_current = excluded.password_current,
        password_new = excluded.password_new,
        title = excluded.title,
        body = excluded.body,
        updated_at = CURRENT_TIMESTAMP
    `
  )
    .bind(
      telegramUserId,
      action,
      step,
      uiChatId,
      uiMessageId,
      adId,
      login,
      email,
      category,
      adType,
      replyUserId,
      replyAdId,
      passwordCurrent,
      passwordNew,
      title,
      body
    )
    .run();
}

async function clearBotDraft(env: Env, telegramUserId: string): Promise<void> {
  await env.DB.prepare(
    `
      UPDATE bot_drafts
      SET action = 'idle',
          step = 'menu',
          ad_id = NULL,
          login = NULL,
          email = NULL,
          category = NULL,
          ad_type = NULL,
          reply_user_id = NULL,
          reply_ad_id = NULL,
          password_current = NULL,
          password_new = NULL,
          title = NULL,
          body = NULL,
          updated_at = CURRENT_TIMESTAMP
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

async function sendChatMessage(
  env: Env,
  senderUserId: number,
  recipientUserId: number,
  adId: number,
  body: string,
  senderTelegramUserId: string | null = null
): Promise<ChatThreadRow> {
  const conversation = await getOrCreateConversation(env, adId, senderUserId, recipientUserId);
  await storeConversationMessage(env, conversation.id, senderUserId, body);

  const sender = await findUserById(env, senderUserId);
  const recipientTelegram = await findTelegramIdentityByUserId(env, recipientUserId);
  const recipientChatId = Number(recipientTelegram?.provider_user_id || '');
  if (recipientTelegram?.provider_user_id && Number.isInteger(recipientChatId) && recipientChatId > 0) {
    const ad = await getPublishedAdCardById(env, adId);
    const title = ad?.title || `#${adId}`;
    const senderLogin = sender?.login || senderTelegramUserId || 'пользователь';
    const lines = [
      `Тебе написал пользователь ${senderLogin}`,
      `по объявлению: ${title}`,
      '',
      'Сообщение:',
      body,
    ];
    const senderIdentity = await findTelegramIdentityByUserId(env, senderUserId);
    try {
      await sendChatMessageToUser(
        env,
        recipientTelegram.provider_user_id,
        lines.join('\n'),
        senderIdentity?.provider_user_id ? userBotIncomingChatMarkup(conversation.id) : undefined
      );
    } catch (error) {
      console.error('Failed to notify chat recipient', error);
    }
  }

  return conversation;
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
    await sendUserBotMenu(env, telegramUserId, chatId, 'С возвращением в жоржлист', user?.login || null);
    return;
  }

  await upsertBotDraft(env, telegramUserId, 'register', 'login', null, null, null, null, null, null);
  await sendUserBotLoginPrompt(env, telegramUserId, chatId);
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
    await sendUserBotCategoryPrompt(env, telegramUserId, chatId);
    return;
  }

  if (action === USER_BOT_MENU_SECTIONS) {
    await sendUserBotSections(env, telegramUserId, chatId);
    return;
  }

  if (action === USER_BOT_MENU_SEARCH) {
    await upsertBotDraft(env, telegramUserId, 'search', 'query');
    await sendUserBotSearchPrompt(env, telegramUserId, chatId);
    return;
  }

  if (action === USER_BOT_MENU_SETTINGS) {
    await sendUserBotSettings(env, telegramUserId, chatId);
    return;
  }

  if (action === USER_BOT_MENU_EDIT) {
    await showUserBotScreen(env, telegramUserId, chatId, 'Редактирование скоро будет', userBotMenuMarkup(env));
    return;
  }

  if (action === USER_BOT_MENU_DELETE) {
    await showUserBotScreen(env, telegramUserId, chatId, 'Удаление скоро будет', userBotMenuMarkup(env));
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
    await sendUserBotMenu(env, telegramUserId, chatId, 'Начни с /start');
    return;
  }

  if (draft.action === 'create' && action === 'category') {
    const category = normalizeCategory(value);
    await upsertBotDraft(env, telegramUserId, 'create', 'type', category, null, null, draft.ad_id);
    await sendUserBotTypePrompt(env, telegramUserId, chatId);
    return;
  }

  if (draft.action === 'create' && action === 'type') {
    const adType = normalizeAdType(value);
    await upsertBotDraft(env, telegramUserId, 'create', 'title', draft.category, null, null, draft.ad_id, null, null, null, null, adType);
    await sendUserBotTitlePrompt(env, telegramUserId, chatId);
    return;
  }

  if (draft.action === 'edit' && action === 'category') {
    const category = normalizeCategory(value);
    await upsertBotDraft(env, telegramUserId, 'edit', 'body', category, draft.title, draft.body, draft.ad_id, null, null, null, null, draft.ad_type);
    await sendUserBotEditBodyPrompt(env, telegramUserId, chatId);
    return;
  }

  if (action === 'confirm') {
    if ((draft.action === 'create' && value === 'cancel') || (draft.action === 'edit' && value === 'cancel')) {
      await clearBotDraft(env, telegramUserId);
      await sendUserBotMenu(env, telegramUserId, chatId, 'Отменено');
      return;
    }

    if (draft.action === 'create') {
      if (value !== 'send') {
        await sendUserBotMenu(env, telegramUserId, chatId, 'Неизвестное действие');
        return;
      }

      const identity = await findTelegramIdentity(env, telegramUserId);
      if (!identity) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
        return;
      }

      if (!draft.title || !draft.body) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Черновик пуст');
        return;
      }

      try {
        await createAd(env, ctx, draft.title, draft.body, null, draft.category, draft.ad_type, identity.user_id);
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Объявление отправлено на модерацию');
      } catch (error) {
        console.error('Failed to create ad from user bot', error);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Не удалось отправить объявление');
      }
      return;
    }

    if (draft.action === 'edit') {
      if (value !== 'save') {
        await sendUserBotMenu(env, telegramUserId, chatId, 'Неизвестное действие');
        return;
      }

      const identity = await findTelegramIdentity(env, telegramUserId);
      if (!identity || !draft.ad_id) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
        return;
      }

      if (!draft.title || !draft.body) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Черновик пуст');
        return;
      }

      const category = normalizeCategory(draft.category);
      const adType = normalizeAdType(draft.ad_type);
      const ad = await getOwnedAdForTelegramUser(env, telegramUserId, draft.ad_id);
      if (!ad) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Объявление не найдено');
        return;
      }

      try {
        await env.DB.prepare(
          `
            UPDATE ads
            SET title = ?,
                body = ?,
                category = ?,
                type = ?,
                status = 'pending',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND owner_user_id = ?
              AND deleted_at IS NULL
          `
        )
          .bind(draft.title, draft.body, category, adType, ad.id, identity.user_id)
          .run();

        ctx.waitUntil(
          sendTelegramMessage(env, {
            id: ad.id,
            title: draft.title,
            body: draft.body,
            category,
            type: adType,
            image_key: ad.image_key,
          }, 'Edited').catch((error: unknown) => {
            console.error('Telegram notification failed', error);
          })
        );

        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Объявление обновлено и отправлено на модерацию');
      } catch (error) {
        console.error('Failed to update ad from user bot', error);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Не удалось обновить объявление');
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

  if (
    !draft ||
    (draft.action !== 'create' &&
      draft.action !== 'edit' &&
      draft.action !== 'register' &&
      draft.action !== 'search' &&
      draft.action !== 'settings' &&
      draft.action !== 'reply' &&
      draft.action !== 'chat')
  ) {
    return;
  }

  if (draft.action === 'reply' || draft.action === 'chat') {
    if (draft.step !== 'message') {
      return;
    }

    const replyText = text.trim();
    if (!replyText) {
      const senderIdentity = await findTelegramIdentity(env, telegramUserId);
      const senderUser = senderIdentity ? await findUserById(env, senderIdentity.user_id) : null;
      const ad = draft.reply_ad_id ? await getPublishedAdCardById(env, draft.reply_ad_id) : null;
      await sendUserBotReplyPrompt(
        env,
        telegramUserId,
        chatId,
        senderUser?.login || telegramUsername,
        ad?.title || (draft.reply_ad_id ? `#${draft.reply_ad_id}` : null),
        'Введи текст сообщения'
      );
      return;
    }

    if (replyText.length > 1000) {
      const senderIdentity = await findTelegramIdentity(env, telegramUserId);
      const senderUser = senderIdentity ? await findUserById(env, senderIdentity.user_id) : null;
      const ad = draft.reply_ad_id ? await getPublishedAdCardById(env, draft.reply_ad_id) : null;
      await sendUserBotReplyPrompt(
        env,
        telegramUserId,
        chatId,
        senderUser?.login || telegramUsername,
        ad?.title || (draft.reply_ad_id ? `#${draft.reply_ad_id}` : null),
        'Сообщение слишком длинное'
      );
      return;
    }

    if (!draft.reply_user_id || !draft.reply_ad_id) {
      await clearBotDraft(env, telegramUserId);
      await sendUserBotMenu(env, telegramUserId, chatId, 'Не удалось определить адресата');
      return;
    }

    const senderIdentity = await findTelegramIdentity(env, telegramUserId);
    if (!senderIdentity) {
      await clearBotDraft(env, telegramUserId);
      await sendUserBotMenu(env, telegramUserId, chatId, 'Пользователь не найден');
      return;
    }

    try {
      const conversation = await sendChatMessage(
        env,
        senderIdentity.user_id,
        draft.reply_user_id,
        draft.reply_ad_id,
        replyText,
        telegramUsername || null
      );
      await clearBotDraft(env, telegramUserId);
      await sendUserBotChatView(env, telegramUserId, chatId, conversation.id, 'Сообщение отправлено');
    } catch (error) {
      console.error('Failed to send reply message to user', error);
      await clearBotDraft(env, telegramUserId);
      await sendUserBotMenu(env, telegramUserId, chatId, 'Не удалось отправить сообщение');
      return;
    }
    return;
  }

  if (draft.action === 'search') {
    const query = text.trim();
    if (!query) {
      await sendUserBotSearchPrompt(env, telegramUserId, chatId);
      return;
    }

    await upsertBotDraft(env, telegramUserId, 'search', 'results', null, query);
    await sendUserBotSearchResults(env, telegramUserId, chatId, query);
    return;
  }

  if (draft.action === 'settings') {
    if (draft.step === 'password-current' || draft.step === 'password-new' || draft.step === 'password-confirm') {
      const emailIdentity = await findEmailIdentityByUserId(env, (await findTelegramIdentity(env, telegramUserId))?.user_id || 0);
      if (!emailIdentity) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotSettings(env, telegramUserId, chatId, 'Сначала добавь email на сайте');
        return;
      }

      const hasPassword = Boolean(emailIdentity.password_hash);

      if (draft.step === 'password-current') {
        const currentPassword = text.trim();
        if (!currentPassword) {
          await sendUserBotSettingsPasswordPrompt(env, telegramUserId, chatId, hasPassword, 'current', 'Введи текущий пароль');
          return;
        }

        const isPasswordValid = await verifyPassword(currentPassword, emailIdentity.password_hash || '');
        if (!isPasswordValid) {
          await sendUserBotSettingsPasswordPrompt(env, telegramUserId, chatId, hasPassword, 'current', 'Неверный текущий пароль');
          return;
        }

        await upsertBotDraft(
          env,
          telegramUserId,
          'settings',
          'password-new',
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          currentPassword,
          null
        );
        await sendUserBotSettingsPasswordPrompt(env, telegramUserId, chatId, hasPassword, 'new');
        return;
      }

      if (draft.step === 'password-new') {
        const newPassword = text.trim();
        if (newPassword.length < 8) {
          await sendUserBotSettingsPasswordPrompt(env, telegramUserId, chatId, hasPassword, 'new', 'Новый пароль должен быть не короче 8 символов');
          return;
        }

        await upsertBotDraft(
          env,
          telegramUserId,
          'settings',
          'password-confirm',
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          draft.password_current,
          newPassword
        );
        await sendUserBotSettingsPasswordPrompt(env, telegramUserId, chatId, hasPassword, 'confirm');
        return;
      }

      if (draft.step === 'password-confirm') {
        const confirmPassword = text.trim();
        if (!confirmPassword) {
          await sendUserBotSettingsPasswordPrompt(env, telegramUserId, chatId, hasPassword, 'confirm', 'Повтори новый пароль');
          return;
        }

        if (!draft.password_new || draft.password_new !== confirmPassword) {
          await sendUserBotSettingsPasswordPrompt(env, telegramUserId, chatId, hasPassword, 'confirm', 'Подтверждение нового пароля не совпадает');
          return;
        }

        const passwordHash = await hashPassword(confirmPassword);
        await env.DB.prepare(
          `
            UPDATE user_identities
            SET password_hash = ?
            WHERE id = ?
          `
        )
          .bind(passwordHash, emailIdentity.id)
          .run();

        await clearBotDraft(env, telegramUserId);
        await sendUserBotSettings(env, telegramUserId, chatId, 'Пароль изменён');
        return;
      }
    }

    if (draft.step === 'login') {
      await handleUserBotSettingsLoginUpdate(env, telegramUserId, chatId, text.trim());
      return;
    }

    if (draft.step === 'email') {
      await handleUserBotSettingsEmailUpdate(env, telegramUserId, chatId, text.trim().toLowerCase());
      return;
    }

    if (draft.step === 'avatar') {
      await sendUserBotSettingsAvatarPrompt(env, telegramUserId, chatId);
      return;
    }

    await clearBotDraft(env, telegramUserId);
    await sendUserBotSettings(env, telegramUserId, chatId);
    return;
  }

  if (draft.action === 'register') {
    if (draft.step === 'login') {
      const login = text.trim();
      if (!isValidLogin(login)) {
        await sendUserBotLoginPrompt(env, telegramUserId, chatId, 'Login должен быть 3-32 символа: латиница, цифры, _');
        return;
      }

      const existingUser = await findUserByLogin(env, login);
      if (existingUser) {
        await sendUserBotLoginPrompt(env, telegramUserId, chatId, 'Такой login уже занят');
        return;
      }

      await upsertBotDraft(env, telegramUserId, 'register', 'email', null, null, null, null, login, null);
      await sendUserBotEmailPrompt(env, telegramUserId, chatId);
      return;
    }

    if (draft.step === 'email') {
      const email = text.trim().toLowerCase();
      if (!isValidEmail(email)) {
        await sendUserBotEmailPrompt(env, telegramUserId, chatId, 'Введите корректный email');
        return;
      }

      const existingIdentity = await findEmailIdentity(env, email);
      if (existingIdentity && existingIdentity.password_hash) {
        await sendUserBotEmailPrompt(env, telegramUserId, chatId, 'Этот email уже зарегистрирован');
        return;
      }

      if (!draft.login) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Начни сначала');
        return;
      }

      try {
        await createTelegramUser(env, draft.login, email, telegramUserId, telegramUsername);
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Ты зарегистрирован в жоржлист', draft.login);
      } catch (error) {
        console.error('Failed to create user from telegram bot', error);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Не удалось зарегистрировать аккаунт');
      }
      return;
    }

    return;
  }

  if (draft.step === 'title') {
    if (draft.action === 'create') {
      await upsertBotDraft(env, telegramUserId, 'create', 'body', draft.category, text, null, draft.ad_id, null, null, null, null, draft.ad_type);
      await sendUserBotBodyPrompt(env, telegramUserId, chatId);
      return;
    }

    if (draft.action === 'edit') {
      await upsertBotDraft(env, telegramUserId, 'edit', 'category', draft.category, text, draft.body, draft.ad_id, null, null, null, null, draft.ad_type);
      await sendUserBotEditCategoryPrompt(env, telegramUserId, chatId);
      return;
    }

    return;
  }

  if (draft.action === 'edit' && draft.step === 'category') {
    await sendUserBotEditCategoryPrompt(env, telegramUserId, chatId);
    return;
  }

  if (draft.action === 'create' && draft.step === 'type') {
    await sendUserBotTypePrompt(env, telegramUserId, chatId);
    return;
  }

  if (draft.step === 'body') {
    if (draft.action === 'create') {
      if (!draft.title) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Начни заново');
        return;
      }

      await upsertBotDraft(env, telegramUserId, 'create', 'confirm', draft.category, draft.title, text, draft.ad_id, null, null, null, null, draft.ad_type);
      const nextDraft = await getBotDraft(env, telegramUserId);
      if (nextDraft) {
        await sendUserBotConfirmation(env, chatId, nextDraft);
      }
      return;
    }

    if (draft.action === 'edit') {
      if (!draft.title) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Начни заново');
        return;
      }

      await upsertBotDraft(env, telegramUserId, 'edit', 'confirm', draft.category, draft.title, text, draft.ad_id, null, null, null, null, draft.ad_type);
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

  await rememberUserBotScreen(env, telegramUserId, chatId, callbackQuery.message.message_id);

  if (data === USER_BOT_MENU_EDIT) {
    await answerUserCallbackQuery(env, callbackQuery.id, 'Редактирование скоро будет').catch(() => {});
    await showUserBotScreen(env, telegramUserId, chatId, 'Редактирование скоро будет', userBotMenuMarkup(env));
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_DELETE) {
    await answerUserCallbackQuery(env, callbackQuery.id, 'Удаление скоро будет').catch(() => {});
    await showUserBotScreen(env, telegramUserId, chatId, 'Удаление скоро будет', userBotMenuMarkup(env));
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
    await sendUserBotSearchPrompt(env, telegramUserId, chatId);
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_SETTINGS) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSettings(env, telegramUserId, chatId);
    return json({ ok: true });
  }

  if (data === USER_BOT_MENU_HOME) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    const userIdentity = await findTelegramIdentity(env, telegramUserId);
    const user = userIdentity ? await findUserById(env, userIdentity.user_id) : null;
    await sendUserBotMenu(env, telegramUserId, chatId, user ? 'С возвращением в жоржлист' : 'Добро пожаловать в жоржлист', user?.login || null);
    return json({ ok: true });
  }

  if (data === USER_BOT_CANCEL_FLOW) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await clearBotDraft(env, telegramUserId);
    const userIdentity = await findTelegramIdentity(env, telegramUserId);
    const user = userIdentity ? await findUserById(env, userIdentity.user_id) : null;
    await sendUserBotMenu(env, telegramUserId, chatId, user ? 'С возвращением в жоржлист' : 'Добро пожаловать в жоржлист', user?.login || null);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SECTION_PREFIX)) {
    const suffix = data.slice(USER_BOT_SECTION_PREFIX.length);
    if (suffix) {
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSectionAds(env, telegramUserId, chatId, suffix);
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSections(env, telegramUserId, chatId);
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
    await sendUserBotSectionAdDetail(env, telegramUserId, chatId, category, adId);
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
    await sendUserBotSectionAds(env, telegramUserId, chatId, category, offset);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SEARCH_MORE_PREFIX)) {
    const offset = Number(data.slice(USER_BOT_SEARCH_MORE_PREFIX.length));
    const draft = await getBotDraft(env, telegramUserId);
    const query = draft?.action === 'search' && draft.title ? draft.title : '';
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    if (!query) {
      await sendUserBotSearchPrompt(env, telegramUserId, chatId);
      return json({ ok: true });
    }
    await sendUserBotSearchResults(env, telegramUserId, chatId, query, Number.isInteger(offset) && offset >= 0 ? offset : 0);
    return json({ ok: true });
  }

  if (data === USER_BOT_SEARCH_RESULTS) {
    const draft = await getBotDraft(env, telegramUserId);
    const query = draft?.action === 'search' && draft.title ? draft.title : '';
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    if (!query) {
      await sendUserBotSearchPrompt(env, telegramUserId, chatId);
      return json({ ok: true });
    }

    await sendUserBotSearchResults(env, telegramUserId, chatId, query);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SEARCH_AD_PREFIX)) {
    const adId = Number(data.slice(USER_BOT_SEARCH_AD_PREFIX.length));
    if (!Number.isInteger(adId) || adId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid ad').catch(() => {});
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSearchAdDetail(env, telegramUserId, chatId, adId);
    return json({ ok: true });
  }

  if (data === USER_BOT_CHAT_LIST) {
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotChats(env, telegramUserId, chatId);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_CHAT_PREFIX)) {
    const conversationId = Number(data.slice(USER_BOT_CHAT_PREFIX.length));
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid chat').catch(() => {});
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotChatView(env, telegramUserId, chatId, conversationId);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_CHAT_REPLY_PREFIX)) {
    const conversationId = Number(data.slice(USER_BOT_CHAT_REPLY_PREFIX.length));
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid chat').catch(() => {});
      return json({ ok: true });
    }

    const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
    const conversation = await getConversationById(env, conversationId);
    if (!telegramIdentity || !conversation || (conversation.user_low_id !== telegramIdentity.user_id && conversation.user_high_id !== telegramIdentity.user_id)) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Chat not found').catch(() => {});
      return json({ ok: true });
    }

    const peerUserId = conversation.user_low_id === telegramIdentity.user_id ? conversation.user_high_id : conversation.user_low_id;
    await upsertBotDraft(
      env,
      telegramUserId,
      'chat',
      'message',
      null,
      null,
      null,
      conversation.ad_id,
      null,
      null,
      null,
      null,
      null,
      peerUserId,
      conversation.ad_id,
      null,
      null
    );
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotChatPrompt(env, telegramUserId, chatId, conversationId);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_CHAT_START_PREFIX)) {
    const adId = Number(data.slice(USER_BOT_CHAT_START_PREFIX.length));
    if (!Number.isInteger(adId) || adId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid ad').catch(() => {});
      return json({ ok: true });
    }

    const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
    if (!telegramIdentity) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'User not found').catch(() => {});
      return json({ ok: true });
    }

    const ad = await getPublishedAdCardById(env, adId);
    if (!ad || !ad.owner_user_id || ad.owner_user_id === telegramIdentity.user_id) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Chat not available').catch(() => {});
      return json({ ok: true });
    }

    const ownerTelegram = await findTelegramIdentityByUserId(env, ad.owner_user_id);
    if (!ownerTelegram?.provider_user_id) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'У автора не привязан Telegram').catch(() => {});
      return json({ ok: true });
    }

    const conversation = await getOrCreateConversation(env, adId, telegramIdentity.user_id, ad.owner_user_id);
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotChatView(env, telegramUserId, chatId, conversation.id);
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
    await sendUserBotMyAds(env, telegramUserId, chatId, 'Объявление удалено');
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_SETTINGS_PREFIX)) {
    const action = data.slice(USER_BOT_SETTINGS_PREFIX.length);

    if (action === 'back') {
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await clearBotDraft(env, telegramUserId);
      const userIdentity = await findTelegramIdentity(env, telegramUserId);
      const user = userIdentity ? await findUserById(env, userIdentity.user_id) : null;
      await sendUserBotMenu(env, telegramUserId, chatId, user ? 'С возвращением в жоржлист' : 'Добро пожаловать в жоржлист', user?.login || null);
      return json({ ok: true });
    }

    if (action === 'cancel') {
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await clearBotDraft(env, telegramUserId);
      await sendUserBotSettings(env, telegramUserId, chatId, 'Отменено');
      return json({ ok: true });
    }

    if (action === 'login') {
      await upsertBotDraft(env, telegramUserId, 'settings', 'login');
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSettingsLoginPrompt(env, telegramUserId, chatId);
      return json({ ok: true });
    }

    if (action === 'email') {
      await upsertBotDraft(env, telegramUserId, 'settings', 'email');
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSettingsEmailPrompt(env, telegramUserId, chatId);
      return json({ ok: true });
    }

    if (action === 'password') {
      const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
      const emailIdentity = telegramIdentity ? await findEmailIdentityByUserId(env, telegramIdentity.user_id) : null;
      if (!emailIdentity) {
        await answerUserCallbackQuery(env, callbackQuery.id, 'Email not found').catch(() => {});
        await clearBotDraft(env, telegramUserId);
        await sendUserBotSettings(env, telegramUserId, chatId, 'Сначала добавь email на сайте');
        return json({ ok: true });
      }
      const hasPassword = Boolean(emailIdentity?.password_hash);
      await upsertBotDraft(env, telegramUserId, 'settings', hasPassword ? 'password-current' : 'password-new');
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSettingsPasswordPrompt(env, telegramUserId, chatId, hasPassword, hasPassword ? 'current' : 'new');
      return json({ ok: true });
    }

    if (action === 'avatar') {
      await upsertBotDraft(env, telegramUserId, 'settings', 'avatar');
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSettingsAvatarPrompt(env, telegramUserId, chatId);
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
      await sendUserBotMyAds(env, telegramUserId, chatId, 'Объявление удалено');
      return json({ ok: true });
    }

    const ad = await getOwnedAdForTelegramUser(env, telegramUserId, adId);
    if (!ad) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSingleAd(env, telegramUserId, chatId, ad);
    return json({ ok: true });
  }

  if (data.startsWith(`${USER_BOT_DRAFT_PREFIX}category:`)) {
    const category = data.slice(`${USER_BOT_DRAFT_PREFIX}category:`.length);
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotDraftAction(env, telegramUserId, chatId, 'category', category, ctx);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_DRAFT_TYPE_PREFIX)) {
    const adType = data.slice(USER_BOT_DRAFT_TYPE_PREFIX.length);
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await handleUserBotDraftAction(env, telegramUserId, chatId, 'type', adType, ctx);
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
      env,
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

async function handleAdminAdStatusRoute(
  request: Request,
  env: Env,
  id: string,
  status: 'published' | 'rejected'
): Promise<Response> {
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

  const response = await updateAdStatus(env, String(numericId), status);
  if (response.status === 404) {
    return text('Not Found', 404);
  }

  return redirectWithHeaders(
    buildAdminUrl('ads', page, status === 'published' ? 'Объявление опубликовано' : 'Объявление отклонено')
  );
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

  const { title, body, contact, category, type, image } = await parseAdForm(request);

  if (!title || !body) {
    return renderEditPage(env, currentUser, ad, 'Заполни заголовок и текст', buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', page));
  }

  let newImage: CompressedAdImageUpload | null = null;
  try {
    const normalizedCategory = normalizeCategory(category);
    const normalizedType = normalizeAdType(type);
    if (image) {
      newImage = await readImageUpload(image);
      if (newImage) {
        await putCompressedAdImage(env, newImage);
      }
    }

    const oldImageKey = ad.image_key;
    await env.DB.prepare(
      `
        UPDATE ads
        SET title = ?,
            body = ?,
            contact = ?,
            category = ?,
            type = ?,
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
        contact || null,
        normalizedCategory,
        normalizedType,
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
  let payload: { title?: string; body?: string; category?: string; type?: string };

  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = String(payload.title || '').trim();
  const body = String(payload.body || '').trim();
  const category = String(payload.category || '').trim();
  const type = String(payload.type || '').trim();

  if (!title || !body) {
    return json({ error: 'title and body are required' }, { status: 400 });
  }

  const ad = await createAd(env, ctx, title, body, null, category, type, null);
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

  const { title, body, contact, category, type, image } = await parseAdForm(request);

  if (!title || !body) {
    return renderNewPage(currentUser, 'Заполни заголовок и текст');
  }

  try {
    await createAd(env, ctx, title, body, contact, category, type, currentUser.id, image);
  } catch (error) {
    console.error('Failed to create ad with image', error);
    return renderNewPage(currentUser, 'Не удалось загрузить картинку');
  }
  return redirect('/my?message=Объявление создано');
}

async function handleCategoryGet(request: Request, env: Env, slug: string, currentUser: CurrentUser | null = null): Promise<Response> {
  const category = CATEGORIES.find((item) => item.slug === slug);
  if (!category) {
    return renderNotFoundPage(currentUser);
  }

  const typeFilter = new URL(request.url).searchParams.get('type');
  const normalizedTypeFilter = typeFilter ? normalizeAdType(typeFilter) : null;
  const ads = normalizedTypeFilter
    ? await listPublishedAdsByCategoryAndType(env, slug, normalizedTypeFilter)
    : await listPublishedAdsByCategory(env, slug);
  return renderCategoryPage(env, slug, ads, currentUser, normalizedTypeFilter);
}

async function handleAdGet(
  env: Env,
  id: string,
  currentUser: CurrentUser | null = null,
  message: string | null = null
): Promise<Response> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const ad = await getPublishedAdCardById(env, numericId);
  if (!ad) {
    return renderNotFoundPage(currentUser);
  }

  const canMessageAuthor = Boolean(ad.owner_user_id && (await findTelegramIdentityByUserId(env, ad.owner_user_id)));
  return renderPublicAdPage(env, ad, currentUser, canMessageAuthor, message);
}

async function handleAdMessagePost(
  request: Request,
  env: Env,
  id: string,
  currentUser: CurrentUser | null
): Promise<Response> {
  if (!currentUser) {
    return redirect(`/login?next=${encodeURIComponent(`/ad/${id}`)}`);
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return text('Not Found', 404);
  }

  const ad = await getPublishedAdCardById(env, numericId);
  if (!ad) {
    return renderNotFoundPage(currentUser);
  }

  const canMessageAuthor = Boolean(ad.owner_user_id && (await findTelegramIdentityByUserId(env, ad.owner_user_id)));

  if (!ad.owner_user_id) {
    return renderPublicAdPage(env, ad, currentUser, canMessageAuthor, 'У объявления не указан автор');
  }

  if (ad.owner_user_id === currentUser.id) {
    return renderPublicAdPage(env, ad, currentUser, canMessageAuthor, 'Нельзя написать самому себе');
  }

  const form = await request.formData();
  const message = String(form.get('message') || '').trim();
  if (!message) {
    return renderPublicAdPage(env, ad, currentUser, canMessageAuthor, 'Введите текст сообщения');
  }

  if (message.length > 1000) {
    return renderPublicAdPage(env, ad, currentUser, canMessageAuthor, 'Сообщение слишком длинное');
  }

  const telegramIdentity = await findTelegramIdentityByUserId(env, ad.owner_user_id);
  const chatId = Number(telegramIdentity?.provider_user_id || '');
  if (!telegramIdentity?.provider_user_id || !Number.isInteger(chatId) || chatId <= 0) {
    return renderPublicAdPage(env, ad, currentUser, false, 'У автора не привязан Telegram');
  }

  try {
    await sendChatMessage(
      env,
      currentUser.id,
      ad.owner_user_id,
      ad.id,
      message,
      currentUser.login
    );
  } catch (error) {
    console.error('Failed to send ad message to author', error);
    return renderPublicAdPage(env, ad, currentUser, canMessageAuthor, 'Не удалось отправить сообщение');
  }

  return redirectWithMessage(`/ad/${ad.id}`, 'Сообщение отправлено');
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
    await ensureAdContactColumn(env);
    await ensureAdTypeColumn(env);
    await ensureBotDraftColumns(env);
    await ensureChatTables(env);
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

    if (path.startsWith('/admin/publish/')) {
      return handleAdminAdStatusRoute(request, env, path.slice('/admin/publish/'.length), 'published');
    }

    if (path.startsWith('/admin/reject/')) {
      return handleAdminAdStatusRoute(request, env, path.slice('/admin/reject/'.length), 'rejected');
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
      return handleCategoryGet(request, env, path.slice('/category/'.length), await getCurrentUser(request, env));
    }

    if (path.startsWith('/ad/') && path.endsWith('/message')) {
      if (request.method === 'POST') {
        return handleAdMessagePost(request, env, path.slice('/ad/'.length, -'/message'.length), await getCurrentUser(request, env));
      }
      return text('Method Not Allowed', 405);
    }

    if (path.startsWith('/ad/') && request.method === 'GET') {
      return handleAdGet(env, path.slice('/ad/'.length), await getCurrentUser(request, env), url.searchParams.get('message'));
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
