import { getPublishedPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog-data'
import { BLOG_CATEGORIES, type BlogCategoryKey } from '@/types/blog'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BlogContent from '@/components/BlogContent'
import AdUnit from '@/components/AdUnit'
import BlogCardImage from '@/components/BlogCardImage'
import { stripTitleEmoji } from '@/lib/blog-utils'
import { getFallbackCover } from '@/lib/blog-cover-fallback'

// Force dynamic rendering — Thai slugs + Supabase data need server-side
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const cleanTitle = stripTitleEmoji(post.meta_title || post.title)
  return {
    title: cleanTitle,
    description: post.meta_description || post.excerpt || undefined,
    alternates: {
      canonical: `https://www.checkkal.com/blog/${slug}`,
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post)
  const catKey = post.category as BlogCategoryKey
  const cat = BLOG_CATEGORIES[catKey] || { label: post.category, emoji: '📝' }
  const cleanTitle = stripTitleEmoji(post.title)

  // Structured data: Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: cleanTitle,
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
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: 'https://www.checkkal.com' },
      { '@type': 'ListItem', position: 2, name: 'บทความ', item: 'https://www.checkkal.com/blog' },
      { '@type': 'ListItem', position: 3, name: cleanTitle, item: `https://www.checkkal.com/blog/${post.slug}` },
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

      <div className="min-h-screen bg-[#fffefb]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
          {/* Breadcrumb */}
          <nav className="text-sm text-[#36342e] mb-8 flex items-center gap-1.5">
            <Link href="/" className="hover:underline transition-colors">
              หน้าแรก
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:underline transition-colors">
              บทความ
            </Link>
            <span>/</span>
            <span className="text-[#201515]">{cleanTitle}</span>
          </nav>

          {/* Cover image — always render with fallback */}
          <div className="mb-8 rounded-lg overflow-hidden h-[400px] bg-muted border border-[#c5c0b1]">
            <BlogCardImage
              src={post.cover_image_url}
              alt={cleanTitle}
              fallbackCategory={post.category}
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[36px] font-semibold text-[#201515] mb-6 tracking-[-0.5px]">{cleanTitle}</h1>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 items-center pb-8 border-b border-[#c5c0b1]">
              <span className="inline-block px-2.5 py-0.5 bg-[#fff4ed] text-[#201515] rounded-md text-[11px] font-medium border border-[#c5c0b1]">
                {cat.emoji} {cat.label}
              </span>
              {publishedDate && <span className="text-sm text-[#36342e]">{publishedDate}</span>}
              {post.author && <span className="text-sm text-[#36342e]">โดย {post.author}</span>}
              {post.view_count > 0 && <span className="text-sm text-[#36342e]">{post.view_count.toLocaleString('th-TH')} ครั้ง</span>}
            </div>

            {post.excerpt && (
              <p className="text-base text-[#36342e] mt-6 leading-relaxed">{post.excerpt}</p>
            )}
          </div>

          {/* Article content */}
          <article className="mb-8">
            <BlogContent content={post.content} />
          </article>

          {/* ── Ad: Below Article ──────────────────────────────────────────── */}
          <AdUnit slot="5546466602" className="my-8" />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-[12px] px-3 py-1 bg-[#f0ebe6] text-[#36342e] rounded-md border border-[#c5c0b1] hover:bg-[#e5dfd8] transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Related food links section */}
          {post.related_food_slugs && post.related_food_slugs.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-[#201515] mb-6 tracking-[-0.5px]">อาหารที่เกี่ยวข้อง</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {post.related_food_slugs.map(foodSlug => (
                  <Link
                    key={foodSlug}
                    href={`/food/${foodSlug}`}
                    className="p-4 rounded-lg border border-[#c5c0b1] bg-white"
                  >
                    <span className="text-sm font-medium text-[#201515] block mb-1">{foodSlug}</span>
                    <div className="text-[12px] text-[#36342e]">ดูข้อมูลอาหาร →</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related posts section */}
          {related.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-[#201515] mb-6 tracking-[-0.5px]">บทความที่เกี่ยวข้อง</h2>
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
                      className="flex flex-col h-full rounded-[8px] border border-border bg-card overflow-hidden hover:border-[#939084] transition-colors"
                    >
                      {/* Cover image with fallback */}
                      <div className="bg-muted h-40 w-full overflow-hidden">
                        <BlogCardImage
                          src={relatedPost.cover_image_url}
                          alt={stripTitleEmoji(relatedPost.title)}
                          fallbackCategory={relatedPost.category}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 px-4 pt-3.5 pb-4 flex flex-col">
                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#fff4ed] text-[#201515] border border-[#c5c0b1]">
                            {relatedCat.emoji} {relatedPost.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-[#201515] mb-2 line-clamp-2 text-[15px] leading-[22px]">
                          {stripTitleEmoji(relatedPost.title)}
                        </h3>

                        {/* Description */}
                        <p className="text-[12px] text-[#36342e] mb-4 line-clamp-2 flex-1">
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
          <div className="rounded-lg border border-[#c5c0b1] bg-white p-6 text-center mb-12">
            <p className="text-base text-[#201515] font-semibold mb-3">อยากอ่านบทความอื่น?</p>
            <Link href="/blog" className="text-[#ff4f00] font-medium hover:underline">
              ดูบทความทั้งหมด →
            </Link>
          </div>

          {/* Source/update info */}
          <div className="text-xs text-[#a6b2ab] pt-6 border-t border-[#c5c0b1]">
            <p>อัพเดทล่าสุด: {new Date(post.updated_at).toLocaleDateString('th-TH')}</p>
          </div>
        </div>
      </div>
    </>
  )
}
