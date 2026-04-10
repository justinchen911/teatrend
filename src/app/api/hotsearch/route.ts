import { NextRequest, NextResponse } from 'next/server'
import { fetchAllHotSearch } from '@/lib/scraper/hotsearch'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const result = fetchAllHotSearch()
    return NextResponse.json({
      ok: true,
      ...result,
      tea_count: result.tea.length,
    })
  } catch (e: any) {
    console.error('[hotsearch]', e.message)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
