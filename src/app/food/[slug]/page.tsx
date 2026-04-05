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

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-foreground">หน้าแรก</Link>
          <span>/</span>
          <Link href={`/category/${food.category}`} className="hover:text-foreground">{cat?.label || food.category}</Link>
          <span>/</span>
          <span className="text-foreground">{food.name_th}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{food.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold">{food.name_th} — แคลอรี่และข้อมูลโภชนาการ</h1>
              {food.name_en && <p className="text-muted-foreground">{food.name_en}</p>}
            </div>
          </div>
          {food.brand && (
            <Link href={`/brand/${encodeURIComponent(food.brand.toLowerCase())}`} className="inline-block mt-2 text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
              {food.brand}
            </Link>
          )}
          {food.verified && (
            <span className="inline-block ml-2 mt-2 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
              ✓ ข้อมูลยืนยันแล้ว
            </span>
          )}
        </div>

        {/* Main nutrition card */}
        <div className="p-6 rounded-xl border border-border bg-card mb-8">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary">{Math.round(food.calories)}</div>
            <div className="text-muted-foreground">แคลอรี่ (kcal)</div>
            <div className="text-sm text-muted-foreground mt-1">ต่อ {food.serving_size}</div>
          </div>

          {/* Macro bar */}
          <div className="h-4 rounded-full overflow-hidden flex mb-4">
            <div className="bg-blue-500" style={{ width: `${proteinPct}%` }} title={`โปรตีน ${proteinPct.toFixed(0)}%`} />
            <div className="bg-amber-500" style={{ width: `${fatPct}%` }} title={`ไขมัน ${fatPct.toFixed(0)}%`} />
            <div className="bg-orange-400" style={{ width: `${carbsPct}%` }} title={`คาร์บ ${carbsPct.toFixed(0)}%`} />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">{food.protein}g</div>
              <div className="text-sm text-muted-foreground">โปรตีน</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-500">{food.fat}g</div>
              <div className="text-sm text-muted-foreground">ไขมัน</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{food.carbs}g</div>
              <div className="text-sm text-muted-foreground">คาร์โบไฮเดรต</div>
            </div>
          </div>

          {/* Extra nutrients */}
          {(food.fiber || food.sodium || food.sugar) && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center text-sm">
              {food.fiber !== null && (
                <div>
                  <div className="font-bold">{food.fiber}g</div>
                  <div className="text-muted-foreground">ไฟเบอร์</div>
                </div>
              )}
              {food.sodium !== null && (
                <div>
                  <div className="font-bold">{food.sodium}mg</div>
                  <div className="text-muted-foreground">โซเดียม</div>
                </div>
              )}
              {food.sugar !== null && (
                <div>
                  <div className="font-bold">{food.sugar}g</div>
                  <div className="text-muted-foreground">น้ำตาล</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {food.tags && food.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {food.tags.map(tag => (
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-primary/10 transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* FAQ section — SEO gold */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">คำถามที่พบบ่อย</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="p-4 rounded-lg border border-border bg-card" open={i === 0}>
                <summary className="font-medium cursor-pointer">{faq.question}</summary>
                <p className="mt-2 text-muted-foreground text-sm">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related foods — internal linking */}
        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">คนดูอาหารนี้ยังดู...</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {related.map(r => (
                <Link key={r.id} href={`/food/${r.slug}`} className="p-3 rounded-lg border border-border bg-card hover:border-primary transition-colors">
                  <div className="flex items-center gap-2">
                    <span>{r.emoji}</span>
                    <span className="text-sm font-medium">{r.name_th}</span>
                  </div>
                  <div className="text-lg font-bold text-primary mt-1">{Math.round(r.calories)} <span className="text-xs font-normal text-muted-foreground">kcal</span></div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Compare CTA — internal link */}
        <div className="p-4 rounded-lg bg-secondary text-center">
          <p className="text-sm text-secondary-foreground mb-2">อยากเปรียบเทียบกับอาหารอื่น?</p>
          <Link href={`/compare?a=${food.slug}`} className="text-primary font-medium hover:underline">
            เปรียบเทียบ {food.name_th} กับอาหารอื่น &rarr;
          </Link>
        </div>

        {/* Source info */}
        <div className="mt-8 text-xs text-muted-foreground">
          <p>แหล่งข้อมูล: {food.source} | อัพเดทล่าสุด: {new Date(food.updated_at).toLocaleDateString('th-TH')}</p>
        </div>
      </div>
    </>
  )
}
