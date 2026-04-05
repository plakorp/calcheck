/**
 * Pipeline types — shared across all data sources
 */

export type DataSource = 'openfoodfacts' | 'fatsecret' | 'usda'

/** Raw result from any external API, before normalization */
export interface RawFoodResult {
  source: DataSource
  sourceId: string // ID from the external source
  name: string
  nameTh?: string
  nameEn?: string
  brand?: string
  barcode?: string
  imageUrl?: string
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  fiber?: number
  sodium?: number
  sugar?: number
  servingSize?: string
  servingWeightG?: number
  category?: string
  tags?: string[]
  raw?: Record<string, unknown> // keep original data for debugging
}

/** Normalized food ready to insert into Supabase */
export interface NormalizedFood {
  name_th: string
  name_en: string | null
  slug: string
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
  subcategory: string | null
  brand: string | null
  barcode: string | null
  image_url: string | null
  source: DataSource
  verified: boolean
  tags: string[] | null
}

/** Search parameters for external APIs */
export interface SearchParams {
  query: string
  source: DataSource
  page?: number
  pageSize?: number
}

/** Search response wrapper */
export interface SearchResponse {
  results: RawFoodResult[]
  total: number
  page: number
  pageSize: number
  source: DataSource
}
