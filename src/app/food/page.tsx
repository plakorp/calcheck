import { getAllFoods, deduplicateFoods } from "@/lib/food-data"
import { CATEGORIES, type CategoryKey } from "@/types/database"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "อาหารทั้งหมด — แคลอรี่และโภชนาการ | CheckKal",
  description:
    "รวมข้อมูลแคลอรี่และโภชนาการอาหารไทย อาหารเซเว่น อาหารคลีน ขนม เครื่องดื่ม พร้อมเปรียบเทียบ ครบจบในที่เดียว — CheckKal",
  alternates: {
    canonical: "https://www.checkkal.com/food",
  },
  openGraph: {
    title: "อาหารทั้งหมด — แคลอรี่และโภชนาการ | CheckKal",
    description:
      "รวมข้อมูลแคลอรี่และโภชนาการอาหารไทยกว่า 2,000 รายการ พร้อมเปรียบเทียบ",
    url: "https://www.checkkal.com/food",
    siteName: "CheckKal",
    locale: "th_TH",
    type: "website",
  },
}

const PAGE_SIZE = 60

type Props = {
  searchParams: Promise<{ page?: string; cat?: string }>
}

export default async function FoodIndexPage({ searchParams }: Props) {
  const { page: pageStr, cat } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const allFoods = deduplicateFoods(await getAllFoods())

  // Filter by category (optional)
  const filtered =
    cat && cat in CATEGORIES
      ? allFoods.filter(f => f.category === cat)
      : allFoods

  // Category counts (for tabs)
  const categoryCounts = Object.keys(CATEGORIES).reduce((acc, key) => {
    acc[key] = allFoods.filter(f => f.category === key).length
    return acc
  }, {} as Record<string, number>)

  // Pagination
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const foods = filtered.slice(start, start + PAGE_SIZE)

  const buildHref = (p: number, c?: string) => {
    const params = new URLSearchParams()
    if (c) params.set("cat", c)
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return qs ? `/food?${qs}` : "/food"
  }

  // ItemList schema
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "อาหารทั้งหมดบน CheckKal",
    numberOfItems: total,
    itemListElement: foods.map((f, i) => ({
      "@type": "ListItem",
      position: start + i + 1,
      name: f.name_th,
      url: `https://www.checkkal.com/food/${f.slug}`,
    })),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.checkkal.com" },
      { "@type": "ListItem", position: 2, name: "อาหารทั้งหมด", item: "https://www.checkkal.com/food" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-foreground">หน้าแรก</Link>
          <span>/</span>
          <span className="text-foreground">อาหารทั้งหมด</span>
        </nav>

        {/* Header */}
        <h1 className="text-[32px] font-medium tracking-[-0.5px] mb-2">
          อาหารทั้งหมด
        </h1>
        <p className="text-[15px] text-muted-foreground mb-10">
          {allFoods.length.toLocaleString()} รายการ — ค้นหาแคลอรี่และโภชนาการอาหารไทย อาหารเซเว่น
          ขนม เครื่องดื่ม พร้อมเปรียบเทียบได้ทันที
        </p>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/food"
            className={`px-4 py-2 rounded-full text-[14px] font-medium border transition-colors ${
              !cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary"
            }`}
          >
            ทั้งหมด ({allFoods.length.toLocaleString()})
          </Link>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map(key => {
            const c = CATEGORIES[key]
            const count = categoryCounts[key] || 0
            if (count === 0) return null
            const active = cat === key
            return (
              <Link
                key={key}
                href={buildHref(1, key)}
                className={`px-4 py-2 rounded-full text-[14px] font-medium border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary"
                }`}
              >
                <span className="mr-1">{c.emoji}</span>
                {c.label} ({count.toLocaleString()})
              </Link>
            )
          })}
        </div>

        {/* Stats */}
        <p className="text-[12px] font-semibold tracking-[0.5px] text-muted-foreground mb-6 uppercase">
          แสดง {start + 1}–{Math.min(start + PAGE_SIZE, total)} จาก {total.toLocaleString()} รายการ
        </p>

        {/* Food grid */}
        <div className="border-t border-border pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map(food => (
              <Link
                key={food.id}
                href={`/food/${food.slug}`}
                className="bg-card border border-border rounded-[8px] p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[24px]">{food.emoji || "🍽️"}</span>
                  <div className="text-[14px] font-medium line-clamp-2">{food.name_th}</div>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <div className="text-[24px] font-bold text-primary">{Math.round(food.calories)}</div>
                  <div className="text-[14px] text-muted-foreground">kcal</div>
                </div>

                <div className="text-[12px] text-muted-foreground mb-2 flex gap-3">
                  <span>P {Math.round(food.protein)}g</span>
                  <span>F {Math.round(food.fat * 10) / 10}g</span>
                  <span>C {Math.round(food.carbs)}g</span>
                </div>

                <div className="text-[12px] text-muted-foreground">
                  {food.serving_size}
                </div>
              </Link>
            ))}
          </div>

          {foods.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              ไม่พบอาหารในหมวดนี้
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
            {currentPage > 1 && (
              <Link
                href={buildHref(currentPage - 1, cat)}
                className="px-4 py-2 rounded-[4px] border border-border text-[14px] hover:border-primary"
              >
                ← ก่อนหน้า
              </Link>
            )}

            <span className="px-4 py-2 text-[14px] text-muted-foreground">
              หน้า {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={buildHref(currentPage + 1, cat)}
                className="px-4 py-2 rounded-[4px] border border-border text-[14px] hover:border-primary"
              >
                ถัดไป →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
