import { deleteTokenCookie } from '../../../utils/auth'
import { safeRedirect } from '../../../utils/security'

export async function onRequest(context: { request: Request }): Promise<Response> {
  const { request } = context
  const url = new URL(request.url)
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

  return new Response(null, {
    status: 302,
    headers: {
      Location: safeRedirect(url.searchParams.get('redirect'), '/'),
      'Set-Cookie': deleteTokenCookie(!isLocalhost),
    },
  })
}
