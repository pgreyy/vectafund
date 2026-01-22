// Telegram Bot Types and Utilities for VectaFund
// The actual bot should be run as a separate process

// Types for the bot
export interface UserSubscription {
  chatId: number
  username?: string
  followedVCs: string[]
  notificationsEnabled: boolean
}

export interface FundraiseAlert {
  project: string
  amount: string
  lead: string
  leadHandle: string
  ethosScore: number
  sourceUrl?: string
}

// Bot command definitions for documentation
export const BOT_COMMANDS = [
  { command: 'start', description: 'Welcome message and setup' },
  { command: 'help', description: 'Show all commands' },
  { command: 'subscribe', description: 'Enable fundraise alerts' },
  { command: 'unsubscribe', description: 'Disable alerts' },
  { command: 'follow', description: 'Follow a VC (e.g., /follow a16zcrypto)' },
  { command: 'unfollow', description: 'Unfollow a VC' },
  { command: 'following', description: 'List your followed VCs' },
  { command: 'latest', description: 'Get latest fundraises' },
  { command: 'top', description: 'Top raises by Ethos score' },
  { command: 'ethos', description: 'Check Ethos score (e.g., /ethos VitalikButerin)' },
]

// Format a fundraise alert message for Telegram
export function formatFundraiseAlert(fundraise: FundraiseAlert): string {
  const scoreEmoji = fundraise.ethosScore >= 1500 ? '🟢' : fundraise.ethosScore >= 800 ? '🟡' : '🔴'
  
  return `
🚨 *New Fundraise Alert!*

*${fundraise.project}* raised ${fundraise.amount}

Lead Investor: ${fundraise.lead}
Ethos Score: \`${fundraise.ethosScore}\` ${scoreEmoji}

${fundraise.sourceUrl ? `[Read More](${fundraise.sourceUrl})` : ''}
[View on VectaFund](https://vectafund.vercel.app/dashboard)
  `.trim()
}

// Welcome message
export const WELCOME_MESSAGE = `
🚀 *Welcome to VectaFund Bot!*

Track crypto fundraises from top VCs, powered by Ethos reputation scores.

*Commands:*
/subscribe - Subscribe to fundraise alerts
/follow <vc> - Follow a VC (e.g., /follow a16zcrypto)
/latest - Get latest fundraises
/top - Get top raises by Ethos score
/help - Show this help message
`.trim()
