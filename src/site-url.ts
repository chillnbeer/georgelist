import type { Env } from './types';

export function getPublicSiteUrl(env: Env): string {
  return (env.PUBLIC_SITE_URL || env.SITE_URL || 'https://georgelist.chillnbeer.workers.dev').replace(/\/+$/, '');
}

export function buildPublicSiteUrl(env: Env, path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getPublicSiteUrl(env)}${normalizedPath}`;
}

export function buildMediaUrl(env: Env, key: string): string {
  return buildPublicSiteUrl(env, `/media/${encodeURIComponent(key)}`);
}
