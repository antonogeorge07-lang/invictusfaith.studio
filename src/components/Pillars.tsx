'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, CheckCircle, Plus } from 'lucide-react'

const pillars = [
  {
    title: 'Innovate',
    description: "Create what's seemingly impossible",
    icon: Sparkles,
  },
  {
    title: 'Solve',
    description: 'Tackle real, everyday challenges',
    icon: Zap,
  },
  {
    title: 'Impact',
    description: 'Make meaningful, lasting contributions',
    icon: CheckCircle,
  },
]

export function Pillars() {
  return (
    <section className="relative py-20 bg-primary overflow-hidden">
      {/* Decorative line at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-2 h-2 bg-accent rounded-full" />
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-px bg-primary-foreground/10 rounded-2xl overflow-hidden">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-primary p-8 relative hover:bg-primary/80 transition-colors"
            >
              {/* Icon */}
              <div className="flex items-center gap-3 mb-4">
                <pillar.icon className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-bold text-primary-foreground">
                  {pillar.title}
                </h3>
              </div>
              
              {/* Description */}
              <p className="text-primary-foreground/60 text-sm leading-relaxed mb-6">
                {pillar.description}
              </p>
              
              {/* Plus button */}
              <button className="w-8 h-8 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/40 hover:border-accent hover:text-accent transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
