'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <footer className="relative bg-primary pt-24 pb-12 overflow-hidden">
      {/* Decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          {/* Left Side: Tagline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Let's build something the world{' '}
              <span className="text-accent">remembers.</span>
            </h2>
            <p className="text-primary-foreground/60 text-lg font-light">
              Ready to turn your vision into an impactful MVP? Join the Invictus Network.
            </p>
          </motion.div>

          {/* Right Side: Form */}
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
            />
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
            />
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your project..." 
              rows={4}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <button 
              type="submit"
              className="w-full py-4 btn-electric rounded-2xl font-bold text-lg"
            >
              Send Message
            </button>
          </motion.form>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold text-primary-foreground tracking-tight">
              Faith Invictus Studio
            </span>
            <p className="text-xs text-primary-foreground/40 mt-1 uppercase tracking-[0.2em]">
              Faith. Invincible. Together.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm text-primary-foreground/60">
            <a href="#hero" className="hover:text-accent transition-colors">Home</a>
            <a href="#mvps" className="hover:text-accent transition-colors">MVPs</a>
            <a href="#pillars" className="hover:text-accent transition-colors">Insights</a>
            <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
          </div>

          <p className="text-[10px] text-primary-foreground/30 uppercase font-mono">
            © 2026 Faith Invictus Studio. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
