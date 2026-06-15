import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { DashboardHome } from './components/DashboardHome'
import { NormalizationLab } from './components/NormalizationLab'
import { DataQuestView } from './components/DataQuestView'
import { AcademyView } from './components/AcademyView'
import { GamesView } from './components/GamesView'
import { LeaderboardView } from './components/LeaderboardView'
import { GlossaryPanel } from './components/GlossaryPanel'

import { Landing } from './components/Landing'
import { RegisterPromptModal } from './components/RegisterPromptModal'
import { AuthModal } from './components/AuthModal'
import { ToastProvider } from './components/Toast'
import { SkipLink } from './components/SkipLink'
import { SrAnnouncer } from './components/SrAnnouncer'
import { useAuthStore } from './store/authStore'
import type { ViewType } from './types'
import './index.css'

function App() {
  const { isAuthenticated, isGuest } = useAuthStore()
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [blockedFeature, setBlockedFeature] = useState<'quests' | 'ranking' | null>(null)

  // Redirect to dashboard if user tries to access protected feature as guest
  useEffect(() => {
    if (isGuest && (currentView === 'dataquest' || currentView === 'leaderboard')) {
      setBlockedFeature(currentView === 'dataquest' ? 'quests' : 'ranking')
      setShowRegisterPrompt(true)
      setCurrentView('dashboard')
    }
  }, [currentView, isGuest])

  // Show landing if not authenticated and not guest
  if (!isAuthenticated && !isGuest) {
    return <Landing />
  }

  const renderView = () => {
    // Prevent guests from accessing protected views
    if (isGuest && (currentView === 'dataquest' || currentView === 'leaderboard')) {
      return <DashboardHome onNavigate={setCurrentView} />
    }

    switch (currentView) {
      case 'dashboard':     return <DashboardHome onNavigate={setCurrentView} />
      case 'normalization': return <NormalizationLab />
      case 'academy':       return <AcademyView />
      case 'dataquest':     return <DataQuestView />
      case 'games':         return <GamesView />
      case 'leaderboard':   return <LeaderboardView />
      case 'glossary':      return <GlossaryPanel />
      default:              return <DashboardHome onNavigate={setCurrentView} />
    }
  }

  return (
    <>
      <SkipLink />
      <SrAnnouncer />
      <ToastProvider />

      <div className="flex min-h-screen bg-slate-100">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />
        <main id="main-content" className="main-content flex-1" tabIndex={-1}>
          <div className="animate-fade-in" key={currentView}>
            {renderView()}
          </div>
        </main>
      </div>

      {/* Register Prompt Modal */}
      <RegisterPromptModal
        isOpen={showRegisterPrompt}
        feature={blockedFeature || 'quests'}
        onClose={() => setShowRegisterPrompt(false)}
        onRegister={() => {
          setShowRegisterPrompt(false)
          setShowAuthModal(true)
        }}
      />

      {/* Auth Modal (Login / Register) */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}

export default App
