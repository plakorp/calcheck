/**
 * Static food data — will be replaced by Supabase queries
 * This is a temporary data layer for Phase 1
 */

import type { Food } from '@/types/database'
import { generateSlug } from './slug'
import { supabase } from './supabase'

// Raw data — mapped to Food type
const RAW_FOODS: Omit<Food, 'id' | 'created_at' | 'updated_at' | 'slug'>[] = [
  // === Original basics ===
  { name_th: "ไข่ ไก่ ทั้งใบ", name_en: "whole-egg", emoji: "🥚", calories: 72, protein: 6.3, fat: 4.8, carbs: 0.4, fiber: null, sodium: null, sugar: null, serving_size: "1 large (50g)", serving_weight_g: 50, category: "protein", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ไข่", "โปรตีน"] },
  { name_th: "ไข่ขาว", name_en: "egg-white", emoji: "🥚", calories: 17, protein: 3.6, fat: 0.1, carbs: 0.2, fiber: null, sodium: null, sugar: null, serving_size: "1 large (33g)", serving_weight_g: 33, category: "protein", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ไข่", "โปรตีน", "low-fat"] },
  { name_th: "ข้าวขาว (ข้าวสวย)", name_en: "white-rice", emoji: "🍚", calories: 130, protein: 2.7, fat: 0.3, carbs: 28.2, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "carb", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ข้าว", "คาร์บ"] },
  { name_th: "อกไก่ สุก เนื้อล้วน", name_en: "chicken-breast-cooked", emoji: "🍗", calories: 157, protein: 32.1, fat: 3.2, carbs: 0, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "protein", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ไก่", "โปรตีนสูง", "คลีน", "ลดน้ำหนัก"] },
  { name_th: "กล้วยหอม", name_en: "banana", emoji: "🍌", calories: 100, protein: 1.1, fat: 0.3, carbs: 23, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "fruit", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ผลไม้", "พลังงาน"] },
  { name_th: "โยเกิร์ตกรีก ไร้ไขมัน", name_en: "greek-yogurt-nonfat", emoji: "🍦", calories: 59, protein: 10.2, fat: 0.4, carbs: 3.6, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "dairy", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["นม", "โปรตีน", "low-fat"] },
  { name_th: "หมูสันใน", name_en: "pork-tenderloin", emoji: "🥩", calories: 187, protein: 30.4, fat: 6.3, carbs: 0, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "protein", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["หมู", "โปรตีนสูง"] },
  { name_th: "ผักบุ้ง", name_en: "morning-glory", emoji: "🥦", calories: 25, protein: 2.6, fat: 0.2, carbs: 3.1, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "vegetable", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ผัก", "low-cal"] },
  { name_th: "ข้าวกล้อง", name_en: "brown-rice", emoji: "🍚", calories: 111, protein: 2.6, fat: 0.9, carbs: 23, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "carb", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ข้าว", "คลีน", "ไฟเบอร์"] },
  { name_th: "บะหมี่กึ่งสำเร็จรูป", name_en: "instant-noodles", emoji: "🍜", calories: 255, protein: 6, fat: 11, carbs: 33, fiber: null, sodium: null, sugar: null, serving_size: "1 pack", serving_weight_g: 60, category: "main", subcategory: "mama", brand: "มาม่า", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["มาม่า", "บะหมี่", "กึ่งสำเร็จรูป"] },
  { name_th: "เนยถั่ว สกิปปี้", name_en: "peanut-butter-skippy", emoji: "🥜", calories: 196, protein: 7, fat: 16, carbs: 6, fiber: null, sodium: null, sugar: null, serving_size: "2 tbsp (32g)", serving_weight_g: 32, category: "fat", subcategory: null, brand: "Skippy", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ถั่ว", "ไขมันดี"] },
  { name_th: "พิซซ่าฮัท เปปเปอโรนี่ แป้งหนา", name_en: "pizza-hut-pepperoni-thick", emoji: "🍕", calories: 329, protein: 13, fat: 14.8, carbs: 35.9, fiber: null, sodium: null, sugar: null, serving_size: "1 slice (113g)", serving_weight_g: 113, category: "main", subcategory: null, brand: "Pizza Hut", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["พิซซ่า", "ฟาสต์ฟู้ด"] },
  { name_th: "นมข้นหวาน", name_en: "sweetened-condensed-milk", emoji: "🥛", calories: 329, protein: 8, fat: 9, carbs: 54, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "dairy", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["นม", "หวาน"] },
  { name_th: "แครอท", name_en: "carrot", emoji: "🥕", calories: 46, protein: 0.9, fat: 0.2, carbs: 10, fiber: null, sodium: null, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "vegetable", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ผัก", "วิตามินเอ"] },
  { name_th: "Nutella", name_en: "nutella", emoji: "🍫", calories: 200, protein: 2, fat: 12, carbs: 21, fiber: null, sodium: null, sugar: null, serving_size: "2 tbsp (37g)", serving_weight_g: 37, category: "snack", subcategory: null, brand: "Nutella", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ช็อกโกแลต", "ขนม", "spread"] },

  // === 7-Eleven ===
  { name_th: "ข้าวไก่ทอดไข่ดาว 7-Eleven", name_en: "7-eleven-chicken-rice-egg", emoji: "🍚", calories: 385, protein: 16, fat: 11, carbs: 52, fiber: null, sodium: 720, sugar: null, serving_size: "1 กล่อง (320g)", serving_weight_g: 320, category: "main", subcategory: "7-eleven", brand: "7-Eleven", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["7-eleven", "ข้าว", "ไก่"] },
  { name_th: "แซนด์วิชแฮมชีส 7-Eleven", name_en: "7-eleven-ham-cheese-sandwich", emoji: "🥪", calories: 280, protein: 11, fat: 9, carbs: 38, fiber: null, sodium: 580, sugar: null, serving_size: "1 ชิ้น (125g)", serving_weight_g: 125, category: "main", subcategory: "7-eleven", brand: "7-Eleven", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["7-eleven", "แซนด์วิช"] },
  { name_th: "ไส้กรอก 7-Eleven", name_en: "7-eleven-sausage", emoji: "🌭", calories: 210, protein: 12, fat: 14, carbs: 4, fiber: null, sodium: 650, sugar: null, serving_size: "1 ชิ้น (60g)", serving_weight_g: 60, category: "main", subcategory: "7-eleven", brand: "7-Eleven", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["7-eleven", "ไส้กรอก"] },
  { name_th: "ซาลาเปาหมูสับ 7-Eleven", name_en: "7-eleven-salapao", emoji: "🥟", calories: 180, protein: 8, fat: 6, carbs: 24, fiber: null, sodium: 420, sugar: null, serving_size: "1 ลูก (80g)", serving_weight_g: 80, category: "main", subcategory: "7-eleven", brand: "7-Eleven", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["7-eleven", "ซาลาเปา"] },
  { name_th: "โอนิกิริ 7-Eleven", name_en: "7-eleven-onigiri", emoji: "🍙", calories: 150, protein: 7, fat: 3, carbs: 26, fiber: null, sodium: 380, sugar: null, serving_size: "1 ลูก (100g)", serving_weight_g: 100, category: "main", subcategory: "7-eleven", brand: "7-Eleven", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["7-eleven", "โอนิกิริ", "ข้าว"] },
  { name_th: "ขนมปังชีส 7-Fresh", name_en: "7-fresh-cheese-bread", emoji: "🥐", calories: 260, protein: 9, fat: 12, carbs: 32, fiber: null, sodium: 450, sugar: null, serving_size: "1 ชิ้น (85g)", serving_weight_g: 85, category: "snack", subcategory: "7-eleven", brand: "7-Eleven", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["7-eleven", "ขนมปัง", "ชีส"] },

  // === อาหารไทยยอดนิยม ===
  { name_th: "ข้าวมันไก่", name_en: "hainanese-chicken-rice", emoji: "🍗", calories: 420, protein: 28, fat: 15, carbs: 46, fiber: null, sodium: 680, sugar: null, serving_size: "1 จาน (300g)", serving_weight_g: 300, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ข้าว", "ไก่", "อาหารไทย"] },
  { name_th: "ข้าวขาหมู", name_en: "pork-leg-rice", emoji: "🍖", calories: 480, protein: 22, fat: 18, carbs: 55, fiber: null, sodium: 920, sugar: null, serving_size: "1 จาน (320g)", serving_weight_g: 320, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ข้าว", "หมู", "อาหารไทย"] },
  { name_th: "ผัดไทย", name_en: "pad-thai", emoji: "🍝", calories: 380, protein: 14, fat: 16, carbs: 45, fiber: null, sodium: 850, sugar: 8, serving_size: "1 จาน (260g)", serving_weight_g: 260, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["บะหมี่", "อาหารไทย", "กุ้ง"] },
  { name_th: "ส้มตำ", name_en: "som-tam", emoji: "🥗", calories: 85, protein: 4, fat: 5, carbs: 8, fiber: 2, sodium: 420, sugar: 3, serving_size: "1 จาน (150g)", serving_weight_g: 150, category: "vegetable", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["สลัด", "อาหารไทย", "อีสาน", "low-cal"] },
  { name_th: "ต้มยำกุ้ง", name_en: "tom-yum-goong", emoji: "🍲", calories: 65, protein: 8, fat: 2, carbs: 6, fiber: 1, sodium: 580, sugar: 2, serving_size: "1 ชาม (250ml)", serving_weight_g: 250, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ซุป", "อาหารไทย", "กุ้ง", "low-cal"] },
  { name_th: "แกงเขียวหวาน", name_en: "green-curry", emoji: "🥘", calories: 320, protein: 18, fat: 18, carbs: 22, fiber: 2, sodium: 640, sugar: 6, serving_size: "1 ชาม (280g)", serving_weight_g: 280, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["แกง", "อาหารไทย", "กะทิ"] },
  { name_th: "ข้าวผัด", name_en: "fried-rice", emoji: "🍚", calories: 350, protein: 10, fat: 14, carbs: 46, fiber: null, sodium: 720, sugar: null, serving_size: "1 จาน (250g)", serving_weight_g: 250, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ข้าว", "อาหารไทย"] },
  { name_th: "กะเพราหมูสับไข่ดาว", name_en: "pad-krapao-moo-kai-dao", emoji: "🍳", calories: 550, protein: 28, fat: 22, carbs: 58, fiber: null, sodium: 800, sugar: null, serving_size: "1 จาน (350g)", serving_weight_g: 350, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["หมู", "กะเพรา", "ไข่ดาว", "อาหารไทย"] },
  { name_th: "ข้าวซอย", name_en: "khao-soi", emoji: "🍜", calories: 410, protein: 16, fat: 18, carbs: 48, fiber: null, sodium: 780, sugar: 4, serving_size: "1 ชาม (320g)", serving_weight_g: 320, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["บะหมี่", "อาหารไทย", "เหนือ"] },
  { name_th: "ก๋วยเตี๋ยวเรือ", name_en: "boat-noodles", emoji: "🍜", calories: 300, protein: 18, fat: 12, carbs: 32, fiber: null, sodium: 680, sugar: null, serving_size: "1 ชาม (250g)", serving_weight_g: 250, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ก๋วยเตี๋ยว", "อาหารไทย"] },
  { name_th: "ผัดกะเพราไก่", name_en: "pad-krapao-gai", emoji: "🍖", calories: 280, protein: 24, fat: 12, carbs: 18, fiber: null, sodium: 600, sugar: null, serving_size: "1 จาน (200g)", serving_weight_g: 200, category: "main", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ไก่", "กะเพรา", "อาหารไทย"] },

  // === Fast food ===
  { name_th: "Big Mac McDonald's", name_en: "mcdonalds-big-mac", emoji: "🍔", calories: 553, protein: 26, fat: 30, carbs: 45, fiber: null, sodium: 1010, sugar: 8, serving_size: "1 ชิ้น (215g)", serving_weight_g: 215, category: "main", subcategory: null, brand: "McDonald's", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["burger", "ฟาสต์ฟู้ด"] },
  { name_th: "ไก่ทอด KFC ออริจินัล", name_en: "kfc-original-chicken", emoji: "🍗", calories: 320, protein: 28, fat: 17, carbs: 10, fiber: null, sodium: 640, sugar: null, serving_size: "1 ชิ้น (100g)", serving_weight_g: 100, category: "main", subcategory: null, brand: "KFC", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ไก่", "ทอด", "ฟาสต์ฟู้ด"] },
  { name_th: "มาม่าต้มยำ", name_en: "mama-tom-yum", emoji: "🍜", calories: 280, protein: 9, fat: 12, carbs: 36, fiber: null, sodium: 1050, sugar: null, serving_size: "1 ซอง (60g)", serving_weight_g: 60, category: "main", subcategory: "mama", brand: "มาม่า", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["มาม่า", "บะหมี่", "ต้มยำ"] },

  // === เครื่องดื่ม ===
  { name_th: "ชาเขียวอิชิตัน", name_en: "ichitan-green-tea", emoji: "🍵", calories: 70, protein: 0, fat: 0, carbs: 17, fiber: null, sodium: 40, sugar: 16, serving_size: "1 ขวด (420ml)", serving_weight_g: 420, category: "drink", subcategory: null, brand: "อิชิตัน", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ชา", "เขียว", "หวาน"] },
  { name_th: "โค้ก 330ml", name_en: "coca-cola-330ml", emoji: "🥤", calories: 139, protein: 0, fat: 0, carbs: 39, fiber: null, sodium: 40, sugar: 39, serving_size: "1 กระป๋อง (330ml)", serving_weight_g: 330, category: "drink", subcategory: null, brand: "Coca-Cola", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["น้ำอัดลม", "โค้ก", "หวาน"] },
  { name_th: "กาแฟลาเต้", name_en: "cafe-latte", emoji: "☕", calories: 150, protein: 8, fat: 6, carbs: 15, fiber: null, sodium: 120, sugar: 13, serving_size: "1 แก้ว (350ml)", serving_weight_g: 350, category: "drink", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["กาแฟ", "นม"] },
  { name_th: "นมจืด", name_en: "plain-milk", emoji: "🥛", calories: 150, protein: 8, fat: 8, carbs: 12, fiber: null, sodium: 120, sugar: 12, serving_size: "1 กล่อง (250ml)", serving_weight_g: 250, category: "dairy", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["นม", "แคลเซียม"] },
  { name_th: "น้ำส้มคั้น", name_en: "fresh-orange-juice", emoji: "🍊", calories: 112, protein: 1.7, fat: 0.5, carbs: 26, fiber: null, sodium: 5, sugar: 21, serving_size: "1 แก้ว (250ml)", serving_weight_g: 250, category: "drink", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["น้ำผลไม้", "ส้ม", "วิตามินซี"] },

  // === อาหารสุขภาพ ===
  { name_th: "อกไก่ย่าง", name_en: "grilled-chicken-breast", emoji: "🍗", calories: 165, protein: 34, fat: 3.6, carbs: 0, fiber: null, sodium: 60, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "protein", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ไก่", "โปรตีน", "คลีน", "ลดน้ำหนัก"] },
  { name_th: "สลัดผัก", name_en: "vegetable-salad", emoji: "🥗", calories: 65, protein: 3, fat: 4, carbs: 6, fiber: 2, sodium: 120, sugar: 2, serving_size: "1 จาน (150g)", serving_weight_g: 150, category: "vegetable", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["สลัด", "ผัก", "low-cal", "คลีน"] },
  { name_th: "เต้าหู้ขาว", name_en: "tofu", emoji: "⬜", calories: 76, protein: 8.1, fat: 4.8, carbs: 1.6, fiber: 0.4, sodium: 7, sugar: 0.4, serving_size: "100g", serving_weight_g: 100, category: "protein", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["เต้าหู้", "โปรตีน", "เวจ", "low-cal"] },
  { name_th: "ปลาแซลมอน", name_en: "salmon", emoji: "🐟", calories: 208, protein: 20, fat: 13, carbs: 0, fiber: null, sodium: 60, sugar: null, serving_size: "100g", serving_weight_g: 100, category: "protein", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ปลา", "โปรตีน", "โอเมก้า-3", "คลีน"] },

  // === ขนม ===
  { name_th: "เลย์ คลาสสิค", name_en: "lays-classic", emoji: "🥔", calories: 161, protein: 2.2, fat: 10.1, carbs: 15, fiber: null, sodium: 281, sugar: null, serving_size: "1 ซอง (35g)", serving_weight_g: 35, category: "snack", subcategory: null, brand: "Lay's", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["มันฝรั่ง", "ขนม", "เค็ม"] },
  { name_th: "ทาโร่", name_en: "taro-snack", emoji: "🟣", calories: 154, protein: 1.8, fat: 9.2, carbs: 16, fiber: null, sodium: 250, sugar: null, serving_size: "1 ซอง (30g)", serving_weight_g: 30, category: "snack", subcategory: null, brand: "Taro", barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ขนม", "เค็ม"] },
  { name_th: "โปรตีนบาร์", name_en: "protein-bar", emoji: "📦", calories: 200, protein: 20, fat: 7, carbs: 15, fiber: 3, sodium: 120, sugar: 1, serving_size: "1 แท่ง (60g)", serving_weight_g: 60, category: "snack", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["โปรตีน", "คลีน", "อาหารเสริม"] },

  // === ผลไม้ ===
  { name_th: "มะม่วงสุก", name_en: "ripe-mango", emoji: "🥭", calories: 60, protein: 0.8, fat: 0.4, carbs: 15, fiber: 1.6, sodium: 1, sugar: 14, serving_size: "100g", serving_weight_g: 100, category: "fruit", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ผลไม้", "มะม่วง", "หวาน"] },
  { name_th: "แตงโม", name_en: "watermelon", emoji: "🍉", calories: 30, protein: 0.6, fat: 0.2, carbs: 8, fiber: 0.4, sodium: 1, sugar: 6, serving_size: "100g", serving_weight_g: 100, category: "fruit", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ผลไม้", "low-cal", "ฉ่ำ"] },
  { name_th: "ส้ม", name_en: "orange", emoji: "🍊", calories: 47, protein: 0.9, fat: 0.1, carbs: 12, fiber: 2.4, sodium: null, sugar: 9, serving_size: "100g", serving_weight_g: 100, category: "fruit", subcategory: null, brand: null, barcode: null, image_url: null, source: "calforlife", verified: true, tags: ["ผลไม้", "วิตามินซี"] },
]

// Fallback static data (for when Supabase is unavailable)
const FALLBACK_FOODS: Food[] = RAW_FOODS.map((food, i) => ({
  ...food,
  id: `food-${i + 1}`,
  slug: food.name_en || generateSlug(food.name_th),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

/**
 * Get all foods from Supabase
 * Falls back to static data if Supabase is unavailable
 */
export async function getAllFoods(): Promise<Food[]> {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching foods:', error)
      return FALLBACK_FOODS
    }

    return data || FALLBACK_FOODS
  } catch (error) {
    console.error('Error fetching foods:', error)
    return FALLBACK_FOODS
  }
}

/**
 * Get a single food by slug
 * Falls back to static data if Supabase is unavailable
 */
export async function getFoodBySlug(slug: string): Promise<Food | null> {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error(`Supabase error fetching food by slug ${slug}:`, error)
      return FALLBACK_FOODS.find(f => f.slug === slug) || null
    }

    return data || null
  } catch (error) {
    console.error(`Error fetching food by slug ${slug}:`, error)
    return FALLBACK_FOODS.find(f => f.slug === slug) || null
  }
}

/**
 * Get foods by category
 * Falls back to static data if Supabase is unavailable
 */
export async function getFoodsByCategory(category: string): Promise<Food[]> {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('category', category)
      .order('name_th', { ascending: true })

    if (error) {
      console.error(`Supabase error fetching foods by category ${category}:`, error)
      return FALLBACK_FOODS.filter(f => f.category === category)
    }

    return data || []
  } catch (error) {
    console.error(`Error fetching foods by category ${category}:`, error)
    return FALLBACK_FOODS.filter(f => f.category === category)
  }
}

/**
 * Search foods by name, brand, or tags
 * Falls back to static data if Supabase is unavailable
 */
export async function searchFoods(query: string): Promise<Food[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .or(
        `name_th.ilike.%${query}%,name_en.ilike.%${query}%,brand.ilike.%${query}%`
      )
      .order('name_th', { ascending: true })

    if (error) {
      console.error('Supabase error searching foods:', error)
      const q = query.toLowerCase()
      return FALLBACK_FOODS.filter(f =>
        f.name_th.toLowerCase().includes(q) ||
        (f.name_en && f.name_en.toLowerCase().includes(q)) ||
        (f.brand && f.brand.toLowerCase().includes(q)) ||
        (f.tags && f.tags.some(t => t.toLowerCase().includes(q)))
      )
    }

    return data || []
  } catch (error) {
    console.error('Error searching foods:', error)
    const q = query.toLowerCase()
    return FALLBACK_FOODS.filter(f =>
      f.name_th.toLowerCase().includes(q) ||
      (f.name_en && f.name_en.toLowerCase().includes(q)) ||
      (f.brand && f.brand.toLowerCase().includes(q)) ||
      (f.tags && f.tags.some(t => t.toLowerCase().includes(q)))
    )
  }
}

/**
 * Get related foods (same category, limit results)
 * Falls back to static data if Supabase is unavailable
 */
export async function getRelatedFoods(food: Food, limit = 5): Promise<Food[]> {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('category', food.category)
      .neq('id', food.id)
      .limit(limit)

    if (error) {
      console.error('Supabase error fetching related foods:', error)
      return FALLBACK_FOODS
        .filter(f => f.id !== food.id && f.category === food.category)
        .slice(0, limit)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching related foods:', error)
    return FALLBACK_FOODS
      .filter(f => f.id !== food.id && f.category === food.category)
      .slice(0, limit)
  }
}
