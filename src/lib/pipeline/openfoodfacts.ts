/**
 * Open Food Facts API Client
 * Base: https://th.openfoodfacts.org/api/v2
 * Rate limits: search 10 req/min, product 100 req/min
 * Auth: None required (free, open data, CC-BY-SA 4.0)
 */

import type { RawFoodResult, SearchResponse } from './types'

const BASE_URL = 'https://th.openfoodfacts.org'
const API_V2 = `${BASE_URL}/api/v2`
const USER_AGENT = 'CalCheck/1.0 (nutrition website; pakorn.proy@gmail.com)'

/** Search foods on Open Food Facts */
export async function searchFoods(
  query: string,
  page = 1,
  pageSize = 20
): Promise<SearchResponse> {
  const url = new URL(`${BASE_URL}/cgi/search.pl`)
  url.searchParams.set('search_terms', query)
  url.searchParams.set('search_simple', '1')
  url.searchParams.set('action', 'process')
  url.searchParams.set('json', '1')
  url.searchParams.set('page', String(page))
  url.searchParams.set('page_size', String(pageSize))
  url.searchParams.set('fields', 'code,product_name,product_name_th,product_name_en,brands,image_url,nutriments,serving_size,serving_quantity,categories_tags,labels_tags')

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: 3600 }, // cache 1hr
  })

  if (!res.ok) {
    throw new Error(`Open Food Facts API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const products = data.products || []

  return {
    results: products.map(mapProduct),
    total: data.count || 0,
    page,
    pageSize,
    source: 'openfoodfacts',
  }
}

/** Get a single product by barcode */
export async function getProductByBarcode(barcode: string): Promise<RawFoodResult | null> {
  const url = `${API_V2}/product/${barcode}?fields=code,product_name,product_name_th,product_name_en,brands,image_url,nutriments,serving_size,serving_quantity,categories_tags,labels_tags`

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!res.ok) return null

  const data = await res.json()
  if (data.status !== 1 || !data.product) return null

  return mapProduct(data.product)
}

/** Map OFF product to RawFoodResult */
function mapProduct(p: Record<string, any>): RawFoodResult {
  const n = p.nutriments || {}

  return {
    source: 'openfoodfacts',
    sourceId: p.code || '',
    name: p.product_name || p.product_name_th || p.product_name_en || 'Unknown',
    nameTh: p.product_name_th || p.product_name || undefined,
    nameEn: p.product_name_en || undefined,
    brand: p.brands || undefined,
    barcode: p.code || undefined,
    imageUrl: p.image_url || undefined,
    calories: parseNum(n['energy-kcal_100g'] || n['energy-kcal_serving']),
    protein: parseNum(n.proteins_100g || n.proteins_serving),
    fat: parseNum(n.fat_100g || n.fat_serving),
    carbs: parseNum(n.carbohydrates_100g || n.carbohydrates_serving),
    fiber: parseNum(n.fiber_100g || n.fiber_serving),
    sodium: (() => {
      const s = parseNum(n.sodium_100g || n.sodium_serving);
      return s != null ? s * 1000 : undefined; // convert g to mg
    })(),
    sugar: parseNum(n.sugars_100g || n.sugars_serving),
    servingSize: p.serving_size || '100g',
    servingWeightG: parseNum(p.serving_quantity) || 100,
    category: undefined, // let normalizer detect
    tags: (p.categories_tags || []).slice(0, 5).map((t: string) => t.replace('en:', '')),
    raw: { off_code: p.code, nutriments: n },
  }
}

function parseNum(val: any): number | undefined {
  if (val == null) return undefined
  const n = Number(val)
  return isNaN(n) ? undefined : n
}
