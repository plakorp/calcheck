/**
 * Data Pipeline — unified interface for all food data sources
 *
 * Sources:
 * 1. Open Food Facts (primary) — free, 10K+ Thai foods, barcode support
 * 2. FatSecret (secondary) — 5K calls/day free, good branded foods
 * 3. USDA FoodData Central (tertiary) — free, ingredient-level data
 */

import * as openfoodfacts from './openfoodfacts'
import * as fatsecret from './fatsecret'
import * as usda from './usda'
import { normalize, validate } from './normalizer'
import type { DataSource, SearchResponse, NormalizedFood, RawFoodResult } from './types'

export { normalize, validate } from './normalizer'
export type { DataSource, SearchResponse, NormalizedFood, RawFoodResult, SearchParams } from './types'

/** Search across a specific source */
export async function search(
  source: DataSource,
  query: string,
  page = 1,
  pageSize = 20
): Promise<SearchResponse> {
  switch (source) {
    case 'openfoodfacts':
      return openfoodfacts.searchFoods(query, page, pageSize)
    case 'fatsecret':
      return fatsecret.searchFoods(query, page - 1, pageSize) // FatSecret is 0-indexed
    case 'usda':
      return usda.searchFoods(query, page, pageSize)
    default:
      throw new Error(`Unknown source: ${source}`)
  }
}

/** Search ALL sources in parallel */
export async function searchAll(
  query: string,
  pageSize = 10
): Promise<{ results: (RawFoodResult & { normalized: NormalizedFood })[]; errors: string[] }> {
  const sources: DataSource[] = ['openfoodfacts', 'fatsecret', 'usda']
  const errors: string[] = []

  const promises = sources.map(async (source) => {
    try {
      const response = await search(source, query, 1, pageSize)
      return response.results
    } catch (err) {
      errors.push(`${source}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return []
    }
  })

  const allResults = (await Promise.allSettled(promises)).flatMap((result) => {
    if (result.status === 'fulfilled') return result.value
    return []
  })

  // Normalize all results
  const withNormalized = allResults.map((raw) => ({
    ...raw,
    normalized: normalize(raw),
  }))

  return { results: withNormalized, errors }
}

/** Get food by barcode (Open Food Facts only) */
export async function getByBarcode(barcode: string): Promise<RawFoodResult | null> {
  return openfoodfacts.getProductByBarcode(barcode)
}

/** Get food detail by source-specific ID */
export async function getDetail(source: DataSource, id: string): Promise<RawFoodResult | null> {
  switch (source) {
    case 'openfoodfacts':
      return openfoodfacts.getProductByBarcode(id) // barcode = ID for OFF
    case 'fatsecret':
      return fatsecret.getFoodById(id)
    case 'usda':
      return usda.getFoodById(id)
    default:
      return null
  }
}

/** Normalize + validate a raw result, ready for Supabase insert */
export function prepareForInsert(raw: RawFoodResult): {
  food: NormalizedFood
  valid: boolean
  warnings: string[]
} {
  const food = normalize(raw)
  const { valid, warnings } = validate(food)
  return { food, valid, warnings }
}

/** Source metadata for UI display */
export const SOURCE_META: Record<DataSource, {
  name: string
  nameTh: string
  icon: string
  color: string
  description: string
  rateLimit: string
}> = {
  openfoodfacts: {
    name: 'Open Food Facts',
    nameTh: 'Open Food Facts',
    icon: '🌍',
    color: 'bg-green-500',
    description: 'ฐานข้อมูลเปิด — อาหารไทย 10,000+ รายการ, รองรับ barcode',
    rateLimit: '10 req/min (search)',
  },
  fatsecret: {
    name: 'FatSecret',
    nameTh: 'FatSecret',
    icon: '🔵',
    color: 'bg-blue-500',
    description: 'ฐานข้อมูลอาหารแบรนด์ — 5,000 calls/วัน (free)',
    rateLimit: '5,000 calls/day',
  },
  usda: {
    name: 'USDA FoodData Central',
    nameTh: 'USDA',
    icon: '🇺🇸',
    color: 'bg-amber-500',
    description: 'ฐานข้อมูลกระทรวงเกษตร US — ข้อมูลระดับวิทยาศาสตร์',
    rateLimit: '1,000 req/hour',
  },
}
