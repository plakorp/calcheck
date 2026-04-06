import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "CalCheck — แคลอรี่อาหาร โภชนาการครบ ค้นหาง่าย",
    template: "%s | CalCheck",
  },
  description: "ค้นหาแคลอรี่และข้อมูลโภชนาการอาหารไทย อาหารเซเว่น อาหารคลีน พร้อมเปรียบเทียบ ครบจบในที่เดียว",
  keywords: ["แคลอรี่", "โภชนาการ", "อาหารไทย", "ลดน้ำหนัก", "แคลอรี่อาหาร", "กี่แคล", "calcheck"],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "CalCheck",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CalCheck",
  url: "https://calcheck.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://calcheck.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased min-h-screen">
        {/* Header — Figma v2 */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
          <div className="max-w-[1024px] mx-auto flex items-center justify-between py-3 px-4">
            <Link href="/" className="text-[22px] font-bold text-primary tracking-[-0.3px] leading-7">
              CalCheck
            </Link>
            <nav className="flex items-center gap-6 text-sm leading-[22px]">
              <Link href="/category/protein" className="text-muted-foreground hover:text-foreground transition-colors font-normal">
                หมวดหมู่
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors font-normal">
                บทความ
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* Footer — Figma v2 */}
        <footer className="bg-card shadow-[0px_-1px_4px_rgba(0,0,0,0.03)] pt-12 pb-8">
          <div className="max-w-[1024px] mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <div>
                <h3 className="font-semibold text-[13px] text-foreground mb-2">หมวดหมู่ยอดนิยม</h3>
                <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                  <li><Link href="/category/protein" className="hover:text-foreground transition-colors">โปรตีน</Link></li>
                  <li><Link href="/category/carb" className="hover:text-foreground transition-colors">คาร์โบไฮเดรต</Link></li>
                  <li><Link href="/category/fruit" className="hover:text-foreground transition-colors">ผลไม้</Link></li>
                  <li><Link href="/category/snack" className="hover:text-foreground transition-colors">ขนม/ของว่าง</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[13px] text-foreground mb-2">แบรนด์</h3>
                <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                  <li><Link href="/brand/7-eleven" className="hover:text-foreground transition-colors">เมนู 7-Eleven</Link></li>
                  <li><Link href="/brand/cp" className="hover:text-foreground transition-colors">CP</Link></li>
                  <li><Link href="/brand/mama" className="hover:text-foreground transition-colors">มาม่า</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[13px] text-foreground mb-2">เครื่องมือ</h3>
                <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                  <li><Link href="/compare" className="hover:text-foreground transition-colors">เปรียบเทียบอาหาร</Link></li>
                  <li><Link href="/calories/0-200" className="hover:text-foreground transition-colors">อาหาร 0-200 แคล</Link></li>
                  <li><Link href="/calories/200-400" className="hover:text-foreground transition-colors">อาหาร 200-400 แคล</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[13px] text-foreground mb-2">บทความ</h3>
                <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                  <li><Link href="/blog" className="hover:text-foreground transition-colors">บทความทั้งหมด</Link></li>
                  <li><Link href="/blog/guide" className="hover:text-foreground transition-colors">คู่มือโภชนาการ</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CalCheck — ข้อมูลโภชนาการอาหารไทย ครบจบในที่เดียว
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
