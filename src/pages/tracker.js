import { store } from '../store.js';
import { getWorkoutPlan, getExerciseById } from '../data/workoutPlans.js';
import { getToday, getWeekDates, getDayName, showToast } from '../utils/helpers.js';
import { router } from '../router.js';

export default function renderTracker() {
  const page = document.createElement('div');
  page.className = 'page tracker-page';

  const profile = store.get('profile');
  const plan = getWorkoutPlan(profile.daysPerWeek);
  const weekDates = getWeekDates();
  const today = getToday();
  let selectedDate = today;
  const selectedPlanDay = (store.get('selectedPlanDay') || 0) % plan.schedule.length;

  function getExercisesForDay() {
    const dayData = plan.schedule[selectedPlanDay];
    return dayData.exercises.map(id => getExerciseById(id)).filter(Boolean);
  }

  function getLogData() {
    return store.getLog(selectedDate);
  }

  function initSetsForExercise(exercise) {
    const sets = [];
    for (let i = 0; i < exercise.defaultSets; i++) {
      sets.push({ weight: 0, reps: 0, done: false });
    }
    return sets;
  }

  function render() {
    const exercises = getExercisesForDay();
    const logData = getLogData();

    // Calculate session summary
    let totalSets = 0, completedSets = 0, totalVolume = 0;
    exercises.forEach(ex => {
      const sets = logData.exercises[ex.id] || [];
      sets.forEach(s => {
        totalSets++;
        if (s.done) {
          completedSets++;
          totalVolume += (s.weight || 0) * (s.reps || 0);
        }
      });
    });
    // If no log data yet, count from defaults
    if (totalSets === 0) {
      exercises.forEach(ex => { totalSets += ex.defaultSets; });
    }
    const completionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    page.innerHTML = `
      <!-- Header -->
      <div class="animate-fade-in-up" style="margin-bottom:20px;">
        <h1 class="section-title" style="margin-bottom:4px;">Workout Tracker</h1>
        <p class="section-subtitle" style="margin-bottom:0;">Log your sets and track progress</p>
      </div>

      <!-- Calendar Strip -->
      <div class="calendar-strip animate-fade-in-up stagger-1">
        ${weekDates.map(date => {
          const isToday = date === today;
          const isActive = date === selectedDate;
          const hasData = store.getLog(date) && Object.keys(store.getLog(date).exercises || {}).length > 0;
          return `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isActive ? 'active' : ''} ${hasData ? 'has-data' : ''}" data-date="${date}">
              <span class="day-name">${getDayName(date)}</span>
              <span class="day-number">${new Date(date + 'T00:00:00').getDate()}</span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Exercise Tracking Cards -->
      <div class="exercise-tracking-list" style="display:flex;flex-direction:column;gap:16px;margin-bottom:24px;">
        ${exercises.map((ex, exIdx) => {
          const sets = logData.exercises[ex.id] || initSetsForExercise(ex);
          return `
            <div class="glass-card animate-fade-in-up stagger-${Math.min(exIdx + 2, 6)}" data-exercise="${ex.id}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div>
                  <div style="font-weight:600;color:var(--text-primary);">${ex.name}</div>
                  <span class="badge badge-blue" style="margin-top:4px;">${ex.muscle}</span>
                </div>
                <span style="font-size:0.75rem;color:var(--text-tertiary);">${ex.defaultReps} reps</span>
              </div>
              <div class="sets-container" data-exercise-id="${ex.id}">
                <!-- Header Row -->
                <div class="set-row" style="padding-bottom:4px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px;">
                  <div class="set-number" style="background:transparent;color:var(--text-tertiary);font-size:0.7rem;">SET</div>
                  <div style="width:80px;text-align:center;color:var(--text-tertiary);font-size:0.7rem;">KG</div>
                  <span style="color:var(--text-tertiary);font-size:0.7rem;">×</span>
                  <div style="width:80px;text-align:center;color:var(--text-tertiary);font-size:0.7rem;">REPS</div>
                  <div style="width:32px;text-align:center;color:var(--text-tertiary);font-size:0.7rem;">✓</div>
                </div>
                ${sets.map((s, sIdx) => `
                  <div class="set-row" data-set-index="${sIdx}">
                    <div class="set-number">${sIdx + 1}</div>
                    <input type="number" class="input-field set-input weight-input" placeholder="kg" value="${s.weight || ''}" data-field="weight" min="0" step="2.5">
                    <span style="color:var(--text-tertiary);">×</span>
                    <input type="number" class="input-field set-input reps-input" placeholder="reps" value="${s.reps || ''}" data-field="reps" min="0">
                    <div class="set-check ${s.done ? 'done' : ''}" data-set-index="${sIdx}">✓</div>
                  </div>
                `).join('')}
              </div>
              <button class="btn-secondary add-set-btn" data-exercise-id="${ex.id}" style="margin-top:8px;padding:8px 16px;font-size:0.8rem;width:100%;">+ Add Set</button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Session Summary -->
      <div class="glass-card animate-fade-in-up" style="margin-bottom:20px;">
        <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:12px;">Session Summary</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
          <div style="text-align:center;">
            <div style="font-size:1.5rem;font-weight:700;color:var(--accent-green);font-family:var(--font-heading);">${completedSets}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Sets Done</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.5rem;font-weight:700;color:var(--accent-orange);font-family:var(--font-heading);">${totalVolume.toLocaleString()}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Volume (kg)</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.5rem;font-weight:700;color:var(--accent-purple);font-family:var(--font-heading);">${completionPct}%</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Complete</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width:${completionPct}%;"></div>
        </div>
        <button class="btn-primary" id="finish-workout-btn" style="margin-top:16px;width:100%;${completedSets === 0 ? 'opacity:0.5;' : ''}">🏁 Finish Workout</button>
      </div>
    `;

    // Calendar clicks
    page.querySelectorAll('.calendar-day').forEach(day => {
      day.onclick = () => {
        selectedDate = day.dataset.date;
        render();
      };
    });

    // Input changes
    page.querySelectorAll('.set-input').forEach(input => {
      input.oninput = () => {
        const setRow = input.closest('.set-row');
        const setsContainer = input.closest('.sets-container');
        const exerciseId = setsContainer.dataset.exerciseId;
        const setIndex = parseInt(setRow.dataset.setIndex);
        const field = input.dataset.field;
        const value = parseInt(input.value) || 0;

        // Ensure log exists
        const log = store.getLog(selectedDate);
        if (!log.exercises[exerciseId]) {
          const ex = getExerciseById(exerciseId);
          const sets = initSetsForExercise(ex);
          sets.forEach(s => store.logSet(selectedDate, exerciseId, s));
        }
        store.updateSet(selectedDate, exerciseId, setIndex, { [field]: value });
      };
    });

    // Check toggles
    page.querySelectorAll('.set-check').forEach(check => {
      check.onclick = () => {
        const setRow = check.closest('.set-row');
        const setsContainer = check.closest('.sets-container');
        const exerciseId = setsContainer.dataset.exerciseId;
        const setIndex = parseInt(check.dataset.setIndex);
        const isDone = check.classList.toggle('done');

        const log = store.getLog(selectedDate);
        if (!log.exercises[exerciseId]) {
          const ex = getExerciseById(exerciseId);
          const sets = initSetsForExercise(ex);
          sets.forEach(s => store.logSet(selectedDate, exerciseId, s));
        }
        store.updateSet(selectedDate, exerciseId, setIndex, { done: isDone });
      };
    });

    // Add set buttons
    page.querySelectorAll('.add-set-btn').forEach(btn => {
      btn.onclick = () => {
        const exerciseId = btn.dataset.exerciseId;
        const log = store.getLog(selectedDate);
        if (!log.exercises[exerciseId]) {
          const ex = getExerciseById(exerciseId);
          const sets = initSetsForExercise(ex);
          sets.forEach(s => store.logSet(selectedDate, exerciseId, s));
        }
        store.logSet(selectedDate, exerciseId, { weight: 0, reps: 0, done: false });
        render();
      };
    });

    // Finish workout
    page.querySelector('#finish-workout-btn')?.addEventListener('click', () => {
      if (completedSets === 0) return;
      store.updateStreak();
      showToast('💪 Workout logged! Great session!', 'success');
    });
  }

  render();
  return page;
}
