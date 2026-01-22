import { NextRequest, NextResponse } from 'next/server'
import { SEED_FUNDRAISES } from '@/lib/seed-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '20')
  const sortBy = searchParams.get('sortBy') || 'date' // 'date' or 'ethos_score'

  let fundraises = SEED_FUNDRAISES.map((f, i) => ({
    ...f,
    id: `fundraise-${i}`,
    created_at: f.announced_date,
    total_ethos_score: 0, // Would be calculated from investor scores
  }))

  // Sort by date (newest first) by default
  fundraises.sort((a, b) => 
    new Date(b.announced_date).getTime() - new Date(a.announced_date).getTime()
  )

  // Limit results
  fundraises = fundraises.slice(0, limit)

  return NextResponse.json({ fundraises })
}
