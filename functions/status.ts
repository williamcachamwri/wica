export async function onRequest(context: { request: Request; env: { CF_R2?: string; ENVIRONMENT?: string } }): Promise<Response> {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: context.env?.ENVIRONMENT || 'production',
    version: '1.0.0',
  }), {
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache',
    },
  })
}
