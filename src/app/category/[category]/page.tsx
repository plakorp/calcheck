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
      url: `https://calcheck.com/food/${f.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-foreground">หน้าแรก</Link>
          <span>/</span>
          <Link href="/category" className="hover:text-foreground">หมวดหมู่</Link>
          <span>/</span>
          <span className="text-foreground">{cat.label}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">
          {cat.emoji} อาหารหมวด{cat.label}
        </h1>
        <p className="text-muted-foreground mb-8">
          รวมข้อมูลแคลอรี่และโภชนาการอาหารหมวด{cat.label}ทั้งหมด {foods.length} รายการ
        </p>

        <div className="space-y-3">
          {foods.map(food => (
            <Link
              key={food.id}
              href={`/food/${food.slug}`}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors"
            >
              <span className="text-3xl">{food.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{food.name_th}</div>
                <div className="text-sm text-muted-foreground">{food.serving_size}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{Math.round(food.calories)}</div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
