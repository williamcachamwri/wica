export async function onRequest(context) {
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: context.env?.CF_R2 || 'unknown',
    environment: context.env?.ENVIRONMENT || 'production',
    version: '1.0.0',
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  })
}
