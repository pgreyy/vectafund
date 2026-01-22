import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

const mockEthosScores: Record<string, number> = {
  'a16zcrypto': 1892, 'paradigm': 1847, 'polychain': 1654,
  'dragonfly_xyz': 1789, 'hiframework': 1678,
}

const mockFundraises = [
  { project: 'Monad', amount: '$225M', lead: 'Paradigm', score: 1847 },
  { project: 'Berachain', amount: '$100M', lead: 'Framework', score: 1678 },
  { project: 'Farcaster', amount: '$150M', lead: 'Paradigm', score: 1847 },
  { project: 'EigenLayer', amount: '$100M', lead: 'a16z', score: 1892 },
]

const userFollows: Record<number, string[]> = {}

async function sendMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true }),
  })
}

function getEmoji(score: number) {
  return score >= 1500 ? '🟢' : score >= 800 ? '🟡' : '🔴'
}

async function handleCommand(chatId: number, text: string) {
  const cmd = text.split(' ')[0].toLowerCase().replace('/', '')
  const args = text.split(' ').slice(1).join(' ').toLowerCase().replace('@', '')

  if (cmd === 'start' || cmd === 'help') {
    userFollows[chatId] = userFollows[chatId] || []
    await sendMessage(chatId, `🚀 *Welcome to VectaFund Bot!*\n\nTrack crypto fundraises powered by Ethos scores.\n\n*Commands:*\n/follow <vc> - Follow a VC\n/unfollow <vc> - Unfollow\n/following - Your VCs\n/latest - Latest raises\n/top - Top by Ethos\n/ethos <handle> - Check score\n\n🌐 [Web App](https://vecta-fund.vercel.app)`)
  } 
  else if (cmd === 'follow') {
    if (!args) { await sendMessage(chatId, '❌ Example: `/follow paradigm`'); return }
    userFollows[chatId] = userFollows[chatId] || []
    if (userFollows[chatId].length >= 5) { await sendMessage(chatId, '❌ Max 5 VCs. Use /unfollow first.'); return }
    if (userFollows[chatId].includes(args)) { await sendMessage(chatId, `Already following @${args}`); return }
    userFollows[chatId].push(args)
    const score = mockEthosScores[args]
    await sendMessage(chatId, `✅ Now following *@${args}*\n${score ? `Ethos: \`${score}\` ${getEmoji(score)}` : ''}\n\nFollowing: *${userFollows[chatId].length}/5*`)
  }
  else if (cmd === 'unfollow') {
    if (!args) { await sendMessage(chatId, '❌ Example: `/unfollow paradigm`'); return }
    if (!userFollows[chatId]?.includes(args)) { await sendMessage(chatId, `Not following @${args}`); return }
    userFollows[chatId] = userFollows[chatId].filter(v => v !== args)
    await sendMessage(chatId, `✅ Unfollowed *@${args}*`)
  }
  else if (cmd === 'following') {
    const f = userFollows[chatId] || []
    if (!f.length) { await sendMessage(chatId, `No VCs followed yet.\n\nTry: \`/follow paradigm\``); return }
    await sendMessage(chatId, `📋 *Following (${f.length}/5)*\n\n${f.map(v => `• @${v}`).join('\n')}`)
  }
  else if (cmd === 'latest') {
    let msg = '📰 *Latest Fundraises*\n\n'
    mockFundraises.forEach((f, i) => { msg += `*${i+1}. ${f.project}* - ${f.amount}\n   Lead: ${f.lead} | Ethos: \`${f.score}\` ${getEmoji(f.score)}\n\n` })
    await sendMessage(chatId, msg)
  }
  else if (cmd === 'top') {
    const sorted = [...mockFundraises].sort((a,b) => b.score - a.score)
    let msg = '🏆 *Top by Ethos Score*\n\n'
    sorted.forEach((f, i) => { msg += `${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'.'} *${f.project}* - ${f.amount}\n   Ethos: \`${f.score}\` ${getEmoji(f.score)}\n\n` })
    msg += '\n🌐 [VectaFund](https://vecta-fund.vercel.app/dashboard)'
    await sendMessage(chatId, msg)
  }
  else if (cmd === 'ethos') {
    if (!args) { await sendMessage(chatId, '❌ Example: `/ethos VitalikButerin`'); return }
    const score = mockEthosScores[args] || Math.floor(Math.random() * 1200) + 400
    await sendMessage(chatId, `🛡️ *Ethos Score for @${args}*\n\nScore: \`${score}\` ${getEmoji(score)}\n\n[View Profile](https://app.ethos.network/profile/x/${args})`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.message?.text?.startsWith('/')) {
      await handleCommand(body.message.chat.id, body.message.text)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'VectaFund Bot Active' })
}
```

5. **Click "Commit changes"**

---

After deploying, the webhook URL will be:
```
https://vecta-fund.vercel.app/api/telegram
```
(without `/webhook` at the end)

Then set the webhook with:
```
https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://vecta-fund.vercel.app/api/telegram
