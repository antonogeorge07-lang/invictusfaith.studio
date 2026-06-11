'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'

type Sample = { id: string; name: string; url: string }

interface Props {
  label?: string
  className?: string
}

export function LogoBar({ label = 'Trusted by teams shipping fast', className = '' }: Props) {
  const [items, setItems] = useState<Sample[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data } = await supabase
        .from('studio_samples')
        .select('id,name,url')
        .eq('published', true)
        .order('position', { ascending: true })
        .limit(12)
      if (alive && data?.length) setItems(data as Sample[])
    })()
    return () => { alive = false }
  }, [])

  if (!items.length) return null
  const loop = [...items, ...items]

  return (
    <section className={`relative py-10 bg-secondary border-y border-border overflow-hidden ${className}`}>
      <div className="container mx-auto px-6 mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">{label}</p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary to-transparent z-10" />
        <motion.div
          className="flex gap-12 items-center whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        >
          {loop.map((s, i) => {
            let host = ''
            try { host = new URL(s.url).hostname } catch { host = '' }
            const favicon = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : ''
            return (
              <a
                key={`${s.id}-${i}`}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
              >
                {favicon && <img src={favicon} alt="" className="w-6 h-6 rounded" loading="lazy" />}
                <span className="text-base font-semibold text-foreground">{s.name}</span>
              </a>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
