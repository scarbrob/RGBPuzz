import { Link } from 'react-router-dom'
import { GripVertical, BarChart3, EyeOff, Target } from 'lucide-react'

export default function HomePage() {
  const heroColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']

  return (
    <div className="max-w-5xl mx-auto animate-fade-in px-4">
      {/* Hero Section — dramatic, color-forward */}
      <div className="text-center pt-8 sm:pt-12 md:pt-16 mb-16 sm:mb-20 relative overflow-hidden">
        {/* Floating color orbs behind title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          {heroColors.map((color, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: `${60 + i * 15}px`,
                height: `${60 + i * 15}px`,
                background: `radial-gradient(circle, ${color}30, transparent 70%)`,
                left: `${15 + i * 16}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter relative">
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent">
            RGB
          </span>
          <span className="bg-gradient-to-r from-pink-500 via-amber-500 to-cyan-500 dark:from-pink-400 dark:via-amber-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Puzz
          </span>
        </h1>

        {/* Interactive-looking color strip */}
        <div className="flex justify-center gap-3 sm:gap-4 my-8 sm:my-10">
          {heroColors.map((color, i) => (
            <div
              key={i}
              className="animate-slide-up rounded-2xl transition-transform hover:scale-110 hover:-translate-y-1 cursor-default"
              style={{
                width: 'clamp(36px, 8vw, 56px)',
                height: 'clamp(36px, 8vw, 56px)',
                backgroundColor: color,
                animationDelay: `${i * 0.1}s`,
                animationFillMode: 'backwards',
                boxShadow: `0 8px 32px ${color}50, 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
            />
          ))}
        </div>

        <p className="text-lg sm:text-xl md:text-2xl text-light-text-secondary dark:text-dark-text-secondary max-w-lg mx-auto leading-relaxed">
          Sort colors by their <em className="text-light-accent dark:text-dark-accent not-italic font-semibold">hidden</em> RGB values.
          {' '}
          <br className="hidden sm:block" />
          <span className="text-light-text-secondary/70 dark:text-dark-text-secondary/70">Can you trust your eyes?</span>
        </p>
      </div>

      {/* Game Mode Cards — asymmetric, editorial layout */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-5 mb-16 sm:mb-20">
        <Link to="/daily" className="group glass-card p-6 sm:p-8 hover:scale-[1.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg mb-4">
              📅
            </div>
            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">Daily Challenge</h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">New puzzle every day</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              5 colors, 5 attempts. Same puzzle for everyone — compete with friends!
            </p>
            <div className="mt-4 text-light-accent dark:text-dark-accent text-sm font-medium group-hover:translate-x-1 transition-transform">
              Play today's puzzle →
            </div>
          </div>
        </Link>

        <Link to="/levels" className="group glass-card p-6 sm:p-8 hover:scale-[1.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-fuchsia-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-white text-xl shadow-lg mb-4">
              ⚡
            </div>
            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">Level Mode</h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">400 levels, 4 difficulties</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              Progress from easy to insane. Colors get closer as you advance.
            </p>
            <div className="mt-4 text-fuchsia-500 dark:text-fuchsia-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Start playing →
            </div>
          </div>
        </Link>

        <Link to="/spectrum" className="group glass-card p-6 sm:p-8 hover:scale-[1.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-cyan-500 flex items-center justify-center text-white text-xl shadow-lg mb-4">
              🌈
            </div>
            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">Spectrum Mode</h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">Sort by the rainbow</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              Sort by hue instead of RGB. A visual challenge — follow the rainbow!
            </p>
            <div className="mt-4 text-amber-500 dark:text-amber-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Try spectrum →
            </div>
          </div>
        </Link>
      </div>

      {/* How to Play — minimal, icon-forward */}
      <div className="glass-card p-8 sm:p-10 md:p-12 mb-16 sm:mb-20">
        <h3 className="text-2xl sm:text-3xl font-bold mb-10 text-center text-light-text-primary dark:text-dark-text-primary tracking-tight">
          How to Play
        </h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <GripVertical className="w-7 h-7" />, title: 'Drag & Drop', desc: 'Arrange color tiles in order' },
            { icon: <BarChart3 className="w-7 h-7" />, title: 'Sort by Value', desc: 'Lowest value left, highest right' },
            { icon: <EyeOff className="w-7 h-7" />, title: 'No Numbers', desc: 'RGB values are hidden' },
            { icon: <Target className="w-7 h-7" />, title: 'Limited Tries', desc: 'Use your attempts wisely' },
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-light-accent/8 dark:bg-dark-accent/8 text-light-accent dark:text-dark-accent mb-4 group-hover:scale-110 group-hover:bg-light-accent/12 dark:group-hover:bg-dark-accent/12 transition-all">
                {item.icon}
              </div>
              <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-1 text-sm">{item.title}</h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 rounded-xl bg-gradient-to-r from-light-accent/5 via-fuchsia-500/5 to-pink-500/5 dark:from-dark-accent/5 dark:via-fuchsia-500/5 dark:to-pink-500/5 border border-light-accent/10 dark:border-dark-accent/10">
          <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <span className="text-light-accent dark:text-dark-accent font-semibold">RGB value</span> = R×65536 + G×256 + B — a color that <em>looks</em> darker isn't always lower in value!
          </p>
        </div>
      </div>

      {/* Mode Details — editorial cards */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-5 mb-12">
        {[
          {
            title: 'Daily Challenge', emoji: '📅', color: 'violet',
            items: ['New puzzle at midnight UTC', 'Same for everyone worldwide', 'Build your daily streak', 'Share results with friends'],
          },
          {
            title: 'Level Mode', emoji: '⚡', color: 'fuchsia',
            items: ['400 levels, 4 difficulties', 'Unlock by completing previous', 'Track your best attempts', 'Colors get harder to distinguish'],
          },
          {
            title: 'Spectrum Mode', emoji: '🌈', color: 'amber',
            items: ['Sort by hue (rainbow order)', '400 levels, 4 difficulties', 'Colors are vivid & saturated', 'Hue gaps shrink as you progress'],
          },
        ].map((mode, i) => (
          <div key={i} className="glass-card p-5 sm:p-6">
            <h4 className="text-base font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
              {mode.emoji} {mode.title}
            </h4>
            <ul className="space-y-2.5">
              {mode.items.map((text, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-${mode.color}-500`} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
