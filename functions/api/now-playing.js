const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API = 'https://api.spotify.com/v1/me/player/currently-playing'

async function getAccessToken(env) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    client_id: env.SPOTIFY_CLIENT_ID,
    client_secret: env.SPOTIFY_CLIENT_SECRET,
  })

  const res = await fetch(SPOTIFY_ACCOUNTS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error('Failed to refresh token')
  }

  const data = await res.json()
  return data.access_token
}

async function getNowPlaying(accessToken) {
  const res = await fetch(SPOTIFY_API, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status === 204) {
    return { isPlaying: false }
  }

  if (res.status === 401) {
    const body = await res.text()
    throw new Error(`Spotify 401: ${body}`)
  }

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to fetch currently playing: ${res.status} ${body}`)
  }

  const data = await res.json()

  return {
    isPlaying: true,
    title: data.item.name,
    artist: data.item.artists.map((a) => a.name).join(', '),
    album: data.item.album.name,
    albumArt: data.item.album.images[0]?.url || null,
    url: data.item.external_urls.spotify,
    progressMs: data.progress_ms,
    durationMs: data.item.duration_ms,
  }
}

export async function onRequest(context) {
  const { env } = context

  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
    return new Response(JSON.stringify({ error: 'Spotify not configured' }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    const accessToken = await getAccessToken({ ...env })
    const data = await getNowPlaying(accessToken)

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
