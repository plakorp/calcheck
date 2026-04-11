import { getAllFoods } from "@/lib/food-data"
import { getPublishedPosts } from "@/lib/blog-data"
import { CATEGORIES, type CategoryKey } from "@/types/database"
import Link from "next/link"

export default async function Home() {
  const foods = await getAllFoods()
  const popularFoods = foods.slice(0, 8)
  const articles = (await getPublishedPosts(3))

  // Group by category
  const categories = Object.entries(CATEGORIES).map(([key, val]) => ({
    key,
    ...val,
    count: foods.filter(f => f.category === key).length,
  })).filter(c => c.count > 0)

  return (
    <>
      {/* Hero — Zapier style */}
      <section className="flex justify-center px-6 border-b border-border">
        <div className="w-full max-w-[1200px] flex flex-col items-center py-20 md:py-28">
          <h1 className="text-[40px] md:text-[56px] font-medium tracking-[-1px] leading-[0.90] text-center text-foreground">
            ค้นหาแคลอรี่อาหาร
          </h1>
          <p className="text-[18px] md:text-[20px] text-[#36342e] leading-[1.4] text-center mt-6 max-w-[600px]">
            ข้อมูลแคลอรี่ โปรตีน ไขมัน คาร์บ ของอาหารไทยหลากหลายชนิด ครบจบในที่เดียว
          </p>

          {/* Search box */}
          <div className="w-full max-w-[600px] pt-10">
            <form action="/search" method="GET" className="flex gap-2">
              <input
                type="text"
                name="q"
                placeholder="พิมพ์ชื่ออาหาร เช่น อกไก่, ข้าวมันไก่, มาม่า..."
                className="flex-1 px-4 py-3 rounded-[5px] border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-[16px]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-[4px] font-semibold text-[16px] hover:opacity-90 transition-opacity"
              >
                ค้นหา
              </button>
            </form>

            <div className="mt-5 flex gap-3 justify-center text-[14px]">
              <span className="text-muted-foreground">ยอดนิยม:</span>
              {["อกไก่", "ข้าวขาว", "ไข่", "กล้วย", "มาม่า"].map(q => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="px-3 py-1 rounded-[20px] border border-border text-[#36342e] hover:border-[#939084] transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-12 mt-12">
            <div className="text-center">
              <div className="text-[36px] font-medium text-foreground">{foods.length}+</div>
              <div className="text-[14px] text-muted-foreground">รายการอาหาร</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] font-medium text-foreground">{categories.length}</div>
              <div className="text-[14px] text-muted-foreground">หมวดหมู่</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] font-medium text-foreground">{articles.length}+</div>
              <div className="text-[14px] text-muted-foreground">บทความ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — border-based cards */}
      <section className="flex justify-center px-6 py-16 md:py-20">
        <div className="w-full max-w-[1200px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-2">หมวดหมู่</p>
          <h2 className="text-[32px] font-medium text-foreground mb-8 tracking-[-0.5px]">เลือกตามประเภทอาหาร</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.key}
                href={`/category/${cat.key}`}
                className="flex flex-col items-center gap-2 py-6 rounded-[8px] border border-border bg-card hover:border-[#939084] transition-colors"
              >
                <span className="text-[36px]">{cat.emoji}</span>
                <span className="text-[16px] font-semibold text-foreground">{cat.label}</span>
                <span className="text-[14px] text-muted-foreground">{cat.count} รายการ</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular foods — Zapier card style */}
      <section className="flex justify-center px-6 py-16 md:py-20 border-t border-border">
        <div className="w-full max-w-[1200px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-2">ยอดนิยม</p>
              <h2 className="text-[32px] font-medium text-foreground tracking-[-0.5px]">อาหารที่คนค้นหามากที่สุด</h2>
            </div>
            <Link href="/search" className="px-5 py-2.5 rounded-[8px] bg-secondary text-secondary-foreground border border-border font-semibold text-[14px] hover:bg-[#c5c0b1] transition-colors">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {popularFoods.map(food => (
              <Link
                key={food.id}
                href={`/food/${food.slug}`}
                className="p-5 rounded-[8px] border border-border bg-card hover:border-[#939084] transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-[15px] text-foreground leading-tight">{food.name_th}</span>
                  <span className="text-[12px] text-muted-foreground ml-2 shrink-0">{food.serving_size}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-[28px] font-medium text-primary">{Math.round(food.calories)}</span>
                  <span className="text-[14px] text-muted-foreground">kcal</span>
                </div>
                {/* Macro row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary rounded-[5px] py-2 px-1.5 text-center">
                    <div className="text-[14px] font-semibold text-foreground">{food.protein}g</div>
                    <div className="text-[11px] text-muted-foreground">โปรตีน</div>
                  </div>
                  <div className="bg-secondary rounded-[5px] py-2 px-1.5 text-center">
                    <div className="text-[14px] font-semibold text-foreground">{food.fat}g</div>
                    <div className="text-[11px] text-muted-foreground">ไขมัน</div>
                  </div>
                  <div className="bg-secondary rounded-[5px] py-2 px-1.5 text-center">
                    <div className="text-[14px] font-semibold text-foreground">{food.carbs}g</div>
                    <div className="text-[11px] text-muted-foreground">คาร์บ</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog articles — Zapier style */}
      <section className="flex justify-center px-6 py-16 md:py-20 border-t border-border">
        <div className="w-full max-w-[1200px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-2">บทความ</p>
              <h2 className="text-[32px] font-medium text-foreground tracking-[-0.5px]">เรื่องน่ารู้เกี่ยวกับโภชนาการ</h2>
            </div>
            <Link href="/blog" className="px-5 py-2.5 rounded-[8px] bg-secondary text-secondary-foreground border border-border font-semibold text-[14px] hover:bg-[#c5c0b1] transition-colors">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.map(article => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="rounded-[8px] border border-border bg-card overflow-hidden hover:border-[#939084] transition-colors"
              >
                {/* Cover image */}
                <div className="bg-secondary h-44 w-full flex items-center justify-center text-5xl">
                  {article.cover_image_url ? (
                    <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
                  ) : '📝'}
                </div>
                <div className="p-5 flex flex-col gap-2.5">
                  <span className="self-start text-[12px] font-semibold uppercase tracking-[0.5px] text-primary">
                    {article.category}
                  </span>
                  <h3 className="text-[16px] font-semibold text-foreground leading-[1.3] line-clamp-2 tracking-[-0.16px]">
                    {article.title}
                  </h3>
                  <p className="text-[14px] text-muted-foreground leading-[1.5] line-clamp-2">
                    {article.excerpt}
                  </p>
                  <span className="text-[12px] text-muted-foreground">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
