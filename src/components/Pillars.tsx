'use client'

import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Lightbulb, Wrench, Rocket } from 'lucide-react'

const pillars = [
  {
    title: 'Innovate',
    description: 'We push boundaries with AI-powered solutions that reimagine what\'s possible.',
    icon: Lightbulb,
    color: 'primary',
    gradient: 'from-primary/20 to-transparent',
  },
  {
    title: 'Solve',
    description: 'Every product addresses real challenges with elegant, practical solutions.',
    icon: Wrench,
    color: 'secondary',
    gradient: 'from-secondary/20 to-transparent',
  },
  {
    title: 'Impact',
    description: 'We measure success by the positive change we create in people\'s lives.',
    icon: Rocket,
    color: 'accent',
    gradient: 'from-accent/20 to-transparent',
  },
]

export function Pillars() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <section 
      id="pillars" 
      ref={containerRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(210 47% 10%) 0%, hsl(220 50% 8%) 50%, hsl(210 47% 10%) 100%)',
      }}
    >
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </motion.div>

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-[2px] bg-accent" />
            <span className="text-sm font-medium text-accent tracking-wide uppercase">
              Our Foundation
            </span>
            <span className="w-8 h-[2px] bg-accent" />
          </div>

          <h2 className="font-display font-bold text-foreground">
            Three Pillars of{' '}
            <span className="text-accent">Purpose</span>
          </h2>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            const colorClass = pillar.color === 'primary' 
              ? 'text-primary border-primary/30 bg-primary/10' 
              : pillar.color === 'secondary' 
                ? 'text-secondary border-secondary/30 bg-secondary/10'
                : 'text-accent border-accent/30 bg-accent/10'
            
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="relative group"
              >
                <div className="relative p-10 rounded-3xl bg-card/50 border border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-500 overflow-hidden">
                  {/* Background Gradient */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-b ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-16 h-16 rounded-2xl ${colorClass} border flex items-center justify-center mb-8`}
                    >
                      <Icon className="w-8 h-8" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-2xl text-foreground mb-4">
                      {pillar.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Decorative Line */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      pillar.color === 'primary' ? 'from-primary to-primary/0' :
                      pillar.color === 'secondary' ? 'from-secondary to-secondary/0' :
                      'from-accent to-accent/0'
                    } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center text-muted-foreground mt-16 text-lg"
        >
          Together, these pillars guide every decision we make.
        </motion.p>
      </div>
    </section>
  )
}
