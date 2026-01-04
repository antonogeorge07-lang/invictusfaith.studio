'use client'

import { motion } from 'framer-motion'

export function Footer() {
  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'MVPs', href: '#mvps' },
    { name: 'Insights', href: '#vision' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <footer className="relative py-16 overflow-hidden" style={{ background: 'hsl(210 47% 8%)' }}>
      {/* Glowing Divider Line */}
      <div className="absolute top-0 left-0 right-0 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h3 className="font-display font-bold text-2xl text-foreground">
              Faith Invictus
              <span className="text-primary"> Studio</span>
            </h3>
          </motion.div>

          {/* Navigation Links */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-8 mb-8"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </motion.nav>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 font-light italic"
          >
            "Faith. Invincible. Together."
          </motion.p>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-8 border-t border-border/50 w-full max-w-md"
          >
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Faith Invictus Studio. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
