import { store } from '../store.js';
import { calculateBMI, getBMICategory, getIdealWeightRange } from '../utils/bmi.js';
import { calculateBMR, calculateTDEE, getActivityLevel, getCalorieTarget } from '../utils/calories.js';
import { showToast } from '../utils/helpers.js';
import { createProgressRing } from '../components/progressRing.js';
import { getWorkoutPlan } from '../data/workoutPlans.js';
import { router } from '../router.js';

export default function renderProfile() {
  const page = document.createElement('div');
  page.className = 'page profile-page';

  const profile = store.get('profile');
  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCat = getBMICategory(bmi);
  const idealRange = getIdealWeightRange(profile.height);
  const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
  const actLevel = getActivityLevel(profile.daysPerWeek);
  const tdee = calculateTDEE(bmr, actLevel);
  const calories = getCalorieTarget(tdee, profile.fitnessGoal);
  const streak = store.get('streak') || 0;
  const plan = getWorkoutPlan(profile.daysPerWeek);
  const workoutLogs = store.get('workoutLogs') || {};
  const totalWorkouts = Object.keys(workoutLogs).filter(d => Object.keys(workoutLogs[d].exercises || {}).length > 0).length;

  // Adherence calculation (rough: total workouts / weeks * planned days)
  const daysSinceStart = Math.max(7, Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 86400000));
  const expectedWorkouts = Math.floor(daysSinceStart / 7) * plan.days;
  const adherence = expectedWorkouts > 0 ? Math.min(Math.round((totalWorkouts / expectedWorkouts) * 100), 100) : 0;

  const goalLabels = { 'muscle-gain': 'Muscle Gain', 'fat-loss': 'Fat Loss', 'endurance': 'Endurance', 'general-fitness': 'General Fitness' };
  const actLevelLabels = { sedentary: 'Sedentary', light: 'Lightly Active', moderate: 'Moderately Active', active: 'Active', veryActive: 'Very Active' };

  page.innerHTML = `
    <!-- Avatar -->
    <div class="animate-fade-in-up" style="text-align:center;margin-bottom:24px;">
      <div class="avatar">${profile.gender === 'female' ? '👩' : '💪'}</div>
      <div class="user-name" style="text-align:center;font-size:var(--text-xl);font-weight:700;margin-bottom:4px;text-transform:capitalize;">${profile.gender || ''} ${profile.bodyType || ''}</div>
      <div class="user-stats" style="text-align:center;color:var(--text-secondary);font-size:var(--text-sm);">${profile.age} yrs · ${profile.height} cm · ${profile.weight} kg</div>
    </div>

    <!-- Body Stats Card -->
    <div class="glass-card animate-fade-in-up stagger-1" style="margin-bottom:20px;">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;">Body Stats</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">BMI</div>
          <div style="font-size:1.3rem;font-weight:700;color:${bmiCat.color};">${bmi.toFixed(1)} <span style="font-size:0.8rem;font-weight:500;">(${bmiCat.label})</span></div>
        </div>
        <div>
          <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Ideal Weight</div>
          <div style="font-size:1.3rem;font-weight:700;color:var(--text-primary);">${idealRange.min}-${idealRange.max} kg</div>
        </div>
        <div>
          <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Daily Calories</div>
          <div style="font-size:1.3rem;font-weight:700;color:var(--accent-orange);">${calories} kcal</div>
        </div>
        <div>
          <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Activity Level</div>
          <div style="font-size:1rem;font-weight:700;color:var(--text-primary);">${actLevelLabels[actLevel] || actLevel}</div>
        </div>
        <div>
          <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Streak</div>
          <div style="font-size:1.3rem;font-weight:700;color:var(--accent-green);">🔥 ${streak} days</div>
        </div>
        <div>
          <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">BMR</div>
          <div style="font-size:1.3rem;font-weight:700;color:var(--text-primary);">${Math.round(bmr)} kcal</div>
        </div>
      </div>
    </div>

    <!-- Current Plan Card -->
    <div class="glass-card animate-fade-in-up stagger-2" style="margin-bottom:20px;">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;">Current Plan</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
        <span class="badge badge-orange">${plan.name}</span>
        <span class="badge badge-blue">${plan.days} days/week</span>
        <span class="badge badge-green">${goalLabels[profile.fitnessGoal] || 'General'}</span>
        <span class="badge badge-purple" style="text-transform:capitalize;">${profile.experienceLevel || 'beginner'}</span>
        <span class="badge" style="background:rgba(168,85,247,0.15);color:var(--accent-purple);text-transform:capitalize;">${profile.dietPreference === 'veg' ? '🥦 Veg' : '🍗 Non-Veg'}</span>
      </div>
      <button class="btn-secondary" id="edit-plan-btn" style="width:100%;padding:12px;">✏️ Edit Plan</button>
    </div>

    <!-- Progress Overview -->
    <div class="glass-card animate-fade-in-up stagger-3" style="margin-bottom:20px;text-align:center;">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;">Progress Overview</h3>
      <div id="adherence-ring"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
        <div>
          <div style="font-size:1.5rem;font-weight:700;color:var(--accent-orange);font-family:var(--font-heading);">${totalWorkouts}</div>
          <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Total Workouts</div>
        </div>
        <div>
          <div style="font-size:1.5rem;font-weight:700;color:var(--accent-green);font-family:var(--font-heading);">${streak}</div>
          <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Current Streak</div>
        </div>
      </div>
    </div>

    <!-- Settings -->
    <div class="glass-card animate-fade-in-up stagger-4" style="margin-bottom:20px;">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:12px;">Settings</h3>
      <div class="settings-group">
        <div class="settings-item" id="update-measurements" style="cursor:pointer;">
          <span class="settings-label">📏 Update Measurements</span>
          <span class="settings-value">${profile.height}cm / ${profile.weight}kg →</span>
        </div>
        <div class="settings-item" id="toggle-diet" style="cursor:pointer;">
          <span class="settings-label">🍽️ Diet Preference</span>
          <span class="settings-value">${profile.dietPreference === 'veg' ? '🥦 Vegetarian' : '🍗 Non-Veg'} →</span>
        </div>
        <div class="settings-item" id="reset-data" style="cursor:pointer;">
          <span class="settings-label" style="color:var(--accent-red);">🗑️ Reset All Data</span>
          <span class="settings-value" style="color:var(--accent-red);">→</span>
        </div>
      </div>
    </div>

    <!-- Measurement Edit Modal -->
    <div class="modal-overlay" id="measurement-modal">
      <div class="modal-content">
        <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:20px;">Update Measurements</h3>
        <div style="margin-bottom:16px;">
          <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:8px;">Height (cm)</label>
          <input type="number" class="input-field" id="edit-height" value="${profile.height}" min="100" max="250">
        </div>
        <div style="margin-bottom:20px;">
          <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:8px;">Weight (kg)</label>
          <input type="number" class="input-field" id="edit-weight" value="${profile.weight}" min="30" max="200">
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn-secondary" id="cancel-measurement" style="flex:1;">Cancel</button>
          <button class="btn-primary" id="save-measurement" style="flex:1;">Save</button>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="animate-fade-in-up stagger-5" style="text-align:center;padding:20px 0;color:var(--text-tertiary);font-size:0.8rem;">
      <p>GymForge v1.0 — Your AI Gym Companion</p>
      <p style="margin-top:4px;">Built with ❤️ for fitness enthusiasts</p>
    </div>
  `;

  // Add adherence ring
  const ringContainer = page.querySelector('#adherence-ring');
  const ring = createProgressRing(adherence, 100, 8);
  ringContainer.appendChild(ring);

  // Edit plan
  page.querySelector('#edit-plan-btn')?.addEventListener('click', () => {
    store.set('onboarded', false);
    router.navigate('/onboarding');
  });

  // Update measurements
  page.querySelector('#update-measurements')?.addEventListener('click', () => {
    page.querySelector('#measurement-modal').classList.add('open');
  });
  page.querySelector('#cancel-measurement')?.addEventListener('click', () => {
    page.querySelector('#measurement-modal').classList.remove('open');
  });
  page.querySelector('#measurement-modal')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      page.querySelector('#measurement-modal').classList.remove('open');
    }
  });
  page.querySelector('#save-measurement')?.addEventListener('click', () => {
    const h = parseInt(page.querySelector('#edit-height').value) || profile.height;
    const w = parseInt(page.querySelector('#edit-weight').value) || profile.weight;
    store.updateProfile({ height: h, weight: w });
    page.querySelector('#measurement-modal').classList.remove('open');
    showToast('Measurements updated!', 'success');
    // Refresh page
    const parent = page.parentElement;
    if (parent) {
      parent.innerHTML = '';
      parent.appendChild(renderProfile());
    }
  });

  // Toggle diet
  page.querySelector('#toggle-diet')?.addEventListener('click', () => {
    const newPref = profile.dietPreference === 'veg' ? 'non-veg' : 'veg';
    store.updateProfile({ dietPreference: newPref });
    showToast(`Diet changed to ${newPref === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}`, 'success');
    const parent = page.parentElement;
    if (parent) {
      parent.innerHTML = '';
      parent.appendChild(renderProfile());
    }
  });

  // Reset data
  page.querySelector('#reset-data')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      store.reset();
      showToast('All data has been reset', 'warning');
      router.navigate('/onboarding');
    }
  });

  return page;
}
