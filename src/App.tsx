import { Hero } from './components/Hero'
import { Vision } from './components/Vision'
import { MVPShowcase } from './components/MVPShowcase'
import { Pillars } from './components/Pillars'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="relative" role="main">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="vision-section" aria-label="Vision section">
          <Vision />
        </section>
        <section id="mvps-section" aria-label="MVP Showcase section">
          <MVPShowcase />
        </section>
        <section id="pillars-section" aria-label="Pillars section">
          <Pillars />
        </section>
        <section id="contact-section" aria-label="Contact section">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  )
}
