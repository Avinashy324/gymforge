import { store } from '../store.js';
import { workoutPlans, getExerciseById, getWorkoutPlan } from '../data/workoutPlans.js';
import { router } from '../router.js';

export default function renderWorkout() {
  const page = document.createElement('div');
  page.className = 'page workout-page';

  const profile = store.get('profile');
  const plan = getWorkoutPlan(profile.daysPerWeek);
  let selectedDay = store.get('selectedPlanDay') || 0;
  if (selectedDay >= plan.schedule.length) selectedDay = 0;

  function render() {
    const dayData = plan.schedule[selectedDay];
    const exerciseList = dayData.exercises.map(id => getExerciseById(id)).filter(Boolean);

    page.innerHTML = `
      <!-- Header -->
      <div class="page-header animate-fade-in-up">
        <div>
          <h1 class="section-title" style="margin-bottom:4px;">Your Workout Plan</h1>
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="badge badge-orange">${plan.name}</span>
            <span class="badge badge-purple">${plan.level}</span>
          </div>
        </div>
      </div>

      <!-- Day Tabs -->
      <div class="tab-container day-tabs animate-fade-in-up stagger-1">
        ${plan.schedule.map((d, i) => `
          <div class="tab-item ${i === selectedDay ? 'active' : ''}" data-day="${i}">${d.day.replace('Day ', 'D').split(' — ')[0]}</div>
        `).join('')}
      </div>

      <!-- Day Title -->
      <h2 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:16px;" class="animate-fade-in-up stagger-2">${dayData.day}</h2>

      <!-- Exercise List -->
      <div class="exercise-list">
        ${exerciseList.map((ex, i) => `
          <div class="glass-card exercise-item animate-fade-in-up stagger-${Math.min(i + 2, 6)}" data-exercise-id="${ex.id}">
            <div class="exercise-thumb" data-video-id="${ex.videoId}" title="Play demo video">
              <img src="https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg" alt="${ex.name}" loading="lazy" onerror="this.style.display='none'">
              <div class="exercise-play-btn">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
            </div>
            <div class="exercise-info">
              <div class="exercise-name">${ex.name}</div>
              <div class="exercise-meta">${ex.muscle} • ${ex.equipment}</div>
              <div class="exercise-prescription">
                <span class="badge badge-blue">${ex.defaultSets} sets</span>
                <span class="badge badge-green">${ex.defaultReps} reps</span>
                <span class="badge badge-purple">${ex.restSeconds}s rest</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Floating Action Button -->
      <button class="btn-primary" id="log-workout-fab" style="position:fixed;bottom:90px;right:20px;padding:14px 24px;font-size:0.9rem;box-shadow:0 8px 30px rgba(255,107,44,0.4);z-index:40;">
        📊 Log This Workout
      </button>

      <!-- Video Modal -->
      <div class="modal-overlay" id="video-modal">
        <div class="modal-content" style="padding:0;overflow:hidden;max-width:640px;background:#000;">
          <button id="close-modal" style="position:absolute;top:8px;right:12px;background:rgba(0,0,0,0.7);color:white;border:none;width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;">✕</button>
          <div id="video-container" style="position:relative;padding-bottom:56.25%;height:0;">
          </div>
        </div>
      </div>
    `;

    // Tab clicks
    page.querySelectorAll('.tab-item').forEach(tab => {
      tab.onclick = () => {
        selectedDay = parseInt(tab.dataset.day);
        store.set('selectedPlanDay', selectedDay);
        render();
      };
    });

    // Video thumbnail clicks
    page.querySelectorAll('.exercise-thumb').forEach(thumb => {
      thumb.onclick = () => {
        const videoId = thumb.dataset.videoId;
        const modal = page.querySelector('#video-modal');
        const container = page.querySelector('#video-container');
        container.innerHTML = `<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>`;
        modal.classList.add('open');
      };
    });

    // Close modal
    page.querySelector('#close-modal')?.addEventListener('click', closeModal);
    page.querySelector('#video-modal')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) closeModal();
    });

    function closeModal() {
      const modal = page.querySelector('#video-modal');
      const container = page.querySelector('#video-container');
      modal.classList.remove('open');
      container.innerHTML = '';
    }

    // FAB
    page.querySelector('#log-workout-fab')?.addEventListener('click', () => router.navigate('/tracker'));
  }

  render();
  return page;
}
