import Parser from 'rss-parser'
import { FeedItem } from '@/types'

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description'],
  },
})

// Crypto news RSS feeds
const RSS_FEEDS = [
  { url: 'https://www.theblock.co/rss.xml', name: 'The Block' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk' },
  { url: 'https://cointelegraph.com/rss', name: 'Cointelegraph' },
  { url: 'https://decrypt.co/feed', name: 'Decrypt' },
]

// Keywords to identify fundraise announcements
const FUNDRAISE_KEYWORDS = [
  'raises',
  'raised',
  'funding',
  'series a',
  'series b',
  'series c',
  'seed round',
  'investment',
  'million',
  'venture',
  'backed by',
  'led by',
  'funding round',
  'capital raise',
  'strategic round',
]

export async function fetchRSSFeeds(): Promise<FeedItem[]> {
  const allItems: FeedItem[] = []

  for (const feed of RSS_FEEDS) {
    try {
      const result = await parser.parseURL(feed.url)
      
      const items: FeedItem[] = result.items.map((item) => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        content: item['content:encoded'] || item.content || '',
        contentSnippet: item.contentSnippet || '',
        source: feed.name,
      }))

      allItems.push(...items)
    } catch (error) {
      console.error(`Error fetching RSS feed from ${feed.name}:`, error)
    }
  }

  return allItems
}

export function filterFundraiseNews(items: FeedItem[]): FeedItem[] {
  return items.filter((item) => {
    const text = `${item.title} ${item.contentSnippet}`.toLowerCase()
    return FUNDRAISE_KEYWORDS.some((keyword) => text.includes(keyword))
  })
}

export function extractFundraiseDetails(item: FeedItem): {
  amount?: number
  currency: string
  roundType?: string
  projectName?: string
} {
  const text = `${item.title} ${item.contentSnippet}`
  
  // Extract amount
  const amountMatch = text.match(/\$(\d+(?:\.\d+)?)\s*(million|m|billion|b)/i)
  let amount: number | undefined
  if (amountMatch) {
    const num = parseFloat(amountMatch[1])
    const unit = amountMatch[2].toLowerCase()
    if (unit === 'billion' || unit === 'b') {
      amount = num * 1000000000
    } else {
      amount = num * 1000000
    }
  }

  // Extract round type
  let roundType: string | undefined
  if (/pre-seed/i.test(text)) roundType = 'pre-seed'
  else if (/seed/i.test(text)) roundType = 'seed'
  else if (/series\s*a/i.test(text)) roundType = 'series-a'
  else if (/series\s*b/i.test(text)) roundType = 'series-b'
  else if (/series\s*c/i.test(text)) roundType = 'series-c'
  else if (/strategic/i.test(text)) roundType = 'strategic'

  return {
    amount,
    currency: 'USD',
    roundType,
  }
}

export async function getFundraiseNews(): Promise<FeedItem[]> {
  const allItems = await fetchRSSFeeds()
  const fundraiseItems = filterFundraiseNews(allItems)
  
  // Sort by date (newest first)
  return fundraiseItems.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )
}
