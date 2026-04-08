import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัว | CheckKal',
  description: 'นโยบายความเป็นส่วนตัวของ CheckKal.com เว็บไซต์ข้อมูลโภชนาการและแคลอรี่อาหารไทย',
  alternates: { canonical: 'https://checkkal.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
      <h1 className="text-[36px] font-semibold tracking-[-0.5px] mb-2">นโยบายความเป็นส่วนตัว</h1>
      <p className="text-[#36342e] mb-8">อัปเดตล่าสุด: 7 เมษายน 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h2>
          <p className="text-[#36342e] leading-relaxed">
            CheckKal.com เก็บรวบรวมข้อมูลการใช้งานเว็บไซต์ผ่าน Google Analytics เช่น
            หน้าที่เข้าชม เวลาที่ใช้งาน และข้อมูลอุปกรณ์ (ประเภทเบราว์เซอร์ ระบบปฏิบัติการ)
            โดยข้อมูลดังกล่าวไม่สามารถระบุตัวตนผู้ใช้ได้โดยตรง
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. การใช้คุกกี้ (Cookies)</h2>
          <p className="text-[#36342e] leading-relaxed">
            เว็บไซต์ของเราใช้คุกกี้เพื่อวัตถุประสงค์ดังต่อไปนี้:
          </p>
          <ul className="list-disc list-inside text-[#36342e] space-y-1 mt-2">
            <li>Google Analytics — วิเคราะห์การเข้าชมเว็บไซต์</li>
            <li>Google AdSense — แสดงโฆษณาที่เกี่ยวข้องกับความสนใจของผู้ใช้</li>
            <li>คุกกี้ฟังก์ชัน — บันทึกการตั้งค่าของผู้ใช้ เช่น ภาษาและการแสดงผล</li>
          </ul>
          <p className="text-[#36342e] leading-relaxed mt-3">
            คุณสามารถปิดการใช้งานคุกกี้ได้ในการตั้งค่าเบราว์เซอร์ของคุณ
            แต่อาจส่งผลให้ฟังก์ชันบางส่วนของเว็บไซต์ทำงานไม่สมบูรณ์
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. โฆษณา (Google AdSense)</h2>
          <p className="text-[#36342e] leading-relaxed">
            CheckKal.com ใช้ Google AdSense เพื่อแสดงโฆษณา Google ในฐานะผู้ให้บริการบุคคลที่สาม
            อาจใช้คุกกี้เพื่อแสดงโฆษณาตามการเยี่ยมชมเว็บไซต์ของคุณก่อนหน้านี้
            คุณสามารถเลือกออกจากการใช้คุกกี้เพื่อโฆษณาส่วนตัวได้ที่{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google Ads Settings
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. ลิงก์พันธมิตร (Affiliate Links)</h2>
          <p className="text-[#36342e] leading-relaxed">
            CheckKal.com อาจมีลิงก์พันธมิตร (affiliate links) ไปยังสินค้าและบริการภายนอก
            หากคุณซื้อสินค้าผ่านลิงก์ดังกล่าว เราอาจได้รับค่าคอมมิชชั่นโดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับคุณ
            เราจะระบุลิงก์พันธมิตรอย่างชัดเจนเสมอ
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. การแบ่งปันข้อมูล</h2>
          <p className="text-[#36342e] leading-relaxed">
            เราไม่ขาย แลกเปลี่ยน หรือโอนข้อมูลส่วนตัวของคุณไปยังบุคคลภายนอก
            ยกเว้นในกรณีที่จำเป็นตามกฎหมาย หรือเพื่อปกป้องสิทธิ์และความปลอดภัยของผู้ใช้
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. ความถูกต้องของข้อมูลโภชนาการ</h2>
          <p className="text-[#36342e] leading-relaxed">
            ข้อมูลโภชนาการและแคลอรี่ที่แสดงบน CheckKal.com รวบรวมจากแหล่งที่เชื่อถือได้
            อาทิ กรมอนามัย กระทรวงสาธารณสุข และ USDA Food Database
            อย่างไรก็ตาม ข้อมูลเหล่านี้มีไว้เพื่อเป็นข้อมูลอ้างอิงเท่านั้น
            ไม่ใช่คำแนะนำทางการแพทย์ กรุณาปรึกษาแพทย์หรือนักโภชนาการสำหรับคำแนะนำส่วนตัว
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. การเปลี่ยนแปลงนโยบาย</h2>
          <p className="text-[#36342e] leading-relaxed">
            เราอาจอัปเดตนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว
            การเปลี่ยนแปลงจะมีผลทันทีเมื่อโพสต์บนเว็บไซต์
            เราแนะนำให้ตรวจสอบหน้านี้เป็นระยะ
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. ติดต่อเรา</h2>
          <p className="text-[#36342e] leading-relaxed">
            หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเราผ่านหน้า{' '}
            <a href="/contact" className="text-primary underline">ติดต่อเรา</a>
          </p>
        </section>
      </div>
    </main>
  )
}
