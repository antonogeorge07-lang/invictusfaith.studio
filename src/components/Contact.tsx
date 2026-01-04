'use client'

import { motion } from 'framer-motion';

export function Contact() {
  return (
    <footer className="relative bg-[#0E1923] pt-24 pb-12 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#58C472]/50 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          {/* Left Side: Tagline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Let's build something the world <span className="text-[#E9EB88]">remembers.</span>
            </h2>
            <p className="text-[#F5F7FA]/60 text-lg font-light">
              Ready to turn your vision into an impactful MVP? Join the Invictus Network.
            </p>
          </motion.div>

          {/* Right Side: Simple Glass Form */}
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#58C472] transition-colors"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#58C472] transition-colors"
            />
            <textarea 
              placeholder="Tell us about your project..." 
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#58C472] transition-colors resize-none"
            />
            <button 
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#58C472] to-[#E9EB88] text-[#0E1923] font-bold rounded-2xl hover:scale-[1.02] transition-transform"
            >
              Send Message
            </button>
          </motion.form>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold text-white tracking-tighter">Faith Invictus Studio</span>
            <p className="text-xs text-[#F5F7FA]/40 mt-1 uppercase tracking-[0.2em]">Faith. Invincible. Together.</p>
          </div>
          
          <div className="flex gap-8 text-sm text-[#F5F7FA]/60">
            <a href="#" className="hover:text-[#58C472] transition-colors">MVPs</a>
            <a href="#" className="hover:text-[#58C472] transition-colors">Insights</a>
            <a href="#" className="hover:text-[#58C472] transition-colors">Contact</a>
          </div>

          <p className="text-[10px] text-[#F5F7FA]/30 uppercase font-mono">
            © 2026 Faith Invictus Studio. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
