function deleteTokenCookie(isLocalhost: boolean): string {
  const parts = [`gh_token=`, `Path=/`, `Max-Age=0`, `HttpOnly`, `SameSite=Lax`]
  if (!isLocalhost) parts.push('Secure')
  return parts.join('; ')
}

export async function onRequest(context: { request: Request }): Promise<Response> {
  const { request } = context
  const url = new URL(request.url)
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  const redirect = url.searchParams.get('redirect') || '/'

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirect,
      'Set-Cookie': deleteTokenCookie(isLocalhost),
      'Access-Control-Allow-Origin': '*',
    },
  })
}
