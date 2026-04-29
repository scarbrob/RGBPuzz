# Game Design & UI Mockup

> **Note:** Some mockups below show features from the original design vision (e.g., Sign In button, accounts). The shipped product uses local storage only with no authentication required.

## Visual Design Philosophy

### Color Scheme
- **Background**: Dark (`#1a1a2e`) - Makes colors pop
- **Card Background**: Slightly lighter dark (`#16213e`)
- **Accent**: Deep blue (`#0f3460`)
- **Primary/CTA**: Vibrant pink-red (`#e94560`)
- **Text**: White with opacity variations

### Typography
- **Headings**: Bold, large (4xl-6xl)
- **Body**: Clean, readable
- **Font Stack**: Inter, system fonts

## Page Layouts

### Home Page
```
┌─────────────────────────────────────────────┐
│  [RGBPuzz]      Daily  Levels  Stats [Sign In]│
├─────────────────────────────────────────────┤
│                                             │
│            R G B P u z z                    │
│    Sort colors by their RGB values          │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │     📅       │  │     ⚡       │        │
│  │    Daily     │  │   Levels     │        │
│  │  Challenge   │  │    Mode      │        │
│  │              │  │              │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │       How to Play                    │  │
│  │  🎨 Drag and drop to arrange         │  │
│  │  📊 Sort by RGB value (low→high)     │  │
│  │  🎯 Limited attempts                 │  │
│  │  🏆 Track your stats                 │  │
│  │  💡 No RGB values shown!             │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Daily Challenge Page
```
┌─────────────────────────────────────────────┐
│  [RGBPuzz]      Daily  Levels  Stats [Sign In]│
├─────────────────────────────────────────────┤
│                                             │
│         Daily Challenge                     │
│    Friday, November 24, 2025                │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Attempts: 2/5                       │  │
│  │  Drag colors from left→right         │  │
│  ├──────────────────────────────────────┤  │
│  │                                      │  │
│  │   [🔴]  [🟡]  [🔵]  [🟢]  [🟣]      │  │
│  │    ↕️     ↕️     ↕️     ↕️     ↕️       │  │
│  │   Drag to reorder                    │  │
│  │                                      │  │
│  │         [Submit Answer]              │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Previous Attempts:                         │
│  ⬜⬜✅⬜⬜  (Attempt 1)                      │
│  ⬜✅✅⬜✅  (Attempt 2)                      │
│                                             │
└─────────────────────────────────────────────┘
```

### Levels Page
```
┌─────────────────────────────────────────────┐
│  [RGBPuzz]      Daily  Levels  Stats [Sign In]│
├─────────────────────────────────────────────┤
│                                             │
│         Level Progression                   │
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │ Lvl 1│  │ Lvl 2│  │ Lvl 3│             │
│  │ Easy │  │ Easy │  │ Easy │             │
│  │ Reds │  │ Blues│  │Green │             │
│  │ ⭐⭐⭐│  │ ⭐⭐☆│  │      │             │
│  └──────┘  └──────┘  └──────┘             │
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │ Lvl 4│  │ Lvl 5│  │ Lvl 6│             │
│  │Medium│  │Medium│  │Medium│             │
│  │ 🔒   │  │ 🔒   │  │ 🔒   │             │
│  └──────┘  └──────┘  └──────┘             │
│                                             │
└─────────────────────────────────────────────┘
```

### Stats Page
```
┌─────────────────────────────────────────────┐
│  [RGBPuzz]      Daily  Levels  Stats [Sign In]│
├─────────────────────────────────────────────┤
│                                             │
│         Your Statistics                     │
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │  🔥7 │  │ ⭐15 │  │ 85% │              │
│  │Current│  │Longest│  │ Win │              │
│  │Streak │  │Streak │  │ Rate│              │
│  └──────┘  └──────┘  └──────┘             │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │       Overall Stats                  │  │
│  │                                      │  │
│  │  Games Won:      42                  │  │
│  │  Total Attempts: 126                 │  │
│  │  Avg Attempts:   3.0                 │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │       Recent Games                   │  │
│  │  Nov 24  ✓  3 attempts               │  │
│  │  Nov 23  ✓  2 attempts               │  │
│  │  Nov 22  ✓  4 attempts               │  │
│  │  Nov 21  ✗  5 attempts               │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Color Tile Design

### Default State
```
┌─────────┐
│         │
│  [███]  │  <- Color fills tile
│         │
└─────────┘
    ^
  80x80px
  Rounded corners
  Shadow effect
```

### Hover State
```
┌─────────┐
│    1    │  <- Position number appears
│  [███]  │
│         │
└─────────┘
    ^
  Scales to 105%
  Cursor: move
```

### Dragging State
```
┌─────────┐
│    ·    │  <- 50% opacity
│  [···]  │
│    ·    │
└─────────┘
```

## Feedback Indicators

### Correct Position
```
[🟩] <- Green checkmark overlay
```

### Wrong Position
```
[🟥] <- Red X overlay (optional, might give away answer)
```

### Current Position (Wordle-style feedback)
```
Attempt 1: ⬜⬜✅⬜⬜  (1 correct position)
Attempt 2: ⬜✅✅⬜✅  (3 correct positions)
Attempt 3: ✅✅✅✅✅  (Solved!)
```

## Share Result Format

### Text Format
```
RGBPuzz #245 🎨
⬜⬜✅⬜⬜
⬜✅✅⬜✅
✅✅✅✅✅

3/5 attempts
Play at rgbpuzz.com
```

### Visual on Social Media
```
┌──────────────────────────┐
│  I solved today's        │
│  RGBPuzz in 3 attempts!  │
│                          │
│  🎨 ✅ ✅ ✅ ✅ ✅        │
│                          │
│  Play: rgbpuzz.com       │
└──────────────────────────┘
```

## Animations

### On Load
- Fade in colors from bottom
- Stagger animation (0.1s delay each)

### On Drag
- Smooth transition (150ms)
- Subtle elevation increase

### On Submit
- Brief shake if incorrect
- Confetti explosion if correct
- Fade in feedback indicators

### On Win
- All tiles pulse green
- Confetti rain
- Stats modal slides up

## Mobile Responsive

### Phone View (< 768px)
- Stack colors vertically
- Larger touch targets (100x100px)
- Simplified navigation (hamburger menu)
- Bottom sheet for stats

### Tablet View (768-1024px)
- 2 column layout for cards
- Horizontal color arrangement
- Side navigation

### Desktop View (> 1024px)
- 3 column layout for cards
- Centered max-width container (1024px)
- Hover effects enabled

## Accessibility

### Color Blindness Support
- Option to add pattern overlays
- High contrast mode
- Text labels on demand

### Keyboard Navigation
- Tab through colors
- Arrow keys to reorder
- Enter to submit
- Escape to cancel

### Screen Readers
- ARIA labels on all interactive elements
- Live region announcements for feedback
- Semantic HTML

## Loading States

### Initial Load
```
┌─────────────────┐
│   Loading...    │
│   [spinner]     │
└─────────────────┘
```

### Submitting Answer
```
┌─────────────────┐
│   Checking...   │
│   [dots]        │
└─────────────────┘
```

### Error State
```
┌─────────────────┐
│   ⚠️ Error      │
│   Try again     │
└─────────────────┘
```

## Easter Eggs (Future)

- Perfect game (solve in 1 attempt) = "RGB Master" badge
- Play 100 days = "Dedicated" badge
- 30 day streak = "On Fire" animation
- Solve in <30 seconds = "Speed Demon" badge
- Discover hidden konami code = Special level unlock

## Design Principles

1. **Color First**: Let the colors be the hero
2. **Dark Background**: Makes colors vibrant
3. **Minimal UI**: Don't distract from puzzle
4. **Clear Feedback**: Always show progress
5. **Mobile Optimized**: Touch-friendly
6. **Fast Loading**: <1s initial load
7. **Smooth Animations**: 60fps always
8. **Accessible**: WCAG 2.1 AA compliant

---

**RGBPuzz** - Open source daily puzzle game  
Created by the RGBPuzz Team | [GitHub](https://github.com/scarbrob/RGBPuzz) | MIT License
