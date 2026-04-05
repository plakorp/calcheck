"use client"

import { useState } from "react"
import { CATEGORIES } from "@/types/database"

export default function AddFoodPage() {
  const [formData, setFormData] = useState({
    name_th: "",
    name_en: "",
    emoji: "🍽️",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0,
    serving_size: "",
    serving_weight_g: 0,
    category: "main",
    subcategory: "",
    brand: "",
    tags: "",
  })

  const [isQuickMode, setIsQuickMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
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
    setFormData((prev) => ({
      ...prev,
      [name]: numFields.includes(name) ? (value ? parseFloat(value) : 0) : value,
    }))
  }

  const handleAIFill = async () => {
    if (!formData.name_th && !formData.name_en) {
      setMessage({ type: "error", text: "กรุณาป้อนชื่ออาหาร" })
      return
    }

    setIsLoading(true)
    // Mock AI response - in production, call real API
    setTimeout(() => {
      const foodName = formData.name_th || formData.name_en || "unknown"

      // Simple mock: assign nutrition based on category
      const mockNutrition: Record<string, Record<string, number>> = {
        protein: {
          calories: 160,
          protein: 28,
          fat: 5,
          carbs: 0,
          fiber: 0,
          sodium: 75,
          sugar: 0,
          serving_weight_g: 100,
        },
        carb: {
          calories: 130,
          protein: 2,
          fat: 0,
          carbs: 28,
          fiber: 1,
          sodium: 0,
          sugar: 0,
          serving_weight_g: 100,
        },
        vegetable: {
          calories: 30,
          protein: 2,
          fat: 0,
          carbs: 6,
          fiber: 2,
          sodium: 50,
          sugar: 2,
          serving_weight_g: 100,
        },
        fruit: {
          calories: 60,
          protein: 0,
          fat: 0,
          carbs: 15,
          fiber: 2,
          sodium: 0,
          sugar: 12,
          serving_weight_g: 100,
        },
      }

      const nutrition = mockNutrition[formData.category] || mockNutrition.main

      setFormData((prev) => ({
        ...prev,
        ...nutrition,
        serving_size:
          prev.serving_size || `${nutrition.serving_weight_g}g`,
      }))

      setMessage({
        type: "success",
        text: `AI เติมข้อมูลโภชนาการ "${foodName}" แล้ว (ตัวอย่างข้อมูล)`,
      })

      setIsLoading(false)
    }, 800)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name_th && !formData.name_en) {
      setMessage({ type: "error", text: "กรุณาป้อนชื่ออาหาร" })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          verified: false,
          source: "manual",
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error("Failed to add food")

      setMessage({
        type: "success",
        text: `เพิ่มอาหาร "${formData.name_th}" สำเร็จแล้ว`,
      })

      // Reset form
      setFormData({
        name_th: "",
        name_en: "",
        emoji: "🍽️",
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sodium: 0,
        sugar: 0,
        serving_size: "",
        serving_weight_g: 0,
        category: "main",
        subcategory: "",
        brand: "",
        tags: "",
      })
    } catch (error) {
      setMessage({
        type: "error",
        text: "เกิดข้อผิดพลาด กรุณาลองใหม่",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Add Food Manually</h1>
        <p className="text-muted-foreground">เพิ่มข้อมูลอาหารใหม่ลงฐานข้อมูล</p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer flex-1">
          <input
            type="radio"
            checked={!isQuickMode}
            onChange={() => setIsQuickMode(false)}
            className="w-4 h-4"
          />
          <span className="font-medium">Full Form</span>
          <span className="text-xs text-muted-foreground">ป้อนข้อมูลครบถ้วน</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer flex-1">
          <input
            type="radio"
            checked={isQuickMode}
            onChange={() => setIsQuickMode(true)}
            className="w-4 h-4"
          />
          <span className="font-medium">Quick Add</span>
          <span className="text-xs text-muted-foreground">ชื่อ + แคลอรี่ → AI เติมอื่นๆ</span>
        </label>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-foreground">ข้อมูลพื้นฐาน</legend>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ชื่ออาหาร (ไทย) *
              </label>
              <input
                type="text"
                name="name_th"
                value={formData.name_th}
                onChange={handleChange}
                placeholder="เช่น ไข่ดาว, ข้าวมันไก่"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ชื่ออาหาร (EN)</label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                placeholder="e.g. fried-egg, chicken-rice"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Emoji</label>
              <input
                type="text"
                name="emoji"
                value={formData.emoji}
                onChange={handleChange}
                maxLength={2}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-center focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">หมวดหมู่ *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {Object.entries(CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">แบรนด์</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="เช่น 7-Eleven, CP"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </fieldset>

        {/* Nutrition facts */}
        {!isQuickMode && (
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-foreground">ข้อมูลโภชนาการ</legend>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  แคลอรี่ (kcal) *
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">โปรตีน (g)</label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ไขมัน (g)</label>
                <input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">คาร์บ (g)</label>
                <input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ไฟเบอร์ (g)</label>
                <input
                  type="number"
                  name="fiber"
                  value={formData.fiber}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">โซเดียม (mg)</label>
                <input
                  type="number"
                  name="sodium"
                  value={formData.sodium}
                  onChange={handleChange}
                  step="1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">น้ำตาล (g)</label>
                <input
                  type="number"
                  name="sugar"
                  value={formData.sugar}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">น้ำหนักสัดส่วน (g)</label>
                <input
                  type="number"
                  name="serving_weight_g"
                  value={formData.serving_weight_g}
                  onChange={handleChange}
                  step="1"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">รายละเอียดสัดส่วน</label>
              <input
                type="text"
                name="serving_size"
                value={formData.serving_size}
                onChange={handleChange}
                placeholder="เช่น 1 ชิ้น (50g), 100g"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </fieldset>
        )}

        {/* Tags */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-foreground">Tags (อยู่ในกล่องเดียวกัน)</legend>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="เช่น ไก่, คลีน, โปรตีนสูง (คั่นด้วย ,)"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </fieldset>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAIFill}
            disabled={isLoading}
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary disabled:opacity-50 transition-colors font-medium"
          >
            {isLoading ? "⏳ กำลังวิเคราะห์..." : "✨ AI Auto-Fill"}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-colors font-medium"
          >
            {isLoading ? "⏳ กำลังบันทึก..." : "💾 Save Food"}
          </button>
        </div>
      </form>
    </div>
  )
}
