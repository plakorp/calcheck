import Link from "next/link"
import { getAllFoods } from "@/lib/food-data"

export const metadata = {
  title: "Admin Dashboard",
}

export default async function AdminDashboard() {
  const foods = await getAllFoods()
  const recentFoods = foods.slice(-5).reverse()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">ยินดีต้อนรับ Korn — จัดการฐานข้อมูลอาหาร CalCheck</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-primary">{foods.length}</div>
          <p className="text-muted-foreground text-sm mt-2">อาหารทั้งหมด</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-primary">{foods.filter((f) => f.verified).length}</div>
          <p className="text-muted-foreground text-sm mt-2">ข้อมูลที่ยืนยันแล้ว</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-primary">{foods.length - foods.filter((f) => f.verified).length}</div>
          <p className="text-muted-foreground text-sm mt-2">รอการตรวจสอบ</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/add"
            className="block bg-primary text-primary-foreground p-4 rounded-lg hover:opacity-90 transition-opacity text-center font-medium"
          >
            ➕ Add Food Manually
          </Link>
          <Link
            href="/admin/upload"
            className="block bg-primary text-primary-foreground p-4 rounded-lg hover:opacity-90 transition-opacity text-center font-medium"
          >
            📸 Upload Photo
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
        <h2 className="text-xl font-semibold text-foreground">Recent Foods Added</h2>
        {recentFoods.length > 0 ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-secondary-foreground">ชื่ออาหาร</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-secondary-foreground">แคลอรี่</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-secondary-foreground">หมวดหมู่</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-secondary-foreground">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <span className="mr-2">{food.emoji}</span>
                      {food.name_th}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{food.calories} kcal</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{food.category}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {food.verified ? (
                        <span className="inline-block px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                          ⏳ Pending
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
            <Link href="/admin/add" className="text-primary hover:underline mt-2 inline-block text-sm font-medium">
              เพิ่มอาหารแรก →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
