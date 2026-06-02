import { exercises } from './exercises.js';

export function getExerciseById(id) {
  return exercises.find(e => e.id === id);
}

export function getWorkoutPlan(daysPerWeek) {
  if (daysPerWeek <= 3) return workoutPlans['3-day-full-body'];
  if (daysPerWeek === 4) return workoutPlans['4-day-upper-lower'];
  if (daysPerWeek === 5) return workoutPlans['5-day-ppl'];
  return workoutPlans['6-day-ppl'];
}

export const workoutPlans = {
  '3-day-full-body': {
    name: 'Full Body',
    days: 3,
    level: 'beginner',
    description: 'Perfect for beginners — hit every muscle group 3x per week with compound lifts.',
    schedule: [
      {
        day: 'Day 1 — Full Body A',
        exercises: ['barbell-squat', 'bench-press', 'barbell-row', 'overhead-press', 'barbell-curl', 'plank'],
      },
      {
        day: 'Day 2 — Full Body B',
        exercises: ['deadlift', 'incline-db-press', 'pull-up', 'lateral-raise', 'tricep-pushdown', 'hanging-leg-raise'],
      },
      {
        day: 'Day 3 — Full Body C',
        exercises: ['leg-press', 'db-fly', 'dumbbell-row', 'db-shoulder-press', 'hammer-curl', 'russian-twist'],
      },
    ],
  },
  '4-day-upper-lower': {
    name: 'Upper / Lower',
    days: 4,
    level: 'intermediate',
    description: 'Great balance of volume and recovery — two upper and two lower days.',
    schedule: [
      {
        day: 'Day 1 — Upper Body (Strength)',
        exercises: ['bench-press', 'barbell-row', 'overhead-press', 'pull-up', 'barbell-curl', 'skull-crusher'],
      },
      {
        day: 'Day 2 — Lower Body (Strength)',
        exercises: ['barbell-squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'standing-calf-raise', 'plank'],
      },
      {
        day: 'Day 3 — Upper Body (Volume)',
        exercises: ['incline-db-press', 'cable-fly', 'lat-pulldown', 'lateral-raise', 'hammer-curl', 'rope-pushdown'],
      },
      {
        day: 'Day 4 — Lower Body (Volume)',
        exercises: ['front-squat', 'lunges', 'leg-extension', 'stiff-leg-dl', 'hip-thrust', 'hanging-leg-raise'],
      },
    ],
  },
  '5-day-ppl': {
    name: 'Push / Pull / Legs',
    days: 5,
    level: 'intermediate',
    description: 'Classic PPL split — dedicated push, pull, and leg days for optimal volume.',
    schedule: [
      {
        day: 'Day 1 — Push',
        exercises: ['bench-press', 'overhead-press', 'incline-db-press', 'cable-fly', 'lateral-raise', 'tricep-pushdown', 'overhead-tricep-ext'],
      },
      {
        day: 'Day 2 — Pull',
        exercises: ['deadlift', 'pull-up', 'barbell-row', 'face-pull', 'barbell-curl', 'hammer-curl', 'rear-delt-fly'],
      },
      {
        day: 'Day 3 — Legs',
        exercises: ['barbell-squat', 'leg-press', 'romanian-deadlift', 'leg-extension', 'leg-curl', 'standing-calf-raise', 'plank'],
      },
      {
        day: 'Day 4 — Push (Volume)',
        exercises: ['db-shoulder-press', 'incline-db-press', 'dips', 'cable-fly', 'cable-lateral-raise', 'skull-crusher', 'rope-pushdown'],
      },
      {
        day: 'Day 5 — Pull (Volume)',
        exercises: ['lat-pulldown', 'seated-cable-row', 'dumbbell-row', 'face-pull', 'incline-db-curl', 'cable-curl', 'rear-delt-fly'],
      },
    ],
  },
  '6-day-ppl': {
    name: 'PPL × 2',
    days: 6,
    level: 'advanced',
    description: 'Hardcore PPL twice a week — maximum volume and frequency for serious lifters.',
    schedule: [
      {
        day: 'Day 1 — Push (Heavy)',
        exercises: ['bench-press', 'overhead-press', 'incline-db-press', 'cable-fly', 'lateral-raise', 'close-grip-bench', 'tricep-pushdown'],
      },
      {
        day: 'Day 2 — Pull (Heavy)',
        exercises: ['deadlift', 'barbell-row', 'pull-up', 'face-pull', 'barbell-curl', 'hammer-curl', 'rear-delt-fly'],
      },
      {
        day: 'Day 3 — Legs (Heavy)',
        exercises: ['barbell-squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'hip-thrust', 'standing-calf-raise', 'hanging-leg-raise'],
      },
      {
        day: 'Day 4 — Push (Volume)',
        exercises: ['db-shoulder-press', 'arnold-press', 'db-fly', 'dips', 'cable-lateral-raise', 'skull-crusher', 'rope-pushdown'],
      },
      {
        day: 'Day 5 — Pull (Volume)',
        exercises: ['lat-pulldown', 'seated-cable-row', 'dumbbell-row', 't-bar-row', 'preacher-curl', 'concentration-curl', 'face-pull'],
      },
      {
        day: 'Day 6 — Legs (Volume)',
        exercises: ['front-squat', 'bulgarian-split', 'lunges', 'leg-extension', 'stiff-leg-dl', 'seated-calf-raise', 'cable-crunch'],
      },
    ],
  },
};
