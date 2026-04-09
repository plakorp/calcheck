#!/bin/bash
cd "$(dirname "$0")"
echo "📦 Pushing to GitHub → Vercel auto-deploy..."
git push origin main
echo ""
echo "✅ Done! Vercel กำลัง deploy อยู่ครับ"
echo "🔗 https://www.checkkal.com"
read -p "Press Enter to close..."
