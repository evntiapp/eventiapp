import Link from 'next/link'
import { Syne, Space_Grotesk } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-terms',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-space-terms',
})

const SECTIONS = [
  {
    title: 'Eligibility',
    body: [
      'To apply as a vendor on evnti, you must be a legal business entity or sole proprietor operating in the United States and be at least 18 years of age.',
      'evnti reserves the right to decline or revoke vendor status at its sole discretion if the applicant does not meet our quality, legal, or conduct standards.',
      'By submitting an application you confirm that all information provided is accurate and that you have the authority to enter into this agreement on behalf of your business.',
    ],
  },
  {
    title: 'Listings & Accuracy',
    body: [
      'Vendors are solely responsible for the accuracy, completeness, and legality of all content included in their listings, including descriptions, pricing, photos, and service details.',
      'Misleading, fraudulent, or materially inaccurate listings may be removed without notice and may result in suspension of your vendor account.',
      'evnti may, at its discretion, edit listings for formatting or clarity but will not alter pricing or service descriptions without vendor approval.',
    ],
  },
  {
    title: 'Payments & Fees',
    body: [
      'evnti charges a platform fee on each confirmed booking; the current fee structure is disclosed in your vendor dashboard and may be updated with 30 days written notice.',
      'Payouts are issued according to the schedule selected during onboarding, net of the applicable platform fee, once a booking is confirmed and the event has taken place.',
      'Vendors are responsible for all applicable taxes on income received through the platform and agree to provide accurate tax information upon request.',
    ],
  },
  {
    title: 'Bookings',
    body: [
      'When a client books your services through evnti, a binding agreement is formed between you and the client; evnti acts solely as a marketplace facilitator and is not a party to that agreement.',
      'Cancellations are governed by the cancellation policy you select during onboarding; failure to honor confirmed bookings may result in penalties and account suspension.',
      'Any disputes between vendors and clients are handled first through evnti\'s resolution process; evnti\'s decision in such disputes is final with respect to platform-held funds.',
    ],
  },
  {
    title: 'Conduct',
    body: [
      'Vendors must treat all clients and evnti staff with professionalism and respect; harassment, discrimination, or abusive behavior of any kind will result in immediate account termination.',
      'You agree not to solicit clients to transact outside of the evnti platform for any booking that originated through the marketplace.',
      'Vendors must comply with all applicable local, state, and federal laws, including licensing, health and safety regulations, and employment law, in the course of delivering their services.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'Either party may terminate this agreement at any time; vendors may close their account through the dashboard settings, subject to fulfillment of any outstanding confirmed bookings.',
      'evnti may suspend or permanently terminate a vendor account for violations of these terms, fraudulent activity, or conduct that damages the reputation or integrity of the platform.',
      'Upon termination, any pending payouts for completed events will be processed on the normal schedule; payouts for disputed or incomplete events may be withheld pending resolution.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'If you have questions about these terms or your vendor account, please reach out to our vendor support team at vendors@evnti.com.',
      'For formal legal notices, please send correspondence to evnti, Inc., 24815 Vervain Meadow Trail, Katy, TX 77493.',
      'evnti may update these terms from time to time; continued use of the platform after notice of changes constitutes acceptance of the revised terms.',
    ],
  },
]

export default function VendorTermsPage() {
  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-white`}
      style={{ fontFamily: 'var(--font-space-terms), system-ui, sans-serif' }}
    >
      <div className="max-w-[720px] mx-auto px-6 py-12 lg:py-16">

        {/* Logo */}
        <Link
          href="/"
          className="inline-block text-xl font-extrabold tracking-tight mb-12 text-[#4A0E6E] hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-syne-terms)' }}
        >
          evnti.
        </Link>

        {/* Header */}
        <h1
          className="text-4xl font-bold text-[#1A1A2E] mb-3 leading-tight"
          style={{ fontFamily: 'var(--font-syne-terms)' }}
        >
          Vendor Terms of Service
        </h1>
        <p className="text-sm text-[#7C6B8A] mb-12">
          Last updated: April 15, 2026
        </p>

        {/* Divider */}
        <div className="h-px bg-[#DDB8F5] mb-12" />

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map(section => (
            <section key={section.title}>
              <h2
                className="text-lg font-bold text-[#4A0E6E] mb-3"
                style={{ fontFamily: 'var(--font-syne-terms)' }}
              >
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.body.map((para, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-[#1A1A2E]/80"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#DDB8F5] mt-14 mb-8" />

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[#7C6B8A]">
          <span>© 2026 evnti, Inc. All rights reserved.</span>
          <Link
            href="/vendor/apply"
            className="text-[#4A0E6E] font-semibold hover:underline underline-offset-4 transition-colors"
          >
            Apply as a vendor
          </Link>
        </div>

      </div>
    </div>
  )
}
