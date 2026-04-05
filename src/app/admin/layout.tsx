import Link from "next/link"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin mode banner */}
      <div className="bg-destructive text-destructive-foreground py-2 px-4 text-center text-sm font-medium">
        ⚙️ Admin Mode — ข้อมูลนี้สำหรับผู้ดูแลเท่านั้น
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="text-lg font-bold text-primary mb-8">Admin Panel</h2>
            <nav className="space-y-1">
              <Link
                href="/admin"
                className="block px-4 py-2.5 rounded-md text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm font-medium"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/add"
                className="block px-4 py-2.5 rounded-md text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm font-medium"
              >
                ➕ Add Food
              </Link>
              <Link
                href="/admin/upload"
                className="block px-4 py-2.5 rounded-md text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm font-medium"
              >
                📸 Upload Photo
              </Link>
              <Link
                href="/admin/csv"
                className="block px-4 py-2.5 rounded-md text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm font-medium"
              >
                📥 Import CSV
              </Link>
              <Link
                href="/admin/import"
                className="block px-4 py-2.5 rounded-md text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm font-medium"
              >
                🌍 Import API
              </Link>
              <Link
                href="/admin/blog"
                className="block px-4 py-2.5 rounded-md text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm font-medium"
              >
                ✍️ Blog
              </Link>
            </nav>
          </div>

          {/* Back to site */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <Link
              href="/"
              className="block px-4 py-2 rounded-md border border-border text-center text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
