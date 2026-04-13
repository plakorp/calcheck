import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.checkkal.com"),
  title: {
    default: "CheckKal — แคลอรี่อาหาร โภชนาการครบ ค้นหาง่าย",
    template: "%s | CheckKal",
  },
  description: "ค้นหาแคลอรี่และข้อมูลโภชนาการอาหารไทย อาหารเซเว่น อาหารคลีน ครบจบในที่เดียว",
  keywords: ["แคลอรี่", "โภชนาการ", "อาหารไทย", "ลดน้ำหนัก", "แคลอรี่อาหาร", "กี่แคล", "checkkal"],
  alternates: {
    canonical: "https://www.checkkal.com",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "CheckKal",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CheckKal",
  url: "https://www.checkkal.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.checkkal.com/search?q={search_term_string}",
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
        <meta name="google-adsense-account" content="ca-pub-2729965282237362" />
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
        {/* Header — Zapier style */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between py-3 px-6">
            <Link href="/" className="text-[22px] font-bold text-foreground tracking-[-0.3px] leading-7">
              CheckKal
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/category/protein" className="text-foreground hover:text-primary transition-colors text-[16px] font-medium">
                หมวดหมู่
              </Link>
              <Link href="/bmi-tdee" className="text-foreground hover:text-primary transition-colors text-[16px] font-medium">
                BMI & TDEE
              </Link>
              <Link href="/blog" className="text-foreground hover:text-primary transition-colors text-[16px] font-medium">
                บทความ
              </Link>
              <Link
                href="/search"
                className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-[4px] text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                ค้นหาอาหาร
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2729965282237362"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Footer — Zapier style dark */}
        <footer className="bg-[#201515] text-[#fffefb] pt-16 pb-10">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <div>
                <h3 className="font-semibold text-[14px] text-[#fffefb] mb-4 uppercase tracking-[0.5px]">หมวดหมู่</h3>
                <ul className="space-y-2.5 text-[14px] text-[#c5c0b1]">
                  <li><Link href="/category/protein" className="hover:text-[#fffefb] transition-colors">โปรตีน</Link></li>
                  <li><Link href="/category/carb" className="hover:text-[#fffefb] transition-colors">คาร์โบไฮเดรต</Link></li>
                  <li><Link href="/category/fruit" className="hover:text-[#fffefb] transition-colors">ผลไม้</Link></li>
                  <li><Link href="/category/snack" className="hover:text-[#fffefb] transition-colors">ขนม/ของว่าง</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[14px] text-[#fffefb] mb-4 uppercase tracking-[0.5px]">แบรนด์</h3>
                <ul className="space-y-2.5 text-[14px] text-[#c5c0b1]">
                  <li><Link href="/brand/7-eleven" className="hover:text-[#fffefb] transition-colors">เมนู 7-Eleven</Link></li>
                  <li><Link href="/brand/cp" className="hover:text-[#fffefb] transition-colors">CP</Link></li>
                  <li><Link href="/brand/mama" className="hover:text-[#fffefb] transition-colors">มาม่า</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[14px] text-[#fffefb] mb-4 uppercase tracking-[0.5px]">เครื่องมือ</h3>
                <ul className="space-y-2.5 text-[14px] text-[#c5c0b1]">
                  <li><Link href="/bmi-tdee" className="hover:text-[#fffefb] transition-colors">คำนวณ BMI & TDEE</Link></li>
                  <li><Link href="/calories/0-200" className="hover:text-[#fffefb] transition-colors">อาหาร 0-200 แคล</Link></li>
                  <li><Link href="/calories/200-400" className="hover:text-[#fffefb] transition-colors">อาหาร 200-400 แคล</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[14px] text-[#fffefb] mb-4 uppercase tracking-[0.5px]">บทความ</h3>
                <ul className="space-y-2.5 text-[14px] text-[#c5c0b1]">
                  <li><Link href="/blog" className="hover:text-[#fffefb] transition-colors">บทความทั้งหมด</Link></li>
                  <li><Link href="/blog/guide" className="hover:text-[#fffefb] transition-colors">คู่มือโภชนาการ</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-6 border-t border-[#36342e] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#939084]">
              <span>&copy; {new Date().getFullYear()} CheckKal — ข้อมูลโภชนาการอาหารไทย ครบจบในที่เดียว</span>
              <div className="flex gap-6">
                <Link href="/about" className="hover:text-[#fffefb] transition-colors">เกี่ยวกับเรา</Link>
                <Link href="/contact" className="hover:text-[#fffefb] transition-colors">ติดต่อเรา</Link>
                <Link href="/privacy" className="hover:text-[#fffefb] transition-colors">นโยบายความเป็นส่วนตัว</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
