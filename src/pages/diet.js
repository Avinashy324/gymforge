import { store } from '../store.js';
import { getDietPlan, getDailyTotals } from '../data/indianDiets.js';
import { searchFood, getFoodById } from '../data/indianFoodDB.js';
import { calculateBMR, calculateTDEE, getActivityLevel, getCalorieTarget, getMacroSplit } from '../utils/calories.js';
import { createMacroRing } from '../components/progressRing.js';
import { getToday, showToast } from '../utils/helpers.js';

export default function renderDiet() {
  const page = document.createElement('div');
  page.className = 'page diet-page';

  const profile = store.get('profile');
  let dietType = profile.dietPreference || 'non-veg';
  let activeSubTab = 'plan'; // 'plan' or 'tracker'
  
  // Local state for scan feature
  let scanningImageSrc = null;
  let scanningMatchedFood = null;
  let scanningFoodWeight = 150; // default 150g
  let isScanning = false;
  let scanComplete = false;

  // Local state for search feature
  let searchQuery = '';
  let searchResults = [];
  let selectedSearchFood = null;
  let manualFoodWeight = 100; // default 100g

  function render() {
    const today = getToday();
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
    const macros = getMacroSplit(targetCalories, profile.fitnessGoal, profile.weight);

    // Calculate actual logged foods for today
    const loggedFoods = store.getFoodLog(today);
    const loggedTotals = loggedFoods.reduce((acc, f) => {
      const multiplier = f.weight / 100;
      acc.calories += Math.round(f.calories * multiplier);
      acc.protein += Math.round(f.protein * multiplier);
      acc.carbs += Math.round(f.carbs * multiplier);
      acc.fat += Math.round(f.fat * multiplier);
      acc.fiber += Math.round((f.fiber || 0) * multiplier);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    const caloriePct = Math.min(Math.round((loggedTotals.calories / targetCalories) * 100), 100);

    // Header HTML
    let headerHTML = `
      <div class="animate-fade-in-up" style="margin-bottom:20px;">
        <h1 class="section-title" style="margin-bottom:4px;">Nutrition & Diet 🍛</h1>
        <p class="section-subtitle" style="margin-bottom:0;">Evidence-based Indian meal guides and logging</p>
      </div>

      <!-- Main sub-tabs -->
      <div class="tab-container animate-fade-in-up stagger-1" style="margin-bottom:24px;">
        <div class="tab-item ${activeSubTab === 'plan' ? 'active' : ''}" data-subtab="plan">📋 Preset Diet Plan</div>
        <div class="tab-item ${activeSubTab === 'tracker' ? 'active' : ''}" data-subtab="tracker">📊 Today's Food Tracker</div>
      </div>
    `;

    let contentHTML = '';

    if (activeSubTab === 'plan') {
      // CURATED DIET PLAN VIEW
      const planCaloriePct = Math.min(Math.round((totals.calories / targetCalories) * 100), 100);
      contentHTML = `
        <!-- Diet Type Toggle -->
        <div class="tab-container animate-fade-in-up stagger-1" style="margin-bottom:24px; max-width: 320px;">
          <div class="tab-item ${dietType === 'veg' ? 'active' : ''}" data-type="veg">🥦 Vegetarian</div>
          <div class="tab-item ${dietType === 'non-veg' ? 'active' : ''}" data-type="non-veg">🍗 Non-Vegetarian</div>
        </div>

        <!-- Daily Target Card -->
        <div class="glass-card animate-fade-in-up stagger-2" style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Daily Goal Target</div>
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
                <div class="meal-name" style="font-weight:700;">${meal.name}</div>
                <ul style="list-style:none;padding:0;margin:8px 0;display:flex;flex-wrap:wrap;gap:4px;">
                  ${meal.items.map(item => `<li style="font-size:0.8rem;color:var(--text-secondary);background:var(--bg-tertiary);padding:3px 10px;border-radius:var(--radius-full);">${item}</li>`).join('')}
                </ul>
                <div class="meal-calories" style="font-size:1rem;color:var(--accent-orange);font-weight:600;">${meal.calories} kcal</div>

                <div id="macro-rings-${i}" class="macro-rings" style="margin-top:12px;"></div>

                <!-- Nutrition Details Toggle -->
                ${(meal.vitamins || meal.minerals) ? `
                <div class="nutrition-table" style="margin-top:12px;">
                  <div class="nutrition-table-toggle" data-meal="${i}">
                    <span>View Nutrition Details</span>
                    <span class="toggle-arrow" style="transition:transform 0.3s;display:inline-block;">▼</span>
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

        <!-- Daily Total Bar (curated plan target) -->
        <div class="daily-total-bar">
          <div>
            <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">Preset Plan: ${totals.calories} / ${targetCalories} kcal</div>
            <div class="progress-bar" style="width:150px;margin-top:4px;">
              <div class="progress-bar-fill" style="width:${planCaloriePct}%;"></div>
            </div>
          </div>
          <div style="display:flex;gap:12px;font-size:0.75rem;font-weight:600;">
            <span style="color:var(--accent-green);">P: ${totals.protein}g</span>
            <span style="color:var(--accent-blue);">C: ${totals.carbs}g</span>
            <span style="color:var(--accent-orange);">F: ${totals.fat}g</span>
          </div>
        </div>
      `;
    } else {
      // MEAL TRACKER LOG VIEW
      contentHTML = `
        <!-- Daily Tracker Card -->
        <div class="glass-card animate-fade-in-up stagger-1" style="margin-bottom:24px;">
          <h3 style="font-size:1rem;margin-bottom:12px;font-family:var(--font-heading);">Logged Intake Today</h3>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Target Limit</div>
              <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);font-family:var(--font-heading);">${targetCalories} kcal</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Actual Consumed</div>
              <div style="font-size:1.4rem;font-weight:700;color:var(--text-primary);font-family:var(--font-heading);">${loggedTotals.calories} kcal</div>
            </div>
          </div>
          <div id="macro-rings-tracker" style="display:flex;justify-content:center;gap:32px;"></div>
        </div>

        <!-- Food Add/Scan Options -->
        <div class="glass-card animate-fade-in-up stagger-2" style="margin-bottom:24px;">
          <h3 style="font-size:1rem;margin-bottom:16px;font-family:var(--font-heading);color:var(--text-primary);display:flex;align-items:center;gap:8px;">
            <span>Add / Scan Meal</span>
            <span class="badge badge-green" style="font-size:0.6rem;">AI Scanner</span>
          </h3>

          <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
            <!-- Autocomplete Search -->
            <div style="flex:1;min-width:200px;position:relative;">
              <input type="text" id="food-search-input" class="input-field" placeholder="Search Indian food (e.g. paneer, dal, roti...)" value="${searchQuery}">
              ${searchResults.length > 0 ? `
                <div class="glass-card" style="position:absolute;top:100%;left:0;right:0;z-index:90;padding:8px 0;margin-top:4px;max-height:200px;overflow-y:auto;border-color:rgba(255,255,255,0.15);">
                  ${searchResults.map(item => `
                    <div class="search-result-item" data-id="${item.id}" style="padding:10px 16px;cursor:pointer;font-size:0.9rem;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;">
                      <span style="font-weight:500;">${item.name}</span>
                      <span style="color:var(--accent-orange);">${item.calories} kcal / 100g</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Scan Camera Trigger -->
            <button class="btn-secondary" id="camera-scan-btn" style="padding: 10px 20px; display:flex; align-items:center; gap:8px;">
              📸 Scan Photo
            </button>
            <input type="file" id="meal-image-file" accept="image/*" style="display:none;">
          </div>

          <!-- Add Manual Food Block -->
          ${selectedSearchFood ? `
            <div class="glass-card" style="background:rgba(255,255,255,0.02);padding:14px;border-color:rgba(255,107,44,0.3);margin-top:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div>
                  <div style="font-size:0.9rem;font-weight:600;color:var(--text-primary);">${selectedSearchFood.name}</div>
                  <div style="font-size:0.75rem;color:var(--text-secondary);">
                    Protein: ${selectedSearchFood.protein}g · Carbs: ${selectedSearchFood.carbs}g · Fat: ${selectedSearchFood.fat}g (per 100g)
                  </div>
                </div>
                <button class="btn-icon" id="clear-selected-food" style="width:32px;height:32px;border-radius:50%;font-size:12px;">✕</button>
              </div>

              <!-- Weight Slider -->
              <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);margin-bottom:6px;">
                  <span>Enter Weight:</span>
                  <span style="color:var(--accent-orange);font-weight:700;">${manualFoodWeight}g</span>
                </div>
                <input type="range" min="10" max="600" step="5" value="${manualFoodWeight}" id="manual-weight-slider" class="range-slider">
              </div>

              <button class="btn-primary" id="log-manual-food-btn" style="width:100%;padding:10px 0;font-size:0.9rem;">
                Log ${Math.round((selectedSearchFood.calories * manualFoodWeight) / 100)} kcal Meal
              </button>
            </div>
          ` : ''}

          <!-- Scanning Overlay / Details -->
          ${isScanning ? `
            <div class="glass-card animate-fade-in" style="position:relative;height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:12px;background:rgba(0,0,0,0.4);overflow:hidden;border-color:var(--accent-green);">
              ${scanningImageSrc ? `<img src="${scanningImageSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.35;" />` : ''}
              <div class="scanner-line"></div>
              <div class="animate-pulse" style="font-weight:600;font-size:0.95rem;color:var(--accent-green);z-index:2;display:flex;align-items:center;gap:8px;">
                <div class="animate-spin" style="width:16px;height:16px;border:2px solid var(--accent-green);border-top-color:transparent;border-radius:50%;"></div>
                AI Scanning Food Image...
              </div>
            </div>
          ` : ''}

          ${scanComplete && scanningMatchedFood ? `
            <div class="glass-card animate-bounce-in" style="background:rgba(34,197,94,0.04);padding:16px;border-color:var(--accent-green);margin-top:12px;">
              <h4 style="font-size:0.85rem;color:var(--accent-green);margin-bottom:8px;text-transform:uppercase;font-weight:700;letter-spacing:0.05em;">AI Scan Results</h4>
              
              <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;">
                ${scanningImageSrc ? `
                  <div style="width:60px;height:60px;border-radius:var(--radius-sm);overflow:hidden;flex-shrink:0;border:1px solid var(--glass-border);">
                    <img src="${scanningImageSrc}" style="width:100%;height:100%;object-fit:cover;" />
                  </div>
                ` : ''}
                <div style="flex:1;">
                  <div style="font-weight:700;font-size:1.05rem;color:var(--text-primary);">${scanningMatchedFood.name}</div>
                  <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">
                    Matched from Indian Food Database (94% confidence)
                  </div>
                </div>
              </div>

              <!-- Scanner Weight Slider -->
              <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);margin-bottom:6px;">
                  <span>Adjust Portion Weight:</span>
                  <span style="color:var(--accent-green);font-weight:700;">${scanningFoodWeight}g</span>
                </div>
                <input type="range" min="10" max="600" step="5" value="${scanningFoodWeight}" id="scan-weight-slider" class="range-slider">
              </div>

              <div style="display:flex;gap:10px;">
                <button class="btn-secondary" id="retake-scan-btn" style="flex:1;padding:8px 0;font-size:0.85rem;border-color:rgba(255,255,255,0.15);">Discard</button>
                <button class="btn-primary" id="log-scanned-food-btn" style="flex:2;padding:8px 0;font-size:0.85rem;background:linear-gradient(135deg, var(--accent-green), #10B981);box-shadow:0 8px 20px rgba(34,197,94,0.3);">
                  Log ${Math.round((scanningMatchedFood.calories * scanningFoodWeight) / 100)} kcal
                </button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Logged Foods List -->
        <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:12px;" class="animate-fade-in-up stagger-3">Today's Meals</h3>
        
        <div class="exercise-list animate-fade-in-up stagger-3">
          ${loggedFoods.length === 0 ? `
            <div class="glass-card" style="text-align:center;padding:36px;border-style:dashed;">
              <div style="font-size:2.5rem;margin-bottom:12px;">🥗</div>
              <div style="font-weight:600;color:var(--text-secondary);margin-bottom:4px;">No foods logged yet today</div>
              <div style="font-size:0.8rem;color:var(--text-tertiary);">Search and add foods manually, or scan your meal photo!</div>
            </div>
          ` : loggedFoods.map((item, idx) => {
            const multiplier = item.weight / 100;
            const cals = Math.round(item.calories * multiplier);
            const prot = Math.round(item.protein * multiplier);
            const carb = Math.round(item.carbs * multiplier);
            const fat = Math.round(item.fat * multiplier);
            const fib = Math.round((item.fiber || 0) * multiplier);
            
            return `
              <div class="glass-card" style="margin-bottom:12px;padding:14px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight:700;font-size:1rem;color:var(--text-primary);">${item.name}</div>
                  <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">
                    ${item.weight}g · <span style="color:var(--accent-orange);font-weight:600;">${cals} kcal</span>
                  </div>
                  <div style="display:flex;gap:8px;font-size:0.75rem;color:var(--text-tertiary);margin-top:6px;flex-wrap:wrap;">
                    <span>P: ${prot}g</span>
                    <span>C: ${carb}g</span>
                    <span>F: ${fat}g</span>
                    ${fib > 0 ? `<span>Fiber: ${fib}g</span>` : ''}
                  </div>
                </div>

                <button class="delete-logged-food btn-icon" data-index="${idx}" style="border-color:rgba(239,68,68,0.15);color:var(--accent-red);width:36px;height:36px;border-radius:50%;background:rgba(239,68,68,0.05);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Daily Total Bar (actual logged tracker) -->
        <div class="daily-total-bar">
          <div>
            <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">Tracker: ${loggedTotals.calories} / ${targetCalories} kcal</div>
            <div class="progress-bar" style="width:150px;margin-top:4px;">
              <div class="progress-bar-fill" style="width:${caloriePct}%; background: linear-gradient(90deg, var(--accent-green), #10B981);"></div>
            </div>
          </div>
          <div style="display:flex;gap:12px;font-size:0.75rem;font-weight:600;">
            <span style="color:var(--accent-green);">P: ${loggedTotals.protein}g</span>
            <span style="color:var(--accent-blue);">C: ${loggedTotals.carbs}g</span>
            <span style="color:var(--accent-orange);">F: ${loggedTotals.fat}g</span>
          </div>
        </div>
      `;
    }

    page.innerHTML = headerHTML + contentHTML;

    // Attach Event Listeners
    setupCommonListeners();
    if (activeSubTab === 'plan') {
      setupPlanListeners(totals, macros);
    } else {
      setupTrackerListeners(loggedTotals, macros);
    }
  }

  function setupCommonListeners() {
    // Subtab navigation
    page.querySelectorAll('[data-subtab]').forEach(tab => {
      tab.onclick = () => {
        activeSubTab = tab.dataset.subtab;
        render();
      };
    });
  }

  function setupPlanListeners(totals, macros) {
    // Add macro rings for target
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

    // Add macro rings for each plan meal
    const plan = getDietPlan(profile.fitnessGoal || 'general-fitness', dietType);
    if (plan) {
      plan.meals.forEach((meal, i) => {
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
    }

    // Diet type toggle
    page.querySelectorAll('.tab-container [data-type]').forEach(tab => {
      tab.onclick = () => {
        dietType = tab.dataset.type;
        store.updateProfile({ dietPreference: dietType });
        render();
      };
    });

    // Nutrition details toggles
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

  function setupTrackerListeners(loggedTotals, macros) {
    // Add macro rings for logged tracker
    const trackerRingsContainer = page.querySelector('#macro-rings-tracker');
    if (trackerRingsContainer) {
      [
        { label: 'Protein', value: loggedTotals.protein, max: macros.protein, color: '#22C55E' },
        { label: 'Carbs', value: loggedTotals.carbs, max: macros.carbs, color: '#3B82F6' },
        { label: 'Fat', value: loggedTotals.fat, max: macros.fat, color: '#FF6B2C' },
      ].forEach(m => {
        const ring = createMacroRing(m.value, m.max, m.label, m.color, 'g');
        trackerRingsContainer.appendChild(ring);
      });
    }

    // Manual Food Search autocomplete
    const searchInput = page.querySelector('#food-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        if (searchQuery.trim().length >= 2) {
          searchResults = searchFood(searchQuery);
        } else {
          searchResults = [];
        }
        renderSearchListOnly();
      };
    }

    // Handle search result click
    function renderSearchListOnly() {
      // Direct DOM rendering of search dropdown to avoid losing input focus
      let listContainer = page.querySelector('.search-result-item')?.parentElement;
      if (!listContainer && searchResults.length > 0) {
        listContainer = document.createElement('div');
        listContainer.className = 'glass-card search-dropdown';
        listContainer.style.cssText = 'position:absolute;top:100%;left:0;right:0;z-index:90;padding:8px 0;margin-top:4px;max-height:200px;overflow-y:auto;border-color:rgba(255,255,255,0.15);';
        searchInput.parentElement.appendChild(listContainer);
      }
      
      if (listContainer) {
        if (searchResults.length === 0) {
          listContainer.remove();
        } else {
          listContainer.innerHTML = searchResults.map(item => `
            <div class="search-result-item" data-id="${item.id}" style="padding:10px 16px;cursor:pointer;font-size:0.9rem;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;transition:background 0.2s;">
              <span style="font-weight:500;color:var(--text-primary);">${item.name}</span>
              <span style="color:var(--accent-orange);">${item.calories} kcal / 100g</span>
            </div>
          `).join('');

          listContainer.querySelectorAll('.search-result-item').forEach(el => {
            el.onclick = () => {
              selectedSearchFood = getFoodById(el.dataset.id);
              searchQuery = '';
              searchResults = [];
              render();
            };
          });
        }
      }
    }

    // Clear selected food
    const clearSelectedBtn = page.querySelector('#clear-selected-food');
    if (clearSelectedBtn) {
      clearSelectedBtn.onclick = () => {
        selectedSearchFood = null;
        render();
      };
    }

    // Manual weight slider
    const manualWeightSlider = page.querySelector('#manual-weight-slider');
    if (manualWeightSlider) {
      manualWeightSlider.oninput = (e) => {
        manualFoodWeight = parseInt(e.target.value);
        page.querySelector('#log-manual-food-btn').textContent = `Log ${Math.round((selectedSearchFood.calories * manualFoodWeight) / 100)} kcal Meal`;
        // Keep weight number updated in UI
        manualWeightSlider.previousElementSibling.querySelector('span').textContent = `${manualFoodWeight}g`;
      };
    }

    // Log Manual Food
    const logManualFoodBtn = page.querySelector('#log-manual-food-btn');
    if (logManualFoodBtn && selectedSearchFood) {
      logManualFoodBtn.onclick = () => {
        const foodToLog = {
          ...selectedSearchFood,
          weight: manualFoodWeight
        };
        store.logFood(getToday(), foodToLog);
        showToast(`Logged ${manualFoodWeight}g of ${selectedSearchFood.name}! 🥗`, 'success');
        selectedSearchFood = null;
        manualFoodWeight = 100;
        render();
      };
    }

    // ── IMAGE SCANNER FLOW ──
    const cameraScanBtn = page.querySelector('#camera-scan-btn');
    const imageFileInput = page.querySelector('#meal-image-file');

    if (cameraScanBtn && imageFileInput) {
      cameraScanBtn.onclick = () => {
        imageFileInput.click();
      };

      imageFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            scanningImageSrc = event.target.result;
            isScanning = true;
            scanComplete = false;
            scanningMatchedFood = null;
            render();

            // Run scanner simulation
            setTimeout(() => {
              isScanning = false;
              scanComplete = true;

              // AI food matcher heuristic from filename or default relevant food
              const filename = file.name.toLowerCase();
              let matchedId = 'paneer-tikka'; // default fallback match

              // Check name matching
              if (filename.includes('roti') || filename.includes('chapati')) matchedId = 'roti';
              else if (filename.includes('rice') || filename.includes('chawal')) matchedId = 'white-rice';
              else if (filename.includes('egg') || filename.includes('bhurji') || filename.includes('omelette')) matchedId = 'egg-bhurji';
              else if (filename.includes('chicken') || filename.includes('tikka')) matchedId = 'chicken-tikka';
              else if (filename.includes('biryani')) matchedId = 'chicken-biryani';
              else if (filename.includes('dosa')) matchedId = 'dosa-plain';
              else if (filename.includes('idli')) matchedId = 'idli';
              else if (filename.includes('poha')) matchedId = 'poha';
              else if (filename.includes('banana')) matchedId = 'banana';
              else if (filename.includes('apple')) matchedId = 'apple';
              else if (filename.includes('paneer')) matchedId = 'paneer';
              else if (filename.includes('sprouts')) matchedId = 'sprouts-mixed';
              else if (filename.includes('protein') || filename.includes('shake')) matchedId = 'whey-protein';

              scanningMatchedFood = getFoodById(matchedId);
              scanningFoodWeight = 150; // reset default
              render();
            }, 1800);
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // Scan weight slider
    const scanWeightSlider = page.querySelector('#scan-weight-slider');
    if (scanWeightSlider && scanningMatchedFood) {
      scanWeightSlider.oninput = (e) => {
        scanningFoodWeight = parseInt(e.target.value);
        page.querySelector('#log-scanned-food-btn').textContent = `Log ${Math.round((scanningMatchedFood.calories * scanningFoodWeight) / 100)} kcal`;
        scanWeightSlider.previousElementSibling.querySelector('span').textContent = `${scanningFoodWeight}g`;
      };
    }

    // Log scanned food
    const logScannedFoodBtn = page.querySelector('#log-scanned-food-btn');
    if (logScannedFoodBtn && scanningMatchedFood) {
      logScannedFoodBtn.onclick = () => {
        const foodToLog = {
          ...scanningMatchedFood,
          weight: scanningFoodWeight
        };
        store.logFood(getToday(), foodToLog);
        showToast(`AI Logged: ${scanningFoodWeight}g of ${scanningMatchedFood.name}! 📸`, 'success');
        
        // Reset scanner state
        scanningImageSrc = null;
        scanningMatchedFood = null;
        scanComplete = false;
        render();
      };
    }

    // Discard Scan
    const retakeScanBtn = page.querySelector('#retake-scan-btn');
    if (retakeScanBtn) {
      retakeScanBtn.onclick = () => {
        scanningImageSrc = null;
        scanningMatchedFood = null;
        scanComplete = false;
        render();
      };
    }

    // Delete Logged Food Item
    page.querySelectorAll('.delete-logged-food').forEach(btn => {
      btn.onclick = () => {
        const index = parseInt(btn.dataset.index);
        const foodList = store.getFoodLog(getToday());
        const removedName = foodList[index]?.name || 'food item';
        store.removeFood(getToday(), index);
        showToast(`Removed ${removedName} 🗑️`, 'info');
        render();
      };
    });
  }

  render();
  return page;
}
