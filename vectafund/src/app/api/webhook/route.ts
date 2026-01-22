import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// Ethos scores for demo
const mockEthosScores: Record<string, number> = {
  'a16zcrypto': 1892,
  'paradigm': 1847,
  'polychain': 1654,
  'dragonfly_xyz': 1789,
  'hiframework': 1678,
  'multicoin': 1456,
  'panteracapital': 1345,
  'sequoia': 1423,
  'binancelabs': 1234,
}

// Mock fundraises
const mockFundraises = [
  { project: 'Monad', amount: '$225M', lead: 'Paradigm', score: 1847 },
  { project: 'Berachain', amount: '$100M', lead: 'Framework Ventures', score: 1678 },
  { project: 'Farcaster', amount: '$150M', lead: 'Paradigm', score: 1847 },
  { project: 'EigenLayer', amount: '$100M', lead: 'a16z Crypto', score: 1892 },
  { project: 'Story Protocol', amount: '$80M', lead: 'a16z Crypto', score: 1892 },
]

// Store user data in memory (resets on cold start - use database in production)
const userFollows: Record<number, string[]> = {}

async function sendMessage(chatId: number, text: string, options: Record<string, unknown> = {}) {
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not set')
    return
  }
  
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        ...options,
      }),
    })
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

function getScoreEmoji(score: number): string {
  if (score >= 1500) return '🟢'
  if (score >= 800) return '🟡'
  return '🔴'
}

async function handleCommand(chatId: number, text: string, username?: string) {
  const command = text.split(' ')[0].toLowerCase().replace('/', '')
  const args = text.split(' ').slice(1).join(' ').toLowerCase().replace('@', '')

  switch (command) {
    case 'start':
      userFollows[chatId] = userFollows[chatId] || []
      await sendMessage(chatId, `
🚀 *Welcome to VectaFund Bot!*

Track crypto fundraises from top VCs, powered by Ethos reputation scores.

*Commands:*
/follow <vc> - Follow a VC (e.g., /follow paradigm)
/unfollow <vc> - Unfollow a VC
/following - See your followed VCs
/latest - Get latest fundraises
/top - Top raises by Ethos score
/ethos <handle> - Check Ethos score
/help - Show this message

🌐 *Web App:* [vecta-fund.vercel.app](https://vecta-fund.vercel.app)

Start by following some VCs with /follow!
      `)
      break

    case 'help':
      await sendMessage(chatId, `
📚 *VectaFund Bot Commands*

*Following VCs:*
/follow <twitter\\_handle> - Follow a VC
/unfollow <twitter\\_handle> - Unfollow a VC  
/following - List your followed VCs

*Fundraises:*
/latest - Latest fundraise announcements
/top - Top raises ranked by Ethos score

*Info:*
/ethos <twitter\\_handle> - Check Ethos score
/help - Show this message

*Example:* /follow paradigm

🌐 *Web App:* [vecta-fund.vercel.app](https://vecta-fund.vercel.app)
      `)
      break

    case 'follow':
      if (!args) {
        await sendMessage(chatId, '❌ Please provide a VC handle.\n\nExample: `/follow paradigm`')
        return
      }
      
      userFollows[chatId] = userFollows[chatId] || []
      
      if (userFollows[chatId].length >= 5) {
        await sendMessage(chatId, '❌ You can only follow up to 5 VCs.\n\nUse /unfollow to remove one first.')
        return
      }
      
      if (userFollows[chatId].includes(args)) {
        await sendMessage(chatId, `You're already following *@${args}*`)
        return
      }
      
      userFollows[chatId].push(args)
      const score = mockEthosScores[args]
      
      await sendMessage(chatId, `
✅ Now following *@${args}*

${score ? `Ethos Score: \`${score}\` ${getScoreEmoji(score)}` : '_No Ethos score available_'}

You'll receive alerts when they lead new investments.

Following: *${userFollows[chatId].length}/5* VCs
      `)
      break

    case 'unfollow':
      if (!args) {
        await sendMessage(chatId, '❌ Please provide a VC handle.\n\nExample: `/unfollow paradigm`')
        return
      }
      
      if (!userFollows[chatId]?.includes(args)) {
        await sendMessage(chatId, `You're not following *@${args}*`)
        return
      }
      
      userFollows[chatId] = userFollows[chatId].filter(vc => vc !== args)
      await sendMessage(chatId, `✅ Unfollowed *@${args}*`)
      break

    case 'following':
      const follows = userFollows[chatId] || []
      
      if (follows.length === 0) {
        await sendMessage(chatId, `
You're not following any VCs yet.

Use /follow <handle> to start.
Example: \`/follow paradigm\`
        `)
        return
      }
      
      const vcList = follows.map(vc => {
        const s = mockEthosScores[vc]
        return `• @${vc}${s ? ` - Ethos: ${s}` : ''}`
      }).join('\n')
      
      await sendMessage(chatId, `
📋 *Your Followed VCs (${follows.length}/5)*

${vcList}

Use /unfollow <handle> to remove.
      `)
      break

    case 'latest':
      let latestMsg = '📰 *Latest Fundraises*\n\n'
      
      mockFundraises.slice(0, 5).forEach((f, i) => {
        latestMsg += `*${i + 1}. ${f.project}* - ${f.amount}\n`
        latestMsg += `   Lead: ${f.lead} | Ethos: \`${f.score}\` ${getScoreEmoji(f.score)}\n\n`
      })
      
      latestMsg += '_Use /top for raises ranked by Ethos score_'
      
      await sendMessage(chatId, latestMsg)
      break

    case 'top':
      const sorted = [...mockFundraises].sort((a, b) => b.score - a.score)
      
      let topMsg = '🏆 *Top Raises by Ethos Score*\n\n'
      
      sorted.slice(0, 5).forEach((f, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
        topMsg += `${medal} *${f.project}* - ${f.amount}\n`
        topMsg += `   Lead: ${f.lead}\n`
        topMsg += `   Ethos Score: \`${f.score}\` ${getScoreEmoji(f.score)}\n\n`
      })
      
      topMsg += '\n🌐 [View on VectaFund](https://vecta-fund.vercel.app/dashboard)'
      
      await sendMessage(chatId, topMsg)
      break

    case 'ethos':
      if (!args) {
        await sendMessage(chatId, '❌ Please provide a Twitter handle.\n\nExample: `/ethos VitalikButerin`')
        return
      }
      
      const ethosScore = mockEthosScores[args] || Math.floor(Math.random() * 1200) + 400
      
      await sendMessage(chatId, `
🛡️ *Ethos Score for @${args}*

Score: \`${ethosScore}\` ${getScoreEmoji(ethosScore)}
Level: ${ethosScore >= 1500 ? '🟢 High Reputation' : ethosScore >= 800 ? '🟡 Medium Reputation' : '🔴 Low Reputation'}

[View Full Profile](https://app.ethos.network/profile/x/${args})
      `)
      break

    default:
      await sendMessage(chatId, `
❓ Unknown command: *${command}*

Type /help to see available commands.
      `)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle message updates
    if (body.message) {
      const { chat, text, from } = body.message
      
      if (text && text.startsWith('/')) {
        await handleCommand(chat.id, text, from?.username)
      }
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Failed to process update' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'VectaFund Telegram Bot Webhook',
    commands: ['/start', '/help', '/follow', '/unfollow', '/following', '/latest', '/top', '/ethos']
  })
}
