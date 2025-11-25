import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import HomePage from './pages/HomePage'
import DailyChallengePage from './pages/DailyChallengePage'
import LevelsPage from './pages/LevelsPage'
import LevelPlayPage from './pages/LevelPlayPage'
import StatsPage from './pages/StatsPage'
import Header from './components/Header'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary transition-colors duration-300">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/daily" element={<DailyChallengePage />} />
                <Route path="/levels" element={<LevelsPage />} />
                <Route path="/level/:difficulty/:level" element={<LevelPlayPage />} />
                <Route path="/stats" element={<StatsPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
