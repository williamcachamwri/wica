import { jsonOK, jsonError } from '../utils/security'

const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API = 'https://api.spotify.com/v1/me/player/currently-playing'

interface Env { SPOTIFY_CLIENT_ID: string; SPOTIFY_CLIENT_SECRET: string; SPOTIFY_REFRESH_TOKEN: string }

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
  if (!res.ok) throw new Error('Spotify token refresh failed')
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

async function getNowPlaying(accessToken: string) {
  const res = await fetch(SPOTIFY_API, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 204) return { isPlaying: false }
  if (!res.ok) throw new Error('Spotify API error')
  const data = (await res.json()) as {
    is_playing: boolean
    item: { name: string; artists: Array<{ name: string }>; album: { name: string; images: Array<{ url: string }> }; duration_ms: number; external_urls: { spotify: string } }
    progress_ms: number
  }
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

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context

  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
    return jsonError('Spotify not configured', 503)
  }

  try {
    const accessToken = await getAccessToken(env)
    const data = await getNowPlaying(accessToken)
    return jsonOK(data)
  } catch {
    return jsonError('Failed to fetch now playing', 500)
  }
}
