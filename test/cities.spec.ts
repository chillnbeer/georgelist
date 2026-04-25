import { describe, expect, it } from 'vitest';
import { CITY_DEFAULT_SLUG, cityMapCenter, isValidCity, normalizeCity } from '../src/cities';

describe('cities helpers', () => {
  it('normalizes known city slugs with spaces and casing', () => {
    expect(normalizeCity(' MSK ')).toBe('msk');
    expect(normalizeCity('SpB')).toBe('spb');
  });

  it('falls back to default city for unknown values', () => {
    expect(normalizeCity('unknown-city')).toBe(CITY_DEFAULT_SLUG);
    expect(normalizeCity(null)).toBe(CITY_DEFAULT_SLUG);
  });

  it('validates city slugs in a normalized way', () => {
    expect(isValidCity('ekb')).toBe(true);
    expect(isValidCity(' EKB ')).toBe(true);
    expect(isValidCity('')).toBe(false);
    expect(isValidCity('unknown-city')).toBe(false);
  });

  it('returns map center based on normalized city slug', () => {
    const center = cityMapCenter(' MSK ');
    expect(center).toEqual({ lat: 55.7558, lng: 37.6173 });
  });
});
