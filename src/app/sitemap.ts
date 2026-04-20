import { getAllFoodSlugs } from "@/lib/food-data"
import { getAllArticles } from "@/lib/blog-data"
import { getPublishedPosts } from "@/lib/blog-data"
import { CATEGORIES } from "@/types/database"
import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.checkkal.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const foods = await getAllFoodSlugs()
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map(cat => ({
    url: `${SITE_URL}/category/${cat}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Food pages (highest volume — SEO money pages)
  const foodPages: MetadataRoute.Sitemap = foods.map(food => ({
    url: `${SITE_URL}/food/${food.slug}`,
    lastModified: new Date(food.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))

  // Blog posts — Supabase (Phase 2) + static fallback (Phase 1)
  const supabasePosts = await getPublishedPosts()
  const staticArticles = getAllArticles()

  // Supabase blog posts
  const blogPages: MetadataRoute.Sitemap = supabasePosts.map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Static blog articles (only add if slug not already in Supabase)
  const supabaseSlugs = new Set(supabasePosts.map(p => p.slug))
  const staticBlogPages: MetadataRoute.Sitemap = staticArticles
    .filter(a => !supabaseSlugs.has(a.slug))
    .map(article => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

  return [
    ...staticPages,
    ...categoryPages,
    ...foodPages,
    ...blogPages,
    ...staticBlogPages,
  ]
}
