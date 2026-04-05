"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

type DataSource = "openfoodfacts" | "fatsecret" | "usda" | "all"

interface NormalizedFood {
  name_th: string
  name_en: string | null
  emoji: string | null
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number | null
  sodium: number | null
  sugar: number | null
  serving_size: string
  serving_weight_g: number | null
  category: string
  brand: string | null
  barcode: string | null
  image_url: string | null
  source: string
  tags: string[] | null
}

interface SearchResult {
  source: string
  sourceId: string
  name: string
  brand?: string
  barcode?: string
  imageUrl?: string
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  servingSize?: string
  normalized: NormalizedFood
  valid?: boolean
  warnings?: string[]
}

const SOURCE_OPTIONS: { id: DataSource; label: string; icon: string; desc: string }[] = [
  { id: "all", label: "ทุก Source", icon: "🔍", desc: "ค้นหาจากทุกแหล่งพร้อมกัน" },
  { id: "openfoodfacts", label: "Open Food Facts", icon: "🌍", desc: "อาหารไทย 10K+ | barcode | ฟรี" },
  { id: "fatsecret", label: "FatSecret", icon: "🔵", desc: "อาหารแบรนด์ | 5K calls/วัน" },
  { id: "usda", label: "USDA", icon: "🇺🇸", desc: "ข้อมูลวิทย์ | ingredient พื้นฐาน" },
]

export default function ImportPage() {
  const [query, setQuery] = useState("")
  const [barcode, setBarcode] = useState("")
  const [source, setSource] = useState<DataSource>("all")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiErrors, setApiErrors] = useState<string[]>([])
  const [searchMode, setSearchMode] = useState<"text" | "barcode">("text")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importStatus, setImportStatus] = useState<Record<string, "pending" | "importing" | "done" | "error">>({})

  // Search foods
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setApiErrors([])
    setResults([])
    setSelected(new Set())

    try {
      const params = new URLSearchParams({ q: query, source, pageSize: "30" })
      const res = await fetch(`/api/import/search?${params}`)
      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      setResults(data.data || [])
      if (data.errors?.length) setApiErrors(data.errors)
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setLoading(false)
    }
  }, [query, source])

  // Barcode lookup
  const handleBarcode = useCallback(async () => {
    if (!barcode.trim()) return
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const res = await fetch(`/api/import/barcode?code=${barcode}`)
      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      setResults([{
        source: data.data.raw.source,
        sourceId: data.data.raw.sourceId,
        name: data.data.raw.name,
        brand: data.data.raw.brand,
        barcode: data.data.raw.barcode,
        imageUrl: data.data.raw.imageUrl,
        calories: data.data.raw.calories,
        protein: data.data.raw.protein,
        fat: data.data.raw.fat,
        carbs: data.data.raw.carbs,
        normalized: data.data.normalized,
        valid: data.data.valid,
        warnings: data.data.warnings,
      }])
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการค้นหา barcode")
    } finally {
      setLoading(false)
    }
  }, [barcode])

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Select all
  const toggleSelectAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(results.map((r) => `${r.source}-${r.sourceId}`)))
    }
  }

  // Import selected foods to database
  const handleImport = async () => {
    const selectedResults = results.filter((r) => selected.has(`${r.source}-${r.sourceId}`))
    if (selectedResults.length === 0) return

    for (const result of selectedResults) {
      const key = `${result.source}-${result.sourceId}`
      setImportStatus((prev) => ({ ...prev, [key]: "importing" }))

      try {
        const res = await fetch("/api/foods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.normalized),
        })

        const data = await res.json()
        setImportStatus((prev) => ({
          ...prev,
          [key]: data.success ? "done" : "error",
        }))
      } catch {
        setImportStatus((prev) => ({ ...prev, [key]: "error" }))
      }
    }
  }

  const importedCount = Object.values(importStatus).filter((s) => s === "done").length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Import จากแหล่งภายนอก</h1>
          <p className="text-muted-foreground">ค้นหาและนำเข้าข้อมูลอาหารจาก Open Food Facts, FatSecret, USDA</p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80 transition-opacity text-sm"
        >
          ← กลับ Dashboard
        </Link>
      </div>

      {/* Search Mode Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSearchMode("text")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchMode === "text"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          🔍 ค้นหาชื่ออาหาร
        </button>
        <button
          onClick={() => setSearchMode("barcode")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchMode === "barcode"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          📱 สแกน Barcode
        </button>
      </div>

      {/* Text Search */}
      {searchMode === "text" && (
        <div className="space-y-4">
          {/* Source Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SOURCE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSource(opt.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  source === opt.id
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="text-lg mb-1">{opt.icon} {opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="พิมพ์ชื่ออาหาร เช่น ข้าวมันไก่, mama noodles, chicken breast..."
              className="flex-1 px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "กำลังค้นหา..." : "ค้นหา"}
            </button>
          </div>
        </div>
      )}

      {/* Barcode Search */}
      {searchMode === "barcode" && (
        <div className="flex gap-3">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBarcode()}
            placeholder="กรอกเลข barcode เช่น 8850999220017"
            className="flex-1 px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleBarcode}
            disabled={loading || !barcode.trim()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "กำลังค้นหา..." : "ค้นหา Barcode"}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* API Warnings */}
      {apiErrors.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-300 rounded-lg p-4">
          <p className="font-medium mb-1">บาง source มีปัญหา:</p>
          {apiErrors.map((err, i) => (
            <p key={i} className="text-sm">• {err}</p>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-sm hover:opacity-80"
              >
                {selected.size === results.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
              </button>
              <span className="text-sm text-muted-foreground">
                เลือก {selected.size} จาก {results.length} รายการ
              </span>
              {importedCount > 0 && (
                <span className="text-sm text-green-600">
                  ✓ นำเข้าแล้ว {importedCount} รายการ
                </span>
              )}
            </div>
            <button
              onClick={handleImport}
              disabled={selected.size === 0}
              className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 นำเข้า {selected.size} รายการ
            </button>
          </div>

          {/* Result Cards */}
          <div className="space-y-3">
            {results.map((result) => {
              const key = `${result.source}-${result.sourceId}`
              const isSelected = selected.has(key)
              const status = importStatus[key]

              return (
                <div
                  key={key}
                  className={`bg-card border rounded-lg p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  } ${status === "done" ? "opacity-60" : ""}`}
                  onClick={() => toggleSelect(key)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className={`w-5 h-5 mt-1 rounded border flex-shrink-0 flex items-center justify-center ${
                      isSelected ? "bg-primary border-primary" : "border-border"
                    }`}>
                      {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                    </div>

                    {/* Image */}
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                        {result.normalized.emoji || "🍽️"}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{result.name}</h3>
                        <SourceBadge source={result.source} />
                        {status === "done" && <span className="text-green-600 text-xs font-medium">✓ นำเข้าแล้ว</span>}
                        {status === "importing" && <span className="text-blue-600 text-xs font-medium">กำลังนำเข้า...</span>}
                        {status === "error" && <span className="text-red-600 text-xs font-medium">✗ ผิดพลาด</span>}
                      </div>

                      {result.brand && (
                        <p className="text-sm text-muted-foreground mb-1">แบรนด์: {result.brand}</p>
                      )}

                      {/* Nutrition Grid */}
                      <div className="flex gap-4 text-sm">
                        <MacroTag label="Cal" value={result.calories} unit="kcal" color="text-orange-600" />
                        <MacroTag label="P" value={result.protein} unit="g" color="text-red-600" />
                        <MacroTag label="F" value={result.fat} unit="g" color="text-yellow-600" />
                        <MacroTag label="C" value={result.carbs} unit="g" color="text-blue-600" />
                      </div>

                      {/* Warnings */}
                      {result.warnings && result.warnings.length > 0 && (
                        <div className="mt-2 text-xs text-yellow-600">
                          ⚠️ {result.warnings.join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Serving Size */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground">{result.servingSize || "100g"}</div>
                      {result.barcode && (
                        <div className="text-xs text-muted-foreground mt-1">📦 {result.barcode}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">ค้นหาอาหารจากแหล่งภายนอก</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            พิมพ์ชื่ออาหาร แล้วเลือก source ที่ต้องการ — ระบบจะค้นหาจาก Open Food Facts, FatSecret, USDA
            แล้ว normalize ข้อมูลให้พร้อม import เข้า CalCheck
          </p>
        </div>
      )}
    </div>
  )
}

function SourceBadge({ source }: { source: string }) {
  const badges: Record<string, { label: string; color: string }> = {
    openfoodfacts: { label: "OFF", color: "bg-green-500/20 text-green-700 dark:text-green-300" },
    fatsecret: { label: "FatSecret", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
    usda: { label: "USDA", color: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  }
  const b = badges[source] || { label: source, color: "bg-gray-500/20 text-gray-700" }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.color}`}>{b.label}</span>
}

function MacroTag({ label, value, unit, color }: { label: string; value?: number; unit: string; color: string }) {
  if (value == null) return null
  return (
    <span className="text-muted-foreground">
      <span className={`font-medium ${color}`}>{label}</span>{" "}
      {Math.round(value * 10) / 10}{unit}
    </span>
  )
}
