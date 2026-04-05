import { getAllFoods } from "@/lib/food-data"
import { CATEGORIES } from "@/types/database"
import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://calcheck.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const foods = await getAllFoods()
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map(cat => ({
    url: `${SITE_URL}/category/${cat}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Food pages (highest volume)
  const foodPages: MetadataRoute.Sitemap = foods.map(food => ({
    url: `${SITE_URL}/food/${food.slug}`,
    lastModified: new Date(food.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))

  // Compare pages (auto-permutation — top combinations)
  const comparePages: MetadataRoute.Sitemap = []
  for (let i = 0; i < Math.min(foods.length, 10); i++) {
    for (let j = i + 1; j < Math.min(foods.length, 10); j++) {
      comparePages.push({
        url: `${SITE_URL}/compare/${foods[i].slug}-vs-${foods[j].slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })
    }
  }

  return [...staticPages, ...categoryPages, ...foodPages, ...comparePages]
}
