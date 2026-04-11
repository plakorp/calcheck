import { getAllFoods, getFoodBySlug, getRelatedFoods } from "@/lib/food-data"
import { generateFoodTitle, generateFoodDescription } from "@/lib/slug"
import { getArticlesForFood, getPublishedPosts } from "@/lib/blog-data"
import { CATEGORIES, type CategoryKey } from "@/types/database"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import AdUnit from "@/components/AdUnit"

// SSG: generate all food pages at build time
export async function generateStaticParams() {
  const foods = await getAllFoods()
  return foods.map(food => ({ slug: food.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const food = await getFoodBySlug(slug)
  if (!food) return {}

  const title = generateFoodTitle(food.name_th, food.calories)
  const description = generateFoodDescription(food.name_th, food.calories, food.protein, food.fat, food.carbs, food.serving_size)
  const url = `https://www.checkkal.com/food/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CheckKal",
      locale: "th_TH",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

// ─── Nutrition row component ──────────────────────────────────────────────────
function NutrientRow({
  label,
  value,
  unit,
  dv,
  indent = false,
  bold = false,
  bottomBorder = false,
}: {
  label: string
  value: number | null
  unit: string
  dv?: number
  indent?: boolean
  bold?: boolean
  bottomBorder?: boolean
}) {
  if (value === null) return null
  return (
    <div
      className={`flex items-center justify-between py-2.5 border-t border-border ${
        indent ? "pl-8 pr-4" : "px-4"
      } ${bottomBorder ? "border-b-2" : ""}`}
      style={bottomBorder ? { borderBottomColor: "hsl(var(--primary))" } : undefined}
    >
      <span className={`text-sm ${bold ? "font-semibold" : ""} text-foreground`}>
        {label}{" "}
        <span className="font-normal">
          {value}{" "}
          <span className="text-muted-foreground text-xs">{unit}</span>
        </span>
      </span>
      {dv != null && (
        <span className="text-sm font-medium text-primary">{dv}%</span>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function FoodPage({ params }: Props) {
  const { slug } = await params
  const food = await getFoodBySlug(slug)
  if (!food) notFound()

  const related = await getRelatedFoods(food)
  let relatedArticles = await getArticlesForFood(food.slug, food.name_th, food.name_en, 3)
  let articlesAreTopicMatch = relatedArticles.length > 0
  // Fallback: if no topic match found, show latest published articles so the section never looks empty
  if (relatedArticles.length === 0) {
    relatedArticles = await getPublishedPosts(3)
    articlesAreTopicMatch = false
  }
  const cat = CATEGORIES[food.category as CategoryKey]

  // ── Structured data ──────────────────────────────────────────────────────
  const nutritionSchema = {
    "@context": "https://schema.org",
    "@type": "NutritionInformation",
    name: food.name_th,
    calories: `${Math.round(food.calories)} calories`,
    proteinContent: `${food.protein}g`,
    fatContent: `${food.fat}g`,
    carbohydrateContent: `${food.carbs}g`,
    servingSize: food.serving_size,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.checkkal.com" },
      { "@type": "ListItem", position: 2, name: cat?.label || food.category, item: `https://www.checkkal.com/category/${food.category}` },
      { "@type": "ListItem", position: 3, name: food.name_th, item: `https://www.checkkal.com/food/${food.slug}` },
    ],
  }

  // ── Macro calorie % (shown in summary box) ───────────────────────────────
  const totalCalFromMacros = food.protein * 4 + food.fat * 9 + food.carbs * 4
  const proteinCalPct = totalCalFromMacros > 0 ? (food.protein * 4 / totalCalFromMacros) * 100 : 0
  const fatCalPct = totalCalFromMacros > 0 ? (food.fat * 9 / totalCalFromMacros) * 100 : 0
  const carbsCalPct = totalCalFromMacros > 0 ? (food.carbs * 4 / totalCalFromMacros) * 100 : 0

  // ── % Daily Value (2,000 kcal reference) ────────────────────────────────
  const fatDV       = Math.round((food.fat / 65) * 100)
  const sodiumDV    = food.sodium != null ? Math.round((food.sodium / 2400) * 100) : undefined
  const carbsDV     = Math.round((food.carbs / 300) * 100)
  const fiberDV     = food.fiber != null ? Math.round((food.fiber / 25) * 100) : undefined
  const proteinDV   = Math.round((food.protein / 50) * 100)

  const servingLabel = food.serving_size ?? "100g"

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nutritionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="max-w-[1200px] mx-auto px-6 py-10">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href={`/category/${food.category}`} className="hover:text-foreground transition-colors">{cat?.label || food.category}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{food.name_th}</span>
        </nav>

        {/* ── Title — full width, outside grid ───────────────────────────── */}
        <h1 className="text-[26px] sm:text-[32px] lg:text-[36px] font-bold text-foreground mb-2 tracking-[-0.5px] leading-tight">
          {food.name_th}
        </h1>
        {food.name_en && /[\u0E00-\u0E7F]/.test(food.name_th) && (
          <p className="text-[16px] sm:text-[18px] text-muted-foreground mb-8 italic">
            {food.name_en.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </p>
        )}

        {/* ── Two-column layout ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 mb-16">

          {/* LEFT: Image + Category + Description */}
          <div>
            {/* Food image */}
            <div className="rounded-[12px] overflow-hidden aspect-[4/3] mb-6 bg-secondary border border-border">
              {food.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={food.image_url}
                  alt={food.name_th}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  {food.emoji}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-foreground mb-3">หมวดหมู่</p>
              <div className="flex flex-wrap gap-2">
                {cat && (
                  <Link
                    href={`/category/${food.category}`}
                    className="text-xs px-3 py-1.5 bg-secondary border border-border text-foreground rounded-[5px] hover:bg-secondary/80 transition-colors"
                  >
                    {cat.label}
                  </Link>
                )}
                {food.tags?.map(tag => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="text-xs px-3 py-1.5 bg-secondary border border-border text-foreground rounded-[5px] hover:bg-secondary/80 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
                {food.brand && (
                  <Link
                    href={`/brand/${encodeURIComponent(food.brand.toLowerCase())}`}
                    className="text-xs px-3 py-1.5 bg-secondary border border-border text-foreground rounded-[5px] hover:bg-secondary/80 transition-colors"
                  >
                    {food.brand}
                  </Link>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              ข้อมูลโภชนาการ, แคลอรี่, พลังงาน และสารอาหาร ใน{food.name_th}
              {servingLabel ? ` ในปริมาณ ${servingLabel}` : ""} มีพลังงานทั้งหมด {Math.round(food.calories)} กิโลแคลอรี่,
              โปรตีน {food.protein} กรัม, คาร์โบไฮเดรต {food.carbs} กรัม, ไขมัน {food.fat} กรัม
              {food.sodium != null ? " เราสามารถดูรายละเอียดข้อมูลอื่นๆ เช่น เกลือโซเดียม, คอเลสเตอรอล, วิตามิน, ไขมันอิ่มตัว, ไขมันไม่อิ่มตัว, น้ำตาล, กากใยอาหาร ฯลฯ ได้จากตารางด้านล่างครับ" : ""}
            </p>
          </div>

          {/* RIGHT: Nutrition Card */}
          <div className="bg-card border border-border rounded-[12px] p-6 h-fit">

            {/* Card header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">ข้อมูลโภชนาการ</h2>
              <div className="flex items-center gap-1.5 text-sm border border-border rounded-[6px] px-3 py-1.5 text-foreground select-none">
                <span>หน่วยบริโภค {servingLabel}</span>
                <span className="text-muted-foreground text-xs">▾</span>
              </div>
            </div>

            {/* Macro summary box */}
            <div className="bg-secondary rounded-[8px] grid grid-cols-4 divide-x divide-border mb-5 overflow-hidden">
              <div className="py-4 px-2 text-center">
                <div className="text-[22px] font-bold text-primary leading-none mb-1">
                  {Math.round(food.calories)}
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight">แคลอรี่ (kcal)</div>
                <div className="text-[11px] text-muted-foreground leading-tight">ต่อ {servingLabel}</div>
              </div>
              <div className="py-4 px-2 text-center">
                <div className="text-[22px] font-bold text-blue-500 leading-none mb-1">{food.protein}g</div>
                <div className="text-[11px] text-muted-foreground leading-tight">โปรตีน</div>
                <div className="text-[11px] text-blue-500 leading-tight">{Math.round(proteinCalPct)}%</div>
              </div>
              <div className="py-4 px-2 text-center">
                <div className="text-[22px] font-bold text-amber-500 leading-none mb-1">{food.fat}g</div>
                <div className="text-[11px] text-muted-foreground leading-tight">ไขมัน</div>
                <div className="text-[11px] text-amber-500 leading-tight">{Math.round(fatCalPct)}%</div>
              </div>
              <div className="py-4 px-2 text-center">
                <div className="text-[22px] font-bold text-primary leading-none mb-1">{food.carbs}g</div>
                <div className="text-[11px] text-muted-foreground leading-tight">คาร์โบไฮเดรต</div>
                <div className="text-[11px] text-primary leading-tight">{Math.round(carbsCalPct)}%</div>
              </div>
            </div>

            {/* Nutrition facts table */}
            <div className="rounded-[8px] overflow-hidden border border-border">
              {/* Table header */}
              <div
                className="px-4 pt-2 pb-1.5 text-right text-[11px] text-muted-foreground bg-card border-t-[3px]"
                style={{ borderTopColor: "hsl(var(--primary))" }}
              >
                % ร้อยละของปริมาณที่แนะนำต่อวัน*
              </div>

              {/* Rows */}
              <NutrientRow label="ไขมัน" value={food.fat} unit="g" dv={fatDV} bold />
              <NutrientRow label="โซเดียม" value={food.sodium ?? null} unit="mg" dv={sodiumDV} bold />
              <NutrientRow label="คาร์โบไฮเดรต" value={food.carbs} unit="g" dv={carbsDV} bold />
              <NutrientRow label="ใยอาหาร" value={food.fiber ?? null} unit="g" dv={fiberDV} indent />
              <NutrientRow label="น้ำตาล" value={food.sugar ?? null} unit="g" indent />
              <NutrientRow label="โปรตีน" value={food.protein} unit="g" dv={proteinDV} bold bottomBorder />
            </div>

            {/* Verified badge */}
            {food.verified && (
              <p className="text-xs text-primary mt-3 flex items-center gap-1">
                <span>✓</span> ข้อมูลผ่านการตรวจสอบแล้ว
              </p>
            )}
          </div>
        </div>

        {/* ── Ad Unit ────────────────────────────────────────────────────── */}
        <div className="mb-16">
          <AdUnit slot="1234567890" format="horizontal" />
        </div>

        {/* ── Related foods ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mb-16">
            <h2 className="text-[28px] font-semibold text-foreground mb-6 tracking-[-0.5px]">คนดูอาหารนี้ยังดู...</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/food/${r.slug}`}
                  className="group p-4 rounded-[8px] border border-border bg-card hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-2xl flex-shrink-0">{r.emoji}</span>
                    <span className="text-sm font-medium text-foreground leading-tight line-clamp-2">{r.name_th}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {Math.round(r.calories)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">kcal</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Related articles ───────────────────────────────────────────── */}
        {relatedArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-[28px] font-semibold text-foreground mb-6 tracking-[-0.5px]">
              {articlesAreTopicMatch ? `บทความที่เกี่ยวข้องกับ${food.name_th}` : "บทความน่าสนใจ"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="rounded-[8px] border border-border bg-card overflow-hidden hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="bg-secondary h-40 w-full flex items-center justify-center text-5xl">
                    {article.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
                    ) : '📝'}
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <span className="self-start text-[12px] font-semibold uppercase tracking-[0.5px] text-primary">
                      {article.category}
                    </span>
                    <h3 className="text-[16px] font-semibold text-foreground leading-[1.3] line-clamp-2 tracking-[-0.16px]">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-[14px] text-muted-foreground leading-[1.5] line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </>
  )
}
