import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateBlogPost, BLOG_TOPICS, type BlogTopic } from "@/lib/blog-generator"
import { submitToIndexNow, SITE_URL } from "@/lib/indexnow"

// ใช้ service role key เพื่อ insert ได้โดยไม่ถูก RLS block
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/generate-blog
// Body: { topicIndex?: number, slug?: string, count?: number }
// - topicIndex: gen topic ที่ระบุ index
// - slug: gen topic ที่มี slug ตรงกัน
// - count: gen หลายบทความพร้อมกัน (max 5)
// - ถ้าไม่ระบุ: สุ่ม topic ที่ยังไม่มีใน DB
export async function POST(req: Request) {
  // Auth check
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { topicIndex, slug, count = 1 } = body

    // ดึง slugs ที่มีอยู่แล้วใน DB
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("slug")
    const existingSlugs = new Set((existing || []).map((p: { slug: string }) => p.slug))

    // เลือก topics ที่จะ gen
    let topicsToGenerate: BlogTopic[] = []

    if (slug) {
      const found = BLOG_TOPICS.find(t => t.slug === slug)
      if (!found) return NextResponse.json({ error: `Topic slug "${slug}" not found` }, { status: 404 })
      topicsToGenerate = [found]
    } else if (typeof topicIndex === "number") {
      const found = BLOG_TOPICS[topicIndex]
      if (!found) return NextResponse.json({ error: `Topic index ${topicIndex} not found` }, { status: 404 })
      topicsToGenerate = [found]
    } else {
      // สุ่มจาก topics ที่ยังไม่มีใน DB
      const available = BLOG_TOPICS.filter(t => !existingSlugs.has(t.slug))
      if (available.length === 0) {
        return NextResponse.json({ message: "All topics already generated!", total: BLOG_TOPICS.length })
      }
      const shuffled = available.sort(() => Math.random() - 0.5)
      topicsToGenerate = shuffled.slice(0, Math.min(count, 5))
    }

    // Gen และ save แต่ละบทความ
    const results = []
    const publishedSlugs: string[] = []
    for (const topic of topicsToGenerate) {
      // Skip ถ้ามีอยู่แล้ว
      if (existingSlugs.has(topic.slug)) {
        results.push({ slug: topic.slug, status: "skipped", reason: "already exists" })
        continue
      }

      try {
        const post = await generateBlogPost(topic)

        const { error } = await supabase.from("blog_posts").insert({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: post.tags,
          meta_title: post.meta_title,
          meta_description: post.meta_description,
          related_food_slugs: post.related_food_slugs,
          status: "published",
          published_at: new Date().toISOString(),
          author: "CheckKal AI",
        })

        if (error) {
          results.push({ slug: topic.slug, status: "error", reason: error.message })
        } else {
          results.push({ slug: topic.slug, title: post.title, status: "created" })
          existingSlugs.add(topic.slug)
          publishedSlugs.push(topic.slug)
        }
      } catch (err) {
        results.push({ slug: topic.slug, status: "error", reason: String(err) })
      }
    }

    // Submit fresh URLs to IndexNow in a single batch (Bing, Yandex, etc.)
    let indexnow: { ok: boolean; submitted: number } | null = null
    if (publishedSlugs.length > 0) {
      const urls = [
        ...publishedSlugs.map(s => `${SITE_URL}/blog/${s}`),
        `${SITE_URL}/blog`,
        `${SITE_URL}/sitemap.xml`,
      ]
      const r = await submitToIndexNow(urls)
      indexnow = { ok: r.ok, submitted: r.submitted }
    }

    return NextResponse.json({
      success: true,
      generated: results.filter(r => r.status === "created").length,
      results,
      indexnow,
      remaining: BLOG_TOPICS.filter(t => !existingSlugs.has(t.slug)).length,
    })

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET /api/generate-blog?secret=xxx&count=3 — trigger จาก browser ได้
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get("secret")
  const count = parseInt(searchParams.get("count") || "1")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const fakeBody = JSON.stringify({ count })
  return POST(
    new Request(req.url, {
      method: "POST",
      headers: { ...Object.fromEntries(req.headers), "content-type": "application/json" },
      body: fakeBody,
    })
  )
}
