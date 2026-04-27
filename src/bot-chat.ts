import { getChatNotification, upsertChatNotification, type ChatMessageRow } from './chat';
import type { Env } from './types';
import { deleteTelegramMessage, editUserBotMessage, sendUserBotMessageWithId } from './user-bot-api';
import { findTelegramIdentityByUserId } from './user-identity';

export async function storeConversationMessage(
  env: Env,
  conversationId: number,
  senderUserId: number,
  body: string
): Promise<ChatMessageRow> {
  const insert = await env.DB.prepare(
    `
      INSERT INTO bot_chat_messages (
        conversation_id,
        sender_user_id,
        body,
        is_read,
        created_at
      )
      VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
    `
  )
    .bind(conversationId, senderUserId, body)
    .run();

  const rowId = Number(insert.meta.last_row_id);
  const message = await env.DB.prepare(
    `
      SELECT id, conversation_id, sender_user_id, body, is_read, created_at
      FROM bot_chat_messages
      WHERE id = ?
      LIMIT 1
    `
  )
    .bind(rowId)
    .first<ChatMessageRow>();

  if (!message) {
    throw new Error('Failed to store conversation message');
  }

  await env.DB.prepare(
    `
      UPDATE bot_conversations
      SET last_message_sender_user_id = ?,
          last_message_text = ?,
          last_message_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  )
    .bind(senderUserId, body, conversationId)
    .run();

  return message;
}

export async function sendOrUpdateChatNotification(
  env: Env,
  conversationId: number,
  recipientUserId: number,
  recipientChatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<void> {
  const existing = await getChatNotification(env, conversationId, recipientUserId);
  if (existing?.message_id) {
    try {
      await editUserBotMessage(env, recipientChatId, existing.message_id, text, replyMarkup);
      return;
    } catch (error) {
      console.error('Failed to edit chat notification', error);
    }
  }

  const messageId = await sendUserBotMessageWithId(env, recipientChatId, text, replyMarkup);
  if (messageId !== null) {
    await upsertChatNotification(env, conversationId, recipientUserId, messageId);
  }
}

export async function clearChatNotification(
  env: Env,
  conversationId: number,
  userId: number,
  currentMessageId: number | null = null
): Promise<void> {
  const existing = await getChatNotification(env, conversationId, userId);
  if (!existing) {
    return;
  }

  if (currentMessageId !== null && existing.message_id === currentMessageId) {
    return;
  }

  await env.DB.prepare(
    `
      DELETE FROM bot_chat_notifications
      WHERE conversation_id = ?
        AND user_id = ?
    `
  )
    .bind(conversationId, userId)
    .run();

  try {
    const telegramIdentity = await findTelegramIdentityByUserId(env, userId);
    const chatId = Number(telegramIdentity?.provider_user_id || '');
    if (telegramIdentity?.provider_user_id && Number.isInteger(chatId) && chatId > 0) {
      await deleteTelegramMessage(env, chatId, existing.message_id);
    }
  } catch (error) {
    console.error('Failed to clear chat notification', error);
  }
}
