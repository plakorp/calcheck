import { NextRequest, NextResponse } from 'next/server'
import { search, searchAll, prepareForInsert, SOURCE_META } from '@/lib/pipeline'
import type { DataSource } from '@/lib/pipeline'

/**
 * GET /api/import/search?q=ไข่ดาว&source=openfoodfacts&page=1
 * Search external food databases
 *
 * Query params:
 * - q: search query (required)
 * - source: 'openfoodfacts' | 'fatsecret' | 'usda' | 'all' (default: 'all')
 * - page: page number (default: 1)
 * - pageSize: results per page (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const query = params.get('q')
    const source = params.get('source') || 'all'
    const page = parseInt(params.get('page') || '1', 10)
    const pageSize = parseInt(params.get('pageSize') || '20', 10)

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุคำค้นหา (q parameter)' },
        { status: 400 }
      )
    }

    // Search all sources
    if (source === 'all') {
      const { results, errors } = await searchAll(query, pageSize)
      return NextResponse.json({
        success: true,
        data: results.map((r) => ({
          source: r.source,
          sourceId: r.sourceId,
          name: r.name,
          brand: r.brand,
          barcode: r.barcode,
          imageUrl: r.imageUrl,
          calories: r.calories,
          protein: r.protein,
          fat: r.fat,
          carbs: r.carbs,
          servingSize: r.servingSize,
          normalized: r.normalized,
        })),
        total: results.length,
        errors: errors.length > 0 ? errors : undefined,
        sources: Object.entries(SOURCE_META).map(([key, meta]) => ({
          id: key,
          ...meta,
        })),
      })
    }

    // Search specific source
    const validSources: DataSource[] = ['openfoodfacts', 'fatsecret', 'usda']
    if (!validSources.includes(source as DataSource)) {
      return NextResponse.json(
        { success: false, error: `Source ไม่ถูกต้อง: ${source}. ใช้ได้: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    const response = await search(source as DataSource, query, page, pageSize)

    // Normalize results
    const normalized = response.results.map((raw) => {
      const { food, valid, warnings } = prepareForInsert(raw)
      return {
        source: raw.source,
        sourceId: raw.sourceId,
        name: raw.name,
        brand: raw.brand,
        barcode: raw.barcode,
        imageUrl: raw.imageUrl,
        calories: raw.calories,
        protein: raw.protein,
        fat: raw.fat,
        carbs: raw.carbs,
        servingSize: raw.servingSize,
        normalized: food,
        valid,
        warnings,
      }
    })

    return NextResponse.json({
      success: true,
      data: normalized,
      total: response.total,
      page: response.page,
      pageSize: response.pageSize,
      source: response.source,
    })
  } catch (error) {
    console.error('Import search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหา',
      },
      { status: 500 }
    )
  }
}
