import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { CATEGORIES } from "@/types/database"
import type { Food } from "@/types/database"

export const metadata = {
  title: "Admin Dashboard",
}

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  // Fetch from Supabase
  const { data: foods, error } = await supabase
    .from("foods")
    .select("*")
    .order("created_at", { ascending: false })

  const allFoods = (foods || []) as Food[]
  const recentFoods = allFoods.slice(0, 10)
  const verifiedCount = allFoods.filter((f) => f.verified).length
  const pendingCount = allFoods.length - verifiedCount

  // Count by category
  const categoryCounts: Record<string, number> = {}
  allFoods.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          จัดการฐานข้อมูลอาหาร CheckKal
          {error && (
            <span className="text-destructive ml-2">(Supabase error: {error.message})</span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-3xl font-bold text-primary">{allFoods.length}</div>
          <p className="text-muted-foreground text-sm mt-1">อาหารทั้งหมด</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-3xl font-bold text-green-600">{verifiedCount}</div>
          <p className="text-muted-foreground text-sm mt-1">ยืนยันแล้ว</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          <p className="text-muted-foreground text-sm mt-1">รอตรวจสอบ</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-3xl font-bold text-blue-600">
            {Object.keys(categoryCounts).length}
          </div>
          <p className="text-muted-foreground text-sm mt-1">หมวดหมู่</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold text-foreground mb-3">จำนวนตามหมวดหมู่</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span>{emoji}</span>
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground ml-auto">
                {categoryCounts[key] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/add"
            className="block bg-primary text-primary-foreground p-4 rounded-lg hover:opacity-90 transition-opacity text-center font-medium"
          >
            ➕ Add Food
          </Link>
          <Link
            href="/admin/upload"
            className="block bg-primary text-primary-foreground p-4 rounded-lg hover:opacity-90 transition-opacity text-center font-medium"
          >
            📸 Upload Photo
          </Link>
          <Link
            href="/admin/csv"
            className="block bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            📥 Import CSV/Excel
          </Link>
          <Link
            href="/admin/import"
            className="block bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
          >
            🌍 Import จาก API
          </Link>
        </div>
      </div>

      {/* Recent foods */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          อาหารล่าสุด ({allFoods.length} รายการ)
        </h2>
        {recentFoods.length > 0 ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-secondary-foreground">
                    ชื่ออาหาร
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-secondary-foreground">
                    แคลอรี่
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-secondary-foreground">
                    P / F / C
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-secondary-foreground">
                    หมวด
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-secondary-foreground">
                    Source
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-secondary-foreground">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <span className="mr-2">{food.emoji}</span>
                      {food.name_th}
                      {food.brand && (
                        <span className="text-muted-foreground ml-1">({food.brand})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {food.calories} kcal
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                      {food.protein}g / {food.fat}g / {food.carbs}g
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                      {CATEGORIES[food.category as keyof typeof CATEGORIES]?.emoji || ""}{" "}
                      {food.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{food.source}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {food.verified ? (
                        <span className="inline-block px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">ยังไม่มีอาหารในฐานข้อมูล</p>
            <Link
              href="/admin/add"
              className="text-primary hover:underline mt-2 inline-block text-sm font-medium"
            >
              เพิ่มอาหารแรก →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
