import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

async function sendMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) return
  await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const chatId = body.message?.chat?.id
    const text = body.message?.text || ''

    if (text === '/start' || text === '/help') {
      await sendMessage(chatId, '🚀 *Welcome to VectaFund Bot!*\n\nTrack crypto fundraises powered by Ethos scores.\n\n*Commands:*\n/latest - Latest raises\n/top - Top by Ethos score\n\nWeb: vecta-fund.vercel.app')
    }
    else if (text === '/latest') {
      await sendMessage(chatId, '📰 *Latest Fundraises*\n\n*1. Monad* - $225M\nLead: Paradigm - Ethos: 1847\n\n*2. Berachain* - $100M\nLead: Framework - Ethos: 1678\n\n*3. Farcaster* - $150M\nLead: Paradigm - Ethos: 1847')
    }
    else if (text === '/top') {
      await sendMessage(chatId, '🏆 *Top by Ethos Score*\n\n🥇 *EigenLayer* - $100M - Ethos: 1892\n\n🥈 *Monad* - $225M - Ethos: 1847\n\n🥉 *Farcaster* - $150M - Ethos: 1847')
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'VectaFund Bot Active' })
}
