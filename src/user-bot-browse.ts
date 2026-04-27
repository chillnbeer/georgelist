import { categoryLabel, getSectionLabel, normalizeCategory, typeLabel } from './ad-taxonomy';
import { buildAdLocationSummary } from './ad-location';
import { cityLabel } from './cities';
import {
  getPublishedAdCardById,
  listPublishedAdsByCategoryPage,
  searchPublishedAdsPage,
} from './db';
import {
  BOT_ADS_PAGE_SIZE,
  USER_BOT_CHAT_START_PREFIX,
  USER_BOT_MENU_SEARCH,
  USER_BOT_MENU_SECTIONS,
  USER_BOT_SEARCH_MORE_PREFIX,
  USER_BOT_SECTION_AD_PREFIX,
  USER_BOT_SECTION_MORE_PREFIX,
} from './constants';
import { buildMediaUrl, buildPublicSiteUrl } from './site-url';
import type { AdCardRow, AdRow, Env, PublicAdCardRow } from './types';
import { truncateText } from './utils';
import { showUserBotPhotoScreen, showUserBotScreen } from './user-bot-screen';
import {
  userBotBrowseSectionMarkup,
  userBotCancelHomeMarkup,
  userBotSearchAdMarkup,
  userBotSectionAdMarkup,
  userBotSectionsMarkup,
} from './user-bot-ui';
import {
  findTelegramIdentity,
  findTelegramIdentityByUserId,
  getTelegramUserCity,
} from './user-identity';

export async function sendUserBotSections(env: Env, telegramUserId: string, chatId: number): Promise<void> {
  await showUserBotScreen(env, telegramUserId, chatId, 'Объявления', userBotSectionsMarkup());
}

export async function sendUserBotBrowseSection(env: Env, telegramUserId: string, chatId: number, sectionSlug: string): Promise<void> {
  const sectionLabel = getSectionLabel(sectionSlug);
  await showUserBotScreen(env, telegramUserId, chatId, sectionLabel, userBotBrowseSectionMarkup(sectionSlug));
}

export async function sendUserBotSearchPrompt(
  env: Env,
  telegramUserId: string,
  chatId: number,
  message: string | null = null,
  fallbackMessageId: number | null = null
): Promise<void> {
  const lines = [...(message ? [message, ''] : []), 'Введи текст для поиска'];
  await showUserBotScreen(env, telegramUserId, chatId, lines.join('\n'), userBotCancelHomeMarkup(), fallbackMessageId);
}

export function buildUserBotAdListText(
  title: string,
  ads: Array<{
    id: number;
    title: string;
    city: string | null;
    category: string | null;
    type: string | null;
    location_lat: number | null;
    location_lng: number | null;
    location_radius_meters: number | null;
    location_label: string | null;
    author_login?: string | null;
    status?: string | null;
  }>,
  offset = 0,
  hasMore = false,
  moreLabel: string | null = null
): string {
  const lines = [title];

  if (!ads.length) {
    lines.push('', 'Пока ничего нет');
    return lines.join('\n');
  }

  for (const [index, ad] of ads.entries()) {
    const number = offset + index + 1;
    const meta = [ad.city ? cityLabel(ad.city) : null, ad.type ? `Тип: ${typeLabel(ad.type)}` : null, ad.category ? categoryLabel(ad.category) : null, ad.author_login ? `Автор: ${ad.author_login}` : null, ad.status ? `Статус: ${ad.status}` : null]
      .filter((value): value is string => value !== null)
      .join(' · ');
    lines.push('', `${number}. ${ad.title}`);
    if (meta) {
      lines.push(meta);
    }
    const location = buildAdLocationSummary(ad as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>);
    if (location) {
      lines.push(`Зона встречи: ${location}`);
    }
  }

  if (hasMore && moreLabel) {
    lines.push('', moreLabel);
  }

  return lines.join('\n');
}

async function sendUserBotAdCards(
  env: Env,
  telegramUserId: string,
  chatId: number,
  title: string,
  ads: AdCardRow[],
  hasMore: boolean,
  moreCallbackData: string,
  backRow: Array<{ text: string; callback_data: string }>,
  offset = 0
): Promise<void> {
  const markupRows: Array<Array<{ text: string; callback_data: string }>> = [];

  for (const ad of ads) {
    markupRows.push([{ text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_SECTION_AD_PREFIX}${ad.category}:${ad.id}` }]);
  }

  if (hasMore) {
    markupRows.push([{ text: 'Показать ещё', callback_data: moreCallbackData }]);
  }
  markupRows.push(backRow);

  await showUserBotScreen(
    env,
    telegramUserId,
    chatId,
    buildUserBotAdListText(title, ads, offset, hasMore, hasMore ? 'Ещё есть объявления' : null),
    { inline_keyboard: markupRows }
  );
}

export async function sendUserBotSearchResults(env: Env, telegramUserId: string, chatId: number, query: string, offset = 0): Promise<void> {
  const city = await getTelegramUserCity(env, telegramUserId);
  const ads = await searchPublishedAdsPage(env, query, BOT_ADS_PAGE_SIZE + 1, offset, city);
  const hasMore = ads.length > BOT_ADS_PAGE_SIZE;
  const page = ads.slice(0, BOT_ADS_PAGE_SIZE);

  if (!page.length) {
    await showUserBotScreen(
      env,
      telegramUserId,
      chatId,
      offset === 0 ? `Поиск: ${query.trim()}\n\nНичего не найдено` : `Поиск: ${query.trim()}\n\nБольше объявлений нет`,
      {
        inline_keyboard: [
          [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }],
          [{ text: 'Назад', callback_data: USER_BOT_MENU_SEARCH }],
        ],
      }
    );
    return;
  }

  await sendUserBotAdCards(
    env,
    telegramUserId,
    chatId,
    `Поиск: ${query.trim()}`,
    page,
    hasMore,
    `${USER_BOT_SEARCH_MORE_PREFIX}${offset + BOT_ADS_PAGE_SIZE}`,
    [{ text: 'Назад', callback_data: USER_BOT_MENU_SEARCH }],
    offset
  );
}

function buildUserBotPublicAdText(
  ad: Pick<PublicAdCardRow, 'title' | 'body' | 'contact' | 'category' | 'type' | 'author_login' | 'created_at' | 'city' | 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>
): string {
  const location = buildAdLocationSummary(ad as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>);
  return [
    `Город: ${cityLabel(ad.city)}`,
    `Тип: ${typeLabel(ad.type)}`,
    `Заголовок: ${ad.title}`,
    `Категория: ${categoryLabel(ad.category)}`,
    location ? `Зона встречи: ${location}` : null,
    ad.author_login ? `Автор: ${ad.author_login}` : null,
    'Текст:',
    truncateText(ad.body, 700),
    ad.contact ? `Контакты: ${ad.contact}` : null,
    `Дата: ${ad.created_at}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

async function sendUserBotPublicAdCard(
  env: Env,
  telegramUserId: string,
  chatId: number,
  ad: PublicAdCardRow,
  replyMarkup: Record<string, unknown>
): Promise<void> {
  const telegramIdentity = await findTelegramIdentity(env, telegramUserId);
  const canStartChat =
    telegramIdentity &&
    ad.owner_user_id !== null &&
    ad.owner_user_id !== telegramIdentity.user_id &&
    Boolean(await findTelegramIdentityByUserId(env, ad.owner_user_id));
  const locationSummary = buildAdLocationSummary(ad as Pick<AdRow, 'location_lat' | 'location_lng' | 'location_radius_meters' | 'location_label'>);
  const inlineKeyboard = Array.isArray((replyMarkup as { inline_keyboard?: unknown }).inline_keyboard)
    ? ((replyMarkup as { inline_keyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> }).inline_keyboard || []).map((row) => [...row])
    : [];

  if (locationSummary) {
    inlineKeyboard.unshift([{ text: 'Открыть карту', url: buildPublicSiteUrl(env, `/ad/${ad.id}`) }]);
  }

  if (canStartChat) {
    inlineKeyboard.unshift([{ text: 'Написать автору', callback_data: `${USER_BOT_CHAT_START_PREFIX}${ad.id}` }]);
  }

  const mergedReplyMarkup = inlineKeyboard.length ? { inline_keyboard: inlineKeyboard } : replyMarkup;

  if (ad.image_key) {
    await showUserBotPhotoScreen(
      env,
      telegramUserId,
      chatId,
      buildMediaUrl(env, ad.image_key),
      [
        `Город: ${cityLabel(ad.city)}`,
        `Тип: ${typeLabel(ad.type)}`,
        `Заголовок: ${ad.title}`,
        `Категория: ${categoryLabel(ad.category)}`,
        locationSummary ? `Зона встречи: ${locationSummary}` : null,
        ad.author_login ? `Автор: ${ad.author_login}` : null,
        truncateText(ad.body, 700),
        ad.contact ? `Контакты: ${ad.contact}` : null,
        `Дата: ${ad.created_at}`,
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
      mergedReplyMarkup
    );
    return;
  }

  const text = buildUserBotPublicAdText(ad);
  await showUserBotScreen(env, telegramUserId, chatId, text, mergedReplyMarkup);
}

export async function sendUserBotSearchAdDetail(env: Env, telegramUserId: string, chatId: number, adId: number): Promise<void> {
  const city = await getTelegramUserCity(env, telegramUserId);
  const ad = await getPublishedAdCardById(env, adId, null, city);
  if (!ad) {
    await showUserBotScreen(env, telegramUserId, chatId, 'Объявление не найдено', {
      inline_keyboard: [
        [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }],
        [{ text: 'Назад', callback_data: USER_BOT_MENU_SEARCH }],
      ],
    });
    return;
  }

  await sendUserBotPublicAdCard(env, telegramUserId, chatId, ad, userBotSearchAdMarkup());
}

export async function sendUserBotSectionAds(env: Env, telegramUserId: string, chatId: number, category: string, offset = 0): Promise<void> {
  const categoryKey = normalizeCategory(category);
  const city = await getTelegramUserCity(env, telegramUserId);
  const ads = await listPublishedAdsByCategoryPage(env, categoryKey, BOT_ADS_PAGE_SIZE + 1, offset, city);
  const hasMore = ads.length > BOT_ADS_PAGE_SIZE;
  const page = ads.slice(0, BOT_ADS_PAGE_SIZE);

  if (!page.length) {
    await showUserBotScreen(
      env,
      telegramUserId,
      chatId,
      offset === 0 ? `${categoryLabel(categoryKey)}\n\nОбъявлений пока нет` : `${categoryLabel(categoryKey)}\n\nБольше объявлений нет`,
      userBotSectionsMarkup()
    );
    return;
  }

  await sendUserBotAdCards(
    env,
    telegramUserId,
    chatId,
    categoryLabel(categoryKey),
    page,
    hasMore,
    `${USER_BOT_SECTION_MORE_PREFIX}${categoryKey}:${offset + BOT_ADS_PAGE_SIZE}`,
    [{ text: 'Назад', callback_data: USER_BOT_MENU_SECTIONS }],
    offset
  );
}

export async function sendUserBotSectionAdDetail(env: Env, telegramUserId: string, chatId: number, category: string, adId: number): Promise<void> {
  const categoryKey = normalizeCategory(category);
  const city = await getTelegramUserCity(env, telegramUserId);
  const ad = await getPublishedAdCardById(env, adId, categoryKey, city);

  if (!ad) {
    await showUserBotScreen(env, telegramUserId, chatId, 'Объявление не найдено', userBotSectionsMarkup());
    return;
  }

  await sendUserBotPublicAdCard(env, telegramUserId, chatId, ad, userBotSectionAdMarkup(categoryKey));
}
