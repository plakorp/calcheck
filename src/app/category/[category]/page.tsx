import { getFoodsByCategory, getAllFoods, deduplicateFoods } from "@/lib/food-data"
import { CATEGORIES, type CategoryKey } from "@/types/database"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map(category => ({ category }))
}

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES[category as CategoryKey]
  if (!cat) return {}

  const title = `อาหารหมวด${cat.label} — แคลอรี่และโภชนาการ`
  const description = `รวมข้อมูลแคลอรี่และโภชนาการอาหารหมวด${cat.label}ทั้งหมด พร้อมเปรียบเทียบ — CheckKal`
  const url = `https://www.checkkal.com/category/${category}`

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
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = CATEGORIES[category as CategoryKey]
  if (!cat) notFound()

  const foods = deduplicateFoods(await getFoodsByCategory(category))

  // ItemList schema
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `อาหารหมวด${cat.label}`,
    numberOfItems: foods.length,
    itemListElement: foods.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: f.name_th,
      url: `https://www.checkkal.com/food/${f.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-foreground">หน้าแรก</Link>
          <span>/</span>
          <Link href="/category" className="hover:text-foreground">หมวดหมู่</Link>
          <span>/</span>
          <span className="text-foreground">{cat.label}</span>
        </nav>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[36px]">{cat.emoji}</span>
          <h1 className="text-[32px] font-medium tracking-[-0.5px]">อาหารหมวด{cat.label}</h1>
        </div>
        <p className="text-[12px] font-semibold tracking-[0.5px] text-muted-foreground mb-12 uppercase">
          {foods.length} รายการ
        </p>

        <div className="border-t border-border pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map(food => (
              <Link
                key={food.id}
                href={`/food/${food.slug}`}
                className="bg-card border border-border rounded-[8px] p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-[24px] shrink-0">{food.emoji}</span>
                  <div>
                    <div className="text-[14px] font-medium line-clamp-2">{food.name_th}</div>
                    {food.brand && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">{food.brand}</div>
                    )}
                  </div>
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
        </div>
      </div>
    </>
  )
}
