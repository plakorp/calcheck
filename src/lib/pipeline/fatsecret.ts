/**
 * FatSecret Platform API Client
 * Auth: OAuth 2.0 Client Credentials
 * Rate limits: 5,000 calls/day (free tier)
 * Docs: https://platform.fatsecret.com/api/
 */

import type { RawFoodResult, SearchResponse } from './types'

const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token'
const API_URL = 'https://platform.fatsecret.com/rest/server.api'

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null

function getCredentials() {
  const clientId = process.env.FATSECRET_CLIENT_ID
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET must be set')
  }
  return { clientId, clientSecret }
}

/** Get OAuth2 access token (cached) */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token
  }

  const { clientId, clientSecret } = getCredentials()
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  })

  if (!res.ok) {
    throw new Error(`FatSecret token error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  }

  return cachedToken.token
}

/** Call FatSecret API */
async function apiCall(method: string, params: Record<string, string> = {}): Promise<any> {
  const token = await getAccessToken()

  const url = new URL(API_URL)
  url.searchParams.set('method', method)
  url.searchParams.set('format', 'json')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error(`FatSecret API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

/** Search foods on FatSecret */
export async function searchFoods(
  query: string,
  page = 0, // FatSecret uses 0-indexed pages
  pageSize = 20
): Promise<SearchResponse> {
  const data = await apiCall('foods.search.v3', {
    search_expression: query,
    page_number: String(page),
    max_results: String(Math.min(pageSize, 50)),
    include_food_attributes: 'true',
  })

  const foodsSearch = data.foods_search || {}
  const results = foodsSearch.results?.food || []
  const totalResults = foodsSearch.total_results || 0

  // Ensure results is always an array (FatSecret returns object for single result)
  const foodList = Array.isArray(results) ? results : [results]

  return {
    results: foodList.map(mapFood),
    total: Number(totalResults),
    page: page + 1, // normalize to 1-indexed
    pageSize,
    source: 'fatsecret',
  }
}

/** Get detailed food info by ID */
export async function getFoodById(foodId: string): Promise<RawFoodResult | null> {
  try {
    const data = await apiCall('food.get.v4', {
      food_id: foodId,
      include_food_attributes: 'true',
    })
    if (!data.food) return null
    return mapFoodDetail(data.food)
  } catch {
    return null
  }
}

/** Map FatSecret search result to RawFoodResult */
function mapFood(f: Record<string, any>): RawFoodResult {
  // FatSecret v3 search includes servings directly
  const servings = f.servings?.serving
  const serving = Array.isArray(servings) ? servings[0] : servings

  return {
    source: 'fatsecret',
    sourceId: String(f.food_id),
    name: f.food_name || '',
    nameEn: f.food_name || undefined,
    nameTh: undefined,
    brand: f.brand_name || undefined,
    barcode: undefined,
    imageUrl: f.food_images?.food_image?.[0]?.image_url || undefined,
    calories: parseNum(serving?.calories),
    protein: parseNum(serving?.protein),
    fat: parseNum(serving?.fat),
    carbs: parseNum(serving?.carbohydrate),
    fiber: parseNum(serving?.fiber),
    sodium: parseNum(serving?.sodium),
    sugar: parseNum(serving?.sugar),
    servingSize: serving?.serving_description || serving?.metric_serving_unit
      ? `${serving.metric_serving_amount || ''}${serving.metric_serving_unit || ''}`
      : '100g',
    servingWeightG: parseNum(serving?.metric_serving_amount) || 100,
    category: f.food_type === 'Brand' ? 'snack' : undefined,
    tags: [f.food_type === 'Brand' ? 'branded' : 'generic', 'fatsecret'].filter(Boolean),
    raw: { food_id: f.food_id, food_type: f.food_type },
  }
}

/** Map FatSecret detailed food to RawFoodResult */
function mapFoodDetail(f: Record<string, any>): RawFoodResult {
  const servings = f.servings?.serving
  const serving = Array.isArray(servings) ? servings[0] : servings

  return {
    source: 'fatsecret',
    sourceId: String(f.food_id),
    name: f.food_name || '',
    nameEn: f.food_name || undefined,
    nameTh: undefined,
    brand: f.brand_name || undefined,
    barcode: undefined,
    imageUrl: f.food_images?.food_image?.[0]?.image_url || undefined,
    calories: parseNum(serving?.calories),
    protein: parseNum(serving?.protein),
    fat: parseNum(serving?.fat),
    carbs: parseNum(serving?.carbohydrate),
    fiber: parseNum(serving?.fiber),
    sodium: parseNum(serving?.sodium),
    sugar: parseNum(serving?.sugar),
    servingSize: serving?.serving_description || '100g',
    servingWeightG: parseNum(serving?.metric_serving_amount) || 100,
    category: undefined,
    tags: ['fatsecret', f.food_type?.toLowerCase()].filter(Boolean) as string[],
    raw: { food_id: f.food_id, food_type: f.food_type, food_url: f.food_url },
  }
}

function parseNum(val: any): number | undefined {
  if (val == null) return undefined
  const n = Number(val)
  return isNaN(n) ? undefined : n
}
