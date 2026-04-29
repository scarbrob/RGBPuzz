import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import HomePage from './pages/HomePage'
import DailyChallengePage from './pages/DailyChallengePage'
import LevelsPage from './pages/LevelsPage'
import LevelPlayPage from './pages/LevelPlayPage'
import SpectrumLevelsPage from './pages/SpectrumLevelsPage'
import SpectrumPlayPage from './pages/SpectrumPlayPage'
import SpectrumDailyPage from './pages/SpectrumDailyPage'
import StatsPage from './pages/StatsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import NotFoundPage from './pages/NotFoundPage'
import Header from './components/Header'
import Footer from './components/Footer'

function LevelPlayPageWrapper() {
  const { difficulty, level } = useParams()
  return <LevelPlayPage key={`${difficulty}-${level}`} />
}

function SpectrumPlayPageWrapper() {
  const { difficulty, level } = useParams()
  return <SpectrumPlayPage key={`spectrum-${difficulty}-${level}`} />
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary transition-colors duration-300">
          {/* Ambient floating color blobs */}
          <div className="ambient-bg">
            <div className="ambient-blob" />
            <div className="ambient-blob" />
            <div className="ambient-blob" />
          </div>
          <div className="noise-overlay" />
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/daily" element={<DailyChallengePage />} />
              <Route path="/levels" element={<LevelsPage />} />
              <Route path="/level/:difficulty/:level" element={<LevelPlayPageWrapper />} />
              <Route path="/spectrum" element={<SpectrumLevelsPage />} />
              <Route path="/spectrum/daily" element={<SpectrumDailyPage />} />
              <Route path="/spectrum/:difficulty/:level" element={<SpectrumPlayPageWrapper />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
