#!/usr/bin/env node
/**
 * USDA FoodData Central Importer — CheckKal
 *
 * Pulls Foundation Foods + SR Legacy (raw, well-vetted ingredients) from USDA
 * FoodData Central API into Supabase `foods` table.
 *
 * Idempotent: upserts by fdc_id. Safe to re-run.
 *
 * Prereq: run scripts/add-fdc-id-column.sql in Supabase SQL Editor once.
 *
 * Run: node scripts/import-usda.mjs
 *
 * Env vars (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   USDA_API_KEY               ← https://fdc.nal.usda.gov/api-key-signup
 *
 * Flags:
 *   --dry-run         fetch + map but don't write to DB
 *   --max-pages=N     stop after N pages (default 50)
 *   --page-size=N     items per page (default 200, max 200)
 *   --start-page=N    resume from page N (default 1)
 *   --data-type=X     Foundation | SR Legacy | both (default: both)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ---------- load .env.local ----------
function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[m[1]]) process.env[m[1]] = val
    }
  } catch (e) {
    console.warn('⚠️  could not read .env.local:', e.message)
  }
}
loadEnv()

// ---------- args ----------
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const MAX_PAGES = parseInt(args.find(a => a.startsWith('--max-pages='))?.split('=')[1] || '50', 10)
const PAGE_SIZE = parseInt(args.find(a => a.startsWith('--page-size='))?.split('=')[1] || '200', 10)
const START_PAGE = parseInt(args.find(a => a.startsWith('--start-page='))?.split('=')[1] || '1', 10)
const DATA_TYPE = args.find(a => a.startsWith('--data-type='))?.split('=')[1] || 'both'

// ---------- env ----------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const USDA_KEY = process.env.USDA_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
if (!USDA_KEY) {
  console.error('❌ Missing USDA_API_KEY in .env.local')
  console.error('   Sign up free: https://fdc.nal.usda.gov/api-key-signup')
  process.exit(1)
}

const supabase = DRY_RUN ? null : createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// ---------- Thai translation dictionary (common words) ----------
// Fallback: if no match, use EN name as name_th (user can fix later via admin panel)
const THAI_DICT = {
  // proteins
  'chicken': 'ไก่', 'chicken breast': 'อกไก่', 'chicken thigh': 'น่องไก่', 'chicken wing': 'ปีกไก่',
  'chicken leg': 'ขาไก่', 'chicken liver': 'ตับไก่', 'chicken skin': 'หนังไก่',
  'beef': 'เนื้อวัว', 'ground beef': 'เนื้อวัวบด', 'beef steak': 'สเต๊กเนื้อ', 'beef liver': 'ตับวัว',
  'pork': 'หมู', 'ground pork': 'หมูบด', 'pork belly': 'หมูสามชั้น', 'pork chop': 'สันคอหมู',
  'pork loin': 'สันในหมู', 'pork rib': 'ซี่โครงหมู', 'bacon': 'เบคอน', 'ham': 'แฮม',
  'sausage': 'ไส้กรอก', 'hot dog': 'ฮอตดอก',
  'lamb': 'เนื้อแกะ', 'mutton': 'เนื้อแพะ', 'duck': 'เป็ด', 'turkey': 'ไก่งวง',
  'fish': 'ปลา', 'salmon': 'แซลมอน', 'tuna': 'ทูน่า', 'cod': 'ปลาคอด', 'tilapia': 'ปลานิล',
  'mackerel': 'ปลาทู', 'sardine': 'ปลาซาร์ดีน', 'anchovy': 'ปลากะตัก', 'trout': 'ปลาเทราต์',
  'shrimp': 'กุ้ง', 'prawn': 'กุ้ง', 'lobster': 'ล็อบสเตอร์', 'crab': 'ปู',
  'squid': 'ปลาหมึก', 'octopus': 'ปลาหมึกยักษ์', 'clam': 'หอยลาย', 'oyster': 'หอยนางรม',
  'mussel': 'หอยแมลงภู่', 'scallop': 'หอยเชลล์',
  'egg': 'ไข่', 'egg white': 'ไข่ขาว', 'egg yolk': 'ไข่แดง', 'quail egg': 'ไข่นกกระทา',
  'tofu': 'เต้าหู้', 'tempeh': 'เทมเป้',

  // dairy
  'milk': 'นม', 'whole milk': 'นมสด', 'skim milk': 'นมพร่องมันเนย',
  'yogurt': 'โยเกิร์ต', 'greek yogurt': 'กรีกโยเกิร์ต',
  'cheese': 'ชีส', 'cheddar': 'เชดดาร์', 'mozzarella': 'มอซซาเรลล่า',
  'parmesan': 'พาร์เมซาน', 'feta': 'เฟต้า', 'cream cheese': 'ครีมชีส',
  'butter': 'เนย', 'ghee': 'เนยใส', 'cream': 'ครีม', 'sour cream': 'ซาวครีม',
  'ice cream': 'ไอศกรีม',

  // vegetables
  'broccoli': 'บร็อคโคลี่', 'cauliflower': 'กะหล่ำดอก', 'cabbage': 'กะหล่ำปลี',
  'lettuce': 'ผักกาดหอม', 'spinach': 'ผักขม', 'kale': 'คะน้า', 'bok choy': 'ผักกวางตุ้ง',
  'carrot': 'แครอท', 'cucumber': 'แตงกวา', 'tomato': 'มะเขือเทศ', 'eggplant': 'มะเขือยาว',
  'onion': 'หัวหอม', 'garlic': 'กระเทียม', 'shallot': 'หอมแดง', 'scallion': 'ต้นหอม',
  'leek': 'กระเทียมต้น', 'ginger': 'ขิง', 'galangal': 'ข่า', 'lemongrass': 'ตะไคร้',
  'bell pepper': 'พริกหยวก', 'chili': 'พริก', 'chili pepper': 'พริก',
  'celery': 'ขึ้นฉ่าย', 'asparagus': 'หน่อไม้ฝรั่ง', 'bamboo shoot': 'หน่อไม้',
  'mushroom': 'เห็ด', 'shiitake': 'เห็ดหอม', 'oyster mushroom': 'เห็ดนางรม',
  'corn': 'ข้าวโพด', 'sweet corn': 'ข้าวโพดหวาน', 'pea': 'ถั่วลันเตา',
  'green bean': 'ถั่วฝักยาว', 'long bean': 'ถั่วฝักยาว', 'bean sprout': 'ถั่วงอก',
  'okra': 'กระเจี๊ยบ', 'pumpkin': 'ฟักทอง', 'squash': 'ฟัก', 'zucchini': 'ซุกินี',
  'potato': 'มันฝรั่ง', 'sweet potato': 'มันเทศ', 'taro': 'เผือก', 'yam': 'มันเทศ',
  'radish': 'หัวไชเท้า', 'turnip': 'หัวผักกาด', 'beet': 'บีทรูท', 'beetroot': 'บีทรูท',

  // fruits
  'apple': 'แอปเปิ้ล', 'banana': 'กล้วย', 'orange': 'ส้ม', 'mandarin': 'ส้มจีน',
  'grape': 'องุ่น', 'strawberry': 'สตรอเบอร์รี่', 'blueberry': 'บลูเบอร์รี่',
  'raspberry': 'ราสเบอร์รี่', 'blackberry': 'แบล็กเบอร์รี่', 'cranberry': 'แครนเบอร์รี่',
  'watermelon': 'แตงโม', 'cantaloupe': 'แคนตาลูป', 'honeydew': 'เมลอน', 'melon': 'เมลอน',
  'pineapple': 'สับปะรด', 'mango': 'มะม่วง', 'papaya': 'มะละกอ', 'guava': 'ฝรั่ง',
  'lychee': 'ลิ้นจี่', 'longan': 'ลำไย', 'rambutan': 'เงาะ', 'durian': 'ทุเรียน',
  'mangosteen': 'มังคุด', 'dragon fruit': 'แก้วมังกร', 'passion fruit': 'เสาวรส',
  'jackfruit': 'ขนุน', 'coconut': 'มะพร้าว', 'lime': 'มะนาว', 'lemon': 'เลมอน',
  'pear': 'ลูกแพร์', 'peach': 'ลูกพีช', 'plum': 'ลูกพลัม', 'cherry': 'เชอร์รี่',
  'apricot': 'แอปริคอท', 'avocado': 'อะโวคาโด', 'kiwi': 'กีวี', 'fig': 'มะเดื่อ',
  'date': 'อินทผลัม', 'raisin': 'ลูกเกด', 'pomegranate': 'ทับทิม',

  // grains & carbs
  'rice': 'ข้าว', 'white rice': 'ข้าวสวย', 'brown rice': 'ข้าวกล้อง', 'jasmine rice': 'ข้าวหอมมะลิ',
  'sticky rice': 'ข้าวเหนียว', 'glutinous rice': 'ข้าวเหนียว',
  'bread': 'ขนมปัง', 'white bread': 'ขนมปังขาว', 'whole wheat bread': 'ขนมปังโฮลวีท',
  'toast': 'ขนมปังปิ้ง', 'bagel': 'เบเกิล', 'croissant': 'ครัวซองต์',
  'pasta': 'พาสต้า', 'spaghetti': 'สปาเก็ตตี้', 'macaroni': 'มักกะโรนี',
  'noodle': 'เส้นก๋วยเตี๋ยว', 'rice noodle': 'เส้นก๋วยเตี๋ยวข้าว', 'egg noodle': 'บะหมี่',
  'vermicelli': 'วุ้นเส้น', 'udon': 'อุด้ง', 'soba': 'โซบะ', 'ramen': 'ราเมง',
  'oat': 'ข้าวโอ๊ต', 'oatmeal': 'ข้าวโอ๊ต', 'quinoa': 'ควินัว', 'barley': 'ข้าวบาร์เลย์',
  'wheat': 'ข้าวสาลี', 'flour': 'แป้ง', 'cornmeal': 'แป้งข้าวโพด',
  'cereal': 'ซีเรียล', 'granola': 'กราโนล่า',

  // fats & oils
  'oil': 'น้ำมัน', 'olive oil': 'น้ำมันมะกอก', 'vegetable oil': 'น้ำมันพืช',
  'coconut oil': 'น้ำมันมะพร้าว', 'sesame oil': 'น้ำมันงา', 'palm oil': 'น้ำมันปาล์ม',
  'sunflower oil': 'น้ำมันดอกทานตะวัน', 'canola oil': 'น้ำมันคาโนล่า',
  'margarine': 'มาการีน', 'lard': 'น้ำมันหมู',

  // nuts & seeds
  'almond': 'อัลมอนด์', 'peanut': 'ถั่วลิสง', 'cashew': 'มะม่วงหิมพานต์',
  'walnut': 'วอลนัท', 'pistachio': 'พิสตาชิโอ', 'pecan': 'พีแคน',
  'hazelnut': 'เฮเซลนัท', 'macadamia': 'แมคคาเดเมีย', 'chestnut': 'เกาลัด',
  'sunflower seed': 'เมล็ดทานตะวัน', 'pumpkin seed': 'เมล็ดฟักทอง',
  'sesame seed': 'งา', 'chia seed': 'เมล็ดเจีย', 'flaxseed': 'เมล็ดแฟลกซ์',

  // legumes
  'bean': 'ถั่ว', 'black bean': 'ถั่วดำ', 'kidney bean': 'ถั่วแดง', 'pinto bean': 'ถั่วแระ',
  'navy bean': 'ถั่วขาว', 'chickpea': 'ถั่วลูกไก่', 'garbanzo': 'ถั่วลูกไก่',
  'lentil': 'ถั่วเลนทิล', 'soybean': 'ถั่วเหลือง', 'edamame': 'ถั่วแระญี่ปุ่น',

  // drinks
  'water': 'น้ำ', 'tea': 'ชา', 'green tea': 'ชาเขียว', 'black tea': 'ชาดำ',
  'coffee': 'กาแฟ', 'juice': 'น้ำผลไม้', 'orange juice': 'น้ำส้ม', 'apple juice': 'น้ำแอปเปิ้ล',
  'soda': 'น้ำอัดลม', 'cola': 'โคล่า', 'beer': 'เบียร์', 'wine': 'ไวน์',

  // sweets
  'sugar': 'น้ำตาล', 'honey': 'น้ำผึ้ง', 'maple syrup': 'น้ำเชื่อมเมเปิ้ล',
  'chocolate': 'ช็อกโกแลต', 'dark chocolate': 'ดาร์กช็อกโกแลต', 'candy': 'ลูกอม',
  'cookie': 'คุกกี้', 'cake': 'เค้ก', 'pie': 'พาย', 'donut': 'โดนัท',
  'muffin': 'มัฟฟิน', 'brownie': 'บราวนี่', 'pudding': 'พุดดิ้ง', 'jelly': 'เยลลี่',
  'jam': 'แยม', 'peanut butter': 'เนยถั่ว',

  // misc
  'soup': 'ซุป', 'salad': 'สลัด', 'sandwich': 'แซนวิช', 'pizza': 'พิซซ่า',
  'burger': 'เบอร์เกอร์', 'taco': 'ทาโก้', 'sushi': 'ซูชิ',
  'salt': 'เกลือ', 'pepper': 'พริกไทย', 'vinegar': 'น้ำส้มสายชู',
  'soy sauce': 'ซีอิ๊ว', 'fish sauce': 'น้ำปลา', 'oyster sauce': 'น้ำมันหอย',
  'ketchup': 'ซอสมะเขือเทศ', 'mayonnaise': 'มายองเนส', 'mustard': 'มัสตาร์ด',
}

// Translate first 1-3 word match. Fallback = English as-is.
function translateToThai(nameEn) {
  if (!nameEn) return null
  const lower = nameEn.toLowerCase()
  // Try longest matches first (3-word, 2-word, 1-word)
  const words = lower.split(/[\s,]+/)
  for (let len = Math.min(3, words.length); len >= 1; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ')
      if (THAI_DICT[phrase]) return THAI_DICT[phrase]
    }
  }
  return nameEn // fallback
}

// ---------- USDA foodCategory → CheckKal category ----------
// USDA uses categories like "Poultry Products", "Vegetables and Vegetable Products", etc.
function mapCategory(foodCategory, description = '') {
  const cat = (foodCategory || '').toLowerCase()
  const desc = description.toLowerCase()

  if (/beverage|drink|juice|water|tea|coffee|soda/.test(cat) || /juice|drink|tea|coffee/.test(desc)) return 'drink'
  if (/dairy|milk|cheese|yogurt|cream/.test(cat)) return 'dairy'
  if (/poultry|beef|pork|lamb|meat|finfish|shellfish|fish|sausage|egg/.test(cat)) return 'protein'
  if (/fruit/.test(cat)) return 'fruit'
  if (/vegetable|legume/.test(cat)) return 'vegetable'
  if (/snack|sweet|dessert|baked|candy|chocolate/.test(cat)) return 'snack'
  if (/cereal|grain|rice|pasta|bread|flour/.test(cat)) return 'carb'
  if (/fat|oil|butter/.test(cat)) return 'fat'
  if (/soup|meal|mixed dish/.test(cat)) return 'main'

  // fallback by description
  if (/chicken|beef|pork|fish|shrimp|egg/.test(desc)) return 'protein'
  if (/rice|bread|pasta|noodle/.test(desc)) return 'carb'
  return 'main'
}

// ---------- slug generator ----------
function slugify(s) {
  if (!s) return ''
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ---------- USDA nutrient lookup ----------
// /foods/list returns legacy format: { number: "208", name: "Energy", amount: 123, unitName: "KCAL" }
// /foods/search returns modern format: { nutrientId: 1008, value: 123 }
// We match on BOTH NDB number (string) and nutrientId (number) to be robust.
const NUTRIENT_MAP = {
  energy:  { numbers: ['208', '957', '2047', '2048'], ids: [1008, 2047, 2048], preferUnit: 'KCAL' },
  protein: { numbers: ['203'], ids: [1003] },
  fat:     { numbers: ['204'], ids: [1004] },
  carbs:   { numbers: ['205'], ids: [1005] },
  fiber:   { numbers: ['291'], ids: [1079] },
  sodium:  { numbers: ['307'], ids: [1093] }, // mg
  sugar:   { numbers: ['269'], ids: [2000, 1063] },
}

function getNutrient(foodNutrients, key) {
  if (!Array.isArray(foodNutrients)) return null
  const spec = NUTRIENT_MAP[key]
  if (!spec) return null

  // For energy, prefer KCAL unit (skip kJ entries labeled "208" that might differ)
  const candidates = foodNutrients.filter(n => {
    const num = String(n.number ?? n.nutrient?.number ?? '')
    const id = n.nutrientId ?? n.nutrient?.id
    return spec.numbers.includes(num) || (id && spec.ids.includes(id))
  })

  if (candidates.length === 0) return null

  // Prefer KCAL for energy
  if (spec.preferUnit) {
    const preferred = candidates.find(n => (n.unitName || '').toUpperCase() === spec.preferUnit)
    if (preferred) {
      const v = preferred.amount ?? preferred.value
      if (typeof v === 'number' && Number.isFinite(v)) return v
    }
  }

  for (const n of candidates) {
    const v = n.amount ?? n.value
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return null
}

function mapFood(f) {
  const calories = getNutrient(f.foodNutrients, 'energy')
  if (!calories || calories <= 0) return null

  const nameEn = (f.description || '').trim()
  if (!nameEn) return null

  const fdcId = String(f.fdcId || '').trim()
  if (!fdcId) return null

  const nameTh = translateToThai(nameEn)
  const baseSlug = slugify(nameEn) || `food-${fdcId}`
  const slug = `${baseSlug}-usda${fdcId}`

  return {
    name_th: nameTh || nameEn,
    name_en: nameEn,
    slug,
    emoji: null,
    calories: Math.round(calories * 100) / 100,
    protein: getNutrient(f.foodNutrients, 'protein') ?? 0,
    fat: getNutrient(f.foodNutrients, 'fat') ?? 0,
    carbs: getNutrient(f.foodNutrients, 'carbs') ?? 0,
    fiber: getNutrient(f.foodNutrients, 'fiber'),
    sodium: getNutrient(f.foodNutrients, 'sodium'), // already mg
    sugar: getNutrient(f.foodNutrients, 'sugar'),
    serving_size: '100g',
    serving_weight_g: 100,
    category: mapCategory(f.foodCategory, nameEn),
    subcategory: f.dataType || null,
    brand: null,
    barcode: null,
    fdc_id: fdcId,
    image_url: null,
    source: 'usda',
    verified: true,
    tags: f.foodCategory ? [f.foodCategory.toLowerCase()] : null,
  }
}

// ---------- fetcher ----------
async function fetchPage(page, attempt = 1) {
  // /foods/list endpoint — returns array of foods with nutrients
  const dataType = DATA_TYPE === 'both'
    ? 'Foundation,SR%20Legacy'
    : encodeURIComponent(DATA_TYPE)
  const url = `https://api.nal.usda.gov/fdc/v1/foods/list?dataType=${dataType}&pageSize=${PAGE_SIZE}&pageNumber=${page}&api_key=${USDA_KEY}`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CheckKal-Importer/1.0 (https://checkkal.com)' },
      signal: AbortSignal.timeout(30000),
    })
    if (res.status === 429 || res.status === 503 || res.status === 502 || res.status === 504) {
      throw new Error(`HTTP ${res.status} at page ${page} (retryable)`)
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} at page ${page}: ${body.slice(0, 200)}`)
    }
    return res.json()
  } catch (e) {
    if (attempt < 4) {
      const backoff = Math.pow(2, attempt) * 1000
      console.log(`   ⏳ page ${page} attempt ${attempt} failed (${e.message}), retrying in ${backoff/1000}s...`)
      await new Promise(r => setTimeout(r, backoff))
      return fetchPage(page, attempt + 1)
    }
    throw e
  }
}

// ---------- main ----------
async function main() {
  console.log('🥗 CheckKal — USDA FoodData Central importer')
  console.log(`   mode      : ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   data type : ${DATA_TYPE}`)
  console.log(`   page range: ${START_PAGE} → max ${START_PAGE + MAX_PAGES - 1}`)
  console.log(`   page size : ${PAGE_SIZE}`)
  console.log('')

  let totalFetched = 0
  let totalMapped = 0
  let totalSkipped = 0
  let totalUpserted = 0
  let totalErrors = 0

  for (let page = START_PAGE; page < START_PAGE + MAX_PAGES; page++) {
    let data
    try {
      data = await fetchPage(page)
    } catch (e) {
      console.error(`❌ fetch page ${page} failed:`, e.message)
      totalErrors++
      if (totalErrors > 10) {
        console.error('   too many errors, stopping.')
        break
      }
      await new Promise(r => setTimeout(r, 5000))
      continue
    }

    const foods = Array.isArray(data) ? data : (data.foods || [])
    if (foods.length === 0) {
      console.log(`✅ page ${page}: empty — reached end.`)
      break
    }

    totalFetched += foods.length
    const mapped = []
    const seenFdcIds = new Set()
    for (const f of foods) {
      const m = mapFood(f)
      if (!m) { totalSkipped++; continue }
      if (seenFdcIds.has(m.fdc_id)) { totalSkipped++; continue } // dedup within batch
      seenFdcIds.add(m.fdc_id)
      mapped.push(m)
    }
    totalMapped += mapped.length

    if (!DRY_RUN && mapped.length > 0) {
      const { error, count } = await supabase
        .from('foods')
        .upsert(mapped, { onConflict: 'fdc_id', ignoreDuplicates: false, count: 'exact' })

      if (error) {
        console.error(`❌ upsert page ${page}:`, error.message)
        totalErrors++
      } else {
        totalUpserted += count ?? mapped.length
      }
    }

    console.log(`page ${page}: fetched=${foods.length} mapped=${mapped.length} skipped=${foods.length - mapped.length} total_upserted=${totalUpserted}`)

    // USDA allows 1000 req/hour — 1 req/sec is safe
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log('')
  console.log('📊 Summary')
  console.log(`   fetched : ${totalFetched}`)
  console.log(`   mapped  : ${totalMapped}`)
  console.log(`   skipped : ${totalSkipped}  (no calories / no name / duplicate)`)
  console.log(`   upserted: ${totalUpserted}  ${DRY_RUN ? '(dry run)' : ''}`)
  console.log(`   errors  : ${totalErrors}`)
}

main().catch(e => {
  console.error('💥 fatal:', e)
  process.exit(1)
})
