const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API = 'https://api.spotify.com/v1/me/player/currently-playing'

interface Env {
  SPOTIFY_CLIENT_ID: string
  SPOTIFY_CLIENT_SECRET: string
  SPOTIFY_REFRESH_TOKEN: string
}

interface TokenResponse {
  access_token: string
}

interface Artist {
  name: string
}

interface Album {
  name: string
  images: Array<{ url: string }>
}

interface Track {
  name: string
  artists: Artist[]
  album: Album
  duration_ms: number
  external_urls: { spotify: string }
}

interface NowPlayingResponse {
  is_playing: boolean
  item: Track
  progress_ms: number
}

interface NowPlayingResult {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumArt?: string | null
  url?: string
  progressMs?: number
  durationMs?: number
}

async function getAccessToken(env: Env): Promise<string> {
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

  const data = (await res.json()) as TokenResponse
  return data.access_token
}

async function getNowPlaying(accessToken: string): Promise<NowPlayingResult> {
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

  const data = (await res.json()) as NowPlayingResponse

  return {
    isPlaying: true,
    title: data.item.name,
    artist: data.item.artists.map((a: Artist) => a.name).join(', '),
    album: data.item.album.name,
    albumArt: data.item.album.images[0]?.url || null,
    url: data.item.external_urls.spotify,
    progressMs: data.progress_ms,
    durationMs: data.item.duration_ms,
  }
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
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
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
