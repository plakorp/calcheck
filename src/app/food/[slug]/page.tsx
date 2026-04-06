import { getAllFoods, getFoodBySlug, getRelatedFoods } from "@/lib/food-data"
import { generateFoodTitle, generateFoodDescription, generateFoodFAQ } from "@/lib/slug"
import { CATEGORIES, type CategoryKey } from "@/types/database"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

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

  return {
    title: generateFoodTitle(food.name_th, food.calories),
    description: generateFoodDescription(food.name_th, food.calories, food.protein, food.fat, food.carbs, food.serving_size),
  }
}

export default async function FoodPage({ params }: Props) {
  const { slug } = await params
  const food = await getFoodBySlug(slug)
  if (!food) notFound()

  const related = await getRelatedFoods(food)
  const faqs = generateFoodFAQ(food.name_th, food.calories, food.protein)
  const cat = CATEGORIES[food.category as CategoryKey]

  // Structured data: NutritionInformation
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

  // FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://calcheck.com" },
      { "@type": "ListItem", position: 2, name: cat?.label || food.category, item: `https://calcheck.com/category/${food.category}` },
      { "@type": "ListItem", position: 3, name: food.name_th, item: `https://calcheck.com/food/${food.slug}` },
    ],
  }

  // Macro percentages for visual bar
  const totalMacroG = food.protein + food.fat + food.carbs
  const proteinPct = totalMacroG > 0 ? (food.protein / totalMacroG) * 100 : 0
  const fatPct = totalMacroG > 0 ? (food.fat / totalMacroG) * 100 : 0
  const carbsPct = totalMacroG > 0 ? (food.carbs / totalMacroG) * 100 : 0

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nutritionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">หน้าแรก</Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/category/${food.category}`} className="hover:text-foreground transition-colors">{cat?.label || food.category}</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{food.name_th}</span>
        </nav>

        {/* Two-column layout: left (image + info) | right (nutrition card) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* LEFT COLUMN: Image + Info */}
          <div className="lg:col-span-1">
            {/* Food image placeholder */}
            <div className="bg-muted rounded-2xl aspect-[4/3] mb-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]" />

            {/* Food name + emoji */}
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-4xl flex-shrink-0">{food.emoji}</span>
                <h1 className="text-2xl font-bold text-foreground leading-tight">{food.name_th}</h1>
              </div>
              {food.name_en && (
                <p className="text-sm text-muted-foreground">{food.name_en}</p>
              )}
            </div>

            {/* Brand + verified badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {food.brand && (
                <Link
                  href={`/brand/${encodeURIComponent(food.brand.toLowerCase())}`}
                  className="inline-block text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full hover:opacity-80 transition-opacity"
                >
                  {food.brand}
                </Link>
              )}
              {food.verified && (
                <span className="inline-block text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">
                  ✓ ยืนยันแล้ว
                </span>
              )}
            </div>

            {/* ข้อมูลเพิ่มเติม table */}
            {(food.serving_size || food.source || food.brand) && (
              <div className="space-y-3 text-sm">
                {food.serving_size && (
                  <div className="flex justify-between pb-3 border-b border-border">
                    <span className="text-muted-foreground">ปริมาณ</span>
                    <span className="font-medium text-foreground">{food.serving_size}</span>
                  </div>
                )}
                {food.source && (
                  <div className="flex justify-between pb-3 border-b border-border">
                    <span className="text-muted-foreground">แหล่งข้อมูล</span>
                    <span className="font-medium text-foreground capitalize">{food.source}</span>
                  </div>
                )}
                {food.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">อัพเดท</span>
                    <span className="font-medium text-foreground">{new Date(food.updated_at).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Nutrition Card */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
              {/* Calories highlight */}
              <div className="mb-8 pb-6 border-b border-border">
                <div className="text-5xl font-bold text-primary mb-1">{Math.round(food.calories)}</div>
                <p className="text-sm text-muted-foreground">kcal ต่อ {food.serving_size}</p>
              </div>

              {/* Macro progress bar */}
              <div className="h-3 rounded-full overflow-hidden flex mb-6 bg-muted">
                {proteinPct > 0 && <div className="bg-blue-500" style={{ width: `${proteinPct}%` }} title={`โปรตีน ${proteinPct.toFixed(0)}%`} />}
                {fatPct > 0 && <div className="bg-amber-500" style={{ width: `${fatPct}%` }} title={`ไขมัน ${fatPct.toFixed(0)}%`} />}
                {carbsPct > 0 && <div className="bg-orange-400" style={{ width: `${carbsPct}%` }} title={`คาร์บ ${carbsPct.toFixed(0)}%`} />}
              </div>

              {/* Macro grid: 3 columns */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500 mb-1">{food.protein}g</div>
                  <p className="text-xs text-muted-foreground">โปรตีน</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500 mb-1">{food.fat}g</div>
                  <p className="text-xs text-muted-foreground">ไขมัน</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-1">{food.carbs}g</div>
                  <p className="text-xs text-muted-foreground">คาร์โบไฮเดรต</p>
                </div>
              </div>

              {/* Extra nutrients section */}
              {(food.fiber !== null || food.sodium !== null || food.sugar !== null) && (
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  {food.fiber !== null && (
                    <div>
                      <div className="font-bold text-foreground mb-1">{food.fiber}g</div>
                      <p className="text-xs text-muted-foreground">ไฟเบอร์</p>
                    </div>
                  )}
                  {food.sodium !== null && (
                    <div>
                      <div className="font-bold text-foreground mb-1">{food.sodium}mg</div>
                      <p className="text-xs text-muted-foreground">โซเดียม</p>
                    </div>
                  )}
                  {food.sugar !== null && (
                    <div>
                      <div className="font-bold text-foreground mb-1">{food.sugar}g</div>
                      <p className="text-xs text-muted-foreground">น้ำตาล</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {food.tags && food.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {food.tags.map(tag => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full hover:opacity-80 transition-opacity"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* FAQ section — SEO gold */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-foreground mb-6">คำถามที่พบบ่อย</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group border border-border rounded-lg overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.05)]"
                open={i === 0}
              >
                <summary className="p-4 bg-card cursor-pointer font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-between">
                  {faq.question}
                  <span className="text-muted-foreground text-sm group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="p-4 bg-muted text-sm text-foreground border-t border-border">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related foods — "คนดูอาหารนี้ยังดู..." */}
        {related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-foreground mb-6">คนดูอาหารนี้ยังดู...</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/food/${r.slug}`}
                  className="group p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors shadow-[0px_1px_3px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-2xl flex-shrink-0">{r.emoji}</span>
                    <span className="text-sm font-medium text-foreground leading-tight line-clamp-2">{r.name_th}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">{Math.round(r.calories)}<span className="text-xs font-normal text-muted-foreground ml-1">kcal</span></div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Compare CTA */}
        <section className="mb-12">
          <div className="bg-muted rounded-lg p-6 text-center border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
            <p className="text-sm text-muted-foreground mb-3">อยากเปรียบเทียบกับอาหารอื่น?</p>
            <Link
              href={`/compare?a=${food.slug}`}
              className="inline-block text-primary font-medium hover:underline text-sm"
            >
              เปรียบเทียบ {food.name_th} กับอาหารอื่น →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
