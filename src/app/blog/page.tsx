import { getPublishedPosts } from '@/lib/blog-data'
import { BLOG_CATEGORIES, type BlogCategoryKey } from '@/types/blog'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'บทความสุขภาพ & โภชนาการ | CalCheck',
  description: 'บทความเกี่ยวกับโภชนาการ แคลอรี่ เคล็ดลับลดน้ำหนัก เปรียบเทียบอาหาร และแผนมื้ออาหาร สำหรับคนรักสุขภาพ',
}

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams

  // Get all published posts
  let posts = await getPublishedPosts()

  // Filter by category if specified
  if (category && category in BLOG_CATEGORIES) {
    posts = posts.filter(post => post.category === category)
  }

  // Format date in Thai locale
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // Get placeholder gradient colors for missing cover images
  const getGradient = (index: number) => {
    const gradients = [
      'from-green-100 to-emerald-100',
      'from-blue-100 to-cyan-100',
      'from-purple-100 to-pink-100',
      'from-orange-100 to-red-100',
      'from-yellow-100 to-amber-100',
      'from-indigo-100 to-purple-100',
    ]
    return gradients[index % gradients.length]
  }

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://calcheck.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'บทความ',
        item: 'https://calcheck.com/blog',
      },
    ],
  }

  // Blog collection schema
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CalCheck Blog',
    description: 'บทความสุขภาพและโภชนาการ',
    url: 'https://calcheck.com/blog',
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.meta_description || post.excerpt,
      image: post.cover_image_url || 'https://calcheck.com/og-image.png',
      datePublished: post.published_at,
      dateModified: post.updated_at,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      articleBody: post.content,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-green-50 to-background py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              📚 บทความสุขภาพ & โภชนาการ
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              รวมบทความเกี่ยวกับโภชนาการ แคลอรี่ เคล็ดลับลดน้ำหนัก การออกกำลังกาย และเลือกอาหารให้ถูกต้อง
              สำหรับคนรักสุขภาพ
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Category Filter Chips */}
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
              หมวดหมู่
            </h2>
            <div className="flex flex-wrap gap-2 pb-4 overflow-x-auto">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                  !category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                ทั้งหมด
              </Link>
              {Object.entries(BLOG_CATEGORIES).map(([key, value]) => (
                <Link
                  key={key}
                  href={`/blog?category=${key}`}
                  className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                    category === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {value.emoji} {value.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Posts Grid or Empty State */}
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl font-semibold text-foreground mb-2">
                ยังไม่มีบทความ
              </p>
              <p className="text-lg text-muted-foreground">
                กำลังเตรียมเนื้อหาดีๆ ให้อ่านเร็วๆ นี้
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-sm text-muted-foreground">
                พบบทความ {posts.length}篇{category && ` ในหมวดหมู่ ${BLOG_CATEGORIES[category as BlogCategoryKey]?.label}`}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => {
                  const categoryLabel =
                    Object.entries(BLOG_CATEGORIES).find(
                      ([, v]) => v.label === post.category
                    )?.[1] || null
                  const gradient = getGradient(index)

                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden hover:border-primary hover:shadow-md transition-all"
                    >
                      {/* Cover Image or Placeholder */}
                      <div
                        className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl ${
                          post.cover_image_url ? '' : 'opacity-60'
                        }`}
                      >
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl">
                            {categoryLabel?.emoji || '📝'}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col">
                        {/* Category Badge */}
                        {categoryLabel && (
                          <div className="mb-2">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {categoryLabel.emoji} {post.category}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2 text-lg hover:text-primary transition-colors">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {post.excerpt ||
                            'ไม่มีบรรยายสั้น'}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                          <time dateTime={post.published_at || ''}>
                            {post.published_at ? formatDate(post.published_at) : 'ไม่ระบุวันที่'}
                          </time>
                          <span>
                            โดย {post.author}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
