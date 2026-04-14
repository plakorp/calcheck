"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Page error:", error)
  }, [error])

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-20 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-[32px] font-bold text-foreground mb-3 tracking-[-0.5px]">
          เกิดข้อผิดพลาด
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-[8px] font-medium hover:opacity-90 transition-opacity"
          >
            ลองใหม่อีกครั้ง
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-secondary text-foreground border border-border rounded-[8px] font-medium hover:bg-secondary/80 transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </main>
  )
}
