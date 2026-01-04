import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Vision } from './components/Vision'
import { MVPShowcase } from './components/MVPShowcase'
import { Pillars } from './components/Pillars'
import { Contact } from './components/Contact'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-poppins">
      <Navbar />
      <main className="relative">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="vision" aria-label="Vision section">
          <Vision />
        </section>
        <section id="mvps" aria-label="MVP Showcase section">
          <MVPShowcase />
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
