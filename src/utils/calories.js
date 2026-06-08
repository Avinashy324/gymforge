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

export function getMacroSplit(calories, goal, weightKg = 70) {
  let proteinGrams;
  switch (goal) {
    case 'muscle-gain':
      proteinGrams = Math.round(weightKg * 2.0);
      break;
    case 'fat-loss':
      proteinGrams = Math.round(weightKg * 1.6);
      break;
    case 'endurance':
      proteinGrams = Math.round(weightKg * 1.4);
      break;
    default:
      proteinGrams = Math.round(weightKg * 1.2);
  }

  // Ensure protein does not exceed 45% of total calories (safety boundary)
  const maxProteinGrams = Math.round((calories * 0.45) / 4);
  if (proteinGrams > maxProteinGrams) {
    proteinGrams = maxProteinGrams;
  }
  // Ensure protein is at least 15% of total calories
  const minProteinGrams = Math.round((calories * 0.15) / 4);
  if (proteinGrams < minProteinGrams) {
    proteinGrams = minProteinGrams;
  }

  const proteinCalories = proteinGrams * 4;
  const remainingCalories = calories - proteinCalories;

  let fatPct;
  switch (goal) {
    case 'muscle-gain':
      fatPct = 0.25;
      break;
    case 'fat-loss':
      fatPct = 0.28;
      break;
    case 'endurance':
      fatPct = 0.22;
      break;
    default:
      fatPct = 0.25;
  }

  const fatCalories = calories * fatPct;
  const fatGrams = Math.round(fatCalories / 9);
  
  const carbCalories = remainingCalories - (fatGrams * 9);
  const carbGrams = Math.max(0, Math.round(carbCalories / 4));

  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams
  };
}
