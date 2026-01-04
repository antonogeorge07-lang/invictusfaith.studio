'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Globe, Users, Cpu, ShoppingBag, Network, ArrowRight } from 'lucide-react'

const mvps = [
  {
    name: 'POLY-LINQ',
    tagline: 'Real-time AI translation for global gamers.',
    icon: Globe,
    gradient: 'from-primary to-secondary',
    delay: 0,
  },
  {
    name: 'MentorVerse',
    tagline: 'Coaching and mentoring for English & growth.',
    icon: Users,
    gradient: 'from-secondary to-accent',
    delay: 0.1,
  },
  {
    name: 'SAAI',
    tagline: 'AI insights for automation & efficiency.',
    icon: Cpu,
    gradient: 'from-accent to-primary',
    delay: 0.2,
  },
  {
    name: 'Faith Commerce',
    tagline: 'Lightweight digital product marketplace.',
    icon: ShoppingBag,
    gradient: 'from-primary via-secondary to-primary',
    delay: 0.3,
  },
  {
    name: 'Invictus Network',
    tagline: 'Ecosystem for innovators and founders.',
    icon: Network,
    gradient: 'from-secondary via-accent to-secondary',
    delay: 0.4,
  },
]

export function MVPShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section 
      id="mvps" 
      ref={ref}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(210 47% 12%) 0%, hsl(210 47% 10%) 100%)',
      }}
    >
      {/* Background Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-[2px] bg-secondary" />
            <span className="text-sm font-medium text-secondary tracking-wide uppercase">
              Our Products
            </span>
            <span className="w-8 h-[2px] bg-secondary" />
          </div>

          <h2 className="font-display font-bold text-foreground mb-6">
            MVPs That Make an{' '}
            <span className="text-secondary">Impact</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered solutions designed to solve real problems and create lasting value.
          </p>
        </motion.div>

        {/* MVP Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mvps.map((mvp, index) => {
            const Icon = mvp.icon
            return (
              <motion.div
                key={mvp.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: mvp.delay }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="glass-card rounded-2xl p-8 h-full cursor-pointer">
                  {/* Gradient Border on Hover */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2))`,
                      padding: '1px',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'exclude',
                    }}
                  />

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mvp.gradient} p-3 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-semibold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                    {mvp.name}
                  </h3>

                  <p className="text-muted-foreground text-base mb-6">
                    {mvp.tagline}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Glow Effect */}
                  <div 
                    className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.3))`,
                    }}
                  />
                </div>
              </motion.div>
            )
          })}

          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center border-dashed border-2 border-border bg-transparent">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-display font-semibold text-xl text-muted-foreground mb-3">
                More Coming
              </h3>
              <p className="text-muted-foreground text-base">
                New innovations in development.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
