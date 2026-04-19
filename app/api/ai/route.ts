import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are Eve, a warm and knowledgeable event planning assistant for evnti — a marketplace that connects clients with vetted vendors in Houston, Texas. Your job is to help clients plan their events by:
- Suggesting vendor categories they need based on their event type and budget
- Giving realistic budget breakdowns (e.g. 40% venue, 25% catering, 15% photography, 10% music, 10% other)
- Answering questions about event planning timelines
- Recommending what to book first and when
- Being encouraging, specific, and concise

If the client has shared event details, use them to personalize advice.
Always guide clients toward browsing vendors on evnti.
Never make up specific vendor names — say 'browse our verified vendors'.
Keep responses under 150 words. Be warm, direct, and helpful.
Never use emojis in your responses. Never use markdown bold (**text**) or any markdown formatting. Write in plain text only.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, eventContext } = body

    let messagesWithContext = messages

    if (eventContext) {
      const contextNote = `Client event details: ${JSON.stringify(eventContext)}`
      messagesWithContext = [
        { role: 'user', content: contextNote },
        { role: 'assistant', content: 'Got it — I have your event details and will use them to personalize my advice.' },
        ...messages,
      ]
    }

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messagesWithContext,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ response: text })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
