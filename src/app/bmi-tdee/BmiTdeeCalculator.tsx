"use client"

import { useState } from "react"

type Tab = "bmi" | "tdee"
type Gender = "male" | "female"
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"

interface BmiResult {
  bmi: number
  category: string
  color: string
  description: string
  advice: string
}

interface TdeeResult {
  bmr: number
  tdee: number
  lose05: number
  lose1: number
  maintain: number
  gain05: number
  gain1: number
}

const activityOptions: { value: ActivityLevel; label: string; desc: string; multiplier: number }[] = [
  { value: "sedentary", label: "นั่งทำงาน / ไม่ออกกำลังกาย", desc: "ออฟฟิศ, นั่งทำงานทั้งวัน", multiplier: 1.2 },
  { value: "light", label: "ออกกำลังกายเบาๆ 1–3 วัน/สัปดาห์", desc: "เดิน, ยืดเส้น, โยคะเบาๆ", multiplier: 1.375 },
  { value: "moderate", label: "ออกกำลังกาย 3–5 วัน/สัปดาห์", desc: "วิ่ง, ว่ายน้ำ, ยิม", multiplier: 1.55 },
  { value: "active", label: "ออกกำลังกายหนัก 6–7 วัน/สัปดาห์", desc: "เทรนหนัก, กีฬาอาชีพ", multiplier: 1.725 },
  { value: "very_active", label: "ออกกำลังกายหนักมาก + งานหนัก", desc: "นักกีฬาอาชีพ, งานใช้แรง", multiplier: 1.9 },
]

function getBmiResult(bmi: number): BmiResult {
  if (bmi < 18.5) {
    return {
      bmi,
      category: "น้ำหนักต่ำกว่าเกณฑ์",
      color: "#3b82f6",
      description: "BMI ต่ำกว่า 18.5",
      advice: "ควรเพิ่มน้ำหนักโดยกินอาหารที่มีคุณค่าทางโภชนาการสูงขึ้น และออกกำลังกายเสริมสร้างกล้ามเนื้อ",
    }
  } else if (bmi < 23) {
    return {
      bmi,
      category: "น้ำหนักปกติ",
      color: "#22c55e",
      description: "BMI 18.5–22.9",
      advice: "น้ำหนักของคุณอยู่ในเกณฑ์ที่ดี รักษาพฤติกรรมการกินและออกกำลังกายต่อไป",
    }
  } else if (bmi < 25) {
    return {
      bmi,
      category: "น้ำหนักเกิน",
      color: "#f59e0b",
      description: "BMI 23.0–24.9",
      advice: "น้ำหนักเริ่มเกินเกณฑ์ (ตามมาตรฐานเอเชีย) ควรปรับอาหารและออกกำลังกายสม่ำเสมอ",
    }
  } else if (bmi < 30) {
    return {
      bmi,
      category: "อ้วนระดับ 1",
      color: "#f97316",
      description: "BMI 25.0–29.9",
      advice: "ควรลดน้ำหนักด้วยการควบคุมอาหารและออกกำลังกาย ปรึกษาแพทย์หรือนักโภชนาการ",
    }
  } else {
    return {
      bmi,
      category: "อ้วนระดับ 2",
      color: "#ef4444",
      description: "BMI ≥ 30",
      advice: "ควรปรึกษาแพทย์เพื่อวางแผนลดน้ำหนักอย่างปลอดภัย มีความเสี่ยงต่อโรคเรื้อรังสูง",
    }
  }
}

function calcBmi(weight: number, heightCm: number): number {
  const hm = heightCm / 100
  return weight / (hm * hm)
}

function calcTdee(weight: number, heightCm: number, age: number, gender: Gender, activity: ActivityLevel): TdeeResult {
  // Mifflin-St Jeor
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * heightCm - 5 * age + 5
      : 10 * weight + 6.25 * heightCm - 5 * age - 161

  const multiplier = activityOptions.find((a) => a.value === activity)!.multiplier
  const tdee = Math.round(bmr * multiplier)

  return {
    bmr: Math.round(bmr),
    tdee,
    lose1: tdee - 500,
    lose05: tdee - 250,
    maintain: tdee,
    gain05: tdee + 250,
    gain1: tdee + 500,
  }
}

function getBmiPercent(bmi: number): number {
  // Scale: 10 → 40+ BMI mapped to 0–100%
  const min = 10, max = 40
  return Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100))
}

export default function BmiTdeeCalculator() {
  const [tab, setTab] = useState<Tab>("bmi")

  // BMI state
  const [bmiWeight, setBmiWeight] = useState("")
  const [bmiHeight, setBmiHeight] = useState("")
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null)

  // TDEE state
  const [tdeeWeight, setTdeeWeight] = useState("")
  const [tdeeHeight, setTdeeHeight] = useState("")
  const [tdeeAge, setTdeeAge] = useState("")
  const [gender, setGender] = useState<Gender>("male")
  const [activity, setActivity] = useState<ActivityLevel>("moderate")
  const [tdeeResult, setTdeeResult] = useState<TdeeResult | null>(null)

  const handleBmiCalc = () => {
    const w = parseFloat(bmiWeight)
    const h = parseFloat(bmiHeight)
    if (!w || !h || w <= 0 || h <= 0) return
    const bmi = calcBmi(w, h)
    setBmiResult(getBmiResult(bmi))
  }

  const handleTdeeCalc = () => {
    const w = parseFloat(tdeeWeight)
    const h = parseFloat(tdeeHeight)
    const a = parseFloat(tdeeAge)
    if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) return
    setTdeeResult(calcTdee(w, h, a, gender, activity))
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-foreground tracking-[-0.5px] leading-tight mb-2">
          คำนวณ BMI & TDEE
        </h1>
        <p className="text-muted-foreground text-[16px]">
          เช็กดัชนีมวลกายและพลังงานที่ร่างกายต้องการต่อวัน เพื่อวางแผนอาหารได้แม่นยำขึ้น
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-secondary rounded-[6px] p-1 w-fit mb-8">
        <button
          onClick={() => setTab("bmi")}
          className={`px-6 py-2 rounded-[4px] text-[14px] font-semibold transition-all ${
            tab === "bmi"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          BMI
        </button>
        <button
          onClick={() => setTab("tdee")}
          className={`px-6 py-2 rounded-[4px] text-[14px] font-semibold transition-all ${
            tab === "tdee"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          TDEE
        </button>
      </div>

      {/* ───────── BMI TAB ───────── */}
      {tab === "bmi" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input card */}
          <div className="bg-card border border-border rounded-[8px] p-6">
            <h2 className="text-[18px] font-semibold text-foreground mb-1">ดัชนีมวลกาย (BMI)</h2>
            <p className="text-muted-foreground text-[14px] mb-6">
              Body Mass Index — วัดสัดส่วนน้ำหนักต่อส่วนสูง
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  น้ำหนัก (กก.)
                </label>
                <input
                  type="number"
                  value={bmiWeight}
                  onChange={(e) => setBmiWeight(e.target.value)}
                  placeholder="เช่น 65"
                  className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  ส่วนสูง (ซม.)
                </label>
                <input
                  type="number"
                  value={bmiHeight}
                  onChange={(e) => setBmiHeight(e.target.value)}
                  placeholder="เช่น 170"
                  className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                onClick={handleBmiCalc}
                className="w-full bg-primary text-primary-foreground rounded-[4px] py-3 text-[15px] font-semibold hover:opacity-90 transition-opacity mt-2"
              >
                คำนวณ BMI
              </button>
            </div>

            {/* BMI scale info */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-[13px] font-medium text-muted-foreground mb-3">เกณฑ์ BMI (มาตรฐานเอเชีย)</p>
              <div className="space-y-1.5">
                {[
                  { range: "< 18.5", label: "น้ำหนักต่ำกว่าเกณฑ์", color: "#3b82f6" },
                  { range: "18.5–22.9", label: "น้ำหนักปกติ", color: "#22c55e" },
                  { range: "23.0–24.9", label: "น้ำหนักเกิน", color: "#f59e0b" },
                  { range: "25.0–29.9", label: "อ้วนระดับ 1", color: "#f97316" },
                  { range: "≥ 30", label: "อ้วนระดับ 2", color: "#ef4444" },
                ].map((item) => (
                  <div key={item.range} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[13px] text-muted-foreground w-[90px]">{item.range}</span>
                    <span className="text-[13px] text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result card */}
          <div className="bg-card border border-border rounded-[8px] p-6">
            {!bmiResult ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="text-[48px] mb-3">⚖️</div>
                <p className="text-muted-foreground text-[15px]">ใส่น้ำหนักและส่วนสูง<br />แล้วกด &ldquo;คำนวณ BMI&rdquo;</p>
              </div>
            ) : (
              <div>
                <h2 className="text-[18px] font-semibold text-foreground mb-6">ผลลัพธ์ BMI</h2>

                {/* BMI number */}
                <div className="text-center mb-6">
                  <div
                    className="text-[64px] font-bold leading-none mb-1"
                    style={{ color: bmiResult.color }}
                  >
                    {bmiResult.bmi.toFixed(1)}
                  </div>
                  <div
                    className="inline-block px-3 py-1 rounded-full text-[13px] font-semibold text-white mt-2"
                    style={{ backgroundColor: bmiResult.color }}
                  >
                    {bmiResult.category}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="relative h-3 rounded-full overflow-hidden mb-1"
                    style={{
                      background: "linear-gradient(to right, #3b82f6 0%, #22c55e 25%, #f59e0b 50%, #f97316 70%, #ef4444 100%)"
                    }}
                  >
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full shadow-md"
                      style={{
                        left: `${getBmiPercent(bmiResult.bmi)}%`,
                        transform: "translate(-50%, -50%)",
                        borderColor: bmiResult.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>10</span>
                    <span>18.5</span>
                    <span>23</span>
                    <span>30</span>
                    <span>40+</span>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-secondary rounded-[6px] p-4 space-y-2 mb-4">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-muted-foreground">เกณฑ์</span>
                    <span className="font-medium text-foreground">{bmiResult.description}</span>
                  </div>
                </div>

                {/* Advice */}
                <div className="border-l-[3px] pl-4 py-1" style={{ borderColor: bmiResult.color }}>
                  <p className="text-[14px] text-foreground leading-relaxed">{bmiResult.advice}</p>
                </div>

                <p className="text-[12px] text-muted-foreground mt-5">
                  * ใช้เกณฑ์ WHO สำหรับประชากรเอเชีย. BMI เป็นเพียงตัวชี้วัดเบื้องต้น ไม่ได้วัดปริมาณไขมันโดยตรง
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────── TDEE TAB ───────── */}
      {tab === "tdee" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input card */}
          <div className="bg-card border border-border rounded-[8px] p-6">
            <h2 className="text-[18px] font-semibold text-foreground mb-1">พลังงานที่ต้องการ (TDEE)</h2>
            <p className="text-muted-foreground text-[14px] mb-6">
              Total Daily Energy Expenditure — แคลอรี่ที่ร่างกายเผาผลาญต่อวัน
            </p>

            <div className="space-y-4">
              {/* Gender */}
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">เพศ</label>
                <div className="flex gap-2">
                  {(["male", "female"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2.5 rounded-[4px] text-[14px] font-medium border transition-all ${
                        gender === g
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary"
                      }`}
                    >
                      {g === "male" ? "👨 ชาย" : "👩 หญิง"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight + Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-1.5">น้ำหนัก (กก.)</label>
                  <input
                    type="number"
                    value={tdeeWeight}
                    onChange={(e) => setTdeeWeight(e.target.value)}
                    placeholder="65"
                    className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-1.5">ส่วนสูง (ซม.)</label>
                  <input
                    type="number"
                    value={tdeeHeight}
                    onChange={(e) => setTdeeHeight(e.target.value)}
                    placeholder="170"
                    className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">อายุ (ปี)</label>
                <input
                  type="number"
                  value={tdeeAge}
                  onChange={(e) => setTdeeAge(e.target.value)}
                  placeholder="25"
                  className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Activity */}
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">ระดับกิจกรรม</label>
                <div className="space-y-2">
                  {activityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setActivity(opt.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-[4px] border transition-all ${
                        activity === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <div className={`text-[14px] font-medium ${activity === opt.value ? "text-primary" : "text-foreground"}`}>
                        {opt.label}
                      </div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTdeeCalc}
                className="w-full bg-primary text-primary-foreground rounded-[4px] py-3 text-[15px] font-semibold hover:opacity-90 transition-opacity"
              >
                คำนวณ TDEE
              </button>
            </div>
          </div>

          {/* Result card */}
          <div className="bg-card border border-border rounded-[8px] p-6">
            {!tdeeResult ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="text-[48px] mb-3">🔥</div>
                <p className="text-muted-foreground text-[15px]">กรอกข้อมูลและกด<br />&ldquo;คำนวณ TDEE&rdquo;</p>
              </div>
            ) : (
              <div>
                <h2 className="text-[18px] font-semibold text-foreground mb-6">ผลลัพธ์ TDEE</h2>

                {/* BMR */}
                <div className="bg-secondary rounded-[6px] p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[13px] text-muted-foreground">BMR (พลังงานพื้นฐาน)</div>
                      <div className="text-[11px] text-muted-foreground">ขณะนอนพักทั้งวัน</div>
                    </div>
                    <div className="text-[24px] font-bold text-foreground">
                      {tdeeResult.bmr.toLocaleString()}
                      <span className="text-[13px] font-normal text-muted-foreground ml-1">kcal</span>
                    </div>
                  </div>
                </div>

                {/* TDEE main */}
                <div className="border-2 border-primary rounded-[6px] p-4 mb-6 text-center">
                  <div className="text-[13px] text-muted-foreground mb-1">TDEE (พลังงานที่เผาผลาญต่อวัน)</div>
                  <div className="text-[52px] font-bold text-primary leading-none">
                    {tdeeResult.tdee.toLocaleString()}
                  </div>
                  <div className="text-[14px] text-muted-foreground mt-1">kcal/วัน</div>
                </div>

                {/* Goals breakdown */}
                <h3 className="text-[14px] font-semibold text-foreground mb-3">แผนตามเป้าหมาย</h3>
                <div className="space-y-2">
                  {[
                    { label: "ลดน้ำหนัก -1 กก./สัปดาห์", kcal: tdeeResult.lose1, color: "#ef4444", icon: "📉" },
                    { label: "ลดน้ำหนัก -0.5 กก./สัปดาห์", kcal: tdeeResult.lose05, color: "#f97316", icon: "📊" },
                    { label: "รักษาน้ำหนักเดิม", kcal: tdeeResult.maintain, color: "#22c55e", icon: "⚖️" },
                    { label: "เพิ่มน้ำหนัก +0.5 กก./สัปดาห์", kcal: tdeeResult.gain05, color: "#3b82f6", icon: "📈" },
                    { label: "เพิ่มน้ำหนัก +1 กก./สัปดาห์", kcal: tdeeResult.gain1, color: "#8b5cf6", icon: "💪" },
                  ].map((goal) => (
                    <div
                      key={goal.label}
                      className="flex items-center justify-between px-3 py-2.5 rounded-[4px] bg-secondary"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[14px]">{goal.icon}</span>
                        <span className="text-[13px] text-foreground">{goal.label}</span>
                      </div>
                      <span className="text-[15px] font-semibold" style={{ color: goal.color }}>
                        {goal.kcal.toLocaleString()} kcal
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[12px] text-muted-foreground mt-5">
                  * คำนวณด้วยสูตร Mifflin-St Jeor. ตัวเลขเป็นค่าประมาณ ควรปรับตามการตอบสนองของร่างกายจริง
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-[8px] p-6">
          <h3 className="text-[16px] font-semibold text-foreground mb-3">BMI คืออะไร?</h3>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            BMI (Body Mass Index) หรือดัชนีมวลกาย คือค่าที่ใช้ประเมินความสัมพันธ์ระหว่างน้ำหนักและส่วนสูง
            คำนวณโดย น้ำหนัก (กก.) ÷ ส่วนสูง² (ม.) เป็นตัวชี้วัดเบื้องต้นว่าน้ำหนักอยู่ในเกณฑ์ปกติหรือไม่
            แต่ไม่ได้วัดปริมาณไขมันโดยตรง
          </p>
        </div>
        <div className="bg-card border border-border rounded-[8px] p-6">
          <h3 className="text-[16px] font-semibold text-foreground mb-3">TDEE คืออะไร?</h3>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            TDEE (Total Daily Energy Expenditure) คือพลังงานรวมที่ร่างกายเผาผลาญต่อวัน รวมทั้ง BMR
            (พลังงานขณะพัก) และพลังงานจากกิจกรรม ใช้เป็นฐานในการวางแผนอาหาร
            ถ้ากินน้อยกว่า TDEE จะลดน้ำหนัก ถ้ากินมากกว่าจะเพิ่มน้ำหนัก
          </p>
        </div>
      </div>
    </div>
  )
}
