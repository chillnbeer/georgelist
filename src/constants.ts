export const CATEGORIES = [
  { slug: 'auto', label: 'Авто' },
  { slug: 'electronics', label: 'Электроника' },
  { slug: 'clothes', label: 'Одежда' },
  { slug: 'furniture', label: 'Мебель' },
  { slug: 'housing', label: 'Жильё' },
  { slug: 'rent', label: 'Аренда' },
  { slug: 'jobs', label: 'Работа' },
  { slug: 'services', label: 'Услуги' },
  { slug: 'education', label: 'Обучение' },
  { slug: 'pets', label: 'Животные' },
  { slug: 'hobby', label: 'Хобби' },
  { slug: 'creative', label: 'Творчество' },
  { slug: 'things', label: 'Вещи' },
  { slug: 'misc', label: 'Разное' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const AD_TYPES = [
  { slug: 'sell', label: 'Продаю' },
  { slug: 'buy', label: 'Куплю' },
  { slug: 'free', label: 'Отдаю' },
] as const;

export type AdTypeSlug = (typeof AD_TYPES)[number]['slug'];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category.label])
) as Record<CategorySlug, string>;

export const AD_TYPE_LABELS = Object.fromEntries(AD_TYPES.map((type) => [type.slug, type.label])) as Record<AdTypeSlug, string>;

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const PASSWORD_HASH_ITERATIONS = 210000;
export const DUMMY_PASSWORD_HASH = 'pbkdf2_sha256$210000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
export const ADS_HOME_LIMIT = 200;
export const ADS_USER_LIMIT = 100;
export const ADS_SEARCH_LIMIT = 50;
export const TELEGRAM_AUTH_COOKIE_NAME = 'telegram_auth';
export const TELEGRAM_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;
export const TELEGRAM_AUTH_MAX_AGE_SECONDS = 60 * 60 * 24;
export const AD_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const USER_BOT_MENU_CREATE = 'user:create';
export const USER_BOT_MENU_SECTIONS = 'user:sections';
export const USER_BOT_MENU_SEARCH = 'user:search';
export const USER_BOT_MENU_EDIT = 'user:edit';
export const USER_BOT_MENU_DELETE = 'user:delete';
export const USER_BOT_MENU_SETTINGS = 'user:settings';
export const USER_BOT_MENU_MY = 'user:my';
export const USER_BOT_MENU_HOME = 'user:home';
export const USER_BOT_CANCEL_FLOW = 'user:cancel';
export const USER_BOT_MENU_MY_AD = 'user:myad:';
export const USER_BOT_SECTION_PREFIX = 'user:section:';
export const USER_BOT_SECTION_AD_PREFIX = 'user:sectionad:';
export const USER_BOT_SECTION_MORE_PREFIX = 'user:more:';
export const USER_BOT_SEARCH_RESULTS = 'user:search:results';
export const USER_BOT_SEARCH_AD_PREFIX = 'user:searchad:';
export const USER_BOT_SEARCH_MORE_PREFIX = 'user:searchmore:';
export const BOT_ADS_PAGE_SIZE = 5;
export const USER_BOT_DELETE_PREFIX = 'delete_';
export const USER_BOT_SETTINGS_PREFIX = 'user:settings:';
export const USER_BOT_CHAT_PREFIX = 'user:chat:';
export const USER_BOT_CHAT_DOWNLOAD_PREFIX = 'user:chatdownload:';
export const USER_BOT_CHAT_HIDE_PREFIX = 'user:chathide:';
export const USER_BOT_CHAT_START_PREFIX = 'user:chatstart:';
export const USER_BOT_CHAT_LIST = 'user:chats';
export const USER_BOT_DRAFT_PREFIX = 'draft:';
export const USER_BOT_DRAFT_TYPE_PREFIX = 'draft:type:';
export const USER_BOT_DRAFT_CANCEL = 'draft:confirm:cancel';
export const USER_BOT_DRAFT_SEND = 'draft:confirm:send';
export const USER_BOT_EDIT_DRAFT_CANCEL = 'draft:edit:cancel';
export const USER_BOT_EDIT_DRAFT_SAVE = 'draft:edit:save';
export const USER_BOT_DRAFT_IMAGE_SKIP = 'draft:image:skip';
export const ADMIN_BOT_MENU_HOME = 'admin:home';
export const USER_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AD_IMAGE_MAX_DIMENSION = 1600;
export const AD_IMAGE_JPEG_QUALITY = 82;
export const AD_LOCATION_RADIUS_OPTIONS = [500, 1000, 3000, 5000] as const;
export const AD_LOCATION_DEFAULT_RADIUS = 1000;
export const AD_LOCATION_LABEL_MAX_LENGTH = 120;
export const AD_TITLE_MAX_LENGTH = 200;
export const AD_BODY_MAX_LENGTH = 5000;
export const AD_CONTACT_MAX_LENGTH = 300;
export const AD_MESSAGE_MAX_LENGTH = 1000;
export const USER_DISPLAY_NAME_MAX_LENGTH = 100;
export const ADMIN_PAGE_SIZE = 5;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
