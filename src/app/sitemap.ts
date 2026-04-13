import { getAllFoods } from "@/lib/food-data"
import { getAllArticles } from "@/lib/blog-data"
import { getPublishedPosts } from "@/lib/blog-data"
import { CATEGORIES } from "@/types/database"
import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.checkkal.com"
const FOODS_PER_SITEMAP = 1000

/**
 * Sitemap Index — splits into multiple sitemaps for better crawlability
 * id 0: static pages + categories + blog
 * id 1+: food pages (1000 per sitemap)
 */
export async function generateSitemaps() {
  const foods = await getAllFoods()
  const foodSitemapCount = Math.ceil(foods.length / FOODS_PER_SITEMAP)

  // id 0 = static/categories/blog, id 1+ = food chunks
  const sitemaps = [{ id: 0 }]
  for (let i = 0; i < foodSitemapCount; i++) {
    sitemaps.push({ id: i + 1 })
  }
  return sitemaps
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const numId = Number(id) // Next.js may pass id as string

  // ── Sitemap 0: static + categories + blog ──
  if (numId === 0) {
    const staticPages: MetadataRoute.Sitemap = [
      { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
      { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ]

    const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map(cat => ({
      url: `${SITE_URL}/category/${cat}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    // Blog posts from Supabase + static fallback
    const supabasePosts = await getPublishedPosts()
    const staticArticles = getAllArticles()
    const supabaseSlugs = new Set(supabasePosts.map(p => p.slug))

    const blogPages: MetadataRoute.Sitemap = supabasePosts.map(post => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    const staticBlogPages: MetadataRoute.Sitemap = staticArticles
      .filter(a => !supabaseSlugs.has(a.slug))
      .map(article => ({
        url: `${SITE_URL}/blog/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))

    return [...staticPages, ...categoryPages, ...blogPages, ...staticBlogPages]
  }

  // ── Sitemap 1+: food pages (chunked) ──
  const foods = await getAllFoods()
  const start = (numId - 1) * FOODS_PER_SITEMAP
  const end = start + FOODS_PER_SITEMAP
  const chunk = foods.slice(start, end)

  return chunk.map(food => ({
    url: `${SITE_URL}/food/${food.slug}`,
    lastModified: new Date(food.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))
}
