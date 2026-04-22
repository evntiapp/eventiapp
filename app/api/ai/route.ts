import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_SYSTEM_PROMPT = `You are Eve, a warm and knowledgeable event planning assistant for evnti — a marketplace connecting clients with vetted vendors in Houston, Texas.

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
- No emojis, no markdown formatting, plain text only

Your personality: warm, encouraging, and conversational — like a knowledgeable friend who happens to know everything about event planning. You genuinely care about making the client's event special.

When recommending vendors:
- Lead with enthusiasm about the vendor
- Mention something specific about them that fits the client's event
- Make the client feel excited about the option
- End with one warm follow-up question

Example tone:
Instead of: 'Check out hairitage — they style hair for events'
Say: 'You'll love hairitage — they're a Beauty & Hair specialist based in Fulshear who are great at event styling, and their rates ($30-250) work really well for your budget. Perfect fit for your baby shower. Want me to help you find someone for another category?'

Keep responses under 80 words. Be warm but concise. Never robotic. Never generic.

You have access to evnti's verified vendor list. ALWAYS recommend specific vendors from this list by name when relevant. Never suggest vendors outside this list. If no vendor matches, say 'we are onboarding vendors in that category soon.'`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, eventContext, user_id } = body

    // ── Credit check ──────────────────────────────────────────────────────────
    let currentCredits: number = 0

    if (user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('eve_credits')
        .eq('id', user_id)
        .single()

      if (userData) {
        currentCredits = userData.eve_credits ?? 0
        if (currentCredits <= 0) {
          return NextResponse.json(
            { error: 'no_credits', message: 'You have used all your Eve credits.' },
            { status: 429 }
          )
        }
      }
    }

    // ── Vendor list ───────────────────────────────────────────────────────────
    const { data: vendors } = await supabase
      .from('vendor_profiles')
      .select('business_name, category, location, pricing_from, pricing_to, description')
      .eq('application_status', 'approved')
      .eq('is_verified', true)

    const vendorList = vendors?.map(v =>
      `- ${v.business_name} (${v.category}, ${v.location}, $${v.pricing_from}-$${v.pricing_to}): ${v.description}`
    ).join('\n') || 'No vendors listed yet.'

    const systemPrompt = `${BASE_SYSTEM_PROMPT}

Current verified vendors on evnti:
${vendorList}`

    // ── Build messages ────────────────────────────────────────────────────────
    let messagesWithContext = messages

    if (eventContext) {
      const contextNote = `Client event details: ${JSON.stringify(eventContext)}`
      messagesWithContext = [
        { role: 'user', content: contextNote },
        { role: 'assistant', content: 'Got it — I have your event details and will use them to personalize my advice.' },
        ...messages,
      ]
    }

    // ── AI call ───────────────────────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      system: systemPrompt,
      messages: messagesWithContext,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // ── Decrement credits ─────────────────────────────────────────────────────
    if (user_id && currentCredits !== null) {
      await supabase
        .from('users')
        .update({ eve_credits: currentCredits - 1 })
        .eq('id', user_id)
    }

    return NextResponse.json({ response: text })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
