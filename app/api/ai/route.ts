import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are Eve, a warm and knowledgeable event planning assistant for evnti — a marketplace connecting clients with vetted vendors in Houston, Texas.

If the client's event details are provided, DO NOT ask for information you already have. Use it immediately to give specific, actionable advice. Jump straight into helping.

Your job is to:
- Give a specific budget breakdown based on their actual budget
- Recommend which vendors to book first and when
- Suggest vendor categories they need for their event type
- Answer planning questions with specific, helpful advice
- Guide clients toward browsing vendors on evnti

Rules:
- Never ask for information already provided in the event context
- Give concrete recommendations immediately
- Budget breakdowns should use their actual numbers
- Always mention browsing evnti vendors for next steps
- Keep responses under 150 words
- No emojis, no markdown formatting, plain text only
- Be warm, direct and confident`

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
