import { getPublishedPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog-data'
import { BLOG_CATEGORIES, type BlogCategoryKey } from '@/types/blog'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

// Force dynamic rendering — Thai slugs + Supabase data need server-side
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
  }
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post)
  const catKey = post.category as BlogCategoryKey
  const cat = BLOG_CATEGORIES[catKey] || { label: post.category, emoji: '📝' }

  // Structured data: Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.meta_description,
    image: post.cover_image_url || undefined,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: 'https://calcheck.com' },
      { '@type': 'ListItem', position: 2, name: 'บทความ', item: 'https://calcheck.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://calcheck.com/blog/${post.slug}` },
    ],
  }

  // Format date in Thai locale
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-background">
        <div className="max-w-[1024px] mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
            <Link href="/" className="hover:text-foreground transition-colors">
              หน้าแรก
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              บทความ
            </Link>
            <span>/</span>
            <span className="text-foreground">{post.title}</span>
          </nav>

          {/* Cover image */}
          {post.cover_image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden h-[400px] bg-muted">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                width={1024}
                height={400}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[36px] font-bold text-foreground mb-6">{post.title}</h1>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 items-center pb-8 border-b border-border">
              <span className="inline-block px-2.5 py-0.5 bg-secondary text-primary rounded-md text-[11px] font-medium">
                {cat.emoji} {cat.label}
              </span>
              {publishedDate && <span className="text-sm text-muted-foreground">{publishedDate}</span>}
              {post.author && <span className="text-sm text-muted-foreground">โดย {post.author}</span>}
              {post.view_count > 0 && <span className="text-sm text-muted-foreground">👁️ {post.view_count.toLocaleString('th-TH')} ครั้ง</span>}
            </div>

            {post.excerpt && (
              <p className="text-base text-muted-foreground mt-6 leading-relaxed">{post.excerpt}</p>
            )}
          </div>

          {/* Article content */}
          <div className="prose prose-sm max-w-none mb-8 text-foreground">
            <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
              {post.content}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-[12px] px-3 py-1 bg-secondary text-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Related food links section */}
          {post.related_food_slugs && post.related_food_slugs.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-bold text-foreground mb-6">อาหารที่เกี่ยวข้อง</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {post.related_food_slugs.map(foodSlug => (
                  <Link
                    key={foodSlug}
                    href={`/food/${foodSlug}`}
                    className="p-4 rounded-2xl border border-[#e5ede8] bg-card hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <span className="text-sm font-medium text-foreground block mb-1">{foodSlug}</span>
                    <div className="text-[12px] text-muted-foreground">ดูข้อมูลอาหาร →</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related posts section */}
          {related.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-bold text-foreground mb-6">บทความที่เกี่ยวข้อง</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map(relatedPost => {
                  const relatedCat = BLOG_CATEGORIES[relatedPost.category as BlogCategoryKey] || {
                    label: relatedPost.category,
                    emoji: '📝',
                  }
                  return (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="flex flex-col h-full rounded-2xl border border-[#e5ede8] bg-card overflow-hidden shadow-[0px_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
                    >
                      {/* Emoji placeholder */}
                      <div className="bg-muted h-40 w-full flex items-center justify-center">
                        <span className="text-6xl">{relatedCat.emoji}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 px-4 pt-3.5 pb-4 flex flex-col">
                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-primary">
                            {relatedCat.emoji} {relatedPost.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-[15px] leading-[22px]">
                          {relatedPost.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[12px] text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {relatedPost.excerpt || 'ไม่มีบรรยายสั้น'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* CTA section */}
          <div className="rounded-2xl border border-[#e5ede8] bg-card p-6 text-center mb-12">
            <p className="text-base text-foreground font-semibold mb-3">อยากอ่านบทความอื่น?</p>
            <Link href="/blog" className="text-primary font-medium hover:underline">
              ดูบทความทั้งหมด →
            </Link>
          </div>

          {/* Source/update info */}
          <div className="text-xs text-[#a6b2ab] pt-6 border-t border-border">
            <p>อัพเดทล่าสุด: {new Date(post.updated_at).toLocaleDateString('th-TH')}</p>
          </div>
        </div>
      </div>
    </>
  )
}
