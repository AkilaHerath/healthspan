import { HealthSpanStore, HealthScoreBreakdown } from './types';
import { calculateBMI } from './referenceRanges';

/**
 * Calculates a comprehensive Health Score (0-100) with weighted contributions:
 * - Body Metrics Score (30%)
 * - Lifestyle Score (30%)
 * - Lab Biomarkers Score (40%)
 */
export function calculateHealthScore(store: HealthSpanStore): HealthScoreBreakdown {
  const { timeSeries, profile } = store;

  // 1. Evaluate Body Metrics (30% weight)
  let bodyScore = 85; // baseline
  let bodyDetails = 'Body metrics evaluated across BMI, blood pressure, and waist circumference.';
  let bodyStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  const latestBody = timeSeries.bodyMetrics[timeSeries.bodyMetrics.length - 1];
  if (latestBody) {
    let deductions = 0;
    const bmi = latestBody.bmi || calculateBMI(latestBody.weightKg || profile.baselineBiometrics.initialWeightKg, latestBody.heightCm || profile.baselineBiometrics.initialHeightCm);
    
    if (bmi >= 25 && bmi < 30) deductions += 10;
    else if (bmi >= 30) deductions += 22;
    else if (bmi < 18.5 && bmi > 0) deductions += 12;

    if (latestBody.bloodPressure) {
      const { systolic, diastolic } = latestBody.bloodPressure;
      if (systolic >= 140 || diastolic >= 90) deductions += 25;
      else if (systolic >= 130 || diastolic >= 80) deductions += 12;
      else if (systolic >= 120) deductions += 5;
    }

    if (latestBody.waistCircumferenceCm) {
      const threshold = profile.gender === 'female' ? 88 : 102;
      if (latestBody.waistCircumferenceCm > threshold) deductions += 12;
    }

    bodyScore = Math.max(20, Math.min(100, 100 - deductions));
    if (bodyScore >= 80) bodyStatus = 'optimal';
    else if (bodyScore >= 60) bodyStatus = 'warning';
    else bodyStatus = 'critical';

    bodyDetails = `Latest BMI ${bmi.toFixed(1)} (${bmi > 25 ? 'Elevated' : 'Normal'}), BP ${latestBody.bloodPressure ? `${latestBody.bloodPressure.systolic}/${latestBody.bloodPressure.diastolic} mmHg` : 'Normal'}.`;
  }

  // 2. Evaluate Lifestyle (30% weight)
  let lifestyleScore = 80;
  let lifestyleDetails = 'Lifestyle evaluated across sleep duration, exercise consistency, diet, alcohol, and medications.';
  let lifestyleStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  const recentSleep = timeSeries.lifestyle.sleep.slice(-7);
  const recentExercise = timeSeries.lifestyle.exercise.slice(-7);
  const recentDiet = timeSeries.lifestyle.diet.slice(-7);

  let lifestyleDeductions = 0;

  // Sleep check
  if (recentSleep.length > 0) {
    const avgSleep = recentSleep.reduce((acc, s) => acc + s.durationHours, 0) / recentSleep.length;
    if (avgSleep < 6.0) lifestyleDeductions += 15;
    else if (avgSleep < 7.0) lifestyleDeductions += 8;
  }

  // Exercise check
  if (recentExercise.length > 0) {
    const totalWeeklyMins = recentExercise.reduce((acc, e) => acc + e.durationMinutes, 0);
    if (totalWeeklyMins < 60) lifestyleDeductions += 18;
    else if (totalWeeklyMins < 150) lifestyleDeductions += 8;
  } else {
    lifestyleDeductions += 15;
  }

  // Alcohol & Smoking
  let totalAlcohol = 0;
  let totalCigarettes = 0;
  recentDiet.forEach(d => {
    if (d.alcoholUnits) totalAlcohol += d.alcoholUnits;
    if (d.cigarettesCount) totalCigarettes += d.cigarettesCount;
  });

  if (totalAlcohol > 14) lifestyleDeductions += 15;
  else if (totalAlcohol > 7) lifestyleDeductions += 6;

  if (totalCigarettes > 0) lifestyleDeductions += 20;

  lifestyleScore = Math.max(25, Math.min(100, 100 - lifestyleDeductions));
  if (lifestyleScore >= 80) lifestyleStatus = 'optimal';
  else if (lifestyleScore >= 60) lifestyleStatus = 'warning';
  else lifestyleStatus = 'critical';

  lifestyleDetails = `Weekly exercise ${recentExercise.reduce((a, b) => a + b.durationMinutes, 0)} mins, ${totalCigarettes > 0 ? 'Active smoking flagged' : 'Non-smoking'}, ${totalAlcohol} alcohol units logged.`;

  // 3. Evaluate Lab Biomarkers (40% weight)
  let labScore = 88;
  let labDetails = 'Lab biomarkers evaluated across Glycemic, Lipid, Renal, and Liver profiles.';
  let labStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  const labs = timeSeries.labResults;
  if (labs.length > 0) {
    let criticalCount = 0;
    let borderlineCount = 0;

    // Get latest distinct tests
    const latestTestMap = new Map<string, typeof labs[0]>();
    labs.forEach(l => {
      latestTestMap.set(l.testName, l);
    });

    latestTestMap.forEach(test => {
      if (test.status === 'critical') criticalCount++;
      else if (test.status === 'borderline') borderlineCount++;
    });

    const labDeductions = (criticalCount * 22) + (borderlineCount * 8);
    labScore = Math.max(20, Math.min(100, 100 - labDeductions));

    if (labScore >= 80) labStatus = 'optimal';
    else if (labScore >= 60) labStatus = 'warning';
    else labStatus = 'critical';

    labDetails = `${criticalCount} critical alerts, ${borderlineCount} borderline markers across ${latestTestMap.size} unique lab tests.`;
  }

  // Overall Weighted Score
  const overallScore = Math.round(
    (bodyScore * 0.30) + (lifestyleScore * 0.30) + (labScore * 0.40)
  );

  let scoreGrade: 'Optimal' | 'Good' | 'Fair' | 'Needs Attention' | 'Critical' = 'Good';
  if (overallScore >= 90) scoreGrade = 'Optimal';
  else if (overallScore >= 80) scoreGrade = 'Good';
  else if (overallScore >= 70) scoreGrade = 'Fair';
  else if (overallScore >= 55) scoreGrade = 'Needs Attention';
  else scoreGrade = 'Critical';

  // Construct 90-day simulated trend history
  const trendHistory = [
    { date: '90 Days Ago', score: Math.min(100, Math.max(40, overallScore + 6)) },
    { date: '60 Days Ago', score: Math.min(100, Math.max(40, overallScore + 3)) },
    { date: '30 Days Ago', score: Math.min(100, Math.max(40, overallScore - 2)) },
    { date: '14 Days Ago', score: Math.min(100, Math.max(40, overallScore - 1)) },
    { date: 'Today', score: overallScore }
  ];

  return {
    overallScore,
    bodyMetricsScore: bodyScore,
    lifestyleScore,
    labBiomarkersScore: labScore,
    scoreGrade,
    contributions: [
      {
        category: 'Lab Biomarkers',
        score: labScore,
        weight: 40,
        status: labStatus,
        details: labDetails
      },
      {
        category: 'Body Metrics',
        score: bodyScore,
        weight: 30,
        status: bodyStatus,
        details: bodyDetails
      },
      {
        category: 'Lifestyle Habits',
        score: lifestyleScore,
        weight: 30,
        status: lifestyleStatus,
        details: lifestyleDetails
      }
    ],
    trendHistory
  };
}
