const ALLOWED_ORIGINS = [
  'https://wica.info',
  'https://wica.pages.dev',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const SAFE_REDIRECT_RE = /^\/(?:[a-zA-Z0-9\-._~!$&'()*+,;=:@/?]*)$/

export function isAllowedOrigin(origin: string | null): boolean {
  return !!origin && ALLOWED_ORIGINS.includes(origin)
}

export function secureHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
}

export function corsHeader(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin')
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return { 'Access-Control-Allow-Origin': origin }
  }
  return {}
}

export function safeRedirect(dest: string | null, fallback = '/'): string {
  if (!dest) return fallback
  if (SAFE_REDIRECT_RE.test(dest)) return dest
  try {
    const u = new URL(dest)
    if (ALLOWED_ORIGINS.includes(u.origin)) return dest
  } catch {}
  return fallback
}

export function jsonError(msg: string, status = 500, request?: Request): Response {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    ...secureHeaders(),
  }
  if (request) Object.assign(h, corsHeader(request))
  return new Response(JSON.stringify({ error: msg }), { status, headers: h })
}

export function jsonOK(data: unknown, request?: Request, extraHeaders?: Record<string, string>): Response {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    ...secureHeaders(),
  }
  if (request) Object.assign(h, corsHeader(request))
  if (extraHeaders) Object.assign(h, extraHeaders)
  return new Response(JSON.stringify(data), { headers: h })
}

export function requireMethod(request: Request, method: string): Response | null {
  if (request.method !== method) {
    return jsonError('Method not allowed', 405, request)
  }
  return null
}
