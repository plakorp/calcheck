'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Food } from '@/types/database'

interface Props {
  food: Food
  variants: Food[]
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function NutrientRow({
  label,
  value,
  unit,
  dv,
  indent = false,
  bold = false,
  bottomBorder = false,
}: {
  label: string
  value: number | null
  unit: string
  dv?: number
  indent?: boolean
  bold?: boolean
  bottomBorder?: boolean
}) {
  if (value === null) return null
  return (
    <div
      className={`flex items-center justify-between py-2.5 border-t border-border ${
        indent ? 'pl-8 pr-4' : 'px-4'
      } ${bottomBorder ? 'border-b-2' : ''}`}
      style={bottomBorder ? { borderBottomColor: 'hsl(var(--primary))' } : undefined}
    >
      <span className={`text-sm ${bold ? 'font-semibold' : ''} text-foreground`}>
        {label}{' '}
        <span className="font-normal">
          {round1(value)}{' '}
          <span className="text-muted-foreground text-xs">{unit}</span>
        </span>
      </span>
      {dv != null && (
        <span className="text-sm font-medium text-primary">{dv}%</span>
      )}
    </div>
  )
}

// Extract unit name from serving_size string, e.g. "1 ซอง (60g)" → "ซอง"
function parseUnit(serving_size: string | null | undefined): string | null {
  if (!serving_size) return null
  const UNITS = ['ฟอง', 'ซอง', 'จาน', 'ชิ้น', 'แก้ว', 'ถ้วย', 'กล่อง', 'ถุง', 'ขวด', 'กระป๋อง', 'แผ่น', 'ลูก', 'หน่วย']
  for (const u of UNITS) {
    if (serving_size.includes(u)) return u
  }
  return null
}

export function NutritionCard({ food, variants }: Props) {
  const router = useRouter()
  const baseWeight = food.serving_weight_g ?? 100
  const [grams, setGrams] = useState(baseWeight)

  const unitName = parseUnit(food.serving_size) // e.g. "ซอง", "จาน", null

  const ratio = grams / baseWeight

  // Scale all nutrients
  const calories = food.calories * ratio
  const protein  = food.protein  * ratio
  const fat      = food.fat      * ratio
  const carbs    = food.carbs    * ratio
  const fiber    = food.fiber   != null ? food.fiber   * ratio : null
  const sodium   = food.sodium  != null ? food.sodium  * ratio : null
  const sugar    = food.sugar   != null ? food.sugar   * ratio : null

  // Macro % of calories
  const totalCalFromMacros = protein * 4 + fat * 9 + carbs * 4
  const proteinCalPct = totalCalFromMacros > 0 ? (protein * 4 / totalCalFromMacros) * 100 : 0
  const fatCalPct     = totalCalFromMacros > 0 ? (fat * 9 / totalCalFromMacros) * 100 : 0
  const carbsCalPct   = totalCalFromMacros > 0 ? (carbs * 4 / totalCalFromMacros) * 100 : 0

  // % Daily Value
  const fatDV     = Math.round((fat / 65) * 100)
  const sodiumDV  = sodium != null ? Math.round((sodium / 2400) * 100) : undefined
  const carbsDV   = Math.round((carbs / 300) * 100)
  const fiberDV   = fiber  != null ? Math.round((fiber / 25) * 100) : undefined
  const proteinDV = Math.round((protein / 50) * 100)

  // Tab mode: 'unit' if food has a unit, otherwise 'gram'
  const [mode, setMode] = useState<'gram' | 'unit'>(unitName ? 'unit' : 'gram')

  const handleGramsChange = useCallback((raw: string) => {
    const n = parseFloat(raw)
    if (!isNaN(n) && n > 0) setGrams(n)
    else if (raw === '') setGrams(0)
  }, [])

  const activeMultiplier = grams / baseWeight

  return (
    <div className="bg-card border border-border rounded-[12px] p-6 h-fit">

      {/* ── Card header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">ข้อมูลโภชนาการ</h2>

        <div className="flex items-center gap-2">
          {/* Pill switch — top right, only when unit exists */}
          {unitName && (
            <div className="flex items-center bg-secondary rounded-full p-0.5 gap-0.5">
              <button
                onClick={() => setMode('unit')}
                className={`text-xs px-3 py-1 rounded-full transition-colors font-medium ${
                  mode === 'unit'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {unitName}
              </button>
              <button
                onClick={() => setMode('gram')}
                className={`text-xs px-3 py-1 rounded-full transition-colors font-medium ${
                  mode === 'gram'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                กรัม
              </button>
            </div>
          )}

          {/* Variant dropdown — only show when multiple variants exist */}
          {variants.length > 1 && (
            <select
              value={food.slug}
              onChange={e => router.push(`/food/${e.target.value}`)}
              className="text-sm border border-border rounded-[6px] px-3 py-1.5 text-foreground bg-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-7 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%23888%22 d=%22M6 8L1 3h10z%22/></svg>')] bg-no-repeat bg-[right_8px_center]"
              aria-label="เลือกหน่วยบริโภค"
            >
              {variants.map(v => (
                <option key={v.slug} value={v.slug}>{v.serving_size}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Serving size calculator ───────────────────────────────── */}
      <div className="mb-5 bg-secondary rounded-[8px] overflow-hidden">


        <div className="px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground shrink-0">ปรับปริมาณ</span>


          {mode === 'unit' && unitName ? (
            /* ── Unit mode ── */
            <>
              <div className="flex gap-1 flex-wrap">
                {[1, 2, 3, 4].map(qty => (
                  <button
                    key={qty}
                    onClick={() => setGrams(baseWeight * qty)}
                    className={`text-xs px-2.5 py-1 rounded-[5px] border transition-colors ${
                      Math.abs(grams - baseWeight * qty) < 0.5
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {qty} {unitName}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => setGrams(g => Math.max(baseWeight * 0.5, g - baseWeight))}
                  className="w-7 h-7 rounded-[5px] border border-border bg-card hover:border-primary text-foreground flex items-center justify-center text-base leading-none select-none"
                  aria-label={`ลด 1 ${unitName}`}
                >−</button>
                <div className="text-center min-w-[56px]">
                  <div className="text-sm font-medium text-foreground leading-none">
                    {round1(grams / baseWeight)} {unitName}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{Math.round(grams)} ก.</div>
                </div>
                <button
                  onClick={() => setGrams(g => g + baseWeight)}
                  className="w-7 h-7 rounded-[5px] border border-border bg-card hover:border-primary text-foreground flex items-center justify-center text-base leading-none select-none"
                  aria-label={`เพิ่ม 1 ${unitName}`}
                >+</button>
              </div>
            </>
          ) : (
            /* ── Gram mode ── */
            <>
              <div className="flex gap-1">
                {[0.5, 1, 2, 3].map(m => (
                  <button
                    key={m}
                    onClick={() => setGrams(baseWeight * m)}
                    className={`text-xs px-2.5 py-1 rounded-[5px] border transition-colors ${
                      Math.abs(activeMultiplier - m) < 0.01
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {m === 0.5 ? '½' : m}x
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => setGrams(g => Math.max(1, Math.round(g - (baseWeight >= 10 ? 10 : 1))))}
                  className="w-7 h-7 rounded-[5px] border border-border bg-card hover:border-primary text-foreground flex items-center justify-center text-base leading-none select-none"
                  aria-label="ลดปริมาณ"
                >−</button>
                <input
                  type="number"
                  value={grams === 0 ? '' : grams}
                  onChange={e => handleGramsChange(e.target.value)}
                  onBlur={() => { if (grams <= 0) setGrams(baseWeight) }}
                  className="w-16 text-center text-sm border border-border rounded-[5px] px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={1}
                  aria-label="ปริมาณในกรัม"
                />
                <button
                  onClick={() => setGrams(g => Math.round(g + (baseWeight >= 10 ? 10 : 1)))}
                  className="w-7 h-7 rounded-[5px] border border-border bg-card hover:border-primary text-foreground flex items-center justify-center text-base leading-none select-none"
                  aria-label="เพิ่มปริมาณ"
                >+</button>
                <span className="text-xs text-muted-foreground">ก.</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Macro summary box ─────────────────────────────────────── */}
      <div className="bg-secondary rounded-[8px] grid grid-cols-4 divide-x divide-border mb-5 overflow-hidden">
        <div className="py-4 px-2 text-center">
          <div className="text-[22px] font-bold text-primary leading-none mb-1">
            {Math.round(calories)}
          </div>
          <div className="text-[11px] text-muted-foreground leading-tight">แคลอรี่ (kcal)</div>
          <div className="text-[11px] text-muted-foreground leading-tight">ต่อ {grams}ก.</div>
        </div>
        <div className="py-4 px-2 text-center">
          <div className="text-[22px] font-bold text-blue-500 leading-none mb-1">{round1(protein)}g</div>
          <div className="text-[11px] text-muted-foreground leading-tight">โปรตีน</div>
          <div className="text-[11px] text-blue-500 leading-tight">{Math.round(proteinCalPct)}%</div>
        </div>
        <div className="py-4 px-2 text-center">
          <div className="text-[22px] font-bold text-amber-500 leading-none mb-1">{round1(fat)}g</div>
          <div className="text-[11px] text-muted-foreground leading-tight">ไขมัน</div>
          <div className="text-[11px] text-amber-500 leading-tight">{Math.round(fatCalPct)}%</div>
        </div>
        <div className="py-4 px-2 text-center">
          <div className="text-[22px] font-bold text-primary leading-none mb-1">{round1(carbs)}g</div>
          <div className="text-[11px] text-muted-foreground leading-tight">คาร์โบไฮเดรต</div>
          <div className="text-[11px] text-primary leading-tight">{Math.round(carbsCalPct)}%</div>
        </div>
      </div>

      {/* ── Nutrition facts table ─────────────────────────────────── */}
      <div className="rounded-[8px] overflow-hidden border border-border">
        <div
          className="px-4 pt-2 pb-1.5 text-right text-[11px] text-muted-foreground bg-card border-t-[3px]"
          style={{ borderTopColor: 'hsl(var(--primary))' }}
        >
          % ร้อยละของปริมาณที่แนะนำต่อวัน*
        </div>
        <NutrientRow label="ไขมัน"         value={fat}    unit="g"  dv={fatDV}     bold />
        <NutrientRow label="โซเดียม"        value={sodium} unit="mg" dv={sodiumDV}  bold />
        <NutrientRow label="คาร์โบไฮเดรต"   value={carbs}  unit="g"  dv={carbsDV}   bold />
        <NutrientRow label="ใยอาหาร"        value={fiber}  unit="g"  dv={fiberDV}   indent />
        <NutrientRow label="น้ำตาล"          value={sugar}  unit="g"  indent />
        <NutrientRow label="โปรตีน"          value={protein} unit="g" dv={proteinDV} bold bottomBorder />
      </div>

      {/* ── Verified badge ────────────────────────────────────────── */}
      {food.verified && (
        <p className="text-xs text-primary mt-3 flex items-center gap-1">
          <span>✓</span> ข้อมูลผ่านการตรวจสอบแล้ว
        </p>
      )}
    </div>
  )
}
