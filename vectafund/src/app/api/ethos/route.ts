import { NextRequest, NextResponse } from 'next/server'
import { getEthosUserByTwitter } from '@/lib/ethos'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const twitter = searchParams.get('twitter')

  if (!twitter) {
    return NextResponse.json(
      { error: 'Twitter handle is required' },
      { status: 400 }
    )
  }

  try {
    const ethosUser = await getEthosUserByTwitter(twitter)
    
    if (!ethosUser) {
      return NextResponse.json(
        { 
          found: false,
          message: 'User not found on Ethos',
          profileUrl: `https://app.ethos.network/profile/x/${twitter}`
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      found: true,
      user: {
        score: ethosUser.score,
        displayName: ethosUser.displayName,
        username: ethosUser.username,
        avatarUrl: ethosUser.avatarUrl,
        profileUrl: ethosUser.links.profile,
        stats: {
          reviews: ethosUser.stats.review.received,
          vouches: ethosUser.stats.vouch.received,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching Ethos data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Ethos data' },
      { status: 500 }
    )
  }
}
