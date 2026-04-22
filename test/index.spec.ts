import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { createHash, createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../src';

const TELEGRAM_BOT_TOKEN = 'telegram-test-token';
const CURRENT_SESSION_TOKEN = 'current-session-token';
const OTHER_SESSION_TOKEN = 'other-session-token';
const TELEGRAM_ADMIN_CHAT_ID = 9001;
const telegramFetchCalls: Array<{ url: string; body: unknown }> = [];
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

async function sendTelegramWebhook(update: unknown): Promise<Response> {
  return runRequest(
    new Request('http://example.com/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    })
  );
}

async function sendUserTelegramWebhook(update: unknown): Promise<Response> {
  return runRequest(
    new Request('http://example.com/telegram/user-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    })
  );
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
  telegramFetchCalls.length = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : null;
      telegramFetchCalls.push({ url, body });
      return new Response(JSON.stringify({ ok: true, result: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    })
  );
  (env as { USER_TELEGRAM_BOT_TOKEN?: string }).USER_TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKEN;
  (env as { TELEGRAM_USER_BOT_TOKEN?: string }).TELEGRAM_USER_BOT_TOKEN = TELEGRAM_BOT_TOKEN;
  (env as { USER_TELEGRAM_BOT_USERNAME?: string }).USER_TELEGRAM_BOT_USERNAME = 'georgelist_bot';
  (env as { TELEGRAM_USER_BOT_USERNAME?: string }).TELEGRAM_USER_BOT_USERNAME = 'georgelist_bot';
  (env as { TELEGRAM_ADMIN_ID?: string }).TELEGRAM_ADMIN_ID = String(TELEGRAM_ADMIN_CHAT_ID);
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

describe('User bot browsing flow', () => {
  it('keeps the main menu focused and exposes public browsing through sections', async () => {
    await seedUser({
      id: 40,
      login: 'browser',
      email: 'browser@example.com',
      sessionToken: 'browser-session',
    });
    await insertTelegramIdentity({
      userId: 40,
      telegramUserId: '40001',
      telegramUsername: 'browser_tg',
    });
    const publishedThingsId = await insertAd({
      title: 'Published things',
      body: 'Things body',
      category: 'things',
      ownerUserId: 40,
      status: 'published',
    });
    await insertAd({
      title: 'Pending things',
      body: 'Hidden body',
      category: 'things',
      ownerUserId: 40,
      status: 'pending',
    });

    const startResponse = await sendUserTelegramWebhook({
      message: {
        chat: { id: 40001 },
        from: { id: 40001, username: 'browser_tg' },
        text: '/start',
      },
    });

    expect(startResponse.status).toBe(200);
    const startMessage = telegramFetchCalls.filter(
      (call) => call.url.includes('/sendMessage') && typeof call.body === 'object' && call.body !== null
    ).at(-1);
    expect(startMessage).toBeTruthy();

    const startMarkup = (startMessage?.body as { reply_markup?: { inline_keyboard?: Array<Array<{ text: string }>> } }).reply_markup?.inline_keyboard || [];
    const flatButtons = startMarkup.flat().map((button) => button.text);
    expect(flatButtons).toContain('Создать');
    expect(flatButtons).toContain('Мои объявления');
    expect(flatButtons).toContain('Разделы');
    expect(flatButtons).not.toContain('Редактировать');
    expect(flatButtons).not.toContain('Удалить');

    const sectionsResponse = await sendUserTelegramWebhook({
      callback_query: {
        id: 'cb-sections',
        data: 'user:sections',
        message: {
          chat: { id: 40001 },
          message_id: 10,
        },
      },
    });

    expect(sectionsResponse.status).toBe(200);
    const sectionsMessage = telegramFetchCalls.filter(
      (call) => call.url.includes('/sendMessage') && typeof call.body === 'object' && call.body !== null
    ).at(-1);
    const sectionsText = String((sectionsMessage?.body as { text?: string }).text || '');
    expect(sectionsText).toContain('Разделы');
    const sectionsMarkup = (sectionsMessage?.body as { reply_markup?: { inline_keyboard?: Array<Array<{ text: string }>> } }).reply_markup?.inline_keyboard || [];
    const sectionButtons = sectionsMarkup.flat().map((button) => button.text);
    expect(sectionButtons).toContain('Вещи');
    expect(sectionButtons).toContain('Разное');

    const categoryResponse = await sendUserTelegramWebhook({
      callback_query: {
        id: 'cb-category',
        data: 'user:section:things',
        message: {
          chat: { id: 40001 },
          message_id: 11,
        },
      },
    });

    expect(categoryResponse.status).toBe(200);
    const categoryMessage = telegramFetchCalls.filter(
      (call) => call.url.includes('/sendMessage') && typeof call.body === 'object' && call.body !== null
    ).at(-1);
    const categoryText = String((categoryMessage?.body as { text?: string }).text || '');
    expect(categoryText).toContain('Вещи');
    expect(categoryText).toContain('Выбери объявление');

    const categoryMarkup = (categoryMessage?.body as { reply_markup?: { inline_keyboard?: Array<Array<{ text: string }>> } }).reply_markup?.inline_keyboard || [];
    const categoryButtons = categoryMarkup.flat().map((button) => button.text);
    expect(categoryButtons).toContain('Published things');
    expect(categoryButtons).not.toContain('Pending things');
    expect(categoryButtons).toContain('Назад к разделам');

    const adResponse = await sendUserTelegramWebhook({
      callback_query: {
        id: 'cb-ad',
        data: `user:sectionad:things:${publishedThingsId}`,
        message: {
          chat: { id: 40001 },
          message_id: 12,
        },
      },
    });

    expect(adResponse.status).toBe(200);
    const adMessage = telegramFetchCalls.filter(
      (call) => call.url.includes('/sendMessage') && typeof call.body === 'object' && call.body !== null
    ).at(-1);
    const adText = String((adMessage?.body as { text?: string }).text || '');
    expect(adText).toContain('Published things');
    expect(adText).toContain('Things body');
    expect(adText).toContain('Дата:');
    const adMarkup = (adMessage?.body as { reply_markup?: { inline_keyboard?: Array<Array<{ text: string }>> } }).reply_markup?.inline_keyboard || [];
    const adButtons = adMarkup.flat().map((button) => button.text);
    expect(adButtons).toContain('Назад к категории');
    expect(adButtons).toContain('Назад к разделам');
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
  it('allows an admin to promote another user, edit and delete any ad', async () => {
    await seedUser({
      id: 10,
      login: 'admin',
      email: 'admin@example.com',
      sessionToken: 'admin-session',
      role: 'admin',
    });
    for (const id of [11, 12, 13, 14, 15, 16]) {
      await seedUser({
        id,
        login: `user${id}`,
        email: `user${id}@example.com`,
        sessionToken: `user${id}-session`,
      });
    }

    const adId = await insertAd({
      title: 'Old title',
      body: 'Old body',
      category: 'misc',
      ownerUserId: 11,
      status: 'published',
    });

    const adminCookie = 'session=admin-session';

    const adminPage = await runRequest(
      new Request('http://example.com/admin?section=users&page=1', {
        headers: { Cookie: adminCookie },
      })
    );

    expect(adminPage.status).toBe(200);
    const adminHtml = await adminPage.text();
    expect(adminHtml).toContain('Пользователи');
    expect(adminHtml).toContain('Страница 1 из 2');
    expect(adminHtml).toContain('Сделать admin');
    expect(adminHtml).not.toContain('user16');

    const promoteUserResponse = await runRequest(
      new Request('http://example.com/admin/users/12/promote?section=users&page=1', {
        method: 'POST',
        headers: { Cookie: adminCookie },
      })
    );

    expect(promoteUserResponse.status).toBe(303);
    expect(promoteUserResponse.headers.get('Location')).toContain('/admin?section=users&page=1');
    const promotedUser = await env.DB.prepare(
      `
        SELECT role
        FROM users
        WHERE id = ?
        LIMIT 1
      `
    )
      .bind(12)
      .first<{ role: string }>();

    expect(promotedUser?.role).toBe('admin');

    const adminAdsPage = await runRequest(
      new Request('http://example.com/admin?section=ads&page=1', {
        headers: { Cookie: adminCookie },
      })
    );

    expect(adminAdsPage.status).toBe(200);
    const adminAdsHtml = await adminAdsPage.text();
    expect(adminAdsHtml).toContain('Объявления');
    expect(adminAdsHtml).toContain('Old title');
    expect(adminAdsHtml).toContain(`/admin/edit/${adId}`);
    expect(adminAdsHtml).toContain(`/admin/delete/${adId}`);

    const editResponse = await runRequest(
      new Request(`http://example.com/admin/edit/${adId}?section=ads&page=1`, {
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
      new Request(`http://example.com/admin/delete/${adId}?section=ads&page=1`, {
        method: 'POST',
        headers: { Cookie: adminCookie },
      })
    );

    expect(deleteResponse.status).toBe(303);
    expect(deleteResponse.headers.get('Location')).toContain('/admin?section=ads&page=1');
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

    const adminAfterDelete = await runRequest(
      new Request('http://example.com/admin', {
        headers: { Cookie: adminCookie },
      })
    );

    expect(adminAfterDelete.status).toBe(200);
    const adminAfterDeleteHtml = await adminAfterDelete.text();
    expect(adminAfterDeleteHtml).not.toContain('New title');
    expect(adminAfterDeleteHtml).not.toContain('Old title');

    const secondDeleteResponse = await runRequest(
      new Request(`http://example.com/admin/delete/${adId}?section=ads&page=1`, {
        method: 'POST',
        headers: { Cookie: adminCookie },
      })
    );

    expect(secondDeleteResponse.status).toBe(303);
    expect(secondDeleteResponse.headers.get('Location')).toContain('/admin?section=ads&page=1');
  });
});

describe('Admin bot flow', () => {
  it('shows the admin menu and can promote a user from the bot', async () => {
    for (const id of [30, 31, 32, 33, 34, 35]) {
      await seedUser({
        id,
        login: `botuser${id}`,
        email: `botuser${id}@example.com`,
        sessionToken: `botuser${id}-session`,
      });
    }

    const startResponse = await sendTelegramWebhook({
      message: {
        chat: { id: TELEGRAM_ADMIN_CHAT_ID },
        from: { id: TELEGRAM_ADMIN_CHAT_ID },
        text: '/start',
      },
    });

    expect(startResponse.status).toBe(200);
    const startMessage = telegramFetchCalls.filter(
      (call) => call.url.includes('/sendMessage') && typeof call.body === 'object' && call.body !== null
    ).at(-1);
    expect(startMessage).toBeTruthy();
    expect((startMessage?.body as { text?: string }).text).toContain('Админ-панель');
    expect((startMessage?.body as { reply_markup?: { inline_keyboard?: unknown[][] } }).reply_markup?.inline_keyboard?.length).toBeGreaterThan(0);

    const usersPageResponse = await sendTelegramWebhook({
      callback_query: {
        id: 'cb-users',
        data: 'admin:users:page:1',
        message: {
          chat: { id: TELEGRAM_ADMIN_CHAT_ID },
          message_id: 100,
        },
      },
    });

    expect(usersPageResponse.status).toBe(200);
    const usersPageMessage = telegramFetchCalls.filter(
      (call) => call.url.includes('/sendMessage') && typeof call.body === 'object' && call.body !== null
    ).at(-1);
    expect((usersPageMessage?.body as { text?: string }).text).toContain('Пользователи: страница 1/2');

    const promoteResponse = await sendTelegramWebhook({
      callback_query: {
        id: 'cb-promote',
        data: `admin:user:1:30:promote`,
        message: {
          chat: { id: TELEGRAM_ADMIN_CHAT_ID },
          message_id: 100,
        },
      },
    });

    expect(promoteResponse.status).toBe(200);
    const promotedUser = await env.DB.prepare(
      `
        SELECT role
        FROM users
        WHERE id = ?
        LIMIT 1
      `
    )
      .bind(30)
      .first<{ role: string }>();

    expect(promotedUser?.role).toBe('admin');

    const userMessages = telegramFetchCalls
      .filter((call) => call.url.includes('/sendMessage'))
      .map((call) => call.body as { text?: string });
    expect(userMessages.some((body) => String(body.text || '').includes('Пользователи: страница 1/2'))).toBe(true);
  });

  it('can edit and delete ads from the bot', async () => {
    await seedUser({
      id: 31,
      login: 'owner',
      email: 'owner@example.com',
      sessionToken: 'owner-session',
    });

    const adIds: number[] = [];
    for (let index = 0; index < 6; index += 1) {
      adIds.push(
        await insertAd({
          title: `Bot title ${index + 1}`,
          body: `Bot body ${index + 1}`,
          category: 'misc',
          ownerUserId: 31,
          status: 'published',
        })
      );
    }

    const openAdResponse = await sendTelegramWebhook({
      callback_query: {
        id: 'cb-open',
        data: 'admin:ads:page:1',
        message: {
          chat: { id: TELEGRAM_ADMIN_CHAT_ID },
          message_id: 200,
        },
      },
    });
    expect(openAdResponse.status).toBe(200);
    expect(
      telegramFetchCalls.some(
        (call) => call.url.includes('/sendMessage') && String((call.body as { text?: string }).text || '').includes('Объявления: страница 1/2')
      )
    ).toBe(true);

    const adsPage2Response = await sendTelegramWebhook({
      callback_query: {
        id: 'cb-page2',
        data: 'admin:ads:page:2',
        message: {
          chat: { id: TELEGRAM_ADMIN_CHAT_ID },
          message_id: 200,
        },
      },
    });
    expect(adsPage2Response.status).toBe(200);
    const adsPage2Message = telegramFetchCalls.filter(
      (call) => call.url.includes('/sendMessage') && typeof call.body === 'object' && call.body !== null
    ).at(-1);
    expect((adsPage2Message?.body as { text?: string }).text).toContain('Объявления: страница 2/2');

    const editStartResponse = await sendTelegramWebhook({
      callback_query: {
        id: 'cb-edit',
        data: `admin:ad:1:${adIds[5]}:edit`,
        message: {
          chat: { id: TELEGRAM_ADMIN_CHAT_ID },
          message_id: 200,
        },
      },
    });
    expect(editStartResponse.status).toBe(200);

    await sendTelegramWebhook({
      message: {
        chat: { id: TELEGRAM_ADMIN_CHAT_ID },
        from: { id: TELEGRAM_ADMIN_CHAT_ID },
        text: 'Updated bot title',
      },
    });
    await sendTelegramWebhook({
      message: {
        chat: { id: TELEGRAM_ADMIN_CHAT_ID },
        from: { id: TELEGRAM_ADMIN_CHAT_ID },
        text: 'Updated bot body',
      },
    });
    const editSaveResponse = await sendTelegramWebhook({
      message: {
        chat: { id: TELEGRAM_ADMIN_CHAT_ID },
        from: { id: TELEGRAM_ADMIN_CHAT_ID },
        text: 'services',
      },
    });

    expect(editSaveResponse.status).toBe(200);

    const editedAd = await env.DB.prepare(
      `
        SELECT title, body, category
        FROM ads
        WHERE id = ?
        LIMIT 1
      `
    )
      .bind(adIds[5])
      .first<{ title: string; body: string; category: string | null }>();

    expect(editedAd?.title).toBe('Updated bot title');
    expect(editedAd?.body).toBe('Updated bot body');
    expect(editedAd?.category).toBe('services');

    const deleteResponse = await sendTelegramWebhook({
      callback_query: {
        id: 'cb-delete',
        data: `admin:ad:1:${adIds[5]}:delete`,
        message: {
          chat: { id: TELEGRAM_ADMIN_CHAT_ID },
          message_id: 200,
        },
      },
    });

    expect(deleteResponse.status).toBe(200);
    const deletedAd = await env.DB.prepare(
      `
        SELECT deleted_at
        FROM ads
        WHERE id = ?
        LIMIT 1
      `
    )
      .bind(adIds[5])
      .first<{ deleted_at: string | null }>();

    expect(deletedAd?.deleted_at).not.toBeNull();
  });
});
