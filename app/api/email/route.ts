import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_declined'
  | 'application_received'

interface EmailPayload {
  type: EmailType
  to: string
  data: Record<string, string | number | undefined>
}

function buildEmail(type: EmailType, data: Record<string, string | number | undefined>): { subject: string; text: string } {
  switch (type) {
    case 'booking_request':
      return {
        subject: 'New booking request — evnti',
        text: `Hi ${data.vendorName}, you have a new booking request on evnti.

Client: ${data.clientName}
Event: ${data.eventType} on ${data.eventDate}
Guests: ${data.guestCount}
Budget: $${data.budget}
Message: ${data.clientMessage}

Log in to your vendor dashboard to confirm or decline:
https://evntiapp.com/vendor/dashboard`,
      }

    case 'booking_confirmed':
      return {
        subject: 'Your booking is confirmed — evnti',
        text: `Hi ${data.clientName}, great news! ${data.vendorName} has confirmed your booking request.

Event: ${data.eventType} on ${data.eventDate}

Next step: pay your deposit to secure the booking.
https://evntiapp.com/dashboard`,
      }

    case 'booking_declined':
      return {
        subject: 'Booking update — evnti',
        text: `Hi ${data.clientName}, unfortunately ${data.vendorName} is unable to take your booking.

Don't worry — browse our other verified vendors:
https://evntiapp.com/vendors`,
      }

    case 'application_received':
      return {
        subject: 'Application received — evnti',
        text: `Hi ${data.vendorName}, we've received your application to join evnti. Nabilah and the team will review it within 3-5 business days. We'll be in touch soon!`,
      }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: EmailPayload = await req.json()
    const { type, to, data } = body

    const { subject, text } = buildEmail(type, data)

    await resend.emails.send({
      from: 'evnti <hello@evntiapp.com>',
      to,
      subject,
      text,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
