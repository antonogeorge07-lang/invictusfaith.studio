'use client'

import { motion } from 'framer-motion'
import { Globe, Users, Brain, ShoppingBag, ArrowRight } from 'lucide-react'

const mvps = [
  {
    name: 'POLY-LINQ',
    description: 'Real-time AI translation for global gamers.',
    icon: Globe,
    status: 'live',
    action: 'Visit Site',
  },
  {
    name: 'MentorVerse',
    description: 'Coaching and mentoring for English & growth.',
    icon: Users,
    status: 'live',
    action: 'Visit Site',
  },
  {
    name: 'SAAI',
    description: 'AI-driven automation insights platform.',
    icon: Brain,
    status: 'coming',
    action: 'Coming Soon',
  },
  {
    name: 'Invictus Network',
    description: 'Ecosystem for innovators and founders.',
    icon: ShoppingBag,
    status: 'waitlist',
    action: 'Join Waitlist',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
}

export function MVPShowcase() {
  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-foreground mb-12"
        >
          MVP Showcase Grid
        </motion.h2>

        {/* MVP Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {mvps.map((mvp) => (
            <motion.div
              key={mvp.name}
              variants={itemVariants}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-accent hover:shadow-[0_0_30px_rgba(0,255,171,0.15)] transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <mvp.icon className="w-7 h-7 text-accent" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {mvp.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {mvp.description}
              </p>

              {/* Action Button */}
              <button className="flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors group-hover:border-accent">
                {mvp.action}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
