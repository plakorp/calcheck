import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา | CheckKal — ฐานข้อมูลโภชนาการอาหารไทย',
  description:
    'CheckKal คือเว็บไซต์ข้อมูลโภชนาการและแคลอรี่อาหารไทยที่ครบครัน ช่วยให้คุณตัดสินใจเรื่องอาหารได้อย่างชาญฉลาด',
  alternates: { canonical: 'https://www.checkkal.com/about' },
}

export default async function AboutPage() {
  const [{ count: foodCount }, { count: blogCount }] = await Promise.all([
    supabase.from('foods').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
  ])

  const foodDisplay = foodCount ? foodCount.toLocaleString('th-TH') : '10,000+'
  const blogDisplay = blogCount ? `${blogCount}+` : '45+'

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-[36px] font-semibold tracking-[-0.5px] mb-4">เกี่ยวกับ CheckKal</h1>
        <p className="text-base text-[#36342e]">
          ฐานข้อมูลโภชนาการอาหารไทย ครบ ถูกต้อง ใช้งานง่าย
        </p>
      </div>

      {/* Mission */}
      <section className="mb-10">
        <h2 className="text-[24px] font-semibold tracking-[-0.5px] mb-4">พันธกิจของเรา</h2>
        <p className="text-[#36342e] leading-relaxed mb-4">
          CheckKal เกิดขึ้นจากความเชื่อว่า <strong>ข้อมูลโภชนาการที่ถูกต้องควรเข้าถึงได้ง่ายสำหรับทุกคน</strong>
          ไม่ว่าจะเป็นคนที่กำลังลดน้ำหนัก นักกีฬา ผู้ดูแลสุขภาพ หรือแค่คนที่อยากรู้ว่าข้าวผัดกระเพราจาน
          โปรดมีแคลอรี่เท่าไหร่
        </p>
        <p className="text-[#36342e] leading-relaxed">
          เราตั้งเป้าสร้างฐานข้อมูลอาหารไทยที่ครบครันที่สุด ครอบคลุมทั้งอาหารตามสั่ง อาหารจานด่วน
          อาหารแพ็กเกจในร้านสะดวกซื้อ ไปจนถึงเมนูร้านอาหารชื่อดัง
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-[#f0fdf4] rounded-xl p-6 text-center">
          <div className="text-[36px] font-semibold tracking-[-0.5px] text-[#10b981] mb-1">{foodDisplay}</div>
          <div className="text-sm text-[#36342e]">รายการอาหาร</div>
        </div>
        <div className="bg-[#f0fdf4] rounded-xl p-6 text-center">
          <div className="text-[36px] font-semibold tracking-[-0.5px] text-[#10b981] mb-1">{blogDisplay}</div>
          <div className="text-sm text-[#36342e]">บทความโภชนาการ</div>
        </div>
        <div className="bg-[#f0fdf4] rounded-xl p-6 text-center">
          <div className="text-[36px] font-semibold tracking-[-0.5px] text-[#10b981] mb-1">ฟรี</div>
          <div className="text-sm text-[#36342e]">เข้าถึงได้ทุกคน</div>
        </div>
      </section>

      {/* What we offer */}
      <section className="mb-10">
        <h2 className="text-[24px] font-semibold tracking-[-0.5px] mb-4">สิ่งที่เราให้บริการ</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold">ค้นหาข้อมูลอาหาร</h3>
              <p className="text-[#36342e] text-sm">
                ค้นหาแคลอรี่ โปรตีน ไขมัน คาร์โบไฮเดรต และสารอาหารอื่นๆ จากอาหารกว่า {foodDisplay} รายการ
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold">เปรียบเทียบอาหาร</h3>
              <p className="text-[#36342e] text-sm">
                เปรียบเทียบโภชนาการระหว่างอาหาร 2 ชนิด เพื่อตัดสินใจได้ง่ายขึ้น
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold">บทความโภชนาการ</h3>
              <p className="text-[#36342e] text-sm">
                อ่านบทความให้ความรู้เรื่องโภชนาการ การลดน้ำหนัก และการกินเพื่อสุขภาพ
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold">ดูตามหมวดหมู่</h3>
              <p className="text-[#36342e] text-sm">
                เรียกดูอาหารตามหมวดหมู่ เช่น โปรตีน คาร์โบไฮเดรต ผักผลไม้ เครื่องดื่ม และอื่นๆ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Source */}
      <section className="mb-10">
        <h2 className="text-[24px] font-semibold tracking-[-0.5px] mb-4">แหล่งข้อมูลของเรา</h2>
        <p className="text-[#36342e] leading-relaxed mb-3">
          ข้อมูลโภชนาการของ CheckKal รวบรวมจากแหล่งที่น่าเชื่อถือ ได้แก่:
        </p>
        <ul className="list-disc list-inside text-[#36342e] space-y-1">
          <li>กรมอนามัย กระทรวงสาธารณสุข ประเทศไทย</li>
          <li>USDA FoodData Central</li>
          <li>ฉลากโภชนาการจากผู้ผลิตโดยตรง</li>
          <li>Open Food Facts (ฐานข้อมูลอาหารโอเพนซอร์ส)</li>
        </ul>
        <p className="text-[#36342e] leading-relaxed mt-3 text-sm">
          * ข้อมูลโภชนาการมีไว้เพื่อเป็นข้อมูลอ้างอิงเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์
        </p>
      </section>

      {/* CTA */}
      <div className="bg-[#f0fdf4] rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">มีคำถามหรือข้อเสนอแนะ?</h2>
        <p className="text-[#36342e] mb-4">เราอยากได้ยินความคิดเห็นจากคุณ</p>
        <Link
          href="/contact"
          className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#059669] transition-colors"
        >
          ติดต่อเรา
        </Link>
      </div>
    </main>
  )
}
