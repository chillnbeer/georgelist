import { getBotDraft } from './bot-drafts';
import type { BotDraftRow, Env } from './types';
import {
  editUserBotMediaMessage,
  editUserBotMessage,
  sendUserBotMessageWithId,
  sendUserBotPhotoMessageWithId,
  userBotApi,
} from './user-bot-api';

type UserBotScreenRef = {
  chatId: number;
  messageId: number;
};

function readBotDraftUiRef(draft: BotDraftRow | null): UserBotScreenRef | null {
  if (!draft || draft.ui_chat_id === null || draft.ui_message_id === null) {
    return null;
  }

  return {
    chatId: draft.ui_chat_id,
    messageId: draft.ui_message_id,
  };
}

async function rememberUserBotScreen(env: Env, telegramUserId: string, chatId: number, messageId: number): Promise<void> {
  const existing = await getBotDraft(env, telegramUserId);
  if (!existing) {
    await env.DB.prepare(
      `
        INSERT INTO bot_drafts (
          telegram_user_id,
          action,
          step,
          ui_chat_id,
          ui_message_id,
          created_at,
          updated_at
        )
        VALUES (?, 'idle', 'menu', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
      .bind(telegramUserId, chatId, messageId)
      .run();
    return;
  }

  await env.DB.prepare(
    `
      UPDATE bot_drafts
      SET ui_chat_id = ?,
          ui_message_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE telegram_user_id = ?
    `
  )
    .bind(chatId, messageId, telegramUserId)
    .run();
}

export async function showUserBotScreen(
  env: Env,
  telegramUserId: string,
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>,
  fallbackMessageId: number | null = null
): Promise<void> {
  const draft = await getBotDraft(env, telegramUserId);
  const uiRef = readBotDraftUiRef(draft);

  if (fallbackMessageId !== null) {
    try {
      await editUserBotMessage(env, chatId, fallbackMessageId, text, replyMarkup);
      await rememberUserBotScreen(env, telegramUserId, chatId, fallbackMessageId);
      return;
    } catch (error) {
      console.error('Failed to edit fallback user bot screen', error);
    }
  }

  if (uiRef && uiRef.chatId === chatId) {
    try {
      await editUserBotMessage(env, chatId, uiRef.messageId, text, replyMarkup);
      return;
    } catch (error) {
      console.error('Failed to edit user bot screen', error);
    }
  }

  const messageId = await sendUserBotMessageWithId(env, chatId, text, replyMarkup);
  if (messageId !== null) {
    await rememberUserBotScreen(env, telegramUserId, chatId, messageId);
  }
}

export async function showUserBotPhotoScreen(
  env: Env,
  telegramUserId: string,
  chatId: number,
  photo: string,
  caption: string,
  replyMarkup?: Record<string, unknown>,
  fallbackMessageId: number | null = null
): Promise<void> {
  const draft = await getBotDraft(env, telegramUserId);
  const uiRef = readBotDraftUiRef(draft);

  if (fallbackMessageId !== null) {
    try {
      await editUserBotMediaMessage(env, chatId, fallbackMessageId, photo, caption, replyMarkup);
      await rememberUserBotScreen(env, telegramUserId, chatId, fallbackMessageId);
      return;
    } catch (error) {
      console.error('Failed to edit fallback user bot photo screen', error);
    }
  }

  if (uiRef && uiRef.chatId === chatId) {
    try {
      await editUserBotMediaMessage(env, chatId, uiRef.messageId, photo, caption, replyMarkup);
      return;
    } catch (error) {
      console.error('Failed to edit user bot photo screen', error);
    }
  }

  const messageId = await sendUserBotPhotoMessageWithId(env, chatId, photo, caption, replyMarkup);
  if (messageId !== null) {
    await rememberUserBotScreen(env, telegramUserId, chatId, messageId);
  }
}

export async function answerUserCallbackQuery(env: Env, callbackQueryId: string, text?: string): Promise<void> {
  await userBotApi(env, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}
