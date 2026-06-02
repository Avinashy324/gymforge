import { store } from '../store.js';
import { calculateBMI, getBMICategory } from '../utils/bmi.js';
import { calculateBMR, calculateTDEE, getActivityLevel, getCalorieTarget, getMacroSplit } from '../utils/calories.js';
import { getToday, formatDate } from '../utils/helpers.js';
import { createProgressRing } from '../components/progressRing.js';
import { getWorkoutPlan } from '../data/workoutPlans.js';
import { getDietPlan } from '../data/indianDiets.js';
import { router } from '../router.js';

export default function renderDashboard() {
  const page = document.createElement('div');
  page.className = 'page dashboard-page';

  const profile = store.get('profile');
  const today = getToday();
  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCat = getBMICategory(bmi);
  const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
  const tdee = calculateTDEE(bmr, getActivityLevel(profile.daysPerWeek));
  const calories = getCalorieTarget(tdee, profile.fitnessGoal);
  const streak = store.get('streak') || 0;
  const plan = getWorkoutPlan(profile.daysPerWeek);
  const workoutLogs = store.get('workoutLogs') || {};

  // Count days trained this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  let daysTrained = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = d.toISOString().split('T')[0];
    if (workoutLogs[key] && Object.keys(workoutLogs[key].exercises || {}).length > 0) daysTrained++;
  }

  const weeklyProgress = Math.round((daysTrained / plan.days) * 100);
  const dayIndex = (store.get('selectedPlanDay') || 0) % plan.schedule.length;
  const todayWorkout = plan.schedule[dayIndex];

  // Get diet plan for meal preview
  const dietPlan = getDietPlan(profile.fitnessGoal || 'general-fitness', profile.dietPreference || 'non-veg');
  const now = new Date();
  const currentHour = now.getHours();
  let nextMeal = dietPlan?.meals?.[0];
  if (dietPlan?.meals) {
    for (const meal of dietPlan.meals) {
      const mealHour = parseInt(meal.time.split(':')[0]) + (meal.time.includes('PM') && !meal.time.includes('12') ? 12 : 0);
      if (mealHour > currentHour) { nextMeal = meal; break; }
    }
  }

  page.innerHTML = `
    <!-- Greeting -->
    <div class="animate-fade-in-up" style="margin-bottom:24px;">
      <div class="greeting">Hey, Champ! 💪</div>
      <p style="color:var(--text-secondary);margin-bottom:8px;">${formatDate(today)}</p>
      <div class="streak-badge">🔥 ${streak} Day Streak</div>
    </div>

    <!-- Today's Workout Card -->
    <div class="glass-card animate-fade-in-up stagger-1" style="margin-bottom:20px;position:relative;overflow:hidden;cursor:pointer;" id="workout-card">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent-orange),var(--accent-purple));"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <span class="badge badge-orange">${plan.name}</span>
          <h3 style="font-size:1.2rem;font-weight:700;margin:8px 0 4px;color:var(--text-primary);">${todayWorkout.day}</h3>
          <p style="color:var(--text-secondary);font-size:0.85rem;">${todayWorkout.exercises.length} exercises</p>
        </div>
        <button class="btn-primary" style="padding:10px 20px;font-size:0.85rem;" id="start-workout-btn">Start Workout →</button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid animate-fade-in-up stagger-2" style="margin-bottom:24px;">
      <div class="glass-card stat-card">
        <div class="stat-value" style="color:${bmiCat.color};">${bmi.toFixed(1)}</div>
        <div class="stat-label">BMI (${bmiCat.label})</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-value" style="color:var(--accent-orange);">${calories}</div>
        <div class="stat-label">Target Calories</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-value" style="color:var(--accent-green);">${daysTrained}</div>
        <div class="stat-label">Days This Week</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-value">${profile.weight}</div>
        <div class="stat-label">Weight (kg)</div>
      </div>
    </div>

    <!-- Weekly Progress -->
    <div class="glass-card animate-fade-in-up stagger-3" style="margin-bottom:20px;text-align:center;">
      <h3 class="section-title" style="font-size:1rem;margin-bottom:16px;">Weekly Progress</h3>
      <div id="progress-ring-container"></div>
      <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:12px;">${daysTrained} of ${plan.days} days completed</p>
    </div>

    <!-- Next Meal -->
    ${nextMeal ? `
    <div class="glass-card animate-fade-in-up stagger-4" style="margin-bottom:20px;cursor:pointer;" id="meal-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary);">Next Meal</h3>
        <span class="badge badge-green">${nextMeal.time}</span>
      </div>
      <p style="color:var(--text-primary);font-weight:600;">${nextMeal.name}</p>
      <p style="color:var(--accent-orange);font-size:0.85rem;font-weight:600;margin-top:4px;">${nextMeal.calories} kcal</p>
      <p style="color:var(--text-secondary);font-size:0.8rem;margin-top:8px;">View Full Diet Plan →</p>
    </div>
    ` : ''}

    <!-- Quick Actions -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;" class="animate-fade-in-up stagger-5">
      <button class="btn-secondary" id="log-btn" style="padding:14px;">📊 Log Workout</button>
      <button class="btn-secondary" id="diet-btn" style="padding:14px;">🍽️ View Diet</button>
    </div>
  `;

  // Add progress ring
  const ringContainer = page.querySelector('#progress-ring-container');
  const ring = createProgressRing(weeklyProgress, 120, 8);
  ringContainer.appendChild(ring);

  // Event listeners
  page.querySelector('#start-workout-btn')?.addEventListener('click', () => router.navigate('/workout'));
  page.querySelector('#workout-card')?.addEventListener('click', (e) => {
    if (!e.target.closest('#start-workout-btn')) router.navigate('/workout');
  });
  page.querySelector('#meal-card')?.addEventListener('click', () => router.navigate('/diet'));
  page.querySelector('#log-btn')?.addEventListener('click', () => router.navigate('/tracker'));
  page.querySelector('#diet-btn')?.addEventListener('click', () => router.navigate('/diet'));

  return page;
}
