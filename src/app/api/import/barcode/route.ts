import { NextRequest, NextResponse } from 'next/server'
import { getByBarcode, prepareForInsert } from '@/lib/pipeline'

/**
 * GET /api/import/barcode?code=8850999220017
 * Look up food by barcode (via Open Food Facts)
 */
export async function GET(request: NextRequest) {
  try {
    const barcode = request.nextUrl.searchParams.get('code')

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ barcode (code parameter)' },
        { status: 400 }
      )
    }

    const result = await getByBarcode(barcode)

    if (!result) {
      return NextResponse.json(
        { success: false, error: `ไม่พบข้อมูลสำหรับ barcode: ${barcode}` },
        { status: 404 }
      )
    }

    const { food, valid, warnings } = prepareForInsert(result)

    return NextResponse.json({
      success: true,
      data: {
        raw: result,
        normalized: food,
        valid,
        warnings,
      },
    })
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหา barcode',
      },
      { status: 500 }
    )
  }
}
