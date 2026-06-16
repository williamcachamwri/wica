const COOKIE_NAME = 'gh_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function getCookieToken(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

const NONCE_COOKIE = 'state_nonce'
const REDIRECT_COOKIE = 'redirect_to'

export function nonceCookie(nonce: string, secure: boolean): string {
  const s = secure ? '; Secure' : ''
  return `${NONCE_COOKIE}=${nonce}; Path=/api/auth/github; HttpOnly; SameSite=Lax; Max-Age=300${s}`
}

export function redirectCookie(url: string, secure: boolean): string {
  const s = secure ? '; Secure' : ''
  return `${REDIRECT_COOKIE}=${encodeURIComponent(url)}; Path=/api/auth/github; HttpOnly; SameSite=Lax; Max-Age=300${s}`
}

export function clearNonceCookie(secure: boolean): string {
  const s = secure ? '; Secure' : ''
  return `${NONCE_COOKIE}=; Path=/api/auth/github; Max-Age=0; HttpOnly; SameSite=Lax${s}`
}

export function getNonceFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${NONCE_COOKIE}=([^;]+)`))
  return m ? m[1] : null
}

export function getRedirectFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${REDIRECT_COOKIE}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : null
}

export function setTokenCookie(token: string, secure: boolean): string[] {
  const s = secure ? '; Secure' : ''
  const newCookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/api/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${s}`
  const clearOld = `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${s}`
  return [newCookie, clearOld]
}

export function deleteTokenCookie(secure: boolean): string {
  const s = secure ? '; Secure' : ''
  return `${COOKIE_NAME}=; Path=/api/; Max-Age=0; HttpOnly; SameSite=Lax${s}`
}
