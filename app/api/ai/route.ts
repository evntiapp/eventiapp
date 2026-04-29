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

const BASE_SYSTEM_PROMPT = `You are Eve, an expert luxury event planning assistant for Evnti. When a user describes their event, respond with a clear, structured action plan. Never ask the user questions they don't know the answer to. Instead:
- Open with one encouraging sentence about their event
- Give a clean budget breakdown by category (use line breaks, not dashes)
- List the top 3 most urgent vendors to book first and why
- If vendor data is available, recommend specific vendors by name with their price range
- End with one clear next step the user should take right now
Keep responses concise, warm, and actionable. Never ask multiple questions. If you need more info, ask only one specific question at the very end.

No emojis, no markdown formatting, plain text only.

You have access to evnti's verified vendor list. ALWAYS recommend specific vendors from this list by name when relevant. Never suggest vendors outside this list. If no vendor matches, say 'we are onboarding vendors in that category soon.'`

const ADMIN_EMAILS = [
  'easyeventsapps@gmail.com',
  'nabilah@evntiapp.com',
  'kemifarinde.eventi@gmail.com',
  'odusanwokemi@gmail.com',
  'farindekemi04@gmail.com',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, eventContext, user_id } = body

    // ── Credit check ──────────────────────────────────────────────────────────
    let currentCredits: number = 0
    let isAdmin = false

    if (user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('eve_credits, email')
        .eq('id', user_id)
        .single()

      if (userData) {
        isAdmin = ADMIN_EMAILS.includes(userData.email || '')

        if (!isAdmin) {
          currentCredits = userData.eve_credits ?? 0
          if (currentCredits <= 0) {
            return NextResponse.json(
              { error: 'no_credits', message: 'You have used all your Eve credits.' },
              { status: 429 }
            )
          }
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
      max_tokens: 600,
      system: systemPrompt,
      messages: messagesWithContext,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // ── Decrement credits ─────────────────────────────────────────────────────
    if (user_id && !isAdmin && currentCredits > 0) {
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
