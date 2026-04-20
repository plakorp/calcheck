import { getAllFoods, deduplicateFoods } from "@/lib/food-data"
import { getPublishedPosts } from "@/lib/blog-data"
import { CATEGORIES, type CategoryKey } from "@/types/database"
import Link from "next/link"

export default async function Home() {
  const foods = deduplicateFoods(await getAllFoods())
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
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-arc"></div>

        {/* Decorative dot ring */}
        <div className="dot-ring hidden md:block">
          <span style={{ left: "10%", top: "52%" }}></span>
          <span style={{ left: "20%", top: "30%" }}></span>
          <span style={{ left: "34%", top: "14%" }}></span>
          <span style={{ left: "50%", top: "6%" }}></span>
          <span style={{ left: "66%", top: "14%" }}></span>
          <span style={{ left: "80%", top: "30%" }}></span>
          <span style={{ left: "90%", top: "52%" }}></span>
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 pt-20 md:pt-28 pb-20 md:pb-28">

          {/* Orbit food emoji nodes — desktop only */}
          <div className="orbit hidden lg:block">
            <div className="node" style={{ left: "2%", top: "22%" }}>🍗</div>
            <div className="node" style={{ left: "5%", top: "48%" }}>🥚</div>
            <div className="node" style={{ right: "5%", top: "48%" }}>🍜</div>
            <div className="node" style={{ right: "2%", top: "22%" }}>🍌</div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Pill badge */}
            <div className="pill-badge mb-7">
              <span className="dot"></span>
              <span><strong className="font-semibold">{foods.length.toLocaleString()}+</strong> อาหารไทย · อัพเดททุกสัปดาห์</span>
            </div>

            {/* Headline with bracketed keyword */}
            <h1 className="text-[32px] sm:text-[40px] md:text-[64px] font-semibold leading-[1.2] md:leading-[1.15] tracking-[-0.02em] max-w-[900px] text-foreground">
              <span className="md:whitespace-nowrap">
                ค้นหา
                <span className="bracket text-primary">
                  แคลอรี่
                  <span className="corner c1"></span>
                  <span className="corner c2"></span>
                  <span className="corner c3"></span>
                  <span className="corner c4"></span>
                </span>
                อาหารไทย
              </span>
              <br />
              <span className="text-[#36342e]">ครบ จบ ในที่เดียว</span>
            </h1>

            <p className="mt-6 text-[17px] md:text-[19px] text-[#5a5851] max-w-[620px] leading-[1.55]">
              ข้อมูลแคลอรี่ โปรตีน ไขมัน คาร์บ ที่แม่นยำ สำหรับคนลดน้ำหนัก
              เล่นกล้าม และดูแลสุขภาพ — ค้นหาได้ในคลิกเดียว
            </p>

            {/* Premium search */}
            <form action="/search" method="GET" className="search-shell mt-10 w-full max-w-[680px] flex items-center p-2">
              <div className="pl-4 pr-2 text-muted-foreground">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input
                type="text"
                name="q"
                placeholder="พิมพ์ชื่ออาหาร เช่น อกไก่, ข้าวมันไก่, มาม่า…"
                className="flex-1 min-w-0 bg-transparent px-2 py-4 text-[16px] md:text-[17px] placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="btn-gradient shrink-0 px-4 md:px-6 py-3.5 rounded-[12px] font-semibold text-[14px] md:text-[15px] inline-flex items-center gap-1.5 md:gap-2"
              >
                ค้นหา
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            </form>

            {/* Popular chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[13px]">
              <span className="text-muted-foreground mr-1">ยอดนิยม:</span>
              {[
                { label: "🍗 อกไก่", q: "อกไก่" },
                { label: "🍚 ข้าวขาว", q: "ข้าวขาว" },
                { label: "🥚 ไข่", q: "ไข่" },
                { label: "🍌 กล้วย", q: "กล้วย" },
                { label: "🍜 มาม่า", q: "มาม่า" },
              ].map(item => (
                <Link
                  key={item.q}
                  href={`/search?q=${encodeURIComponent(item.q)}`}
                  className="chip px-3.5 py-1.5 rounded-full text-[#36342e]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-10 md:gap-20">
              <div className="text-center">
                <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.02em] text-primary">
                  {foods.length.toLocaleString()}+
                </div>
                <div className="text-[13px] text-muted-foreground mt-1">รายการอาหาร</div>
              </div>
              <div className="text-center">
                <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.02em] text-foreground">
                  {categories.length}
                </div>
                <div className="text-[13px] text-muted-foreground mt-1">หมวดหมู่</div>
              </div>
              <div className="text-center">
                <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.02em] text-foreground">
                  {articles.length}+
                </div>
                <div className="text-[13px] text-muted-foreground mt-1">บทความ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="flex justify-center px-6 py-16 md:py-20">
        <div className="w-full max-w-[1200px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary mb-2">หมวดหมู่</p>
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-[32px] md:text-[40px] font-semibold text-foreground tracking-[-0.02em]">เลือกตามประเภทอาหาร</h2>
            <Link href="/category" className="text-[14px] font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              ดูทั้งหมด →
            </Link>
          </div>
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

      {/* Popular foods */}
      <section className="flex justify-center px-6 py-16 md:py-20 border-t border-border bg-[#fbfaf5]">
        <div className="w-full max-w-[1200px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary mb-2">ยอดนิยม</p>
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-[32px] md:text-[40px] font-semibold text-foreground tracking-[-0.02em]">อาหารที่คนค้นหามากที่สุด</h2>
            <Link href="/search" className="text-[14px] font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              ดูทั้งหมด →
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
                  <span className="text-[12px] text-muted-foreground ml-2 shrink-0">
                    {food.serving_size?.replace(/[\d.]+/g, (n) => String(Math.round(parseFloat(n) * 10) / 10))}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-[28px] font-semibold text-primary tracking-[-0.02em]">{Math.round(food.calories)}</span>
                  <span className="text-[14px] text-muted-foreground">kcal</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary rounded-[5px] py-2 px-1.5 text-center">
                    <div className="text-[14px] font-semibold text-foreground">{Math.round((food.protein ?? 0) * 10) / 10}g</div>
                    <div className="text-[11px] text-muted-foreground">โปรตีน</div>
                  </div>
                  <div className="bg-secondary rounded-[5px] py-2 px-1.5 text-center">
                    <div className="text-[14px] font-semibold text-foreground">{Math.round((food.fat ?? 0) * 10) / 10}g</div>
                    <div className="text-[11px] text-muted-foreground">ไขมัน</div>
                  </div>
                  <div className="bg-secondary rounded-[5px] py-2 px-1.5 text-center">
                    <div className="text-[14px] font-semibold text-foreground">{Math.round((food.carbs ?? 0) * 10) / 10}g</div>
                    <div className="text-[11px] text-muted-foreground">คาร์บ</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog articles */}
      <section className="flex justify-center px-6 py-16 md:py-20 border-t border-border">
        <div className="w-full max-w-[1200px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary mb-2">บทความ</p>
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-[32px] md:text-[40px] font-semibold text-foreground tracking-[-0.02em]">เรื่องน่ารู้เกี่ยวกับโภชนาการ</h2>
            <Link href="/blog" className="text-[14px] font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articles.map(article => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group rounded-[8px] border border-border bg-card overflow-hidden hover:border-[#939084] transition-colors"
              >
                <div className="h-48 w-full overflow-hidden bg-gradient-to-br from-[#fff1e6] to-[#ffd8b8]">
                  {article.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : null}
                </div>
                <div className="p-5 flex flex-col gap-2.5">
                  <span className="self-start text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                    {article.category}
                  </span>
                  <h3 className="text-[17px] font-semibold text-foreground leading-[1.3] line-clamp-2 tracking-[-0.01em]">
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

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-b from-[#fff4ee] to-background">
        <div className="max-w-[900px] mx-auto px-6 py-20 md:py-24 text-center">
          <h2 className="text-[32px] md:text-[44px] font-semibold text-foreground tracking-[-0.02em]">
            พร้อมดูแลโภชนาการของคุณแล้วหรือยัง?
          </h2>
          <p className="text-[16px] text-[#5a5851] mt-4">
            ค้นหา เปรียบเทียบ บันทึกอาหารโปรด — ฟรี ไม่ต้องสมัครสมาชิก
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link href="/search" className="btn-gradient px-6 py-3.5 rounded-[12px] font-semibold text-[15px] inline-flex items-center gap-2">
              เริ่มค้นหาอาหาร
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/blog" className="px-6 py-3.5 rounded-[12px] font-semibold text-[15px] inline-flex items-center gap-2 bg-card border border-border text-[#36342e] hover:border-primary hover:text-primary transition-colors">
              อ่านบทความ
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
