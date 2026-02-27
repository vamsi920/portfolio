import { Nav } from '@/components/Layout/Nav'
import { Footer } from '@/components/Layout/Footer'
import { HeroWithEyeTracking } from '@/components/Hero/HeroWithEyeTracking'
import { About } from '@/components/About'
import { ResumeSection } from '@/components/Resume/ResumeSection'
import { CameraControl } from '@/components/Resume/CameraControl'
import { Skills } from '@/components/Skills'
import { Contact } from '@/components/Contact'
import { ViewerProvider, useViewer } from '@/context/ViewerContext'
import { EyeTrackingProvider } from '@/context/EyeTrackingContext'
import { HandGestureProvider, useHandGestures } from '@/context/HandGestureContext'
import { FaceDepthProvider, useFaceDepth } from '@/context/FaceDepthContext'
import { HandGestureConsent } from '@/components/HandGestures/HandGestureConsent'
import { FaceDepthConsent } from '@/components/FaceDepth/FaceDepthConsent'
import { ParticleField } from '@/components/Ambient/ParticleField'
import { SoundFeedbackProvider } from '@/context/SoundFeedbackContext'
import { AttentionModeProvider } from '@/context/AttentionModeContext'
import { AttentionModeChip } from '@/components/Attention/AttentionModeChip'
import { AmazeModeProvider } from '@/context/AmazeModeContext'
import { AmazeModeButton } from '@/components/Amaze/AmazeModeButton'

function EyeTrackingWrapper({ children }: { children: React.ReactNode }) {
  const { state } = useViewer()
  return (
    <EyeTrackingProvider mouseNorm={{ x: state.x, y: state.y }}>
      <AttentionModeProvider>
        <AmazeModeProvider>
          <AttentionModeChip />
          <AmazeModeButton />
          {children}
        </AmazeModeProvider>
      </AttentionModeProvider>
    </EyeTrackingProvider>
  )
}

function HandGestureChip() {
  const { state, requestConsent, stopHandGestures } = useHandGestures()
  if (state.status !== 'idle' && state.status !== 'active') return null
  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8">
      {state.status === 'active' ? (
        <button
          type="button"
          onClick={stopHandGestures}
          className="rounded-full glass px-4 py-2 font-body text-xs text-white/80 transition hover:bg-white/10"
          aria-label="Turn off hand gestures"
        >
          Hand gestures on · Off
        </button>
      ) : (
        <button
          type="button"
          onClick={requestConsent}
          className="rounded-full glass px-4 py-2 font-body text-xs text-white/80 transition hover:bg-white/10"
          aria-label="Enable hand gesture controls"
        >
          Hand gestures
        </button>
      )}
    </div>
  )
}

function FaceDepthChip() {
  const { state, requestConsent, stopDepthMode } = useFaceDepth()
  if (state.status !== 'idle' && state.status !== 'active') return null
  return (
    <div className="fixed bottom-24 left-4 z-50 md:bottom-8 md:left-8">
      {state.status === 'active' ? (
        <button
          type="button"
          onClick={stopDepthMode}
          className="rounded-full glass px-4 py-2 font-body text-xs text-white/80 transition hover:bg-white/10"
          aria-label="Turn off depth mode"
        >
          Depth on · Off
        </button>
      ) : (
        <button
          type="button"
          onClick={requestConsent}
          className="rounded-full glass px-4 py-2 font-body text-xs text-white/80 transition hover:bg-white/10"
          aria-label="Enable face-distance depth mode"
        >
          Depth mode
        </button>
      )}
    </div>
  )
}

function SceneDepthWrapper({ children }: { children: React.ReactNode }) {
  const { state } = useFaceDepth()
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scale = reducedMotion || state.status !== 'active' ? 1 : state.sceneScale

  return (
    <div
      className="transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: '50% 0',
      }}
    >
      {children}
    </div>
  )
}

function App() {
  return (
    <ViewerProvider>
      <SoundFeedbackProvider>
        <HandGestureProvider>
          <FaceDepthProvider>
            <EyeTrackingWrapper>
            <ParticleField />
            <FaceDepthConsent />
            <HandGestureConsent />
            <HandGestureChip />
            <FaceDepthChip />
            <Nav />
            <div className="relative z-10">
            <SceneDepthWrapper>
              <main>
                <HeroWithEyeTracking />
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
            </SceneDepthWrapper>
            </div>
            </EyeTrackingWrapper>
          </FaceDepthProvider>
        </HandGestureProvider>
      </SoundFeedbackProvider>
    </ViewerProvider>
  )
}

export default App
