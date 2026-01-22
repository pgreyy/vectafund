import { NextRequest, NextResponse } from 'next/server'

// This is a webhook handler for Telegram updates
// In production, set up webhook instead of polling

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log incoming update (for debugging)
    console.log('Telegram update:', JSON.stringify(body, null, 2))

    // Process the update
    // In production, import and use your bot handlers here

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'VectaFund Telegram Bot Webhook',
    message: 'Send POST requests to this endpoint'
  })
}
