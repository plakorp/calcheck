/**
 * Upload food images to Supabase Storage & update DB
 *
 * Usage:
 *   1. Save photos to calcheck/images/ folder:
 *      - heinz-tomato-ketchup.jpg
 *      - zest-gold-margarine-fresh-butter.jpg
 *   2. Run: node --env-file=.env.local scripts/upload-food-images.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET = 'food-images'
const IMAGE_DIR = path.join(__dirname, '..', 'images')

const foods = [
  { slug: 'heinz-tomato-ketchup', file: 'heinz-tomato-ketchup.jpg' },
  { slug: 'zest-gold-margarine-fresh-butter', file: 'zest-gold-margarine-fresh-butter.jpg' },
]

async function main() {
  // 1. Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) { console.error('❌ Create bucket failed:', error.message); process.exit(1) }
    console.log('✅ Created bucket:', BUCKET)
  }

  // 2. Upload each image & update DB
  for (const food of foods) {
    const filePath = path.join(IMAGE_DIR, food.file)

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Skip ${food.file} — file not found in images/`)
      continue
    }

    const fileBuffer = fs.readFileSync(filePath)
    const storagePath = `${food.slug}.jpg`

    // Upload (upsert)
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadErr) {
      console.error(`❌ Upload ${food.slug}:`, uploadErr.message)
      continue
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)

    const imageUrl = urlData.publicUrl
    console.log(`✅ Uploaded: ${imageUrl}`)

    // Update DB
    const { error: dbErr } = await supabase
      .from('foods')
      .update({ image_url: imageUrl })
      .eq('slug', food.slug)

    if (dbErr) {
      console.error(`❌ DB update ${food.slug}:`, dbErr.message)
    } else {
      console.log(`✅ Updated DB: ${food.slug}`)
    }
  }

  console.log('\n🎉 Done!')
}

main()
