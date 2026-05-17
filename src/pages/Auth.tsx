'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Seo } from '@/components/Seo'

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) navigate('/admin')
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate('/admin')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        })
        if (error) throw error
        toast.success('Account created. Check your email to verify, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        toast.success('Welcome back!')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password.')
      } else if (error.message?.includes('already registered') || error.message?.includes('User already')) {
        toast.error('That email is already registered. Sign in instead.')
        setMode('signin')
      } else {
        toast.error(error.message || 'An error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <Seo title="Sign in | Invictus Faith Studio" description="Admin sign in for Invictus Faith Studio." path="/auth" noindex />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <a
          href="/"
          className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </a>

        <div className="glass-card rounded-3xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-primary-foreground mb-2">
            {mode === 'signup' ? 'Create Owner Account' : 'Owner Login'}
          </h1>
          <p className="text-primary-foreground/60 mb-8">
            {mode === 'signup'
              ? 'Register your account to access the Owner Console.'
              : 'Sign in to access the Owner Console.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-foreground/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-foreground/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-primary-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 btn-electric rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-primary-foreground/60">
            {mode === 'signup' ? (
              <>Already have an account?{' '}
                <button onClick={() => setMode('signin')} className="text-accent hover:underline font-medium">
                  Sign in
                </button>
              </>
            ) : (
              <>Need to register?{' '}
                <button onClick={() => setMode('signup')} className="text-accent hover:underline font-medium">
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
