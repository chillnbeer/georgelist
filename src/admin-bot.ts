import { CATEGORIES, categoryLabel, normalizeCategory, typeLabel } from './ad-taxonomy';
import { cityLabel } from './cities';
import { CITY_DEFAULT_SLUG } from './cities';
import { ADMIN_BOT_MENU_HOME } from './constants';
import { json } from './http';
import type { AdRow, Env, TelegramUpdate } from './types';
import { truncateText } from './utils';
import { ADMIN_PAGE_SIZE, type AdminSection, type AdminUserRow } from './admin';

export type AdminBotDeps = {
  telegramApi(env: Env, method: string, payload: Record<string, unknown>): Promise<Response>;
  buildMediaUrl(env: Env, key: string): string;
  buildAdLocationSummary(ad: Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>): string | null;
  countAllAds(env: Env): Promise<number>;
  countAllUsers(env: Env): Promise<number>;
  listAdminAdsPage(env: Env, page: number): Promise<AdRow[]>;
  listAdminUsersPage(env: Env, page: number): Promise<AdminUserRow[]>;
  getAdById(env: Env, id: number): Promise<AdRow | null>;
  findUserById(env: Env, userId: number): Promise<{ id: number; login: string; email: string | null; role: string; avatar_key: string | null; created_at: string } | null>;
  getBotDraft(env: Env, telegramUserId: string): Promise<{ action: string; step: string; category: string | null; title: string | null; body: string | null; ad_id: number | null } | null>;
  upsertBotDraft(env: Env, telegramUserId: string, action: string, step: string, category?: string | null, title?: string | null, body?: string | null, adId?: number | null): Promise<void>;
  clearBotDraft(env: Env, telegramUserId: string): Promise<void>;
  deleteAdminAd(env: Env, adId: number): Promise<'deleted' | 'missing' | 'already'>;
  promoteAdminUser(env: Env, userId: number): Promise<'promoted' | 'already' | 'missing'>;
  demoteAdminUser(env: Env, userId: number): Promise<'demoted' | 'already' | 'missing'>;
  deleteAdminUser(env: Env, userId: number): Promise<'deleted' | 'self' | 'missing'>;
  updateAdStatus(env: Env, id: string, status: 'published' | 'rejected'): Promise<Response>;
  notifyAdOwnerStatusChange(env: Env, ad: Pick<AdRow, 'id' | 'title' | 'category' | 'owner_user_id'>, status: 'published' | 'rejected'): Promise<void>;
  sendTelegramMessage(env: Env, ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'city' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label' | 'image_key'>, itemKind?: 'New' | 'Edited'): Promise<void>;
};

export function isAdminTelegramChat(env: Env, chatId: number): boolean {
  return String(chatId) === String(env.TELEGRAM_ADMIN_ID);
}

function adminBotMenuMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Объявления', callback_data: 'admin:ads:page:1' }],
      [{ text: 'Пользователи', callback_data: 'admin:users:page:1' }],
      [{ text: 'Обновить', callback_data: ADMIN_BOT_MENU_HOME }],
    ],
  };
}

function adminBotPageMarkup(section: AdminSection, page: number, totalPages: number): Array<Array<{ text: string; callback_data: string }>> {
  const row: Array<{ text: string; callback_data: string }> = [];
  if (page > 1) {
    row.push({ text: 'Назад', callback_data: `admin:${section}:page:${page - 1}` });
  }
  row.push({ text: `Стр. ${page}/${totalPages}`, callback_data: `admin:${section}:page:${page}` });
  if (page < totalPages) {
    row.push({ text: 'Вперёд', callback_data: `admin:${section}:page:${page + 1}` });
  }
  return [row];
}

function adminBotAdsMarkup(
  ads: Array<{ id: number; title: string }>,
  page: number,
  totalPages: number
): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `admin:ad:${page}:${ad.id}` },
      ]),
      ...adminBotPageMarkup('ads', page, totalPages),
      [{ text: 'Назад', callback_data: ADMIN_BOT_MENU_HOME }],
    ],
  };
}

function adminBotUsersMarkup(
  users: Array<{ id: number; login: string; role: string }>,
  page: number,
  totalPages: number
): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...users.map((user) => [
        { text: `${user.login}${user.role === 'admin' ? ' · admin' : ''}`, callback_data: `admin:user:${page}:${user.id}` },
      ]),
      ...adminBotPageMarkup('users', page, totalPages),
      [{ text: 'Назад', callback_data: ADMIN_BOT_MENU_HOME }],
    ],
  };
}

function adminBotAdMarkup(adId: number, page: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: 'Редактировать', callback_data: `admin:ad:${page}:${adId}:edit` },
        { text: 'Удалить', callback_data: `admin:ad:${page}:${adId}:delete` },
      ],
      [
        { text: 'Publish', callback_data: `admin:ad:${page}:${adId}:publish` },
        { text: 'Reject', callback_data: `admin:ad:${page}:${adId}:reject` },
      ],
      [{ text: 'Назад', callback_data: `admin:ads:page:${page}` }],
    ],
  };
}

function adminBotUserMarkup(userId: number, role: string, page: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      role === 'admin'
        ? [
            { text: 'Сделать user', callback_data: `admin:user:${page}:${userId}:demote` },
            { text: 'Уже admin', callback_data: `admin:user:${page}:${userId}` },
          ]
        : [{ text: 'Сделать admin', callback_data: `admin:user:${page}:${userId}:promote` }],
      [
        { text: 'Удалить', callback_data: `admin:user:${page}:${userId}:delete` },
        { text: 'Назад', callback_data: `admin:users:page:${page}` },
      ],
    ],
  };
}

async function sendAdminBotMessage(
  deps: AdminBotDeps,
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

  const response = await deps.telegramApi(env, 'sendMessage', payload);
  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }
}

async function answerAdminCallbackQuery(deps: AdminBotDeps, env: Env, callbackQueryId: string, text?: string): Promise<void> {
  await deps.telegramApi(env, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}

async function sendAdminBotHome(deps: AdminBotDeps, env: Env, chatId: number, message = 'Админ-панель'): Promise<void> {
  await sendAdminBotMessage(deps, env, chatId, message, adminBotMenuMarkup());
}

async function sendAdminBotAds(deps: AdminBotDeps, env: Env, chatId: number, page = 1): Promise<void> {
  const totalAds = await deps.countAllAds(env);
  const totalPages = Math.max(1, Math.ceil(totalAds / ADMIN_PAGE_SIZE));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const ads = await deps.listAdminAdsPage(env, normalizedPage);
  if (!ads.length) {
    await sendAdminBotMessage(deps, env, chatId, 'Пока нет объявлений', adminBotMenuMarkup());
    return;
  }

  await sendAdminBotMessage(
    deps,
    env,
    chatId,
    `Объявления: страница ${normalizedPage}/${totalPages}`,
    adminBotAdsMarkup(ads.map((ad) => ({ id: ad.id, title: ad.title })), normalizedPage, totalPages)
  );
}

async function sendAdminBotUsers(deps: AdminBotDeps, env: Env, chatId: number, page = 1): Promise<void> {
  const totalUsers = await deps.countAllUsers(env);
  const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_PAGE_SIZE));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const users = await deps.listAdminUsersPage(env, normalizedPage);
  if (!users.length) {
    await sendAdminBotMessage(deps, env, chatId, 'Пока нет пользователей', adminBotMenuMarkup());
    return;
  }

  await sendAdminBotMessage(
    deps,
    env,
    chatId,
    `Пользователи: страница ${normalizedPage}/${totalPages}`,
    adminBotUsersMarkup(users.map((user) => ({ id: user.id, login: user.login, role: user.role })), normalizedPage, totalPages)
  );
}

async function buildAdminBotAdText(
  deps: AdminBotDeps,
  env: Env,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'contact' | 'category' | 'type' | 'status' | 'owner_user_id' | 'deleted_at' | 'image_key' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>,
  bodyLimit = 2800
): Promise<string> {
  const owner = ad.owner_user_id ? await deps.findUserById(env, ad.owner_user_id) : null;
  const location = deps.buildAdLocationSummary(ad);
  return [
    `#${ad.id}`,
    `Заголовок: ${ad.title}`,
    `Тип: ${typeLabel(ad.type)}`,
    `Категория: ${categoryLabel(ad.category)}`,
    `Статус: ${ad.status}`,
    `Owner: ${owner?.login ? `${owner.login} (#${ad.owner_user_id})` : ad.owner_user_id ?? 'none'}`,
    `Удалено: ${ad.deleted_at ? 'yes' : 'no'}`,
    location ? `Зона встречи: ${location}` : null,
    'Текст:',
    truncateText(ad.body, bodyLimit),
    ad.contact ? `Контакты: ${ad.contact}` : null,
  ].filter((line): line is string => line !== null).join('\n');
}

async function sendAdminBotAdDetail(deps: AdminBotDeps, env: Env, chatId: number, ad: AdRow, page: number): Promise<void> {
  const replyMarkup = adminBotAdMarkup(ad.id, page);
  const text = await buildAdminBotAdText(deps, env, ad);

  if (ad.image_key) {
    const response = await deps.telegramApi(env, 'sendPhoto', {
      chat_id: chatId,
      photo: deps.buildMediaUrl(env, ad.image_key),
      caption: await buildAdminBotAdText(deps, env, ad, 700),
      reply_markup: replyMarkup,
    });

    if (!response.ok) {
      throw new Error(`Telegram sendPhoto failed with status ${response.status}`);
    }
    return;
  }

  await sendAdminBotMessage(deps, env, chatId, text, replyMarkup);
}

async function sendAdminBotUserDetail(deps: AdminBotDeps, env: Env, chatId: number, user: AdminUserRow, page: number): Promise<void> {
  const text = [
    `#${user.id}`,
    `Login: ${user.login}`,
    `Email: ${user.email || '—'}`,
    `Role: ${user.role}`,
    `Created: ${user.created_at}`,
  ].join('\n');

  await sendAdminBotMessage(deps, env, chatId, text, adminBotUserMarkup(user.id, user.role, page));
}

function buildTelegramAdText(
  deps: AdminBotDeps,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'city' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>,
  statusLabel: string,
  itemKind: 'New' | 'Edited',
  bodyLimit = 2800
): string {
  const location = deps.buildAdLocationSummary(ad as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>);
  return [
    `Type: ${itemKind}`,
    statusLabel,
    `ID: ${ad.id}`,
    `City: ${cityLabel(ad.city)}`,
    `Title: ${ad.title}`,
    `Ad type: ${typeLabel(ad.type)}`,
    `Category: ${categoryLabel(ad.category)}`,
    location ? `Location: ${location}` : null,
    'Text:',
    truncateText(ad.body, bodyLimit),
  ].join('\n');
}


async function editTelegramMessage(
  deps: AdminBotDeps,
  env: Env,
  chatId: number,
  messageId: number,
  ad: Pick<AdRow, 'id' | 'title' | 'body' | 'category' | 'type' | 'city' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label' | 'image_key'>,
  statusLabel: string,
  itemKind: 'New' | 'Edited' = 'New'
): Promise<void> {
  const response = ad.image_key
    ? await deps.telegramApi(env, 'editMessageCaption', {
        chat_id: chatId,
        message_id: messageId,
        caption: buildTelegramAdText(deps, ad, statusLabel, itemKind, 700),
      })
    : await deps.telegramApi(env, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: buildTelegramAdText(deps, ad, statusLabel, itemKind),
      });

  if (!response.ok) {
    throw new Error(`Telegram editMessage${ad.image_key ? 'Caption' : 'Text'} failed with status ${response.status}`);
  }
}


async function startAdminBotEditFlow(deps: AdminBotDeps, env: Env, chatId: number, adId: number, page: number): Promise<boolean> {
  const ad = await deps.getAdById(env, adId);
  if (!ad) {
    await sendAdminBotHome(deps, env, chatId, 'Объявление не найдено');
    return false;
  }

  await deps.upsertBotDraft(env, String(chatId), `admin-edit:${page}`, 'title', ad.category, ad.title, ad.body, ad.id);
  await sendAdminBotMessage(deps, env, chatId, 'Введи новый заголовок');
  return true;
}

export async function handleAdminBotText(
  deps: AdminBotDeps,
  env: Env,
  chatId: number,
  text: string,
  ctx: ExecutionContext
): Promise<void> {
  const draft = await deps.getBotDraft(env, String(chatId));

  if (!draft || !draft.action.startsWith('admin-edit')) {
    const normalized = text.trim();
    if (normalized === '/start' || normalized === '/menu') {
      await sendAdminBotHome(deps, env, chatId);
      return;
    }

    if (normalized === '/ads') {
      await sendAdminBotAds(deps, env, chatId, 1);
      return;
    }

    if (normalized === '/users') {
      await sendAdminBotUsers(deps, env, chatId, 1);
      return;
    }

    return;
  }

  if (!draft.ad_id) {
    await deps.clearBotDraft(env, String(chatId));
    await sendAdminBotHome(deps, env, chatId, 'Черновик потерян');
    return;
  }

  const originalAd = await deps.getAdById(env, draft.ad_id);

  if (draft.step === 'title') {
    const title = text.trim();
    if (!title) {
      await sendAdminBotMessage(deps, env, chatId, 'Заголовок не должен быть пустым');
      return;
    }

    await deps.upsertBotDraft(env, String(chatId), draft.action, 'body', draft.category, title, draft.body, draft.ad_id);
    await sendAdminBotMessage(deps, env, chatId, 'Введи новый текст');
    return;
  }

  if (draft.step === 'body') {
    const body = text.trim();
    if (!body) {
      await sendAdminBotMessage(deps, env, chatId, 'Текст не должен быть пустым');
      return;
    }

    await deps.upsertBotDraft(env, String(chatId), draft.action, 'category', draft.category, draft.title, body, draft.ad_id);
    await sendAdminBotMessage(deps, env, chatId, `Введи новую категорию: ${CATEGORIES.map((category) => category.slug).join(', ')}`);
    return;
  }

  if (draft.step === 'category') {
    const category = normalizeCategory(text.trim());
    const adId = draft.ad_id;
    const page = Number(draft.action.split(':')[1] || '1');
    const normalizedPage = Number.isInteger(page) && page > 0 ? page : 1;

    const result = await env.DB.prepare(
      `
        UPDATE ads
        SET title = ?,
            body = ?,
            category = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(draft.title || '', draft.body || '', category, adId)
      .run();

    await deps.clearBotDraft(env, String(chatId));

    if ((result.meta.changes ?? 0) === 0) {
      await sendAdminBotAds(deps, env, chatId, normalizedPage);
      return;
    }

    await sendAdminBotAds(deps, env, chatId, normalizedPage);
    ctx.waitUntil(
      deps.sendTelegramMessage(env, {
        id: adId,
        title: draft.title || '',
        body: draft.body || '',
        city: originalAd?.city || CITY_DEFAULT_SLUG,
        category,
        type: originalAd?.type ?? 'sell',
        location_lat: originalAd?.location_lat ?? null,
        location_lng: originalAd?.location_lng ?? null,
        location_radius_meters: originalAd?.location_radius_meters ?? null,
        location_label: originalAd?.location_label ?? null,
        image_key: originalAd?.image_key ?? null,
      }, 'Edited').catch((error: unknown) => {
        console.error('Telegram notification failed after admin edit', error);
      })
    );
  }
}

export async function handleAdminBotCallback(
  deps: AdminBotDeps,
  update: TelegramUpdate,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const callbackQuery = update.callback_query;
  if (!callbackQuery?.data || !callbackQuery.message) {
    return json({ ok: true });
  }

  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  const [action, id] = data.split(':', 2);
  if (id && (action === 'publish' || action === 'reject')) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Invalid id').catch(() => {});
      return json({ ok: true });
    }

    const ad = await deps.getAdById(env, numericId);
    if (!ad) {
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    const status = action === 'publish' ? 'published' : 'rejected';
    const result = await env.DB.prepare(
      `
        UPDATE ads
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND deleted_at IS NULL
      `
    )
      .bind(status, numericId)
      .run();

    if (result.meta.changes === 0) {
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    const itemKind: 'New' | 'Edited' =
      (callbackQuery.message.caption || callbackQuery.message.text || '').startsWith('Type: Edited') ? 'Edited' : 'New';

    try {
      await editTelegramMessage(
        deps,
        env,
        callbackQuery.message.chat.id,
        callbackQuery.message.message_id,
        ad,
        status === 'published' ? 'Published' : 'Rejected',
        itemKind
      );
    } catch (error) {
      console.error('Failed to edit Telegram message', error);
    }

    await deps.notifyAdOwnerStatusChange(env, ad, status);

    await answerAdminCallbackQuery(deps, env, callbackQuery.id, status === 'published' ? 'Published' : 'Rejected').catch(() => {});
    return json({ ok: true });
  }

  if (data === ADMIN_BOT_MENU_HOME) {
    await answerAdminCallbackQuery(deps, env, callbackQuery.id).catch(() => {});
    await sendAdminBotHome(deps, env, chatId);
    return json({ ok: true });
  }

  if (action === 'admin' && id === 'ads' && data.split(':')[2] === 'page') {
    const page = Number(data.split(':')[3] || '1');
    await answerAdminCallbackQuery(deps, env, callbackQuery.id).catch(() => {});
    await sendAdminBotAds(deps, env, chatId, Number.isInteger(page) && page > 0 ? page : 1);
    return json({ ok: true });
  }

  if (action === 'admin' && id === 'users' && data.split(':')[2] === 'page') {
    const page = Number(data.split(':')[3] || '1');
    await answerAdminCallbackQuery(deps, env, callbackQuery.id).catch(() => {});
    await sendAdminBotUsers(deps, env, chatId, Number.isInteger(page) && page > 0 ? page : 1);
    return json({ ok: true });
  }

  if (action === 'admin' && id === 'ad') {
    const page = Number(data.split(':')[2] || '1');
    const adId = Number(data.split(':')[3] || '0');
    const command = data.split(':')[4] || 'view';

    if (!Number.isInteger(page) || page <= 0 || !Number.isInteger(adId) || adId <= 0) {
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Invalid ad').catch(() => {});
      return json({ ok: true });
    }

    if (command === 'edit') {
      const started = await startAdminBotEditFlow(deps, env, chatId, adId, page);
      if (!started) {
        await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Ad not found').catch(() => {});
        return json({ ok: true });
      }

      await answerAdminCallbackQuery(deps, env, callbackQuery.id).catch(() => {});
      return json({ ok: true });
    }

    if (command === 'delete') {
      const result = await deps.deleteAdminAd(env, adId);
      await answerAdminCallbackQuery(
        deps,
        env,
        callbackQuery.id,
        result === 'deleted' ? 'Ad deleted' : result === 'already' ? 'Already deleted' : 'Ad not found'
      ).catch(() => {});
      await sendAdminBotAds(deps, env, chatId, page);
      return json({ ok: true });
    }

    if (command === 'publish' || command === 'reject') {
      const status = command === 'publish' ? 'published' : 'rejected';
      const response = await deps.updateAdStatus(env, String(adId), status);
      if (response.status === 404) {
        await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Ad not found').catch(() => {});
        return json({ ok: true });
      }

      await answerAdminCallbackQuery(deps, env, callbackQuery.id, status === 'published' ? 'Published' : 'Rejected').catch(() => {});
      await sendAdminBotAds(deps, env, chatId, page);
      return json({ ok: true });
    }

    const ad = await deps.getAdById(env, adId);
    if (!ad) {
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Ad not found').catch(() => {});
      return json({ ok: true });
    }

    await answerAdminCallbackQuery(deps, env, callbackQuery.id).catch(() => {});
    await sendAdminBotAdDetail(deps, env, chatId, ad, page);
    return json({ ok: true });
  }

  if (action === 'admin' && id === 'user') {
    const page = Number(data.split(':')[2] || '1');
    const userId = Number(data.split(':')[3] || '0');
    const command = data.split(':')[4] || 'view';

    if (!Number.isInteger(page) || page <= 0 || !Number.isInteger(userId) || userId <= 0) {
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Invalid user').catch(() => {});
      return json({ ok: true });
    }

    if (command === 'promote') {
      const result = await deps.promoteAdminUser(env, userId);
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, result === 'promoted' ? 'Admin added' : result === 'already' ? 'Already admin' : 'User not found').catch(() => {});
      await sendAdminBotUsers(deps, env, chatId, page);
      return json({ ok: true });
    }

    if (command === 'demote') {
      if (userId === chatId) {
        await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Cannot demote yourself').catch(() => {});
        return json({ ok: true });
      }

      const result = await deps.demoteAdminUser(env, userId);
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, result === 'demoted' ? 'User added' : result === 'already' ? 'Already user' : 'User not found').catch(() => {});
      await sendAdminBotUsers(deps, env, chatId, page);
      return json({ ok: true });
    }

    if (command === 'delete') {
      if (userId === chatId) {
        await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Cannot delete yourself').catch(() => {});
        return json({ ok: true });
      }

      const result = await deps.deleteAdminUser(env, userId);
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, result === 'deleted' ? 'User deleted' : 'User not found').catch(() => {});
      await sendAdminBotUsers(deps, env, chatId, page);
      return json({ ok: true });
    }

    const user = await deps.findUserById(env, userId);
    if (!user) {
      await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'User not found').catch(() => {});
      return json({ ok: true });
    }

    await answerAdminCallbackQuery(deps, env, callbackQuery.id).catch(() => {});
    await sendAdminBotUserDetail(deps, env, chatId, {
      id: user.id,
      login: user.login,
      email: user.email,
      role: user.role,
      avatar_key: user.avatar_key,
      created_at: user.created_at,
    }, page);
    return json({ ok: true });
  }

  await answerAdminCallbackQuery(deps, env, callbackQuery.id, 'Unknown action').catch(() => {});
  return json({ ok: true });
}
