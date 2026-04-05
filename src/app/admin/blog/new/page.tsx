'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BLOG_CATEGORIES, type BlogCategoryKey } from '@/types/blog';

export default function BlogNewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general' as BlogCategoryKey,
    tags: '',
    meta_title: '',
    meta_description: '',
    cover_image_url: '',
    status: 'draft' as 'draft' | 'published',
    related_food_slugs: '',
  });

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0E00-\u0E7F\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const slug = generateSlug(formData.title);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title.trim()) {
      setError('กรุณากรอกชื่อเรื่อง');
      return;
    }

    if (!formData.content.trim()) {
      setError('กรุณากรอกเนื้อหา');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        slug,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 160),
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        cover_image_url: formData.cover_image_url,
        status: formData.status,
        related_food_slugs: formData.related_food_slugs
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      const data = await response.json();
      setCreatedPostId(data.id);
      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'general' as BlogCategoryKey,
        tags: '',
        meta_title: '',
        meta_description: '',
        cover_image_url: '',
        status: 'draft' as 'draft' | 'published',
        related_food_slugs: '',
      });

      setTimeout(() => {
        router.push(`/admin/blog/${data.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/blog" className="text-primary hover:underline mb-4 inline-block">
            ← ย้อนกลับ
          </Link>
          <h1 className="text-3xl font-bold text-foreground">สร้างบทความใหม่</h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
            <p className="font-medium">บทความสร้างสำเร็จ! กำลังเปลี่ยนไปที่หน้าแก้ไข...</p>
            {createdPostId && (
              <Link href={`/admin/blog/${createdPostId}`} className="text-green-600 hover:underline">
                ไปที่บทความ
              </Link>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">ชื่อเรื่อง</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="เช่น 10 อาหารแคลอรี่ต่ำ"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {slug && (
                <p className="text-xs text-muted-foreground mt-2">
                  Slug: <code className="bg-muted px-2 py-1 rounded">{slug}</code>
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">เนื้อหา</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="เขียนเนื้อหาบทความที่นี่..."
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[400px] resize-none"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">บทสรุป</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="บทสรุปสั้นๆ ของบทความ (ถ้าว่างจะใช้ 160 ตัวอักษรแรกของเนื้อหา)"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
              />
            </div>

            {/* Grid: Category + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">หมวดหมู่</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(BLOG_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">สถานะ</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">ร่าง</option>
                  <option value="published">เผยแพร่แล้ว</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                แท็ก (คั่นด้วยจุลภาค)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="เช่น โปรตีน, แคลอรี่, ลดน้ำหนัก"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">URL รูปปก</label>
              <input
                type="url"
                name="cover_image_url"
                value={formData.cover_image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* SEO Section */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">SEO</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    placeholder="ชื่อที่แสดงใน Search Result"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.meta_title.length}/60 (ดีระหว่าง 30-60 ตัวอักษร)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    placeholder="คำอธิบายที่แสดงใน Search Result"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.meta_description.length}/160 (ดีระหว่าง 120-160 ตัวอักษร)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Slug อาหารที่เกี่ยวข้อง (คั่นด้วยจุลภาค)
                  </label>
                  <input
                    type="text"
                    name="related_food_slugs"
                    value={formData.related_food_slugs}
                    onChange={handleChange}
                    placeholder="เช่น kai-dao, khao-man-gai, pad-thai"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    สำหรับ internal linking ไปหน้าอาหาร
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกบทความ'}
            </button>
            <Link
              href="/admin/blog"
              className="flex-1 bg-muted text-muted-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted/80 transition text-center"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
