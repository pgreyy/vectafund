import { EthosUser } from '@/types'

const ETHOS_API_BASE = 'https://api.ethos.network/api/v2'
const ETHOS_CLIENT_HEADER = 'VectaFund@1.0.0'

export async function getEthosUserByTwitter(twitterHandle: string): Promise<EthosUser | null> {
  try {
    // Remove @ if present
    const handle = twitterHandle.replace('@', '')
    
    const response = await fetch(`${ETHOS_API_BASE}/user/by/x/${handle}`, {
      headers: {
        'X-Ethos-Client': ETHOS_CLIENT_HEADER,
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Ethos API error: ${response.status}`)
    }

    const data: EthosUser = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching Ethos data for @${twitterHandle}:`, error)
    return null
  }
}

export async function getEthosUsersByTwitterHandles(handles: string[]): Promise<Map<string, EthosUser>> {
  const results = new Map<string, EthosUser>()
  
  // Batch fetch with concurrency limit
  const batchSize = 5
  for (let i = 0; i < handles.length; i += batchSize) {
    const batch = handles.slice(i, i + batchSize)
    const promises = batch.map(async (handle) => {
      const user = await getEthosUserByTwitter(handle)
      if (user) {
        results.set(handle.toLowerCase().replace('@', ''), user)
      }
    })
    await Promise.all(promises)
  }
  
  return results
}

export function getEthosScoreLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 1500) return 'high'
  if (score >= 800) return 'medium'
  return 'low'
}

export function getEthosProfileUrl(username: string): string {
  return `https://app.ethos.network/profile/${username}`
}

export function formatEthosScore(score: number): string {
  return score.toLocaleString()
}
