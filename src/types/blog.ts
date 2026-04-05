export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  category: string
  tags: string[] | null
  meta_title: string | null
  meta_description: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  author: string
  view_count: number
  related_food_slugs: string[] | null
  created_at: string
  updated_at: string
}

export type BlogPostInsert = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count'>

export const BLOG_CATEGORIES = {
  general: { label: 'ทั่วไป', emoji: '📝' },
  'calorie-guide': { label: 'คู่มือแคลอรี่', emoji: '🔢' },
  'diet-tips': { label: 'เคล็ดลับลดน้ำหนัก', emoji: '💪' },
  'food-compare': { label: 'เปรียบเทียบอาหาร', emoji: '⚖️' },
  'brand-review': { label: 'รีวิวแบรนด์', emoji: '🏪' },
  'meal-plan': { label: 'แผนมื้ออาหาร', emoji: '📋' },
  nutrition: { label: 'โภชนาการ', emoji: '🥗' },
  exercise: { label: 'ออกกำลังกาย', emoji: '🏃' },
} as const

export type BlogCategoryKey = keyof typeof BLOG_CATEGORIES
