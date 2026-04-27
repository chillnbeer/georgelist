import { convertIndexedToRgb, decode as decodePng } from 'fast-png';
import * as jpeg from 'jpeg-js';
import type { AdImageUpload, CompressedAdImageUpload, Env } from './types';

export const AD_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const AD_IMAGES_MAX_COUNT = 8;
export const USER_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AD_IMAGE_MAX_DIMENSION = 1600;
export const AD_IMAGE_JPEG_QUALITY = 82;

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

function toEightBitPngSamples(samples: Uint8Array | Uint16Array): Uint8Array {
  if (samples instanceof Uint8Array) {
    return samples;
  }

  const output = new Uint8Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    output[index] = samples[index] > 255 ? Math.round(samples[index] / 257) : samples[index];
  }
  return output;
}

export async function compressAdImage(file: File): Promise<CompressedAdImageUpload> {
  const sourceBytes = await file.arrayBuffer();

  try {
    let width = 0;
    let height = 0;
    let rgbaPixels: Uint8Array | null = null;

    if (file.type === 'image/png') {
      const decoded = decodePng(new Uint8Array(sourceBytes));
      width = decoded.width;
      height = decoded.height;
      const channelCount = decoded.palette?.[0]?.length
        ? decoded.palette[0].length
        : typeof (decoded as { channels?: number }).channels === 'number'
          ? (decoded as { channels: number }).channels
          : 4;
      const rawPixels = decoded.palette
        ? convertIndexedToRgb(decoded)
        : toEightBitPngSamples(decoded.data);
      if (channelCount === 4) {
        rgbaPixels = rawPixels;
      } else {
        const pixelCount = width * height;
        const normalized = new Uint8Array(pixelCount * 4);
        for (let index = 0; index < pixelCount; index += 1) {
          const sourceIndex = index * channelCount;
          const targetIndex = index * 4;
          const r = rawPixels[sourceIndex] ?? 0;
          const g = channelCount > 1 ? (rawPixels[sourceIndex + 1] ?? r) : r;
          const b = channelCount > 2 ? (rawPixels[sourceIndex + 2] ?? r) : r;
          const a = channelCount > 3 ? (rawPixels[sourceIndex + 3] ?? 255) : 255;
          normalized[targetIndex] = r;
          normalized[targetIndex + 1] = g;
          normalized[targetIndex + 2] = b;
          normalized[targetIndex + 3] = a;
        }
        rgbaPixels = normalized;
      }
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      const decoded = jpeg.decode(new Uint8Array(sourceBytes), { useTArray: true });
      width = decoded.width;
      height = decoded.height;
      rgbaPixels = new Uint8Array(decoded.data);
    } else {
      throw new Error('Unsupported image type for compression');
    }

    const scale = Math.min(1, AD_IMAGE_MAX_DIMENSION / Math.max(width, height));
    const resizedWidth = Math.max(1, Math.round(width * scale));
    const resizedHeight = Math.max(1, Math.round(height * scale));
    const resizedPixels = resizeRgba(rgbaPixels, width, height, resizedWidth, resizedHeight);
    const flattenedPixels = flattenRgbaToWhite(resizedPixels);
    const encoded = jpeg.encode(
      {
        data: flattenedPixels,
        width: resizedWidth,
        height: resizedHeight,
      },
      AD_IMAGE_JPEG_QUALITY
    );
    const outputBytes = encoded.data.buffer.slice(
      encoded.data.byteOffset,
      encoded.data.byteOffset + encoded.data.byteLength
    ) as ArrayBuffer;
    return {
      key: `ads/${crypto.randomUUID()}.jpg`,
      mimeType: 'image/jpeg',
      bytes: outputBytes,
    };
  } catch {
    return {
      key: `ads/${crypto.randomUUID()}.${getImageExtension(file.type)}`,
      mimeType: file.type,
      bytes: sourceBytes,
    };
  }
}

export async function readImageUpload(file: File | null): Promise<CompressedAdImageUpload | null> {
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
