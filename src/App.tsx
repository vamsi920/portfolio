import { Nav } from '@/components/Layout/Nav'
import { Footer } from '@/components/Layout/Footer'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { ResumeSection } from '@/components/Resume/ResumeSection'
import { CameraControl } from '@/components/Resume/CameraControl'
import { Skills } from '@/components/Skills'
import { Contact } from '@/components/Contact'
import { ViewerProvider } from '@/context/ViewerContext'

function App() {
  return (
    <ViewerProvider>
      <Nav />
      <main>
        <Hero />
        <About />
        <section className="container mx-auto max-w-6xl px-6 py-4">
          <div className="flex justify-center">
            <CameraControl />
          </div>
        </section>
        <ResumeSection />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </ViewerProvider>
  )
}

export default App
