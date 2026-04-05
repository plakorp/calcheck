import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAllFoods } from "@/lib/food-data"
import type { Food } from "@/types/database"

/**
 * GET /api/foods
 * Returns all foods from Supabase
 * Supports filtering by category and search query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const query = searchParams.get("q")

    let supabaseQuery = supabase.from("foods").select("*")

    // Filter by category if provided
    if (category) {
      supabaseQuery = supabaseQuery.eq("category", category)
    }

    // Filter by search query if provided
    if (query && query.trim().length > 0) {
      supabaseQuery = supabaseQuery.or(
        `name_th.ilike.%${query}%,name_en.ilike.%${query}%,brand.ilike.%${query}%`
      )
    }

    const { data, error } = await supabaseQuery

    if (error) {
      console.error("Supabase error fetching foods:", error)
      // Fallback to static data
      const foods = await getAllFoods()
      let filtered = foods

      if (category) {
        filtered = filtered.filter((f) => f.category === category)
      }

      if (query) {
        const q = query.toLowerCase()
        filtered = filtered.filter(
          (f) =>
            f.name_th.toLowerCase().includes(q) ||
            (f.name_en && f.name_en.toLowerCase().includes(q)) ||
            (f.brand && f.brand.toLowerCase().includes(q))
        )
      }

      return NextResponse.json({
        success: true,
        data: filtered,
        total: filtered.length,
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching foods:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch foods",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/foods
 * Add a new food to Supabase
 * Generates slug, handles duplicates, and validates data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name_th && !body.name_en) {
      return NextResponse.json(
        {
          success: false,
          error: "Food name (Thai or English) is required",
        },
        { status: 400 }
      )
    }

    if (typeof body.calories !== "number" || body.calories < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid calories value is required",
        },
        { status: 400 }
      )
    }

    // Generate slug from name
    const baseSlug = (body.name_en || body.name_th)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")

    // Check for duplicate slug
    let slug = baseSlug
    let counter = 1
    let isDuplicate = true

    while (isDuplicate) {
      const { data, error } = await supabase
        .from("foods")
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

    // Insert new food
    const { data, error } = await supabase
      .from("foods")
      .insert({
        ...body,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verified: false, // New submissions start unverified
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error inserting food:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to insert food into database",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Food "${body.name_th || body.name_en}" added successfully`,
        data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding food:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add food",
      },
      { status: 500 }
    )
  }
}
