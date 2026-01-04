'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function Vision() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section 
      id="vision" 
      ref={ref}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(210 47% 10%) 0%, hsl(210 47% 12%) 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Floating Orb Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex items-center justify-center order-2 lg:order-1"
          >
            {/* Main Orb */}
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Outer Glow Ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, hsl(140 49% 55% / 0.3), hsl(194 56% 51% / 0.3), hsl(62 78% 73% / 0.3), hsl(140 49% 55% / 0.3))',
                  filter: 'blur(40px)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle Ring */}
              <motion.div
                className="absolute inset-8 rounded-full border border-primary/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Inner Orb */}
              <motion.div
                className="absolute inset-16 rounded-full animate-orb-float"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, hsl(140 49% 65% / 0.8), hsl(194 56% 51% / 0.6), hsl(210 47% 20% / 0.9))',
                  boxShadow: '0 0 80px hsl(140 49% 55% / 0.4), inset 0 0 60px hsl(194 56% 51% / 0.3)',
                }}
              >
                {/* Highlight */}
                <div 
                  className="absolute top-6 left-8 w-12 h-12 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, hsl(0 0% 100% / 0.4), transparent)',
                  }}
                />
              </motion.div>
              
              {/* Orbiting Particles */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-accent"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [
                      Math.cos((i * 120 * Math.PI) / 180) * 140,
                      Math.cos(((i * 120 + 360) * Math.PI) / 180) * 140,
                    ],
                    y: [
                      Math.sin((i * 120 * Math.PI) / 180) * 140,
                      Math.sin(((i * 120 + 360) * Math.PI) / 180) * 140,
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-[2px] bg-primary" />
              <span className="text-sm font-medium text-primary tracking-wide uppercase">
                Our Belief
              </span>
            </div>

            <h2 className="font-display font-bold text-foreground mb-8">
              Innovation grounded in{' '}
              <span className="text-primary">faith</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              In purpose, people, and perseverance — creates solutions that last. We believe technology should serve humanity's highest aspirations, not replace them.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Every product we build carries our conviction: that the best innovations emerge when cutting-edge technology meets timeless values.
            </p>

            {/* Key Values */}
            <div className="flex flex-wrap gap-3">
              {['Purpose', 'People', 'Perseverance'].map((value, i) => (
                <motion.span
                  key={value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {value}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
