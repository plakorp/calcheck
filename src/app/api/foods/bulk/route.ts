import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { FoodInsert } from "@/types/database"

/**
 * POST /api/foods/bulk
 * Bulk insert multiple foods into Supabase
 * Body: { foods: Array<FoodInput> }
 */
export async function POST(request: NextRequest) {
  try {
    const { foods } = await request.json()

    if (!Array.isArray(foods) || foods.length === 0) {
      return NextResponse.json(
        { success: false, error: "foods array is required and must not be empty" },
        { status: 400 }
      )
    }

    if (foods.length > 500) {
      return NextResponse.json(
        { success: false, error: "Maximum 500 foods per request" },
        { status: 400 }
      )
    }

    // Generate slugs and prepare for insert
    const prepared = []
    const errors: { index: number; name: string; error: string }[] = []

    for (let i = 0; i < foods.length; i++) {
      const food = foods[i]

      // Validate required fields
      if (!food.name_th && !food.name_en) {
        errors.push({ index: i, name: "unknown", error: "name_th or name_en required" })
        continue
      }

      if (typeof food.calories !== "number" || food.calories < 0) {
        errors.push({
          index: i,
          name: food.name_th || food.name_en,
          error: "valid calories required",
        })
        continue
      }

      // Generate slug
      const baseSlug = (food.name_en || food.name_th)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0E00-\u0E7F-]/g, "") // keep Thai chars
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      const slug = baseSlug || `food-${Date.now()}-${i}`

      const item: FoodInsert = {
        name_th: food.name_th || "",
        name_en: food.name_en || null,
        slug: `${slug}-${Date.now().toString(36)}-${i}`,
        emoji: food.emoji || "🍽️",
        calories: food.calories,
        protein: food.protein || 0,
        fat: food.fat || 0,
        carbs: food.carbs || 0,
        fiber: food.fiber ?? null,
        sodium: food.sodium ?? null,
        sugar: food.sugar ?? null,
        serving_size: food.serving_size || "100g",
        serving_weight_g: food.serving_weight_g ?? null,
        category: food.category || "main",
        subcategory: food.subcategory || null,
        brand: food.brand || null,
        barcode: food.barcode || null,
        image_url: food.image_url || null,
        source: food.source || "excel-import",
        verified: food.verified ?? false,
        tags: Array.isArray(food.tags) ? food.tags : food.tags ? [food.tags] : [],
        created_by: null,
      }
      prepared.push(item)
    }

    if (prepared.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid foods to insert",
          errors,
        },
        { status: 400 }
      )
    }

    // Bulk insert — use 'as any' to work around Supabase generic constraints
    const { data, error } = await supabase.from("foods").insert(prepared as any).select()

    if (error) {
      console.error("Supabase bulk insert error:", error)
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${error.message}`,
          validationErrors: errors,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Inserted ${data.length} foods successfully`,
        inserted: data.length,
        skipped: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Bulk insert error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to bulk insert foods",
      },
      { status: 500 }
    )
  }
}
