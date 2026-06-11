'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LogoBar } from '@/components/LogoBar'
import { ArrowRight } from 'lucide-react'

type Block = {
  id: string
  block_type: 'hero' | 'logo_bar' | 'feature_split' | 'testimonial' | 'stats_row' | 'cta' | 'markdown'
  props: any
}

export function BlockRenderer({ block }: { block: Block }) {
  const p = block.props ?? {}
  switch (block.block_type) {
    case 'hero':
      return (
        <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10 max-w-4xl">
            {p.eyebrow && <p className="text-xs uppercase tracking-[0.2em] font-semibold text-accent mb-6">{p.eyebrow}</p>}
            <h1 className="font-bold leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
              {p.title} {p.highlight && <span className="text-accent">{p.highlight}</span>}
            </h1>
            {p.subtitle && <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">{p.subtitle}</p>}
            {p.cta_label && p.cta_href && (
              <a href={p.cta_href} className="btn-electric inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold">
                {p.cta_label} <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </section>
      )
    case 'logo_bar':
      return <LogoBar label={p.label} />
    case 'feature_split':
      return (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className={p.reverse ? 'lg:order-2' : ''}>
              {p.eyebrow && <p className="text-xs uppercase tracking-[0.2em] font-semibold text-accent mb-4">{p.eyebrow}</p>}
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{p.title}</h2>
              <p className="text-lg text-muted-foreground">{p.body}</p>
            </div>
            <div className={p.reverse ? 'lg:order-1' : ''}>
              {p.image && <img src={p.image} alt={p.title ?? ''} className="rounded-3xl w-full elevated-shadow" />}
            </div>
          </div>
        </section>
      )
    case 'testimonial':
      return (
        <section className="py-24 bg-secondary">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <p className="text-2xl md:text-3xl font-medium leading-snug mb-8">"{p.quote}"</p>
            <p className="font-semibold">{p.author}</p>
            {p.role && <p className="text-muted-foreground text-sm">{p.role}</p>}
          </div>
        </section>
      )
    case 'stats_row':
      return (
        <section className="py-20 bg-background border-y border-border">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {(p.stats ?? []).map((s: any, i: number) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-accent">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )
    case 'cta':
      return (
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{p.title}</h2>
            {p.subtitle && <p className="text-lg text-primary-foreground/70 mb-10">{p.subtitle}</p>}
            {p.cta_label && p.cta_href && (
              <a href={p.cta_href} className="btn-electric inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold">
                {p.cta_label} <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </section>
      )
    case 'markdown':
      return (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6 max-w-3xl prose prose-lg prose-a:text-accent">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.body ?? ''}</ReactMarkdown>
          </div>
        </section>
      )
    default:
      return null
  }
}
