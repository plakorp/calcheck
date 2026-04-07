import { getFoodsByCategory, getAllFoods } from "@/lib/food-data"
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

  return {
    title: `อาหารหมวด${cat.label} — แคลอรี่และโภชนาการ`,
    description: `รวมข้อมูลแคลอรี่และโภชนาการอาหารหมวด${cat.label}ทั้งหมด พร้อมเปรียบเทียบ — CalCheck`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = CATEGORIES[category as CategoryKey]
  if (!cat) notFound()

  const foods = await getFoodsByCategory(category)

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
      url: `https://checkkal.com/food/${f.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      <div className="max-w-[1024px] mx-auto px-4 pt-8 pb-12">
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-foreground">หน้าแรก</Link>
          <span>/</span>
          <Link href="/category" className="hover:text-foreground">หมวดหมู่</Link>
          <span>/</span>
          <span className="text-foreground">{cat.label}</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-[36px]">{cat.emoji}</span>
          <h1 className="text-[28px] font-bold">อาหารหมวด{cat.label}</h1>
        </div>
        <p className="text-[16px] font-semibold text-muted-foreground mb-8">
          {foods.length} รายการ
        </p>

        <div className="flex flex-wrap gap-4">
          {foods.map(food => (
            <Link
              key={food.id}
              href={`/food/${food.slug}`}
              className="w-[244px] bg-card border border-border rounded-lg shadow-[0px_1px_3px_rgba(0,0,0,0.05)] p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[24px]">{food.emoji}</span>
                <div className="text-[14px] font-medium">{food.name_th}</div>
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
    </>
  )
}
