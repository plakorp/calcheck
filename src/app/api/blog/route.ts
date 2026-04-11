import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { BlogPost, BlogPostInsert } from "@/types/blog"
import { pingIndexNow, urlsForBlogSlug } from "@/lib/indexnow"

/**
 * GET /api/blog
 * Returns published blog posts
 * Supports filtering by category with ?category query param
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")

    let supabaseQuery = supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })

    // Filter by category if provided
    if (category) {
      supabaseQuery = supabaseQuery.eq("category", category)
    }

    const { data, error } = await supabaseQuery

    if (error) {
      console.error("Supabase error fetching blog posts:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch blog posts",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: (data || []) as BlogPost[],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blog posts",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/blog
 * Create a new blog post (admin only)
 * Generates slug, handles duplicates, validates required fields
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Blog title is required",
        },
        { status: 400 }
      )
    }

    if (!body.content || typeof body.content !== "string" || body.content.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Blog content is required",
        },
        { status: 400 }
      )
    }

    // Generate slug from title using specified logic
    let slug = body.title
      .toLowerCase()
      .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, "") // Remove non-Thai/English/number/space/-
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/-+/g, "-") // Replace multiple dashes with single dash
      .trim()
      .replace(/^-|-$/g, "") // Remove leading/trailing dashes

    const baseSlug = slug
    let counter = 2
    let isDuplicate = true

    // Check for duplicate slug
    while (isDuplicate) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", slug)
        .single()

      if (error && error.code === "PGRST116") {
        // No matching record found (404 error code)
        isDuplicate = false
      } else if (!error && !data) {
        isDuplicate = false
      } else if (error && error.code !== "PGRST116") {
        throw error
      } else {
        // Slug exists, try with counter
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Prepare insert data
    const now = new Date().toISOString()
    const insertData: any = {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt || null,
      category: body.category || "general",
      tags: body.tags || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      cover_image_url: body.cover_image_url || null,
      related_food_slugs: body.related_food_slugs || null,
      author: body.author || "admin",
      status: body.status || "draft",
      created_at: now,
      updated_at: now,
    }

    // If status is published and no published_at provided, set it to now
    if (insertData.status === "published" && !body.published_at) {
      insertData.published_at = now
    } else if (body.published_at) {
      insertData.published_at = body.published_at
    }

    // Insert new blog post
    const { data, error } = await supabase
      .from("blog_posts")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Supabase error inserting blog post:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to insert blog post into database",
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Ping IndexNow for freshly published posts (fire-and-forget)
    const savedPost = data as { status?: string; slug?: string } | null
    if (savedPost?.status === "published" && savedPost?.slug) {
      pingIndexNow(urlsForBlogSlug(savedPost.slug))
    }

    return NextResponse.json(
      {
        success: true,
        message: `Blog post "${body.title}" created successfully`,
        data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create blog post",
      },
      { status: 500 }
    )
  }
}
