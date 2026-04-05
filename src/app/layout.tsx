import type { Metadata } from "next"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-primary flex items-center gap-2">
              <span>CalCheck</span>
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/search" className="text-muted-foreground hover:text-foreground transition-colors">ค้นหา</a>
              <a href="/category" className="text-muted-foreground hover:text-foreground transition-colors">หมวดหมู่</a>
              <a href="/compare" className="text-muted-foreground hover:text-foreground transition-colors">เปรียบเทียบ</a>
              <a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">บทความ</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-border mt-12 py-8 bg-card">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-3">หมวดหมู่ยอดนิยม</h3>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li><a href="/category/protein" className="hover:text-foreground">โปรตีน</a></li>
                  <li><a href="/category/carb" className="hover:text-foreground">คาร์โบไฮเดรต</a></li>
                  <li><a href="/category/fruit" className="hover:text-foreground">ผลไม้</a></li>
                  <li><a href="/category/snack" className="hover:text-foreground">ขนม/ของว่าง</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">แบรนด์</h3>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li><a href="/brand/7-eleven" className="hover:text-foreground">เมนู 7-Eleven</a></li>
                  <li><a href="/brand/cp" className="hover:text-foreground">CP</a></li>
                  <li><a href="/brand/mama" className="hover:text-foreground">มาม่า</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">เครื่องมือ</h3>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li><a href="/compare" className="hover:text-foreground">เปรียบเทียบอาหาร</a></li>
                  <li><a href="/calories/0-200" className="hover:text-foreground">อาหาร 0-200 แคล</a></li>
                  <li><a href="/calories/200-400" className="hover:text-foreground">อาหาร 200-400 แคล</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">บทความ</h3>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li><a href="/blog" className="hover:text-foreground">บทความทั้งหมด</a></li>
                  <li><a href="/blog/guide" className="hover:text-foreground">คู่มือโภชนาการ</a></li>
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
