'use client'

import { motion } from 'framer-motion'

export function Vision() {
  return (
    <section className="relative py-32 bg-secondary/30 overflow-hidden">
      {/* Floating orb decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="absolute right-[10%] top-1/2 -translate-y-1/2 hidden lg:block"
      >
        <div className="relative w-64 h-64">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl pulse-glow" />
          {/* Main orb */}
          <div className="absolute inset-8 bg-gradient-to-br from-primary via-primary to-accent rounded-full float-gentle" />
          {/* Inner highlight */}
          <div className="absolute inset-12 bg-gradient-to-br from-accent/30 to-transparent rounded-full" />
        </div>
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-px bg-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Belief</span>
          </motion.div>

          {/* Main quote */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8"
          >
            Innovation grounded in{' '}
            <span className="text-accent">faith</span>
            {' '}— in purpose, people, and perseverance — creates solutions that last.
          </motion.h2>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            We believe technology should serve humanity, not the other way around. Every product we build is designed to create meaningful impact and empower people to achieve their fullest potential.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
