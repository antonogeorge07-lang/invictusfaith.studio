'use client'

import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden pt-20">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Text Content */}
          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6"
            >
              Innovate. Solve.
              <br />
              Impact.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-10 leading-relaxed"
            >
              Faith Invictus Studio builds purposeful digital products that move the world forward.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#mvps"
                onClick={(e) => { e.preventDefault(); document.querySelector('#mvps')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Explore Our MVPs
              </a>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-8 py-4 rounded-full border-2 border-primary text-foreground font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Start a Collaboration
              </a>
            </motion.div>
          </div>

          {/* Right Side: Floating Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-80 h-80 lg:w-[400px] lg:h-[400px]">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-[80px] animate-pulse" />
              
              {/* Main sphere */}
              <div className="absolute inset-8 bg-gradient-to-br from-primary via-[#1a1a1a] to-primary rounded-full shadow-2xl float-gentle">
                {/* Green highlight arc */}
                <div className="absolute top-4 right-4 w-3/4 h-3/4 border-t-4 border-r-4 border-accent/60 rounded-full" />
                {/* Inner glow */}
                <div className="absolute inset-12 bg-gradient-to-br from-accent/20 to-transparent rounded-full" />
              </div>
              
              {/* Floating small orbs */}
              <motion.div 
                animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 right-12 w-16 h-16 bg-gradient-to-br from-accent/40 to-accent/10 rounded-full blur-sm"
              />
              <motion.div 
                animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 -left-4 w-12 h-12 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-sm"
              />
              
              {/* Dot decorations */}
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-accent rounded-full" />
              <div className="absolute bottom-12 right-0 w-3 h-3 bg-accent/60 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom divider line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </section>
  )
}
