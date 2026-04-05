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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          ค้นหา<span className="text-primary">แคลอรี่</span>อาหาร
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          ข้อมูลโภชนาการอาหารไทยครบจบในที่เดียว แคลอรี่ โปรตีน ไขมัน คาร์บ พร้อมเปรียบเทียบ
        </p>

        {/* Search box */}
        <form action="/search" method="GET" className="max-w-xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="พิมพ์ชื่ออาหาร เช่น อกไก่, ข้าวมันไก่, มาม่า..."
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              ค้นหา
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm">
          <span className="text-muted-foreground">ยอดนิยม:</span>
          {["อกไก่", "ข้าวขาว", "ไข่", "กล้วย", "มาม่า"].map(q => (
            <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} className="text-primary hover:underline">
              {q}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">หมวดหมู่อาหาร</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.key}
              href={`/category/${cat.key}`}
              className="p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors text-center"
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <div className="font-medium">{cat.label}</div>
              <div className="text-sm text-muted-foreground">{cat.count} รายการ</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular foods */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">อาหารยอดนิยม</h2>
          <Link href="/search" className="text-primary text-sm hover:underline">ดูทั้งหมด &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {popularFoods.map(food => (
            <Link
              key={food.id}
              href={`/food/${food.slug}`}
              className="p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{food.emoji}</span>
                <span className="font-medium text-sm leading-tight">{food.name_th}</span>
              </div>
              <div className="text-2xl font-bold text-primary">{Math.round(food.calories)} <span className="text-sm font-normal text-muted-foreground">kcal</span></div>
              <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                <span>P {food.protein}g</span>
                <span>F {food.fat}g</span>
                <span>C {food.carbs}g</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{food.serving_size}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick calorie ranges */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">ค้นหาตามแคลอรี่</h2>
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
              className="p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors text-center"
            >
              <div className="font-bold text-primary text-lg">{item.label}</div>
              <div className="text-sm text-muted-foreground">{item.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO content */}
      <section className="prose max-w-none text-muted-foreground text-sm">
        <h2 className="text-xl font-bold text-foreground">CalCheck — ฐานข้อมูลโภชนาการอาหารไทย</h2>
        <p>
          CalCheck คือเว็บไซต์ค้นหาข้อมูลโภชนาการอาหารไทยที่ครบถ้วนที่สุด รวมข้อมูลแคลอรี่ โปรตีน ไขมัน คาร์โบไฮเดรต
          ของอาหารไทยหลากหลายชนิด ตั้งแต่อาหารตามสั่ง อาหารสำเร็จรูป เมนู 7-Eleven ขนมขบเคี้ยว ผลไม้ เครื่องดื่ม
          ไปจนถึงอาหารคลีนสำหรับคนรักสุขภาพ พร้อมเครื่องมือเปรียบเทียบอาหาร ช่วยให้คุณตัดสินใจเลือกกินได้ง่ายขึ้น
        </p>
        <p>
          ไม่ว่าคุณจะกำลังลดน้ำหนัก เพิ่มกล้ามเนื้อ หรือแค่อยากรู้ว่าอาหารที่กินอยู่มีแคลอรี่เท่าไหร่
          CalCheck มีคำตอบให้คุณ ค้นหาได้เลย!
        </p>
      </section>
    </div>
  )
}
