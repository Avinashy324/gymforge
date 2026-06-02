import { store } from '../store.js';
import { getDietPlan, getDailyTotals } from '../data/indianDiets.js';
import { calculateBMR, calculateTDEE, getActivityLevel, getCalorieTarget, getMacroSplit } from '../utils/calories.js';
import { createMacroRing } from '../components/progressRing.js';

export default function renderDiet() {
  const page = document.createElement('div');
  page.className = 'page diet-page';

  const profile = store.get('profile');
  let dietType = profile.dietPreference || 'non-veg';

  function render() {
    const dietPlan = getDietPlan(profile.fitnessGoal || 'general-fitness', dietType);
    if (!dietPlan) {
      page.innerHTML = '<div class="page"><h2>No diet plan found.</h2></div>';
      return;
    }

    const meals = dietPlan.meals;
    const totals = getDailyTotals(meals);
    const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
    const tdee = calculateTDEE(bmr, getActivityLevel(profile.daysPerWeek));
    const targetCalories = getCalorieTarget(tdee, profile.fitnessGoal);
    const macros = getMacroSplit(targetCalories, profile.fitnessGoal);
    const caloriePct = Math.min(Math.round((totals.calories / targetCalories) * 100), 100);

    page.innerHTML = `
      <!-- Header -->
      <div class="animate-fade-in-up" style="margin-bottom:20px;">
        <h1 class="section-title" style="margin-bottom:4px;">Your Diet Plan 🍛</h1>
        <p class="section-subtitle" style="margin-bottom:0;">Indian meals with complete nutrition</p>
      </div>

      <!-- Diet Type Toggle -->
      <div class="tab-container animate-fade-in-up stagger-1" style="margin-bottom:24px;">
        <div class="tab-item ${dietType === 'veg' ? 'active' : ''}" data-type="veg">🥦 Vegetarian</div>
        <div class="tab-item ${dietType === 'non-veg' ? 'active' : ''}" data-type="non-veg">🍗 Non-Vegetarian</div>
      </div>

      <!-- Daily Target Card -->
      <div class="glass-card animate-fade-in-up stagger-2" style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Daily Target</div>
            <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);font-family:var(--font-heading);">${targetCalories} kcal</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Plan Total</div>
            <div style="font-size:1.4rem;font-weight:700;color:var(--text-primary);font-family:var(--font-heading);">${totals.calories} kcal</div>
          </div>
        </div>
        <div id="macro-rings-target" style="display:flex;justify-content:center;gap:32px;"></div>
      </div>

      <!-- Meal Timeline -->
      <div class="meal-timeline animate-fade-in-up stagger-3">
        ${meals.map((meal, i) => `
          <div class="meal-item" data-meal-index="${i}">
            <div class="meal-dot"></div>
            <div class="meal-time">${meal.time} · ${meal.type}</div>
            <div class="glass-card" style="margin-bottom:0;">
              <div class="meal-name">${meal.name}</div>
              <ul style="list-style:none;padding:0;margin:8px 0;display:flex;flex-wrap:wrap;gap:4px;">
                ${meal.items.map(item => `<li style="font-size:0.8rem;color:var(--text-secondary);background:var(--bg-tertiary);padding:3px 10px;border-radius:var(--radius-full);">${item}</li>`).join('')}
              </ul>
              <div class="meal-calories">${meal.calories} kcal</div>

              <div id="macro-rings-${i}" class="macro-rings" style="margin-top:12px;"></div>

              <!-- Nutrition Details Toggle -->
              ${(meal.vitamins || meal.minerals) ? `
              <div class="nutrition-table" style="margin-top:12px;">
                <div class="nutrition-table-toggle" data-meal="${i}">
                  <span>View Nutrition Details</span>
                  <span class="toggle-arrow" style="transition:transform 0.3s;">▼</span>
                </div>
                <div class="nutrition-table-content" id="nutrition-${i}">
                  ${meal.vitamins ? `
                  <div style="font-size:0.75rem;font-weight:600;color:var(--accent-orange);text-transform:uppercase;letter-spacing:0.05em;margin:12px 0 6px;">Vitamins</div>
                  ${Object.entries(meal.vitamins).map(([key, v]) => `
                    <div class="nutrition-row">
                      <span class="nutrition-name">Vitamin ${key}</span>
                      <span class="nutrition-value">${v.amount} ${v.unit} (${v.dv}% DV)</span>
                    </div>
                  `).join('')}
                  ` : ''}
                  ${meal.minerals ? `
                  <div style="font-size:0.75rem;font-weight:600;color:var(--accent-blue);text-transform:uppercase;letter-spacing:0.05em;margin:12px 0 6px;">Minerals</div>
                  ${Object.entries(meal.minerals).map(([key, m]) => `
                    <div class="nutrition-row">
                      <span class="nutrition-name" style="text-transform:capitalize;">${key}</span>
                      <span class="nutrition-value">${m.amount} ${m.unit} (${m.dv}% DV)</span>
                    </div>
                  `).join('')}
                  ` : ''}
                </div>
              </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Daily Total Bar -->
      <div class="daily-total-bar">
        <div>
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">${totals.calories} / ${targetCalories} kcal</div>
          <div class="progress-bar" style="width:150px;margin-top:4px;">
            <div class="progress-bar-fill" style="width:${caloriePct}%;"></div>
          </div>
        </div>
        <div style="display:flex;gap:12px;font-size:0.75rem;font-weight:600;">
          <span style="color:var(--accent-green);">P: ${totals.protein}g</span>
          <span style="color:var(--accent-blue);">C: ${totals.carbs}g</span>
          <span style="color:var(--accent-orange);">F: ${totals.fat}g</span>
        </div>
      </div>
    `;

    // Add macro rings for target — API: createMacroRing(value, max, label, color, unit)
    const targetRingsContainer = page.querySelector('#macro-rings-target');
    if (targetRingsContainer) {
      [
        { label: 'Protein', value: totals.protein, max: macros.protein, color: '#22C55E' },
        { label: 'Carbs', value: totals.carbs, max: macros.carbs, color: '#3B82F6' },
        { label: 'Fat', value: totals.fat, max: macros.fat, color: '#FF6B2C' },
      ].forEach(m => {
        const ring = createMacroRing(m.value, m.max, m.label, m.color, 'g');
        targetRingsContainer.appendChild(ring);
      });
    }

    // Add macro rings for each meal
    meals.forEach((meal, i) => {
      const container = page.querySelector(`#macro-rings-${i}`);
      if (!container) return;
      [
        { label: 'Protein', value: meal.protein, max: macros.protein, color: '#22C55E' },
        { label: 'Carbs', value: meal.carbs, max: macros.carbs, color: '#3B82F6' },
        { label: 'Fat', value: meal.fat, max: macros.fat, color: '#FF6B2C' },
      ].forEach(m => {
        const ring = createMacroRing(m.value, m.max, m.label, m.color, 'g');
        container.appendChild(ring);
      });
    });

    // Diet type toggle
    page.querySelectorAll('.tab-item').forEach(tab => {
      tab.onclick = () => {
        dietType = tab.dataset.type;
        store.updateProfile({ dietPreference: dietType });
        render();
      };
    });

    // Nutrition toggles
    page.querySelectorAll('.nutrition-table-toggle').forEach(toggle => {
      toggle.onclick = () => {
        const idx = toggle.dataset.meal;
        const content = page.querySelector(`#nutrition-${idx}`);
        const arrow = toggle.querySelector('.toggle-arrow');
        content.classList.toggle('expanded');
        arrow.style.transform = content.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0)';
      };
    });
  }

  render();
  return page;
}
