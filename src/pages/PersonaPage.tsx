'use client'

import { useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { LogoBar } from '@/components/LogoBar'
import { Pillars } from '@/components/Pillars'
import { MVPShowcase } from '@/components/MVPShowcase'
import { Contact } from '@/components/Contact'
import { Seo } from '@/components/Seo'

type Persona = {
  slug: string
  audience: string
  headline: string
  highlight: string
  subtext: string
  pains: string[]
  recommended: { name: string; price: string; tagline: string }
}

const PERSONAS: Record<string, Persona> = {
  founders: {
    slug: 'founders',
    audience: 'For founders',
    headline: 'Ship an MVP that proves',
    highlight: 'demand, not slides',
    subtext: 'Launch a working product in weeks, validate with real users, and iterate without rebuilding from scratch.',
    pains: [
      'No engineering team yet',
      'Need investor-ready proof, fast',
      'Cannot afford a 6-month build cycle',
    ],
    recommended: { name: 'Pro', price: '€300', tagline: 'Full MVP with auth, payments, and analytics' },
  },
  'small-business': {
    slug: 'small-business',
    audience: 'For small business',
    headline: 'A site that books clients',
    highlight: 'while you sleep',
    subtext: 'Mobile-first websites with online booking, payments, and a calm admin dashboard. Live in days, not months.',
    pains: [
      'Booking and admin live in WhatsApp',
      'Existing site is slow on mobile',
      'No time to manage agencies',
    ],
    recommended: { name: 'Growth', price: '€189', tagline: 'Booking, payments, multi-page' },
  },
  creators: {
    slug: 'creators',
    audience: 'For creators',
    headline: 'A home for your work that',
    highlight: 'sells the next thing',
    subtext: 'Editorial portfolios, newsletter capture, and a built-in shop. Built around your craft, not a template.',
    pains: [
      'Stuck on Linktree and Stan',
      'Email list lives in Notion',
      'No way to sell products directly',
    ],
    recommended: { name: 'Growth', price: '€189', tagline: 'Portfolio + newsletter + light commerce' },
  },
}

export default function PersonaPage() {
  const { persona } = useParams<{ persona: string }>()
  const data = persona ? PERSONAS[persona] : null
  if (!data) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={`${data.headline} ${data.highlight} | Invictus Faith Studio`}
        description={data.subtext}
        path={`/for/${data.slug}`}
      />
      <Navbar />

      <main>
        <section className="relative min-h-[80vh] flex items-center pt-32 pb-20 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block text-xs uppercase tracking-[0.2em] font-semibold text-accent mb-6"
              >
                {data.audience}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-bold leading-[1.02] tracking-tight mb-8"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 6.5rem)' }}
              >
                {data.headline} <span className="text-accent">{data.highlight}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
              >
                {data.subtext}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a href="#contact" className="btn-electric px-8 py-4 rounded-2xl text-lg font-semibold inline-flex items-center gap-2">
                  Start a project <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#mvps" className="px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                  See past work
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        <LogoBar label={`Trusted by ${data.audience.toLowerCase()} we have shipped for`} />

        <section className="py-24 bg-background">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">What we hear from you</h2>
              <ul className="space-y-5">
                {data.pains.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-lg text-muted-foreground">
                    <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-3xl p-8 elevated-shadow">
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">Recommended package</p>
              <div className="flex items-baseline gap-3 mb-3">
                <h3 className="text-4xl font-bold">{data.recommended.name}</h3>
                <span className="text-2xl font-bold text-muted-foreground">{data.recommended.price}</span>
              </div>
              <p className="text-muted-foreground mb-6">{data.recommended.tagline}</p>
              <a href="#contact" className="btn-electric inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold">
                Get a quote <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        <section id="mvps"><MVPShowcase /></section>
        <section><Pillars /></section>
        <section id="contact"><Contact /></section>
      </main>
    </div>
  )
}
