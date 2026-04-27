export function text(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  });
}

export function redirect(location: string, status = 303): Response {
  return new Response(null, { status, headers: { Location: location } });
}

export function redirectWithHeaders(location: string, status = 303, headers?: HeadersInit): Response {
  const nextHeaders = new Headers(headers);
  nextHeaders.set('Location', location);
  return new Response(null, { status, headers: nextHeaders });
}

export function redirectWithMessage(path: string, message: string, status = 303, headers?: HeadersInit): Response {
  return redirectWithHeaders(`${path}?message=${encodeURIComponent(message)}`, status, headers);
}

export function methodNotAllowed(): Response {
  return text('Method Not Allowed', 405);
}
