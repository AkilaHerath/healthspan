import { HealthSpanStore, ClinicalInsight } from './types';
import { calculateBMI } from './referenceRanges';

/**
 * Evaluates multi-metric cross-domain trends and generates clinical risk predictions
 * with actionable lifestyle suggestions and medical alerts.
 */
export function generatePredictiveInsights(store: HealthSpanStore): ClinicalInsight[] {
  const insights: ClinicalInsight[] = [];
  const { timeSeries, profile } = store;

  const now = new Date().toISOString();

  // Helper getters
  const bodyMetrics = [...timeSeries.bodyMetrics].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const exercises = [...timeSeries.lifestyle.exercise].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const diet = [...timeSeries.lifestyle.diet];
  const sleep = [...timeSeries.lifestyle.sleep];
  const labs = [...timeSeries.labResults];

  const latestBody = bodyMetrics[bodyMetrics.length - 1];
  const previousBody = bodyMetrics.length > 1 ? bodyMetrics[0] : null;

  // Lab helpers
  const getLatestLab = (testName: string) => {
    const matching = labs.filter(l => l.testName.toLowerCase() === testName.toLowerCase());
    return matching.length > 0 ? matching[matching.length - 1] : null;
  };

  const getPreviousLab = (testName: string) => {
    const matching = labs.filter(l => l.testName.toLowerCase() === testName.toLowerCase());
    return matching.length > 1 ? matching[0] : null;
  };

  const latestFBS = getLatestLab('Fasting Blood Sugar');
  const previousFBS = getPreviousLab('Fasting Blood Sugar');
  const latestHbA1c = getLatestLab('HbA1c');
  const latestLDL = getLatestLab('LDL Cholesterol');
  const latestTriglycerides = getLatestLab('Triglycerides');
  const latestHDL = getLatestLab('HDL Cholesterol');
  const latestCreatinine = getLatestLab('Serum Creatinine (S/Cr)');
  const latestALT = getLatestLab('ALT (SGPT)');
  const latestAST = getLatestLab('AST (SGOT)');

  // 1. RULE: Type 2 Diabetes Prediction Engine (Cross-Domain Multi-Metric)
  // Weight rising + Exercise duration falling + Fasting Blood Sugar rising
  const isWeightRising = previousBody && latestBody && (latestBody.weightKg || 0) > (previousBody.weightKg || 0);
  const currentBMI = latestBody ? (latestBody.bmi || calculateBMI(latestBody.weightKg || 75, latestBody.heightCm || 175)) : 24;

  const recentWeeklyExerciseMins = exercises.slice(-7).reduce((acc, e) => acc + e.durationMinutes, 0);
  const isExerciseLowOrDecreasing = recentWeeklyExerciseMins < 120;

  const isFBSRisingOrElevated = (latestFBS && latestFBS.value >= 100) || 
    (previousFBS && latestFBS && latestFBS.value > previousFBS.value) ||
    (latestHbA1c && latestHbA1c.value >= 5.7);

  if ((isWeightRising || currentBMI >= 25) && (isFBSRisingOrElevated || isExerciseLowOrDecreasing)) {
    const fbsVal = latestFBS ? `${latestFBS.value} mg/dL` : 'elevated';
    const weightTrendText = isWeightRising && previousBody ? `weight has trended upward (+${((latestBody.weightKg || 0) - (previousBody.weightKg || 0)).toFixed(1)} kg)` : `current BMI is ${currentBMI.toFixed(1)}`;

    insights.push({
      id: 'insight-diabetes-risk',
      title: 'Type 2 Diabetes Progression Risk Detected',
      severity: isFBSRisingOrElevated && isWeightRising ? 'critical' : 'warning',
      category: 'Metabolic',
      finding: `A multi-metric risk pattern was detected: your ${weightTrendText}, weekly physical activity is ${recentWeeklyExerciseMins} mins (below 150m target), and Fasting Blood Sugar is at ${fbsVal}. This trajectory indicates a high risk of developing prediabetes or Type 2 Diabetes.`,
      metricsInvolved: ['Fasting Blood Sugar', 'Body Weight / BMI', 'Exercise Duration', 'HbA1c'],
      lifestyleSuggestions: [
        'Adopt a Low-Glycemic Index (GI) Mediterranean nutrition plan focusing on complex fiber and leafy greens.',
        'Target 30 minutes of moderate-to-vigorous aerobic or resistance exercise at least 5 days per week.',
        'Eliminate sugar-sweetened beverages and refined carbohydrates.',
        'Schedule a repeat Fasting Blood Glucose and HbA1c panel in 90 days.'
      ],
      doctorConsultRequired: true,
      doctorConsultReason: 'Discuss potential insulin resistance screening and oral glucose tolerance testing with your physician.',
      detectedAt: now
    });
  }

  // 2. RULE: Cardiovascular & Atherosclerosis Risk
  const isBPElevated = latestBody?.bloodPressure && (latestBody.bloodPressure.systolic >= 130 || latestBody.bloodPressure.diastolic >= 80);
  const isLDLElevated = latestLDL && latestLDL.value >= 100;
  const isWaistAtRisk = latestBody?.waistCircumferenceCm && latestBody.waistCircumferenceCm >= (profile.gender === 'female' ? 88 : 102);

  if (isBPElevated && (isLDLElevated || isWaistAtRisk)) {
    insights.push({
      id: 'insight-cvd-risk',
      title: 'Elevated Cardiovascular & Atherosclerosis Risk',
      severity: (latestBody?.bloodPressure?.systolic && latestBody.bloodPressure.systolic >= 140) ? 'critical' : 'warning',
      category: 'Cardiovascular',
      finding: `Co-occurrence of elevated blood pressure (${latestBody?.bloodPressure?.systolic}/${latestBody?.bloodPressure?.diastolic} mmHg) and ${isLDLElevated ? `elevated LDL (${latestLDL?.value} mg/dL)` : 'increased abdominal adiposity'} accelerates arterial stiffness and endothelial inflammation.`,
      metricsInvolved: ['Blood Pressure', 'LDL Cholesterol', 'Waist Circumference'],
      lifestyleSuggestions: [
        'Incorporate the Dietary Approaches to Stop Hypertension (DASH) protocol with sodium < 2,000 mg/day.',
        'Engage in Zone 2 aerobic training (walking, cycling, swimming) to improve vascular elasticity.',
        'Increase intake of soluble fiber (oats, legumes, flaxseeds) to lower circulating LDL particles.'
      ],
      doctorConsultRequired: true,
      doctorConsultReason: 'Comprehensive cardiovascular assessment and lipid particle evaluation recommended.',
      detectedAt: now
    });
  }

  // 3. RULE: Metabolic Syndrome Cluster Check (Criteria: 3+ of Waist, Triglycerides, HDL, BP, Glucose)
  let metSynCount = 0;
  const metSynFactors: string[] = [];

  if (isWaistAtRisk) { metSynCount++; metSynFactors.push('Elevated Waist Circumference'); }
  if (latestTriglycerides && latestTriglycerides.value >= 150) { metSynCount++; metSynFactors.push(`High Triglycerides (${latestTriglycerides.value} mg/dL)`); }
  if (latestHDL && latestHDL.value < (profile.gender === 'female' ? 50 : 40)) { metSynCount++; metSynFactors.push(`Low HDL (${latestHDL.value} mg/dL)`); }
  if (isBPElevated) { metSynCount++; metSynFactors.push('Elevated Blood Pressure'); }
  if (latestFBS && latestFBS.value >= 100) { metSynCount++; metSynFactors.push(`Impaired Fasting Glucose (${latestFBS.value} mg/dL)`); }

  if (metSynCount >= 3) {
    insights.push({
      id: 'insight-metabolic-syndrome',
      title: 'Metabolic Syndrome Cluster Criteria Met (3+ Indicators)',
      severity: 'critical',
      category: 'Metabolic',
      finding: `You currently meet ${metSynCount} diagnostic criteria for Metabolic Syndrome: ${metSynFactors.join(', ')}. This constellation significantly elevates future risks for type 2 diabetes and stroke.`,
      metricsInvolved: metSynFactors,
      lifestyleSuggestions: [
        'Prioritize 5-10% body weight reduction over the next 6 months through progressive caloric deficit.',
        'Implement 12-hour overnight intermittent fasting window to boost cellular insulin sensitivity.',
        'Limit saturated fats to < 7% of total caloric intake.'
      ],
      doctorConsultRequired: true,
      doctorConsultReason: 'Primary care consultation for metabolic syndrome staging and management protocol.',
      detectedAt: now
    });
  }

  // 4. RULE: Hepatic / Non-Alcoholic Fatty Liver Stress
  if ((latestALT && latestALT.value > 45) || (latestAST && latestAST.value > 40)) {
    insights.push({
      id: 'insight-hepatic-stress',
      title: 'Hepatic Enzyme Elevation (Liver Stress)',
      severity: 'warning',
      category: 'Hepatic',
      finding: `Elevated transaminase levels (${latestALT ? `ALT: ${latestALT.value} U/L` : ''} ${latestAST ? `AST: ${latestAST.value} U/L` : ''}) indicate active hepatocellular stress, frequently associated with metabolic load or steatosis.`,
      metricsInvolved: ['ALT (SGPT)', 'AST (SGOT)', 'BMI'],
      lifestyleSuggestions: [
        'Minimize ultra-processed foods, high-fructose corn syrup, and refined sugars.',
        'Restrict alcohol consumption to zero units during liver recovery period.',
        'Consider antioxidant-rich foods including artichokes, cruciferous vegetables, and green tea.'
      ],
      doctorConsultRequired: true,
      doctorConsultReason: 'Liver function panel re-check and hepatic ultrasound review.',
      detectedAt: now
    });
  }

  // 5. RULE: Renal Function / Kidney Biomarker Monitoring
  if (latestCreatinine && latestCreatinine.value > 1.25) {
    insights.push({
      id: 'insight-renal-stress',
      title: 'Renal Biomarker Elevation (Serum Creatinine)',
      severity: latestCreatinine.value > 1.4 ? 'critical' : 'warning',
      category: 'Renal',
      finding: `Serum Creatinine level is recorded at ${latestCreatinine.value} mg/dL. In conjunction with blood pressure management, renal filtration efficiency warrants proactive oversight.`,
      metricsInvolved: ['Serum Creatinine (S/Cr)', 'eGFR', 'Blood Pressure'],
      lifestyleSuggestions: [
        'Maintain consistent daily hydration (2.5 - 3.0 liters of water unless clinically restricted).',
        'Avoid excessive unmonitored NSAID painkiller usage (e.g. ibuprofen).',
        'Moderate high-dose creatine monohydrate supplementation if currently active.'
      ],
      doctorConsultRequired: true,
      doctorConsultReason: 'Repeat eGFR and spot urine albumin-to-creatinine ratio (uACR) test.',
      detectedAt: now
    });
  }

  // 6. RULE: Sleep Optimization & Circadian Health
  const recentSleeps = sleep.slice(-7);
  if (recentSleeps.length > 0) {
    const avgSleepHours = recentSleeps.reduce((acc, s) => acc + s.durationHours, 0) / recentSleeps.length;
    if (avgSleepHours < 6.5) {
      insights.push({
        id: 'insight-sleep-deficit',
        title: 'Chronic Sleep Deficit Impairing Metabolic Recovery',
        severity: 'info',
        category: 'Lifestyle',
        finding: `Your recent 7-day average sleep duration is ${avgSleepHours.toFixed(1)} hours (recommended: 7.5 - 9.0 hours). Chronic sleep restriction elevates evening cortisol and disrupts leptin/ghrelin satiety signaling.`,
        metricsInvolved: ['Sleep Duration', 'Sleep Quality Score'],
        lifestyleSuggestions: [
          'Establish a fixed bedtime and morning wake-up schedule within a ±30 minute window.',
          'Cease screen and blue-light exposure 60 minutes prior to sleep.',
          'Keep the sleeping environment dark, quiet, and temperature controlled (~18-20°C / 65-68°F).'
        ],
        doctorConsultRequired: false,
        detectedAt: now
      });
    }
  }

  // Fallback info insight if few records exist
  if (insights.length < 5) {
    insights.push({
      id: 'insight-preventive-maintenance',
      title: 'Proactive HealthSpan Optimization Protocol',
      severity: 'info',
      category: 'Lifestyle',
      finding: 'Regular timeseries tracking of vitals, biometrics, and lab work empowers early detection of subclinical physiological deviations.',
      metricsInvolved: ['Timeseries Logging', 'Lab Testing'],
      lifestyleSuggestions: [
        'Keep continuous logs of your meals and exercise frequency to train your predictive model.',
        'Perform annual comprehensive health panel testing for longitudinal tracking.'
      ],
      doctorConsultRequired: false,
      detectedAt: now
    });
  }

  // Sort by severity (critical > warning > info)
  const severityRank = { critical: 0, warning: 1, info: 2 };
  return insights.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}
