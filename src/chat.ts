export type ChatThreadRow = {
  id: number;
  ad_id: number;
  user_low_id: number;
  user_high_id: number;
  last_message_sender_user_id: number | null;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatThreadListRow = {
  id: number;
  ad_id: number;
  ad_title: string;
  other_user_id: number;
  other_login: string;
  other_avatar_key: string | null;
  last_message_sender_user_id: number | null;
  last_message_text: string | null;
  last_message_at: string | null;
};

export type ChatMessageRow = {
  id: number;
  conversation_id: number;
  sender_user_id: number;
  body: string;
  is_read: number;
  created_at: string;
};

export type ChatNotificationRow = {
  conversation_id: number;
  user_id: number;
  message_id: number;
  created_at: string;
  updated_at: string;
};

export function normalizeConversationUserIds(userAId: number, userBId: number): [number, number] {
  return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
}

export async function getConversationById(env: { DB: D1Database }, conversationId: number): Promise<ChatThreadRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, ad_id, user_low_id, user_high_id, last_message_sender_user_id, last_message_text, last_message_at, created_at, updated_at
      FROM bot_conversations
      WHERE id = ?
      LIMIT 1
    `
  )
    .bind(conversationId)
    .first<ChatThreadRow>();

  return result ?? null;
}

export async function getConversationForUsers(env: { DB: D1Database }, adId: number, userAId: number, userBId: number): Promise<ChatThreadRow | null> {
  const [lowUserId, highUserId] = normalizeConversationUserIds(userAId, userBId);
  const result = await env.DB.prepare(
    `
      SELECT id, ad_id, user_low_id, user_high_id, last_message_sender_user_id, last_message_text, last_message_at, created_at, updated_at
      FROM bot_conversations
      WHERE ad_id = ?
        AND user_low_id = ?
        AND user_high_id = ?
      LIMIT 1
    `
  )
    .bind(adId, lowUserId, highUserId)
    .first<ChatThreadRow>();

  return result ?? null;
}

export async function getOrCreateConversation(env: { DB: D1Database }, adId: number, userAId: number, userBId: number): Promise<ChatThreadRow> {
  const existing = await getConversationForUsers(env, adId, userAId, userBId);
  if (existing) {
    return existing;
  }

  const [lowUserId, highUserId] = normalizeConversationUserIds(userAId, userBId);
  await env.DB.prepare(
    `
      INSERT INTO bot_conversations (
        ad_id,
        user_low_id,
        user_high_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(ad_id, user_low_id, user_high_id) DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP
    `
  )
    .bind(adId, lowUserId, highUserId)
    .run();

  const created = await getConversationForUsers(env, adId, userAId, userBId);
  if (!created) {
    throw new Error('Failed to create conversation');
  }

  return created;
}

export async function listConversationsForUser(env: { DB: D1Database }, userId: number): Promise<ChatThreadListRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT
        c.id,
        c.ad_id,
        a.title AS ad_title,
        CASE
          WHEN c.user_low_id = ? THEN c.user_high_id
          ELSE c.user_low_id
        END AS other_user_id,
        u.login AS other_login,
        u.avatar_key AS other_avatar_key,
        c.last_message_sender_user_id,
        c.last_message_text,
        c.last_message_at
      FROM bot_conversations c
      JOIN ads a ON a.id = c.ad_id AND a.deleted_at IS NULL
      JOIN users u ON u.id = CASE
        WHEN c.user_low_id = ? THEN c.user_high_id
        ELSE c.user_low_id
      END
      WHERE c.user_low_id = ?
         OR c.user_high_id = ?
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC, c.id DESC
    `
  )
    .bind(userId, userId, userId, userId)
    .all<ChatThreadListRow>();

  return result.results;
}

export async function listConversationMessages(env: { DB: D1Database }, conversationId: number, limit = 8, offset = 0): Promise<ChatMessageRow[]> {
  const result = await env.DB.prepare(
    `
      SELECT id, conversation_id, sender_user_id, body, is_read, created_at
      FROM bot_chat_messages
      WHERE conversation_id = ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `
  )
    .bind(conversationId, limit, offset)
    .all<ChatMessageRow>();

  return result.results.reverse();
}

export async function getChatNotification(env: { DB: D1Database }, conversationId: number, userId: number): Promise<ChatNotificationRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT conversation_id, user_id, message_id, created_at, updated_at
      FROM bot_chat_notifications
      WHERE conversation_id = ?
        AND user_id = ?
      LIMIT 1
    `
  )
    .bind(conversationId, userId)
    .first<ChatNotificationRow>();

  return result ?? null;
}

export async function upsertChatNotification(env: { DB: D1Database }, conversationId: number, userId: number, messageId: number): Promise<void> {
  await env.DB.prepare(
    `
      INSERT INTO bot_chat_notifications (
        conversation_id,
        user_id,
        message_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(conversation_id, user_id) DO UPDATE SET
        message_id = excluded.message_id,
        updated_at = CURRENT_TIMESTAMP
    `
  )
    .bind(conversationId, userId, messageId)
    .run();
}

export async function markConversationMessagesRead(env: { DB: D1Database }, conversationId: number, readerUserId: number): Promise<void> {
  await env.DB.prepare(
    `
      UPDATE bot_chat_messages
      SET is_read = 1
      WHERE conversation_id = ?
        AND sender_user_id != ?
        AND is_read = 0
    `
  )
    .bind(conversationId, readerUserId)
    .run();
}
