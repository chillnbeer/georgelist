import type { Env } from './types';

let cachedTelegramUserBotUsername: string | null = null;
let cachedTelegramUserBotUsernamePromise: Promise<string | null> | null = null;

export function resolveUserBotToken(env: Env): string | undefined {
  return env.USER_TELEGRAM_BOT_TOKEN || env.TELEGRAM_USER_BOT_TOKEN;
}

export async function getTelegramUserBotToken(env: Env): Promise<string> {
  const token = resolveUserBotToken(env);
  if (!token) {
    throw new Error('Missing user Telegram bot token');
  }

  return token;
}

export async function getTelegramUserBotUsername(env: Env): Promise<string | null> {
  if (cachedTelegramUserBotUsername) {
    return cachedTelegramUserBotUsername;
  }

  const configuredUsername = env.USER_TELEGRAM_BOT_USERNAME || env.TELEGRAM_USER_BOT_USERNAME || null;
  if (configuredUsername) {
    cachedTelegramUserBotUsername = configuredUsername;
    return configuredUsername;
  }

  if (!cachedTelegramUserBotUsernamePromise) {
    cachedTelegramUserBotUsernamePromise = (async () => {
      const token = await getTelegramUserBotToken(env);
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { ok?: boolean; result?: { username?: string } };
      const username = data.result?.username || null;
      if (username) {
        cachedTelegramUserBotUsername = username;
      }

      return username;
    })().finally(() => {
      cachedTelegramUserBotUsernamePromise = null;
    });
  }

  return cachedTelegramUserBotUsernamePromise;
}

export async function userBotApi(env: Env, method: string, payload: Record<string, unknown>): Promise<Response> {
  const token = resolveUserBotToken(env);

  if (!token) {
    throw new Error('Missing user Telegram bot token');
  }

  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function sendUserBotMessage(
  env: Env,
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'sendMessage', payload);
  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }
}

export async function sendUserBotMessageWithId(
  env: Env,
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<number | null> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'sendMessage', payload);
  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }

  const body = (await response.json().catch(() => null)) as { ok?: boolean; result?: { message_id?: number } } | null;
  return typeof body?.result?.message_id === 'number' ? body.result.message_id : null;
}

export async function sendUserBotDocument(
  env: Env,
  chatId: number,
  file: File,
  caption?: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const payload = new FormData();
  payload.set('chat_id', String(chatId));
  payload.set('document', file, file.name);

  if (caption) {
    payload.set('caption', caption);
  }

  if (replyMarkup) {
    payload.set('reply_markup', JSON.stringify(replyMarkup));
  }

  const token = resolveUserBotToken(env);
  if (!token) {
    throw new Error('Missing user Telegram bot token');
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    body: payload,
  });
  if (!response.ok) {
    throw new Error(`Telegram sendDocument failed with status ${response.status}`);
  }
}

export async function editUserBotMessage(
  env: Env,
  chatId: number,
  messageId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'editMessageText', payload);
  if (!response.ok) {
    throw new Error(`Telegram editMessageText failed with status ${response.status}`);
  }
}

export async function sendUserBotPhotoMessageWithId(
  env: Env,
  chatId: number,
  photo: string,
  caption: string,
  replyMarkup?: Record<string, unknown>
): Promise<number | null> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    photo,
    caption,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'sendPhoto', payload);
  if (!response.ok) {
    throw new Error(`Telegram sendPhoto failed with status ${response.status}`);
  }

  const body = (await response.json().catch(() => null)) as { ok?: boolean; result?: { message_id?: number } } | null;
  return typeof body?.result?.message_id === 'number' ? body.result.message_id : null;
}

export async function editUserBotMediaMessage(
  env: Env,
  chatId: number,
  messageId: number,
  photo: string,
  caption: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    media: {
      type: 'photo',
      media: photo,
      caption,
    },
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await userBotApi(env, 'editMessageMedia', payload);
  if (!response.ok) {
    throw new Error(`Telegram editMessageMedia failed with status ${response.status}`);
  }
}

export async function deleteTelegramMessage(env: Env, chatId: number, messageId: number): Promise<void> {
  const response = await userBotApi(env, 'deleteMessage', {
    chat_id: chatId,
    message_id: messageId,
  });

  if (!response.ok) {
    throw new Error(`Telegram deleteMessage failed with status ${response.status}`);
  }
}
