/**
 * USDA FoodData Central API Client
 * Base: https://api.nal.usda.gov/fdc/v1
 * Rate limits: 1,000 req/hour
 * Auth: API key (free, from api.data.gov)
 */

import type { RawFoodResult, SearchResponse } from './types'

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

function getApiKey(): string {
  const key = process.env.USDA_API_KEY
  if (!key) throw new Error('USDA_API_KEY not set in environment variables')
  return key
}

/** Search foods in USDA FoodData Central */
export async function searchFoods(
  query: string,
  page = 1,
  pageSize = 20
): Promise<SearchResponse> {
  const apiKey = getApiKey()

  const res = await fetch(`${BASE_URL}/foods/search?api_key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      pageSize,
      pageNumber: page,
      dataType: ['Foundation', 'SR Legacy', 'Branded'],
      sortBy: 'dataType.keyword',
      sortOrder: 'asc',
    }),
  })

  if (!res.ok) {
    throw new Error(`USDA API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const foods = data.foods || []

  return {
    results: foods.map(mapFood),
    total: data.totalHits || 0,
    page,
    pageSize,
    source: 'usda',
  }
}

/** Get a single food by FDC ID */
export async function getFoodById(fdcId: string): Promise<RawFoodResult | null> {
  const apiKey = getApiKey()
  const res = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${apiKey}`)

  if (!res.ok) return null

  const data = await res.json()
  return mapFood(data)
}

/** Map USDA food to RawFoodResult */
function mapFood(f: Record<string, any>): RawFoodResult {
  // USDA stores nutrients in an array of objects
  const nutrients = f.foodNutrients || []
  const getNutrient = (id: number): number | undefined => {
    const n = nutrients.find((n: any) =>
      n.nutrientId === id || n.nutrient?.id === id || n.nutrientNumber === String(id)
    )
    if (!n) return undefined
    const val = n.value ?? n.amount
    return val != null ? Number(val) : undefined
  }

  // Common USDA nutrient IDs
  const calories = getNutrient(1008) // Energy (kcal)
  const protein = getNutrient(1003)  // Protein
  const fat = getNutrient(1004)      // Total fat
  const carbs = getNutrient(1005)    // Carbs
  const fiber = getNutrient(1079)    // Fiber
  const sugar = getNutrient(2000)    // Sugars, total
  const sodium = getNutrient(1093)   // Sodium (mg)

  const brandOwner = f.brandOwner || f.brandName || undefined
  const description = f.description || f.lowercaseDescription || ''

  return {
    source: 'usda',
    sourceId: String(f.fdcId),
    name: description,
    nameEn: description || undefined,
    nameTh: undefined, // USDA doesn't have Thai names
    brand: brandOwner,
    barcode: f.gtinUpc || undefined,
    imageUrl: undefined, // USDA doesn't provide images
    calories,
    protein,
    fat,
    carbs,
    fiber,
    sodium,
    sugar,
    servingSize: f.servingSize ? `${f.servingSize}${f.servingSizeUnit || 'g'}` : '100g',
    servingWeightG: f.servingSize || 100,
    category: undefined,
    tags: ['usda', f.dataType?.toLowerCase()].filter(Boolean) as string[],
    raw: { fdcId: f.fdcId, dataType: f.dataType },
  }
}
