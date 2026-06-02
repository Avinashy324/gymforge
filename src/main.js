import './styles/index.css';
import { store } from './store.js';
import { router } from './router.js';
import { AnimatedBackground } from './three/background.js';
import { showNavbar, hideNavbar, updateNavbar } from './components/navbar.js';

// Import pages
import renderOnboarding from './pages/onboarding.js';
import renderDashboard from './pages/dashboard.js';
import renderWorkout from './pages/workout.js';
import renderTracker from './pages/tracker.js';
import renderDiet from './pages/diet.js';
import renderProfile from './pages/profile.js';

// ── App Initialization ──────────────────────────────────────────────
class GymForgeApp {
  constructor() {
    this.background = null;
  }

  async init() {
    // Initialize store
    store.init();

    // Initialize animated background
    this.initBackground();

    // Register routes
    this.registerRoutes();

    // Initialize router
    router.init('app');

    // Show/hide navbar based on route
    this.handleNavbarVisibility();

    // Listen for route changes
    window.addEventListener('hashchange', () => {
      this.handleNavbarVisibility();
      updateNavbar();
    });

    // Determine initial route
    if (!store.get('onboarded')) {
      router.navigate('/onboarding');
    } else if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#') {
      router.navigate('/dashboard');
    }
  }

  initBackground() {
    try {
      this.background = new AnimatedBackground();
      this.background.init('three-canvas');
    } catch (e) {
      console.warn('Background initialization failed:', e);
    }
  }

  registerRoutes() {
    router.register('/onboarding', () => renderOnboarding());
    router.register('/dashboard', renderDashboard);
    router.register('/workout', renderWorkout);
    router.register('/tracker', renderTracker);
    router.register('/diet', renderDiet);
    router.register('/profile', renderProfile);
  }

  handleNavbarVisibility() {
    const path = router.getCurrentPath();
    if (path === '/onboarding') {
      hideNavbar();
    } else {
      showNavbar();
    }
  }
}

// ── Launch ───────────────────────────────────────────────────────────
const app = new GymForgeApp();
app.init().catch(console.error);
