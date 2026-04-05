/**
 * Data Normalizer — converts RawFoodResult from any source into NormalizedFood
 * ready for Supabase insertion
 */

import type { RawFoodResult, NormalizedFood } from './types'

// Category detection from food name (Thai + English keywords)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  protein: ['ไก่', 'หมู', 'เนื้อ', 'ปลา', 'กุ้ง', 'ไข่', 'chicken', 'pork', 'beef', 'fish', 'shrimp', 'egg', 'tofu', 'เต้าหู้', 'ทูน่า', 'tuna', 'salmon', 'แซลมอน'],
  carb: ['ข้าว', 'ขนมปัง', 'rice', 'bread', 'pasta', 'noodle', 'บะหมี่', 'เส้น', 'มัน', 'potato', 'oat', 'ข้าวโอ๊ต'],
  fat: ['เนย', 'น้ำมัน', 'butter', 'oil', 'อะโวคาโด', 'avocado', 'ถั่ว', 'nut', 'almond', 'อัลมอนด์'],
  vegetable: ['ผัก', 'vegetable', 'salad', 'สลัด', 'บร็อคโคลี่', 'broccoli', 'แครอท', 'carrot', 'คะน้า', 'ผักบุ้ง'],
  fruit: ['ผลไม้', 'fruit', 'แอปเปิ้ล', 'apple', 'กล้วย', 'banana', 'ส้ม', 'orange', 'มะม่วง', 'mango', 'สตรอว์เบอร์รี่'],
  snack: ['ขนม', 'snack', 'chip', 'cookie', 'chocolate', 'ช็อกโกแลต', 'candy', 'ลูกอม', 'เค้ก', 'cake', 'คุกกี้', 'มันฝรั่งทอด'],
  drink: ['น้ำ', 'drink', 'beverage', 'juice', 'coffee', 'กาแฟ', 'ชา', 'tea', 'นม', 'milk', 'โค้ก', 'coke', 'สมูทตี้', 'smoothie'],
  dairy: ['โยเกิร์ต', 'yogurt', 'cheese', 'ชีส', 'นมสด', 'cream', 'ครีม', 'เนยแข็ง'],
  main: ['ข้าวผัด', 'กะเพรา', 'ผัดไทย', 'แกง', 'curry', 'ต้มยำ', 'ส้มตำ', 'ก๋วยเตี๋ยว', 'ข้าวมัน', 'ข้าวขา', 'พิซซ่า', 'pizza', 'burger', 'เบอร์เกอร์', 'แซนด์วิช', 'sandwich'],
}

// Emoji mapping by category
const CATEGORY_EMOJIS: Record<string, string> = {
  protein: '🥩',
  carb: '🍚',
  fat: '🥑',
  vegetable: '🥦',
  fruit: '🍎',
  snack: '🍪',
  drink: '🥤',
  dairy: '🥛',
  main: '🍽️',
}

/** Detect category from food name */
function detectCategory(name: string): string {
  const lower = name.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return category
      }
    }
  }
  return 'main' // default
}

/** Generate URL-safe slug from name */
function generateSlug(nameEn: string | null | undefined, nameTh: string): string {
  if (nameEn) {
    return nameEn
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  // For Thai names, use transliteration-style slug or just keep the Thai
  return encodeURIComponent(nameTh.replace(/\s+/g, '-'))
}

/** Detect if text is Thai */
function isThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text)
}

/** Round to 1 decimal place */
function round1(n: number | undefined | null): number {
  if (n == null || isNaN(n)) return 0
  return Math.round(n * 10) / 10
}

/** Normalize a raw food result into Supabase-ready format */
export function normalize(raw: RawFoodResult): NormalizedFood {
  // Determine Thai and English names
  let nameTh = raw.nameTh || ''
  let nameEn = raw.nameEn || null

  if (!nameTh && raw.name) {
    if (isThai(raw.name)) {
      nameTh = raw.name
    } else {
      nameEn = raw.name
      nameTh = raw.name // fallback — use English as Thai if no Thai available
    }
  }

  if (!nameEn && raw.name && !isThai(raw.name)) {
    nameEn = raw.name
  }

  const category = raw.category || detectCategory(nameTh + ' ' + (nameEn || ''))
  const emoji = CATEGORY_EMOJIS[category] || '🍽️'

  return {
    name_th: nameTh,
    name_en: nameEn,
    slug: generateSlug(nameEn, nameTh),
    emoji,
    calories: round1(raw.calories),
    protein: round1(raw.protein),
    fat: round1(raw.fat),
    carbs: round1(raw.carbs),
    fiber: raw.fiber != null ? round1(raw.fiber) : null,
    sodium: raw.sodium != null ? round1(raw.sodium) : null,
    sugar: raw.sugar != null ? round1(raw.sugar) : null,
    serving_size: raw.servingSize || '100g',
    serving_weight_g: raw.servingWeightG || 100,
    category,
    subcategory: null,
    brand: raw.brand || null,
    barcode: raw.barcode || null,
    image_url: raw.imageUrl || null,
    source: raw.source,
    verified: false,
    tags: raw.tags || [raw.source],
  }
}

/** Validate that nutrition values make sense */
export function validate(food: NormalizedFood): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []

  if (food.calories <= 0) warnings.push('แคลอรี่ = 0 หรือน้อยกว่า')
  if (food.calories > 1000) warnings.push(`แคลอรี่สูงผิดปกติ: ${food.calories} kcal/serving`)
  if (food.protein < 0) warnings.push('โปรตีนติดลบ')
  if (food.fat < 0) warnings.push('ไขมันติดลบ')
  if (food.carbs < 0) warnings.push('คาร์บติดลบ')

  // Macro sanity check: protein*4 + fat*9 + carbs*4 should be ~= calories (±30%)
  const estimated = food.protein * 4 + food.fat * 9 + food.carbs * 4
  if (estimated > 0 && food.calories > 0) {
    const ratio = food.calories / estimated
    if (ratio < 0.5 || ratio > 2) {
      warnings.push(`macro ไม่ตรงแคลอรี่ (ประมาณ ${Math.round(estimated)} vs จริง ${food.calories})`)
    }
  }

  if (!food.name_th) warnings.push('ไม่มีชื่ออาหารภาษาไทย')

  return {
    valid: warnings.length === 0,
    warnings,
  }
}
