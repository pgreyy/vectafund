// Telegram Bot for VectaFund
// This file should be run as a separate Node.js process

import TelegramBot from 'node-telegram-bot-api'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true })

// Store user subscriptions (in production, use database)
const userSubscriptions = new Map<number, {
  chatId: number
  username?: string
  followedVCs: string[]
  notificationsEnabled: boolean
}>()

// Welcome message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const username = msg.from?.username

  userSubscriptions.set(chatId, {
    chatId,
    username,
    followedVCs: [],
    notificationsEnabled: true,
  })

  bot.sendMessage(chatId, `
🚀 *Welcome to VectaFund Bot!*

Track crypto fundraises from top VCs, powered by Ethos reputation scores.

*Commands:*
/subscribe - Subscribe to fundraise alerts
/unsubscribe - Unsubscribe from alerts
/follow <vc> - Follow a VC (e.g., /follow a16zcrypto)
/unfollow <vc> - Unfollow a VC
/following - See your followed VCs
/latest - Get latest fundraises
/top - Get top raises by Ethos score
/help - Show this help message

Start by following some VCs with /follow!
  `, { parse_mode: 'Markdown' })
})

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `
📚 *VectaFund Bot Commands*

*Subscription:*
/subscribe - Enable fundraise alerts
/unsubscribe - Disable alerts

*Following VCs:*
/follow <twitter_handle> - Follow a VC
/unfollow <twitter_handle> - Unfollow a VC
/following - List your followed VCs
/vcs - Browse available VCs

*Fundraises:*
/latest - Latest fundraise announcements
/top - Top raises ranked by Ethos score

*Info:*
/ethos <twitter_handle> - Check Ethos score
/help - Show this message

Example: /follow a16zcrypto
  `, { parse_mode: 'Markdown' })
})

// Subscribe command
bot.onText(/\/subscribe/, (msg) => {
  const chatId = msg.chat.id
  const user = userSubscriptions.get(chatId)
  
  if (user) {
    user.notificationsEnabled = true
    userSubscriptions.set(chatId, user)
  } else {
    userSubscriptions.set(chatId, {
      chatId,
      username: msg.from?.username,
      followedVCs: [],
      notificationsEnabled: true,
    })
  }

  bot.sendMessage(chatId, '✅ You are now subscribed to fundraise alerts!')
})

// Unsubscribe command
bot.onText(/\/unsubscribe/, (msg) => {
  const chatId = msg.chat.id
  const user = userSubscriptions.get(chatId)
  
  if (user) {
    user.notificationsEnabled = false
    userSubscriptions.set(chatId, user)
  }

  bot.sendMessage(chatId, '🔕 You have unsubscribed from fundraise alerts.')
})

// Follow VC command
bot.onText(/\/follow (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const vcHandle = match?.[1]?.toLowerCase().replace('@', '')

  if (!vcHandle) {
    bot.sendMessage(chatId, 'Please provide a VC Twitter handle. Example: /follow a16zcrypto')
    return
  }

  let user = userSubscriptions.get(chatId)
  if (!user) {
    user = {
      chatId,
      username: msg.from?.username,
      followedVCs: [],
      notificationsEnabled: true,
    }
  }

  if (user.followedVCs.length >= 5) {
    bot.sendMessage(chatId, '❌ You can only follow up to 5 VCs. Unfollow one first with /unfollow <vc>')
    return
  }

  if (user.followedVCs.includes(vcHandle)) {
    bot.sendMessage(chatId, `You're already following @${vcHandle}`)
    return
  }

  user.followedVCs.push(vcHandle)
  userSubscriptions.set(chatId, user)

  bot.sendMessage(chatId, `
✅ Now following *@${vcHandle}*

You'll receive alerts when they lead new investments.

Following: ${user.followedVCs.length}/5 VCs
  `, { parse_mode: 'Markdown' })
})

// Unfollow VC command
bot.onText(/\/unfollow (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const vcHandle = match?.[1]?.toLowerCase().replace('@', '')

  if (!vcHandle) {
    bot.sendMessage(chatId, 'Please provide a VC Twitter handle. Example: /unfollow a16zcrypto')
    return
  }

  const user = userSubscriptions.get(chatId)
  if (!user || !user.followedVCs.includes(vcHandle)) {
    bot.sendMessage(chatId, `You're not following @${vcHandle}`)
    return
  }

  user.followedVCs = user.followedVCs.filter(vc => vc !== vcHandle)
  userSubscriptions.set(chatId, user)

  bot.sendMessage(chatId, `✅ Unfollowed @${vcHandle}`)
})

// List following command
bot.onText(/\/following/, (msg) => {
  const chatId = msg.chat.id
  const user = userSubscriptions.get(chatId)

  if (!user || user.followedVCs.length === 0) {
    bot.sendMessage(chatId, `
You're not following any VCs yet.

Use /follow <twitter_handle> to start following VCs.
Example: /follow a16zcrypto
    `)
    return
  }

  const vcList = user.followedVCs.map(vc => `• @${vc}`).join('\n')
  
  bot.sendMessage(chatId, `
📋 *Your Followed VCs (${user.followedVCs.length}/5)*

${vcList}

Use /unfollow <handle> to remove.
  `, { parse_mode: 'Markdown' })
})

// Latest fundraises command
bot.onText(/\/latest/, async (msg) => {
  const chatId = msg.chat.id

  // In production, fetch from your API
  const mockFundraises = [
    { project: 'Monad', amount: '$225M', lead: 'Paradigm', score: 1847 },
    { project: 'Berachain', amount: '$100M', lead: 'Framework', score: 1678 },
    { project: 'Farcaster', amount: '$150M', lead: 'Paradigm', score: 1847 },
  ]

  let message = '📰 *Latest Fundraises*\n\n'
  
  mockFundraises.forEach((f, i) => {
    message += `*${i + 1}. ${f.project}* - ${f.amount}\n`
    message += `   Lead: ${f.lead} | Ethos: ${f.score}\n\n`
  })

  message += '\n_Use /top for raises ranked by Ethos score_'

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
})

// Top fundraises by Ethos score
bot.onText(/\/top/, async (msg) => {
  const chatId = msg.chat.id

  const mockFundraises = [
    { project: 'Farcaster', amount: '$150M', lead: 'Paradigm', score: 3694 },
    { project: 'Monad', amount: '$225M', lead: 'Paradigm', score: 3456 },
    { project: 'EigenLayer', amount: '$100M', lead: 'a16z', score: 2892 },
  ]

  let message = '🏆 *Top Raises by Ethos Score*\n\n'
  
  mockFundraises.forEach((f, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'
    message += `${medal} *${f.project}* - ${f.amount}\n`
    message += `   Lead: ${f.lead}\n`
    message += `   Combined Ethos Score: \`${f.score}\`\n\n`
  })

  message += '\n[View on VectaFund](https://vectafund.vercel.app/dashboard)'

  bot.sendMessage(chatId, message, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  })
})

// Check Ethos score command
bot.onText(/\/ethos (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const handle = match?.[1]?.replace('@', '')

  if (!handle) {
    bot.sendMessage(chatId, 'Please provide a Twitter handle. Example: /ethos VitalikButerin')
    return
  }

  bot.sendMessage(chatId, `⏳ Looking up Ethos score for @${handle}...`)

  try {
    // In production, call Ethos API
    const mockScore = Math.floor(Math.random() * 1500) + 500

    bot.sendMessage(chatId, `
🛡️ *Ethos Score for @${handle}*

Score: \`${mockScore}\`
Level: ${mockScore >= 1500 ? '🟢 High' : mockScore >= 800 ? '🟡 Medium' : '🔴 Low'}

[View Full Profile](https://app.ethos.network/profile/x/${handle})
    `, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    })
  } catch (error) {
    bot.sendMessage(chatId, `❌ Could not find Ethos profile for @${handle}`)
  }
})

// Function to send fundraise alert to subscribers
export async function sendFundraiseAlert(fundraise: {
  project: string
  amount: string
  lead: string
  leadHandle: string
  ethosScore: number
  sourceUrl?: string
}) {
  for (const [chatId, user] of userSubscriptions) {
    if (!user.notificationsEnabled) continue
    
    // Check if user follows the lead VC
    if (user.followedVCs.length > 0 && !user.followedVCs.includes(fundraise.leadHandle)) {
      continue
    }

    const message = `
🚨 *New Fundraise Alert!*

*${fundraise.project}* raised ${fundraise.amount}

Lead Investor: ${fundraise.lead}
Ethos Score: \`${fundraise.ethosScore}\` ${fundraise.ethosScore >= 1500 ? '🟢' : fundraise.ethosScore >= 800 ? '🟡' : '🔴'}

${fundraise.sourceUrl ? `[Read More](${fundraise.sourceUrl})` : ''}
[View on VectaFund](https://vectafund.vercel.app/dashboard)
    `

    try {
      await bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      })
    } catch (error) {
      console.error(`Failed to send alert to ${chatId}:`, error)
    }
  }
}

console.log('🤖 VectaFund Telegram bot is running...')

export default bot
