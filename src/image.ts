import { convertIndexedToRgb, decode as decodePng } from 'fast-png';
import * as jpeg from 'jpeg-js';
import {
  AD_IMAGE_JPEG_QUALITY,
  AD_IMAGE_MAX_BYTES,
  AD_IMAGE_MAX_DIMENSION,
  AD_IMAGES_MAX_COUNT,
  USER_AVATAR_MAX_BYTES,
} from './constants';
import type { AdImageUpload, CompressedAdImageUpload, Env } from './types';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function isImageMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType);
}

export function getImageExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/avif':
      return 'avif';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}

export function normalizeMimeType(mimeType: string | null | undefined): string | null {
  const normalized = (mimeType || '').split(';', 1)[0].trim().toLowerCase();
  return normalized || null;
}

export function getImageMimeTypeFromPath(filePath: string): string | null {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'avif':
      return 'image/avif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return null;
  }
}

export async function putMediaObject(env: Env, key: string, body: ArrayBuffer, mimeType: string): Promise<void> {
  if (!env.MEDIA_BUCKET) {
    throw new Error('Media bucket is not configured');
  }

  await env.MEDIA_BUCKET.put(key, body, {
    httpMetadata: {
      contentType: mimeType,
    },
  });
}

function resizeRgba(source: Uint8Array, sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): Uint8Array {
  if (sourceWidth === targetWidth && sourceHeight === targetHeight) {
    return source;
  }

  const output = new Uint8Array(targetWidth * targetHeight * 4);
  const xScale = sourceWidth / targetWidth;
  const yScale = sourceHeight / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    const sampleY = (y + 0.5) * yScale - 0.5;
    const clampedY = Math.max(0, Math.min(sourceHeight - 1, sampleY));
    const y0 = Math.floor(clampedY);
    const y1 = Math.min(sourceHeight - 1, y0 + 1);
    const yLerp = clampedY - y0;
    const row0 = y0 * sourceWidth * 4;
    const row1 = y1 * sourceWidth * 4;

    for (let x = 0; x < targetWidth; x += 1) {
      const sampleX = (x + 0.5) * xScale - 0.5;
      const clampedX = Math.max(0, Math.min(sourceWidth - 1, sampleX));
      const x0 = Math.floor(clampedX);
      const x1 = Math.min(sourceWidth - 1, x0 + 1);
      const xLerp = clampedX - x0;

      const base00 = row0 + x0 * 4;
      const base10 = row0 + x1 * 4;
      const base01 = row1 + x0 * 4;
      const base11 = row1 + x1 * 4;
      const outBase = (y * targetWidth + x) * 4;

      for (let channel = 0; channel < 4; channel += 1) {
        const top = source[base00 + channel] * (1 - xLerp) + source[base10 + channel] * xLerp;
        const bottom = source[base01 + channel] * (1 - xLerp) + source[base11 + channel] * xLerp;
        output[outBase + channel] = Math.round(top * (1 - yLerp) + bottom * yLerp);
      }
    }
  }

  return output;
}

function flattenRgbaToWhite(source: Uint8Array): Uint8Array {
  const output = new Uint8Array(source);

  for (let index = 0; index < output.length; index += 4) {
    const alpha = output[index + 3] / 255;
    const inverseAlpha = 1 - alpha;
    output[index] = Math.round(output[index] * alpha + 255 * inverseAlpha);
    output[index + 1] = Math.round(output[index + 1] * alpha + 255 * inverseAlpha);
    output[index + 2] = Math.round(output[index + 2] * alpha + 255 * inverseAlpha);
    output[index + 3] = 255;
  }

  return output;
}

function toEightBitPngSamples(samples: Uint8Array | Uint8ClampedArray | Uint16Array): Uint8Array {
  if (samples instanceof Uint8Array) {
    return samples;
  }

  const output = new Uint8Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    output[index] = samples[index] > 255 ? Math.round(samples[index] / 257) : samples[index];
  }
  return output;
}

async function compressAdImage(file: File): Promise<CompressedAdImageUpload> {
  const sourceBytes = await file.arrayBuffer();

  // Skip CPU-intensive image processing on Cloudflare Workers
  // Just upload the image as-is to avoid resource limit errors
  return {
    key: `ads/${crypto.randomUUID()}.${getImageExtension(file.type)}`,
    mimeType: file.type,
    bytes: sourceBytes,
  };
}

async function readImageUpload(file: File | null): Promise<CompressedAdImageUpload | null> {
  if (!file || file.size <= 0) {
    return null;
  }

  if (file.size > AD_IMAGE_MAX_BYTES) {
    throw new Error('Image is too large');
  }

  if (!isImageMimeType(file.type)) {
    throw new Error('Invalid image type');
  }

  return compressAdImage(file);
}

export async function readImageUploads(files: File[]): Promise<CompressedAdImageUpload[]> {
  const normalizedFiles = files.filter((file) => file.size > 0).slice(0, AD_IMAGES_MAX_COUNT);
  const uploads: CompressedAdImageUpload[] = [];
  for (const file of normalizedFiles) {
    const upload = await readImageUpload(file);
    if (upload) {
      uploads.push(upload);
    }
  }
  return uploads;
}

export async function readAvatarUpload(file: File | null): Promise<AdImageUpload | null> {
  if (!file || file.size <= 0) {
    return null;
  }

  if (file.size > USER_AVATAR_MAX_BYTES) {
    throw new Error('Avatar is too large');
  }

  if (!isImageMimeType(file.type)) {
    throw new Error('Invalid avatar type');
  }

  return {
    key: `avatars/${crypto.randomUUID()}.${getImageExtension(file.type)}`,
    mimeType: file.type,
  };
}

export async function putAdImage(env: Env, upload: AdImageUpload, file: File): Promise<void> {
  await putMediaObject(env, upload.key, await file.arrayBuffer(), upload.mimeType);
}

export async function putCompressedAdImage(env: Env, upload: CompressedAdImageUpload): Promise<void> {
  await putMediaObject(env, upload.key, upload.bytes, upload.mimeType);
}

export async function deleteAdImage(env: Env, key: string | null | undefined): Promise<void> {
  if (!key || !env.MEDIA_BUCKET) {
    return;
  }

  await env.MEDIA_BUCKET.delete(key);
}

export async function deleteAvatarImage(env: Env, key: string | null | undefined): Promise<void> {
  await deleteAdImage(env, key);
}
