import { CATEGORIES } from "@/types/database"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "หมวดหมู่อาหาร — แคลอรี่และโภชนาการ | CheckKal",
  description: "เลือกดูข้อมูลแคลอรี่และโภชนาการตามหมวดหมู่อาหาร โปรตีน คาร์โบไฮเดรต ผัก ผลไม้ ขนม เครื่องดื่ม และอื่นๆ — CheckKal",
  alternates: { canonical: "https://www.checkkal.com/category" },
  openGraph: {
    title: "หมวดหมู่อาหาร | CheckKal",
    description: "เลือกดูข้อมูลแคลอรี่และโภชนาการตามหมวดหมู่อาหาร",
    url: "https://www.checkkal.com/category",
    siteName: "CheckKal",
    locale: "th_TH",
    type: "website",
  },
}

export default function CategoryIndexPage() {
  const categories = Object.entries(CATEGORIES) as [string, { label: string; emoji: string }][]

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
      <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
        <Link href="/" className="hover:text-foreground">หน้าแรก</Link>
        <span>/</span>
        <span className="text-foreground">หมวดหมู่</span>
      </nav>

      <h1 className="text-[32px] font-medium tracking-[-0.5px] mb-12">หมวดหมู่อาหาร</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(([key, cat]) => (
          <Link
            key={key}
            href={`/category/${key}`}
            className="bg-card border border-border rounded-[8px] p-6 hover:border-primary transition-colors flex flex-col items-center gap-3 text-center"
          >
            <span className="text-[40px]">{cat.emoji}</span>
            <span className="text-[15px] font-medium">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
