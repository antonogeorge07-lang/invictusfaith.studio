'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLanguage } from '@/i18n/LanguageContext'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useLanguage()

  const navLinks = [
    { href: '#hero', label: t('nav.home') },
    { href: '#vision', label: t('nav.about') },
    { href: '#mvps', label: t('nav.mvps') },
    { href: '#pillars', label: t('nav.pillars') },
    { href: '#contact', label: t('nav.contact') },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass-navbar py-4 text-emerald-400' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between text-lime-300">
          {/* Logo */}
          <a 
            href="#hero"
            onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}
            className="flex items-center gap-2"
          >
            <span className="text-primary tracking-tight text-emerald-400 text-lg font-semibold text-left border-0">
              Invictus Faith
            </span>
            <span className="text-accent text-emerald-400 text-lg font-medium">Studio</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 font-normal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className="text-sm font-medium text-emerald-500 hover:text-accent transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
            <LanguageSwitcher />
            <button
              onClick={() => scrollToSection('#contact')}
              className="btn-electric px-6 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap"
            >
              {t('nav.startProject')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-primary pt-24 lg:hidden"
          >
            <div className="container mx-auto px-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className="text-2xl font-semibold text-primary-foreground hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4">
                <LanguageSwitcher />
              </div>
              <button
                onClick={() => scrollToSection('#contact')}
                className="btn-electric px-8 py-4 rounded-2xl text-lg font-semibold mt-4 w-fit"
              >
                {t('nav.startProject')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
