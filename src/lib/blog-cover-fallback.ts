/**
 * Category → real fallback image URL (Unsplash).
 * Used when a post has no cover_image_url or the URL 404s.
 */
export const CATEGORY_FALLBACK_IMAGE: Record<string, string> = {
  // Core categories
  'ลดน้ำหนัก':
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=630&fit=crop&q=80',
  'อาหารคลีน':
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=630&fit=crop&q=80',
  'โปรตีน':
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&h=630&fit=crop&q=80',
  'คาร์บ':
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&h=630&fit=crop&q=80',
  'ผัก':
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=630&fit=crop&q=80',
  'ผลไม้':
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=630&fit=crop&q=80',
  'เครื่องดื่ม':
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&h=630&fit=crop&q=80',
  'ขนม':
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&h=630&fit=crop&q=80',
  'อาหารไทย':
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&h=630&fit=crop&q=80',
  'แบรนด์':
    'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=1200&h=630&fit=crop&q=80',
  'ออกกำลังกาย':
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=630&fit=crop&q=80',
  'เปรียบเทียบ':
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=630&fit=crop&q=80',
}

/** Universal fallback when category is unknown */
export const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=630&fit=crop&q=80'

export function getFallbackCover(category?: string | null): string {
  if (!category) return DEFAULT_COVER_IMAGE
  return CATEGORY_FALLBACK_IMAGE[category] || DEFAULT_COVER_IMAGE
}
