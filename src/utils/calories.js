export function calculateBMR(gender, weightKg, heightCm, age) {
  // Mifflin-St Jeor
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

export function getActivityLevel(daysPerWeek) {
  if (daysPerWeek <= 2) return 'sedentary';
  if (daysPerWeek <= 3) return 'light';
  if (daysPerWeek <= 4) return 'moderate';
  if (daysPerWeek <= 5) return 'active';
  return 'veryActive';
}

export function getCalorieTarget(tdee, goal) {
  switch (goal) {
    case 'muscle-gain': return Math.round(tdee + 400);
    case 'fat-loss': return Math.round(tdee - 500);
    case 'endurance': return Math.round(tdee + 200);
    default: return tdee;
  }
}

export function getMacroSplit(calories, goal) {
  let proteinPct, carbPct, fatPct;
  switch (goal) {
    case 'muscle-gain': proteinPct = 0.30; carbPct = 0.45; fatPct = 0.25; break;
    case 'fat-loss': proteinPct = 0.35; carbPct = 0.35; fatPct = 0.30; break;
    case 'endurance': proteinPct = 0.25; carbPct = 0.50; fatPct = 0.25; break;
    default: proteinPct = 0.30; carbPct = 0.40; fatPct = 0.30;
  }
  return {
    protein: Math.round((calories * proteinPct) / 4),
    carbs: Math.round((calories * carbPct) / 4),
    fat: Math.round((calories * fatPct) / 9),
  };
}
