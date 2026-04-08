'use client'

import { CATEGORIES, type CategoryKey } from '@/types/database'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import type { Food } from '@/types/database'

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <CompareContent />
    </Suspense>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Parse URL query params
  const paramA = searchParams.get('a')
  const paramB = searchParams.get('b')

  const [foodA, setFoodA] = useState<Food | null>(null)
  const [foodB, setFoodB] = useState<Food | null>(null)
  const [selectedA, setSelectedA] = useState<string>(paramA || '')
  const [selectedB, setSelectedB] = useState<string>(paramB || '')
  const [allFoods, setAllFoods] = useState<Food[]>([])

  // Load all foods on mount
  useEffect(() => {
    async function loadFoods() {
      const res = await fetch('/api/foods')
      const foods: Food[] = await res.json()
      setAllFoods(foods)

      // Load foods from URL params if present
      if (paramA) {
        const food = foods.find(f => f.slug === paramA)
        if (food) setFoodA(food)
      }
      if (paramB) {
        const food = foods.find(f => f.slug === paramB)
        if (food) setFoodB(food)
      }
    }
    loadFoods()
  }, [paramA, paramB])

  const handleCompare = () => {
    if (selectedA && selectedB && selectedA !== selectedB) {
      router.push(`/compare?a=${selectedA}&b=${selectedB}`)
      setFoodA(allFoods.find(f => f.slug === selectedA) || null)
      setFoodB(allFoods.find(f => f.slug === selectedB) || null)
    }
  }

  // Calculate macro percentages
  const getMacroPercentages = (food: Food) => {
    const totalMacroG = food.protein + food.fat + food.carbs
    return {
      protein: totalMacroG > 0 ? (food.protein / totalMacroG) * 100 : 0,
      fat: totalMacroG > 0 ? (food.fat / totalMacroG) * 100 : 0,
      carbs: totalMacroG > 0 ? (food.carbs / totalMacroG) * 100 : 0,
    }
  }

  // Check if one food is "winner" (lower calories)
  const isWinner = (food: Food, other: Food) => food.calories < other.calories

  // Structured data for ItemList
  const structuredData = foodA && foodB ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'NutritionInformation',
          name: foodA.name_th,
          calories: `${Math.round(foodA.calories)} calories`,
          proteinContent: `${foodA.protein}g`,
          fatContent: `${foodA.fat}g`,
          carbohydrateContent: `${foodA.carbs}g`,
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'NutritionInformation',
          name: foodB.name_th,
          calories: `${Math.round(foodB.calories)} calories`,
          proteinContent: `${foodB.protein}g`,
          fatContent: `${foodB.fat}g`,
          carbohydrateContent: `${foodB.carbs}g`,
        },
      },
    ],
  } : null

  return (
    <div className="min-h-screen bg-[#fffefb] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-[36px] font-semibold text-[#201515] tracking-[-0.5px]">
            เปรียบเทียบอาหาร
          </h1>
          <p className="text-[#36342e]">เลือกอาหาร 2 รายการเพื่อดูความแตกต่างด้านโภชนาการ</p>
        </div>

        {/* Food Picker */}
        <div className="mb-8 rounded-lg border border-[#c5c0b1] bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Food A Dropdown */}
            <div>
              <label className="block text-sm font-medium text-[#201515] mb-2">
                อาหารที่ 1
              </label>
              <select
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                className="w-full rounded-lg border border-[#c5c0b1] bg-white px-4 py-2 text-[#201515] focus:border-[#ff4f00] focus:outline-none"
              >
                <option value="">เลือกอาหาร...</option>
                {allFoods.map(food => (
                  <option key={food.slug} value={food.slug}>
                    {food.emoji} {food.name_th}
                  </option>
                ))}
              </select>
            </div>

            {/* Food B Dropdown */}
            <div>
              <label className="block text-sm font-medium text-[#201515] mb-2">
                อาหารที่ 2
              </label>
              <select
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                className="w-full rounded-lg border border-[#c5c0b1] bg-white px-4 py-2 text-[#201515] focus:border-[#ff4f00] focus:outline-none"
              >
                <option value="">เลือกอาหาร...</option>
                {allFoods.map(food => (
                  <option key={food.slug} value={food.slug}>
                    {food.emoji} {food.name_th}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={!selectedA || !selectedB || selectedA === selectedB}
            className="mt-4 w-full rounded-lg bg-[#ff4f00] px-4 py-2 font-medium text-white hover:bg-[#e64a00] disabled:bg-[#d4cec5] disabled:cursor-not-allowed"
          >
            เปรียบเทียบ
          </button>
        </div>

        {/* Comparison Result */}
        {foodA && foodB ? (
          <>
            {/* Structured Data */}
            {structuredData && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
              />
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Food A Card */}
              <div className={`rounded-lg border-2 p-6 ${isWinner(foodA, foodB) ? 'border-[#10b981] bg-[#f0fdf4]' : 'border-[#c5c0b1] bg-white'}`}>
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#201515]">
                      {foodA.emoji} {foodA.name_th}
                    </h2>
                    {isWinner(foodA, foodB) && (
                      <span className="inline-block rounded-full bg-[#10b981] px-3 py-1 text-sm font-medium text-white">
                        ต่ำกว่า
                      </span>
                    )}
                  </div>
                  {foodA.name_en && (
                    <p className="text-sm text-[#36342e]">{foodA.name_en}</p>
                  )}
                </div>

                {/* Calories */}
                <div className="mb-4 rounded-lg bg-[#fffbeb] p-4">
                  <p className="text-sm text-[#36342e]">แคลอรี่ต่อหนึ่ง {foodA.serving_size}</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {Math.round(foodA.calories)} kcal
                  </p>
                </div>

                {/* Macros Table */}
                <div className="mb-4 border-t border-[#c5c0b1] pt-4">
                  <h3 className="mb-3 font-medium text-[#201515]">โภชนาการต่อหนึ่ง {foodA.serving_size}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#36342e]">โปรตีน</span>
                      <span className="font-medium text-[#201515]">{foodA.protein.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#36342e]">ไขมัน</span>
                      <span className="font-medium text-[#201515]">{foodA.fat.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#36342e]">คาร์บ</span>
                      <span className="font-medium text-[#201515]">{foodA.carbs.toFixed(1)}g</span>
                    </div>
                    {foodA.fiber !== null && (
                      <div className="flex justify-between">
                        <span className="text-[#36342e]">ไฟเบอร์</span>
                        <span className="font-medium text-[#201515]">{foodA.fiber.toFixed(1)}g</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Macro Bar Chart */}
                <div className="mb-4 border-t border-[#c5c0b1] pt-4">
                  <p className="mb-2 text-sm font-medium text-[#201515]">สัดส่วนแมโคร</p>
                  <div className="flex h-4 overflow-hidden rounded-full bg-[#e5dfd8]">
                    <div
                      className="bg-[#ff4f00]"
                      style={{ width: `${getMacroPercentages(foodA).protein}%` }}
                    />
                    <div
                      className="bg-amber-500"
                      style={{ width: `${getMacroPercentages(foodA).fat}%` }}
                    />
                    <div
                      className="bg-orange-500"
                      style={{ width: `${getMacroPercentages(foodA).carbs}%` }}
                    />
                  </div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[#ff4f00]" />
                      <span>โปรตีน {getMacroPercentages(foodA).protein.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>ไขมัน {getMacroPercentages(foodA).fat.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <span>คาร์บ {getMacroPercentages(foodA).carbs.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Link to detail page */}
                <Link
                  href={`/food/${foodA.slug}`}
                  className="block text-center text-sm font-medium text-[#ff4f00] hover:text-[#e64a00]"
                >
                  ดูรายละเอียด →
                </Link>
              </div>

              {/* Food B Card */}
              <div className={`rounded-lg border-2 p-6 ${isWinner(foodB, foodA) ? 'border-[#10b981] bg-[#f0fdf4]' : 'border-[#c5c0b1] bg-white'}`}>
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#201515]">
                      {foodB.emoji} {foodB.name_th}
                    </h2>
                    {isWinner(foodB, foodA) && (
                      <span className="inline-block rounded-full bg-[#10b981] px-3 py-1 text-sm font-medium text-white">
                        ต่ำกว่า
                      </span>
                    )}
                  </div>
                  {foodB.name_en && (
                    <p className="text-sm text-[#36342e]">{foodB.name_en}</p>
                  )}
                </div>

                {/* Calories */}
                <div className="mb-4 rounded-lg bg-[#fffbeb] p-4">
                  <p className="text-sm text-[#36342e]">แคลอรี่ต่อหนึ่ง {foodB.serving_size}</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {Math.round(foodB.calories)} kcal
                  </p>
                </div>

                {/* Macros Table */}
                <div className="mb-4 border-t border-[#c5c0b1] pt-4">
                  <h3 className="mb-3 font-medium text-[#201515]">โภชนาการต่อหนึ่ง {foodB.serving_size}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#36342e]">โปรตีน</span>
                      <span className="font-medium text-[#201515]">{foodB.protein.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#36342e]">ไขมัน</span>
                      <span className="font-medium text-[#201515]">{foodB.fat.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#36342e]">คาร์บ</span>
                      <span className="font-medium text-[#201515]">{foodB.carbs.toFixed(1)}g</span>
                    </div>
                    {foodB.fiber !== null && (
                      <div className="flex justify-between">
                        <span className="text-[#36342e]">ไฟเบอร์</span>
                        <span className="font-medium text-[#201515]">{foodB.fiber.toFixed(1)}g</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Macro Bar Chart */}
                <div className="mb-4 border-t border-[#c5c0b1] pt-4">
                  <p className="mb-2 text-sm font-medium text-[#201515]">สัดส่วนแมโคร</p>
                  <div className="flex h-4 overflow-hidden rounded-full bg-[#e5dfd8]">
                    <div
                      className="bg-[#ff4f00]"
                      style={{ width: `${getMacroPercentages(foodB).protein}%` }}
                    />
                    <div
                      className="bg-amber-500"
                      style={{ width: `${getMacroPercentages(foodB).fat}%` }}
                    />
                    <div
                      className="bg-orange-500"
                      style={{ width: `${getMacroPercentages(foodB).carbs}%` }}
                    />
                  </div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[#ff4f00]" />
                      <span>โปรตีน {getMacroPercentages(foodB).protein.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>ไขมัน {getMacroPercentages(foodB).fat.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <span>คาร์บ {getMacroPercentages(foodB).carbs.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Link to detail page */}
                <Link
                  href={`/food/${foodB.slug}`}
                  className="block text-center text-sm font-medium text-[#ff4f00] hover:text-[#e64a00]"
                >
                  ดูรายละเอียด →
                </Link>
              </div>
            </div>

            {/* Comparison Summary */}
            <div className="mt-8 rounded-lg border border-[#c5c0b1] bg-white p-6">
              <h3 className="mb-4 font-bold text-[#201515]">สรุปเปรียบเทียบ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#36342e]">ความแตกต่างแคลอรี่</span>
                  <span className="font-medium text-[#201515]">
                    {Math.abs(foodA.calories - foodB.calories).toFixed(0)} kcal
                    {Math.abs(foodA.calories - foodB.calories) > 0 && (
                      <span className={foodA.calories < foodB.calories ? 'text-green-600' : 'text-red-600'}>
                        {foodA.calories < foodB.calories ? ' (A ต่ำกว่า)' : ' (B ต่ำกว่า)'}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#36342e]">โปรตีนสูงกว่า</span>
                  <span className="font-medium text-[#201515]">
                    {foodA.protein > foodB.protein ? 'A' : 'B'} ({Math.max(foodA.protein, foodB.protein).toFixed(1)}g)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#36342e]">แคลอรี่ต่ำกว่า</span>
                  <span className="font-medium text-[#201515]">
                    {foodA.calories < foodB.calories ? 'A' : 'B'} ({Math.min(foodA.calories, foodB.calories).toFixed(0)} kcal)
                  </span>
                </div>
              </div>
            </div>

            {/* Compare Another */}
            <div className="mt-8 text-center">
              <Link
                href="/compare"
                className="inline-block rounded-lg bg-[#f5f3f0] px-6 py-2 font-medium text-[#201515] hover:bg-[#e5dfd8]"
              >
                เปรียบเทียบอาหารอื่น
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-500">เลือกอาหารทั้งสองรายการเพื่อดูการเปรียบเทียบ</p>
          </div>
        )}
      </div>
    </div>
  )
}
