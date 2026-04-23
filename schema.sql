CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  city TEXT,
  avatar_key TEXT,
  avatar_mime_type TEXT,
  avatar_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_login_unique
  ON users(login);

CREATE TABLE IF NOT EXISTS user_identities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT,
  email TEXT,
  password_hash TEXT,
  telegram_username TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (provider IN ('email', 'telegram'))
);

CREATE UNIQUE INDEX IF NOT EXISTS user_identities_email_unique
  ON user_identities(email)
  WHERE provider = 'email' AND email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_identities_telegram_unique
  ON user_identities(provider_user_id)
  WHERE provider = 'telegram' AND provider_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL,
  step TEXT NOT NULL,
  ad_id INTEGER,
  login TEXT,
  email TEXT,
  category TEXT,
  title TEXT,
  body TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  contact TEXT,
  city TEXT,
  category TEXT,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  owner_user_id INTEGER,
  image_key TEXT,
  image_mime_type TEXT,
  image_updated_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bot_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id INTEGER NOT NULL,
  user_low_id INTEGER NOT NULL,
  user_high_id INTEGER NOT NULL,
  last_message_sender_user_id INTEGER,
  last_message_text TEXT,
  last_message_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ad_id, user_low_id, user_high_id)
);

CREATE TABLE IF NOT EXISTS bot_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  sender_user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES bot_conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_chat_notifications (
  conversation_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(conversation_id, user_id)
);
