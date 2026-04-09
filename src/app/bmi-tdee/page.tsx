import type { Metadata } from "next"
import BmiTdeeCalculator from "./BmiTdeeCalculator"

export const metadata: Metadata = {
  title: "คำนวณ BMI & TDEE — ดัชนีมวลกายและพลังงานที่ต้องการต่อวัน",
  description:
    "คำนวณ BMI ดัชนีมวลกาย และ TDEE พลังงานที่ร่างกายต้องการต่อวัน พร้อมแผนแคลอรี่สำหรับลดน้ำหนัก รักษาน้ำหนัก และเพิ่มกล้ามเนื้อ",
  keywords: ["BMI", "TDEE", "ดัชนีมวลกาย", "คำนวณ BMI", "คำนวณ TDEE", "แคลอรี่ต่อวัน", "ลดน้ำหนัก", "checkkal"],
  openGraph: {
    title: "คำนวณ BMI & TDEE | CheckKal",
    description: "เช็กดัชนีมวลกายและพลังงานที่ร่างกายต้องการต่อวัน วางแผนอาหารได้แม่นยำขึ้น",
    type: "website",
  },
}

export default function BmiTdeePage() {
  return <BmiTdeeCalculator />
}
