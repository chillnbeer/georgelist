import {
  CITIES,
  CITY_COOKIE_NAME,
  CITY_DEFAULT_SLUG,
  CITY_LABELS,
  CITY_MAP_CENTERS,
  buildCityCookie,
  buildCityLocation,
  cityMapCenter,
  cityLabel,
  normalizeCity,
  type CitySlug,
} from './cities';
import {
  getConversationById,
  getConversationForUsers,
  getOrCreateConversation,
  listAllConversationMessages,
  listConversationMessages,
  listConversationsForUser,
  markConversationMessagesRead,
  normalizeConversationUserIds,
  type ChatMessageRow,
  type ChatThreadListRow,
  type ChatThreadRow,
} from './chat';
import { clearChatNotification, sendOrUpdateChatNotification, storeConversationMessage } from './bot-chat';
import {
  AD_TYPES,
  CATEGORIES,
  buildCategoryRows,
  buildTypeRows,
  categoryLabel,
  normalizeAdType,
  normalizeCategory,
  type AdTypeSlug,
  type CategorySlug,
  typeLabel,
} from './ad-taxonomy';
import {
  buildAdApproximateLocationSummary,
  buildAdLocationSummary,
  formatLocationRadius,
  hasAdLocation,
  normalizeLocationRadius,
} from './ad-location';
import {
  ADMIN_PAGE_SIZE,
  buildAdminActionUrl,
  buildAdminUrl,
  countAllAds,
  countAllUsers,
  listAdminAdsPage,
  listAdminUsersPage,
  parseAdminPage,
  parseAdminSection,
  type AdminPagination,
  type AdminSection,
  type AdminUserRow,
} from './admin';
import {
  handleAdminBotCallback,
  handleAdminBotText,
  isAdminTelegramChat,
  type AdminBotDeps,
} from './admin-bot';
import {
  AD_BODY_MAX_LENGTH,
  AD_CONTACT_MAX_LENGTH,
  AD_IMAGES_MAX_COUNT,
  AD_LOCATION_DEFAULT_RADIUS,
  AD_LOCATION_LABEL_MAX_LENGTH,
  AD_LOCATION_RADIUS_OPTIONS,
  AD_MESSAGE_MAX_LENGTH,
  AD_SELECT_COLUMNS,
  AD_TITLE_MAX_LENGTH,
  ADS_HOME_LIMIT,
  ADS_SEARCH_LIMIT,
  ADS_USER_LIMIT,
  ADMIN_BOT_MENU_HOME,
  DUMMY_PASSWORD_HASH,
  SESSION_MAX_AGE_SECONDS,
  TELEGRAM_AUTH_COOKIE_MAX_AGE_SECONDS,
  TELEGRAM_AUTH_COOKIE_NAME,
  TELEGRAM_AUTH_MAX_AGE_SECONDS,
  USER_AVATAR_MAX_BYTES,
  USER_BOT_BROWSE_SECTIONS_PREFIX,
  USER_BOT_CANCEL_FLOW,
  USER_BOT_CHAT_DOWNLOAD_PREFIX,
  USER_BOT_CHAT_HIDE_PREFIX,
  USER_BOT_CHAT_LIST,
  USER_BOT_CHAT_PREFIX,
  USER_BOT_CHAT_START_PREFIX,
  USER_BOT_DELETE_PREFIX,
  USER_BOT_DRAFT_CANCEL,
  USER_BOT_DRAFT_PREFIX,
  USER_BOT_DRAFT_SEND,
  USER_BOT_DRAFT_TYPE_PREFIX,
  USER_BOT_EDIT_DRAFT_CANCEL,
  USER_BOT_EDIT_DRAFT_SAVE,
  USER_BOT_MENU_CREATE,
  USER_BOT_MENU_DELETE,
  USER_BOT_MENU_EDIT,
  USER_BOT_MENU_HOME,
  USER_BOT_MENU_MY,
  USER_BOT_MENU_MY_AD,
  USER_BOT_MENU_SEARCH,
  USER_BOT_MENU_SECTIONS,
  USER_BOT_MENU_SETTINGS,
  USER_BOT_SEARCH_AD_PREFIX,
  USER_BOT_SEARCH_MORE_PREFIX,
  USER_BOT_SEARCH_RESULTS,
  USER_BOT_SECTION_AD_PREFIX,
  USER_BOT_SECTION_MORE_PREFIX,
  USER_BOT_SECTION_PREFIX,
  USER_BOT_SETTINGS_PREFIX,
  USER_DISPLAY_NAME_MAX_LENGTH,
} from './constants';
import { html, json, methodNotAllowed, redirect, redirectWithHeaders, redirectWithMessage, text } from './http';
import {
  effectiveAdImages,
  getAdById,
  getPublicUserByLogin,
  getPublishedAdCardById,
  isMissingAdImagesTableError,
  listAdImagesByAdId,
  listPendingAds,
  listPublishedAds,
  listPublishedAdsByCategory,
  listPublishedAdsByCategoryAndType,
  listPublishedAdsByUser,
  searchPublishedAds,
} from './db';
import {
  deleteAdImage,
  deleteAvatarImage,
  getImageExtension,
  getImageMimeTypeFromPath,
  isImageMimeType,
  normalizeMimeType,
  putAdImage,
  putCompressedAdImage,
  putMediaObject,
  readAvatarUpload,
  readImageUploads,
} from './image';
import type {
  AdCardRow,
  AdForm,
  AdImageRow,
  AdImageUpload,
  AdLocationInput,
  AdRow,
  BotDraftRow,
  CompressedAdImageUpload,
  CurrentUser,
  Env,
  PublicAdCardRow,
  PublicUserRow,
  SessionRow,
  TelegramAuthPayload,
  TelegramUpdate,
  UserIdentityRow,
} from './types';
import {
  base64UrlDecode,
  base64UrlEncode,
  buildSessionCookie,
  clearSessionCookie,
  constantTimeEqual,
  formatSqliteTimestamp,
  generateSessionToken,
  getCookieValue,
  hashPassword,
  hashSessionToken,
  hexToBytes,
  hmacSha256Hex,
  htmlEscape,
  isFileLike,
  sanitizeNextPath,
  sha256Bytes,
  truncateText,
  verifyPassword,
} from './utils';
import {
  deleteTelegramMessage,
  getTelegramUserBotToken,
  getTelegramUserBotUsername,
  sendUserBotDocument,
  userBotApi,
} from './user-bot-api';
import { answerUserCallbackQuery, showUserBotPhotoScreen, showUserBotScreen } from './user-bot-screen';
import {
  buildChatScreenTitle,
  buildConversationExportFilename,
  buildConversationHistoryExport,
  userBotCancelHomeMarkup,
  userBotCancelSettingsMarkup,
  userBotCategoryMarkup,
  userBotChatMarkup,
  userBotChatsMarkup,
  userBotCityMarkup,
  userBotConfirmMarkup,
  userBotEditConfirmMarkup,
  userBotIncomingChatMarkup,
  userBotMenuMarkup,
  userBotMyAdsMarkup,
  userBotSettingsMarkup,
  userBotSingleAdMarkup,
  userBotTypeMarkup,
} from './user-bot-ui';
export { buildConversationExportFilename, buildConversationHistoryExport } from './user-bot-ui';
import { clearBotDraft, getBotDraft, upsertBotDraft } from './bot-drafts';
import {
  buildUserBotAdListText,
  sendUserBotBrowseSection,
  sendUserBotSearchAdDetail,
  sendUserBotSearchPrompt,
  sendUserBotSearchResults,
  sendUserBotSectionAdDetail,
  sendUserBotSectionAds,
  sendUserBotSections,
} from './user-bot-browse';
import {
  findEmailIdentity,
  findEmailIdentityByUserId,
  findTelegramIdentity,
  findTelegramIdentityByUserId,
  findUserById,
  findUserByLogin,
  getTelegramUserCity,
  isValidEmail,
  isValidLogin,
  updateUserCity,
} from './user-identity';
import { buildMediaUrl, buildPublicSiteUrl } from './site-url';

let cachedEnsureAdImageColumnsPromise: Promise<void> | null = null;
let cachedEnsureAdImagesTablePromise: Promise<void> | null = null;
let cachedEnsureUserAvatarColumnsPromise: Promise<void> | null = null;
let cachedEnsureAdContactColumnPromise: Promise<void> | null = null;
let cachedEnsureAdCityColumnPromise: Promise<void> | null = null;
let cachedEnsureAdLocationColumnsPromise: Promise<void> | null = null;
let cachedEnsureUserCityColumnPromise: Promise<void> | null = null;
let cachedEnsureAdTypeColumnPromise: Promise<void> | null = null;
let cachedEnsureBotDraftColumnsPromise: Promise<void> | null = null;
let cachedEnsureChatTablesPromise: Promise<void> | null = null;
let cachedEnsureChatMessageReadColumnPromise: Promise<void> | null = null;
const NOOP_EXECUTION_CONTEXT = {
  waitUntil(): void {},
  passThroughOnException(): void {},
} as unknown as ExecutionContext;

const adminBotDeps: AdminBotDeps = {
  telegramApi,
  buildMediaUrl,
  buildAdLocationSummary,
  countAllAds,
  countAllUsers,
  listAdminAdsPage,
  listAdminUsersPage,
  getAdById,
  findUserById,
  getBotDraft,
  upsertBotDraft,
  clearBotDraft,
  deleteAdminAd,
  promoteAdminUser,
  demoteAdminUser,
  deleteAdminUser,
  updateAdStatus,
  notifyAdOwnerStatusChange,
  sendTelegramMessage,
};

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

function verifyTelegramWebhookSecret(request: Request, secret: string | undefined): boolean {
  if (!secret) return true;
  const header = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
  return header === secret;
}

function buildTelegramAuthCallbackUrl(request: Request, mode: 'login' | 'link', nextPath: string | null = null): string {
  const url = new URL('/telegram/auth', request.url);
  url.searchParams.set('mode', mode);
  if (nextPath) {
    url.searchParams.set('next', nextPath);
  }

  return url.toString();
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

function getCurrentCityFromRequest(request: Request, currentUser: CurrentUser | null = null): CitySlug {
  const cookieValue = getCookieValue(request, CITY_COOKIE_NAME);
  const cookieCity = normalizeCity(cookieValue);
  if (cookieCity !== CITY_DEFAULT_SLUG || cookieValue) {
    return cookieCity;
  }

  return normalizeCity(currentUser?.city);
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

function renderCityPicker(currentCity: string | null = null, nextPath = '/'): string {
  const citySlug = normalizeCity(currentCity);
  const nextValue = htmlEscape(nextPath || '/');
  const currentLabel = htmlEscape(cityLabel(citySlug));

  return `<details class="city-picker">
  <summary>${currentLabel} <span aria-hidden="true">▼</span></summary>
  <div class="city-picker-panel">
    <div class="city-picker-title">Выбери город</div>
    <div class="city-picker-list">
      ${CITIES.map(
        (city) => `<form method="post" action="/city">
  <input type="hidden" name="next" value="${nextValue}" />
  <input type="hidden" name="city" value="${htmlEscape(city.slug)}" />
  <button type="submit"${city.slug === citySlug ? ' class="active"' : ''}>${htmlEscape(city.label)}</button>
</form>`
      ).join('')}
    </div>
    <div class="city-picker-foot"><a href="/city?next=${nextValue}">все города</a></div>
  </div>
</details>`;
}

function parseOptionalNumberField(value: string | File | null): number | null {
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

function parseOptionalTextField(value: string | File | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function renderLocationBadge(
  ad: Pick<AdRow | AdCardRow | PublicAdCardRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>
): string {
  if (!hasAdLocation(ad)) {
    return '';
  }

  const summary = buildAdLocationSummary(ad as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>);
  return `<span class="badge badge-location">${htmlEscape(summary ? `Зона встречи · ${summary}` : 'Есть зона встречи')}</span>`;
}

function renderLocationRadiusOptions(selectedRadius: number | null | undefined): string {
  const normalized = normalizeLocationRadius(selectedRadius) ?? AD_LOCATION_DEFAULT_RADIUS;
  return AD_LOCATION_RADIUS_OPTIONS.map((radius) => {
    const selected = radius === normalized ? ' selected' : '';
    return `<option value="${radius}"${selected}>${htmlEscape(formatLocationRadius(radius))}</option>`;
  }).join('');
}

function renderLocationEditor(location: {
  location_lat: number | null;
  location_lng: number | null;
  location_radius_meters: number | null;
  location_label: string | null;
}, currentCity: string | null, prefix: string): string {
  const center = cityMapCenter(currentCity);
  const hasLocation = typeof location.location_lat === 'number'
    && Number.isFinite(location.location_lat)
    && typeof location.location_lng === 'number'
    && Number.isFinite(location.location_lng);
  const latValue = hasLocation ? String(location.location_lat) : '';
  const lngValue = hasLocation ? String(location.location_lng) : '';
  const statusText = hasLocation
    ? `Выбрана зона: ${formatLocationRadius(location.location_radius_meters)}`
    : 'Кликни по карте, чтобы выбрать примерную зону встречи';
  const summary = buildAdLocationSummary(location as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>);

  return `<div class="location-picker" data-location-picker data-default-lat="${center.lat}" data-default-lng="${center.lng}">
  <div class="location-picker-header">
    <div>
      <strong>Зона встречи</strong>
      <div class="location-picker-help">Поставь примерный центр и радиус, без точного адреса.</div>
    </div>
    ${summary ? `<div class="location-picker-summary">${htmlEscape(summary)}</div>` : '<div class="location-picker-summary">Зона не задана</div>'}
  </div>
  <div class="location-picker-fields">
    <div>
      <label for="${htmlEscape(prefix)}-radius">Радиус</label>
      <select id="${htmlEscape(prefix)}-radius" name="location_radius_meters">
        ${renderLocationRadiusOptions(location.location_radius_meters)}
      </select>
    </div>
  </div>
  <div class="location-picker-search">
    <label for="${htmlEscape(prefix)}-query">Найти адрес</label>
    <div class="location-picker-search-row">
      <input id="${htmlEscape(prefix)}-query" type="search" placeholder="Например, Ленина 1, Екатеринбург" autocomplete="off" />
      <button type="button" data-location-search>Найти</button>
    </div>
    <div class="location-picker-results" data-location-results></div>
  </div>
  <input type="hidden" name="location_lat" value="${htmlEscape(latValue)}" />
  <input type="hidden" name="location_lng" value="${htmlEscape(lngValue)}" />
  <div class="location-picker-status" data-location-status>${htmlEscape(statusText)}</div>
  <div class="location-picker-map" data-location-map></div>
  <div class="location-picker-actions">
    <button type="button" data-location-clear>Очистить зону</button>
  </div>
</div>
${renderLocationPickerScript()}`;
}

function renderLocationViewer(location: {
  location_lat: number | null;
  location_lng: number | null;
  location_radius_meters: number | null;
  location_label: string | null;
}, currentCity: string | null): string {
  if (!hasAdLocation(location)) {
    return '';
  }

  const center = cityMapCenter(currentCity);
  const summary = buildAdApproximateLocationSummary(location as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters'>);

  return `<div class="ad-page-location">
  <div class="ad-page-location-header">
    <strong>Зона встречи</strong>
    <div class="ad-page-location-summary">${htmlEscape(summary || 'Есть зона встречи')}</div>
    <div class="ad-page-location-note">Показываем примерную зону, а не точный адрес.</div>
  </div>
  <div class="location-picker location-picker-view" data-location-picker data-location-mode="view" data-default-lat="${center.lat}" data-default-lng="${center.lng}" data-location-radius="${htmlEscape(String(location.location_radius_meters || AD_LOCATION_DEFAULT_RADIUS))}">
    <input type="hidden" name="location_lat" value="${htmlEscape(String(location.location_lat))}" />
    <input type="hidden" name="location_lng" value="${htmlEscape(String(location.location_lng))}" />
    <input type="hidden" name="location_radius_meters" value="${htmlEscape(String(location.location_radius_meters || AD_LOCATION_DEFAULT_RADIUS))}" />
    <div class="location-picker-status" data-location-status>Показываем только примерную зону</div>
    <div class="location-picker-map" data-location-map></div>
  </div>
</div>
${renderLocationPickerScript()}`;
}

function renderLocationPickerScript(): string {
  return `<script>
(function () {
  var radiusLabels = {
    500: '500 м',
    1000: '1 км',
    3000: '3 км',
    5000: '5 км'
  };
  var cityCenters = ${JSON.stringify(CITY_MAP_CENTERS)};

  function formatRadius(value) {
    return radiusLabels[value] || 'зона встречи';
  }

  function parseNumber(value) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function initPicker(root) {
    if (!window.L) {
      return;
    }

    var mapEl = root.querySelector('[data-location-map]');
    var latInput = root.querySelector('input[name="location_lat"]');
    var lngInput = root.querySelector('input[name="location_lng"]');
    var radiusSelect = root.querySelector('select[name="location_radius_meters"]');
    var queryInput = root.querySelector('[id$="-query"]');
    var searchButton = root.querySelector('[data-location-search]');
    var resultsEl = root.querySelector('[data-location-results]');
    var statusEl = root.querySelector('[data-location-status]');
    var clearButton = root.querySelector('[data-location-clear]');
    var citySelect = root.querySelector('select[name="city"]');
    var isViewMode = root.getAttribute('data-location-mode') === 'view';
    var defaultLat = parseNumber(root.getAttribute('data-default-lat')) || 56.8389;
    var defaultLng = parseNumber(root.getAttribute('data-default-lng')) || 60.6057;
    var currentRadius = parseNumber(radiusSelect && radiusSelect.value) || parseNumber(root.getAttribute('data-location-radius')) || 1000;
    var marker = null;
    var circle = null;
    var map = window.L.map(mapEl, { scrollWheelZoom: false, zoomControl: true });
    if (map.attributionControl) {
      map.attributionControl.setPrefix(false);
    }

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    function hasLocation() {
      return parseNumber(latInput.value) !== null && parseNumber(lngInput.value) !== null;
    }

    function readCenter() {
      if (!citySelect || !cityCenters[citySelect.value]) {
        return { lat: defaultLat, lng: defaultLng };
      }
      return cityCenters[citySelect.value];
    }

    function updateStatus() {
      if (isViewMode) {
        statusEl.textContent = hasLocation()
          ? 'Показываем только примерную зону'
          : 'Зона встречи не задана';
        return;
      }
      if (hasLocation()) {
        statusEl.textContent = 'Выбрана зона: ' + formatRadius(currentRadius);
      } else {
        statusEl.textContent = 'Кликни по карте, чтобы выбрать примерную зону встречи';
      }
    }

    function renderResults(items, message) {
      if (!resultsEl) {
        return;
      }

      resultsEl.innerHTML = '';

      if (message) {
        var messageNode = document.createElement('div');
        messageNode.className = 'empty';
        messageNode.textContent = message;
        resultsEl.appendChild(messageNode);
      }

      items.forEach(function (item) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'location-picker-result';
        button.textContent = item.label;

        var small = document.createElement('small');
        small.textContent = item.displayName;
        button.appendChild(small);

        button.addEventListener('click', function () {
          setLocation(item.lat, item.lng, true);
          if (queryInput) {
            queryInput.value = item.displayName;
          }
          renderResults([], 'Адрес выбран');
          updateStatus();
        });

        resultsEl.appendChild(button);
      });
    }

    async function searchAddress() {
      if (!queryInput) {
        return;
      }

      var query = queryInput.value.trim();
      if (!query) {
        renderResults([], 'Введите адрес для поиска');
        return;
      }

      var cityValue = citySelect && citySelect.value ? citySelect.value : '';
      renderResults([], 'Ищем адрес...');

      try {
        var url = new URL('/api/location-search', window.location.origin);
        url.searchParams.set('q', query);
        if (cityValue) {
          url.searchParams.set('city', cityValue);
        }

        var response = await fetch(url.toString(), {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('search failed');
        }

        var payload = await response.json();
        var items = Array.isArray(payload?.results)
          ? payload.results.map(function (item) {
              return {
                label: item.label,
                displayName: item.display_name,
                lat: Number(item.lat),
                lng: Number(item.lng),
              };
            }).filter(function (item) {
              return Number.isFinite(item.lat) && Number.isFinite(item.lng) && item.label;
            })
          : [];

        if (!items.length) {
          renderResults([], 'Адрес не найден');
          return;
        }

        renderResults(items, 'Найдено: ' + items.length);
        if (items.length === 1) {
          setLocation(items[0].lat, items[0].lng, true);
          if (queryInput) {
            queryInput.value = items[0].displayName;
          }
          updateStatus();
        }
      } catch (error) {
        console.error('Failed to search address', error);
        renderResults([], 'Не удалось найти адрес');
      }
    }

    function syncOverlay(lat, lng) {
      var latLng = [lat, lng];
      if (!isViewMode) {
        if (!marker) {
          marker = window.L.marker(latLng).addTo(map);
        } else {
          marker.setLatLng(latLng);
        }
      }

      if (!circle) {
        circle = window.L.circle(latLng, {
          radius: currentRadius,
          color: '#2563eb',
          weight: 2,
          fillColor: '#60a5fa',
          fillOpacity: 0.18
        }).addTo(map);
      } else {
        circle.setLatLng(latLng);
        circle.setRadius(currentRadius);
      }
    }

    function setLocation(lat, lng, focus) {
      latInput.value = String(lat);
      lngInput.value = String(lng);
      syncOverlay(lat, lng);
      if (focus) {
        map.setView([lat, lng], 13);
      }
      updateStatus();
    }

    function clearLocation() {
      latInput.value = '';
      lngInput.value = '';
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
      if (circle) {
        map.removeLayer(circle);
        circle = null;
      }
      var center = readCenter();
      map.setView([center.lat, center.lng], 11);
      updateStatus();
    }

    var existingLat = parseNumber(latInput.value);
    var existingLng = parseNumber(lngInput.value);
    if (radiusSelect) {
      currentRadius = parseNumber(radiusSelect.value) || 1000;
    }

    map.setView(
      existingLat !== null && existingLng !== null ? [existingLat, existingLng] : [defaultLat, defaultLng],
      existingLat !== null && existingLng !== null ? 13 : 11
    );

    if (existingLat !== null && existingLng !== null) {
      syncOverlay(existingLat, existingLng);
    }

    if (!isViewMode) {
      map.on('click', function (event) {
        setLocation(event.latlng.lat, event.latlng.lng, true);
      });
    }

    if (radiusSelect) {
      radiusSelect.addEventListener('change', function () {
        currentRadius = parseNumber(radiusSelect.value) || 1000;
        if (circle) {
          circle.setRadius(currentRadius);
        }
        updateStatus();
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', clearLocation);
    }

    if (searchButton) {
      searchButton.addEventListener('click', function () {
        searchAddress();
      });
    }

    if (queryInput) {
      queryInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          searchAddress();
        }
      });
    }

    if (citySelect) {
      citySelect.addEventListener('change', function () {
        if (hasLocation()) {
          return;
        }
        var center = readCenter();
        map.setView([center.lat, center.lng], 11);
      });
    }

    updateStatus();
    if (!isViewMode) {
      renderResults([], '');
    }
  }

  function init() {
    document.querySelectorAll('[data-location-picker]').forEach(function (root) {
      if (!root.querySelector('[data-location-map]')) {
        return;
      }
      initPicker(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>`;
}

function renderLeafletAssets(): string {
  return `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script defer src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>`;
}

function nav(currentUser: CurrentUser | null = null, city: string | null = null, nextPath = '/'): string {
  const cityPicker = renderCityPicker(city, nextPath);
  const adminLink = currentUser && currentUser.role === 'admin' ? ' <a href="/admin">админка</a>' : '';
  const authLinks = currentUser
    ? `<a href="/u/${encodeURIComponent(currentUser.login)}">мой профиль</a> <a href="/settings">настройки</a>${adminLink} <form method="post" action="/logout" style="display:inline"><button class="link-button" type="submit">выйти</button></form>`
    : `<a href="/login">войти</a> <a href="/register">зарегистрироваться</a>`;

  return `<div class="nav"><div class="nav-links"><a href="/new">создать объявление</a> <a href="/about">о проекте</a></div>${cityPicker}<div class="nav-auth">${authLinks}</div></div>`;
}

function shell(title: string, body: string, currentUser: CurrentUser | null = null, status = 200, extraHead = ''): Response {
  return html(`<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${htmlEscape(title)}</title>
  ${extraHead}
  <style>
    body {
      margin: 0;
      padding: 10px;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .page {
      max-width: 980px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 8px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 33px;
      font-weight: 400;
    }
    .site-title {
      color: #000;
      text-decoration: none;
    }
    .site-title:hover {
      text-decoration: underline;
    }
    h2 {
      margin: 14px 0 6px;
      font-size: 16px;
      font-weight: 700;
    }
    p { margin: 0 0 10px; }
    .nav {
      margin: 0 0 10px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
    }
    .nav-links,
    .nav-auth {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px 14px;
    }
    .nav-auth {
      margin-left: auto;
    }
    .nav form {
      display: inline;
      margin: 0;
    }
    .city-picker {
      position: relative;
      display: inline-block;
      min-width: 0;
    }
    .city-picker summary {
      list-style: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border: 1px solid #bbb;
      border-radius: 999px;
      background: #f6f6f6;
      user-select: none;
      white-space: nowrap;
    }
    .city-picker summary::-webkit-details-marker {
      display: none;
    }
    .city-picker[open] summary {
      background: #ececec;
    }
    .city-picker-panel {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      z-index: 20;
      width: min(320px, calc(100vw - 24px));
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    }
    .city-picker-title {
      margin: 0 0 8px;
      font-size: 12px;
      color: #555;
    }
    .city-picker-list {
      display: grid;
      gap: 6px;
    }
    .city-picker-list form {
      display: block;
      margin: 0;
    }
    .city-picker-list button {
      width: 100%;
      text-align: left;
      margin: 0;
      border-radius: 8px;
      background: #f7f7f7;
    }
    .city-picker-list button.active {
      border-color: #777;
      background: #ebebeb;
      font-weight: 700;
    }
    .city-picker-foot {
      margin-top: 8px;
      font-size: 12px;
    }
    .badge-location {
      background: #e8f0ff;
      color: #234;
    }
    .reading-column {
      max-width: 620px;
    }
    .reading-column p {
      margin: 0 0 12px;
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
      margin: 0 0 8px;
      padding: 6px 8px;
      border: 1px solid #bbb;
      background: #fff;
      color: #000;
      font: inherit;
      box-sizing: border-box;
    }
    textarea {
      min-height: 120px;
      resize: vertical;
    }
    button {
      margin-top: 8px;
      border: 1px solid #999;
      background: #f5f5f5;
      color: #000;
      padding: 6px 12px;
      font: inherit;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.7;
      cursor: wait;
    }
    .section { margin: 0 0 14px; }
    .home-content {
      margin: 14px 0;
    }
    .categories-list {
      font-size: 13px;
      line-height: 1.6;
      color: #333;
    }
    .ad-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .ad-card {
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 2px;
      overflow: hidden;
      font-size: 13px;
    }
    .card-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      background: #f5f5f5;
    }
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .card-image-empty {
      width: 100%;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      color: #999;
      font-size: 12px;
    }
    .card-content {
      padding: 8px;
    }
    .card-title {
      display: block;
      margin-bottom: 4px;
      line-height: 1.3;
      font-weight: normal;
    }
    .card-meta {
      color: #666;
      font-size: 12px;
    }
    .ads-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .ad-row {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      line-height: 1.5;
    }
    .ad-row-date {
      color: #666;
      font-size: 12px;
      margin-left: 8px;
    }
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
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }
    .category-item {
      display: block;
      padding: 12px;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #fff;
      text-align: center;
      text-decoration: none;
      color: #0066cc;
      font-size: 14px;
      transition: all 0.2s;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
    }
    .category-item:hover {
      border-color: #0066cc;
      background: #f5f9ff;
      box-shadow: 0 2px 4px rgba(0, 102, 204, 0.1);
    }
    .ad-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-top: 8px;
    }
    .title {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 700;
    }
    .meta {
      margin: 0 0 4px;
      color: #555;
      font-size: 13px;
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
    .ad-page-simple {
      max-width: 600px;
      line-height: 1.6;
    }
    .ad-page-simple h2 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: bold;
    }
    .ad-meta-line {
      color: #666;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .ad-page-craigslist {
      max-width: 900px;
    }
    .ad-page-craigslist h2 {
      font-size: 20px;
      font-weight: normal;
    }
    .ad-page {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 290px;
      gap: 14px;
      align-items: start;
    }
    .ad-page-main {
      min-width: 0;
    }
    .ad-page-aside {
      min-width: 0;
      display: grid;
      gap: 10px;
      align-content: start;
    }
    .ad-page-media {
      border: 1px solid #ddd;
      border-radius: 2px;
      overflow: hidden;
      background: #f5f5f5;
      margin: 0 0 10px;
    }
    .ad-page-media img {
      width: 100%;
      max-height: min(70vh, 680px);
      display: block;
      object-fit: contain;
    }
    .ad-page-media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 8px;
      margin: 0 0 10px;
    }
    .ad-page-media-grid img {
      width: 100%;
      max-height: 320px;
      display: block;
      object-fit: cover;
      border: 1px solid #ddd;
      border-radius: 2px;
      background: #f5f5f5;
    }
    .ad-gallery {
      display: grid;
      gap: 8px;
      margin: 0 0 10px;
    }
    .ad-gallery-main {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 6px;
      overflow: hidden;
      background: #f5f5f5;
      height: min(55vh, 520px);
    }
    .ad-gallery-main img {
      width: 100%;
      max-height: min(55vh, 520px);
      display: block;
      object-fit: contain;
    }
    .ad-gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      border-radius: 999px;
      border: 1px solid rgba(0, 0, 0, 0.25);
      background: rgba(255, 255, 255, 0.9);
      color: #222;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      line-height: 1;
      margin: 0;
      padding: 0;
      cursor: pointer;
      z-index: 2;
    }
    .ad-gallery-nav[disabled] {
      opacity: 0.4;
      cursor: default;
    }
    .ad-gallery-nav-prev {
      left: 8px;
    }
    .ad-gallery-nav-next {
      right: 8px;
    }
    .ad-gallery-meta {
      font-size: 12px;
      color: #667;
      margin-top: 6px;
    }
    .ad-gallery-thumbs {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
      gap: 8px;
    }
    .ad-gallery-thumb {
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      padding: 0;
      margin: 0;
      cursor: pointer;
    }
    .ad-gallery-thumb.is-active {
      border-color: #4d79ff;
    }
    .ad-gallery-thumbs img {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #f5f5f5;
      display: block;
    }
    .edit-image-list {
      display: grid;
      gap: 10px;
      margin: 6px 0 12px;
    }
    .edit-image-item {
      border: 1px solid #ddd;
      border-radius: 10px;
      padding: 8px;
      display: grid;
      gap: 8px;
      background: #fafafa;
      max-width: 560px;
    }
    .edit-image-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
    .edit-image-controls label {
      margin: 0;
      display: inline-flex;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      color: #334;
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
      margin: 0 0 8px;
      font-size: 24px;
      line-height: 1.2;
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
      margin-bottom: 10px;
    }
    .badge {
      background: #eee;
      border-radius: 3px;
      padding: 2px 8px;
      font-size: 12px;
      color: #555;
      margin-right: 8px;
    }
    .ad-page-body {
      white-space: pre-wrap;
      line-height: 1.45;
      margin-bottom: 0;
      font-size: 14px;
    }
    .ad-page-contact {
      margin-bottom: 0;
      padding: 8px 10px;
      background: #f7f7f7;
      border: 1px solid #e3e3e3;
      border-radius: 2px;
      font-size: 13px;
    }
    .ad-page-location {
      margin: 0;
      padding: 8px;
      border: 1px solid #e3e3e3;
      border-radius: 2px;
      background: #fafafa;
    }
    .ad-page-location-header {
      display: grid;
      gap: 4px;
      margin-bottom: 10px;
    }
    .ad-page-location-summary {
      font-size: 14px;
      color: #222;
    }
    .ad-page-location-note {
      font-size: 12px;
      color: #667;
    }
    .ad-page-location .location-picker-map {
      min-height: 180px;
    }
    .location-picker {
      display: grid;
      gap: 10px;
      margin: 14px 0;
      padding: 12px;
      border: 1px solid #d8d8d8;
      border-radius: 12px;
      background: #fafafa;
    }
    .location-picker-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px 12px;
      align-items: flex-start;
    }
    .location-picker-help {
      color: #667;
      font-size: 12px;
      margin-top: 3px;
    }
    .location-picker-summary {
      color: #234;
      font-size: 13px;
      padding: 4px 10px;
      border-radius: 999px;
      background: #e8f0ff;
      display: inline-flex;
      align-items: center;
      max-width: 100%;
    }
    .location-picker-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
    }
    .location-picker-fields input,
    .location-picker-fields select {
      max-width: none;
      margin-bottom: 0;
    }
    .location-picker-search {
      display: grid;
      gap: 6px;
    }
    .location-picker-search-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: center;
    }
    .location-picker-results {
      display: grid;
      gap: 6px;
      max-height: 180px;
      overflow: auto;
    }
    .location-picker-result {
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #d6dbe6;
      border-radius: 10px;
      background: #fff;
      font-size: 13px;
    }
    .location-picker-result small {
      display: block;
      color: #667;
      margin-top: 2px;
    }
    .location-picker-status {
      font-size: 13px;
      color: #444;
    }
    .location-picker-map {
      width: 100%;
      min-height: 320px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #cfd8e3;
      background: #eef3f8;
    }
    .location-picker-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .location-picker-view {
      padding: 0;
      border: 0;
      background: transparent;
      margin: 0;
    }
    .ad-page-footer {
      color: #999;
      font-size: 12px;
      margin-top: 2px;
    }
    .ad-message-section form {
      display: grid;
      gap: 8px;
    }
    .ad-message-section textarea {
      max-width: 100%;
      min-height: 140px;
    }
    @media (max-width: 900px) {
      .ad-page {
        grid-template-columns: 1fr;
      }
      .ad-page-aside {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 768px) {
      .ad-page-craigslist > div {
        grid-template-columns: 1fr !important;
      }
    }
    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    .search-form input[type=search] {
      flex: 1;
      min-width: 160px;
      margin: 0;
    }
    .search-form-cat {
      width: auto;
      margin: 0;
    }
    .search-form button {
      margin: 0;
      white-space: nowrap;
    }
    @media (max-width: 700px) {
      .ad-page-image,
      .image-preview {
        max-width: 100%;
      }
      .location-picker-map {
        min-height: 260px;
      }
      .location-picker-search-row {
        grid-template-columns: 1fr;
      }
      .search-form input[type=search],
      .search-form-cat {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="page">${body}</div>
</body>
</html>`, status);
}

function renderAdList(env: Env, ads: AdCardRow[]): string {
  if (!ads.length) {
    return '<div class="empty">Пока нет объявлений.</div>';
  }

  return `<div class="ads-list">${ads
    .map((ad) => {
      const city = ad.city ? ` (${htmlEscape(cityLabel(ad.city))})` : '';
      const dateStr = new Date(ad.created_at).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
      return `<div class="ad-row"><a href="/ad/${ad.id}">${htmlEscape(ad.title)}</a> ${city} <span class="ad-row-date">${dateStr}</span></div>`;
    })
    .join('')}</div>`;
}

type UnifiedAdType = { id: number; title: string; price?: string | null; city?: string | null; created_at: string; image_key?: string | null };

function renderUnifiedAdCard(env: Env, ad: UnifiedAdType, actions: string = ''): string {
  const city = ad.city ? `${htmlEscape(cityLabel(ad.city))}` : '';
  const dateStr = new Date(ad.created_at).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  const image = ad.image_key ? `<div class="card-image"><img src="${htmlEscape(buildMediaUrl(env, ad.image_key))}" alt="${htmlEscape(ad.title)}" loading="lazy" /></div>` : '<div class="card-image-empty">фото нет</div>';
  const price = ad.price ? `<div style="font-weight: bold; margin-bottom: 4px;">${htmlEscape(ad.price)}</div>` : '';
  const actionsHtml = actions ? `<div class="card-actions">${actions}</div>` : '';
  return `<div class="ad-card">
${image}
<div class="card-content">
  <a href="/ad/${ad.id}" class="card-title">${htmlEscape(ad.title)}</a>
  ${price}
  <div class="card-meta">${city}${city ? ' · ' : ''}${dateStr}</div>
  ${actionsHtml}
</div>
</div>`;
}

function renderAdCards(env: Env, ads: AdCardRow[]): string {
  if (!ads.length) {
    return '<div class="empty">Пока нет объявлений.</div>';
  }

  return `<div class="ad-cards-grid">${ads.map((ad) => renderUnifiedAdCard(env, ad)).join('')}</div>`;
}

function renderSearchForm(query = '', category = ''): string {
  const categoryOptions = [
    `<option value="">Все категории</option>`,
    ...CATEGORIES.map((c) => `<option value="${c.slug}"${c.slug === category ? ' selected' : ''}>${htmlEscape(c.label)}</option>`),
  ].join('');

  return `<div class="section">
  <form method="get" action="/search" class="search-form">
    <input name="q" type="search" value="${htmlEscape(query)}" placeholder="Поиск по объявлениям" />
    <select name="cat" class="search-form-cat">
      ${categoryOptions}
    </select>
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

function renderCityOptions(selected: string | null | undefined = CITY_DEFAULT_SLUG): string {
  return CITIES.map((city) => `<option value="${city.slug}"${normalizeCity(selected) === city.slug ? ' selected' : ''}>${htmlEscape(city.label)}</option>`).join('');
}

function renderCitySelect(selected: string | null | undefined = CITY_DEFAULT_SLUG): string {
  return `<select id="city" name="city">
    ${renderCityOptions(selected)}
  </select>`;
}

function renderTypeBadge(type: string | null): string {
  return `<span class="badge">${htmlEscape(typeLabel(type))}</span>`;
}

function renderCityBadge(city: string | null): string {
  return `<span class="badge">${htmlEscape(cityLabel(city))}</span>`;
}

function renderAdImage(env: Env, key: string | null, alt: string, className: string): string {
  if (!key) {
    return `<div class="${className} ${className}-placeholder"><span>Нет фото</span></div>`;
  }

  return `<div class="${className}"><img src="${htmlEscape(buildMediaUrl(env, key))}" alt="${htmlEscape(alt)}" loading="lazy" /></div>`;
}

function renderAdImagesGallery(env: Env, imageKeys: string[], alt: string): string {
  if (!imageKeys.length) {
    return '';
  }

  const imageUrls = imageKeys.map((key) => buildMediaUrl(env, key));
  const [mainImageUrl] = imageUrls;
  return `<div class="ad-gallery">
  <div class="ad-gallery-main" data-ad-gallery-main>
    <a href="${htmlEscape(mainImageUrl)}" target="_blank" rel="noopener" data-ad-gallery-main-link>
      <img src="${htmlEscape(mainImageUrl)}" alt="${htmlEscape(alt)}" loading="eager" data-ad-gallery-main-image />
    </a>
    ${
      imageUrls.length > 1
        ? `<button type="button" class="ad-gallery-nav ad-gallery-nav-prev" data-ad-gallery-prev aria-label="Предыдущее фото">‹</button>
    <button type="button" class="ad-gallery-nav ad-gallery-nav-next" data-ad-gallery-next aria-label="Следующее фото">›</button>`
        : ''
    }
  </div>
  ${
    imageUrls.length > 1
      ? `<div class="ad-gallery-meta"><span data-ad-gallery-counter>1 / ${imageUrls.length}</span></div>
  <div class="ad-gallery-thumbs">${imageUrls
      .map(
        (url, index) => `<button type="button" class="ad-gallery-thumb${index === 0 ? ' is-active' : ''}" data-ad-gallery-thumb data-index="${index}" data-full="${htmlEscape(url)}" aria-label="Фото ${index + 1}">
      <img src="${htmlEscape(url)}" alt="${htmlEscape(alt)}" loading="lazy" />
    </button>`
      )
      .join('')}</div>`
      : ''
  }
</div>`;
}

function renderAdGalleryScript(): string {
  return `<script>
  (function () {
    function init(root) {
      var mainImage = root.querySelector('[data-ad-gallery-main-image]');
      var mainLink = root.querySelector('[data-ad-gallery-main-link]');
      var counter = root.querySelector('[data-ad-gallery-counter]');
      var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-ad-gallery-thumb]'));
      var prevButton = root.querySelector('[data-ad-gallery-prev]');
      var nextButton = root.querySelector('[data-ad-gallery-next]');
      if (!mainImage || !mainLink || thumbs.length < 2) {
        return;
      }

      var activeIndex = 0;

      function apply(index) {
        if (index < 0 || index >= thumbs.length) {
          return;
        }
        activeIndex = index;
        var thumb = thumbs[index];
        var nextUrl = thumb.getAttribute('data-full');
        if (!nextUrl) {
          return;
        }
        mainImage.setAttribute('src', nextUrl);
        mainLink.setAttribute('href', nextUrl);
        thumbs.forEach(function (node, nodeIndex) {
          node.classList.toggle('is-active', nodeIndex === activeIndex);
        });
        if (counter) {
          counter.textContent = String(activeIndex + 1) + ' / ' + String(thumbs.length);
        }
        if (prevButton) {
          prevButton.disabled = activeIndex === 0;
        }
        if (nextButton) {
          nextButton.disabled = activeIndex === thumbs.length - 1;
        }
      }

      thumbs.forEach(function (thumb, index) {
        thumb.addEventListener('click', function () {
          apply(index);
        });
      });

      if (prevButton) {
        prevButton.addEventListener('click', function () {
          apply(activeIndex - 1);
        });
      }
      if (nextButton) {
        nextButton.addEventListener('click', function () {
          apply(activeIndex + 1);
        });
      }
      document.addEventListener('keydown', function (event) {
        if (!root.contains(document.activeElement)) {
          return;
        }
        if (event.key === 'ArrowLeft') {
          apply(activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
          apply(activeIndex + 1);
        }
      });

      apply(0);
    }

    function bootstrap() {
      document.querySelectorAll('.ad-gallery').forEach(init);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
      bootstrap();
    }
  })();
  </script>`;
}

function renderAvatar(env: Env, key: string | null, alt: string, className = 'avatar'): string {
  if (!key) {
    return `<div class="${className} ${className}-placeholder"><span>${htmlEscape(alt.slice(0, 2).toUpperCase() || 'UA')}</span></div>`;
  }

  return `<div class="${className}"><img src="${htmlEscape(buildMediaUrl(env, key))}" alt="${htmlEscape(alt)}" loading="lazy" /></div>`;
}

function renderNotFoundPage(currentUser: CurrentUser | null = null, currentCity: string | null = null, currentPath = '/'): Response {
  return shell(
    'страница не найдена - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
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

function renderHome(currentUser: CurrentUser | null = null, currentCity: string | null = null, currentPath = '/'): Response {
  const categories = CATEGORIES.map(
    (category) => `<a href="/category/${category.slug}">${htmlEscape(category.label)}</a>`
  ).join(' · ');

  return shell(
    'жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
<div class="home-content">
  <div class="categories-list">
    ${categories}
  </div>
</div>`
  );
}

function renderAboutPage(currentUser: CurrentUser | null = null, currentCity: string | null = null, currentPath = '/about'): Response {
  return shell(
    'о проекте - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
<div class="section reading-column">
  <h2>О проекте</h2>
  <p>Это современная доска объявлений, созданная для простого и прямого взаимодействия между людьми. Пользователь размещает объявление, получает отклики и договаривается напрямую — без посредников и лишних шагов. Сервис не требует сложного освоения: интерфейс интуитивно понятен, а ключевые действия сведены к минимуму. Всё устроено так, чтобы быстро перейти от размещения объявления к реальному решению задачи.</p>
</div>`,
    currentUser
  );
}

function renderSearchPage(env: Env, query: string, category: string, ads: AdCardRow[], currentUser: CurrentUser | null = null, currentCity: string | null = null, currentPath = '/search'): Response {
  const hasQuery = query.trim().length > 0;
  const content = hasQuery
    ? ads.length
      ? renderAdList(env, ads)
      : '<div class="empty">Ничего не найдено.</div>'
    : '<div class="empty">Введите запрос.</div>';

  return shell(
    'поиск - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
${renderSearchForm(query, category)}
<div class="section">
  ${content}
</div>`,
    currentUser
  );
}

function renderCityPage(currentUser: CurrentUser | null = null, currentCity: string | null = null, message: string | null = null, nextPath = '/'): Response {
  const city = normalizeCity(currentCity || currentUser?.city || CITY_DEFAULT_SLUG);
  return shell(
    'город - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, city, nextPath)}
<div class="section">
  <h2>Выбери город</h2>
  ${message ? `<p class="empty">${htmlEscape(message)}</p>` : ''}
  <form method="post" action="/city">
    <input type="hidden" name="next" value="${htmlEscape(nextPath)}" />
    <label for="city">Город</label>
    ${renderCitySelect(city)}
    <button type="submit">Сохранить город</button>
  </form>
</div>`,
    currentUser
  );
}

function renderNewPage(currentUser: CurrentUser | null = null, currentCity: string | null = null, error: string | null = null, currentPath = '/new'): Response {
  const options = CATEGORIES.map(
    (category) => `<option value="${category.slug}"${category.slug === 'misc' ? ' selected' : ''}>${htmlEscape(category.label)}</option>`
  ).join('');
  const city = currentCity || currentUser?.city || CITY_DEFAULT_SLUG;
  const extraHead = renderLeafletAssets();

  return shell(
    'создать объявление - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
<div class="section">
  <h2>Создать объявление</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  <form method="post" action="/new" enctype="multipart/form-data">
    <label for="city">Город</label>
    ${renderCitySelect(city)}

    ${renderLocationEditor({
      location_lat: null,
      location_lng: null,
      location_radius_meters: AD_LOCATION_DEFAULT_RADIUS,
      location_label: '',
    }, city, 'new')}

    <label for="title">Заголовок</label>
    <input id="title" name="title" type="text" required maxlength="200" />

    <label for="category">Категория</label>
    <select id="category" name="category">
      ${options}
    </select>

    <label for="type">Тип объявления</label>
    ${renderTypeSelect('sell')}

    <label for="price">Цена</label>
    <input id="price" name="price" type="text" maxlength="100" placeholder="Например: 1000 руб или 15 $ или договор" />

    <label for="images">Картинки (до ${AD_IMAGES_MAX_COUNT})</label>
    <input id="images" name="images" type="file" accept="image/*" multiple />

    <label for="body">Текст</label>
    <textarea id="body" name="body" required maxlength="5000"></textarea>

    <label for="contact">Как связаться</label>
    <input id="contact" name="contact" type="text" maxlength="300" placeholder="Телефон, Telegram, email..." />

    <button type="submit">Опубликовать</button>
  </form>
</div>`,
    currentUser,
    200,
    extraHead
  );
}

function renderCategoryPage(
  env: Env,
  slug: string,
  ads: AdCardRow[],
  currentUser: CurrentUser | null = null,
  typeFilter: string | null = null,
  currentCity: string | null = null,
  currentPath = '/'
): Response {
  const category = CATEGORIES.find((item) => item.slug === slug);
  if (!category) {
    return renderNotFoundPage(currentUser, currentCity);
  }

  return shell(
    `${category.label} - жоржлист`,
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
<div class="section">
  <h2>${htmlEscape(category.label)}</h2>
  ${renderTypeFilter(typeFilter, `/category/${encodeURIComponent(category.slug)}`)}
  ${renderAdCards(env, ads)}
</div>`
  );
}

function renderAdMessageSection(
  ad: PublicAdCardRow,
  currentUser: CurrentUser | null,
  canMessageAuthor: boolean,
  currentUserHasTelegram: boolean,
  message: string | null = null
): string {
  const title = '<h2>Написать продавцу в Telegram</h2>';

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

  if (!currentUser) {
    return `<div class="section ad-message-section">
  ${title}
  <p class="empty">Чтобы написать продавцу в Telegram, войди в аккаунт.</p>
</div>`;
  }

  if (!currentUserHasTelegram) {
    return `<div class="section ad-message-section">
  ${title}
  <p class="empty">Чтобы написать продавцу в Telegram, подключи Telegram-бот в настройках.</p>
  <p><a href="/settings/link-telegram">Подключить Telegram-бот</a></p>
</div>`;
  }

  if (!canMessageAuthor) {
    return `<div class="section ad-message-section">
  ${title}
  <p class="empty">У продавца не подключён Telegram-бот.</p>
</div>`;
  }

  return `<div class="section ad-message-section">
  ${title}
  ${message ? `<p class="empty">${htmlEscape(message)}</p>` : ''}
  <form method="post" action="/ad/${ad.id}/message">
    <textarea name="message" required maxlength="1000" rows="6" placeholder="Напишите сообщение продавцу в Telegram"></textarea>
    <button type="submit">Отправить</button>
  </form>
</div>`;
}

function renderPublicAdPage(
  env: Env,
  ad: PublicAdCardRow,
  adImageKeys: string[] = ad.image_key ? [ad.image_key] : [],
  currentUser: CurrentUser | null = null,
  canMessageAuthor = false,
  currentUserHasTelegram = false,
  message: string | null = null,
  currentCity: string | null = null,
  currentPath = '/'
): Response {
  const hasLocation = hasAdLocation(ad);
  const locationLabel = ad.location_label?.trim() || '';
  const publicLocationBadge = locationLabel ? `<span class="badge badge-location">${htmlEscape(locationLabel)}</span>` : '';
  const media = renderAdImagesGallery(env, adImageKeys, ad.title);

  const author = ad.author_login
    ? `<div class="ad-page-author">
  ${renderAvatar(env, ad.author_avatar_key, ad.author_login, 'avatar-mini')}
  <a href="/u/${encodeURIComponent(ad.author_login)}">${htmlEscape(ad.author_login)}</a>
</div>`
    : '';

  return shell(
    `${ad.title} - жоржлист`,
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
<div class="section">
  <div class="ad-page-craigslist">
    <h2 style="margin: 0 0 8px;">${htmlEscape(ad.title)}</h2>
    <div style="display: grid; grid-template-columns: 1fr 380px; gap: 20px; margin-bottom: 16px; align-items: start;">
      <div>
        ${media}
        <div class="ad-page-body" style="margin-top: 10px;">${htmlEscape(ad.body)}</div>
      </div>
      <div style="font-size: 13px;">
        <div style="margin-bottom: 12px;">
          <strong style="font-size: 18px;">${ad.city ? htmlEscape(cityLabel(ad.city)) : ''}</strong>
        </div>
        ${ad.price ? `<div style="margin-bottom: 12px; font-weight: bold; font-size: 16px;">${htmlEscape(ad.price)}</div>` : ''}
        ${ad.contact ? `<div style="margin-bottom: 12px;"><strong>Контакты:</strong><br />${htmlEscape(ad.contact)}</div>` : ''}
        <div style="color: #666; font-size: 12px;">
          ${htmlEscape(ad.created_at)}
        </div>
        ${hasLocation ? `<div style="margin-top: 12px;">${renderLocationViewer(ad, currentCity)}</div>` : ''}
        <div style="margin-top: 16px;">
          ${renderAdMessageSection(ad, currentUser, canMessageAuthor, currentUserHasTelegram, message)}
        </div>
      </div>
    </div>
  </div>
</div>`,
    currentUser,
    200,
    `${hasLocation ? renderLeafletAssets() : ''}${renderAdGalleryScript()}`
  );
}

function renderPublicUserPage(env: Env, user: PublicUserRow, ads: AdCardRow[], currentUser: CurrentUser | null = null, currentCity: string | null = null, currentPath = '/'): Response {
  const isOwner = currentUser?.login === user.login;
  const adItems = ads.length
    ? `<div class="ads-list">${ads
        .map((ad) => {
          const city = ad.city ? ` (${htmlEscape(cityLabel(ad.city))})` : '';
          const dateStr = new Date(ad.created_at).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
          const actions = isOwner
            ? ` <span style="color: #666; font-size: 12px;">
      [<a href="/my/edit/${ad.id}">редактировать</a> ·
      <a href="#" onclick="return confirm('Удалить объявление?') && fetch('/my/delete/${ad.id}', {method: 'POST'})">удалить</a>]
    </span>`
            : '';
          return `<div class="ad-row"><a href="/ad/${ad.id}">${htmlEscape(ad.title)}</a> ${city} <span class="ad-row-date">${dateStr}</span>${actions}</div>`;
        })
        .join('')}</div>`
    : '<div class="empty">Пока нет объявлений.</div>';

  return shell(
    `${user.login} - жоржлист`,
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
<div class="section">
  ${renderAvatar(env, user.avatar_key, user.login)}
  <h2>${htmlEscape(user.login)}</h2>
  <p>Город: ${htmlEscape(cityLabel(user.city))}</p>
  <p>${htmlEscape(String(ads.length))} объявлений</p>
</div>
<div class="section">
  ${adItems}
</div>
${renderSearchForm()}`,
    currentUser
  );
}

function renderLoginPage(error: string | null = null, nextPath = '/my', email = '', currentPath = '/login'): Response {
  return shell(
    'войти - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(null, null, currentPath)}
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
  telegramAuthLink: string | null = null,
  currentPath = '/register'
): Response {
  const telegramAction = telegramAuthLink
    ? `<p><a href="${htmlEscape(telegramAuthLink)}">Зарегистрироваться через Telegram</a></p>`
    : '';
  return shell(
    'зарегистрироваться - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(null, null, currentPath)}
<div class="section">
  <h2>Зарегистрироваться</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  ${note ? `<p>${htmlEscape(note)}</p>` : ''}
  <form method="post" action="/register">
    <input type="hidden" name="next" value="${htmlEscape(nextPath)}" />

    <label for="login">Имя пользователя</label>
    <input id="login" name="login" type="text" required value="${htmlEscape(login)}" />

    <label for="email">Почта</label>
    <input id="email" name="email" type="email" required value="${htmlEscape(email)}" />

    <label for="password">Пароль</label>
    <input id="password" name="password" type="password" required />

    <button type="submit">Создать аккаунт</button>
  </form>
  ${telegramAction}
</div>`
  );
}

function renderMyPage(env: Env, currentUser: CurrentUser, ads: AdRow[], message: string | null = null, currentCity: string | null = null, currentPath = '/my'): Response {
  const items = ads.length
    ? `<div class="ad-cards-grid">${ads
        .map((ad) => {
          const actions = `[<a href="/my/edit/${ad.id}">ред</a> · <a href="#" onclick="return confirm('Удалить?') && fetch('/my/delete/${ad.id}', {method: 'POST'})">del</a>]`;
          return renderUnifiedAdCard(env, ad, actions);
        })
        .join('')}</div>`
    : '<div class="empty">Пока нет твоих объявлений.</div>';

  return shell(
    'мои объявления - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
<div class="section">
  <h2>Мои объявления</h2>
  ${message ? `<p class="empty">${htmlEscape(message)}</p>` : ''}
  ${items}
</div>`,
    currentUser
  );
}

function renderEditPage(
  env: Env,
  currentUser: CurrentUser,
  ad: AdRow,
  adImages: AdImageRow[] = ad.image_key
    ? [{
        id: 0,
        ad_id: ad.id,
        image_key: ad.image_key,
        image_mime_type: ad.image_mime_type || 'image/jpeg',
        sort_order: 0,
        created_at: ad.created_at,
      }]
    : [],
  error: string | null = null,
  formAction = `/my/edit/${ad.id}`,
  currentCity: string | null = null,
  currentPath = '/my'
): Response {
  const options = CATEGORIES.map(
    (category) => `<option value="${category.slug}"${category.slug === ad.category ? ' selected' : ''}>${htmlEscape(category.label)}</option>`
  ).join('');
  const currentImagePreview = adImages.length
    ? `<div class="edit-image-list">${adImages
        .map((image, index) => `<div class="edit-image-item">
      <img src="${htmlEscape(buildMediaUrl(env, image.image_key))}" alt="${htmlEscape(ad.title)}" />
      <div class="edit-image-controls">
        <label><input type="checkbox" name="keep_image_keys" value="${htmlEscape(image.image_key)}" checked /> Оставить</label>
        <label><input type="radio" name="cover_image_key" value="${htmlEscape(image.image_key)}"${index === 0 ? ' checked' : ''} /> Главная</label>
      </div>
    </div>`)
        .join('')}</div>`
    : '<div class="image-preview image-preview-placeholder"><span>Без фото</span></div>';
  const city = ad.city || currentCity || currentUser.city || CITY_DEFAULT_SLUG;
  const extraHead = renderLeafletAssets();

  return shell(
    'редактировать объявление - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentCity, currentPath)}
<div class="section">
  <h2>Редактировать объявление</h2>
  ${error ? `<p class="empty">${htmlEscape(error)}</p>` : ''}
  <form method="post" action="${htmlEscape(formAction)}" enctype="multipart/form-data">
    <label for="city">Город</label>
    ${renderCitySelect(city)}

    ${renderLocationEditor({
      location_lat: ad.location_lat,
      location_lng: ad.location_lng,
      location_radius_meters: ad.location_radius_meters,
      location_label: ad.location_label,
    }, city, 'edit')}

    <label for="title">Заголовок</label>
    <input id="title" name="title" type="text" required maxlength="200" value="${htmlEscape(ad.title)}" />

    <label for="category">Категория</label>
    <select id="category" name="category">
      ${options}
    </select>

    <label for="type">Тип объявления</label>
    ${renderTypeSelect(normalizeAdType(ad.type).toString())}

    <label for="price">Цена</label>
    <input id="price" name="price" type="text" maxlength="100" placeholder="Например: 1000 руб или 15 $ или договор" value="${htmlEscape(ad.price || '')}" />

    <label>Текущие картинки</label>
    ${currentImagePreview}

    <label for="images">Добавить картинки (до ${AD_IMAGES_MAX_COUNT})</label>
    <input id="images" name="images" type="file" accept="image/*" multiple />

    <label for="body">Текст</label>
    <textarea id="body" name="body" required maxlength="5000">${htmlEscape(ad.body)}</textarea>

    <label for="contact">Как связаться</label>
    <input id="contact" name="contact" type="text" maxlength="300" placeholder="Телефон, Telegram, email..." value="${htmlEscape(ad.contact || '')}" />

    <button type="submit">Сохранить</button>
  </form>
</div>`,
    currentUser,
    200,
    extraHead
  );
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
  message: string | null = null,
  currentPath = '/admin?section=users'
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
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentUser.city, currentPath)}
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
  message: string | null = null,
  currentPath = '/admin?section=ads'
): Response {
  const items = ads.length
    ? `<div class="ad-cards-grid">${ads
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
          const actions = `<div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">${htmlEscape(ad.status)} · ${category}${htmlEscape(ad.created_at)}</div>
${owner}
<div style="margin-top: 8px;">
  <a href="${htmlEscape(buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', pagination.page))}">Редактировать</a>
  <form method="post" action="${htmlEscape(buildAdminActionUrl(`/admin/delete/${ad.id}`, 'ads', pagination.page))}" style="display:inline">
    <button class="link-button" type="submit" onclick="return confirm('Удалить объявление?')">Удалить</button>
  </form>
  ${moderationActions}
</div>`;
          return renderUnifiedAdCard(env, ad, actions);
        })
        .join('')}</div>`
    : '<div class="empty">Объявлений на этой странице нет.</div>';

  return shell(
    'админка - жоржлист',
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentUser.city, currentPath)}
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
  pendingTelegramAuth: TelegramAuthPayload | null = null,
  currentPath = '/settings'
): Response {
  const telegramStatus = telegramIdentity
    ? `Telegram: ${htmlEscape(telegramIdentity.telegram_username ? `@${telegramIdentity.telegram_username}` : telegramIdentity.provider_user_id || '')}`
    : 'Telegram: не привязан';
  const cityStatus = `Город: ${htmlEscape(cityLabel(currentUser.city))}`;
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
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentUser.city, currentPath)}
<div class="section">
  <h2>Настройки</h2>
  <p>Роль: ${htmlEscape(currentUser.role)}</p>
  <p>${cityStatus} <a href="/city">Изменить город</a></p>
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
  currentUser: CurrentUser | null = null,
  currentPath = '/'
): Response {
  return shell(
    title,
    `<h1><a class="site-title" href="/">жоржлист</a></h1>
${nav(currentUser, currentUser?.city || null, currentPath)}
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

function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:';
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
             COALESCE(users.city, ?) AS city,
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
    .bind(CITY_DEFAULT_SLUG, sessionTokenHash)
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
        INSERT INTO users (login, display_name, role, city, created_at, updated_at)
        VALUES (?, ?, 'user', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    ).bind(login, displayName, CITY_DEFAULT_SLUG),
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
    `Город: ${cityLabel(user.city)}`,
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

async function sendUserBotSettingsCityPrompt(
  env: Env,
  telegramUserId: string,
  chatId: number,
  message: string | null = null
): Promise<void> {
  const lines = [...(message ? [message, ''] : []), 'Выбери город'];
  const userCity = await getTelegramUserCity(env, telegramUserId);
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCityMarkup(userCity));
}

async function sendUserBotSettingsPasswordPrompt(
  env: Env,
  telegramUserId: string,
  chatId: number,
  hasPassword: boolean,
  step: 'current' | 'new' | 'confirm',
  message: string | null = null,
  fallbackMessageId: number | null = null
): Promise<void> {
  const stepLabel =
    step === 'current'
      ? 'Введи текущий пароль'
      : step === 'new'
        ? 'Введи новый пароль'
        : 'Повтори новый пароль';
  const statusLine = hasPassword ? 'Пароль уже задан.' : 'Пароль ещё не задан.';
  const lines = [...(message ? [message, ''] : []), 'Смена пароля', statusLine, stepLabel];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelSettingsMarkup(), fallbackMessageId);
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
  message: string | null = null,
  composeHint = false,
  currentMessageId: number | null = null,
  skipNotificationClear = false
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
  const messages = await listConversationMessages(env, conversation.id, 20, 0);
  await markConversationMessagesRead(env, conversation.id, telegramIdentity.user_id);
  const lines = [
    ...(message ? [message, ''] : []),
    buildChatScreenTitle(otherUser?.login || 'пользователь', ad.title),
    '',
    ...(messages.length
      ? messages.map((row) => {
          const senderLogin = row.sender_user_id === telegramIdentity.user_id ? 'Вы' : otherUser?.login || 'пользователь';
          const time = row.created_at ? row.created_at.slice(11, 19) : '';
          return `${time ? `${time} ` : ''}${senderLogin}: ${row.body}`;
        })
      : ['Пока нет сообщений']),
    ...(composeHint ? ['', 'Пиши сообщение сразу в чат, кнопка не нужна.'] : []),
  ];

  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotChatMarkup(conversation.id), currentMessageId);
  if (!skipNotificationClear) {
    await clearChatNotification(env, conversation.id, telegramIdentity.user_id, currentMessageId);
  }
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
      SELECT id, title, city, category, type, status, location_lat, location_lng, location_radius_meters, location_label, image_key, image_mime_type, image_updated_at, created_at
      FROM ads
      WHERE owner_user_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `
  )
  .bind(identity.user_id)
  .all<{
    id: number;
    title: string;
    city: string | null;
    category: string | null;
    type: string | null;
    status: string;
    location_lat: number | null;
    location_lng: number | null;
    location_radius_meters: number | null;
    location_label: string | null;
    created_at: string;
  }>();

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
      city: ad.city,
      category: ad.category,
      type: ad.type,
      location_lat: ad.location_lat,
      location_lng: ad.location_lng,
      location_radius_meters: ad.location_radius_meters,
      location_label: ad.location_label,
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
      SELECT id, title, category, type, status, location_lat, location_lng, location_radius_meters, location_label, image_key, image_mime_type, image_updated_at, created_at, body, city
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
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'status' | 'created_at' | 'city' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>
): string {
  const location = buildAdLocationSummary(ad as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>);
  return [
    `#${ad.id}`,
    `Город: ${cityLabel(ad.city)}`,
    `Тип: ${typeLabel(ad.type)}`,
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    `Статус: ${ad.status}`,
    location ? `Зона встречи: ${location}` : null,
    `Дата: ${ad.created_at}`,
    'Текст:',
    truncateText(ad.body, 700),
  ].join('\n');
}

async function sendUserBotSingleAd(env: Env, telegramUserId: string, chatId: number, ad: AdRow): Promise<void> {
  const locationSummary = buildAdLocationSummary(ad);
  const replyMarkup = userBotSingleAdMarkup(ad.id, locationSummary ? buildPublicSiteUrl(env, `/ad/${ad.id}`) : null);
  if (ad.image_key) {
    await showUserBotPhotoScreen(
      env,
      telegramUserId,
      chatId,
      buildMediaUrl(env, ad.image_key),
      [
        `Город: ${cityLabel(ad.city)}`,
        `Тип: ${typeLabel(ad.type)}`,
        `Заголовок: ${ad.title}`,
        `Категория: ${categoryLabel(ad.category)}`,
        `Статус: ${ad.status}`,
        locationSummary ? `Зона встречи: ${locationSummary}` : null,
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
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'city' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>,
  statusLabel: string,
  itemKind: 'New' | 'Edited',
  bodyLimit = 2800
): string {
  const location = buildAdLocationSummary(ad as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>);
  return [
    `Type: ${itemKind}`,
    statusLabel,
    `ID: ${ad.id}`,
    `City: ${cityLabel(ad.city)}`,
    `Title: ${ad.title}`,
    `Ad type: ${typeLabel(ad.type)}`,
    `Category: ${categoryLabel(ad.category)}`,
    location ? `Location: ${location}` : null,
    'Text:',
    truncateText(ad.body, bodyLimit),
  ].join('\n');
}

async function sendTelegramMessage(
  env: Env,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'city' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label' | 'image_key'>,
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
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'city' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label' | 'image_key'>,
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
  })().catch((error: unknown) => {
    cachedEnsureAdImageColumnsPromise = null;
    throw error;
  });

  return cachedEnsureAdImageColumnsPromise;
}

async function ensureAdImagesTable(env: Env): Promise<void> {
  if (cachedEnsureAdImagesTablePromise) {
    return cachedEnsureAdImagesTablePromise;
  }

  cachedEnsureAdImagesTablePromise = (async () => {
    await env.DB.prepare(
      `
        CREATE TABLE IF NOT EXISTS ad_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ad_id INTEGER NOT NULL,
          image_key TEXT NOT NULL,
          image_mime_type TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
        )
      `
    ).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS ad_images_ad_id_sort_idx ON ad_images(ad_id, sort_order, id)`).run();
  })().catch((error: unknown) => {
    cachedEnsureAdImagesTablePromise = null;
    throw error;
  });

  return cachedEnsureAdImagesTablePromise;
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
  })().catch((error: unknown) => {
    cachedEnsureUserAvatarColumnsPromise = null;
    throw error;
  });

  return cachedEnsureUserAvatarColumnsPromise;
}

async function ensureUserCityColumn(env: Env): Promise<void> {
  if (cachedEnsureUserCityColumnPromise) {
    return cachedEnsureUserCityColumnPromise;
  }

  cachedEnsureUserCityColumnPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(users)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));
    if (!columnNames.has('city')) {
      await env.DB.prepare(`ALTER TABLE users ADD COLUMN city TEXT`).run();
    }

    await env.DB.prepare(
      `
        UPDATE users
        SET city = COALESCE(NULLIF(city, ''), ?)
        WHERE city IS NULL OR city = ''
      `
    )
      .bind(CITY_DEFAULT_SLUG)
      .run();
  })().catch((error: unknown) => {
    cachedEnsureUserCityColumnPromise = null;
    throw error;
  });

  return cachedEnsureUserCityColumnPromise;
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
  })().catch((error: unknown) => {
    cachedEnsureAdContactColumnPromise = null;
    throw error;
  });

  return cachedEnsureAdContactColumnPromise;
}

async function ensureAdCityColumn(env: Env): Promise<void> {
  if (cachedEnsureAdCityColumnPromise) {
    return cachedEnsureAdCityColumnPromise;
  }

  cachedEnsureAdCityColumnPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(ads)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));
    if (!columnNames.has('city')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN city TEXT`).run();
    }

    await env.DB.prepare(
      `
        UPDATE ads
        SET city = COALESCE(NULLIF(city, ''), ?)
        WHERE city IS NULL OR city = ''
      `
    )
      .bind(CITY_DEFAULT_SLUG)
      .run();
  })().catch((error: unknown) => {
    cachedEnsureAdCityColumnPromise = null;
    throw error;
  });

  return cachedEnsureAdCityColumnPromise;
}

async function ensureAdLocationColumns(env: Env): Promise<void> {
  if (cachedEnsureAdLocationColumnsPromise) {
    return cachedEnsureAdLocationColumnsPromise;
  }

  cachedEnsureAdLocationColumnsPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(ads)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));

    if (!columnNames.has('location_lat')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN location_lat REAL`).run();
    }

    if (!columnNames.has('location_lng')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN location_lng REAL`).run();
    }

    if (!columnNames.has('location_radius_meters')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN location_radius_meters INTEGER`).run();
    }

    if (!columnNames.has('location_label')) {
      await env.DB.prepare(`ALTER TABLE ads ADD COLUMN location_label TEXT`).run();
    }
  })().catch((error: unknown) => {
    cachedEnsureAdLocationColumnsPromise = null;
    throw error;
  });

  return cachedEnsureAdLocationColumnsPromise;
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
  })().catch((error: unknown) => {
    cachedEnsureAdTypeColumnPromise = null;
    throw error;
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
  })().catch((error: unknown) => {
    cachedEnsureBotDraftColumnsPromise = null;
    throw error;
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
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES bot_conversations(id) ON DELETE CASCADE
        )
      `
    ).run();

    await env.DB.prepare(
      `
        CREATE TABLE IF NOT EXISTS bot_chat_notifications (
          conversation_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          message_id INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(conversation_id, user_id)
        )
      `
    ).run();

    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS bot_conversations_last_message_at_idx ON bot_conversations(last_message_at)`
    ).run();

    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS bot_chat_messages_conversation_id_idx ON bot_chat_messages(conversation_id, id)`
    ).run();

    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS bot_chat_notifications_conversation_user_idx ON bot_chat_notifications(conversation_id, user_id)`
    ).run();
  })().catch((error: unknown) => {
    cachedEnsureChatTablesPromise = null;
    throw error;
  });

  return cachedEnsureChatTablesPromise;
}

async function ensureChatMessageReadColumn(env: Env): Promise<void> {
  if (cachedEnsureChatMessageReadColumnPromise) {
    return cachedEnsureChatMessageReadColumnPromise;
  }

  cachedEnsureChatMessageReadColumnPromise = (async () => {
    const tableInfo = await env.DB.prepare(`PRAGMA table_info(bot_chat_messages)`).all<{ name: string }>();
    const columnNames = new Set((tableInfo.results || []).map((row) => row.name));
    if (!columnNames.has('is_read')) {
      await env.DB.prepare(`ALTER TABLE bot_chat_messages ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0`).run();
    }
  })().catch((error: unknown) => {
    cachedEnsureChatMessageReadColumnPromise = null;
    throw error;
  });

  return cachedEnsureChatMessageReadColumnPromise;
}

async function createAd(
  env: Env,
  ctx: ExecutionContext,
  title: string,
  body: string,
  contact: string | null | undefined,
  cityInput: string | null | undefined,
  categoryInput: string | null | undefined,
  typeInput: string | null | undefined,
  ownerUserId: number | null = null,
  images: File[] = [],
  location: AdLocationInput | null = null
): Promise<{ id: number; category: CategorySlug }> {
  const category = normalizeCategory(categoryInput);
  const type = normalizeAdType(typeInput);
  const city = normalizeCity(cityInput);
  const hasLocation = Boolean(location && typeof location.location_lat === 'number' && Number.isFinite(location.location_lat) && typeof location.location_lng === 'number' && Number.isFinite(location.location_lng));
  const normalizedRadius = hasLocation ? normalizeLocationRadius(location?.location_radius_meters) ?? AD_LOCATION_DEFAULT_RADIUS : null;
  const locationLabel = hasLocation ? (location?.location_label || '').trim().slice(0, AD_LOCATION_LABEL_MAX_LENGTH) || null : null;
  let imageUploads: CompressedAdImageUpload[] = [];

  if (images.length > 0) {
    imageUploads = await readImageUploads(images);
    for (const imageUpload of imageUploads) {
      await putCompressedAdImage(env, imageUpload);
    }
  }
  const coverImage = imageUploads[0];

  let result;
  try {
    result = await env.DB.prepare(
      `
        INSERT INTO ads (
          title,
          body,
          contact,
          city,
          category,
          type,
          location_lat,
          location_lng,
          location_radius_meters,
          location_label,
          status,
          owner_user_id,
          image_key,
          image_mime_type,
          image_updated_at,
          deleted_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, CASE WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
      .bind(
        title,
        body,
        contact || null,
        city,
        category,
        type,
        hasLocation ? location?.location_lat ?? null : null,
        hasLocation ? location?.location_lng ?? null : null,
        hasLocation ? normalizedRadius : null,
        hasLocation ? locationLabel : null,
        ownerUserId,
        coverImage?.key || null,
        coverImage?.mimeType || null,
        coverImage?.key || null
      )
      .run();
  } catch (error) {
    for (const imageUpload of imageUploads) {
      await deleteAdImage(env, imageUpload.key);
    }
    throw error;
  }

  const adId = Number(result.meta.last_row_id);
  if (imageUploads.length > 0) {
    try {
      for (const [index, imageUpload] of imageUploads.entries()) {
        await env.DB.prepare(
          `INSERT INTO ad_images (ad_id, image_key, image_mime_type, sort_order, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
        )
          .bind(adId, imageUpload.key, imageUpload.mimeType, index)
          .run();
      }
    } catch (error) {
      if (isMissingAdImagesTableError(error)) {
        imageUploads = [];
      } else {
        for (const imageUpload of imageUploads) {
          await deleteAdImage(env, imageUpload.key);
        }
        throw error;
      }
    }
  }

  ctx.waitUntil(
    sendTelegramMessage(env, {
      id: adId,
      title,
      body,
      city,
      type,
      category,
      location_lat: hasLocation ? location?.location_lat ?? null : null,
      location_lng: hasLocation ? location?.location_lng ?? null : null,
      location_radius_meters: hasLocation ? normalizedRadius : null,
      location_label: hasLocation ? locationLabel : null,
      image_key: coverImage?.key ?? null,
    }, 'New').catch((error: unknown) => {
      console.error('Telegram notification failed', error);
    })
  );

  return {
    id: adId,
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
  const imageValues = form.getAll('images');
  const legacyImage = form.get('image');
  if (legacyImage) {
    imageValues.push(legacyImage);
  }
  const images = imageValues.filter((value): value is File => isFileLike(value) && value.size > 0);
  const keep_image_keys = form
    .getAll('keep_image_keys')
    .map((value) => String(value || '').trim())
    .filter((value) => value.length > 0);
  const coverImageKeyRaw = String(form.get('cover_image_key') || '').trim();
  const locationLat = parseOptionalNumberField(form.get('location_lat'));
  const locationLng = parseOptionalNumberField(form.get('location_lng'));
  const locationRadius = normalizeLocationRadius(parseOptionalNumberField(form.get('location_radius_meters')));
  const hasLocation = locationLat !== null && locationLng !== null;
  return {
    title: String(form.get('title') || '').trim().slice(0, AD_TITLE_MAX_LENGTH),
    body: String(form.get('body') || '').trim().slice(0, AD_BODY_MAX_LENGTH),
    contact: String(form.get('contact') || '').trim().slice(0, AD_CONTACT_MAX_LENGTH),
    city: String(form.get('city') || '').trim(),
    category: String(form.get('category') || '').trim(),
    type: String(form.get('type') || '').trim(),
    location_lat: hasLocation ? locationLat : null,
    location_lng: hasLocation ? locationLng : null,
    location_radius_meters: hasLocation ? locationRadius ?? AD_LOCATION_DEFAULT_RADIUS : null,
    location_label: '',
    images,
    keep_image_keys,
    cover_image_key: coverImageKeyRaw || null,
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

  return redirectWithMessage('/my', 'Объявление удалено');
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

  const adImages = effectiveAdImages(ad, await listAdImagesByAdId(env, ad.id));
  return renderEditPage(env, currentUser, ad, adImages);
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

  const adImages = effectiveAdImages(ad, await listAdImagesByAdId(env, ad.id));
  const { title, body, contact, category, type, location_lat, location_lng, location_radius_meters, location_label, images, keep_image_keys, cover_image_key } = await parseAdForm(request);
  const uniqueKeptImageKeys = [...new Set(keep_image_keys)];
  if (uniqueKeptImageKeys.length + images.length > AD_IMAGES_MAX_COUNT) {
    return renderEditPage(env, currentUser, ad, adImages, `Можно сохранить максимум ${AD_IMAGES_MAX_COUNT} картинок`);
  }

  if (!title || !body) {
    return renderEditPage(env, currentUser, ad, adImages, 'Заполни заголовок и текст');
  }

  const nextStatus = ad.status === 'published' || ad.status === 'rejected' ? 'pending' : ad.status;
  const normalizedCategory = normalizeCategory(category);
  const normalizedType = normalizeAdType(type);
  let newImages: CompressedAdImageUpload[] = [];
  let nextCoverImageKey: string | null = ad.image_key;
  try {
    if (images.length > 0) {
      newImages = await readImageUploads(images);
      for (const newImage of newImages) {
        await putCompressedAdImage(env, newImage);
      }
    }

    const keptImages = adImages.filter((image) => uniqueKeptImageKeys.includes(image.image_key));
    const combinedImages = [
      ...keptImages,
      ...newImages.map((image, index): AdImageRow => ({
        id: 0 - (index + 1),
        ad_id: ad.id,
        image_key: image.key,
        image_mime_type: image.mimeType,
        sort_order: keptImages.length + index,
        created_at: ad.updated_at,
      })),
    ];
    const explicitCoverImage = combinedImages.find((image) => image.image_key === cover_image_key);
    const nextCoverImage = explicitCoverImage ?? combinedImages[0] ?? null;
    nextCoverImageKey = nextCoverImage?.image_key ?? null;
    const oldImageKey = ad.image_key;
    await env.DB.prepare(
      `
        UPDATE ads
        SET title = ?,
            body = ?,
            contact = ?,
            category = ?,
            type = ?,
            location_lat = ?,
            location_lng = ?,
            location_radius_meters = ?,
            location_label = ?,
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
        location_lat,
        location_lng,
        location_radius_meters,
        location_label || null,
        nextStatus,
        nextCoverImage?.image_key ?? null,
        nextCoverImage?.image_mime_type ?? null,
        nextCoverImage?.image_key ?? null,
        numericId,
        userId
      )
      .run();

    if (newImages.length > 0 || keptImages.length !== adImages.length) {
      try {
        await env.DB.prepare(`DELETE FROM ad_images WHERE ad_id = ?`).bind(ad.id).run();
        for (const [index, image] of combinedImages.entries()) {
          await env.DB.prepare(
            `INSERT INTO ad_images (ad_id, image_key, image_mime_type, sort_order, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
          )
            .bind(ad.id, image.image_key, image.image_mime_type, index)
            .run();
        }
      } catch (error) {
        if (!isMissingAdImagesTableError(error)) {
          throw error;
        }
      }
      for (const image of adImages) {
        if (uniqueKeptImageKeys.includes(image.image_key)) {
          continue;
        }
        await deleteAdImage(env, image.image_key);
      }
      if (oldImageKey && oldImageKey !== nextCoverImage?.image_key && !combinedImages.some((image) => image.image_key === oldImageKey)) {
        await deleteAdImage(env, oldImageKey);
      }
    }
  } catch (error) {
    for (const newImage of newImages) {
      await deleteAdImage(env, newImage.key);
    }
    console.error('Failed to update ad with image', error);
    return renderEditPage(env, currentUser, ad, adImages, 'Не удалось сохранить картинку', `/my/edit/${ad.id}`);
  }

  ctx.waitUntil(
    sendTelegramMessage(env, {
      id: numericId,
      title,
      body,
      city: ad.city,
      category: normalizedCategory,
      type: normalizedType,
      location_lat: ad.location_lat,
      location_lng: ad.location_lng,
      location_radius_meters: ad.location_radius_meters,
      location_label: ad.location_label,
      image_key: nextCoverImageKey,
    }, 'Edited').catch((error: unknown) => {
      console.error('Telegram notification failed after edit', error);
    })
  );

  return redirectWithMessage('/my', 'Объявление сохранено');
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
  if (!verifyTelegramWebhookSecret(request, env.TELEGRAM_WEBHOOK_SECRET)) {
    return text('Unauthorized', 401);
  }

  let update: TelegramUpdate;

  try {
    update = await request.json();
  } catch {
    return text('Bad Request', 400);
  }

  if (update.message?.text && update.message.from) {
    const chatId = update.message.chat.id;
    if (isAdminTelegramChat(env, chatId)) {
      await handleAdminBotText(adminBotDeps, env, chatId, update.message.text, NOOP_EXECUTION_CONTEXT).catch((error: unknown) => {
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
    return handleAdminBotCallback(adminBotDeps, update, env, NOOP_EXECUTION_CONTEXT);
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

async function createTelegramUser(
  env: Env,
  login: string,
  email: string,
  telegramUserId: string,
  telegramUsername: string | null
): Promise<number> {
  const userResult = await env.DB.prepare(
    `
      INSERT INTO users (login, display_name, role, city, created_at, updated_at)
      VALUES (?, ?, 'user', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `
  )
    .bind(login, login, CITY_DEFAULT_SLUG)
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
          INSERT INTO users (login, display_name, role, city, created_at, updated_at)
          VALUES (?, ?, 'user', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
      )
        .bind(login, displayName, CITY_DEFAULT_SLUG)
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
    const recipientDraft = await getBotDraft(env, recipientTelegram.provider_user_id);
    const recipientHasOpenChat =
      recipientDraft?.action === 'chat' &&
      recipientDraft.step === 'message' &&
      recipientDraft.reply_user_id === senderUserId &&
      recipientDraft.reply_ad_id === adId;

    if (recipientHasOpenChat) {
      try {
        await sendUserBotChatView(env, recipientTelegram.provider_user_id, recipientChatId, conversation.id);
      } catch (error) {
        console.error('Failed to refresh open chat for recipient', error);
      }
      return conversation;
    }

    const lines = [
      `Тебе написал пользователь ${senderLogin}`,
      `по объявлению: ${title}`,
      '',
      'Сообщение:',
      body,
    ];
    try {
      await sendOrUpdateChatNotification(
        env,
        conversation.id,
        recipientUserId,
        recipientChatId,
        lines.join('\n'),
        userBotIncomingChatMarkup(conversation.id)
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
      const user = await findUserById(env, identity.user_id);
      const userCity = normalizeCity(user?.city);

      if (!draft.title || !draft.body) {
        await clearBotDraft(env, telegramUserId);
        await sendUserBotMenu(env, telegramUserId, chatId, 'Черновик пуст');
        return;
      }

      try {
        await createAd(env, ctx, draft.title, draft.body, null, userCity, draft.category, draft.ad_type, identity.user_id, [], null);
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
            city: ad.city,
            category,
            type: adType,
            location_lat: ad.location_lat,
            location_lng: ad.location_lng,
            location_radius_meters: ad.location_radius_meters,
            location_label: ad.location_label,
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
  ctx: ExecutionContext,
  messageId: number | null = null
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
      await upsertBotDraft(
        env,
        telegramUserId,
        'chat',
        'message',
        null,
        null,
        null,
        draft.reply_ad_id,
        null,
        null,
        null,
        null,
        null,
        draft.reply_user_id,
        draft.reply_ad_id,
        null,
        null
      );
      await sendUserBotChatView(env, telegramUserId, chatId, conversation.id, 'Сообщение отправлено', true);

    } catch (error) {
      console.error('Failed to send reply message to user', error);
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
    await sendUserBotSearchPrompt(env, telegramUserId, chatId, null, callbackQuery.message.message_id);
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

  if (data.startsWith(USER_BOT_BROWSE_SECTIONS_PREFIX)) {
    const sectionSlug = data.slice(USER_BOT_BROWSE_SECTIONS_PREFIX.length);
    if (sectionSlug) {
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotBrowseSection(env, telegramUserId, chatId, sectionSlug);
      return json({ ok: true });
    }

    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotSections(env, telegramUserId, chatId);
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
      await sendUserBotSearchPrompt(env, telegramUserId, chatId, null, callbackQuery.message.message_id);
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
      await sendUserBotSearchPrompt(env, telegramUserId, chatId, null, callbackQuery.message.message_id);
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

  if (data.startsWith(USER_BOT_CHAT_DOWNLOAD_PREFIX)) {
    const conversationId = Number(data.slice(USER_BOT_CHAT_DOWNLOAD_PREFIX.length));
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

    const ad = await getPublishedAdCardById(env, conversation.ad_id);
    if (!ad) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Объявление не найдено').catch(() => {});
      return json({ ok: true });
    }

    const otherUserId = conversation.user_low_id === telegramIdentity.user_id ? conversation.user_high_id : conversation.user_low_id;
    const otherUser = await findUserById(env, otherUserId);
    const messages = await listAllConversationMessages(env, conversation.id);
    const exportText = buildConversationHistoryExport(conversation, ad.title, otherUser?.login || 'пользователь', messages, telegramIdentity.user_id);
    const exportFile = new File(
      [exportText],
      buildConversationExportFilename(conversation.id, otherUser?.login || 'user', ad.title),
      { type: 'text/plain;charset=utf-8' }
    );

    await answerUserCallbackQuery(env, callbackQuery.id, 'История отправлена').catch(() => {});
    await sendUserBotDocument(env, chatId, exportFile);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_CHAT_PREFIX)) {
    const conversationId = Number(data.slice(USER_BOT_CHAT_PREFIX.length));
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
    await sendUserBotChatView(env, telegramUserId, chatId, conversationId, null, true, callbackQuery.message.message_id);
    return json({ ok: true });
  }

  if (data.startsWith(USER_BOT_CHAT_HIDE_PREFIX)) {
    const conversationId = Number(data.slice(USER_BOT_CHAT_HIDE_PREFIX.length));
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'Invalid chat').catch(() => {});
      return json({ ok: true });
    }

    const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
    if (!telegramIdentity) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'User not found').catch(() => {});
      return json({ ok: true });
    }

    await clearChatNotification(env, conversationId, telegramIdentity.user_id, callbackQuery.message.message_id);
    await answerUserCallbackQuery(env, callbackQuery.id, 'Уведомление скрыто').catch(() => {});
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
    await upsertBotDraft(
      env,
      telegramUserId,
      'chat',
      'message',
      null,
      null,
      null,
      adId,
      null,
      null,
      null,
      null,
      null,
      ad.owner_user_id,
      adId,
      null,
      null
    );
    await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
    await sendUserBotChatView(env, telegramUserId, chatId, conversation.id, null, true);
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

    if (action === 'city') {
      await upsertBotDraft(env, telegramUserId, 'settings', 'city');
      await answerUserCallbackQuery(env, callbackQuery.id).catch(() => {});
      await sendUserBotSettingsCityPrompt(env, telegramUserId, chatId);
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
      await sendUserBotSettingsPasswordPrompt(
        env,
        telegramUserId,
        chatId,
        hasPassword,
        hasPassword ? 'current' : 'new',
        null,
        callbackQuery.message.message_id
      );
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

  if (data.startsWith(`${USER_BOT_SETTINGS_PREFIX}city:`)) {
    const city = data.slice(`${USER_BOT_SETTINGS_PREFIX}city:`.length);
    const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
    if (!telegramIdentity) {
      await answerUserCallbackQuery(env, callbackQuery.id, 'User not found').catch(() => {});
      return json({ ok: true });
    }

    await updateUserCity(env, telegramIdentity.user_id, city);
    await clearBotDraft(env, telegramUserId);
    await answerUserCallbackQuery(env, callbackQuery.id, 'Город обновлён').catch(() => {});
    await sendUserBotSettings(env, telegramUserId, chatId, 'Город обновлён');
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
  if (!verifyTelegramWebhookSecret(request, env.TELEGRAM_USER_WEBHOOK_SECRET)) {
    return text('Unauthorized', 401);
  }

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
  const messageId = message.message_id || null;

  const avatarFileId = message.photo?.length ? message.photo[message.photo.length - 1]?.file_id : message.document?.mime_type?.startsWith('image/') ? message.document.file_id : null;
  if (avatarFileId) {
    const draft = await getBotDraft(env, telegramUserId);
    if (draft?.action === 'settings' && draft.step === 'avatar') {
      await handleUserBotSettingsAvatarUpdate(env, telegramUserId, chatId, avatarFileId);
      if (messageId !== null) {
        await deleteTelegramMessage(env, chatId, messageId).catch((error: unknown) => {
          console.error('Failed to delete avatar message from Telegram', error);
        });
      }
      return json({ ok: true });
    }
  }

  if (!message.text) {
    return json({ ok: true });
  }

  if (message.text === '/start') {
    await handleUserBotStart(env, telegramUserId, chatId, telegramUsername);
    if (messageId !== null) {
      await deleteTelegramMessage(env, chatId, messageId).catch((error: unknown) => {
        console.error('Failed to delete /start message from Telegram', error);
      });
    }
    return json({ ok: true });
  }

  if (messageId !== null) {
    await deleteTelegramMessage(env, chatId, messageId).catch((error: unknown) => {
      console.error('Failed to delete user message from Telegram', error);
    });
  }

  await handleUserBotText(env, telegramUserId, chatId, telegramUsername, message.text, ctx, message.message_id);

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
      LIMIT ?
    `
  )
    .bind(userId, ADS_USER_LIMIT)
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
  return renderLoginPage(message, nextPath, '', `${url.pathname}${url.search}`);
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
  return renderRegisterPage(message, nextPath, '', '', '', note, telegramAuthLink, `${url.pathname}${url.search}`);
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
  const hashToCheck = identity?.password_hash ?? DUMMY_PASSWORD_HASH;
  const isPasswordValid = await verifyPassword(password, hashToCheck);
  if (!identity?.password_hash || !isPasswordValid) {
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
  const displayName = String(form.get('display_name') || '').trim().slice(0, USER_DISPLAY_NAME_MAX_LENGTH);
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

  const url = new URL(request.url);
  const message = new URL(request.url).searchParams.get('message');
  return renderMyPage(env, currentUser, await listMyAds(env, currentUser.id), message, getCurrentCityFromRequest(request, currentUser), `${url.pathname}${url.search}`);
}

async function handleMyDeleteRoute(request: Request, env: Env, id: string): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/my');
  }

  if (request.method !== 'POST') {
    return methodNotAllowed();
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

  return methodNotAllowed();
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
  const currentPath = `${url.pathname}${url.search}`;

  if (section === 'users') {
    const totalUsers = await countAllUsers(env);
    const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    return renderAdminUsersSection(
      env,
      currentUser,
      await listAdminUsersPage(env, page),
      { page, totalPages },
      message,
      currentPath
    );
  }

  const totalAds = await countAllAds(env);
  const totalPages = Math.max(1, Math.ceil(totalAds / ADMIN_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  return renderAdminAdsSection(env, currentUser, await listAdminAdsPage(env, page), { page, totalPages }, message, currentPath);
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
    return methodNotAllowed();
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
    return methodNotAllowed();
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
    return methodNotAllowed();
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
    const adImages = effectiveAdImages(ad, await listAdImagesByAdId(env, ad.id));
    return renderEditPage(env, currentUser, ad, adImages, null, buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', page));
  }

  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  const adImages = effectiveAdImages(ad, await listAdImagesByAdId(env, ad.id));
  const { title, body, contact, category, type, location_lat, location_lng, location_radius_meters, location_label, images, keep_image_keys, cover_image_key } = await parseAdForm(request);
  const uniqueKeptImageKeys = [...new Set(keep_image_keys)];
  if (uniqueKeptImageKeys.length + images.length > AD_IMAGES_MAX_COUNT) {
    return renderEditPage(
      env,
      currentUser,
      ad,
      adImages,
      `Можно сохранить максимум ${AD_IMAGES_MAX_COUNT} картинок`,
      buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', page)
    );
  }

  if (!title || !body) {
    return renderEditPage(env, currentUser, ad, adImages, 'Заполни заголовок и текст', buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', page));
  }

  let newImages: CompressedAdImageUpload[] = [];
  try {
    const normalizedCategory = normalizeCategory(category);
    const normalizedType = normalizeAdType(type);
    if (images.length > 0) {
      newImages = await readImageUploads(images);
      for (const newImage of newImages) {
        await putCompressedAdImage(env, newImage);
      }
    }

    const keptImages = adImages.filter((image) => uniqueKeptImageKeys.includes(image.image_key));
    const combinedImages = [
      ...keptImages,
      ...newImages.map((image, index): AdImageRow => ({
        id: 0 - (index + 1),
        ad_id: ad.id,
        image_key: image.key,
        image_mime_type: image.mimeType,
        sort_order: keptImages.length + index,
        created_at: ad.updated_at,
      })),
    ];
    const explicitCoverImage = combinedImages.find((image) => image.image_key === cover_image_key);
    const nextCoverImage = explicitCoverImage ?? combinedImages[0] ?? null;
    const oldImageKey = ad.image_key;
    await env.DB.prepare(
      `
        UPDATE ads
        SET title = ?,
            body = ?,
            contact = ?,
            category = ?,
            type = ?,
            location_lat = ?,
            location_lng = ?,
            location_radius_meters = ?,
            location_label = ?,
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
        location_lat,
        location_lng,
        location_radius_meters,
        location_label || null,
        nextCoverImage?.image_key ?? null,
        nextCoverImage?.image_mime_type ?? null,
        nextCoverImage?.image_key ?? null,
        numericId
      )
      .run();

    if (newImages.length > 0 || keptImages.length !== adImages.length) {
      try {
        await env.DB.prepare(`DELETE FROM ad_images WHERE ad_id = ?`).bind(ad.id).run();
        for (const [index, image] of combinedImages.entries()) {
          await env.DB.prepare(
            `INSERT INTO ad_images (ad_id, image_key, image_mime_type, sort_order, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
          )
            .bind(ad.id, image.image_key, image.image_mime_type, index)
            .run();
        }
      } catch (error) {
        if (!isMissingAdImagesTableError(error)) {
          throw error;
        }
      }
      for (const image of adImages) {
        if (uniqueKeptImageKeys.includes(image.image_key)) {
          continue;
        }
        await deleteAdImage(env, image.image_key);
      }
      if (oldImageKey && oldImageKey !== nextCoverImage?.image_key && !combinedImages.some((image) => image.image_key === oldImageKey)) {
        await deleteAdImage(env, oldImageKey);
      }
    }
  } catch (error) {
    for (const newImage of newImages) {
      await deleteAdImage(env, newImage.key);
    }
    console.error('Failed to update admin ad with image', error);
    return renderEditPage(env, currentUser, ad, adImages, 'Не удалось сохранить картинку', buildAdminActionUrl(`/admin/edit/${ad.id}`, 'ads', page));
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
    return methodNotAllowed();
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

  const url = new URL(request.url);
  return renderSettingsPage(env, currentUser, telegramIdentity, emailIdentity, message, pendingTelegramAuth, `${url.pathname}${url.search}`);
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
    authUrl,
    null,
    `${url.pathname}${url.search}`
  );
}

async function handleAboutGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  return renderAboutPage(currentUser, getCurrentCityFromRequest(request, currentUser), new URL(request.url).pathname);
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

async function handleCityGet(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  const currentCity = getCurrentCityFromRequest(request, currentUser);
  const nextPath = new URL(request.url).searchParams.get('next') || '/';
  return renderCityPage(currentUser, currentCity, null, nextPath);
}

async function handleCityPost(request: Request, env: Env): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  const form = await request.formData();
  const nextPath = String(form.get('next') || '/');
  const city = normalizeCity(String(form.get('city') || ''));

  if (currentUser) {
    await updateUserCity(env, currentUser.id, city);
  }

  const response = redirect(buildCityLocation(nextPath, city));
  response.headers.set('Set-Cookie', buildCityCookie(city, request.url.startsWith('https://')));
  return response;
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

type LocationSearchResult = {
  label: string;
  display_name: string;
  lat: number;
  lng: number;
};

function buildLocationSearchUrl(query: string, city: string | null): URL {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'ru');
  url.searchParams.set('accept-language', 'ru');

  const citySlug = normalizeCity(city);
  const center = cityMapCenter(citySlug);
  const latitudeSpread = 0.6;
  const longitudeSpread = 0.9;
  url.searchParams.set(
    'viewbox',
    [
      center.lng - longitudeSpread,
      center.lat + latitudeSpread,
      center.lng + longitudeSpread,
      center.lat - latitudeSpread,
    ].join(',')
  );

  return url;
}

async function handleLocationSearchGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim() || '';
  const city = url.searchParams.get('city');
  if (!query) {
    return json({ error: 'query is required' }, { status: 400 });
  }

  const searchUrl = buildLocationSearchUrl(query, city);
  const response = await fetch(searchUrl.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'georgelist/1.0',
    },
  });

  if (!response.ok) {
    return json({ error: 'geocode failed' }, { status: 502 });
  }

  const results = (await response.json().catch(() => [])) as Array<{
    display_name?: string;
    lat?: string;
    lon?: string;
  }>;

  return json({
    ok: true,
    results: results
      .map((item) => {
        const lat = Number(item.lat);
        const lng = Number(item.lon);
        const displayName = String(item.display_name || '').trim();
        if (!displayName || !Number.isFinite(lat) || !Number.isFinite(lng)) {
          return null;
        }

        const label = displayName.split(',').slice(0, 2).join(', ').trim() || displayName;
        return {
          label,
          display_name: displayName,
          lat,
          lng,
        };
      })
      .filter((item): item is LocationSearchResult => item !== null),
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

  const ad = await createAd(env, ctx, title, body, null, CITY_DEFAULT_SLUG, category, type, null, [], null);
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

  const url = new URL(request.url);
  return renderNewPage(currentUser, getCurrentCityFromRequest(request, currentUser), null, `${url.pathname}${url.search}`);
}

async function handleNewPost(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const currentUser = await getCurrentUser(request, env);
  if (!currentUser) {
    return redirect('/login?next=/new');
  }

  const { title, body, contact, city, category, type, location_lat, location_lng, location_radius_meters, location_label, images } = await parseAdForm(request);
  const currentCity = normalizeCity(getCurrentCityFromRequest(request, currentUser));

  if (!title || !body) {
    return renderNewPage(currentUser, currentCity, 'Заполни заголовок и текст');
  }

  try {
    await createAd(
      env,
      ctx,
      title,
      body,
      contact,
      city || currentCity,
      category,
      type,
      currentUser.id,
      images,
      {
        location_lat,
        location_lng,
        location_radius_meters,
        location_label,
      }
    );
  } catch (error) {
    console.error('Failed to create ad with image', error);
    return renderNewPage(currentUser, currentCity, 'Не удалось загрузить картинку');
  }
  return redirectWithMessage('/my', 'Объявление создано');
}

async function handleCategoryGet(request: Request, env: Env, slug: string, currentUser: CurrentUser | null = null): Promise<Response> {
  const currentCity = getCurrentCityFromRequest(request, currentUser);
  const category = CATEGORIES.find((item) => item.slug === slug);
  if (!category) {
    return renderNotFoundPage(currentUser, currentCity, new URL(request.url).pathname);
  }

  const typeFilter = new URL(request.url).searchParams.get('type');
  const normalizedTypeFilter = typeFilter ? normalizeAdType(typeFilter) : null;
  const ads = normalizedTypeFilter
    ? await listPublishedAdsByCategoryAndType(env, slug, normalizedTypeFilter, currentCity)
    : await listPublishedAdsByCategory(env, slug, currentCity);
  const url = new URL(request.url);
  return renderCategoryPage(env, slug, ads, currentUser, normalizedTypeFilter, currentCity, `${url.pathname}${url.search}`);
}

async function handleAdGet(
  request: Request,
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
    return renderNotFoundPage(currentUser, getCurrentCityFromRequest(request, currentUser), new URL(request.url).pathname);
  }

  const adImageKeysRaw = (await listAdImagesByAdId(env, ad.id)).map((image) => image.image_key);
  const adImageKeys = adImageKeysRaw.length > 0 ? adImageKeysRaw : ad.image_key ? [ad.image_key] : [];
  const canMessageAuthor = Boolean(ad.owner_user_id && (await findTelegramIdentityByUserId(env, ad.owner_user_id)));
  const currentUserHasTelegram = currentUser ? Boolean(await findTelegramIdentityByUserId(env, currentUser.id)) : false;
  const currentCity = getCurrentCityFromRequest(request, currentUser);
  const url = new URL(request.url);
  return renderPublicAdPage(env, ad, adImageKeys, currentUser, canMessageAuthor, currentUserHasTelegram, message, currentCity, `${url.pathname}${url.search}`);
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
    return renderNotFoundPage(currentUser, currentUser ? currentUser.city : CITY_DEFAULT_SLUG, new URL(request.url).pathname);
  }

  const adImageKeysRaw = (await listAdImagesByAdId(env, ad.id)).map((image) => image.image_key);
  const adImageKeys = adImageKeysRaw.length > 0 ? adImageKeysRaw : ad.image_key ? [ad.image_key] : [];
  const canMessageAuthor = Boolean(ad.owner_user_id && (await findTelegramIdentityByUserId(env, ad.owner_user_id)));
  const currentUserHasTelegram = Boolean(await findTelegramIdentityByUserId(env, currentUser.id));

  if (!ad.owner_user_id) {
    return renderPublicAdPage(env, ad, adImageKeys, currentUser, canMessageAuthor, currentUserHasTelegram, 'У объявления не указан автор', currentUser.city, new URL(request.url).pathname);
  }

  if (ad.owner_user_id === currentUser.id) {
    return renderPublicAdPage(env, ad, adImageKeys, currentUser, canMessageAuthor, currentUserHasTelegram, 'Нельзя написать самому себе', currentUser.city, new URL(request.url).pathname);
  }

  if (!currentUserHasTelegram) {
    return renderPublicAdPage(
      env,
      ad,
      adImageKeys,
      currentUser,
      canMessageAuthor,
      currentUserHasTelegram,
      'Чтобы написать продавцу в Telegram, подключи Telegram-бот в настройках',
      currentUser.city,
      new URL(request.url).pathname
    );
  }

  const form = await request.formData();
  const message = String(form.get('message') || '').trim();
  if (!message) {
    return renderPublicAdPage(env, ad, adImageKeys, currentUser, canMessageAuthor, currentUserHasTelegram, 'Введите текст сообщения', currentUser.city, new URL(request.url).pathname);
  }

  if (message.length > AD_MESSAGE_MAX_LENGTH) {
    return renderPublicAdPage(env, ad, adImageKeys, currentUser, canMessageAuthor, currentUserHasTelegram, 'Сообщение слишком длинное', currentUser.city, new URL(request.url).pathname);
  }

  const telegramIdentity = await findTelegramIdentityByUserId(env, ad.owner_user_id);
  const chatId = Number(telegramIdentity?.provider_user_id || '');
  if (!telegramIdentity?.provider_user_id || !Number.isInteger(chatId) || chatId <= 0) {
    return renderPublicAdPage(env, ad, adImageKeys, currentUser, false, currentUserHasTelegram, 'У продавца не подключён Telegram-бот', currentUser.city, new URL(request.url).pathname);
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
    return renderPublicAdPage(env, ad, adImageKeys, currentUser, canMessageAuthor, currentUserHasTelegram, 'Не удалось отправить сообщение', currentUser.city, new URL(request.url).pathname);
  }

  return redirectWithMessage(`/ad/${ad.id}`, 'Сообщение отправлено в Telegram продавцу');
}

async function handlePublicUserGet(request: Request, env: Env, login: string, currentUser: CurrentUser | null = null): Promise<Response> {
  let decodedLogin = login;
  try {
    decodedLogin = decodeURIComponent(login);
  } catch {
    return text('Not Found', 404);
  }

  const user = await getPublicUserByLogin(env, decodedLogin);
  if (!user) {
    return renderNotFoundPage(currentUser, getCurrentCityFromRequest(request, currentUser), new URL(request.url).pathname);
  }

  const url = new URL(request.url);
  return renderPublicUserPage(env, user, await listPublishedAdsByUser(env, user.id, getCurrentCityFromRequest(request, currentUser)), currentUser, getCurrentCityFromRequest(request, currentUser), `${url.pathname}${url.search}`);
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

async function handlePublicGetRoute(
  request: Request,
  env: Env,
  path: string,
  url: URL,
  getCurrentUserCached: () => Promise<CurrentUser | null>
): Promise<Response | null> {
  if (path === '/') {
    const currentUser = await getCurrentUserCached();
    const currentUrl = new URL(request.url);
    return renderHome(currentUser, getCurrentCityFromRequest(request, currentUser), `${currentUrl.pathname}${currentUrl.search}`);
  }

  if (path === '/about') {
    return handleAboutGet(request, env);
  }

  if (path.startsWith('/category/') && request.method === 'GET') {
    return handleCategoryGet(request, env, path.slice('/category/'.length), await getCurrentUserCached());
  }

  if (path.startsWith('/u/') && request.method === 'GET') {
    return handlePublicUserGet(request, env, path.slice('/u/'.length), await getCurrentUserCached());
  }

  if (path.startsWith('/media/') && request.method === 'GET') {
    return handleMediaGet(env, path.slice('/media/'.length));
  }

  if (path === '/search' && request.method === 'GET') {
    const query = url.searchParams.get('q') || '';
    const rawCategory = url.searchParams.get('cat') || '';
    const category = CATEGORIES.some((c) => c.slug === rawCategory) ? rawCategory : '';
    const currentUser = await getCurrentUserCached();
    const currentCity = getCurrentCityFromRequest(request, currentUser);
    return renderSearchPage(
      env,
      query,
      category,
      await searchPublishedAds(env, query, currentCity, category || null),
      currentUser,
      currentCity,
      `${url.pathname}${url.search}`
    );
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      await ensureAdImageColumns(env);
      await ensureAdImagesTable(env);
      await ensureUserAvatarColumns(env);
      await ensureUserCityColumn(env);
      await ensureAdContactColumn(env);
      await ensureAdCityColumn(env);
      await ensureAdLocationColumns(env);
      await ensureAdTypeColumn(env);
      await ensureBotDraftColumns(env);
      await ensureChatTables(env);
      await ensureChatMessageReadColumn(env);
      const url = new URL(request.url);
      const path = url.pathname;
      let currentUserPromise: Promise<CurrentUser | null> | null = null;
      const getCurrentUserCached = async (): Promise<CurrentUser | null> => {
        if (!currentUserPromise) {
          currentUserPromise = getCurrentUser(request, env);
        }
        return currentUserPromise;
      };
      const publicGetRouteResponse = await handlePublicGetRoute(request, env, path, url, getCurrentUserCached);
      if (publicGetRouteResponse) {
        return publicGetRouteResponse;
      }

      if (path === '/register') {
        if (request.method === 'GET') return handleRegisterGet(request, env);
        if (request.method === 'POST') return handleRegisterPost(request, env);
        return methodNotAllowed();
      }

    if (path === '/login') {
      if (request.method === 'GET') return handleLoginGet(request, env);
      if (request.method === 'POST') return handleLoginPost(request, env);
      return methodNotAllowed();
    }

    if (path === '/login/telegram') {
      if (request.method === 'GET') return handleLoginTelegramGet(request, env);
      return methodNotAllowed();
    }

    if (path === '/register/telegram') {
      if (request.method === 'GET') return handleRegisterTelegramGet(request, env);
      return methodNotAllowed();
    }

    if (path === '/logout') {
      if (request.method === 'POST') return handleLogoutPost(request, env);
      return methodNotAllowed();
    }

    if (path === '/my') {
      if (request.method === 'GET') return handleMyGet(request, env);
      return methodNotAllowed();
    }

    if (path === '/settings') {
      if (request.method === 'GET') return handleSettingsGet(request, env);
      if (request.method === 'POST') return handleSettingsPost(request, env);
      return methodNotAllowed();
    }

    if (path === '/settings/avatar') {
      if (request.method === 'POST') return handleSettingsAvatarPost(request, env);
      return methodNotAllowed();
    }

    if (path === '/settings/password') {
      if (request.method === 'POST') return handleSettingsPasswordPost(request, env);
      return methodNotAllowed();
    }

    if (path === '/settings/avatar/delete') {
      if (request.method === 'POST') return handleSettingsAvatarDeletePost(request, env);
      return methodNotAllowed();
    }

    if (path === '/admin') {
      if (request.method === 'GET') return handleAdminGet(request, env);
      return methodNotAllowed();
    }

    if (path.startsWith('/admin/publish/')) {
      return handleAdminAdStatusRoute(request, env, path.slice('/admin/publish/'.length), 'published');
    }

    if (path.startsWith('/admin/reject/')) {
      return handleAdminAdStatusRoute(request, env, path.slice('/admin/reject/'.length), 'rejected');
    }

    if (path === '/settings/link-telegram') {
      if (request.method === 'GET') return handleSettingsLinkTelegramGet(request, env);
      return methodNotAllowed();
    }

    if (path === '/settings/link-telegram/confirm') {
      if (request.method === 'POST') return handleSettingsLinkTelegramConfirmPost(request, env);
      return methodNotAllowed();
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
      return methodNotAllowed();
    }

    if (path === '/api/location-search' && request.method === 'GET') {
      return handleLocationSearchGet(request);
    }

    if (path.startsWith('/ad/') && path.endsWith('/message')) {
      if (request.method === 'POST') {
        return handleAdMessagePost(request, env, path.slice('/ad/'.length, -'/message'.length), await getCurrentUserCached());
      }
      return methodNotAllowed();
    }

    if (path.startsWith('/ad/') && request.method === 'GET') {
      return handleAdGet(request, env, path.slice('/ad/'.length), await getCurrentUserCached(), url.searchParams.get('message'));
    }

    if (path === '/city') {
      if (request.method === 'GET') return handleCityGet(request, env);
      if (request.method === 'POST') return handleCityPost(request, env);
      return methodNotAllowed();
    }

    if (path === '/api/ads') {
      if (request.method === 'GET') return handleApiAdsGet(env);
      if (request.method === 'POST') return handleApiAdsPost(request, env, ctx);
      return methodNotAllowed();
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

      return renderNotFoundPage(await getCurrentUserCached());
    } catch (error) {
      console.error('Unhandled worker error', error);
      return text('Internal Server Error', 500);
    }
  },
} satisfies ExportedHandler<Env>;
