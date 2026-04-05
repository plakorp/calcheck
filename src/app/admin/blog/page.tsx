import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BLOG_CATEGORIES, type BlogCategoryKey, type BlogPost } from '@/types/blog';

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
  let posts: BlogPost[] = [];
  let error: string | null = null;

  try {
    const { data, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    posts = data || [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch posts';
  }

  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const getCategoryLabel = (key: string): string => {
    const cat = BLOG_CATEGORIES[key as BlogCategoryKey];
    return cat ? `${cat.emoji} ${cat.label}` : key;
  };

  const getStatusColor = (status: string): string => {
    if (status === 'published') return 'bg-green-100 text-green-800';
    if (status === 'draft') return 'bg-yellow-100 text-yellow-800';
    if (status === 'archived') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'published') return 'เผยแพร่แล้ว';
    if (status === 'draft') return 'ร่าง';
    if (status === 'archived') return 'เก็บถาวร';
    return status;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">จัดการบทความ</h1>
          <Link
            href="/admin/blog/new"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            เพิ่มบทความใหม่
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-gray-500 text-sm font-medium">รวม</div>
            <div className="text-2xl font-bold text-foreground mt-1">{totalPosts}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-gray-500 text-sm font-medium">เผยแพร่แล้ว</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{publishedCount}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-gray-500 text-sm font-medium">ร่าง</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{draftCount}</div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        {posts.length > 0 ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ชื่อเรื่อง</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">หมวดหมู่</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">สถานะ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">วันที่เผยแพร่</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ไป</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      <div className="line-clamp-2">{post.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {getCategoryLabel(post.category as BlogCategoryKey)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-muted-foreground">{post.view_count || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground text-lg mb-6">ยังไม่มีบทความ</p>
            <Link
              href="/admin/blog/new"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              สร้างบทความแรก
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
