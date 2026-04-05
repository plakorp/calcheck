"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { CATEGORIES } from "@/types/database"

interface ParsedRow {
  name_th: string
  name_en: string
  emoji: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sodium: number
  sugar: number
  serving_size: string
  serving_weight_g: number
  category: string
  subcategory: string
  brand: string
  tags: string
  barcode: string
  [key: string]: string | number
}

interface ColumnMapping {
  [csvHeader: string]: string
}

const DB_FIELDS = [
  { key: "name_th", label: "ชื่อ (ไทย)", required: true },
  { key: "name_en", label: "ชื่อ (EN)" },
  { key: "emoji", label: "Emoji" },
  { key: "calories", label: "แคลอรี่", required: true },
  { key: "protein", label: "โปรตีน" },
  { key: "fat", label: "ไขมัน" },
  { key: "carbs", label: "คาร์บ" },
  { key: "fiber", label: "ไฟเบอร์" },
  { key: "sodium", label: "โซเดียม" },
  { key: "sugar", label: "น้ำตาล" },
  { key: "serving_size", label: "สัดส่วน" },
  { key: "serving_weight_g", label: "น้ำหนัก (g)" },
  { key: "category", label: "หมวดหมู่" },
  { key: "subcategory", label: "หมวดย่อย" },
  { key: "brand", label: "แบรนด์" },
  { key: "tags", label: "Tags" },
  { key: "barcode", label: "Barcode" },
  { key: "-", label: "(ไม่ใช้)" },
]

// Auto-match CSV headers to DB fields
function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  const patterns: Record<string, RegExp> = {
    name_th: /name.?th|ชื่อ.*ไทย|ชื่ออาหาร|food.?name|ชื่อ$/i,
    name_en: /name.?en|ชื่อ.*eng|english/i,
    emoji: /emoji/i,
    calories: /calor|แคล|kcal|cal$/i,
    protein: /protein|โปรตีน/i,
    fat: /fat|ไขมัน/i,
    carbs: /carb|คาร์บ/i,
    fiber: /fiber|ไฟเบอร์|ใยอาหาร/i,
    sodium: /sodium|โซเดียม|เกลือ/i,
    sugar: /sugar|น้ำตาล/i,
    serving_size: /serving.?size|สัดส่วน|หน่วย/i,
    serving_weight_g: /serving.?weight|น้ำหนัก|weight/i,
    category: /category|หมวด|ประเภท/i,
    subcategory: /subcategory|หมวดย่อย/i,
    brand: /brand|แบรนด์|ยี่ห้อ/i,
    tags: /tags|แท็ก/i,
    barcode: /barcode|บาร์โค้ด/i,
  }

  headers.forEach((h) => {
    for (const [field, regex] of Object.entries(patterns)) {
      if (regex.test(h) && !Object.values(mapping).includes(field)) {
        mapping[h] = field
        break
      }
    }
    if (!mapping[h]) mapping[h] = "-"
  })

  return mapping
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }

  // Simple CSV parse (handles quoted fields)
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map(parseLine)

  return { headers, rows }
}

export default function CSVImportPage() {
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "done">(
    "upload"
  )
  const [fileName, setFileName] = useState("")
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [parsedFoods, setParsedFoods] = useState<ParsedRow[]>([])
  const [validationErrors, setValidationErrors] = useState<
    { row: number; errors: string[] }[]
  >([])
  const [importResult, setImportResult] = useState<{
    inserted: number
    skipped: number
    errors?: { index: number; name: string; error: string }[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setFileName(file.name)

    // Check file type
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      setError("Excel files (.xlsx) ยังไม่รองรับ — กรุณา export เป็น .csv ก่อน (Save As → CSV)")
      return
    }

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".tsv") && !file.name.endsWith(".txt")) {
      setError("รองรับเฉพาะ .csv หรือ .tsv")
      return
    }

    const text = await file.text()
    const { headers, rows } = parseCSV(text)

    if (headers.length === 0) {
      setError("ไม่พบข้อมูลในไฟล์")
      return
    }

    setCsvHeaders(headers)
    setCsvRows(rows)

    // Auto-map columns
    const autoMapping = autoMapColumns(headers)
    setMapping(autoMapping)
    setStep("mapping")
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  // Update column mapping
  const updateMapping = (csvHeader: string, dbField: string) => {
    setMapping((prev) => ({ ...prev, [csvHeader]: dbField }))
  }

  // Apply mapping and create preview
  const applyMapping = () => {
    const foods: ParsedRow[] = []
    const errors: { row: number; errors: string[] }[] = []

    csvRows.forEach((row, rowIdx) => {
      const food: Record<string, string | number> = {}
      const rowErrors: string[] = []

      csvHeaders.forEach((header, colIdx) => {
        const dbField = mapping[header]
        if (dbField && dbField !== "-") {
          const value = row[colIdx] || ""
          const numFields = [
            "calories",
            "protein",
            "fat",
            "carbs",
            "fiber",
            "sodium",
            "sugar",
            "serving_weight_g",
          ]

          if (numFields.includes(dbField)) {
            const num = parseFloat(value.replace(/,/g, ""))
            food[dbField] = isNaN(num) ? 0 : num
          } else {
            food[dbField] = value
          }
        }
      })

      // Validation
      if (!food.name_th && !food.name_en) {
        rowErrors.push("ไม่มีชื่ออาหาร")
      }
      if (!food.calories && food.calories !== 0) {
        rowErrors.push("ไม่มีแคลอรี่")
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowIdx + 2, errors: rowErrors }) // +2 for header row + 1-indexed
      }

      foods.push(food as unknown as ParsedRow)
    })

    setParsedFoods(foods)
    setValidationErrors(errors)
    setStep("preview")
  }

  // Import to database
  const handleImport = async () => {
    setStep("importing")
    setError(null)

    // Prepare foods for bulk insert
    const foodsToInsert = parsedFoods
      .filter((f) => f.name_th || f.name_en)
      .map((f) => ({
        name_th: f.name_th || f.name_en || "",
        name_en: f.name_en || null,
        emoji: f.emoji || "🍽️",
        calories: Number(f.calories) || 0,
        protein: Number(f.protein) || 0,
        fat: Number(f.fat) || 0,
        carbs: Number(f.carbs) || 0,
        fiber: Number(f.fiber) || null,
        sodium: Number(f.sodium) || null,
        sugar: Number(f.sugar) || null,
        serving_size: f.serving_size || "100g",
        serving_weight_g: Number(f.serving_weight_g) || null,
        category: f.category || "main",
        subcategory: f.subcategory || null,
        brand: f.brand || null,
        barcode: f.barcode || null,
        tags: f.tags ? f.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        source: "excel-import",
        verified: false,
      }))

    try {
      const res = await fetch("/api/foods/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foods: foodsToInsert }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        setStep("preview")
        return
      }

      setImportResult({
        inserted: data.inserted,
        skipped: data.skipped,
        errors: data.errors,
      })
      setStep("done")
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ")
      setStep("preview")
    }
  }

  // Reset
  const reset = () => {
    setStep("upload")
    setFileName("")
    setCsvHeaders([])
    setCsvRows([])
    setMapping({})
    setParsedFoods([])
    setValidationErrors([])
    setImportResult(null)
    setError(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Import CSV / Excel</h1>
          <p className="text-muted-foreground">
            อัพโหลดไฟล์ .csv → map columns → preview → import เข้าฐานข้อมูล
          </p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80 transition-opacity text-sm"
        >
          ← กลับ Dashboard
        </Link>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {["upload", "mapping", "preview", "done"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <div
              className={`px-3 py-1 rounded-full font-medium ${
                step === s || (step === "importing" && s === "preview")
                  ? "bg-primary text-primary-foreground"
                  : ["upload", "mapping", "preview", "importing", "done"].indexOf(step) >
                    ["upload", "mapping", "preview", "done"].indexOf(s)
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i + 1}. {s === "upload" ? "อัพโหลด" : s === "mapping" ? "Map Columns" : s === "preview" ? "Preview" : "เสร็จ"}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-16 text-center bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer"
        >
          <div className="text-5xl mb-4">📄</div>
          <p className="text-lg font-medium text-foreground mb-2">
            ลากไฟล์ .csv มาตรงนี้ หรือคลิกเพื่อเลือก
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            รองรับ .csv (UTF-8) — ถ้ามี .xlsx กรุณา Export เป็น CSV ก่อน
          </p>
          <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            เลือกไฟล์
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === "mapping" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              📁 {fileName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {csvRows.length} แถว, {csvHeaders.length} คอลัมน์ — จับคู่ให้ตรงกับฐานข้อมูล
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Column ในไฟล์</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">ตัวอย่างข้อมูล</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">→ Map ไปที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {csvHeaders.map((header, idx) => (
                  <tr key={header} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 text-sm font-medium">{header}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {csvRows.slice(0, 3).map((r) => r[idx]).filter(Boolean).join(", ").slice(0, 80)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={mapping[header] || "-"}
                        onChange={(e) => updateMapping(header, e.target.value)}
                        className={`px-3 py-1.5 border rounded-md bg-background text-sm ${
                          mapping[header] && mapping[header] !== "-"
                            ? "border-primary text-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {DB_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label} {f.required ? "*" : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              ← เริ่มใหม่
            </button>
            <button
              onClick={applyMapping}
              className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Preview ข้อมูล →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {(step === "preview" || step === "importing") && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{parsedFoods.length}</div>
              <p className="text-sm text-muted-foreground">รายการทั้งหมด</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {parsedFoods.length - validationErrors.length}
              </div>
              <p className="text-sm text-muted-foreground">พร้อม import</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{validationErrors.length}</div>
              <p className="text-sm text-muted-foreground">มีปัญหา</p>
            </div>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                แถวที่มีปัญหา (จะถูกข้ามไป):
              </p>
              {validationErrors.slice(0, 10).map((v) => (
                <p key={v.row} className="text-sm text-yellow-700 dark:text-yellow-300">
                  Row {v.row}: {v.errors.join(", ")}
                </p>
              ))}
              {validationErrors.length > 10 && (
                <p className="text-sm text-muted-foreground mt-1">
                  ...และอีก {validationErrors.length - 10} แถว
                </p>
              )}
            </div>
          )}

          {/* Data table preview */}
          <div className="bg-card border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">ชื่อ (TH)</th>
                  <th className="px-3 py-2 text-left">ชื่อ (EN)</th>
                  <th className="px-3 py-2 text-right">Cal</th>
                  <th className="px-3 py-2 text-right">P</th>
                  <th className="px-3 py-2 text-right">F</th>
                  <th className="px-3 py-2 text-right">C</th>
                  <th className="px-3 py-2 text-left">หมวด</th>
                  <th className="px-3 py-2 text-left">แบรนด์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parsedFoods.slice(0, 20).map((food, i) => (
                  <tr key={i} className="hover:bg-secondary/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{food.name_th || "-"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{food.name_en || "-"}</td>
                    <td className="px-3 py-2 text-right">{food.calories || 0}</td>
                    <td className="px-3 py-2 text-right">{food.protein || 0}</td>
                    <td className="px-3 py-2 text-right">{food.fat || 0}</td>
                    <td className="px-3 py-2 text-right">{food.carbs || 0}</td>
                    <td className="px-3 py-2">{food.category || "main"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{food.brand || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedFoods.length > 20 && (
              <div className="px-3 py-2 text-sm text-muted-foreground bg-secondary/30">
                ...แสดง 20 จาก {parsedFoods.length} รายการ
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("mapping")}
              disabled={step === "importing"}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              ← แก้ Mapping
            </button>
            <button
              onClick={handleImport}
              disabled={step === "importing" || parsedFoods.length === validationErrors.length}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {step === "importing"
                ? "⏳ กำลัง Import..."
                : `📥 Import ${parsedFoods.length - validationErrors.length} รายการเข้าฐานข้อมูล`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && importResult && (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              Import สำเร็จ!
            </h2>
            <p className="text-lg text-foreground">
              นำเข้า <span className="font-bold">{importResult.inserted}</span> รายการ
              {importResult.skipped > 0 && (
                <span className="text-muted-foreground">
                  {" "}(ข้าม {importResult.skipped} รายการ)
                </span>
              )}
            </p>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                รายการที่ข้าม:
              </p>
              {importResult.errors.map((e, i) => (
                <p key={i} className="text-sm text-yellow-700 dark:text-yellow-300">
                  #{e.index + 1} {e.name}: {e.error}
                </p>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
            >
              📄 Import อีกไฟล์
            </button>
            <Link
              href="/admin"
              className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-center"
            >
              ← กลับ Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
