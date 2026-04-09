/**
 * Template-Based Blog Generator for CheckKal
 * ไม่ใช้ AI API — ดึงข้อมูลจริงจาก Supabase มาแทนใน template
 * ฟรี 100%
 */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface BlogTopic {
  title: string
  slug: string
  keyword: string
  category: string
  tags: string[]
  foodSlug?: string           // slug ของอาหารหลักที่จะดึงข้อมูล
  compareSlugs?: string[]     // สำหรับ topic เปรียบเทียบ
  templateType: TemplateType
}

export type TemplateType =
  | "food-calories"     // X กี่แคล
  | "compare-foods"     // X vs Y
  | "diet-guide"        // ลดน้ำหนัก / อาหารคลีน
  | "macro-explainer"   // โปรตีน / คาร์บ / ไขมัน
  | "fast-food-guide"   // 7-eleven / fast food

// ─── Topic List ───────────────────────────────────────────────────────────────
export const BLOG_TOPICS: BlogTopic[] = [
  // กลุ่ม "กี่แคล"
  { title: "ข้าวขาว 1 ทัพพีกี่แคล กินเท่าไหร่ต่อวันถึงพอดี", slug: "ข้าวขาว-1-ทัพพีกี่แคล", keyword: "ข้าวขาวกี่แคล", category: "กี่แคล", tags: ["ข้าวขาว", "แคลอรี่", "คาร์บ"], foodSlug: "white-rice-cooked", templateType: "food-calories" },
  { title: "ไข่ไก่ 1 ฟองกี่แคล โปรตีนได้เท่าไหร่ กินยังไงให้ได้ประโยชน์สูงสุด", slug: "ไข่ไก่-1-ฟองกี่แคล", keyword: "ไข่ไก่กี่แคล", category: "กี่แคล", tags: ["ไข่", "โปรตีน", "อาหารเช้า"], foodSlug: "egg-boiled", templateType: "food-calories" },
  { title: "อกไก่ต้ม 100g กี่แคล โปรตีนกี่กรัม ทำไมคนออกกำลังกายชอบกิน", slug: "อกไก่ต้มกี่แคล-โปรตีน", keyword: "อกไก่กี่แคล", category: "กี่แคล", tags: ["อกไก่", "โปรตีน", "อาหารคลีน"], foodSlug: "chicken-breast-cooked", templateType: "food-calories" },
  { title: "กล้วยหอม 1 ลูกกี่แคล กินก่อนหรือหลังออกกำลังกายดีกว่ากัน", slug: "กล้วยหอมกี่แคล-ก่อนออกกำลังกาย", keyword: "กล้วยกี่แคล", category: "กี่แคล", tags: ["กล้วย", "ผลไม้", "ออกกำลังกาย"], foodSlug: "banana", templateType: "food-calories" },
  { title: "ข้าวกล้องกี่แคล ต่างจากข้าวขาวยังไง ลดน้ำหนักกินอะไรดีกว่า", slug: "ข้าวกล้องกี่แคล-เทียบข้าวขาว", keyword: "ข้าวกล้องกี่แคล", category: "กี่แคล", tags: ["ข้าวกล้อง", "ไฟเบอร์", "ลดน้ำหนัก"], foodSlug: "brown-rice-cooked", templateType: "food-calories" },
  { title: "อะโวคาโดกี่แคล ไขมันเยอะไหม กินได้ทุกวันไหม", slug: "อะโวคาโดกี่แคล-ไขมัน", keyword: "อะโวคาโดกี่แคล", category: "กี่แคล", tags: ["อะโวคาโด", "ไขมันดี", "superfood"], foodSlug: "avocado", templateType: "food-calories" },
  { title: "มาม่าต้มยำกุ้งกี่แคล โซเดียมสูงแค่ไหน กินบ่อยได้ไหม", slug: "มาม่าต้มยำกุ้งกี่แคล", keyword: "มาม่ากี่แคล", category: "กี่แคล", tags: ["มาม่า", "บะหมี่กึ่งสำเร็จรูป", "โซเดียม"], foodSlug: "mama-tom-yum", templateType: "food-calories" },

  // กลุ่ม "เปรียบเทียบ"
  { title: "ข้าวขาว vs ข้าวกล้อง กินอะไรดีกว่ากันถ้าอยากลดน้ำหนัก", slug: "ข้าวขาว-vs-ข้าวกล้อง-ลดน้ำหนัก", keyword: "ข้าวขาว vs ข้าวกล้อง", category: "เปรียบเทียบ", tags: ["ข้าว", "เปรียบเทียบ", "ลดน้ำหนัก"], compareSlugs: ["white-rice-cooked", "brown-rice-cooked"], templateType: "compare-foods" },
  { title: "อกไก่ vs ปลาแซลมอน vs เต้าหู้ โปรตีนอะไรคุ้มที่สุด", slug: "อกไก่-vs-ปลาแซลมอน-vs-เต้าหู้", keyword: "อกไก่ vs ปลาแซลมอน", category: "เปรียบเทียบ", tags: ["โปรตีน", "เปรียบเทียบ", "อาหารคลีน"], compareSlugs: ["chicken-breast-cooked", "salmon", "tofu"], templateType: "compare-foods" },

  // กลุ่ม "ลดน้ำหนัก"
  { title: "Calorie Deficit คืออะไร ต้องลดกี่แคลต่อวันถึงลดน้ำหนักได้จริง", slug: "calorie-deficit-คืออะไร", keyword: "calorie deficit", category: "ลดน้ำหนัก", tags: ["calorie deficit", "ลดน้ำหนัก", "โภชนาการ"], templateType: "diet-guide" },
  { title: "TDEE คืออะไร คำนวณยังไง กินเท่าไหร่ถึงไม่อ้วน", slug: "tdee-คืออะไร-คำนวณ", keyword: "TDEE คือ", category: "ลดน้ำหนัก", tags: ["TDEE", "แคลอรี่", "พลังงาน"], templateType: "diet-guide" },
  { title: "อาหารเช้าลดน้ำหนัก 7 เมนูใต้ 300 แคล อิ่มจนถึงเที่ยง", slug: "อาหารเช้าลดน้ำหนัก-ใต้300แคล", keyword: "อาหารเช้าลดน้ำหนัก", category: "ลดน้ำหนัก", tags: ["อาหารเช้า", "ลดน้ำหนัก", "เมนู"], templateType: "diet-guide" },
  { title: "Meal Prep คืออะไร เตรียมอาหารทั้งสัปดาห์ยังไงให้ประหยัดเวลา", slug: "meal-prep-เตรียมอาหารทั้งสัปดาห์", keyword: "meal prep", category: "อาหารคลีน", tags: ["meal prep", "เตรียมอาหาร", "สุขภาพ"], templateType: "diet-guide" },

  // กลุ่ม "Macro"
  { title: "โปรตีนควรกินวันละกี่กรัม คำนวณจากน้ำหนักตัวยังไง", slug: "โปรตีนควรกินวันละกี่กรัม", keyword: "โปรตีนวันละกี่กรัม", category: "โภชนาการ", tags: ["โปรตีน", "กล้ามเนื้อ", "โภชนาการ"], templateType: "macro-explainer" },
  { title: "ไขมันดี vs ไขมันเลว ต่างกันยังไง กินเท่าไหร่ต่อวัน", slug: "ไขมันดี-vs-ไขมันเลว", keyword: "ไขมันดี ไขมันเลว", category: "โภชนาการ", tags: ["ไขมัน", "คอเลสเตอรอล", "สุขภาพ"], templateType: "macro-explainer" },
  { title: "โซเดียมในอาหาร วันนึงกินได้กี่มิลลิกรัม เกินแล้วเป็นยังไง", slug: "โซเดียมในอาหาร-วันละกี่มิลลิกรัม", keyword: "โซเดียมในอาหาร", category: "โภชนาการ", tags: ["โซเดียม", "ความดัน", "สุขภาพ"], templateType: "macro-explainer" },
  { title: "ไฟเบอร์คืออะไร กินเท่าไหร่ต่อวัน อาหารอะไรไฟเบอร์สูง", slug: "ไฟเบอร์คืออะไร-กินเท่าไหร่", keyword: "ไฟเบอร์", category: "โภชนาการ", tags: ["ไฟเบอร์", "ระบบย่อยอาหาร", "สุขภาพ"], templateType: "macro-explainer" },

  // กลุ่ม "Fast Food"
  { title: "7-Eleven กินอะไรได้บ้างตอนลดน้ำหนัก เมนูแคลต่ำที่ดีที่สุด", slug: "7-eleven-เมนูแคลต่ำ-ลดน้ำหนัก", keyword: "7eleven ลดน้ำหนัก", category: "Fast Food", tags: ["7-eleven", "ลดน้ำหนัก", "แคลต่ำ"], templateType: "fast-food-guide" },
]

// ─── Template Functions ───────────────────────────────────────────────────────

async function getFoodData(slug: string) {
  const { data } = await supabase
    .from("foods")
    .select("*")
    .eq("slug", slug)
    .single()
  return data
}

async function getFoodsByCategory(category: string, limit = 5) {
  const { data } = await supabase
    .from("foods")
    .select("*")
    .eq("category", category)
    .limit(limit)
  return data || []
}

// Template 1: food-calories — "X กี่แคล"
async function templateFoodCalories(topic: BlogTopic) {
  const food = topic.foodSlug ? await getFoodData(topic.foodSlug) : null
  const cal = food ? Math.round(food.calories) : "ประมาณ 150-200"
  const protein = food ? food.protein : "-"
  const fat = food ? food.fat : "-"
  const carbs = food ? food.carbs : "-"
  const serving = food ? (food.serving_size || "100g") : "100g"
  const name = food ? food.name_th : topic.title.split(" ")[0]

  const content = `
<h2>${topic.keyword} — ตอบสั้น ๆ</h2>
<p><strong>${name}</strong> (${serving}) มีพลังงานประมาณ <strong>${cal} แคลอรี่</strong> โดยแบ่งเป็นโปรตีน ${protein}g ไขมัน ${fat}g และคาร์โบไฮเดรต ${carbs}g</p>
<p>ถ้าคุณกำลังคุมแคลอรี่หรือลดน้ำหนักอยู่ การรู้ว่า${name}กี่แคลเป็นข้อมูลพื้นฐานที่ขาดไม่ได้ บทความนี้จะพาไปดูรายละเอียดทั้งหมด</p>

<h2>ตารางโภชนาการ ${name} (${serving})</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f3f4f6"><th style="padding:10px;border:1px solid #e5e7eb;text-align:left">สารอาหาร</th><th style="padding:10px;border:1px solid #e5e7eb;text-align:right">ปริมาณ</th><th style="padding:10px;border:1px solid #e5e7eb;text-align:right">% DV</th></tr></thead>
  <tbody>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">พลังงาน</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${cal} kcal</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${Math.round((Number(cal)/2000)*100)}%</td></tr>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">โปรตีน</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${protein}g</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${Math.round((Number(protein)/50)*100)}%</td></tr>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">ไขมันรวม</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${fat}g</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${Math.round((Number(fat)/65)*100)}%</td></tr>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">คาร์โบไฮเดรต</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${carbs}g</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${Math.round((Number(carbs)/300)*100)}%</td></tr>
  </tbody>
</table>

<h2>กิน${name}ได้วันละเท่าไหร่</h2>
<p>ขึ้นอยู่กับเป้าหมายของแต่ละคน ถ้าคุมแคลอรี่วันละ 1,500-1,800 kcal ควรจำกัด${name}ให้อยู่ในปริมาณที่พอดี ไม่เกิน 20-25% ของพลังงานทั้งวัน</p>
<p>สำหรับคนออกกำลังกาย อาจเพิ่มได้มากขึ้นตามค่า TDEE ของตัวเอง</p>

<h2>${name}เหมาะกับใครบ้าง</h2>
<p>${name}เป็นอาหารที่กินได้ทั่วไป ไม่ว่าจะเป็นคนที่กำลัง:</p>
<ul>
  <li>ลดน้ำหนัก — กินได้ แต่ควรคุมปริมาณ</li>
  <li>เพิ่มกล้ามเนื้อ — กินได้ เลือก${name}คู่กับโปรตีน</li>
  <li>รักษาน้ำหนัก — กินได้ตามปกติ ไม่ต้องจำกัดพิเศษ</li>
</ul>

<h2>เคล็ดลับกิน${name}ให้ได้ประโยชน์สูงสุด</h2>
<p>1. กินคู่กับโปรตีนเสมอ เพื่อชะลอการดูดซึมน้ำตาล</p>
<p>2. ชั่งน้ำหนักให้แม่นยำถ้าคุมแคลอรี่อยู่</p>
<p>3. ดูข้อมูลโภชนาการแบบละเอียดได้ที่ CheckKal</p>

<p><em>ต้องการเช็คข้อมูลโภชนาการอาหารอื่น ๆ เพิ่มเติม? ลองค้นหาที่ <strong>CheckKal</strong> — ฐานข้อมูลโภชนาการอาหารไทยที่ครบที่สุด</em></p>
`
  const excerpt = `${name} (${serving}) มีพลังงาน ${cal} แคลอรี่ โปรตีน ${protein}g ไขมัน ${fat}g คาร์บ ${carbs}g ดูรายละเอียดและเคล็ดลับการกินที่นี่`
  return { content, excerpt }
}

// Template 2: compare-foods — "X vs Y"
async function templateCompareFoods(topic: BlogTopic) {
  const slugs = topic.compareSlugs || []
  const foods = await Promise.all(slugs.map(s => getFoodData(s)))
  const validFoods = foods.filter(Boolean)

  const rows = validFoods.map(f => `
    <tr>
      <td style="padding:10px;border:1px solid #e5e7eb">${f.name_th}</td>
      <td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${Math.round(f.calories)}</td>
      <td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${f.protein}g</td>
      <td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${f.fat}g</td>
      <td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${f.carbs}g</td>
    </tr>`).join("")

  const names = validFoods.map(f => f.name_th).join(" และ ")
  const winner = validFoods.reduce((a, b) => a.protein > b.protein ? a : b, validFoods[0])

  const content = `
<h2>เปรียบเทียบ ${topic.keyword} — ดูตัวเลขจริง</h2>
<p>หลายคนสงสัยว่าระหว่าง ${names} อันไหนดีกว่า บทความนี้เอาข้อมูลโภชนาการจริงมาเทียบให้เห็นชัด ๆ</p>

<h2>ตารางเปรียบเทียบโภชนาการ (ต่อ 100g)</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f3f4f6">
    <th style="padding:10px;border:1px solid #e5e7eb;text-align:left">อาหาร</th>
    <th style="padding:10px;border:1px solid #e5e7eb;text-align:right">แคลอรี่</th>
    <th style="padding:10px;border:1px solid #e5e7eb;text-align:right">โปรตีน</th>
    <th style="padding:10px;border:1px solid #e5e7eb;text-align:right">ไขมัน</th>
    <th style="padding:10px;border:1px solid #e5e7eb;text-align:right">คาร์บ</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>

<h2>สรุป — ควรเลือกอะไร</h2>
<p>ถ้าเป้าหมายคือ <strong>โปรตีนสูง</strong>: เลือก <strong>${winner?.name_th}</strong> เพราะมีโปรตีนมากที่สุดใน ${names}</p>
<p>ถ้าเป้าหมายคือ <strong>แคลอรี่ต่ำ</strong>: เลือกตัวที่มีแคลอรี่น้อยที่สุดจากตารางด้านบน</p>
<p>ไม่มีคำตอบตายตัว ขึ้นอยู่กับเป้าหมายและไลฟ์สไตล์ของแต่ละคน</p>

<p><em>ดูข้อมูลโภชนาการละเอียดของแต่ละรายการได้ที่ <strong>CheckKal</strong></em></p>
`
  const excerpt = `เปรียบเทียบโภชนาการ ${names} แบบตัวต่อตัว ดูแคลอรี่ โปรตีน ไขมัน คาร์บ และสรุปว่าควรเลือกอะไรตามเป้าหมาย`
  return { content, excerpt }
}

// Template 3: diet-guide / macro-explainer / fast-food-guide
async function templateGeneral(topic: BlogTopic) {
  const templates: Record<string, { content: string; excerpt: string }> = {
    "calorie-deficit-คืออะไร": {
      excerpt: "Calorie Deficit คือการกินพลังงานน้อยกว่าที่ร่างกายเผาผลาญ ต้องลดกี่แคลต่อวันถึงลดน้ำหนักได้จริง",
      content: `
<h2>Calorie Deficit คืออะไร</h2>
<p><strong>Calorie Deficit</strong> หรือ การขาดดุลแคลอรี่ คือการที่ร่างกายได้รับพลังงานจากอาหารน้อยกว่าพลังงานที่เผาผลาญออกไปในแต่ละวัน ผลลัพธ์คือร่างกายจะดึงพลังงานสำรองจากไขมันมาใช้แทน ทำให้น้ำหนักลดลง</p>

<h2>ต้องลดกี่แคลต่อวันถึงลดน้ำหนักได้</h2>
<p>หลักการง่าย ๆ คือ ไขมัน 1 กิโลกรัมเท่ากับพลังงานประมาณ 7,700 แคลอรี่ ดังนั้น:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f3f4f6"><th style="padding:10px;border:1px solid #e5e7eb">Deficit ต่อวัน</th><th style="padding:10px;border:1px solid #e5e7eb">ลดน้ำหนักต่อสัปดาห์</th><th style="padding:10px;border:1px solid #e5e7eb">ลดต่อเดือน</th></tr></thead>
  <tbody>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">250 kcal</td><td style="padding:10px;border:1px solid #e5e7eb">~0.23 kg</td><td style="padding:10px;border:1px solid #e5e7eb">~1 kg</td></tr>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">500 kcal</td><td style="padding:10px;border:1px solid #e5e7eb">~0.45 kg</td><td style="padding:10px;border:1px solid #e5e7eb">~2 kg</td></tr>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">750 kcal</td><td style="padding:10px;border:1px solid #e5e7eb">~0.68 kg</td><td style="padding:10px;border:1px solid #e5e7eb">~3 kg</td></tr>
  </tbody>
</table>

<h2>Calorie Deficit ที่ปลอดภัย</h2>
<p>แนะนำ deficit <strong>300-500 kcal/วัน</strong> เป็นจุดที่สมดุล ลดน้ำหนักได้จริงโดยไม่เสียกล้ามเนื้อ ไม่ควรเกิน 1,000 kcal/วัน เพราะอาจทำให้ร่างกายสลายกล้ามเนื้อแทนไขมัน</p>

<h2>วิธีสร้าง Calorie Deficit</h2>
<p>1. คำนวณ TDEE ของตัวเองก่อน (พลังงานที่ร่างกายเผาผลาญต่อวัน)</p>
<p>2. ลดแคลอรี่จากอาหาร 300-500 kcal</p>
<p>3. เพิ่มการออกกำลังกายเพื่อเผาผลาญเพิ่ม</p>
<p>4. ติดตามโภชนาการด้วย CheckKal เพื่อรู้ว่าแต่ละมื้อกินแคลอรี่ไปเท่าไหร่</p>

<p><em>เช็คแคลอรี่อาหารแต่ละชนิดได้ที่ <strong>CheckKal</strong> — ฐานข้อมูลโภชนาการอาหารไทยที่ครอบคลุมที่สุด</em></p>`
    },
    "tdee-คืออะไร-คำนวณ": {
      excerpt: "TDEE คือพลังงานรวมที่ร่างกายเผาผลาญต่อวัน รวมกิจกรรมทั้งหมด คำนวณจาก BMR × Activity Factor",
      content: `
<h2>TDEE คืออะไร</h2>
<p><strong>TDEE (Total Daily Energy Expenditure)</strong> คือพลังงานรวมทั้งหมดที่ร่างกายเผาผลาญใน 1 วัน รวมทั้งการหายใจ การย่อยอาหาร และกิจกรรมต่าง ๆ นี่คือตัวเลขที่บอกว่าคุณควรกินแคลอรี่เท่าไหร่ต่อวันถึงจะรักษาน้ำหนักได้</p>

<h2>TDEE คำนวณยังไง</h2>
<p>TDEE = BMR × Activity Factor</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f3f4f6"><th style="padding:10px;border:1px solid #e5e7eb">ระดับกิจกรรม</th><th style="padding:10px;border:1px solid #e5e7eb">Activity Factor</th></tr></thead>
  <tbody>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">นั่งทำงานทั้งวัน แทบไม่ขยับ</td><td style="padding:10px;border:1px solid #e5e7eb">× 1.2</td></tr>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">ออกกำลังกาย 1-3 วัน/สัปดาห์</td><td style="padding:10px;border:1px solid #e5e7eb">× 1.375</td></tr>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">ออกกำลังกาย 3-5 วัน/สัปดาห์</td><td style="padding:10px;border:1px solid #e5e7eb">× 1.55</td></tr>
    <tr><td style="padding:10px;border:1px solid #e5e7eb">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์</td><td style="padding:10px;border:1px solid #e5e7eb">× 1.725</td></tr>
  </tbody>
</table>

<h2>กินเท่า TDEE = น้ำหนักคงที่</h2>
<p>กิน <strong>น้อยกว่า TDEE</strong> = ลดน้ำหนัก | กิน <strong>มากกว่า TDEE</strong> = น้ำหนักขึ้น</p>
<p>เมื่อรู้ TDEE แล้ว ให้ใช้ CheckKal เช็คแคลอรี่อาหารในแต่ละมื้อเพื่อควบคุมให้อยู่ในเป้าหมาย</p>

<p><em>ดูข้อมูลโภชนาการอาหารทุกชนิดได้ที่ <strong>CheckKal</strong></em></p>`
    },
  }

  // Default template สำหรับ topic ที่ไม่มี custom template
  const defaultContent = {
    content: `
<h2>ทำความรู้จัก${topic.keyword}</h2>
<p>${topic.title} เป็นหนึ่งในคำถามยอดฮิตที่คนสนใจเรื่องโภชนาการมักถามกัน บทความนี้จะตอบให้ชัดเจนพร้อมข้อมูลที่นำไปใช้ได้จริง</p>

<h2>ทำไม${topic.keyword}ถึงสำคัญ</h2>
<p>การเข้าใจเรื่องโภชนาการช่วยให้เราตัดสินใจเลือกอาหารได้ดีขึ้น ไม่ว่าจะมีเป้าหมายลดน้ำหนัก เพิ่มกล้ามเนื้อ หรือแค่อยากมีสุขภาพดี</p>

<h2>แนวทางปฏิบัติ</h2>
<p>1. เริ่มจากการรู้จักอาหารที่กินอยู่ทุกวัน ว่ามีสารอาหารอะไรบ้าง</p>
<p>2. ใช้ CheckKal เช็คข้อมูลโภชนาการก่อนตัดสินใจกิน</p>
<p>3. ค่อย ๆ ปรับพฤติกรรมการกิน ไม่ต้องเปลี่ยนทุกอย่างในทีเดียว</p>

<p><em>ดูข้อมูลโภชนาการอาหารทุกชนิดได้ที่ <strong>CheckKal</strong> — ฐานข้อมูลโภชนาการอาหารไทยที่ครบที่สุด</em></p>`,
    excerpt: `${topic.title} — ข้อมูลโภชนาการที่แม่นยำและนำไปใช้ได้จริง อ่านได้ที่ CheckKal`
  }

  return templates[topic.slug] || defaultContent
}

// ─── Main Generator ───────────────────────────────────────────────────────────
export async function generateBlogPost(topic: BlogTopic): Promise<{
  title: string; slug: string; excerpt: string; content: string
  category: string; tags: string[]; meta_title: string; meta_description: string
  related_food_slugs: string[]
}> {
  let result: { content: string; excerpt: string }

  switch (topic.templateType) {
    case "food-calories":
      result = await templateFoodCalories(topic)
      break
    case "compare-foods":
      result = await templateCompareFoods(topic)
      break
    default:
      result = await templateGeneral(topic)
  }

  return {
    title: topic.title,
    slug: topic.slug,
    excerpt: result.excerpt.slice(0, 160),
    content: result.content,
    category: topic.category,
    tags: topic.tags,
    meta_title: `${topic.title} — CheckKal`.slice(0, 60),
    meta_description: result.excerpt.slice(0, 160),
    related_food_slugs: topic.compareSlugs || (topic.foodSlug ? [topic.foodSlug] : []),
  }
}
