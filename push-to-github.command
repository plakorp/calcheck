#!/bin/bash
# ============================================
# CalCheck — Push to GitHub (ดับเบิลคลิกเพื่อรัน)
# ============================================

cd "$(dirname "$0")"

echo "🚀 กำลัง push CalCheck ขึ้น GitHub..."
echo ""

# ลบ .next ที่ไม่จำเป็น
rm -rf .next

# ตั้งค่า git
git init
git add .
git commit -m "Initial commit: CalCheck nutrition website

- Next.js 16 + React 19 + Tailwind CSS 4
- 50+ Thai foods with full nutrition data
- Food detail, search, compare, category pages
- Admin panel (manual entry, photo upload, Excel import, API import)
- Data pipeline: Open Food Facts, FatSecret, USDA integration
- Full SEO: structured data, sitemap, robots.txt
- Programmatic SEO: 119 pre-rendered pages"

git branch -M main
git remote add origin https://github.com/plakorp/calcheck.git
git push -u origin main

echo ""
echo "✅ Push สำเร็จ! ปิดหน้าต่างนี้ได้เลย"
read -p "กด Enter เพื่อปิด..."
