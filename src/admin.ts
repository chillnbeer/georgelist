import type { AdRow, Env } from './types';

export type AdminUserRow = {
  id: number;
  login: string;
  email: string | null;
  avatar_key: string | null;
  role: string;
  created_at: string;
};

export type AdminSection = 'users' | 'ads';

export type AdminPagination = {
  page: number;
  totalPages: number;
};

export const ADMIN_PAGE_SIZE = 5;

export function parseAdminSection(value: string | null): AdminSection {
  return value === 'users' ? 'users' : 'ads';
}

export function parseAdminPage(value: string | null): number {
  const page = Number(value || '1');
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function buildAdminUrl(section: AdminSection, page: number, message: string | null = null): string {
  const params = new URLSearchParams({
    section,
    page: String(page),
  });

  if (message) {
    params.set('message', message);
  }

  return `/admin?${params.toString()}`;
}

export function buildAdminActionUrl(path: string, section: AdminSection, page: number): string {
  const params = new URLSearchParams({
    section,
    page: String(page),
  });

  return `${path}?${params.toString()}`;
}

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
