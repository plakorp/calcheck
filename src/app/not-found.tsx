import Link from "next/link"

export default function NotFound() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-20 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-[32px] font-bold text-foreground mb-3 tracking-[-0.5px]">
          ไม่พบหน้าที่ต้องการ
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          ขออภัย ไม่พบข้อมูลที่คุณค้นหา อาจถูกย้ายหรือลบออกไปแล้ว
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-[8px] font-medium hover:opacity-90 transition-opacity"
          >
            กลับหน้าแรก
          </Link>
          <Link
            href="/food"
            className="px-6 py-3 bg-secondary text-foreground border border-border rounded-[8px] font-medium hover:bg-secondary/80 transition-colors"
          >
            ดูอาหารทั้งหมด
          </Link>
        </div>
      </div>
    </main>
  )
}
