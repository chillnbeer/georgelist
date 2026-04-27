import { AD_LOCATION_DEFAULT_RADIUS, AD_LOCATION_RADIUS_OPTIONS } from './constants';
import type { AdRow } from './types';

export function normalizeLocationRadius(radius: number | null | undefined): number | null {
  if (radius === null || radius === undefined || !Number.isFinite(radius)) {
    return null;
  }

  const normalized = Math.trunc(radius);
  return AD_LOCATION_RADIUS_OPTIONS.includes(normalized as (typeof AD_LOCATION_RADIUS_OPTIONS)[number])
    ? normalized
    : AD_LOCATION_DEFAULT_RADIUS;
}

export function hasAdLocation(
  ad: Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters'>
): boolean {
  return typeof ad.location_lat === 'number' && Number.isFinite(ad.location_lat)
    && typeof ad.location_lng === 'number' && Number.isFinite(ad.location_lng)
    && typeof ad.location_radius_meters === 'number' && Number.isFinite(ad.location_radius_meters);
}

export function formatLocationRadius(radius: number | null | undefined): string {
  const normalized = normalizeLocationRadius(radius);
  if (normalized === 500) return '500 м';
  if (normalized === 1000) return '1 км';
  if (normalized === 3000) return '3 км';
  if (normalized === 5000) return '5 км';
  return 'зона встречи';
}

export function buildAdLocationSummary(
  ad: Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>
): string | null {
  if (!hasAdLocation(ad)) {
    return null;
  }

  return formatLocationRadius(ad.location_radius_meters);
}

export function buildAdApproximateLocationSummary(
  ad: Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters'>
): string | null {
  if (!hasAdLocation(ad)) {
    return null;
  }

  return `Примерная зона · ${formatLocationRadius(ad.location_radius_meters)}`;
}
