import { NextResponse } from "next/server"
import { getAllFoods } from "@/lib/food-data"
import { submitToIndexNow, SITE_URL } from "@/lib/indexnow"

/**
 * POST /api/indexnow
 * Body: { urls?: string[] }  — if empty, submits ALL food pages
 * Protected by CRON_SECRET env var (Authorization: Bearer <secret>)
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let urls: string[] = []

  try {
    const body = await req.json().catch(() => ({}))
    urls = Array.isArray(body.urls) ? body.urls : []
  } catch {
    urls = []
  }

  // If no URLs provided, bulk-submit everything
  if (urls.length === 0) {
    const foods = await getAllFoods()
    urls = [
      SITE_URL,
      `${SITE_URL}/search`,
      `${SITE_URL}/blog`,
      `${SITE_URL}/sitemap.xml`,
      ...foods.map(f => `${SITE_URL}/food/${f.slug}`),
    ]
  }

  // IndexNow allows max 10,000 URLs per request
  const chunks = chunkArray(urls, 10000)
  const results = []

  for (const chunk of chunks) {
    const r = await submitToIndexNow(chunk)
    results.push(r)
  }

  return NextResponse.json({
    success: results.every(r => r.ok),
    totalUrls: urls.length,
    results,
  })
}

/** GET /api/indexnow?secret=... — quick trigger from browser / cron */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get("secret")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return POST(
    new Request(req.url, {
      method: "POST",
      headers: {
        ...Object.fromEntries(req.headers),
        authorization: `Bearer ${cronSecret ?? ""}`,
      },
    })
  )
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
