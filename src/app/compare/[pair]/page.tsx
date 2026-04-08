import { getAllFoods, getFoodBySlug, getRelatedFoods } from '@/lib/food-data'
import { CATEGORIES, type CategoryKey, type Food } from '@/types/database'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// SSG: generate top food combinations at build time
export async function generateStaticParams() {
  const foods = await getAllFoods()

  // Generate top 50 comparison combinations
  // Focus on popular/high-calorie foods for better SEO coverage
  const topFoods = foods.slice(0, 10)

  const combinations = []
  for (let i = 0; i < topFoods.length; i++) {
    for (let j = i + 1; j < topFoods.length; j++) {
      combinations.push({
        pair: `${topFoods[i].slug}-vs-${topFoods[j].slug}`
      })
    }
  }

  return combinations.slice(0, 50) // Limit to 50 combinations
}

// Parse slug to extract food slugs
function parseSlug(pair: string): { slugA: string; slugB: string } | null {
  const parts = pair.split('-vs-')
  if (parts.length !== 2) return null

  return {
    slugA: parts[0],
    slugB: parts[1],
  }
}

type Props = { params: Promise<{ pair: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params
  const parsed = parseSlug(pair)
  if (!parsed) return {}

  const foods = await getAllFoods()
  const foodA = foods.find(f => f.slug === parsed.slugA)
  const foodB = foods.find(f => f.slug === parsed.slugB)

  if (!foodA || !foodB) return {}

  return {
    title: `เปรียบเทียบ ${foodA.name_th} vs ${foodB.name_th} — อะไรดีกว่า?`,
    description: `เปรียบเทียบแคลอรี่และโภชนาการของ ${foodA.name_th} (${Math.round(foodA.calories)} kcal) กับ ${foodB.name_th} (${Math.round(foodB.calories)} kcal) — ดูโปรตีน ไขมัน และคาร์บไฮเดรต`,
  }
}

export default async function ComparePairPage({ params }: Props) {
  const { pair } = await params
  const parsed = parseSlug(pair)

  if (!parsed) notFound()

  const foods = await getAllFoods()
  const foodA = foods.find(f => f.slug === parsed.slugA)
  const foodB = foods.find(f => f.slug === parsed.slugB)

  if (!foodA || !foodB) notFound()

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

  // Structured data: ItemList with both foods
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `เปรียบเทียบ ${foodA.name_th} vs ${foodB.name_th}`,
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
          servingSize: foodA.serving_size,
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
          servingSize: foodB.serving_size,
        },
      },
    ],
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: 'https://checkkal.com' },
      { '@type': 'ListItem', position: 2, name: 'เปรียบเทียบอาหาร', item: 'https://checkkal.com/compare' },
      { '@type': 'ListItem', position: 3, name: `${foodA.name_th} vs ${foodB.name_th}`, item: `https://checkkal.com/compare/${pair}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-[#fffefb] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-[#36342e]">
            <Link href="/" className="hover:text-[#201515]">หน้าแรก</Link>
            <span className="mx-2">/</span>
            <Link href="/compare" className="hover:text-[#201515]">เปรียบเทียบ</Link>
            <span className="mx-2">/</span>
            <span className="text-[#201515]">{foodA.name_th} vs {foodB.name_th}</span>
          </nav>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-[36px] font-semibold tracking-[-0.5px] text-[#201515]">
              เปรียบเทียบ {foodA.emoji} {foodA.name_th} vs {foodB.emoji} {foodB.name_th}
            </h1>
            <p className="text-lg text-[#36342e]">
              อะไรดีกว่า? ดูแคลอรี่และโภชนาการแบบละเอียด
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Food A Card */}
            <div className={`rounded-lg border-2 p-6 ${isWinner(foodA, foodB) ? 'border-[#10b981] bg-[#f0fdf4]' : 'border-[#c5c0b1] bg-[#fffefb]'}`}>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#201515]">
                    {foodA.emoji} {foodA.name_th}
                  </h2>
                  {isWinner(foodA, foodB) && (
                    <span className="inline-block rounded-full bg-[#f0fdf4]0 px-3 py-1 text-sm font-medium text-white">
                      ต่ำกว่า
                    </span>
                  )}
                </div>
                {foodA.name_en && (
                  <p className="text-sm text-[#36342e]">{foodA.name_en}</p>
                )}
                {foodA.brand && (
                  <p className="text-xs text-[#a6b2ab]">แบรนด์: {foodA.brand}</p>
                )}
              </div>

              {/* Calories */}
              <div className="mb-4 rounded-lg bg-[#fffbeb] p-4">
                <p className="text-sm text-[#36342e]">แคลอรี่ต่อหนึ่ง {foodA.serving_size}</p>
                <p className="text-[36px] font-semibold tracking-[-0.5px] text-[#92400e]">
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
                    className="bg-white0"
                    style={{ width: `${getMacroPercentages(foodA).protein}%` }}
                  />
                  <div
                    className="bg-[#f59e0b]"
                    style={{ width: `${getMacroPercentages(foodA).fat}%` }}
                  />
                  <div
                    className="bg-[#ff4f00]"
                    style={{ width: `${getMacroPercentages(foodA).carbs}%` }}
                  />
                </div>
                <div className="mt-2 flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-white0" />
                    <span>โปรตีน {getMacroPercentages(foodA).protein.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span>ไขมัน {getMacroPercentages(foodA).fat.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#ff4f00]" />
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
            <div className={`rounded-lg border-2 p-6 ${isWinner(foodB, foodA) ? 'border-[#10b981] bg-[#f0fdf4]' : 'border-[#c5c0b1] bg-[#fffefb]'}`}>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#201515]">
                    {foodB.emoji} {foodB.name_th}
                  </h2>
                  {isWinner(foodB, foodA) && (
                    <span className="inline-block rounded-full bg-[#f0fdf4]0 px-3 py-1 text-sm font-medium text-white">
                      ต่ำกว่า
                    </span>
                  )}
                </div>
                {foodB.name_en && (
                  <p className="text-sm text-[#36342e]">{foodB.name_en}</p>
                )}
                {foodB.brand && (
                  <p className="text-xs text-[#a6b2ab]">แบรนด์: {foodB.brand}</p>
                )}
              </div>

              {/* Calories */}
              <div className="mb-4 rounded-lg bg-[#fffbeb] p-4">
                <p className="text-sm text-[#36342e]">แคลอรี่ต่อหนึ่ง {foodB.serving_size}</p>
                <p className="text-[36px] font-semibold tracking-[-0.5px] text-[#92400e]">
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
                    className="bg-white0"
                    style={{ width: `${getMacroPercentages(foodB).protein}%` }}
                  />
                  <div
                    className="bg-[#f59e0b]"
                    style={{ width: `${getMacroPercentages(foodB).fat}%` }}
                  />
                  <div
                    className="bg-[#ff4f00]"
                    style={{ width: `${getMacroPercentages(foodB).carbs}%` }}
                  />
                </div>
                <div className="mt-2 flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-white0" />
                    <span>โปรตีน {getMacroPercentages(foodB).protein.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span>ไขมัน {getMacroPercentages(foodB).fat.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#ff4f00]" />
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
                    <span className={foodA.calories < foodB.calories ? 'text-[#10b981] ml-2' : 'text-[#dc2626] ml-2'}>
                      {foodA.calories < foodB.calories ? '(A ต่ำกว่า)' : '(B ต่ำกว่า)'}
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
        </div>
      </div>
    </>
  )
}
