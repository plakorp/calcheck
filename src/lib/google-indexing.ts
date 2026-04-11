/**
 * Google Indexing API helper — submit URLs directly to Google for fast indexing.
 * Uses service account JWT auth via Node.js built-in crypto (no extra packages).
 *
 * Env var required: GOOGLE_SERVICE_ACCOUNT_JSON (minified JSON string)
 */

import crypto from 'crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
const SCOPE = 'https://www.googleapis.com/auth/indexing'

interface ServiceAccount {
  client_email: string
  private_key: string
}

export interface GoogleIndexResult {
  url: string
  ok: boolean
  status?: number
  error?: string
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }))

  const unsigned = `${header}.${claim}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsigned)
  const sig = base64url(signer.sign(sa.private_key))
  const jwt = `${unsigned}.${sig}`

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(data.error ?? 'No access token')
  return data.access_token
}

/** Submit a single URL to Google Indexing API */
async function notifyUrl(url: string, token: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<GoogleIndexResult> {
  try {
    const res = await fetch(INDEXING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, type }),
      signal: AbortSignal.timeout(10000),
    })
    return { url, ok: res.ok, status: res.status }
  } catch (err) {
    return { url, ok: false, error: String(err) }
  }
}

/**
 * Submit a batch of URLs to Google Indexing API.
 * Rate limit: 200 URLs/day. Batches with 1s delay between requests.
 */
export async function submitToGoogle(urls: string[]): Promise<{
  submitted: number
  success: number
  failed: number
  results: GoogleIndexResult[]
}> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set')

  const sa = JSON.parse(Buffer.from(raw, 'base64').toString()) as ServiceAccount
  const token = await getAccessToken(sa)

  const results: GoogleIndexResult[] = []
  for (const url of urls) {
    const r = await notifyUrl(url, token)
    results.push(r)
    // Respect rate limits with small delay
    if (urls.length > 1) await new Promise(r => setTimeout(r, 200))
  }

  return {
    submitted: urls.length,
    success: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
    results,
  }
}
