'use client'

import { motion } from 'framer-motion'

export function Vision() {
  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Text */}
          <div className="max-w-lg">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            >
              Our Belief
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Innovation grounded in faith — in purpose, people, and perseverance — creates solutions that last.
            </motion.p>
          </div>

          {/* Right Side: Floating Orb */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-64 h-64 lg:w-80 lg:h-80">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-accent/15 rounded-full blur-[60px]" />
              
              {/* Main sphere */}
              <div className="absolute inset-4 bg-gradient-to-br from-primary via-[#1a1a1a] to-primary rounded-full shadow-xl float-gentle">
                {/* Green arc highlight */}
                <div className="absolute top-2 right-2 w-3/4 h-3/4 border-t-2 border-r-2 border-accent/50 rounded-full" />
                {/* Inner reflection */}
                <div className="absolute inset-8 bg-gradient-to-br from-accent/15 to-transparent rounded-full" />
              </div>
              
              {/* Floating accent orbs */}
              <motion.div 
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 right-8 w-10 h-10 bg-gradient-to-br from-accent/40 to-accent/10 rounded-full blur-sm"
              />
              
              {/* Dot decorations */}
              <div className="absolute top-4 left-8 w-2 h-2 bg-accent rounded-full" />
              <div className="absolute bottom-8 right-4 w-2 h-2 bg-accent/60 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </section>
  )
}
