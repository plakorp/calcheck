export interface Food {
  id: string
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
  source: string
  verified: boolean
  tags: string[] | null
  description_th?: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export type FoodInsert = Omit<Food, 'id' | 'created_at' | 'updated_at'>

import type { BlogPost } from './blog'

// Simplified Database type — we use explicit typing instead of letting
// Supabase infer types, to avoid 'never' issues with complex generics
export interface Database {
  public: {
    Tables: {
      foods: {
        Row: Food
        Insert: Partial<Food> & { name_th: string; slug: string; calories: number }
        Update: Partial<Food>
      }
      blog_posts: {
        Row: BlogPost
        Insert: Partial<BlogPost> & { title: string; slug: string; content: string }
        Update: Partial<BlogPost>
      }
    }
  }
}

// Helper types for SEO
export interface FoodSEO {
  title: string
  description: string
  slug: string
  structuredData: Record<string, unknown>
}

// Category definitions
export const CATEGORIES = {
  protein: { label: 'โปรตีน', emoji: '🥩' },
  carb: { label: 'คาร์โบไฮเดรต', emoji: '🍚' },
  fat: { label: 'ไขมัน', emoji: '🥑' },
  vegetable: { label: 'ผัก', emoji: '🥦' },
  fruit: { label: 'ผลไม้', emoji: '🍎' },
  snack: { label: 'ขนม/ของว่าง', emoji: '🍪' },
  drink: { label: 'เครื่องดื่ม', emoji: '🥤' },
  main: { label: 'อาหารจานหลัก', emoji: '🍽️' },
  dairy: { label: 'นม/ผลิตภัณฑ์นม', emoji: '🥛' },
} as const

export type CategoryKey = keyof typeof CATEGORIES
