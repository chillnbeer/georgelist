import { buildCategoryRows, buildTypeRows } from './ad-taxonomy';
import { CITIES, normalizeCity } from './cities';
import type { ChatMessageRow, ChatThreadListRow, ChatThreadRow } from './chat';
import {
  USER_BOT_CANCEL_FLOW,
  USER_BOT_CHAT_DOWNLOAD_PREFIX,
  USER_BOT_CHAT_HIDE_PREFIX,
  USER_BOT_CHAT_LIST,
  USER_BOT_CHAT_PREFIX,
  USER_BOT_DELETE_PREFIX,
  USER_BOT_DRAFT_CANCEL,
  USER_BOT_DRAFT_PREFIX,
  USER_BOT_DRAFT_SEND,
  USER_BOT_DRAFT_TYPE_PREFIX,
  USER_BOT_EDIT_DRAFT_CANCEL,
  USER_BOT_EDIT_DRAFT_SAVE,
  USER_BOT_MENU_CREATE,
  USER_BOT_MENU_HOME,
  USER_BOT_MENU_MY,
  USER_BOT_MENU_MY_AD,
  USER_BOT_MENU_SEARCH,
  USER_BOT_MENU_SECTIONS,
  USER_BOT_MENU_SETTINGS,
  USER_BOT_SEARCH_AD_PREFIX,
  USER_BOT_SEARCH_RESULTS,
  USER_BOT_SECTION_AD_PREFIX,
  USER_BOT_SECTION_PREFIX,
  USER_BOT_SETTINGS_PREFIX,
} from './constants';
import { buildPublicSiteUrl } from './site-url';
import type { Env } from './types';

export function userBotMenuMarkup(env: Env): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Создать', callback_data: USER_BOT_MENU_CREATE }],
      [{ text: 'Мои объявления', callback_data: USER_BOT_MENU_MY }],
      [{ text: 'Диалоги', callback_data: USER_BOT_CHAT_LIST }],
      [{ text: 'Объявления', callback_data: USER_BOT_MENU_SECTIONS }],
      [{ text: 'Поиск', callback_data: USER_BOT_MENU_SEARCH }],
      [{ text: 'Настройки', callback_data: USER_BOT_MENU_SETTINGS }],
      [{ text: 'Открыть сайт', url: buildPublicSiteUrl(env, '/') }],
    ],
  };
}

export function userBotSectionsMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...buildCategoryRows(USER_BOT_SECTION_PREFIX),
      [{ text: 'Назад', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

export function userBotSectionAdsMarkup(category: string, ads: Array<{ id: number; title: string }>): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_SECTION_AD_PREFIX}${category}:${ad.id}` },
      ]),
      [{ text: 'Назад', callback_data: USER_BOT_MENU_SECTIONS }],
    ],
  };
}

export function userBotSectionAdMarkup(category: string): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Назад', callback_data: `${USER_BOT_SECTION_PREFIX}${category}` }],
      [{ text: 'В меню', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

export function userBotSearchMarkup(ads: Array<{ id: number; title: string }>): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_SEARCH_AD_PREFIX}${ad.id}` },
      ]),
      [{ text: 'Новый поиск', callback_data: USER_BOT_MENU_SEARCH }],
      [{ text: 'Назад', callback_data: USER_BOT_MENU_SEARCH }],
    ],
  };
}

export function userBotSearchAdMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Назад', callback_data: USER_BOT_SEARCH_RESULTS }],
      [{ text: 'В меню', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

export function userBotMyAdsMarkup(ads: Array<{ id: number; title: string }>): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...ads.map((ad) => [
        { text: ad.title.slice(0, 40) || `#${ad.id}`, callback_data: `${USER_BOT_MENU_MY_AD}${ad.id}` },
      ]),
      [{ text: 'Назад', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

export function userBotSingleAdMarkup(adId: number, adUrl: string | null = null): Record<string, unknown> {
  const rows: Array<Array<{ text: string; callback_data?: string; url?: string }>> = [
    [
      { text: 'Редактировать', callback_data: `${USER_BOT_MENU_MY_AD}${adId}:edit` },
      { text: 'Удалить', callback_data: `${USER_BOT_DELETE_PREFIX}${adId}` },
    ],
  ];

  if (adUrl) {
    rows.unshift([{ text: 'Открыть карту', url: adUrl }]);
  }

  rows.push([{ text: 'Назад', callback_data: USER_BOT_MENU_MY }]);
  return { inline_keyboard: rows };
}

export function userBotChatsMarkup(threads: ChatThreadListRow[]): Record<string, unknown> {
  const rows = threads.map((thread) => {
    const title = `${thread.other_login} · ${thread.ad_title}`.slice(0, 60);
    return [
      {
        text: title || `#${thread.id}`,
        callback_data: `${USER_BOT_CHAT_PREFIX}${thread.id}`,
      },
    ];
  });

  rows.push([{ text: 'Назад', callback_data: USER_BOT_MENU_HOME }]);
  return { inline_keyboard: rows };
}

export function userBotChatMarkup(conversationId: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Скачать историю', callback_data: `${USER_BOT_CHAT_DOWNLOAD_PREFIX}${conversationId}` }],
      [{ text: 'Диалоги', callback_data: USER_BOT_CHAT_LIST }],
      [{ text: 'В меню', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

export function userBotIncomingChatMarkup(conversationId: number): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: 'Открыть диалог', callback_data: `${USER_BOT_CHAT_PREFIX}${conversationId}` },
        { text: 'Скрыть', callback_data: `${USER_BOT_CHAT_HIDE_PREFIX}${conversationId}` },
      ],
      [{ text: 'Диалоги', callback_data: USER_BOT_CHAT_LIST }],
    ],
  };
}

export function userBotSettingsMarkup(hasPassword: boolean): Record<string, unknown> {
  return {
    inline_keyboard: [
      [{ text: 'Изменить город', callback_data: `${USER_BOT_SETTINGS_PREFIX}city` }],
      [{ text: 'Изменить логин', callback_data: `${USER_BOT_SETTINGS_PREFIX}login` }],
      [{ text: 'Изменить email', callback_data: `${USER_BOT_SETTINGS_PREFIX}email` }],
      [{ text: hasPassword ? 'Сменить пароль' : 'Задать пароль', callback_data: `${USER_BOT_SETTINGS_PREFIX}password` }],
      [{ text: 'Изменить аватар', callback_data: `${USER_BOT_SETTINGS_PREFIX}avatar` }],
      [{ text: 'Удалить аватар', callback_data: `${USER_BOT_SETTINGS_PREFIX}avatar-delete` }],
      [{ text: 'Назад', callback_data: USER_BOT_MENU_HOME }],
    ],
  };
}

export function userBotCityMarkup(selectedCity: string | null = null): Record<string, unknown> {
  return {
    inline_keyboard: [
      ...CITIES.map((city) => [
        {
          text: `${normalizeCity(selectedCity) === city.slug ? '• ' : ''}${city.label}`,
          callback_data: `${USER_BOT_SETTINGS_PREFIX}city:${city.slug}`,
        },
      ]),
      [{ text: 'Отмена', callback_data: `${USER_BOT_SETTINGS_PREFIX}cancel` }],
    ],
  };
}

export function userBotCategoryMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [...buildCategoryRows(`${USER_BOT_DRAFT_PREFIX}category:`), [{ text: 'Отмена', callback_data: USER_BOT_CANCEL_FLOW }]],
  };
}

export function userBotTypeMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [...buildTypeRows(USER_BOT_DRAFT_TYPE_PREFIX), [{ text: 'Отмена', callback_data: USER_BOT_CANCEL_FLOW }]],
  };
}

export function userBotCancelHomeMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [[{ text: 'Отмена', callback_data: USER_BOT_CANCEL_FLOW }]],
  };
}

export function userBotCancelSettingsMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [[{ text: 'Отмена', callback_data: `${USER_BOT_SETTINGS_PREFIX}cancel` }]],
  };
}

export function userBotConfirmMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: 'Отправить', callback_data: USER_BOT_DRAFT_SEND },
        { text: 'Отмена', callback_data: USER_BOT_DRAFT_CANCEL },
      ],
    ],
  };
}

export function userBotEditConfirmMarkup(): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: 'Сохранить', callback_data: USER_BOT_EDIT_DRAFT_SAVE },
        { text: 'Отмена', callback_data: USER_BOT_EDIT_DRAFT_CANCEL },
      ],
    ],
  };
}

export function buildChatScreenTitle(otherLogin: string, adTitle: string): string {
  return [`Диалог с ${otherLogin}`, `По объявлению: ${adTitle}`].join('\n');
}

export function buildConversationHistoryExport(
  conversation: ChatThreadRow,
  adTitle: string,
  otherLogin: string,
  messages: ChatMessageRow[],
  currentUserId: number
): string {
  const lines = [
    `Диалог с ${otherLogin}`,
    `По объявлению: ${adTitle}`,
    `Conversation ID: ${conversation.id}`,
    '',
  ];

  if (!messages.length) {
    lines.push('Пока нет сообщений');
    return lines.join('\n');
  }

  for (const row of messages) {
    const time = row.created_at ? row.created_at.replace('T', ' ').slice(0, 19) : '';
    const senderLogin = row.sender_user_id === currentUserId ? 'Вы' : otherLogin;
    const body = row.body.replace(/\r?\n/g, '\n');
    lines.push(`${time ? `${time} ` : ''}${senderLogin}: ${body}`);
  }

  return lines.join('\n');
}

export function buildConversationExportFilename(conversationId: number, otherLogin: string, adTitle: string): string {
  const safePart = `${otherLogin}-${adTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9а-яё._-]+/giu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || `chat-${conversationId}`;
  return `chat-history-${conversationId}-${safePart}.txt`;
}
