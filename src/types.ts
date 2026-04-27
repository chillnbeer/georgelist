export type Env = {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_ADMIN_ID: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  TELEGRAM_USER_WEBHOOK_SECRET?: string;
  USER_TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_USER_BOT_TOKEN?: string;
  USER_TELEGRAM_BOT_USERNAME?: string;
  TELEGRAM_USER_BOT_USERNAME?: string;
  PUBLIC_SITE_URL?: string;
  SITE_URL?: string;
};

export type CurrentUser = {
  id: number;
  login: string;
  display_name: string | null;
  email: string | null;
  city: string | null;
  role: string;
  avatar_key: string | null;
  avatar_mime_type: string | null;
  avatar_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdRow = {
  id: number;
  title: string;
  body: string;
  contact: string | null;
  city: string | null;
  category: string | null;
  type: string | null;
  price: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_radius_meters: number | null;
  location_label: string | null;
  owner_user_id: number | null;
  owner_login: string | null;
  owner_avatar_key: string | null;
  status: string;
  image_key: string | null;
  image_mime_type: string | null;
  image_updated_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PublicAdCardRow = {
  id: number;
  title: string;
  body: string;
  contact: string | null;
  city: string | null;
  category: string | null;
  type: string | null;
  price: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_radius_meters: number | null;
  location_label: string | null;
  owner_user_id: number | null;
  image_key: string | null;
  image_mime_type: string | null;
  image_updated_at: string | null;
  created_at: string;
  author_login: string | null;
  author_avatar_key: string | null;
};

export type AdCardRow = {
  id: number;
  title: string;
  city: string | null;
  category: string | null;
  type: string | null;
  price: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_radius_meters: number | null;
  location_label: string | null;
  image_key: string | null;
  created_at: string;
  author_login: string | null;
  author_avatar_key: string | null;
};

export type PublicUserRow = {
  id: number;
  login: string;
  display_name: string | null;
  city: string | null;
  avatar_key: string | null;
  avatar_mime_type: string | null;
  avatar_updated_at: string | null;
  created_at: string;
};

export type AdForm = {
  title: string;
  body: string;
  contact: string;
  city: string;
  category: string;
  type: string;
  price: string;
  location_lat: number | null;
  location_lng: number | null;
  location_radius_meters: number | null;
  location_label: string;
  images: File[];
  keep_image_keys: string[];
  cover_image_key: string | null;
};

export type AdLocationInput = {
  location_lat: number | null;
  location_lng: number | null;
  location_radius_meters: number | null;
  location_label: string;
};

export type AdImageUpload = {
  key: string;
  mimeType: string;
};

export type CompressedAdImageUpload = {
  key: string;
  mimeType: string;
  bytes: ArrayBuffer;
};

export type AdImageRow = {
  id: number;
  ad_id: number;
  image_key: string;
  image_mime_type: string;
  sort_order: number;
  created_at: string;
};

export type TelegramCallbackQuery = {
  id: string;
  data?: string;
  message?: {
    chat: {
      id: number;
    };
    message_id: number;
    text?: string;
    caption?: string;
  };
};

export type TelegramUpdate = {
  callback_query?: TelegramCallbackQuery;
  message?: {
    message_id: number;
    chat: {
      id: number;
    };
    from?: {
      id: number;
      username?: string;
    };
    text?: string;
    photo?: Array<{
      file_id: string;
    }>;
    document?: {
      file_id: string;
      mime_type?: string;
      file_name?: string;
    };
  };
};

export type UserIdentityRow = {
  id: number;
  user_id: number;
  provider: string;
  provider_user_id: string | null;
  email: string | null;
  password_hash: string | null;
  telegram_username: string | null;
  created_at: string;
};

export type SessionRow = {
  id: number;
  user_id: number;
  session_token_hash: string;
  created_at: string;
  expires_at: string;
};

export type TelegramAuthPayload = {
  id: string;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  auth_date: number;
  hash: string;
};

export type BotDraftRow = {
  id: number;
  telegram_user_id: string;
  action: string;
  step: string;
  ui_chat_id: number | null;
  ui_message_id: number | null;
  ad_id: number | null;
  login: string | null;
  email: string | null;
  category: string | null;
  ad_type: string | null;
  reply_user_id: number | null;
  reply_ad_id: number | null;
  password_current: string | null;
  password_new: string | null;
  title: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
};
