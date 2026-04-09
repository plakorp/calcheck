import { NextResponse } from "next/server"
import { getAllFoods } from "@/lib/food-data"

const INDEXNOW_KEY = "d194a4a22ed5457294861d90b850fe75"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://checkkal.com"
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

// POST /api/indexnow
// Body: { urls?: string[] }  — if empty, submits ALL food pages
// Protected by CRON_SECRET env var
export async function POST(req: Request) {
  // Simple auth check
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let urls: string[] = []

  try {
    const body = await req.json().catch(() => ({}))
    urls = body.urls || []
  } catch {
    urls = []
  }

  // If no URLs provided, bulk-submit all food pages
  if (urls.length === 0) {
    const foods = await getAllFoods()
    urls = [
      SITE_URL,
      `${SITE_URL}/search`,
      `${SITE_URL}/blog`,
      ...foods.map(f => `${SITE_URL}/food/${f.slug}`),
    ]
  }

  // IndexNow allows max 10,000 URLs per request
  const chunks = chunkArray(urls, 10000)
  const results = []

  for (const chunk of chunks) {
    const payload = {
      host: new URL(SITE_URL).hostname,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: chunk,
    }

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    })

    results.push({ submitted: chunk.length, status: res.status })
  }

  return NextResponse.json({
    success: true,
    totalUrls: urls.length,
    results,
  })
}

// GET /api/indexnow — quick health check / trigger from browser
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get("secret")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Delegate to POST logic
  return POST(new Request(req.url, { method: "POST", headers: req.headers }))
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
