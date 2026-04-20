import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import Header from "@/components/Header"
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
  icons: {
    icon: [
      { url: "/logo.png", sizes: "64x64", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "CheckKal",
    images: [{ url: "/logo.png", width: 64, height: 64, alt: "CheckKal" }],
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
        <Header />

        <main>{children}</main>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2729965282237362"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Footer — light multi-column */}
        <footer className="border-t border-border bg-[#fbfaf5]">
          <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">

              {/* Brand column */}
              <div className="col-span-2">
                <Link href="/" className="flex items-center gap-2.5">
                  <Image src="/logo.svg" alt="CheckKal" width={28} height={28} />
                  <span className="text-[18px] font-semibold text-foreground">CheckKal</span>
                </Link>
                <p className="mt-4 text-[14px] text-[#5a5851] leading-[1.6] max-w-[340px]">
                  ฐานข้อมูลโภชนาการอาหารไทย ครบถ้วนที่สุด ค้นหาแคลอรี่ โปรตีน ไขมัน คาร์บ ฟรี ไม่ต้องสมัครสมาชิก
                </p>
                <div className="mt-5 flex gap-2">
                  <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.5c0-.9.3-1.5 1.6-1.5h1.7V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.2H8v3h2.4V21h3.1z"/></svg>
                  </a>
                  <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                  </a>
                  <a href="#" aria-label="TikTok" className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 6.7a4.8 4.8 0 0 1-3-1.1 4.8 4.8 0 0 1-1.8-3H12v12.2a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .7.1V9a5.9 5.9 0 1 0 5.2 5.8V9.2c1 .7 2.2 1.1 3.5 1.1V7.1c-.1 0 0-.4-.4-.4z"/></svg>
                  </a>
                  <a href="#" aria-label="Line" className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c5.5 0 10 3.6 10 8 0 1.8-.7 3.4-1.9 4.7-3.4 3.9-10.9 8.6-11.9 7.7-.9-.8 1.2-3.2-.4-3.6C3.4 19 2 16.7 2 14c0-6 4.5-11 10-11z"/></svg>
                  </a>
                </div>
              </div>

              {/* สำรวจ */}
              <div>
                <h3 className="font-semibold text-[13px] uppercase tracking-[0.08em] text-foreground mb-4">สำรวจ</h3>
                <ul className="space-y-2.5 text-[14px] text-[#5a5851]">
                  <li><Link href="/search" className="hover:text-primary transition-colors">ค้นหาอาหาร</Link></li>
                  <li><Link href="/category" className="hover:text-primary transition-colors">หมวดหมู่ทั้งหมด</Link></li>
                  <li><Link href="/compare" className="hover:text-primary transition-colors">เปรียบเทียบอาหาร</Link></li>
                  <li><Link href="/calories/0-200" className="hover:text-primary transition-colors">อาหาร 0-200 แคล</Link></li>
                  <li><Link href="/calories/200-400" className="hover:text-primary transition-colors">อาหาร 200-400 แคล</Link></li>
                </ul>
              </div>

              {/* บทความ + เครื่องมือ */}
              <div>
                <h3 className="font-semibold text-[13px] uppercase tracking-[0.08em] text-foreground mb-4">บทความ</h3>
                <ul className="space-y-2.5 text-[14px] text-[#5a5851]">
                  <li><Link href="/blog" className="hover:text-primary transition-colors">บทความทั้งหมด</Link></li>
                  <li><Link href="/blog/guide" className="hover:text-primary transition-colors">คู่มือโภชนาการ</Link></li>
                  <li><Link href="/bmi-tdee" className="hover:text-primary transition-colors">คำนวณ BMI & TDEE</Link></li>
                  <li><Link href="/brand/7-eleven" className="hover:text-primary transition-colors">เมนู 7-Eleven</Link></li>
                  <li><Link href="/brand/mama" className="hover:text-primary transition-colors">มาม่า</Link></li>
                </ul>
              </div>

              {/* เกี่ยวกับ */}
              <div>
                <h3 className="font-semibold text-[13px] uppercase tracking-[0.08em] text-foreground mb-4">เกี่ยวกับ</h3>
                <ul className="space-y-2.5 text-[14px] text-[#5a5851]">
                  <li><Link href="/about" className="hover:text-primary transition-colors">เกี่ยวกับเรา</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">ติดต่อเรา</Link></li>
                  <li><Link href="/privacy" className="hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[13px] text-muted-foreground">
              <div>&copy; {new Date().getFullYear()} CheckKal · ข้อมูลโภชนาการเพื่อการศึกษา ไม่ใช่คำแนะนำทางการแพทย์</div>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">ข้อกำหนดการใช้งาน</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
