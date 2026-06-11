'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLanguage } from '@/i18n/LanguageContext'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const isStudio = location.pathname === '/studio'

  const navLinks = isStudio
    ? [
        { href: '#hero', label: t('nav.home') },
        { href: '#vision', label: t('nav.about') },
        { href: '#mvps', label: t('nav.mvps') },
        { href: '#pillars', label: t('nav.pillars') },
        { href: '#contact', label: t('nav.contact') },
      ]
    : [
        { href: '#top', label: t('nav.home') },
        { href: '/insights', label: 'Insights', route: true },
        { href: '/studio', label: 'Studio', route: true },
        { href: '#intake', label: t('nav.contact') },
      ]

  const ctaHref = isStudio ? '#contact' : '#intake'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const go = (href: string, isRoute?: boolean) => {
    setIsMobileMenuOpen(false)
    if (isRoute) {
      navigate(href)
      return
    }
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Section doesn't exist on this route; go home then anchor
      navigate('/' + href)
    }
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
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="flex items-center gap-2"
          >
            <span className="text-primary tracking-tight text-emerald-400 text-lg font-semibold text-left border-0">
              Invictus Faith
            </span>
            <span className="text-accent text-emerald-400 text-lg font-medium">Studio</span>
          </a>

          <div className="hidden lg:flex items-center gap-6 font-normal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); go(link.href, (link as { route?: boolean }).route) }}
                className="text-sm font-medium text-emerald-500 hover:text-accent transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
            <LanguageSwitcher />
            <button
              onClick={() => go(ctaHref)}
              className="btn-electric px-6 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap"
            >
              {t('nav.startProject')}
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

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
                  onClick={(e) => { e.preventDefault(); go(link.href, (link as { route?: boolean }).route) }}
                  className="text-2xl font-semibold text-primary-foreground hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4">
                <LanguageSwitcher />
              </div>
              <button
                onClick={() => go(ctaHref)}
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
