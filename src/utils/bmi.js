export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6', advice: 'Focus on caloric surplus and strength training' };
  if (bmi < 25) return { label: 'Normal', color: '#22C55E', advice: 'Great shape! Maintain with balanced diet and exercise' };
  if (bmi < 30) return { label: 'Overweight', color: '#F59E0B', advice: 'Focus on caloric deficit and cardio + strength' };
  return { label: 'Obese', color: '#EF4444', advice: 'Consult a doctor. Start with low-impact cardio' };
}

export function getIdealWeightRange(heightCm) {
  const heightM = heightCm / 100;
  return {
    min: Math.round(18.5 * heightM * heightM),
    max: Math.round(24.9 * heightM * heightM),
  };
}
