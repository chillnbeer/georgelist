import { decode as decodePng } from 'fast-png';
import * as jpeg from 'jpeg-js';
import type { Env } from './types';
import type { AdImageUpload, CompressedAdImageUpload } from './types';
import {
  isImageMimeType,
  getImageExtension,
  normalizeMimeType,
  getImageMimeTypeFromPath,
} from './utils';
import {
  AD_IMAGE_MAX_BYTES,
  USER_AVATAR_MAX_BYTES,
  AD_IMAGE_MAX_DIMENSION,
  AD_IMAGE_JPEG_QUALITY,
} from './constants';

export function buildPublicSiteUrl(env: Env, path = '/'): string {
  const base = (env.PUBLIC_SITE_URL || env.SITE_URL || 'https://georgelist.chillnbeer.workers.dev').replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function buildMediaUrl(env: Env, key: string): string {
  return buildPublicSiteUrl(env, `/media/${encodeURIComponent(key)}`);
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

function toRgba(data: Uint8Array, channels: number, pixelCount: number): Uint8Array {
  if (channels === 4) return data;
  const rgba = new Uint8Array(pixelCount * 4);
  for (let i = 0; i < pixelCount; i += 1) {
    const src = i * channels;
    const dst = i * 4;
    if (channels === 1) {
      rgba[dst] = data[src];
      rgba[dst + 1] = data[src];
      rgba[dst + 2] = data[src];
      rgba[dst + 3] = 255;
    } else if (channels === 2) {
      rgba[dst] = data[src];
      rgba[dst + 1] = data[src];
      rgba[dst + 2] = data[src];
      rgba[dst + 3] = data[src + 1];
    } else {
      rgba[dst] = data[src];
      rgba[dst + 1] = data[src + 1];
      rgba[dst + 2] = data[src + 2];
      rgba[dst + 3] = 255;
    }
  }
  return rgba;
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
      rgbaPixels = toRgba(new Uint8Array(decoded.data), decoded.channels, width * height);
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      const decoded = jpeg.decode(new Uint8Array(sourceBytes), { useTArray: true, formatAsRGBA: true });
      width = decoded.width;
      height = decoded.height;
      if (decoded.data.length !== width * height * 4) {
        throw new Error('Unexpected JPEG pixel format');
      }
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

export async function downloadTelegramImage(
  env: Env,
  fileId: string,
  userBotApiFn: (env: Env, method: string, payload: Record<string, unknown>) => Promise<Response>,
  getTelegramUserBotTokenFn: (env: Env) => Promise<string>
): Promise<{ bytes: ArrayBuffer; mimeType: string }> {
  const fileResponse = await userBotApiFn(env, 'getFile', { file_id: fileId });
  if (!fileResponse.ok) {
    throw new Error(`Telegram getFile failed with status ${fileResponse.status}`);
  }

  const payload = (await fileResponse.json()) as { ok?: boolean; result?: { file_path?: string; file_size?: number } };
  const filePath = payload.result?.file_path || null;
  if (!filePath) {
    throw new Error('Telegram file path is missing');
  }

  const token = await getTelegramUserBotTokenFn(env);
  const downloadResponse = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
  if (!downloadResponse.ok) {
    throw new Error(`Telegram file download failed with status ${downloadResponse.status}`);
  }

  const bytes = await downloadResponse.arrayBuffer();
  if (bytes.byteLength > USER_AVATAR_MAX_BYTES) {
    throw new Error('Avatar is too large');
  }

  const mimeType = normalizeMimeType(downloadResponse.headers.get('content-type')) || getImageMimeTypeFromPath(filePath) || 'image/jpeg';
  if (!isImageMimeType(mimeType)) {
    throw new Error('Invalid avatar type');
  }

  return { bytes, mimeType };
}

export async function putTelegramAvatar(
  env: Env,
  fileId: string,
  userBotApiFn: (env: Env, method: string, payload: Record<string, unknown>) => Promise<Response>,
  getTelegramUserBotTokenFn: (env: Env) => Promise<string>
): Promise<AdImageUpload & { bytes: ArrayBuffer }> {
  const { bytes, mimeType } = await downloadTelegramImage(env, fileId, userBotApiFn, getTelegramUserBotTokenFn);
  return {
    key: `avatars/${crypto.randomUUID()}.${getImageExtension(mimeType)}`,
    mimeType,
    bytes,
  };
}
