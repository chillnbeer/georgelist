import { CITY_DEFAULT_SLUG, normalizeCity, type CitySlug } from '../cities';
import { type ChatMessageRow } from '../chat';
import type { Env, CurrentUser, AdRow, PublicAdCardRow, AdCardRow, PublicUserRow, UserIdentityRow, AdminUserRow } from '../types';
import {
  SESSION_MAX_AGE_SECONDS,
  ADS_HOME_LIMIT,
  ADS_USER_LIMIT,
  ADS_SEARCH_LIMIT,
  ADMIN_PAGE_SIZE,
} from '../constants';
import { escapeLikePattern, formatSqliteTimestamp, normalizeAdType } from '../utils';
import { generateSessionToken, hashSessionToken } from '../crypto';
import { json } from '../http';

const AD_SELECT_COLUMNS = `
  id,
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
  owner_user_id,
  status,
  image_key,
  image_mime_type,
  image_updated_at,
  created_at,
  updated_at,
  deleted_at
`;

function parseCookieHeader(cookieHeader: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) continue;
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

// ---- User / session queries ----

export async function findEmailIdentity(env: Env, email: string): Promise<UserIdentityRow | null> {
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

export async function findEmailIdentityByUserId(env: Env, userId: number): Promise<UserIdentityRow | null> {
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

export async function findUserByLogin(env: Env, login: string): Promise<CurrentUser | null> {
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
      FROM users
      WHERE users.login = ?
      LIMIT 1
    `
  )
    .bind(CITY_DEFAULT_SLUG, login)
    .first<CurrentUser>();

  return result ?? null;
}

export async function findUserById(env: Env, userId: number): Promise<CurrentUser | null> {
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
      FROM users
      WHERE users.id = ?
      LIMIT 1
    `
  )
    .bind(CITY_DEFAULT_SLUG, userId)
    .first<CurrentUser>();

  return result ?? null;
}

export async function getCurrentUser(request: Request, env: Env): Promise<CurrentUser | null> {
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

export async function createSessionForUser(env: Env, userId: number): Promise<string> {
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

export async function deleteSessionByToken(env: Env, sessionToken: string): Promise<void> {
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

export async function createEmailUser(
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

// ---- Telegram identity queries ----

export async function findTelegramIdentity(env: Env, providerUserId: string): Promise<UserIdentityRow | null> {
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

export async function createTelegramUser(
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

export async function createTelegramSignupUser(
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

export async function attachTelegramIdentityToUser(
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

export async function relinkTelegramIdentityToUser(
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

export async function findTelegramIdentityByUserId(env: Env, userId: number): Promise<UserIdentityRow | null> {
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

export async function getTelegramIdentityUserId(env: Env, telegramUserId: string): Promise<number | null> {
  const identity = await findTelegramIdentity(env, telegramUserId);
  return identity ? identity.user_id : null;
}

export async function getTelegramUserCity(env: Env, telegramUserId: string): Promise<CitySlug> {
  const userId = await getTelegramIdentityUserId(env, telegramUserId);
  if (!userId) {
    return CITY_DEFAULT_SLUG;
  }

  const user = await findUserById(env, userId);
  return normalizeCity(user?.city);
}

export async function updateUserCity(env: Env, userId: number, city: string): Promise<CitySlug> {
  const normalizedCity = normalizeCity(city);
  await env.DB.prepare(
    `
      UPDATE users
      SET city = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(normalizedCity, userId)
    .run();

  return normalizedCity;
}

// ---- Ad queries ----

export async function getAdById(env: Env, id: number): Promise<AdRow | null> {
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

export async function getPublishedAdCardById(
  env: Env,
  id: number,
  category: string | null = null,
  city: string | null = null
): Promise<PublicAdCardRow | null> {
  const sql = [
    `
      SELECT ads.id,
             ads.title,
             ads.body,
             ads.contact,
             COALESCE(ads.city, ?) AS city,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.location_lat,
             ads.location_lng,
             ads.location_radius_meters,
             ads.location_label,
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

  const params: Array<number | string> = [CITY_DEFAULT_SLUG, id];

  if (category) {
    sql.push('        AND ads.category = ?');
    params.push(category);
  }

  if (city) {
    sql.push('        AND COALESCE(ads.city, ?) = ?');
    params.push(CITY_DEFAULT_SLUG, normalizeCity(city));
  }

  sql.push('      LIMIT 1');

  const statement = await env.DB.prepare(sql.join('\n'));
  const result = await statement.bind(...params).first<PublicAdCardRow>();

  return result ?? null;
}

export async function getPublicUserByLogin(env: Env, login: string): Promise<PublicUserRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id,
             login,
             display_name,
             COALESCE(city, ?) AS city,
             avatar_key,
             avatar_mime_type,
             avatar_updated_at,
             created_at
      FROM users
      WHERE login = ?
      LIMIT 1
    `
  )
    .bind(CITY_DEFAULT_SLUG, login)
    .first<PublicUserRow>();

  return result ?? null;
}

export async function listPublishedAdsByUser(env: Env, userId: number, city: string | null = null): Promise<AdCardRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             COALESCE(ads.city, ?) AS city,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.location_lat,
             ads.location_lng,
             ads.location_radius_meters,
             ads.location_label,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      INNER JOIN users ON users.id = ads.owner_user_id
      WHERE owner_user_id = ?
        AND status = 'published'
        AND deleted_at IS NULL
        AND COALESCE(ads.city, ?) = ?
      ORDER BY ads.created_at DESC, ads.id DESC
      LIMIT ?
    `
  )
    .bind(CITY_DEFAULT_SLUG, userId, CITY_DEFAULT_SLUG, normalizeCity(city), ADS_USER_LIMIT)
    .all<AdCardRow>();

  return result.results ?? [];
}

export async function listPublishedAds(env: Env, city: string | null = null): Promise<AdRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ${AD_SELECT_COLUMNS}
      FROM ads
      WHERE status = 'published'
        AND deleted_at IS NULL
        AND COALESCE(city, ?) = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `
  )
    .bind(CITY_DEFAULT_SLUG, normalizeCity(city), ADS_HOME_LIMIT)
    .all<AdRow>();

  return result.results;
}

export async function listPublishedAdsByCategory(env: Env, category: string, city: string | null = null): Promise<AdCardRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             COALESCE(ads.city, ?) AS city,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.location_lat,
             ads.location_lng,
             ads.location_radius_meters,
             ads.location_label,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.status = 'published'
        AND ads.deleted_at IS NULL
        AND ads.category = ?
        AND COALESCE(ads.city, ?) = ?
      ORDER BY ads.created_at DESC, ads.id DESC
    `
  )
    .bind(CITY_DEFAULT_SLUG, category, CITY_DEFAULT_SLUG, normalizeCity(city))
    .all<AdCardRow>();

  return result.results;
}

export async function listPublishedAdsByCategoryAndType(
  env: Env,
  category: string,
  type: string | null,
  city: string | null = null
): Promise<AdCardRow[]> {
  const normalizedType = type ? normalizeAdType(type) : null;
  const query = normalizedType
    ? `
      SELECT ads.id,
             ads.title,
             COALESCE(ads.city, ?) AS city,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.location_lat,
             ads.location_lng,
             ads.location_radius_meters,
             ads.location_label,
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
        AND COALESCE(ads.city, ?) = ?
      ORDER BY ads.created_at DESC, ads.id DESC
    `
    : `
      SELECT ads.id,
             ads.title,
             COALESCE(ads.city, ?) AS city,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.location_lat,
             ads.location_lng,
             ads.location_radius_meters,
             ads.location_label,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.status = 'published'
        AND ads.deleted_at IS NULL
        AND ads.category = ?
        AND COALESCE(ads.city, ?) = ?
      ORDER BY ads.created_at DESC, ads.id DESC
    `;

  const statement = await env.DB.prepare(query);
  const result = normalizedType
    ? await statement.bind(CITY_DEFAULT_SLUG, category, normalizedType, CITY_DEFAULT_SLUG, normalizeCity(city)).all<AdCardRow>()
    : await statement.bind(CITY_DEFAULT_SLUG, category, CITY_DEFAULT_SLUG, normalizeCity(city)).all<AdCardRow>();

  return result.results;
}

export async function listPublishedAdsByCategoryPage(
  env: Env,
  category: string,
  limit: number,
  offset: number,
  city: string | null = null
): Promise<AdCardRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             COALESCE(ads.city, ?) AS city,
             ads.category,
             COALESCE(ads.type, 'sell') AS type,
             ads.location_lat,
             ads.location_lng,
             ads.location_radius_meters,
             ads.location_label,
             ads.image_key,
             ads.created_at,
             users.login AS author_login,
             users.avatar_key AS author_avatar_key
      FROM ads
      LEFT JOIN users ON users.id = ads.owner_user_id
      WHERE ads.status = 'published'
        AND ads.deleted_at IS NULL
        AND ads.category = ?
        AND COALESCE(ads.city, ?) = ?
      ORDER BY ads.created_at DESC, ads.id DESC
      LIMIT ? OFFSET ?
    `
  )
    .bind(CITY_DEFAULT_SLUG, category, CITY_DEFAULT_SLUG, normalizeCity(city), limit, offset)
    .all<AdCardRow>();

  return result.results;
}

export async function searchPublishedAds(env: Env, query: string, city: string | null = null): Promise<AdCardRow[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const pattern = `%${escapeLikePattern(trimmed.toLowerCase())}%`;
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             COALESCE(ads.city, ?) AS city,
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
        AND COALESCE(ads.city, ?) = ?
        AND (
          LOWER(ads.title) LIKE ? ESCAPE '\\'
          OR LOWER(ads.body) LIKE ? ESCAPE '\\'
        )
      ORDER BY ads.created_at DESC, ads.id DESC
      LIMIT ?
    `
  )
    .bind(CITY_DEFAULT_SLUG, CITY_DEFAULT_SLUG, normalizeCity(city), pattern, pattern, ADS_SEARCH_LIMIT)
    .all<AdCardRow>();

  return result.results;
}

export async function searchPublishedAdsPage(
  env: Env,
  query: string,
  limit: number,
  offset: number,
  city: string | null = null
): Promise<AdCardRow[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const pattern = `%${escapeLikePattern(trimmed.toLowerCase())}%`;
  const result = await env.DB.prepare(
    `
      SELECT ads.id,
             ads.title,
             COALESCE(ads.city, ?) AS city,
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
        AND COALESCE(ads.city, ?) = ?
        AND (
          LOWER(ads.title) LIKE ? ESCAPE '\\'
          OR LOWER(ads.body) LIKE ? ESCAPE '\\'
        )
      ORDER BY ads.created_at DESC, ads.id DESC
      LIMIT ? OFFSET ?
    `
  )
    .bind(CITY_DEFAULT_SLUG, CITY_DEFAULT_SLUG, normalizeCity(city), pattern, pattern, limit, offset)
    .all<AdCardRow>();

  return result.results;
}

export async function listPendingAds(env: Env): Promise<Response> {
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

export async function getOwnedAdById(env: Env, id: number, userId: number): Promise<AdRow | null> {
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

export async function getOwnedAdForTelegramUser(env: Env, telegramUserId: string, adId: number): Promise<AdRow | null> {
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

export async function deleteOwnedAdForTelegramUser(env: Env, telegramUserId: string, adId: number): Promise<boolean> {
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

export async function listMyAds(env: Env, userId: number): Promise<AdRow[]> {
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

// ---- Admin queries ----

export async function countAllUsers(env: Env): Promise<number> {
  const result = await env.DB.prepare(
    `
      SELECT COUNT(*) AS count
      FROM users
    `
  )
    .first<{ count: number }>();

  return result?.count ?? 0;
}

export async function listAdminUsersPage(env: Env, page: number): Promise<AdminUserRow[]> {
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

export async function countAllAds(env: Env): Promise<number> {
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

export async function listAdminAdsPage(env: Env, page: number): Promise<AdRow[]> {
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

export async function listAllUsers(env: Env): Promise<AdminUserRow[]> {
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

// ---- Chat-related DB ops ----

export async function storeConversationMessage(
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
        is_read,
        created_at
      )
      VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
    `
  )
    .bind(conversationId, senderUserId, body)
    .run();

  const rowId = Number(insert.meta.last_row_id);
  const message = await env.DB.prepare(
    `
      SELECT id, conversation_id, sender_user_id, body, is_read, created_at
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
