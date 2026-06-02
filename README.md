<p align="center">
  <img src="public/icons/icon-512.png" alt="GymForge Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">GymForge 🏋️‍♂️</h1>

<p align="center">
  <strong>AI-Powered Gym Guide — Personalized Workouts, Daily Tracking & Indian Diet Plans</strong>
</p>

<p align="center">
  <a href="https://gymforge-eta.vercel.app">🌐 Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-install-on-ios">Install on iOS</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## ✨ Features

### 🎯 Personalized Onboarding
- 6-step wizard: gender, age, height, weight, body type & fitness goals
- Real-time BMI calculation with visual feedback
- 3 body types: Ectomorph, Mesomorph, Endomorph

### 💪 Workout Plans
- **4 split types**: Full Body (3-day), Upper/Lower (4-day), PPL (5-day), PPL×2 (6-day)
- **60+ exercises** with YouTube demo video thumbnails
- Embedded video player for exercise demonstrations
- Exercises organized by muscle group with sets, reps & rest times

### 📊 Daily Tracker
- Calendar strip for weekly navigation
- Log sets, reps & weight for each exercise
- Add/remove sets dynamically
- Session summary with total volume & completion percentage
- Streak tracking with auto-detection

### 🍛 Indian Diet Plans
- **8 complete meal plans**: 4 goals × Veg/Non-Veg
- Goals: Muscle Gain, Fat Loss, Endurance, General Fitness
- **Full nutrition breakdown** per meal: vitamins (A, B1–B12, C, D, E, K) & minerals (Calcium, Iron, Zinc, etc.)
- Macro rings (Protein, Carbs, Fat) with daily targets
- Expandable nutrition details with % Daily Value
- Meal timeline with time-of-day indicators

### 👤 Profile & Settings
- Body stats dashboard (BMI, BMR, TDEE, ideal weight range)
- Edit measurements, toggle diet preference
- Progress overview with adherence tracking
- Reset all data option

### 🎨 Premium Design
- **Dark glassmorphism UI** with vibrant orange accent
- **Animated canvas background**: flowing gradient blobs, interactive dot grid, energy waves, floating gym icons
- Mouse-reactive dot grid that glows orange near cursor
- Smooth page transitions & micro-animations
- Fully responsive (mobile-first design)

### 📱 PWA / iOS Install
- **Installable on iOS** — Add to Home Screen for full-screen experience
- Service Worker with offline caching
- Smart iOS install banner auto-detection
- Works on Android, tablet & desktop too

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Build Tool** | Vite 6.4 |
| **Language** | Vanilla JavaScript (ES Modules) |
| **Styling** | Vanilla CSS with custom design tokens |
| **Fonts** | Inter + Space Grotesk (Google Fonts) |
| **Background** | Canvas 2D animated scene |
| **State** | localStorage-based reactive store |
| **Routing** | Hash-based SPA router |
| **PWA** | Service Worker + Web App Manifest |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/Avinashy324/gymforge.git
cd gymforge

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be running at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## 📱 Install on iOS

1. Open **Safari** on your iPhone/iPad
2. Navigate to **https://gymforge-eta.vercel.app**
3. Tap the **Share** button (↗)
4. Tap **"Add to Home Screen"**
5. Tap **"Add"**

The app launches in standalone mode — no browser chrome, just like a native app!

---

## 📁 Project Structure

```
gymforge/
├── index.html                  # Entry point with PWA meta tags
├── vercel.json                 # Vercel deployment config
├── vite.config.js              # Vite configuration
├── package.json
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── apple-touch-icon.png    # iOS icon
│   └── icons/                  # App icons (192, 512)
└── src/
    ├── main.js                 # App initialization & routing
    ├── router.js               # Hash-based SPA router
    ├── store.js                # localStorage state management
    ├── components/
    │   ├── navbar.js           # Bottom navigation bar
    │   └── progressRing.js     # SVG progress & macro rings
    ├── data/
    │   ├── exercises.js        # 60+ exercises with video IDs
    │   ├── workoutPlans.js     # 4 workout split templates
    │   ├── indianDiets.js      # 8 diet plans with nutrition data
    │   └── nutrients.js        # Vitamin & mineral reference
    ├── pages/
    │   ├── onboarding.js       # 6-step onboarding wizard
    │   ├── dashboard.js        # Home dashboard
    │   ├── workout.js          # Workout plan viewer
    │   ├── tracker.js          # Set/rep logging
    │   ├── diet.js             # Diet plan with nutrition
    │   └── profile.js          # Profile & settings
    ├── styles/
    │   ├── index.css           # CSS entry point
    │   ├── reset.css           # CSS reset
    │   ├── tokens.css          # Design tokens (colors, spacing)
    │   ├── animations.css      # Keyframes & animation utilities
    │   ├── components.css      # Component styles
    │   └── pages.css           # Page-specific layouts
    ├── three/
    │   └── background.js       # Canvas 2D animated background
    └── utils/
        ├── bmi.js              # BMI calculation
        ├── calories.js         # BMR, TDEE, macro split
        └── helpers.js          # DOM helpers, toast, date utils
```

---

## 🌐 Deployment

The app is deployed on **Vercel** with:
- SPA rewrites for hash routing
- Proper Service Worker headers
- Security headers (X-Content-Type-Options, X-Frame-Options)

**Live URL**: [https://gymforge-eta.vercel.app](https://gymforge-eta.vercel.app)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for fitness enthusiasts
</p>
