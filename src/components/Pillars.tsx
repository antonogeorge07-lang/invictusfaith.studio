'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Lightbulb, Wrench, Rocket } from 'lucide-react'

const pillars = [
  {
    title: 'Innovate',
    description: 'We challenge the status quo. Every project starts with a bold question: What if we could do this better?',
    icon: Lightbulb,
    color: 'from-accent/20 to-accent/5',
  },
  {
    title: 'Solve',
    description: 'Ideas are nothing without execution. We build solutions that work, iterate until perfect, and deliver results.',
    icon: Wrench,
    color: 'from-primary/10 to-primary/5',
  },
  {
    title: 'Impact',
    description: 'Technology should make lives better. We measure success by the positive change we create in the world.',
    icon: Rocket,
    color: 'from-accent/20 to-accent/5',
  },
]

export function Pillars() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section ref={containerRef} className="relative py-32 bg-primary text-primary-foreground overflow-hidden">
      {/* Parallax background elements */}
      <motion.div
        style={{ y }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        <div className="absolute top-1/4 left-[10%] w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-[15%] w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-px bg-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Foundation</span>
            <div className="w-12 h-px bg-accent" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6"
          >
            Three Pillars of Excellence
          </motion.h2>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${pillar.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-accent/50 transition-all duration-300">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <pillar.icon className="w-8 h-8 text-accent" />
                </div>

                {/* Content */}
                <h3 className="text-3xl font-bold text-primary-foreground mb-4">
                  {pillar.title}
                </h3>
                <p className="text-primary-foreground/70 leading-relaxed text-lg">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
