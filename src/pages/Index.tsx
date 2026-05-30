import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { Vision } from '@/components/Vision'
import { About } from '@/components/About'
import { MVPShowcase } from '@/components/MVPShowcase'
import { Samples } from '@/components/Samples'
import { Pillars } from '@/components/Pillars'
import { Contact } from '@/components/Contact'
import { Seo } from '@/components/Seo'

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-poppins">
      <Seo
        title="Invictus Faith Studio | Innovate. Solve. Impact."
        description="Purpose-driven innovation studio building AI-powered products and MVPs with real-world impact."
        path="/"
      />
      <Navbar />
      <main className="relative">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="vision" aria-label="Vision section">
          <Vision />
        </section>
        <section id="about" aria-label="About section">
          <About />
        </section>
        <section id="mvps" aria-label="MVP Showcase section">
          <MVPShowcase />
        </section>
        <section id="samples" aria-label="Sample websites">
          <Samples />
        </section>
        <section id="pillars" aria-label="Pillars section">
          <Pillars />
        </section>
        <section id="contact" aria-label="Contact section">
          <Contact />
        </section>
      </main>
    </div>
  )
}
