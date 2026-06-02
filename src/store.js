const STORE_KEY = 'gymforge_data';

const defaultState = {
  onboarded: false,
  profile: {
    gender: null,        // 'male' | 'female'
    age: 25,
    height: 170,         // cm
    weight: 70,          // kg
    bodyType: null,      // 'ectomorph' | 'mesomorph' | 'endomorph'
    fitnessGoal: null,   // 'muscle-gain' | 'fat-loss' | 'endurance' | 'general-fitness'
    daysPerWeek: 3,
    experienceLevel: null, // 'beginner' | 'intermediate' | 'advanced'
    dietPreference: 'non-veg', // 'veg' | 'non-veg'
  },
  workoutLogs: {},      // { '2024-01-15': { exercises: { 'bench-press': [{ weight: 60, reps: 10, done: true }, ...] } } }
  streak: 0,
  lastWorkoutDate: null,
  selectedPlanDay: 0,
};

export const store = {
  _state: null,
  _listeners: [],

  init() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      this._state = saved ? { ...defaultState, ...JSON.parse(saved), profile: { ...defaultState.profile, ...(JSON.parse(saved).profile || {}) } } : { ...defaultState };
    } catch {
      this._state = { ...defaultState };
    }
  },

  get(key) {
    if (!this._state) this.init();
    return key ? this._state[key] : this._state;
  },

  set(key, value) {
    if (!this._state) this.init();
    if (typeof key === 'object') {
      Object.assign(this._state, key);
    } else {
      this._state[key] = value;
    }
    this._save();
    this._notify();
  },

  updateProfile(updates) {
    if (!this._state) this.init();
    this._state.profile = { ...this._state.profile, ...updates };
    this._save();
    this._notify();
  },

  logSet(date, exerciseId, setData) {
    if (!this._state) this.init();
    if (!this._state.workoutLogs[date]) {
      this._state.workoutLogs[date] = { exercises: {} };
    }
    if (!this._state.workoutLogs[date].exercises[exerciseId]) {
      this._state.workoutLogs[date].exercises[exerciseId] = [];
    }
    this._state.workoutLogs[date].exercises[exerciseId].push(setData);
    this._save();
    this._notify();
  },

  updateSet(date, exerciseId, setIndex, setData) {
    if (!this._state) this.init();
    if (this._state.workoutLogs[date]?.exercises?.[exerciseId]?.[setIndex]) {
      this._state.workoutLogs[date].exercises[exerciseId][setIndex] = {
        ...this._state.workoutLogs[date].exercises[exerciseId][setIndex],
        ...setData
      };
      this._save();
      this._notify();
    }
  },

  removeSet(date, exerciseId, setIndex) {
    if (!this._state) this.init();
    if (this._state.workoutLogs[date]?.exercises?.[exerciseId]) {
      this._state.workoutLogs[date].exercises[exerciseId].splice(setIndex, 1);
      this._save();
      this._notify();
    }
  },

  getLog(date) {
    if (!this._state) this.init();
    return this._state.workoutLogs[date] || { exercises: {} };
  },

  updateStreak() {
    if (!this._state) this.init();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this._state.lastWorkoutDate === today) return;
    if (this._state.lastWorkoutDate === yesterday) {
      this._state.streak += 1;
    } else if (this._state.lastWorkoutDate !== today) {
      this._state.streak = 1;
    }
    this._state.lastWorkoutDate = today;
    this._save();
    this._notify();
  },

  subscribe(listener) {
    this._listeners.push(listener);
    return () => { this._listeners = this._listeners.filter(l => l !== listener); };
  },

  reset() {
    this._state = { ...defaultState };
    this._save();
    this._notify();
  },

  _save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this._state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  },

  _notify() {
    this._listeners.forEach(l => l(this._state));
  }
};
