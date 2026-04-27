import { CITY_DEFAULT_SLUG, normalizeCity, type CitySlug } from './cities';
import type { CurrentUser, Env, UserIdentityRow } from './types';

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidLogin(login: string): boolean {
  return /^[a-zA-Z0-9_]{3,32}$/.test(login);
}

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
