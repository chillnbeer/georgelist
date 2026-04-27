import type { BotDraftRow, Env } from './types';

export async function getBotDraft(env: Env, telegramUserId: string): Promise<BotDraftRow | null> {
  const result = await env.DB.prepare(
    `
      SELECT id, telegram_user_id, action, step, ui_chat_id, ui_message_id, ad_id, login, email, category, ad_type, reply_user_id, reply_ad_id, password_current, password_new, title, body, created_at, updated_at
      FROM bot_drafts
      WHERE telegram_user_id = ?
      LIMIT 1
    `
  )
    .bind(telegramUserId)
    .first<BotDraftRow>();

  return result ?? null;
}

export async function upsertBotDraft(
  env: Env,
  telegramUserId: string,
  action: string,
  step: string,
  category: string | null = null,
  title: string | null = null,
  body: string | null = null,
  adId: number | null = null,
  login: string | null = null,
  email: string | null = null,
  uiChatId: number | null = null,
  uiMessageId: number | null = null,
  adType: string | null = null,
  replyUserId: number | null = null,
  replyAdId: number | null = null,
  passwordCurrent: string | null = null,
  passwordNew: string | null = null
): Promise<void> {
  await env.DB.prepare(
    `
      INSERT INTO bot_drafts (
        telegram_user_id,
        action,
        step,
        ui_chat_id,
        ui_message_id,
        ad_id,
        login,
        email,
        category,
        ad_type,
        reply_user_id,
        reply_ad_id,
        password_current,
        password_new,
        title,
        body,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        action = excluded.action,
        step = excluded.step,
        ui_chat_id = CASE
          WHEN excluded.ui_chat_id IS NULL THEN ui_chat_id
          ELSE excluded.ui_chat_id
        END,
        ui_message_id = CASE
          WHEN excluded.ui_message_id IS NULL THEN ui_message_id
          ELSE excluded.ui_message_id
        END,
        ad_id = excluded.ad_id,
        login = excluded.login,
        email = excluded.email,
        category = excluded.category,
        ad_type = excluded.ad_type,
        reply_user_id = excluded.reply_user_id,
        reply_ad_id = excluded.reply_ad_id,
        password_current = excluded.password_current,
        password_new = excluded.password_new,
        title = excluded.title,
        body = excluded.body,
        updated_at = CURRENT_TIMESTAMP
    `
  )
    .bind(
      telegramUserId,
      action,
      step,
      uiChatId,
      uiMessageId,
      adId,
      login,
      email,
      category,
      adType,
      replyUserId,
      replyAdId,
      passwordCurrent,
      passwordNew,
      title,
      body
    )
    .run();
}

export async function clearBotDraft(env: Env, telegramUserId: string): Promise<void> {
  await env.DB.prepare(
    `
      UPDATE bot_drafts
      SET action = 'idle',
          step = 'menu',
          ad_id = NULL,
          login = NULL,
          email = NULL,
          category = NULL,
          ad_type = NULL,
          reply_user_id = NULL,
          reply_ad_id = NULL,
          password_current = NULL,
          password_new = NULL,
          title = NULL,
          body = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE telegram_user_id = ?
    `
  )
    .bind(telegramUserId)
    .run();
}
