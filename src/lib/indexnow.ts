/**
 * IndexNow helper — ping Bing / Yandex / Seznam / Naver when new or
 * updated URLs go live on checkkal.com.
 *
 * Usage:
 *   import { submitToIndexNow, urlsForBlogSlug } from "@/lib/indexnow"
 *   await submitToIndexNow(urlsForBlogSlug("my-post"))
 *
 * Docs: https://www.indexnow.org/documentation
 */

export const INDEXNOW_KEY = "d194a4a22ed5457294861d90b850fe75"
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow"

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.checkkal.com"

export interface IndexNowResult {
  ok: boolean
  status: number
  submitted: number
  error?: string
}

/**
 * Submit a batch of URLs to IndexNow. Silently swallows errors so blog
 * publish flows never fail because of an indexing ping.
 */
export async function submitToIndexNow(
  urls: string[]
): Promise<IndexNowResult> {
  const clean = Array.from(
    new Set(
      urls
        .filter(Boolean)
        .map(u => (u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? u : `/${u}`}`))
    )
  )

  if (clean.length === 0) {
    return { ok: true, status: 200, submitted: 0 }
  }

  const host = new URL(SITE_URL).hostname
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: clean,
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      // don't block the request for too long
      signal: AbortSignal.timeout(8000),
    })

    return {
      ok: res.ok,
      status: res.status,
      submitted: clean.length,
    }
  } catch (err) {
    // IndexNow is best-effort — log but never throw
    console.warn("[indexnow] submit failed:", err)
    return {
      ok: false,
      status: 0,
      submitted: clean.length,
      error: String(err),
    }
  }
}

/** Fire-and-forget variant — use inside publish flows. */
export function pingIndexNow(urls: string[]): void {
  // Don't await — let it run in the background.
  submitToIndexNow(urls).catch(err => {
    console.warn("[indexnow] background ping failed:", err)
  })
}

// ---- URL builders for common publish events ----------------------------

export function urlsForBlogSlug(slug: string): string[] {
  return [
    `${SITE_URL}/blog/${slug}`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/sitemap.xml`,
  ]
}

export function urlsForFoodSlug(slug: string): string[] {
  return [
    `${SITE_URL}/food/${slug}`,
    `${SITE_URL}/sitemap.xml`,
  ]
}
