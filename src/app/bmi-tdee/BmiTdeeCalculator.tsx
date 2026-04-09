"use client"

import { useState } from "react"

type Tab = "bmi" | "tdee"
type Gender = "male" | "female"
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"
type GoalKey = "lose1" | "lose05" | "maintain" | "gain05" | "gain1"
type PresetKey = "keto" | "lowcarb" | "balanced" | "highprotein" | "custom"

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

interface MacroPreset {
  key: PresetKey
  label: string
  emoji: string
  desc: string
  p: number
  f: number
  c: number
  color: string
}

const MACRO_PRESETS: MacroPreset[] = [
  { key: "keto",        label: "คีโต",         emoji: "🥑", desc: "ไขมันสูง คาร์บต่ำมาก",       p: 25, f: 70, c: 5,  color: "#f59e0b" },
  { key: "lowcarb",     label: "โลว์คาร์บ",    emoji: "🥩", desc: "คาร์บต่ำ โปรตีนสูง",        p: 35, f: 45, c: 20, color: "#f97316" },
  { key: "balanced",    label: "บาลานซ์/คลีน", emoji: "🥗", desc: "สัดส่วนสมดุล เหมาะทั่วไป",  p: 30, f: 30, c: 40, color: "#22c55e" },
  { key: "highprotein", label: "สายกล้าม",      emoji: "💪", desc: "โปรตีนสูง เพิ่มกล้ามเนื้อ", p: 40, f: 25, c: 35, color: "#3b82f6" },
  { key: "custom",      label: "กำหนดเอง",      emoji: "⚙️", desc: "ปรับ % ตามต้องการ",          p: 30, f: 30, c: 40, color: "#8b5cf6" },
]

const GOAL_OPTIONS: { key: GoalKey; label: string; icon: string }[] = [
  { key: "lose1",    label: "ลด -1 กก./สัปดาห์",   icon: "📉" },
  { key: "lose05",   label: "ลด -0.5 กก./สัปดาห์", icon: "📊" },
  { key: "maintain", label: "รักษาน้ำหนัก",          icon: "⚖️" },
  { key: "gain05",   label: "เพิ่ม +0.5 กก./สัปดาห์", icon: "📈" },
  { key: "gain1",    label: "เพิ่ม +1 กก./สัปดาห์", icon: "💪" },
]

const activityOptions: { value: ActivityLevel; label: string; desc: string; multiplier: number }[] = [
  { value: "sedentary",   label: "นั่งทำงาน / ไม่ออกกำลังกาย",         desc: "ออฟฟิศ, นั่งทำงานทั้งวัน",    multiplier: 1.2 },
  { value: "light",       label: "ออกกำลังกายเบาๆ 1–3 วัน/สัปดาห์",   desc: "เดิน, ยืดเส้น, โยคะเบาๆ",    multiplier: 1.375 },
  { value: "moderate",    label: "ออกกำลังกาย 3–5 วัน/สัปดาห์",        desc: "วิ่ง, ว่ายน้ำ, ยิม",          multiplier: 1.55 },
  { value: "active",      label: "ออกกำลังกายหนัก 6–7 วัน/สัปดาห์",   desc: "เทรนหนัก, กีฬาอาชีพ",        multiplier: 1.725 },
  { value: "very_active", label: "ออกกำลังกายหนักมาก + งานหนัก",       desc: "นักกีฬาอาชีพ, งานใช้แรง",    multiplier: 1.9 },
]

function getBmiResult(bmi: number): BmiResult {
  if (bmi < 18.5) return { bmi, category: "น้ำหนักต่ำกว่าเกณฑ์", color: "#3b82f6", description: "BMI ต่ำกว่า 18.5", advice: "ควรเพิ่มน้ำหนักโดยกินอาหารที่มีคุณค่าทางโภชนาการสูงขึ้น และออกกำลังกายเสริมสร้างกล้ามเนื้อ" }
  if (bmi < 23)   return { bmi, category: "น้ำหนักปกติ",          color: "#22c55e", description: "BMI 18.5–22.9",  advice: "น้ำหนักของคุณอยู่ในเกณฑ์ที่ดี รักษาพฤติกรรมการกินและออกกำลังกายต่อไป" }
  if (bmi < 25)   return { bmi, category: "น้ำหนักเกิน",           color: "#f59e0b", description: "BMI 23.0–24.9",  advice: "น้ำหนักเริ่มเกินเกณฑ์ (ตามมาตรฐานเอเชีย) ควรปรับอาหารและออกกำลังกายสม่ำเสมอ" }
  if (bmi < 30)   return { bmi, category: "อ้วนระดับ 1",           color: "#f97316", description: "BMI 25.0–29.9",  advice: "ควรลดน้ำหนักด้วยการควบคุมอาหารและออกกำลังกาย ปรึกษาแพทย์หรือนักโภชนาการ" }
  return           { bmi, category: "อ้วนระดับ 2",                 color: "#ef4444", description: "BMI ≥ 30",        advice: "ควรปรึกษาแพทย์เพื่อวางแผนลดน้ำหนักอย่างปลอดภัย มีความเสี่ยงต่อโรคเรื้อรังสูง" }
}

function calcBmi(weight: number, heightCm: number) {
  const hm = heightCm / 100
  return weight / (hm * hm)
}

function calcTdee(weight: number, heightCm: number, age: number, gender: Gender, activity: ActivityLevel): TdeeResult {
  const bmr = gender === "male"
    ? 10 * weight + 6.25 * heightCm - 5 * age + 5
    : 10 * weight + 6.25 * heightCm - 5 * age - 161
  const multiplier = activityOptions.find((a) => a.value === activity)!.multiplier
  const tdee = Math.round(bmr * multiplier)
  return { bmr: Math.round(bmr), tdee, lose1: tdee - 500, lose05: tdee - 250, maintain: tdee, gain05: tdee + 250, gain1: tdee + 500 }
}

function getBmiPercent(bmi: number) {
  return Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100))
}

function calcMacroGrams(kcal: number, pPct: number, fPct: number, cPct: number) {
  return {
    proteinG: Math.round((kcal * pPct) / 100 / 4),
    fatG:     Math.round((kcal * fPct) / 100 / 9),
    carbsG:   Math.round((kcal * cPct) / 100 / 4),
  }
}

// ─── Macro Section Component ───────────────────────────────────────────────
function MacroSection({ tdeeResult }: { tdeeResult: TdeeResult }) {
  const [selectedGoal, setSelectedGoal]   = useState<GoalKey>("maintain")
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>("balanced")
  const [customP, setCustomP] = useState(30)
  const [customF, setCustomF] = useState(30)
  const [customC, setCustomC] = useState(40)

  const goalKcal = tdeeResult[selectedGoal]
  const preset   = MACRO_PRESETS.find((p) => p.key === selectedPreset)!

  const pPct = selectedPreset === "custom" ? customP : preset.p
  const fPct = selectedPreset === "custom" ? customF : preset.f
  const cPct = selectedPreset === "custom" ? customC : preset.c
  const total = pPct + fPct + cPct

  const { proteinG, fatG, carbsG } = calcMacroGrams(goalKcal, pPct, fPct, cPct)

  // Custom slider handler — clamp so total stays 100
  const handleCustomSlider = (macro: "p" | "f" | "c", val: number) => {
    if (macro === "p") { const diff = val - customP; setCustomP(val); setCustomC(Math.max(0, customC - diff)) }
    if (macro === "f") { const diff = val - customF; setCustomF(val); setCustomC(Math.max(0, customC - diff)) }
    if (macro === "c") { const diff = val - customC; setCustomC(val); setCustomP(Math.max(0, customP - diff)) }
  }

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h3 className="text-[16px] font-semibold text-foreground mb-1">สัดส่วนสารอาหาร (Macros)</h3>
      <p className="text-[13px] text-muted-foreground mb-5">เลือกเป้าหมายและ diet style เพื่อดูปริมาณที่ควรกิน</p>

      {/* Step 1 — Goal */}
      <div className="mb-5">
        <p className="text-[13px] font-medium text-muted-foreground mb-2">1. เป้าหมายน้ำหนัก</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g.key}
              onClick={() => setSelectedGoal(g.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[13px] font-medium border transition-all ${
                selectedGoal === g.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground/40"
              }`}
            >
              <span>{g.icon}</span>{g.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[13px] text-muted-foreground">
          คำนวณจาก <span className="font-semibold text-foreground">{goalKcal.toLocaleString()} kcal/วัน</span>
        </div>
      </div>

      {/* Step 2 — Preset */}
      <div className="mb-5">
        <p className="text-[13px] font-medium text-muted-foreground mb-2">2. สไตล์อาหาร</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MACRO_PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPreset(p.key)}
              className={`text-left px-3 py-2.5 rounded-[6px] border transition-all ${
                selectedPreset === p.key
                  ? "border-2 bg-card"
                  : "border border-border bg-background hover:border-border/80"
              }`}
              style={selectedPreset === p.key ? { borderColor: p.color } : {}}
            >
              <div className="text-[18px] mb-0.5">{p.emoji}</div>
              <div className={`text-[13px] font-semibold ${selectedPreset === p.key ? "" : "text-foreground"}`}
                style={selectedPreset === p.key ? { color: p.color } : {}}>
                {p.label}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</div>
              {p.key !== "custom" && (
                <div className="text-[11px] text-muted-foreground mt-1">
                  P{p.p} / F{p.f} / C{p.c}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom sliders */}
      {selectedPreset === "custom" && (
        <div className="mb-5 bg-secondary rounded-[6px] p-4">
          <p className="text-[13px] font-medium text-foreground mb-4">ปรับสัดส่วน % (รวม = {total}%{total !== 100 ? <span className="text-destructive"> ⚠ ต้องรวม 100%</span> : ""})</p>
          {[
            { label: "🟦 โปรตีน (P)", val: customP, set: (v: number) => handleCustomSlider("p", v), color: "#3b82f6" },
            { label: "🟨 ไขมัน (F)",  val: customF, set: (v: number) => handleCustomSlider("f", v), color: "#f59e0b" },
            { label: "🟩 คาร์บ (C)",  val: customC, set: (v: number) => handleCustomSlider("c", v), color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-[13px] text-foreground">{s.label}</span>
                <span className="text-[13px] font-semibold" style={{ color: s.color }}>{s.val}%</span>
              </div>
              <input
                type="range" min={5} max={85} value={s.val}
                onChange={(e) => s.set(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: s.color }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Result bars */}
      {(selectedPreset !== "custom" || total === 100) && (
        <div className="bg-card border border-border rounded-[6px] p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-semibold text-foreground">ปริมาณที่แนะนำต่อวัน</span>
            <span className="text-[12px] text-muted-foreground bg-secondary px-2 py-1 rounded-[4px]">
              {preset.emoji} {selectedPreset === "custom" ? "Custom" : preset.label}
            </span>
          </div>

          {/* Stacked bar */}
          <div className="flex h-4 rounded-full overflow-hidden mb-5 gap-0.5">
            <div className="transition-all" style={{ width: `${pPct}%`, backgroundColor: "#3b82f6" }} title={`โปรตีน ${pPct}%`} />
            <div className="transition-all" style={{ width: `${fPct}%`, backgroundColor: "#f59e0b" }} title={`ไขมัน ${fPct}%`} />
            <div className="transition-all" style={{ width: `${cPct}%`, backgroundColor: "#22c55e" }} title={`คาร์บ ${cPct}%`} />
          </div>

          {/* Macro cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "โปรตีน",  gram: proteinG, pct: pPct, kcal: proteinG * 4, color: "#3b82f6", unit: "g" },
              { label: "ไขมัน",   gram: fatG,     pct: fPct, kcal: fatG * 9,     color: "#f59e0b", unit: "g" },
              { label: "คาร์บ",   gram: carbsG,   pct: cPct, kcal: carbsG * 4,   color: "#22c55e", unit: "g" },
            ].map((m) => (
              <div key={m.label} className="text-center bg-secondary rounded-[6px] py-3 px-2">
                <div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ backgroundColor: m.color }} />
                <div className="text-[11px] text-muted-foreground mb-1">{m.label}</div>
                <div className="text-[26px] font-bold leading-none" style={{ color: m.color }}>
                  {m.gram}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">g/วัน</div>
                <div className="text-[11px] text-muted-foreground mt-1 bg-background rounded px-1 py-0.5">
                  {m.pct}% · {m.kcal} kcal
                </div>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-muted-foreground mt-4">
            * Protein, Carbs = 4 kcal/g · Fat = 9 kcal/g · ตัวเลขเป็นค่าประมาณ ปรับตามการตอบสนองของร่างกาย
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BmiTdeeCalculator() {
  const [tab, setTab] = useState<Tab>("bmi")

  // BMI state
  const [bmiWeight, setBmiWeight] = useState("")
  const [bmiHeight, setBmiHeight] = useState("")
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null)

  // TDEE state
  const [tdeeWeight, setTdeeWeight] = useState("")
  const [tdeeHeight, setTdeeHeight] = useState("")
  const [tdeeAge, setTdeeAge]       = useState("")
  const [gender, setGender]         = useState<Gender>("male")
  const [activity, setActivity]     = useState<ActivityLevel>("moderate")
  const [tdeeResult, setTdeeResult] = useState<TdeeResult | null>(null)

  const handleBmiCalc = () => {
    const w = parseFloat(bmiWeight), h = parseFloat(bmiHeight)
    if (!w || !h || w <= 0 || h <= 0) return
    setBmiResult(getBmiResult(calcBmi(w, h)))
  }

  const handleTdeeCalc = () => {
    const w = parseFloat(tdeeWeight), h = parseFloat(tdeeHeight), a = parseFloat(tdeeAge)
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
          เช็กดัชนีมวลกายและพลังงานที่ร่างกายต้องการต่อวัน พร้อมแนะนำสัดส่วน Protein / Fat / Carb
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-secondary rounded-[6px] p-1 w-fit mb-8">
        {(["bmi", "tdee"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-[4px] text-[14px] font-semibold transition-all ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "bmi" ? "BMI" : "TDEE & Macros"}
          </button>
        ))}
      </div>

      {/* ───────── BMI TAB ───────── */}
      {tab === "bmi" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-[8px] p-6">
            <h2 className="text-[18px] font-semibold text-foreground mb-1">ดัชนีมวลกาย (BMI)</h2>
            <p className="text-muted-foreground text-[14px] mb-6">Body Mass Index — วัดสัดส่วนน้ำหนักต่อส่วนสูง</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">น้ำหนัก (กก.)</label>
                <input type="number" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} placeholder="เช่น 65"
                  className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">ส่วนสูง (ซม.)</label>
                <input type="number" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} placeholder="เช่น 170"
                  className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <button onClick={handleBmiCalc}
                className="w-full bg-primary text-primary-foreground rounded-[4px] py-3 text-[15px] font-semibold hover:opacity-90 transition-opacity mt-2">
                คำนวณ BMI
              </button>
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-[13px] font-medium text-muted-foreground mb-3">เกณฑ์ BMI (มาตรฐานเอเชีย)</p>
              <div className="space-y-1.5">
                {[
                  { range: "< 18.5",    label: "น้ำหนักต่ำกว่าเกณฑ์", color: "#3b82f6" },
                  { range: "18.5–22.9", label: "น้ำหนักปกติ",          color: "#22c55e" },
                  { range: "23.0–24.9", label: "น้ำหนักเกิน",           color: "#f59e0b" },
                  { range: "25.0–29.9", label: "อ้วนระดับ 1",           color: "#f97316" },
                  { range: "≥ 30",      label: "อ้วนระดับ 2",           color: "#ef4444" },
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

          <div className="bg-card border border-border rounded-[8px] p-6">
            {!bmiResult ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="text-[48px] mb-3">⚖️</div>
                <p className="text-muted-foreground text-[15px]">ใส่น้ำหนักและส่วนสูง<br />แล้วกด &ldquo;คำนวณ BMI&rdquo;</p>
              </div>
            ) : (
              <div>
                <h2 className="text-[18px] font-semibold text-foreground mb-6">ผลลัพธ์ BMI</h2>
                <div className="text-center mb-6">
                  <div className="text-[64px] font-bold leading-none mb-1" style={{ color: bmiResult.color }}>
                    {bmiResult.bmi.toFixed(1)}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full text-[13px] font-semibold text-white mt-2" style={{ backgroundColor: bmiResult.color }}>
                    {bmiResult.category}
                  </div>
                </div>
                <div className="mb-6">
                  <div className="relative h-3 rounded-full overflow-hidden mb-1"
                    style={{ background: "linear-gradient(to right, #3b82f6 0%, #22c55e 25%, #f59e0b 50%, #f97316 70%, #ef4444 100%)" }}>
                    <div className="absolute w-4 h-4 bg-white border-2 rounded-full shadow-md"
                      style={{ left: `${getBmiPercent(bmiResult.bmi)}%`, top: "50%", transform: "translate(-50%,-50%)", borderColor: bmiResult.color }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>10</span><span>18.5</span><span>23</span><span>30</span><span>40+</span>
                  </div>
                </div>
                <div className="bg-secondary rounded-[6px] p-4 mb-4">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-muted-foreground">เกณฑ์</span>
                    <span className="font-medium text-foreground">{bmiResult.description}</span>
                  </div>
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Input card */}
          <div className="bg-card border border-border rounded-[8px] p-6">
            <h2 className="text-[18px] font-semibold text-foreground mb-1">พลังงานที่ต้องการ (TDEE)</h2>
            <p className="text-muted-foreground text-[14px] mb-6">Total Daily Energy Expenditure — แคลอรี่ที่ร่างกายเผาผลาญต่อวัน</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">เพศ</label>
                <div className="flex gap-2">
                  {(["male", "female"] as Gender[]).map((g) => (
                    <button key={g} onClick={() => setGender(g)}
                      className={`flex-1 py-2.5 rounded-[4px] text-[14px] font-medium border transition-all ${
                        gender === g ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary"
                      }`}>
                      {g === "male" ? "👨 ชาย" : "👩 หญิง"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-1.5">น้ำหนัก (กก.)</label>
                  <input type="number" value={tdeeWeight} onChange={(e) => setTdeeWeight(e.target.value)} placeholder="65"
                    className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-1.5">ส่วนสูง (ซม.)</label>
                  <input type="number" value={tdeeHeight} onChange={(e) => setTdeeHeight(e.target.value)} placeholder="170"
                    className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">อายุ (ปี)</label>
                <input type="number" value={tdeeAge} onChange={(e) => setTdeeAge(e.target.value)} placeholder="25"
                  className="w-full border border-border rounded-[4px] px-3 py-2.5 text-[15px] text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">ระดับกิจกรรม</label>
                <div className="space-y-2">
                  {activityOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setActivity(opt.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-[4px] border transition-all ${
                        activity === opt.value ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"
                      }`}>
                      <div className={`text-[14px] font-medium ${activity === opt.value ? "text-primary" : "text-foreground"}`}>{opt.label}</div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleTdeeCalc}
                className="w-full bg-primary text-primary-foreground rounded-[4px] py-3 text-[15px] font-semibold hover:opacity-90 transition-opacity">
                คำนวณ TDEE & Macros
              </button>
            </div>
          </div>

          {/* Result card */}
          <div className="bg-card border border-border rounded-[8px] p-6">
            {!tdeeResult ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="text-[48px] mb-3">🔥</div>
                <p className="text-muted-foreground text-[15px]">กรอกข้อมูลและกด<br />&ldquo;คำนวณ TDEE & Macros&rdquo;</p>
              </div>
            ) : (
              <div>
                <h2 className="text-[18px] font-semibold text-foreground mb-4">ผลลัพธ์ TDEE</h2>

                {/* BMR */}
                <div className="bg-secondary rounded-[6px] p-4 mb-3">
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
                <div className="border-2 border-primary rounded-[6px] p-4 mb-4 text-center">
                  <div className="text-[13px] text-muted-foreground mb-1">TDEE (พลังงานที่เผาผลาญต่อวัน)</div>
                  <div className="text-[52px] font-bold text-primary leading-none">{tdeeResult.tdee.toLocaleString()}</div>
                  <div className="text-[14px] text-muted-foreground mt-1">kcal/วัน</div>
                </div>

                {/* Goals */}
                <h3 className="text-[14px] font-semibold text-foreground mb-2">แผนตามเป้าหมาย</h3>
                <div className="space-y-1.5 mb-0">
                  {[
                    { label: "ลดน้ำหนัก -1 กก./สัปดาห์",    kcal: tdeeResult.lose1,    color: "#ef4444", icon: "📉" },
                    { label: "ลดน้ำหนัก -0.5 กก./สัปดาห์",  kcal: tdeeResult.lose05,   color: "#f97316", icon: "📊" },
                    { label: "รักษาน้ำหนักเดิม",              kcal: tdeeResult.maintain, color: "#22c55e", icon: "⚖️" },
                    { label: "เพิ่มน้ำหนัก +0.5 กก./สัปดาห์",kcal: tdeeResult.gain05,   color: "#3b82f6", icon: "📈" },
                    { label: "เพิ่มน้ำหนัก +1 กก./สัปดาห์",  kcal: tdeeResult.gain1,    color: "#8b5cf6", icon: "💪" },
                  ].map((goal) => (
                    <div key={goal.label} className="flex items-center justify-between px-3 py-2 rounded-[4px] bg-secondary">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px]">{goal.icon}</span>
                        <span className="text-[12px] text-foreground">{goal.label}</span>
                      </div>
                      <span className="text-[14px] font-semibold" style={{ color: goal.color }}>
                        {goal.kcal.toLocaleString()} kcal
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── Macro Section ── */}
                <MacroSection tdeeResult={tdeeResult} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-[8px] p-6">
          <h3 className="text-[16px] font-semibold text-foreground mb-3">BMI คืออะไร?</h3>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            ดัชนีมวลกาย คำนวณจาก น้ำหนัก (กก.) ÷ ส่วนสูง² (ม.) เป็นตัวชี้วัดเบื้องต้นว่าน้ำหนักอยู่ในเกณฑ์ปกติหรือไม่
          </p>
        </div>
        <div className="bg-card border border-border rounded-[8px] p-6">
          <h3 className="text-[16px] font-semibold text-foreground mb-3">TDEE คืออะไร?</h3>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            พลังงานรวมที่ร่างกายเผาผลาญต่อวัน รวม BMR + กิจกรรม ใช้เป็นฐานวางแผนอาหาร — กินน้อยกว่า = ลดน้ำหนัก
          </p>
        </div>
        <div className="bg-card border border-border rounded-[8px] p-6">
          <h3 className="text-[16px] font-semibold text-foreground mb-3">Macros คืออะไร?</h3>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            สารอาหารหลัก 3 ตัว: โปรตีน (4 kcal/g) ไขมัน (9 kcal/g) คาร์บ (4 kcal/g) สัดส่วนต่างกันตาม diet style
          </p>
        </div>
      </div>
    </div>
  )
}
