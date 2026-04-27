import { CITY_DEFAULT_SLUG, normalizeCity } from './cities';
import { normalizeAdType } from './ad-taxonomy';
import { AD_SELECT_COLUMNS, ADS_HOME_LIMIT, ADS_SEARCH_LIMIT, ADS_USER_LIMIT } from './constants';
import { json } from './http';
import type { AdCardRow, AdImageRow, AdRow, Env, PublicAdCardRow, PublicUserRow } from './types';
import { escapeLikePattern } from './utils';

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

export async function listAdImagesByAdId(env: Env, adId: number): Promise<AdImageRow[]> {
  try {
    const result = await env.DB.prepare(
      `
        SELECT id, ad_id, image_key, image_mime_type, sort_order, created_at
        FROM ad_images
        WHERE ad_id = ?
        ORDER BY sort_order ASC, id ASC
      `
    )
      .bind(adId)
      .all<AdImageRow>();
    return result.results ?? [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('no such table: ad_images')) {
      return [];
    }
    throw error;
  }
}

export function effectiveAdImages(ad: Pick<AdRow, 'id' | 'image_key' | 'image_mime_type' | 'created_at'>, images: AdImageRow[]): AdImageRow[] {
  if (images.length > 0) {
    return images;
  }
  if (!ad.image_key) {
    return [];
  }
  return [{
    id: 0,
    ad_id: ad.id,
    image_key: ad.image_key,
    image_mime_type: ad.image_mime_type || 'image/jpeg',
    sort_order: 0,
    created_at: ad.created_at,
  }];
}

export function isMissingAdImagesTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('no such table: ad_images');
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

export async function searchPublishedAds(env: Env, query: string, city: string | null = null, category: string | null = null): Promise<AdCardRow[]> {
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
        AND (? IS NULL OR ads.category = ?)
        AND (
          LOWER(ads.title) LIKE ? ESCAPE '\\'
          OR LOWER(ads.body) LIKE ? ESCAPE '\\'
        )
      ORDER BY ads.created_at DESC, ads.id DESC
      LIMIT ?
    `
  )
    .bind(CITY_DEFAULT_SLUG, CITY_DEFAULT_SLUG, normalizeCity(city), category, category, pattern, pattern, ADS_SEARCH_LIMIT)
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
