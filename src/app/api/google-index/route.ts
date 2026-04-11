import { NextResponse } from 'next/server'
import { getAllFoods } from '@/lib/food-data'
import { submitToGoogle } from '@/lib/google-indexing'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || 'https://www.checkkal.com'

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // no secret set = open (dev mode)

  const { searchParams } = new URL(req.url)
  const querySecret = searchParams.get('secret')
  const authHeader = req.headers.get('authorization')

  return querySecret === cronSecret || authHeader === `Bearer ${cronSecret}`
}

/**
 * GET /api/google-index?secret=...&limit=200&offset=auto
 * Bulk-submit food pages to Google Indexing API (max 200/day)
 *
 * offset=auto  → rotate through all foods automatically based on today's date
 * offset=N     → manual offset (for debugging)
 *
 * Called daily by Vercel Cron (vercel.json)
 */
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '200'), 200)
  const staticUrls = [SITE_URL, `${SITE_URL}/food`, `${SITE_URL}/blog`]
  const foodLimit = limit - staticUrls.length

  try {
    const foods = await getAllFoods()
    const totalBatches = Math.ceil(foods.length / foodLimit)

    // Auto-rotate batch each day so cron covers all pages over time
    let offset: number
    const offsetParam = searchParams.get('offset')
    if (offsetParam === null || offsetParam === 'auto') {
      const dayIndex = Math.floor(Date.now() / 86400000) // days since epoch
      offset = (dayIndex % totalBatches) * foodLimit
    } else {
      offset = parseInt(offsetParam) || 0
    }

    const urls = [
      ...staticUrls,
      ...foods.slice(offset, offset + foodLimit).map(f => `${SITE_URL}/food/${f.slug}`),
    ]

    const result = await submitToGoogle(urls)
    return NextResponse.json({
      ...result,
      limit,
      offset,
      batch: `${Math.floor(offset / foodLimit) + 1}/${totalBatches}`,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/**
 * POST /api/google-index
 * Body: { urls: string[] }
 * Used when publishing new food/blog items
 */
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { urls?: string[] }
  const urls = Array.isArray(body.urls) ? body.urls : []
  if (urls.length === 0) {
    return NextResponse.json({ error: 'No URLs provided' }, { status: 400 })
  }

  try {
    const result = await submitToGoogle(urls)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
