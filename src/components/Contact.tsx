'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <footer className="relative bg-primary pt-16 pb-8 overflow-hidden">
      {/* Decorative accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-2 h-2 bg-accent rounded-full" />
      </div>
      
      <div className="container mx-auto px-6">
        {/* Contact Form Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Side: Tagline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              Let's build something the world{' '}
              <span className="text-accent">remembers.</span>
            </h2>
            <p className="text-primary-foreground/60 text-lg">
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
            />
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
            />
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your project..." 
              rows={3}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <button 
              type="submit"
              className="w-full py-3.5 bg-accent text-primary font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(0,255,171,0.3)] transition-all flex items-center justify-center gap-2"
            >
              Send Message
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-primary-foreground tracking-tight">
              FaithInvictus Studio
            </span>
          </a>
          
          {/* Nav Links */}
          <div className="flex items-center gap-8 text-sm text-primary-foreground/60">
            <a href="#vision" className="hover:text-primary-foreground transition-colors">About</a>
            <a href="#mvps" className="hover:text-primary-foreground transition-colors">MVPs</a>
            <a href="#pillars" className="hover:text-primary-foreground transition-colors">Insights</a>
            <a href="#contact" className="hover:text-primary-foreground transition-colors">Contact</a>
          </div>

          {/* CTA Button */}
          <button 
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2.5 bg-accent text-primary font-semibold rounded-full text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,171,0.3)] transition-all"
          >
            Send Message
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  )
}
