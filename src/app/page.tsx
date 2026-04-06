import { getAllFoods } from "@/lib/food-data"
import { CATEGORIES, type CategoryKey } from "@/types/database"
import Link from "next/link"

export default async function Home() {
  const foods = await getAllFoods()
  const popularFoods = foods.slice(0, 8)

  // Group by category
  const categories = Object.entries(CATEGORIES).map(([key, val]) => ({
    key,
    ...val,
    count: foods.filter(f => f.category === key).length,
  })).filter(c => c.count > 0)

  return (
    <>
      {/* Hero */}
      <section className="flex justify-center px-4">
        <div className="w-full max-w-[1024px] flex flex-col items-center py-16">
          <h1 className="text-5xl font-bold tracking-[-1px] leading-[56px] text-center">
            <span className="text-foreground">ค้นหา</span>
            <span className="text-primary">แคลอรี่</span>
            <span className="text-foreground">อาหาร</span>
          </h1>
          <p className="text-lg font-semibold text-muted-foreground leading-7 text-center mt-2">
            ข้อมูลโภชนาการอาหารไทยครบจบในที่เดียว แคลอรี่ โปรตีน ไขมัน คาร์บ พร้อมเปรียบเทียบ
          </p>

          {/* Search box */}
          <div className="w-full max-w-[576px] pt-8">
            <form action="/search" method="GET" className="flex gap-2">
              <input
                type="text"
                name="q"
                placeholder="พิมพ์ชื่ออาหาร เช่น อกไก่, ข้าวมันไก่, มาม่า..."
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground placeholder:font-semibold shadow-[0px_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-ring text-base"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-base hover:opacity-90 transition-opacity"
              >
                ค้นหา
              </button>
            </form>

            <div className="mt-4 flex gap-3 justify-center text-sm">
              <span className="text-muted-foreground">ยอดนิยม:</span>
              {["อกไก่", "ข้าวขาว", "ไข่", "กล้วย", "มาม่า"].map(q => (
                <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} className="text-primary hover:underline">
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="flex justify-center px-4 pb-12">
        <div className="w-full max-w-[1024px]">
          <h2 className="text-2xl font-bold text-foreground mb-6">หมวดหมู่อาหาร</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <Link
                key={cat.key}
                href={`/category/${cat.key}`}
                className="w-[calc(25%-9px)] min-w-[140px] flex flex-col items-center gap-1 py-5 rounded-lg border border-border bg-card shadow-[0px_1px_3px_rgba(0,0,0,0.05)] hover:border-primary transition-colors"
              >
                <span className="text-[32px]">{cat.emoji}</span>
                <span className="text-[15px] font-semibold text-foreground">{cat.label}</span>
                <span className="text-sm text-muted-foreground">{cat.count} รายการ</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular foods */}
      <section className="flex justify-center px-4 pb-12">
        <div className="w-full max-w-[1024px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">อาหารยอดนิยม</h2>
            <Link href="/search" className="text-primary text-sm hover:underline">ดูทั้งหมด &rarr;</Link>
          </div>
          <div className="flex flex-wrap gap-4">
            {popularFoods.map(food => (
              <Link
                key={food.id}
                href={`/food/${food.slug}`}
                className="w-[calc(25%-12px)] min-w-[200px] p-4 rounded-lg border border-border bg-card shadow-[0px_1px_3px_rgba(0,0,0,0.05)] hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{food.emoji}</span>
                  <span className="font-medium text-sm text-foreground leading-tight">{food.name_th}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{Math.round(food.calories)}</span>
                  <span className="text-sm text-muted-foreground">kcal</span>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground pt-1">
                  <span>P {food.protein}g</span>
                  <span>F {food.fat}g</span>
                  <span>C {food.carbs}g</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{food.serving_size}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Calorie ranges */}
      <section className="flex justify-center px-4 pb-12">
        <div className="w-full max-w-[1024px]">
          <h2 className="text-2xl font-bold text-foreground mb-6">ค้นหาตามแคลอรี่</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { range: "0-100", label: "0-100 แคล", desc: "แคลอรี่ต่ำมาก" },
              { range: "100-200", label: "100-200 แคล", desc: "แคลอรี่ต่ำ" },
              { range: "200-400", label: "200-400 แคล", desc: "แคลอรี่ปานกลาง" },
              { range: "400-plus", label: "400+ แคล", desc: "แคลอรี่สูง" },
            ].map(item => (
              <Link
                key={item.range}
                href={`/calories/${item.range}`}
                className="p-4 rounded-lg border border-border bg-card shadow-[0px_1px_3px_rgba(0,0,0,0.05)] hover:border-primary transition-colors text-center"
              >
                <div className="font-bold text-primary text-lg">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="flex justify-center px-4 pb-12">
        <div className="w-full max-w-[1024px] p-6 rounded-xl border border-border bg-card shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          <h2 className="text-base font-semibold text-foreground mb-3">CalCheck — ฐานข้อมูลโภชนาการอาหารไทย</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            CalCheck คือเว็บไซต์ค้นหาข้อมูลโภชนาการอาหารไทยที่ครบถ้วนที่สุด รวมข้อมูลแคลอรี่ โปรตีน ไขมัน คาร์โบไฮเดรต
            ของอาหารไทยหลากหลายชนิด ตั้งแต่อาหารตามสั่ง อาหารสำเร็จรูป เมนู 7-Eleven ขนมขบเคี้ยว ผลไม้ เครื่องดื่ม
            ไปจนถึงอาหารคลีนสำหรับคนรักสุขภาพ พร้อมเครื่องมือเปรียบเทียบอาหาร ช่วยให้คุณตัดสินใจเลือกกินได้ง่ายขึ้น
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ไม่ว่าคุณจะกำลังลดน้ำหนัก เพิ่มกล้ามเนื้อ หรือแค่อยากรู้ว่าอาหารที่กินอยู่มีแคลอรี่เท่าไหร่
            CalCheck มีคำตอบให้คุณ ค้นหาได้เลย!
          </p>
        </div>
      </section>
    </>
  )
}
