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
    await sendMessage(chatId, '🚀 *Welcome to VectaFund Bot!*\n\nTrack crypto fundraises powered by Ethos scores.\n\n*Commands:*\n/follow <vc> - Follow a VC\n/unfollow <vc> - Unfollow\n/following - Your VCs\n/latest - Latest raises\n/top - Top by Ethos\n/ethos <handle> - Check score\n\n🌐 Web App: vecta-fund.vercel.app')
  } 
  else if (cmd === 'follow') {
    if (!args) { await sendMessage(chatId, '❌ Example: /follow paradigm'); return }
    userFollows[
