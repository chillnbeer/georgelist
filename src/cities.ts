export const CITIES = [
  { slug: 'ekb', label: 'Екатеринбург' },
  { slug: 'msk', label: 'Москва' },
  { slug: 'spb', label: 'Санкт-Петербург' },
  { slug: 'nsk', label: 'Новосибирск' },
  { slug: 'kzn', label: 'Казань' },
] as const;

export type CitySlug = (typeof CITIES)[number]['slug'];

export const CITY_LABELS = Object.fromEntries(CITIES.map((city) => [city.slug, city.label])) as Record<CitySlug, string>;

export const CITY_COOKIE_NAME = 'city';
export const CITY_DEFAULT_SLUG: CitySlug = 'ekb';

export function normalizeCity(city: string | null | undefined): CitySlug {
  const value = (city || '').trim().toLowerCase();
  return (CITIES.find((item) => item.slug === value)?.slug || CITY_DEFAULT_SLUG) as CitySlug;
}

export function cityLabel(city: string | null | undefined): string {
  const slug = normalizeCity(city);
  return CITY_LABELS[slug] || CITY_LABELS[CITY_DEFAULT_SLUG];
}

export function isValidCity(city: string | null | undefined): boolean {
  return Boolean(city && CITIES.some((item) => item.slug === city));
}

export function buildCityCookie(city: string, secure: boolean): string {
  return [
    `${CITY_COOKIE_NAME}=${encodeURIComponent(city)}`,
    'Path=/',
    'SameSite=Lax',
    'Max-Age=31536000',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function buildCityLocation(nextPath: string, city: string): string {
  const url = new URL(nextPath, 'http://example.com');
  url.searchParams.set('city', normalizeCity(city));
  return url.pathname + (url.search ? url.search : '');
}
