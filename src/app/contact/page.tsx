import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ติดต่อเรา | CheckKal',
  description:
    'ติดต่อทีมงาน CheckKal สำหรับข้อเสนอแนะ การรายงานข้อมูลผิด การร่วมงาน หรือสอบถามข้อมูล',
  alternates: { canonical: 'https://www.checkkal.com/contact' },
}

export default function ContactPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
      <div className="text-center mb-10">
        <h1 className="text-[36px] font-semibold tracking-[-0.5px] mb-2">ติดต่อเรา</h1>
        <p className="text-[#36342e]">
          มีคำถาม ข้อเสนอแนะ หรืออยากร่วมงานกับ CheckKal? เราอยากได้ยินจากคุณ
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid gap-4 mb-10">
        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-1">อีเมล</h2>
          <p className="text-[#36342e] text-sm mb-2">สำหรับทุกเรื่อง ตอบกลับภายใน 1-3 วันทำการ</p>
          <a
            href="mailto:hello@checkkal.com"
            className="text-[#10b981] font-medium hover:underline"
          >
            hello@checkkal.com
          </a>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-1">รายงานข้อมูลผิดพลาด</h2>
          <p className="text-[#36342e] text-sm mb-2">
            พบข้อมูลโภชนาการที่ไม่ถูกต้อง? แจ้งเราได้เลย เราจะรีบแก้ไข
          </p>
          <a
            href="mailto:hello@checkkal.com?subject=รายงานข้อมูลผิดพลาด"
            className="text-[#10b981] font-medium hover:underline"
          >
            แจ้งข้อมูลผิดพลาด →
          </a>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-1">ร่วมงานและสปอนเซอร์</h2>
          <p className="text-[#36342e] text-sm mb-2">
            สนใจลงโฆษณา บทความสปอนเซอร์ หรือร่วมมือทางธุรกิจ?
          </p>
          <a
            href="mailto:hello@checkkal.com?subject=ร่วมงาน/สปอนเซอร์"
            className="text-[#10b981] font-medium hover:underline"
          >
            ติดต่อธุรกิจ →
          </a>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-1">แนะนำอาหารเพิ่มเติม</h2>
          <p className="text-[#36342e] text-sm mb-2">
            อยากเห็นอาหารอะไรในฐานข้อมูล? แนะนำมาได้เลย
          </p>
          <a
            href="mailto:hello@checkkal.com?subject=แนะนำอาหารเพิ่มเติม"
            className="text-[#10b981] font-medium hover:underline"
          >
            แนะนำรายการอาหาร →
          </a>
        </div>
      </div>

      {/* FAQ */}
      <section className="bg-[#faf8f6] rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">คำถามที่พบบ่อย</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">ข้อมูลโภชนาการมาจากไหน?</h3>
            <p className="text-[#36342e] text-sm">
              เรารวบรวมจากกรมอนามัย, USDA, ฉลากผลิตภัณฑ์ และ Open Food Facts
              ข้อมูลที่ยังไม่ได้ยืนยัน 100% จะมีเครื่องหมายแสดงไว้
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">ข้อมูลใช้ได้กับการลดน้ำหนักจริงไหม?</h3>
            <p className="text-[#36342e] text-sm">
              ข้อมูลของเราเป็นค่าอ้างอิง ค่าจริงอาจแตกต่างตามวิธีปรุงและปริมาณที่กิน
              แนะนำให้ใช้เป็นแนวทาง ไม่ใช่ค่าที่แม่นยำ 100%
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">ใช้ข้อมูลได้ฟรีไหม?</h3>
            <p className="text-[#36342e] text-sm">
              ใช้ได้ฟรีสำหรับการศึกษาและใช้งานส่วนตัว สำหรับการนำไปใช้เชิงพาณิชย์
              กรุณาติดต่อเราก่อน
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
