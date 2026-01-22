import { NextRequest, NextResponse } from 'next/server'
import { SEED_VCS } from '@/lib/seed-data'
import { getEthosUserByTwitter } from '@/lib/ethos'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const withEthos = searchParams.get('withEthos') === 'true'

  let vcs = SEED_VCS.map((vc, i) => ({
    ...vc,
    id: `vc-${i}`,
    created_at: new Date().toISOString(),
  }))

  // Filter by category if provided
  if (category && category !== 'all') {
    vcs = vcs.filter(vc => vc.category === category)
  }

  // Optionally fetch Ethos scores (expensive, use caching in production)
  if (withEthos) {
    const enrichedVCs = await Promise.all(
      vcs.map(async (vc) => {
        const ethosUser = await getEthosUserByTwitter(vc.twitter_handle)
        return {
          ...vc,
          ethos_score: ethosUser?.score || null,
          ethos_profile_url: ethosUser?.links.profile || `https://app.ethos.network/profile/x/${vc.twitter_handle}`,
        }
      })
    )
    return NextResponse.json({ vcs: enrichedVCs })
  }

  return NextResponse.json({ vcs })
}
