import { searchFoods, getAllFoods, deduplicateFoods } from "@/lib/food-data"
import type { Metadata } from "next"
import Link from "next/link"

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  if (q) {
    return {
      title: `ค้นหา "${q}" — แคลอรี่และโภชนาการ`,
      description: `ผลการค้นหาแคลอรี่และข้อมูลโภชนาการของ "${q}" — CheckKal`,
    }
  }
  return {
    title: "ค้นหาอาหาร — แคลอรี่และข้อมูลโภชนาการ",
    description: "ค้นหาข้อมูลแคลอรี่และโภชนาการอาหารไทย อาหารสำเร็จรูป ขนม เครื่องดื่ม — CheckKal",
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const results = deduplicateFoods(q ? await searchFoods(q) : await getAllFoods())

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
      <h1 className="text-[32px] font-medium tracking-[-0.5px] mb-2">
        {q ? `ผลการค้นหา "${q}"` : "อาหารทั้งหมด"}
      </h1>
      <p className="text-muted-foreground font-normal text-[14px] mb-12">
        {results.length} รายการ
      </p>

      {/* Search form */}
      <form action="/search" method="GET" className="mb-12 pb-12 border-b border-border">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="พิมพ์ชื่ออาหาร..."
            className="flex-1 px-4 py-3 rounded-[5px] border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-[4px] font-medium hover:opacity-90 transition-opacity">
            ค้นหา
          </button>
        </div>
      </form>

      {results.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-[16px] mb-2">ไม่พบอาหารที่ค้นหา</p>
          <p className="text-[14px]">ลองค้นหาด้วยคำอื่น เช่น &ldquo;ไข่&rdquo; &ldquo;ข้าว&rdquo; &ldquo;ไก่&rdquo;</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(food => (
            <Link
              key={food.id}
              href={`/food/${food.slug}`}
              className="flex items-center gap-4 p-4 rounded-[8px] border border-border bg-card hover:border-primary transition-colors"
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
              <div className="hidden sm:flex gap-3 text-xs text-muted-foreground">
                <span>P {food.protein}g</span>
                <span>F {food.fat}g</span>
                <span>C {food.carbs}g</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
