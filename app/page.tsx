'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
})
const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-epilogue',
})

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  return (
    <div
      className={`${syne.variable} ${epilogue.variable}`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif', background: '#0D0A12', minHeight: '100vh', color: 'white' }}
    >
      {/* ── Noise / grain overlay ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ── Ambient orbs ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(75,45,111,0.45) 0%, transparent 70%)',
          top: '-200px', right: '-100px',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          bottom: '-100px', left: '-150px',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(75,45,111,0.2) 0%, transparent 70%)',
          top: '40%', left: '30%',
        }} />
      </div>

      {/* ── Nav ── */}
      <header style={{ position: 'relative', zIndex: 10 }}>
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '28px 40px',
          maxWidth: '1100px', margin: '0 auto',
        }}>
          <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px' }}>
            evnti<span style={{ color: '#C9A84C' }}>.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.3px', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >For Vendors</a>
            <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.3px', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >How it works</a>
            <a
              href="#waitlist"
              style={{
                fontSize: '13px', fontWeight: 600, color: '#0D0A12',
                background: '#C9A84C', borderRadius: '8px',
                padding: '9px 20px', textDecoration: 'none',
                fontFamily: 'var(--font-syne)', letterSpacing: '0.2px',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              Join Waitlist
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        <section style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '80px 40px 100px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '100px', padding: '6px 16px',
            marginBottom: '40px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'var(--font-syne)' }}>
              Now accepting early access
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-syne)',
            fontSize: 'clamp(42px, 7vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-2.5px',
            color: 'white',
            maxWidth: '820px',
            marginBottom: '28px',
          }}>
            Planning made{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #E8CC84 50%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              effortless.
            </span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '540px',
            marginBottom: '56px',
            fontWeight: 400,
          }}>
            Evnti uses AI to match you with top-rated vendors, build your timeline, track your budget, and coordinate every detail — so you can focus on celebrating.
          </p>

          {/* Waitlist form */}
          <div id="waitlist" style={{ width: '100%', maxWidth: '480px' }}>
            {submitted ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: '16px', padding: '28px 32px',
                animation: 'fadeUp 0.4s ease both',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                    <path d="M1.5 7L6.5 12L16.5 2" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '16px', color: 'white' }}>
                  You're on the list.
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.6 }}>
                  We'll reach out when early access opens. Expect something worth celebrating.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${focused ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Enter your email address"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: '16px 20px',
                      fontSize: '15px',
                      color: 'white',
                      fontFamily: 'var(--font-epilogue)',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#C9A84C',
                      color: '#0D0A12',
                      border: 'none',
                      padding: '16px 24px',
                      fontFamily: 'var(--font-syne)',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.2px',
                      transition: 'opacity 0.2s',
                      margin: '6px',
                      borderRadius: '10px',
                    }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Request Access
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: '0.1px' }}>
                  No spam. Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', marginTop: '48px',
          }}>
            <div style={{ display: 'flex' }}>
              {['#7B5EA7', '#9B7DC4', '#5C4080', '#8B6BB5', '#A88ED4'].map((bg, i) => (
                <div
                  key={i}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: bg, border: '2px solid #0D0A12',
                    marginLeft: i === 0 ? '0' : '-10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, color: 'white',
                    fontFamily: 'var(--font-syne)',
                  }}
                >
                  {['A', 'M', 'K', 'T', 'J'][i]}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>2,400+ planners</span> already on the list
            </div>
          </div>
        </section>

        {/* ── Feature strip ── */}
        <section style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '56px 40px',
          position: 'relative', zIndex: 10,
        }}>
          <div style={{
            maxWidth: '1100px', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
          }}>
            {[
              {
                title: 'AI Vendor Matching',
                body: 'Tell us your vision and budget. Our AI surfaces the right vendors — verified, available, and within range.',
              },
              {
                title: 'Smart Timeline',
                body: 'A living checklist that adapts to your event date. Never miss a milestone or a deadline again.',
              },
              {
                title: 'Unified Messaging',
                body: 'All vendor conversations in one place. Contracts, proposals, and updates — no inbox chaos.',
              },
              {
                title: 'Budget Intelligence',
                body: 'Track every dollar spent and forecasted. AI alerts you before you go over — not after.',
              },
            ].map(f => (
              <div key={f.title}>
                <div style={{
                  width: '36px', height: '3px', borderRadius: '2px',
                  background: 'linear-gradient(90deg, #C9A84C, rgba(201,168,76,0.3))',
                  marginBottom: '18px',
                }} />
                <div style={{
                  fontFamily: 'var(--font-syne)', fontWeight: 700,
                  fontSize: '15px', color: 'white', marginBottom: '10px',
                  letterSpacing: '-0.2px',
                }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                  {f.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
              color: '#C9A84C', marginBottom: '16px', fontFamily: 'var(--font-syne)',
            }}>
              How it works
            </div>
            <h2 style={{
              fontFamily: 'var(--font-syne)', fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1px',
              color: 'white', maxWidth: '520px', margin: '0 auto', lineHeight: 1.15,
            }}>
              Your entire event, orchestrated by AI.
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {[
              { num: '01', title: 'Describe your event', body: 'Tell Evnti your event type, date, location, guest count, and budget. Takes two minutes.' },
              { num: '02', title: 'AI builds your plan', body: 'A personalised timeline, curated vendor shortlist, and budget allocation — generated instantly.' },
              { num: '03', title: 'Book with confidence', body: 'Review vendor profiles, read reviews, message directly, and pay securely through the platform.' },
              { num: '04', title: 'Celebrate', body: 'We handle the coordination. You handle the guest list. Show up on the day and enjoy every moment.' },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.25)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(201,168,76,0.04)'
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-syne)', fontWeight: 800,
                  fontSize: '13px', color: 'rgba(201,168,76,0.6)',
                  letterSpacing: '1px', marginBottom: '20px',
                }}>
                  {step.num}
                </div>
                <div style={{
                  fontFamily: 'var(--font-syne)', fontWeight: 700,
                  fontSize: '16px', color: 'white', marginBottom: '12px', letterSpacing: '-0.2px',
                }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75 }}>
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section style={{
          maxWidth: '1100px', margin: '0 auto 80px',
          padding: '0 40px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(75,45,111,0.6) 0%, rgba(50,28,76,0.8) 100%)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '28px',
            padding: 'clamp(40px, 5vw, 64px) clamp(32px, 5vw, 64px)',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div aria-hidden style={{
              position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
              top: '-150px', right: '-100px', pointerEvents: 'none',
            }} />
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.7)', marginBottom: '20px', fontFamily: 'var(--font-syne)',
            }}>
              Limited early access
            </div>
            <h2 style={{
              fontFamily: 'var(--font-syne)', fontWeight: 800,
              fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-1px',
              color: 'white', marginBottom: '16px', lineHeight: 1.15,
              position: 'relative', zIndex: 1,
            }}>
              Be the first to plan smarter.
            </h2>
            <p style={{
              fontSize: '15px', color: 'rgba(255,255,255,0.45)',
              marginBottom: '36px', maxWidth: '400px', margin: '0 auto 36px', lineHeight: 1.7,
              position: 'relative', zIndex: 1,
            }}>
              Join our waitlist and get priority access when we launch, plus exclusive onboarding support.
            </p>
            <a
              href="#waitlist"
              style={{
                display: 'inline-block',
                background: '#C9A84C',
                color: '#0D0A12',
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                fontSize: '15px',
                padding: '16px 36px',
                borderRadius: '12px',
                textDecoration: 'none',
                letterSpacing: '0.2px',
                transition: 'opacity 0.2s',
                position: 'relative', zIndex: 1,
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              Join the Waitlist
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.4px', color: 'white' }}>
            evnti<span style={{ color: '#C9A84C' }}>.</span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Evnti. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          nav { padding: 20px 24px !important; }
          nav a:not(:last-child) { display: none; }
          section { padding-left: 24px !important; padding-right: 24px !important; }
          h1 { letter-spacing: -1.5px !important; }
        }
      `}</style>
    </div>
  )
}
