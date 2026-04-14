import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "เปรียบเทียบแคลอรี่อาหาร | CheckKal",
  description: "เปรียบเทียบแคลอรี่ โปรตีน ไขมัน และคาร์โบไฮเดรตของอาหาร 2 ชนิดแบบ side-by-side — CheckKal",
  alternates: { canonical: "https://www.checkkal.com/compare" },
  openGraph: {
    title: "เปรียบเทียบแคลอรี่อาหาร | CheckKal",
    description: "เปรียบเทียบโภชนาการของอาหาร 2 ชนิดแบบ side-by-side",
    url: "https://www.checkkal.com/compare",
    siteName: "CheckKal",
    locale: "th_TH",
    type: "website",
  },
}

export default function ComparePage() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-16 text-center">
      <div className="max-w-lg mx-auto">
        <h1 className="text-[28px] font-bold text-foreground mb-3 tracking-[-0.5px]">
          เปรียบเทียบโภชนาการ
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          ค้นหาอาหารที่ต้องการ แล้วกด เปรียบเทียบ เพื่อดูข้อมูลโภชนาการแบบ side-by-side
        </p>
        <Link
          href="/search"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-[8px] font-medium hover:opacity-90 transition-opacity"
        >
          ค้นหาอาหาร
        </Link>
      </div>
    </main>
  )
}
