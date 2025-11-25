import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import DailyChallengePage from './pages/DailyChallengePage'
import LevelsPage from './pages/LevelsPage'
import StatsPage from './pages/StatsPage'
import Header from './components/Header'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-game-bg">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/daily" element={<DailyChallengePage />} />
              <Route path="/levels" element={<LevelsPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
