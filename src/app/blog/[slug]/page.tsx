import { getPublishedPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog-data'
import { BLOG_CATEGORIES, type BlogCategoryKey } from '@/types/blog'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

// SSG: generate all blog pages at build time
export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map(post => ({ slug: post.slug }))
}

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

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-foreground">
            หน้าแรก
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground">
            บทความ
          </Link>
          <span>/</span>
          <span className="text-foreground">{post.title}</span>
        </nav>

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden aspect-video bg-card">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              width={800}
              height={450}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl">{cat.emoji}</span>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
              {post.excerpt && <p className="text-muted-foreground text-lg">{post.excerpt}</p>}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 items-center text-sm text-muted-foreground">
            <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
              {cat.label}
            </span>
            {publishedDate && <span>{publishedDate}</span>}
            {post.author && <span>โดย {post.author}</span>}
            {post.view_count > 0 && <span>👁️ {post.view_count.toLocaleString('th-TH')} ครั้ง</span>}
          </div>
        </div>

        {/* Article content — render with prose styling */}
        <div className="prose prose-sm max-w-none mb-8 text-foreground">
          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {post.content}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-primary/10 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Related food links section */}
        {post.related_food_slugs && post.related_food_slugs.length > 0 && (
          <section className="mb-8 p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-bold mb-4">อาหารที่เกี่ยวข้อง</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.related_food_slugs.map(foodSlug => (
                <Link
                  key={foodSlug}
                  href={`/food/${foodSlug}`}
                  className="p-3 rounded-lg border border-border bg-background hover:border-primary transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{foodSlug}</span>
                  <div className="text-xs text-muted-foreground mt-1">ดูข้อมูลอาหาร →</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related posts section */}
        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">บทความที่เกี่ยวข้อง</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map(relatedPost => {
                const relatedCat = BLOG_CATEGORIES[relatedPost.category as BlogCategoryKey] || {
                  label: relatedPost.category,
                  emoji: '📝',
                }
                return (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span>{relatedCat.emoji}</span>
                      <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                        {relatedCat.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{relatedPost.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* CTA — internal link to blog listing */}
        <div className="p-4 rounded-lg bg-secondary text-center">
          <p className="text-sm text-secondary-foreground mb-2">อยากอ่านบทความอื่น?</p>
          <Link href="/blog" className="text-primary font-medium hover:underline">
            ดูบทความทั้งหมด →
          </Link>
        </div>

        {/* Source/update info */}
        <div className="mt-8 text-xs text-muted-foreground">
          <p>อัพเดทล่าสุด: {new Date(post.updated_at).toLocaleDateString('th-TH')}</p>
        </div>
      </div>
    </>
  )
}
