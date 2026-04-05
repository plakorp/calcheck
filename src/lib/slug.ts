/**
 * Generate URL-friendly slug from Thai food name
 * e.g. "ไข่, ไก่, ทั้งใบ" → "khai-kai-thang-bai"
 * Falls back to transliteration-free approach using encoded URI
 */
export function generateSlug(nameTh: string, nameEn?: string | null): string {
  if (nameEn) {
    return nameEn
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // For Thai names: use a simple romanization approach
  // Clean up the name first
  const cleaned = nameTh
    .replace(/,/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Encode for URL safety
  return encodeURIComponent(cleaned).toLowerCase()
}

/**
 * Generate SEO-friendly title
 */
export function generateFoodTitle(name: string, calories: number): string {
  return `${name} กี่แคล? ${Math.round(calories)} kcal | แคลอรี่ โปรตีน ไขมัน คาร์บ — CalCheck`
}

/**
 * Generate meta description
 */
export function generateFoodDescription(name: string, calories: number, protein: number, fat: number, carbs: number, servingSize: string): string {
  return `${name} มี ${Math.round(calories)} แคลอรี่ โปรตีน ${protein}g ไขมัน ${fat}g คาร์บ ${carbs}g ต่อ ${servingSize} ดูข้อมูลโภชนาการครบ พร้อมเทียบกับอาหารอื่น | CalCheck`
}

/**
 * Generate FAQ items for a food
 */
export function generateFoodFAQ(name: string, calories: number, protein: number): Array<{ question: string; answer: string }> {
  return [
    {
      question: `${name} กี่แคล?`,
      answer: `${name} มีแคลอรี่ประมาณ ${Math.round(calories)} kcal ต่อหนึ่งหน่วยบริโภค`,
    },
    {
      question: `${name} กินแล้วอ้วนไหม?`,
      answer: calories > 300
        ? `${name} มีแคลอรี่ค่อนข้างสูง (${Math.round(calories)} kcal) ควรกินในปริมาณพอเหมาะ`
        : `${name} มีแคลอรี่ไม่สูงมาก (${Math.round(calories)} kcal) สามารถกินได้โดยไม่ต้องกังวลมากนัก`,
    },
    {
      question: `${name} มีโปรตีนเท่าไหร่?`,
      answer: `${name} มีโปรตีน ${protein}g ต่อหนึ่งหน่วยบริโภค ${protein > 15 ? 'ถือว่าเป็นแหล่งโปรตีนที่ดี' : ''}`,
    },
    {
      question: `${name} เหมาะกับคนลดน้ำหนักไหม?`,
      answer: calories <= 200 && protein >= 10
        ? `${name} เหมาะสำหรับคนลดน้ำหนัก เพราะแคลอรี่ต่ำ (${Math.round(calories)} kcal) และโปรตีนสูง (${protein}g)`
        : calories <= 200
        ? `${name} มีแคลอรี่ต่ำ (${Math.round(calories)} kcal) พอเหมาะสำหรับคนควบคุมน้ำหนัก`
        : `${name} มีแคลอรี่ค่อนข้างสูง (${Math.round(calories)} kcal) คนลดน้ำหนักควรกินในปริมาณที่เหมาะสม`,
    },
  ]
}
