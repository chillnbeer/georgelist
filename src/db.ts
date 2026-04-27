import { CITY_DEFAULT_SLUG, normalizeCity } from './cities';
import { normalizeAdType } from './ad-taxonomy';
import type { ChatMessageRow } from './chat';
import { upsertChatNotification } from './chat';
import { json } from './http';
import type { AdCardRow, AdImageRow, AdRow, BotDraftRow, CurrentUser, Env, PublicAdCardRow, PublicUserRow, UserIdentityRow } from './types';
import type { CitySlug } from './cities';

export const ADS_HOME_LIMIT = 200;
export const ADS_USER_LIMIT = 100;
export const ADS_SEARCH_LIMIT = 50;

export const AD_SELECT_COLUMNS = `
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

export function escapeLikePattern(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
}

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

export async function ensureAdImageColumns(env: Env): Promise<void> {
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

export async function ensureAdImagesTable(env: Env): Promise<void> {
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

export async function ensureUserAvatarColumns(env: Env): Promise<void> {
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

export async function ensureUserCityColumn(env: Env): Promise<void> {
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

export async function ensureAdContactColumn(env: Env): Promise<void> {
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

export async function ensureAdCityColumn(env: Env): Promise<void> {
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

export async function ensureAdLocationColumns(env: Env): Promise<void> {
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

export async function ensureAdTypeColumn(env: Env): Promise<void> {
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

export async function ensureBotDraftColumns(env: Env): Promise<void> {
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

export async function ensureChatTables(env: Env): Promise<void> {
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

export async function ensureChatMessageReadColumn(env: Env): Promise<void> {
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

export const ADMIN_PAGE_SIZE = 5;

export type AdminUserRow = {
  id: number;
  login: string;
  avatar_key: string | null;
  email: string | null;
  role: string;
  created_at: string;
};

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
          user_id, provider, provider_user_id, email, password_hash, telegram_username, created_at
        )
        VALUES (?, 'telegram', ?, NULL, NULL, ?, CURRENT_TIMESTAMP)
      `
    ).bind(userId, telegramUserId, telegramUsername),
    env.DB.prepare(
      `
        INSERT INTO user_identities (
          user_id, provider, provider_user_id, email, password_hash, telegram_username, created_at
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
            user_id, provider, provider_user_id, email, password_hash, telegram_username, created_at
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
        `UPDATE user_identities SET telegram_username = ? WHERE id = ?`
      )
        .bind(telegramUsername, identityByTelegram.id)
        .run();
    }
    return 'already';
  }

  if (identityByUser) {
    await env.DB.prepare(
      `UPDATE user_identities SET provider_user_id = ?, telegram_username = ? WHERE id = ?`
    )
      .bind(telegramUserId, telegramUsername, identityByUser.id)
      .run();
    return 'linked';
  }

  await env.DB.prepare(
    `
      INSERT INTO user_identities (
        user_id, provider, provider_user_id, email, password_hash, telegram_username, created_at
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
        `UPDATE user_identities SET telegram_username = ? WHERE id = ?`
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
    `UPDATE user_identities SET user_id = ?, telegram_username = ? WHERE id = ?`
  )
    .bind(userId, telegramUsername, identityByTelegram.id)
    .run();

  return 'linked';
}

export async function getBotDraft(env: Env, telegramUserId: string): Promise<BotDraftRow | null> {
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

export async function upsertBotDraft(
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
        telegram_user_id, action, step, ui_chat_id, ui_message_id, ad_id, login, email,
        category, ad_type, reply_user_id, reply_ad_id, password_current, password_new,
        title, body, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        action = excluded.action,
        step = excluded.step,
        ui_chat_id = CASE WHEN excluded.ui_chat_id IS NULL THEN ui_chat_id ELSE excluded.ui_chat_id END,
        ui_message_id = CASE WHEN excluded.ui_message_id IS NULL THEN ui_message_id ELSE excluded.ui_message_id END,
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
      telegramUserId, action, step, uiChatId, uiMessageId, adId, login, email,
      category, adType, replyUserId, replyAdId, passwordCurrent, passwordNew, title, body
    )
    .run();
}

export async function clearBotDraft(env: Env, telegramUserId: string): Promise<void> {
  await env.DB.prepare(
    `
      UPDATE bot_drafts
      SET action = 'idle', step = 'menu', ad_id = NULL, login = NULL, email = NULL,
          category = NULL, ad_type = NULL, reply_user_id = NULL, reply_ad_id = NULL,
          password_current = NULL, password_new = NULL, title = NULL, body = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE telegram_user_id = ?
    `
  )
    .bind(telegramUserId)
    .run();
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
    `UPDATE users SET city = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(normalizedCity, userId)
    .run();
  return normalizedCity;
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
