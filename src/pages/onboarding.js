import { store } from '../store.js';
import { calculateBMI, getBMICategory } from '../utils/bmi.js';
import { calculateBMR, calculateTDEE, getActivityLevel, getCalorieTarget } from '../utils/calories.js';
import { router } from '../router.js';
import { getWorkoutPlan } from '../data/workoutPlans.js';

export default function renderOnboarding() {
  let currentStep = 0;
  const totalSteps = 6;

  const page = document.createElement('div');
  page.className = 'onboarding-page';

  function renderStep() {
    page.innerHTML = '';
    const step = document.createElement('div');
    step.className = 'onboarding-step';

    // Progress dots (not on step 0)
    if (currentStep > 0) {
      const progress = document.createElement('div');
      progress.className = 'onboarding-progress';
      for (let i = 0; i < totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'onboarding-dot';
        if (i < currentStep) dot.classList.add('completed');
        if (i === currentStep) dot.classList.add('active');
        progress.appendChild(dot);
      }
      step.appendChild(progress);
    }

    // Back button (not on step 0)
    if (currentStep > 0 && currentStep < 5) {
      const backBtn = document.createElement('button');
      backBtn.className = 'btn-secondary';
      backBtn.style.cssText = 'position:absolute;top:20px;left:20px;padding:10px 18px;font-size:14px;';
      backBtn.textContent = '← Back';
      backBtn.onclick = () => { currentStep--; renderStep(); };
      step.appendChild(backBtn);
    }

    switch (currentStep) {
      case 0: renderWelcome(step); break;
      case 1: renderGender(step); break;
      case 2: renderMeasurements(step); break;
      case 3: renderBodyType(step); break;
      case 4: renderPreferences(step); break;
      case 5: renderSummary(step); break;
    }

    page.appendChild(step);
  }

  function renderWelcome(container) {
    container.innerHTML += `
      <div style="margin-bottom:32px;">
        <h1 style="font-size:3.5rem;font-weight:800;font-family:var(--font-heading);background:linear-gradient(135deg,#FF6B2C,#FF8F5C,#A855F7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;line-height:1.1;letter-spacing:-1px;">GYMFORGE</h1>
        <div style="width:60px;height:4px;background:linear-gradient(90deg,var(--accent-orange),var(--accent-purple));border-radius:2px;margin:0 auto 24px;"></div>
        <p style="font-size:1.5rem;font-weight:600;color:var(--text-primary);margin-bottom:12px;">Transform Your Body.<br>Forge Your Future.</p>
        <p style="color:var(--text-secondary);font-size:0.95rem;max-width:360px;margin:0 auto;line-height:1.6;">Personalized workout plans, daily tracking, and Indian diet recommendations — all powered by AI</p>
      </div>
      <button class="btn-primary" id="start-btn" style="padding:16px 48px;font-size:1.1rem;">Get Started →</button>
      <div style="margin-top:40px;animation:float 3s ease-in-out infinite;color:var(--text-tertiary);font-size:1.5rem;">↓</div>
    `;
    container.querySelector('#start-btn').onclick = () => { currentStep++; renderStep(); };
  }

  function renderGender(container) {
    const profile = store.get('profile');
    container.innerHTML += `
      <h2 class="section-title" style="margin-bottom:8px;">What is your gender?</h2>
      <p class="section-subtitle">This helps us calculate your calorie needs accurately</p>
      <div class="option-grid" style="grid-template-columns:1fr 1fr;max-width:320px;margin:0 auto;">
        <div class="option-card ${profile.gender === 'male' ? 'selected' : ''}" data-value="male">
          <div class="option-card-icon">🚹</div>
          <div class="option-card-label">Male</div>
        </div>
        <div class="option-card ${profile.gender === 'female' ? 'selected' : ''}" data-value="female">
          <div class="option-card-icon">🚺</div>
          <div class="option-card-label">Female</div>
        </div>
      </div>
      <button class="btn-primary" id="next-btn" style="margin-top:32px;${!profile.gender ? 'opacity:0.5;pointer-events:none;' : ''}">Next →</button>
    `;
    container.querySelectorAll('.option-card').forEach(card => {
      card.onclick = () => {
        container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        store.updateProfile({ gender: card.dataset.value });
        const btn = container.querySelector('#next-btn');
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      };
    });
    container.querySelector('#next-btn').onclick = () => { currentStep++; renderStep(); };
  }

  function renderMeasurements(container) {
    const profile = store.get('profile');
    const bmi = calculateBMI(profile.weight, profile.height);
    const bmiCat = getBMICategory(bmi);

    container.innerHTML += `
      <h2 class="section-title" style="margin-bottom:8px;">Tell us about yourself</h2>
      <p class="section-subtitle">We'll use this to personalize your plan</p>

      <div style="margin-bottom:24px;">
        <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:8px;">Age</label>
        <div class="slider-value" id="age-value">${profile.age}</div>
        <input type="range" class="range-slider" id="age-slider" min="16" max="60" value="${profile.age}">
        <div style="display:flex;justify-content:space-between;color:var(--text-tertiary);font-size:0.75rem;"><span>16</span><span>60</span></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
        <div>
          <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:8px;">Height (cm)</label>
          <input type="number" class="input-field" id="height-input" value="${profile.height}" min="100" max="250">
        </div>
        <div>
          <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:8px;">Weight (kg)</label>
          <input type="number" class="input-field" id="weight-input" value="${profile.weight}" min="30" max="200">
        </div>
      </div>

      <div class="glass-card" id="bmi-card" style="text-align:center;padding:20px;border-color:${bmiCat.color}33;">
        <div style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Your BMI</div>
        <div style="font-size:2.5rem;font-weight:700;color:${bmiCat.color};font-family:var(--font-heading);" id="bmi-value">${bmi.toFixed(1)}</div>
        <div style="font-size:0.9rem;color:${bmiCat.color};font-weight:600;" id="bmi-label">${bmiCat.label}</div>
      </div>

      <button class="btn-primary" id="next-btn" style="margin-top:24px;">Next →</button>
    `;

    const ageSlider = container.querySelector('#age-slider');
    const ageValue = container.querySelector('#age-value');
    const heightInput = container.querySelector('#height-input');
    const weightInput = container.querySelector('#weight-input');

    function updateBMI() {
      const h = parseInt(heightInput.value) || 170;
      const w = parseInt(weightInput.value) || 70;
      const b = calculateBMI(w, h);
      const cat = getBMICategory(b);
      container.querySelector('#bmi-value').textContent = b.toFixed(1);
      container.querySelector('#bmi-label').textContent = cat.label;
      container.querySelector('#bmi-value').style.color = cat.color;
      container.querySelector('#bmi-label').style.color = cat.color;
      container.querySelector('#bmi-card').style.borderColor = cat.color + '33';
    }

    ageSlider.oninput = () => { ageValue.textContent = ageSlider.value; store.updateProfile({ age: parseInt(ageSlider.value) }); };
    heightInput.oninput = () => { store.updateProfile({ height: parseInt(heightInput.value) || 170 }); updateBMI(); };
    weightInput.oninput = () => { store.updateProfile({ weight: parseInt(weightInput.value) || 70 }); updateBMI(); };
    container.querySelector('#next-btn').onclick = () => { currentStep++; renderStep(); };
  }

  function renderBodyType(container) {
    const profile = store.get('profile');
    const types = [
      { id: 'ectomorph', icon: '🦴', name: 'Ectomorph', desc: 'Lean & long, hard to gain weight' },
      { id: 'mesomorph', icon: '💪', name: 'Mesomorph', desc: 'Athletic & muscular, gains easily' },
      { id: 'endomorph', icon: '🏋️', name: 'Endomorph', desc: 'Wide & stocky, gains fat easily' },
    ];

    container.innerHTML += `
      <h2 class="section-title" style="margin-bottom:8px;">What's your body type?</h2>
      <p class="section-subtitle">This helps us tailor your workout intensity</p>
      <div class="option-grid" style="grid-template-columns:1fr 1fr 1fr;max-width:480px;margin:0 auto;">
        ${types.map(t => `
          <div class="option-card ${profile.bodyType === t.id ? 'selected' : ''}" data-value="${t.id}">
            <div class="option-card-icon">${t.icon}</div>
            <div class="option-card-label">${t.name}</div>
            <div class="option-card-desc">${t.desc}</div>
          </div>
        `).join('')}
      </div>
      <button class="btn-primary" id="next-btn" style="margin-top:32px;${!profile.bodyType ? 'opacity:0.5;pointer-events:none;' : ''}">Next →</button>
    `;

    container.querySelectorAll('.option-card').forEach(card => {
      card.onclick = () => {
        container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        store.updateProfile({ bodyType: card.dataset.value });

        const btn = container.querySelector('#next-btn');
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      };
    });
    container.querySelector('#next-btn').onclick = () => {
      currentStep++;
      renderStep();
    };
  }

  function renderPreferences(container) {
    const profile = store.get('profile');
    container.innerHTML += `
      <h2 class="section-title" style="margin-bottom:24px;">Your Fitness Preferences</h2>

      <div style="margin-bottom:28px;text-align:left;">
        <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:12px;">How many days can you train per week?</label>
        <div class="option-grid" style="grid-template-columns:repeat(4,1fr);">
          ${[3,4,5,6].map(d => `<div class="option-card ${profile.daysPerWeek === d ? 'selected' : ''}" data-key="daysPerWeek" data-value="${d}" style="padding:16px;"><div class="option-card-label" style="font-size:1.5rem;">${d}</div><div class="option-card-desc">days</div></div>`).join('')}
        </div>
      </div>

      <div style="margin-bottom:28px;text-align:left;">
        <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:12px;">What's your fitness goal?</label>
        <div class="option-grid" style="grid-template-columns:1fr 1fr;">
          ${[
            { id: 'muscle-gain', icon: '💪', label: 'Muscle Gain' },
            { id: 'fat-loss', icon: '🔥', label: 'Fat Loss' },
            { id: 'endurance', icon: '🏃', label: 'Endurance' },
            { id: 'general-fitness', icon: '⚡', label: 'General Fitness' },
          ].map(g => `<div class="option-card ${profile.fitnessGoal === g.id ? 'selected' : ''}" data-key="fitnessGoal" data-value="${g.id}" style="padding:16px;"><div style="font-size:1.5rem;">${g.icon}</div><div class="option-card-label" style="font-size:0.85rem;">${g.label}</div></div>`).join('')}
        </div>
      </div>

      <div style="margin-bottom:28px;text-align:left;">
        <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:12px;">Experience level?</label>
        <div class="option-grid" style="grid-template-columns:1fr 1fr 1fr;">
          ${[
            { id: 'beginner', icon: '🌱', label: 'Beginner' },
            { id: 'intermediate', icon: '🌿', label: 'Intermediate' },
            { id: 'advanced', icon: '🌳', label: 'Advanced' },
          ].map(l => `<div class="option-card ${profile.experienceLevel === l.id ? 'selected' : ''}" data-key="experienceLevel" data-value="${l.id}" style="padding:16px;"><div style="font-size:1.5rem;">${l.icon}</div><div class="option-card-label" style="font-size:0.85rem;">${l.label}</div></div>`).join('')}
        </div>
      </div>

      <div style="margin-bottom:28px;text-align:left;">
        <label style="color:var(--text-secondary);font-size:0.85rem;display:block;margin-bottom:12px;">Diet preference?</label>
        <div class="option-grid" style="grid-template-columns:1fr 1fr;">
          ${[
            { id: 'veg', icon: '🥦', label: 'Vegetarian' },
            { id: 'non-veg', icon: '🍗', label: 'Non-Vegetarian' },
          ].map(d => `<div class="option-card ${profile.dietPreference === d.id ? 'selected' : ''}" data-key="dietPreference" data-value="${d.id}" style="padding:16px;"><div style="font-size:1.5rem;">${d.icon}</div><div class="option-card-label" style="font-size:0.85rem;">${d.label}</div></div>`).join('')}
        </div>
      </div>

      <button class="btn-primary" id="next-btn" style="margin-top:16px;">Generate My Plan →</button>
    `;

    container.querySelectorAll('.option-card').forEach(card => {
      card.onclick = () => {
        const key = card.dataset.key;
        const value = key === 'daysPerWeek' ? parseInt(card.dataset.value) : card.dataset.value;
        const group = container.querySelectorAll(`.option-card[data-key="${key}"]`);
        group.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        store.updateProfile({ [key]: value });
      };
    });
    container.querySelector('#next-btn').onclick = () => { currentStep++; renderStep(); };
  }

  function renderSummary(container) {
    // Show loading first
    container.innerHTML = `
      <div style="padding:40px 0;" id="loading-state">
        <div style="width:60px;height:60px;border:3px solid var(--bg-tertiary);border-top-color:var(--accent-orange);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 24px;"></div>
        <p style="color:var(--text-secondary);font-size:1rem;">Generating your personalized plan...</p>
      </div>
    `;

    setTimeout(() => {
      const profile = store.get('profile');
      const bmi = calculateBMI(profile.weight, profile.height);
      const bmiCat = getBMICategory(bmi);
      const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
      const tdee = calculateTDEE(bmr, getActivityLevel(profile.daysPerWeek));
      const target = getCalorieTarget(tdee, profile.fitnessGoal);
      const plan = getWorkoutPlan(profile.daysPerWeek);

      container.innerHTML = `
        <h2 class="section-title" style="margin-bottom:8px;">Your Plan is Ready! 🎉</h2>
        <p class="section-subtitle">Here's your personalized fitness roadmap</p>

        <div class="glass-card animate-fade-in-up" style="margin-bottom:16px;text-align:left;">
          <div style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Profile Summary</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.9rem;">
            <div><span style="color:var(--text-secondary);">Gender:</span> <strong>${profile.gender === 'male' ? 'Male' : 'Female'}</strong></div>
            <div><span style="color:var(--text-secondary);">Age:</span> <strong>${profile.age}</strong></div>
            <div><span style="color:var(--text-secondary);">Height:</span> <strong>${profile.height} cm</strong></div>
            <div><span style="color:var(--text-secondary);">Weight:</span> <strong>${profile.weight} kg</strong></div>
            <div><span style="color:var(--text-secondary);">Body Type:</span> <strong style="text-transform:capitalize;">${profile.bodyType}</strong></div>
            <div><span style="color:var(--text-secondary);">BMI:</span> <strong style="color:${bmiCat.color};">${bmi.toFixed(1)} (${bmiCat.label})</strong></div>
          </div>
        </div>

        <div class="glass-card animate-fade-in-up stagger-2" style="margin-bottom:16px;text-align:left;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Daily Calories</div>
              <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);font-family:var(--font-heading);">${target}</div>
            </div>
            <div>
              <div style="font-size:0.7rem;color:var(--text-secondary);text-transform:uppercase;">Workout Split</div>
              <div style="font-size:1.2rem;font-weight:700;color:var(--text-primary);">${plan.name}</div>
              <div style="font-size:0.8rem;color:var(--text-secondary);">${plan.days} days/week</div>
            </div>
          </div>
        </div>

        <button class="btn-primary animate-fade-in-up stagger-3" id="start-journey-btn" style="margin-top:24px;padding:16px 48px;font-size:1.1rem;width:100%;">🚀 Start Your Journey</button>
      `;

      container.querySelector('#start-journey-btn').onclick = () => {
        store.set('onboarded', true);
        router.navigate('/dashboard');
      };
    }, 2000);
  }

  renderStep();
  return page;
}
