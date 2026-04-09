/**
 * AI Blog Generator for CheckKal
 * Gen บทความโภชนาการภาษาไทย เน้น SEO keyword cluster
 * ใช้ Claude API ผ่าน Anthropic
 */

export interface BlogTopic {
  title: string
  slug: string
  keyword: string
  category: string
  tags: string[]
  relatedFoodSlugs?: string[]
}

// ─── SEO Keyword Topics (30 หัวข้อ) ──────────────────────────────────────────
export const BLOG_TOPICS: BlogTopic[] = [
  // กลุ่ม "กี่แคล" — People Also Ask
  { title: "ข้าวขาว 1 ทัพพีกี่แคล และกินเท่าไหร่ถึงพอดี", slug: "ข้าวขาว-1-ทัพพีกี่แคล", keyword: "ข้าวขาวกี่แคล", category: "กี่แคล", tags: ["ข้าวขาว", "แคลอรี่", "คาร์โบไฮเดรต"] },
  { title: "ไข่ไก่ 1 ฟองกี่แคล โปรตีนเท่าไหร่ กินแบบไหนดีที่สุด", slug: "ไข่ไก่-1-ฟองกี่แคล", keyword: "ไข่ไก่กี่แคล", category: "กี่แคล", tags: ["ไข่", "โปรตีน", "อาหารเช้า"] },
  { title: "กาแฟดำกี่แคล vs ลาเต้กี่แคล เลือกแบบไหนดีถ้าลดน้ำหนัก", slug: "กาแฟดำกี่แคล-vs-ลาเต้", keyword: "กาแฟกี่แคล", category: "กี่แคล", tags: ["กาแฟ", "เครื่องดื่ม", "ลดน้ำหนัก"] },
  { title: "กล้วยหอมกี่แคล กินก่อนหรือหลังออกกำลังกายดีกว่ากัน", slug: "กล้วยหอมกี่แคล", keyword: "กล้วยกี่แคล", category: "กี่แคล", tags: ["กล้วย", "ผลไม้", "ออกกำลังกาย"] },
  { title: "ขนมปังโฮลวีท 1 แผ่นกี่แคล เทียบกับขนมปังขาว", slug: "ขนมปังโฮลวีทกี่แคล", keyword: "ขนมปังกี่แคล", category: "กี่แคล", tags: ["ขนมปัง", "โฮลวีท", "คาร์บ"] },
  { title: "นมวัวแก้วเดียวกี่แคล โปรตีนได้เท่าไหร่ เทียบกับนมถั่วเหลือง", slug: "นมวัวกี่แคล-เทียบนมถั่วเหลือง", keyword: "นมกี่แคล", category: "กี่แคล", tags: ["นม", "แคลเซียม", "โปรตีน"] },
  { title: "อกไก่ 100g กี่แคล โปรตีนกี่กรัม ทำไมคนออกกำลังกายชอบกิน", slug: "อกไก่กี่แคล-โปรตีน", keyword: "อกไก่กี่แคล", category: "กี่แคล", tags: ["อกไก่", "โปรตีน", "อาหารคลีน"], relatedFoodSlugs: ["chicken-breast-cooked"] },
  { title: "อะโวคาโดกี่แคล ไขมันเยอะไหม กินได้ทุกวันไหม", slug: "อะโวคาโดกี่แคล", keyword: "อะโวคาโดกี่แคล", category: "กี่แคล", tags: ["อะโวคาโด", "ไขมันดี", "superfood"] },
  { title: "ข้าวกล้องกี่แคล ต่างจากข้าวขาวยังไง ลดน้ำหนักกินอะไรดีกว่า", slug: "ข้าวกล้องกี่แคล-เทียบข้าวขาว", keyword: "ข้าวกล้องกี่แคล", category: "กี่แคล", tags: ["ข้าวกล้อง", "ไฟเบอร์", "ลดน้ำหนัก"] },
  { title: "มาม่าต้มยำกุ้งกี่แคล โซเดียมสูงแค่ไหน กินบ่อยได้ไหม", slug: "มาม่าต้มยำกุ้งกี่แคล", keyword: "มาม่ากี่แคล", category: "กี่แคล", tags: ["มาม่า", "บะหมี่กึ่งสำเร็จรูป", "โซเดียม"] },

  // กลุ่ม "ลดน้ำหนัก"
  { title: "กินอะไรลดน้ำหนักเร็ว 10 อาหารแคลต่ำที่อิ่มนาน", slug: "อาหารแคลต่ำอิ่มนาน-ลดน้ำหนัก", keyword: "อาหารลดน้ำหนัก", category: "ลดน้ำหนัก", tags: ["ลดน้ำหนัก", "แคลต่ำ", "อาหารคลีน"] },
  { title: "Calorie Deficit คืออะไร ต้องลดกี่แคลต่อวันถึงลดได้จริง", slug: "calorie-deficit-คืออะไร-ลดได้จริง", keyword: "calorie deficit", category: "ลดน้ำหนัก", tags: ["calorie deficit", "ลดน้ำหนัก", "โภชนาการ"] },
  { title: "อาหารเช้าลดน้ำหนัก 7 เมนูใต้ 300 แคล อิ่มจนถึงเที่ยง", slug: "อาหารเช้าลดน้ำหนัก-ใต้300แคล", keyword: "อาหารเช้าลดน้ำหนัก", category: "ลดน้ำหนัก", tags: ["อาหารเช้า", "ลดน้ำหนัก", "เมนูสุขภาพ"] },
  { title: "ของว่างลดน้ำหนัก 10 อย่างที่กินได้ไม่รู้สึกผิด", slug: "ของว่างลดน้ำหนัก-กินได้ไม่ผิด", keyword: "ของว่างลดน้ำหนัก", category: "ลดน้ำหนัก", tags: ["ของว่าง", "ลดน้ำหนัก", "สแนค"] },
  { title: "TDEE คืออะไร คำนวณยังไง กินเท่าไหร่ถึงไม่อ้วน", slug: "tdee-คืออะไร-คำนวณ", keyword: "TDEE คือ", category: "ลดน้ำหนัก", tags: ["TDEE", "แคลอรี่", "พลังงาน"] },

  // กลุ่ม "โปรตีน"
  { title: "โปรตีนควรกินวันละกี่กรัม คำนวณจากน้ำหนักตัวยังไง", slug: "โปรตีนควรกินวันละกี่กรัม", keyword: "โปรตีนวันละกี่กรัม", category: "โภชนาการ", tags: ["โปรตีน", "กล้ามเนื้อ", "โภชนาการ"] },
  { title: "อาหารโปรตีนสูง 15 ชนิดที่หาง่าย ราคาไม่แพง", slug: "อาหารโปรตีนสูง-หาง่ายราคาไม่แพง", keyword: "อาหารโปรตีนสูง", category: "โภชนาการ", tags: ["โปรตีน", "อาหารสุขภาพ", "กล้ามเนื้อ"] },
  { title: "Whey Protein vs อาหารจริง กินอะไรได้โปรตีนคุ้มกว่ากัน", slug: "whey-protein-vs-อาหารจริง", keyword: "whey protein", category: "โภชนาการ", tags: ["whey protein", "ซัพพลีเมนต์", "โปรตีน"] },

  // กลุ่ม "อาหารคลีน"
  { title: "อาหารคลีนคืออะไร กินยังไง เริ่มต้นได้เลยแบบไม่ยุ่งยาก", slug: "อาหารคลีนคืออะไร-เริ่มต้น", keyword: "อาหารคลีน", category: "อาหารคลีน", tags: ["อาหารคลีน", "สุขภาพ", "เริ่มต้น"] },
  { title: "เมนูอาหารคลีน 7 วัน ทำเองที่บ้านได้ง่าย ๆ", slug: "เมนูอาหารคลีน-7-วัน", keyword: "เมนูอาหารคลีน", category: "อาหารคลีน", tags: ["อาหารคลีน", "เมนู", "ทำเอง"] },
  { title: "Meal Prep คืออะไร เตรียมอาหารทั้งสัปดาห์ยังไงให้ประหยัดเวลา", slug: "meal-prep-เตรียมอาหารทั้งสัปดาห์", keyword: "meal prep", category: "อาหารคลีน", tags: ["meal prep", "เตรียมอาหาร", "สุขภาพ"] },

  // กลุ่ม "เปรียบเทียบ"
  { title: "ข้าวขาว vs ข้าวกล้อง vs ข้าวมันฝรั่ง อันไหนดีที่สุด", slug: "ข้าวขาว-vs-ข้าวกล้อง-vs-ข้าวมันฝรั่ง", keyword: "ข้าวขาว vs ข้าวกล้อง", category: "เปรียบเทียบ", tags: ["ข้าว", "เปรียบเทียบ", "คาร์บ"] },
  { title: "น้ำตาลทราย vs น้ำผึ้ง vs สตีเวีย อันไหนดีต่อสุขภาพที่สุด", slug: "น้ำตาล-vs-น้ำผึ้ง-vs-สตีเวีย", keyword: "น้ำตาล vs น้ำผึ้ง", category: "เปรียบเทียบ", tags: ["น้ำตาล", "ความหวาน", "สุขภาพ"] },
  { title: "ปลาแซลมอน vs อกไก่ vs เต้าหู้ โปรตีนอะไรดีที่สุด", slug: "ปลาแซลมอน-vs-อกไก่-vs-เต้าหู้", keyword: "ปลาแซลมอน vs อกไก่", category: "เปรียบเทียบ", tags: ["โปรตีน", "ปลา", "เปรียบเทียบ"] },

  // กลุ่ม "Macro & Micro"
  { title: "คาร์โบไฮเดรตคืออะไร กินมากเกินไปทำให้อ้วนจริงไหม", slug: "คาร์โบไฮเดรตคืออะไร-อ้วนไหม", keyword: "คาร์โบไฮเดรต", category: "โภชนาการ", tags: ["คาร์บ", "โภชนาการ", "พลังงาน"] },
  { title: "ไขมันดี vs ไขมันเลว ต่างกันยังไง ควรกินเท่าไหร่", slug: "ไขมันดี-vs-ไขมันเลว", keyword: "ไขมันดี ไขมันเลว", category: "โภชนาการ", tags: ["ไขมัน", "คอเลสเตอรอล", "สุขภาพ"] },
  { title: "โซเดียมในอาหาร วันนึงกินได้กี่มิลลิกรัม เกินแล้วเป็นยังไง", slug: "โซเดียมในอาหาร-วันละกี่มิลลิกรัม", keyword: "โซเดียมในอาหาร", category: "โภชนาการ", tags: ["โซเดียม", "ความดัน", "สุขภาพ"] },
  { title: "ไฟเบอร์คืออะไร กินเท่าไหร่ต่อวัน อาหารอะไรไฟเบอร์สูง", slug: "ไฟเบอร์คืออะไร-กินเท่าไหร่", keyword: "ไฟเบอร์", category: "โภชนาการ", tags: ["ไฟเบอร์", "ระบบย่อยอาหาร", "สุขภาพ"] },

  // กลุ่ม "7-Eleven & Fast Food"
  { title: "7-Eleven กินอะไรได้บ้างตอนลดน้ำหนัก เมนูแคลต่ำที่ดีที่สุด", slug: "7-eleven-เมนูแคลต่ำ-ลดน้ำหนัก", keyword: "7eleven ลดน้ำหนัก", category: "Fast Food", tags: ["7-eleven", "ลดน้ำหนัก", "แคลต่ำ"] },
  { title: "McDonalds กินอะไรได้ถ้าคุม macro อยู่ ตัวเลือกดีที่สุด", slug: "mcdonalds-กินอะไรได้-คุม-macro", keyword: "mcdonalds แคลอรี่", category: "Fast Food", tags: ["McDonald's", "fast food", "แคลอรี่"] },
]

// ─── Generator ────────────────────────────────────────────────────────────────

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, "")
    .slice(0, 80)
}

export async function generateBlogPost(topic: BlogTopic): Promise<{
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  meta_title: string
  meta_description: string
  related_food_slugs: string[]
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")

  const prompt = `คุณเป็นนักเขียนบทความโภชนาการภาษาไทยมืออาชีพ เขียน SEO blog post เรื่อง:

**หัวข้อ:** ${topic.title}
**Keyword หลัก:** ${topic.keyword}
**หมวดหมู่:** ${topic.category}

เขียนบทความ HTML ที่มีโครงสร้างดังนี้:
1. Introduction (2-3 ประโยค ดึงดูด มี keyword)
2. เนื้อหาหลัก แบ่งเป็น 3-5 หัวข้อย่อย (ใช้ <h2>) แต่ละหัวข้อ 2-4 ย่อหน้า
3. ตารางเปรียบเทียบ (ถ้าเหมาะสม ใช้ <table>)
4. สรุป + CTA ท้ายบทความ (แนะนำให้เช็คข้อมูลบน CheckKal)

**กฎ:**
- ใช้ <h2> และ <h3> เท่านั้น ห้ามใช้ <h1>
- ข้อมูลโภชนาการต้องแม่นยำ อ้างอิงได้
- ภาษาเป็นกันเอง เข้าใจง่าย ไม่วิชาการจนเกินไป
- ความยาว 800-1200 คำ
- ใส่ keyword "${topic.keyword}" ใน introduction, h2 อย่างน้อย 1 จุด, และ conclusion
- ท้ายบทความให้มีลิงก์ "ดูข้อมูลโภชนาการเพิ่มเติมที่ CheckKal" โดยไม่ต้องใส่ href จริง

ตอบกลับด้วย JSON เท่านั้น ไม่ต้องมี markdown wrapper:
{
  "excerpt": "สรุปบทความ 1-2 ประโยค สำหรับ meta description (ไม่เกิน 160 ตัวอักษร)",
  "content": "HTML content ทั้งหมด",
  "meta_title": "SEO title (ไม่เกิน 60 ตัวอักษร)",
  "meta_description": "SEO description (ไม่เกิน 160 ตัวอักษร)"
}`

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  const text = data.content[0].text

  // Parse JSON response
  const parsed = JSON.parse(text)

  return {
    title: topic.title,
    slug: topic.slug,
    excerpt: parsed.excerpt,
    content: parsed.content,
    category: topic.category,
    tags: topic.tags,
    meta_title: parsed.meta_title,
    meta_description: parsed.meta_description,
    related_food_slugs: topic.relatedFoodSlugs || [],
  }
}
