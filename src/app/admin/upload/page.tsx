"use client"

import { useState, useRef } from "react"

interface AIAnalysisResult {
  name_th: string
  name_en: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sodium: number
  sugar: number
  serving_size: string
  category: string
  brand?: string
}

export default function UploadPhotoPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add("bg-secondary/20", "border-primary")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-secondary/20", "border-primary")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove("bg-secondary/20", "border-primary")

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    )

    if (files.length > 0) {
      addFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addFiles(files)
  }

  const addFiles = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    if (currentIndex >= uploadedFiles.length - 1) {
      setCurrentIndex(Math.max(0, uploadedFiles.length - 2))
    }
  }

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return

    setAnalyzing(true)

    // Mock AI analysis - in production, call Claude/Gemini Vision API
    setTimeout(() => {
      const mockResults: AIAnalysisResult[] = uploadedFiles.map((file, idx) => ({
        name_th: ["ไข่ดาว", "ข้าวมันไก่", "สลัดผัก"][idx % 3],
        name_en: ["fried-egg", "chicken-rice", "salad"][idx % 3],
        calories: 150 + idx * 50,
        protein: 12 + idx * 2,
        fat: 8 + idx,
        carbs: 15 + idx * 3,
        fiber: 2,
        sodium: 300 + idx * 50,
        sugar: 3,
        serving_size: "100g",
        category: ["protein", "main", "vegetable"][idx % 3],
      }))

      setAnalysisResults(mockResults)
      setCurrentIndex(0)
      setAnalyzing(false)
    }, 1500)
  }

  const currentResult = analysisResults[currentIndex]

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Photo</h1>
        <p className="text-muted-foreground">
          ถ่ายรูปอาหาร/ฉลาก → AI วิเคราะห์ → ตรวจสอบ → บันทึก
        </p>
      </div>

      {/* Upload area */}
      {analysisResults.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-4xl mb-4">📸</div>
          <p className="text-lg font-medium text-foreground mb-2">
            ลากรูปไปตรงนี้หรือคลิกเพื่อเลือก
          </p>
          <p className="text-muted-foreground text-sm">รองรับ JPG, PNG, WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Uploaded preview */}
      {uploadedFiles.length > 0 && analysisResults.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              รูปที่อัพโหลด ({uploadedFiles.length})
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 text-sm border border-border rounded-md text-foreground hover:bg-secondary transition-colors"
            >
              + เพิ่มอีก
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-md border border-border"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors font-medium"
          >
            {analyzing ? "⏳ AI กำลังวิเคราะห์..." : "🤖 Analyze with AI"}
          </button>
        </div>
      )}

      {/* Analysis results */}
      {currentResult && analysisResults.length > 0 && (
        <div className="space-y-6">
          {/* Current image */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              รูป {currentIndex + 1} / {uploadedFiles.length}
            </h2>
            <img
              src={previews[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="w-full h-64 object-cover rounded-lg border border-border"
            />
          </div>

          {/* AI results form */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground">📋 AI Analysis Result (Editable)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ชื่ออาหาร (ไทย)
                </label>
                <input
                  type="text"
                  defaultValue={currentResult.name_th}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ชื่ออาหาร (EN)
                </label>
                <input
                  type="text"
                  defaultValue={currentResult.name_en}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  แคลอรี่
                </label>
                <input
                  type="number"
                  defaultValue={currentResult.calories}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">โปรตีน</label>
                <input
                  type="number"
                  defaultValue={currentResult.protein}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ไขมัน</label>
                <input
                  type="number"
                  defaultValue={currentResult.fat}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">คาร์บ</label>
                <input
                  type="number"
                  defaultValue={currentResult.carbs}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              ← ก่อนหน้า
            </button>
            <button
              onClick={() =>
                setCurrentIndex(Math.min(uploadedFiles.length - 1, currentIndex + 1))
              }
              disabled={currentIndex === uploadedFiles.length - 1}
              className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              ถัดไป →
            </button>
            <button
              onClick={() => {
                setAnalysisResults([])
                setCurrentIndex(0)
              }}
              className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary transition-colors ml-auto"
            >
              ◄ กลับไป
            </button>
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors font-medium">
              💾 Confirm & Save All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
