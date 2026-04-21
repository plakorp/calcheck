import { getAllFoods, getFoodBySlug, getRelatedFoods, getFoodVariants, deduplicateFoods } from "@/lib/food-data"
import { NutritionCard } from "@/components/ui/NutritionCard"
import { generateFoodTitle, generateFoodDescription } from "@/lib/slug"
import { getArticlesForFood, getPublishedPosts } from "@/lib/blog-data"
import { CATEGORIES, type CategoryKey } from "@/types/database"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import AdUnit from "@/components/AdUnit"
// Pre-render top 1000 foods at build time, rest rendered on-demand via ISR
export async function generateStaticParams() {
  const foods = await getAllFoods()
  return foods.slice(0, 1000).map(food => ({ slug: food.slug }))
}

export const dynamicParams = true
export const revalidate = 86400 // re-validate cached pages every 24h

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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function FoodPage({ params }: Props) {
  const { slug } = await params
  const food = await getFoodBySlug(slug)
  if (!food) notFound()

  const [relatedRaw, variants] = await Promise.all([
    getRelatedFoods(food),
    getFoodVariants(food.name_th),
  ])
  const related = deduplicateFoods(relatedRaw)
  let relatedArticles = await getArticlesForFood(food.slug, food.name_th, food.name_en, 3)
  let articlesAreTopicMatch = relatedArticles.length > 0
  // Fallback: if no topic match found, show latest published articles so the section never looks empty
  if (relatedArticles.length === 0) {
    try {
      relatedArticles = await getPublishedPosts(3)
    } catch {
      relatedArticles = []
    }
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

  const servingLabel = food.serving_size ?? "100g"

  // ── FAQ — visible content for AdSense quality (not just schema) ──────────
  const faqs = [
    {
      q: `${food.name_th} มีกี่แคลอรี่?`,
      a: `${food.name_th} ${servingLabel ? `(${servingLabel})` : ""} มีพลังงาน ${Math.round(food.calories)} กิโลแคลอรี่ โดยแบ่งเป็นโปรตีน ${Math.round(food.protein * 10) / 10}g คาร์โบไฮเดรต ${Math.round(food.carbs * 10) / 10}g และไขมัน ${Math.round(food.fat * 10) / 10}g`,
    },
    {
      q: `${food.name_th} เหมาะกับคนลดน้ำหนักไหม?`,
      a: food.calories <= 150
        ? `${food.name_th} มีแคลอรี่ค่อนข้างต่ำ (${Math.round(food.calories)} kcal) เหมาะสำหรับคนลดน้ำหนักที่ต้องการควบคุมพลังงาน แต่ควรดูปริมาณการกินเป็นหลัก`
        : food.calories <= 300
        ? `${food.name_th} มีแคลอรี่ปานกลาง (${Math.round(food.calories)} kcal) สามารถกินได้ระหว่างลดน้ำหนัก แต่ควรควบคุมปริมาณและกินร่วมกับผักเพิ่มความอิ่ม`
        : `${food.name_th} มีแคลอรี่ค่อนข้างสูง (${Math.round(food.calories)} kcal) หากอยู่ในช่วงลดน้ำหนักควรกินในปริมาณน้อยหรือเลือก${cat?.label ?? 'อาหาร'}ที่มีแคลอรี่ต่ำกว่าแทน`,
    },
    {
      q: `${food.name_th} มีโปรตีนเท่าไหร่?`,
      a: `${food.name_th} มีโปรตีน ${Math.round(food.protein * 10) / 10} กรัม${servingLabel ? `ต่อ${servingLabel}` : ""} ${food.protein >= 15 ? "ถือว่าเป็นแหล่งโปรตีนที่ดี เหมาะสำหรับคนที่ต้องการเสริมกล้ามเนื้อหรือออกกำลังกาย" : food.protein >= 8 ? "มีโปรตีนพอใช้ได้ ช่วยเสริมการสร้างกล้ามเนื้อและซ่อมแซมเนื้อเยื่อในร่างกาย" : "มีโปรตีนในระดับต่ำ หากต้องการโปรตีนเพิ่มควรกินร่วมกับอาหารโปรตีนสูงอื่นๆ"}`,
    },
    ...(food.sodium != null ? [{
      q: `${food.name_th} มีโซเดียมสูงไหม?`,
      a: `${food.name_th} มีโซเดียม ${food.sodium} mg${servingLabel ? `ต่อ${servingLabel}` : ""} ${food.sodium >= 600 ? "ซึ่งค่อนข้างสูง ผู้ที่มีปัญหาความดันโลหิตสูงหรือโรคไตควรระวังการกินในปริมาณมาก" : food.sodium >= 300 ? "ในระดับปานกลาง ควรดูแลปริมาณโซเดียมรวมต่อวันไม่เกิน 2,300 mg" : "ในระดับต่ำ เหมาะสำหรับผู้ที่ต้องการควบคุมโซเดียม"}`,
    }] : []),
  ]

  // ── FAQ Schema ───────────────────────────────────────────────────────────
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nutritionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={food.image_url || '/placeholder-food.jpg'}
                alt={food.name_th}
                className={`w-full h-full ${food.image_url ? 'object-cover' : 'object-contain p-10'}`}
              />
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

            {/* Description — AI-generated unique content (description_th) or fallback template */}
            {food.description_th ? (
              <div className="space-y-3">
                {food.description_th.split('\n\n').filter(p => p.trim()).map((paragraph, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                ข้อมูลโภชนาการ, แคลอรี่, พลังงาน และสารอาหาร ใน{food.name_th}
                {servingLabel ? ` ในปริมาณ ${servingLabel}` : ""} มีพลังงานทั้งหมด {Math.round(food.calories)} กิโลแคลอรี่,
                โปรตีน {Math.round(food.protein * 10) / 10} กรัม, คาร์โบไฮเดรต {Math.round(food.carbs * 10) / 10} กรัม, ไขมัน {Math.round(food.fat * 10) / 10} กรัม
                {food.sodium != null ? " เราสามารถดูรายละเอียดข้อมูลอื่นๆ เช่น เกลือโซเดียม, คอเลสเตอรอล, วิตามิน, ไขมันอิ่มตัว, ไขมันไม่อิ่มตัว, น้ำตาล, กากใยอาหาร ฯลฯ ได้จากตารางด้านล่างครับ" : ""}
              </p>
            )}
          </div>

          {/* RIGHT: Nutrition Card (interactive) */}
          <NutritionCard food={food} variants={variants} />
        </div>

        {/* ── FAQ — visible content (key for AdSense quality) ────────────── */}
        <section className="mb-16">
          <h2 className="text-[22px] font-semibold text-foreground mb-6 tracking-[-0.3px]">
            คำถามที่พบบ่อยเกี่ยวกับ{food.name_th}
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="rounded-[8px] border border-border bg-card p-5">
                <h3 className="text-[15px] font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

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
                    ) : null}
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

        {/* ── Ad: Bottom of page ─────────────────────────────────────────── */}
        <AdUnit slot="9351026424" className="my-8" />

      </main>
    </>
  )
}
