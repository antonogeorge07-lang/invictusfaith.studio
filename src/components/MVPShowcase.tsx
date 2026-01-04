'use client'

import { motion } from 'framer-motion'
import { Globe, Users, Brain, ShoppingBag, Network, Sparkles } from 'lucide-react'

const mvps = [
  {
    name: 'POLY-LINQ',
    description: 'Real-time AI translation for global gamers. Break language barriers instantly.',
    icon: Globe,
    status: 'Live',
  },
  {
    name: 'MentorVerse',
    description: 'Coaching and mentoring platform for English learning and personal growth.',
    icon: Users,
    status: 'Beta',
  },
  {
    name: 'SAAI',
    description: 'AI-driven automation insights platform. Optimize your workflows with intelligence.',
    icon: Brain,
    status: 'In Development',
  },
  {
    name: 'Faith Commerce',
    description: 'Digital product marketplace designed for creators and conscious consumers.',
    icon: ShoppingBag,
    status: 'Coming Soon',
  },
  {
    name: 'Invictus Network',
    description: 'Ecosystem for innovators and founders. Connect, collaborate, and conquer.',
    icon: Network,
    status: 'Live',
  },
  {
    name: 'More Coming',
    description: 'We\'re always building. Have an idea? Let\'s make it real together.',
    icon: Sparkles,
    status: 'Your Idea?',
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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
}

export function MVPShowcase() {
  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-px bg-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Products</span>
            <div className="w-12 h-px bg-accent" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            MVPs Built for Impact
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            From concept to launch, we build minimum viable products that solve real problems and create real value.
          </motion.p>
        </div>

        {/* MVP Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mvps.map((mvp) => (
            <motion.div
              key={mvp.name}
              variants={itemVariants}
              className="group glass-card rounded-3xl p-8 transition-all duration-300 card-glow hover:scale-[1.02] cursor-pointer"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <mvp.icon className="w-7 h-7 text-accent" />
                </div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider px-3 py-1 rounded-full bg-accent/10">
                  {mvp.status}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                {mvp.name}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {mvp.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
