import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { createHash, createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import worker from '../src';

const TELEGRAM_BOT_TOKEN = 'telegram-test-token';
const CURRENT_SESSION_TOKEN = 'current-session-token';
const OTHER_SESSION_TOKEN = 'other-session-token';
const SCHEMA_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT NOT NULL UNIQUE,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS users_login_unique
      ON users(login)
  `,
  `
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
    )
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS user_identities_email_unique
      ON user_identities(email)
      WHERE provider = 'email' AND email IS NOT NULL
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS user_identities_telegram_unique
      ON user_identities(provider_user_id)
      WHERE provider = 'telegram' AND provider_user_id IS NOT NULL
  `,
  `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
  `
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
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      owner_user_id INTEGER,
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_user_id) REFERENCES users(id)
    )
  `,
];

type TelegramAuthInput = {
  id: string;
  first_name: string;
  username?: string;
};

async function sha256Hex(value: string): Promise<string> {
  return createHash('sha256').update(value).digest('hex');
}

async function signTelegramAuth(input: TelegramAuthInput & { auth_date: string }): Promise<string> {
  const params = new URLSearchParams({
    auth_date: input.auth_date,
    first_name: input.first_name,
    id: input.id,
  });

  if (input.username) {
    params.set('username', input.username);
  }

  const dataCheckString = Array.from(params.entries())
    .filter(([key, value]) => key !== 'hash' && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
  return createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
}

async function buildTelegramAuthUrl(mode: 'link' | 'login', input: TelegramAuthInput, next?: string): Promise<string> {
  const url = new URL('http://example.com/telegram/auth');
  url.searchParams.set('mode', mode);
  if (next) {
    url.searchParams.set('next', next);
  }

  const authDate = String(Math.floor(Date.now() / 1000));
  url.searchParams.set('auth_date', authDate);
  url.searchParams.set('first_name', input.first_name);
  url.searchParams.set('id', input.id);
  if (input.username) {
    url.searchParams.set('username', input.username);
  }

  const hash = await signTelegramAuth({
    id: input.id,
    first_name: input.first_name,
    username: input.username,
    auth_date: authDate,
  });
  url.searchParams.set('hash', hash);
  return url.toString();
}

async function runRequest(request: Request): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

async function resetDatabase(): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await env.DB.prepare(statement).run();
  }
  await env.DB.prepare('DELETE FROM sessions').run();
  await env.DB.prepare('DELETE FROM user_identities').run();
  await env.DB.prepare('DELETE FROM ads').run();
  await env.DB.prepare('DELETE FROM bot_drafts').run();
  await env.DB.prepare('DELETE FROM users').run();
}

async function seedUser(params: {
  id: number;
  login: string;
  email: string;
  displayName?: string;
  sessionToken: string;
  role?: string;
}): Promise<void> {
  const displayName = params.displayName || params.login;
  const sessionTokenHash = await sha256Hex(params.sessionToken);
  const role = params.role || 'user';

  await env.DB.batch([
    env.DB.prepare(
      `
        INSERT INTO users (id, login, display_name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    ).bind(params.id, params.login, displayName, role),
    env.DB.prepare(
      `
        INSERT INTO user_identities (
          user_id,
          provider,
          provider_user_id,
          email,
          password_hash,
          telegram_username,
          created_at
        )
        VALUES (?, 'email', NULL, ?, NULL, NULL, CURRENT_TIMESTAMP)
      `
    ).bind(params.id, params.email),
    env.DB.prepare(
      `
        INSERT INTO sessions (user_id, session_token_hash, created_at, expires_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, datetime('now', '+30 days'))
      `
    ).bind(params.id, sessionTokenHash),
  ]);
}

async function insertTelegramIdentity(params: {
  userId: number;
  telegramUserId: string;
  telegramUsername: string | null;
}): Promise<void> {
  await env.DB.prepare(
    `
      INSERT INTO user_identities (
        user_id,
        provider,
        provider_user_id,
        email,
        password_hash,
        telegram_username,
        created_at
      )
      VALUES (?, 'telegram', ?, NULL, NULL, ?, CURRENT_TIMESTAMP)
    `
  )
    .bind(params.userId, params.telegramUserId, params.telegramUsername)
    .run();
}

async function insertAd(params: {
  title: string;
  body: string;
  category: string;
  ownerUserId: number | null;
  status?: string;
}): Promise<number> {
  const result = await env.DB.prepare(
    `
      INSERT INTO ads (title, body, category, status, owner_user_id, deleted_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `
  )
    .bind(params.title, params.body, params.category, params.status || 'pending', params.ownerUserId)
    .run();

  return Number(result.meta.last_row_id);
}

async function fetchTelegramIdentity(telegramUserId: string): Promise<{
  id: number;
  user_id: number;
  provider_user_id: string | null;
  telegram_username: string | null;
} | null> {
  return (
    await env.DB.prepare(
      `
        SELECT id, user_id, provider_user_id, telegram_username
        FROM user_identities
        WHERE provider = 'telegram'
          AND provider_user_id = ?
        LIMIT 1
      `
    )
      .bind(telegramUserId)
      .first()
  ) as {
    id: number;
    user_id: number;
    provider_user_id: string | null;
    telegram_username: string | null;
  } | null;
}

function cookieFromSetCookie(setCookie: string | null, name: string): string | null {
  if (!setCookie) {
    return null;
  }

  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? `${name}=${match[1]}` : null;
}

beforeEach(async () => {
  (env as { USER_TELEGRAM_BOT_TOKEN?: string }).USER_TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKEN;
  (env as { TELEGRAM_USER_BOT_TOKEN?: string }).TELEGRAM_USER_BOT_TOKEN = TELEGRAM_BOT_TOKEN;
  (env as { USER_TELEGRAM_BOT_USERNAME?: string }).USER_TELEGRAM_BOT_USERNAME = 'georgelist_bot';
  (env as { TELEGRAM_USER_BOT_USERNAME?: string }).TELEGRAM_USER_BOT_USERNAME = 'georgelist_bot';
  await resetDatabase();
});

describe('Telegram linking flow', () => {
  it('shows a telegram registration entry point on the register page', async () => {
    const response = await runRequest(new Request('http://example.com/register'));
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain('Зарегистрироваться через Telegram');
    expect(html).toContain('/register/telegram?next=%2Fsettings');
  });

  it('renders a telegram registration widget page', async () => {
    const response = await runRequest(new Request('http://example.com/register/telegram'));
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain('Зарегистрироваться через Telegram');
    expect(html).toContain('data-auth-url');
  });

  it('creates a telegram-only account from telegram signup', async () => {
    const authUrl = await buildTelegramAuthUrl('login', {
      id: '30001',
      first_name: 'Charlie',
      username: 'charlie_tg',
    }, '/settings');

    const response = await runRequest(new Request(authUrl));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/settings');

    const sessionCookie = response.headers.get('Set-Cookie');
    expect(sessionCookie).toContain('session=');

    const identity = await fetchTelegramIdentity('30001');
    expect(identity?.telegram_username).toBe('charlie_tg');
    expect(identity?.user_id).toBeGreaterThan(0);

    const userRow = await env.DB.prepare(
      `
        SELECT id, login, display_name
        FROM users
        WHERE id = ?
        LIMIT 1
      `
    )
      .bind(identity?.user_id)
      .first<{ id: number; login: string; display_name: string | null }>();

    expect(userRow?.login).toBe('tg_30001');
    expect(userRow?.display_name).toBe('Charlie');

    const settingsResponse = await runRequest(
      new Request('http://example.com/settings', {
        headers: {
          Cookie: sessionCookie || '',
        },
      })
    );

    const settingsHtml = await settingsResponse.text();
    expect(settingsHtml).toContain('Telegram: @charlie_tg');
    expect(settingsHtml).toContain('tg_30001');
  });

  it('links a free telegram identity to the current user', async () => {
    await seedUser({
      id: 1,
      login: 'alice',
      email: 'alice@example.com',
      sessionToken: CURRENT_SESSION_TOKEN,
    });

    const authUrl = await buildTelegramAuthUrl('link', {
      id: '10001',
      first_name: 'Alice',
      username: 'alice_tg',
    });

    const response = await runRequest(
      new Request(authUrl, {
        headers: {
          Cookie: `session=${CURRENT_SESSION_TOKEN}`,
        },
      })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toContain(
      `/settings?message=${encodeURIComponent('Telegram успешно привязан')}`
    );

    const identity = await fetchTelegramIdentity('10001');
    expect(identity?.user_id).toBe(1);
    expect(identity?.telegram_username).toBe('alice_tg');

    const settingsResponse = await runRequest(
      new Request('http://example.com/settings', {
        headers: {
          Cookie: `session=${CURRENT_SESSION_TOKEN}`,
        },
      })
    );

    const html = await settingsResponse.text();
    expect(html).toContain('Telegram: @alice_tg');
    expect(html).toContain('Привязка уже настроена.');
  });

  it('keeps the same telegram linked to the same user', async () => {
    await seedUser({
      id: 1,
      login: 'alice',
      email: 'alice@example.com',
      sessionToken: CURRENT_SESSION_TOKEN,
    });
    await insertTelegramIdentity({
      userId: 1,
      telegramUserId: '10002',
      telegramUsername: 'alice_old',
    });

    const authUrl = await buildTelegramAuthUrl('link', {
      id: '10002',
      first_name: 'Alice',
      username: 'alice_new',
    });

    const response = await runRequest(
      new Request(authUrl, {
        headers: {
          Cookie: `session=${CURRENT_SESSION_TOKEN}`,
        },
      })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toContain(
      `/settings?message=${encodeURIComponent('Telegram уже привязан')}`
    );

    const identity = await fetchTelegramIdentity('10002');
    expect(identity?.user_id).toBe(1);
    expect(identity?.telegram_username).toBe('alice_new');
  });

  it('shows a conflict and allows relinking from settings', async () => {
    await seedUser({
      id: 1,
      login: 'alice',
      email: 'alice@example.com',
      sessionToken: CURRENT_SESSION_TOKEN,
    });
    await seedUser({
      id: 2,
      login: 'bob',
      email: 'bob@example.com',
      sessionToken: OTHER_SESSION_TOKEN,
    });
    await insertTelegramIdentity({
      userId: 2,
      telegramUserId: '20001',
      telegramUsername: 'bob_tg',
    });

    const authUrl = await buildTelegramAuthUrl('link', {
      id: '20001',
      first_name: 'Bob',
      username: 'bob_tg_new',
    });

    const conflictResponse = await runRequest(
      new Request(authUrl, {
        headers: {
          Cookie: `session=${CURRENT_SESSION_TOKEN}`,
        },
      })
    );

    expect(conflictResponse.status).toBe(303);
    expect(conflictResponse.headers.get('Location')).toContain(
      `/settings?message=${encodeURIComponent('Этот Telegram уже привязан к другому аккаунту')}`
    );

    const telegramAuthCookie = cookieFromSetCookie(conflictResponse.headers.get('Set-Cookie'), 'telegram_auth');
    expect(telegramAuthCookie).not.toBeNull();

    const settingsAfterConflict = await runRequest(
      new Request('http://example.com/settings', {
        headers: {
          Cookie: [`session=${CURRENT_SESSION_TOKEN}`, telegramAuthCookie].filter(Boolean).join('; '),
        },
      })
    );

    const conflictHtml = await settingsAfterConflict.text();
    expect(conflictHtml).toContain('Этот Telegram уже привязан к другому аккаунту');
    expect(conflictHtml).toContain('Перепривязать Telegram к текущему аккаунту');

    const relinkResponse = await runRequest(
      new Request('http://example.com/settings/link-telegram/confirm', {
        method: 'POST',
        headers: {
          Cookie: [`session=${CURRENT_SESSION_TOKEN}`, telegramAuthCookie].filter(Boolean).join('; '),
        },
      })
    );

    expect(relinkResponse.status).toBe(303);
    expect(relinkResponse.headers.get('Location')).toContain(
      `/settings?message=${encodeURIComponent('Telegram перепривязан')}`
    );
    expect(relinkResponse.headers.get('Set-Cookie')).toContain('telegram_auth=;');

    const movedIdentity = await fetchTelegramIdentity('20001');
    expect(movedIdentity?.user_id).toBe(1);
    expect(movedIdentity?.telegram_username).toBe('bob_tg_new');

    const oldOwnerIdentity = await env.DB.prepare(
      `
        SELECT id, user_id, provider_user_id, telegram_username
        FROM user_identities
        WHERE provider = 'telegram'
          AND user_id = ?
        LIMIT 1
      `
    )
      .bind(2)
      .first();
    expect(oldOwnerIdentity).toBeNull();

    const settingsAfterRelink = await runRequest(
      new Request('http://example.com/settings', {
        headers: {
          Cookie: `session=${CURRENT_SESSION_TOKEN}`,
        },
      })
    );

    const relinkHtml = await settingsAfterRelink.text();
    expect(relinkHtml).toContain('Telegram: @bob_tg_new');
    expect(relinkHtml).toContain('Привязка уже настроена.');
  });
});

describe('Settings page', () => {
  it('shows the current role and admin note for non-admin users', async () => {
    await seedUser({
      id: 20,
      login: 'user20',
      email: 'user20@example.com',
      sessionToken: 'user20-session',
    });

    const response = await runRequest(
      new Request('http://example.com/settings', {
        headers: {
          Cookie: 'session=user20-session',
        },
      })
    );

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('Роль: user');
    expect(html).toContain('Админка доступна только аккаунтам с ролью admin.');
  });
});

describe('Admin web flow', () => {
  it('allows an admin to edit and delete any ad', async () => {
    await seedUser({
      id: 10,
      login: 'admin',
      email: 'admin@example.com',
      sessionToken: 'admin-session',
      role: 'admin',
    });
    await seedUser({
      id: 11,
      login: 'alice',
      email: 'alice@example.com',
      sessionToken: 'alice-session',
    });

    const adId = await insertAd({
      title: 'Old title',
      body: 'Old body',
      category: 'misc',
      ownerUserId: 11,
      status: 'published',
    });

    const adminCookie = 'session=admin-session';

    const adminPage = await runRequest(
      new Request('http://example.com/admin', {
        headers: { Cookie: adminCookie },
      })
    );

    expect(adminPage.status).toBe(200);
    const adminHtml = await adminPage.text();
    expect(adminHtml).toContain('Админка');
    expect(adminHtml).toContain('Old title');
    expect(adminHtml).toContain(`/admin/edit/${adId}`);
    expect(adminHtml).toContain(`/admin/delete/${adId}`);

    const editResponse = await runRequest(
      new Request(`http://example.com/admin/edit/${adId}`, {
        method: 'POST',
        headers: {
          Cookie: adminCookie,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          title: 'New title',
          body: 'New body',
          category: 'services',
        }).toString(),
      })
    );

    expect(editResponse.status).toBe(303);
    const updatedAd = await env.DB.prepare(
      `
        SELECT title, body, category, deleted_at
        FROM ads
        WHERE id = ?
        LIMIT 1
      `
    )
      .bind(adId)
      .first<{ title: string; body: string; category: string | null; deleted_at: string | null }>();

    expect(updatedAd?.title).toBe('New title');
    expect(updatedAd?.body).toBe('New body');
    expect(updatedAd?.category).toBe('services');
    expect(updatedAd?.deleted_at).toBeNull();

    const deleteResponse = await runRequest(
      new Request(`http://example.com/admin/delete/${adId}`, {
        method: 'POST',
        headers: { Cookie: adminCookie },
      })
    );

    expect(deleteResponse.status).toBe(303);
    const deletedAd = await env.DB.prepare(
      `
        SELECT deleted_at
        FROM ads
        WHERE id = ?
        LIMIT 1
      `
    )
      .bind(adId)
      .first<{ deleted_at: string | null }>();

    expect(deletedAd?.deleted_at).not.toBeNull();
  });
});
