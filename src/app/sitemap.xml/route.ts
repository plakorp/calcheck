import { getAllFoods } from "@/lib/food-data"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.checkkal.com"
const FOODS_PER_SITEMAP = 1000

/**
 * Sitemap Index — manually generated because Next.js generateSitemaps()
 * doesn't auto-create the index at /sitemap.xml in all versions.
 */
export async function GET() {
  const foods = await getAllFoods()
  const foodSitemapCount = Math.ceil(foods.length / FOODS_PER_SITEMAP)
  const now = new Date().toISOString()

  // Build sitemap index entries: id 0 = static/blog, id 1+ = food chunks
  const totalSitemaps = 1 + foodSitemapCount // 0 + food chunks
  const entries = Array.from({ length: totalSitemaps }, (_, i) =>
    `  <sitemap>
    <loc>${SITE_URL}/sitemap/${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  ).join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
