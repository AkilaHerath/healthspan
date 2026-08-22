import { LabPanelType, ReferenceRange } from './types';

export const CLINICAL_REFERENCE_RANGES: Record<string, ReferenceRange & { panel: LabPanelType; category: string }> = {
  // Blood Sugar Panel
  'Fasting Blood Sugar': {
    min: 70,
    max: 99,
    optimal: '70 - 99 mg/dL',
    unit: 'mg/dL',
    panel: 'Blood Sugar',
    category: 'Glycemic Control'
  },
  'HbA1c': {
    min: 4.0,
    max: 5.6,
    optimal: '< 5.7 %',
    unit: '%',
    panel: 'Blood Sugar',
    category: 'Glycemic Control'
  },
  'Postprandial Glucose': {
    min: 70,
    max: 140,
    optimal: '< 140 mg/dL',
    unit: 'mg/dL',
    panel: 'Blood Sugar',
    category: 'Glycemic Control'
  },

  // Hemoglobin & Hematology
  'Hemoglobin': {
    min: 13.8,
    max: 17.2,
    optimal: '13.8 - 17.2 g/dL (Male) / 12.1 - 15.1 g/dL (Female)',
    unit: 'g/dL',
    panel: 'Hemoglobin',
    category: 'Hematology'
  },
  'Hematocrit': {
    min: 38.8,
    max: 50.0,
    optimal: '38.8 - 50.0 %',
    unit: '%',
    panel: 'Hemoglobin',
    category: 'Hematology'
  },
  'Red Blood Cell (RBC)': {
    min: 4.35,
    max: 5.65,
    optimal: '4.35 - 5.65 x10^6/uL',
    unit: 'x10^6/uL',
    panel: 'Hemoglobin',
    category: 'Hematology'
  },

  // Lipid Panel
  'Total Cholesterol': {
    min: 125,
    max: 200,
    optimal: '< 200 mg/dL',
    unit: 'mg/dL',
    panel: 'Lipid Panel',
    category: 'Cardiovascular'
  },
  'HDL Cholesterol': {
    min: 40,
    max: 90,
    optimal: '> 40 mg/dL (Male) / > 50 mg/dL (Female)',
    unit: 'mg/dL',
    panel: 'Lipid Panel',
    category: 'Cardiovascular'
  },
  'LDL Cholesterol': {
    min: 50,
    max: 100,
    optimal: '< 100 mg/dL',
    unit: 'mg/dL',
    panel: 'Lipid Panel',
    category: 'Cardiovascular'
  },
  'Triglycerides': {
    min: 50,
    max: 150,
    optimal: '< 150 mg/dL',
    unit: 'mg/dL',
    panel: 'Lipid Panel',
    category: 'Cardiovascular'
  },

  // Renal Function
  'Serum Creatinine (S/Cr)': {
    min: 0.74,
    max: 1.35,
    optimal: '0.74 - 1.35 mg/dL',
    unit: 'mg/dL',
    panel: 'Renal Function',
    category: 'Renal Health'
  },
  'eGFR': {
    min: 90,
    max: 120,
    optimal: '> 90 mL/min/1.73m²',
    unit: 'mL/min/1.73m²',
    panel: 'Renal Function',
    category: 'Renal Health'
  },
  'Blood Urea Nitrogen (BUN)': {
    min: 7,
    max: 20,
    optimal: '7 - 20 mg/dL',
    unit: 'mg/dL',
    panel: 'Renal Function',
    category: 'Renal Health'
  },

  // Liver Function
  'AST (SGOT)': {
    min: 10,
    max: 40,
    optimal: '10 - 40 U/L',
    unit: 'U/L',
    panel: 'Liver Function',
    category: 'Hepatic Health'
  },
  'ALT (SGPT)': {
    min: 7,
    max: 56,
    optimal: '7 - 56 U/L',
    unit: 'U/L',
    panel: 'Liver Function',
    category: 'Hepatic Health'
  },
  'Total Bilirubin': {
    min: 0.2,
    max: 1.2,
    optimal: '0.2 - 1.2 mg/dL',
    unit: 'mg/dL',
    panel: 'Liver Function',
    category: 'Hepatic Health'
  }
};

export const BODY_METRICS_RANGES = {
  bmi: {
    underweight: { max: 18.4, label: 'Underweight', status: 'warning' },
    normal: { min: 18.5, max: 24.9, label: 'Normal Weight', status: 'normal' },
    overweight: { min: 25.0, max: 29.9, label: 'Overweight', status: 'warning' },
    obese: { min: 30.0, label: 'Obese', status: 'critical' }
  },
  bloodPressure: {
    normal: { systolicMax: 120, diastolicMax: 80, label: 'Normal', status: 'normal' },
    elevated: { systolicMin: 120, systolicMax: 129, diastolicMax: 80, label: 'Elevated', status: 'warning' },
    stage1: { systolicMin: 130, systolicMax: 139, diastolicMin: 80, diastolicMax: 89, label: 'Stage 1 Hypertension', status: 'warning' },
    stage2: { systolicMin: 140, diastolicMin: 90, label: 'Stage 2 Hypertension', status: 'critical' }
  },
  waistCircumference: {
    maleRiskThreshold: 102, // cm (>40 inches)
    femaleRiskThreshold: 88, // cm (>35 inches)
  },
  heartRate: {
    min: 60,
    max: 100,
    optimal: '60 - 100 bpm'
  }
};

/**
 * Calculates BMI from weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Classifies BMI into status and category
 */
export function classifyBMI(bmi: number): { label: string; status: 'normal' | 'warning' | 'critical'; color: string } {
  if (bmi <= 0) return { label: 'Unknown', status: 'normal', color: 'var(--text-muted)' };
  if (bmi < 18.5) return { label: 'Underweight', status: 'warning', color: 'var(--warning)' };
  if (bmi <= 24.9) return { label: 'Normal', status: 'normal', color: 'var(--emerald)' };
  if (bmi <= 29.9) return { label: 'Overweight', status: 'warning', color: 'var(--amber)' };
  return { label: 'Obese (Class I+)', status: 'critical', color: 'var(--rose)' };
}

/**
 * Classifies Blood Pressure into clinical category
 */
export function classifyBP(systolic: number, diastolic: number): { label: string; status: 'normal' | 'warning' | 'critical'; color: string } {
  if (systolic < 120 && diastolic < 80) {
    return { label: 'Normal', status: 'normal', color: 'var(--emerald)' };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return { label: 'Elevated', status: 'warning', color: 'var(--amber)' };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return { label: 'Stage 1 HTN', status: 'warning', color: 'var(--amber)' };
  }
  return { label: 'Stage 2 HTN', status: 'critical', color: 'var(--rose)' };
}

/**
 * Classifies Lab biomarker value against clinical reference range
 */
export function classifyLabResult(testName: string, value: number): { status: 'normal' | 'borderline' | 'critical'; message: string } {
  const ref = CLINICAL_REFERENCE_RANGES[testName];
  if (!ref) return { status: 'normal', message: 'In range' };

  if (value >= ref.min && value <= ref.max) {
    return { status: 'normal', message: `Optimal (${ref.optimal || `${ref.min}-${ref.max} ${ref.unit}`})` };
  }

  // Borderline vs Critical thresholds
  const deviation = value > ref.max ? (value - ref.max) / ref.max : (ref.min - value) / ref.min;

  if (deviation > 0.35) {
    return { status: 'critical', message: `Critical Alert: ${value > ref.max ? 'Significantly High' : 'Significantly Low'}` };
  } else {
    return { status: 'borderline', message: `Borderline: ${value > ref.max ? 'Elevated' : 'Sub-optimal'}` };
  }
}

/**
 * Calculates BMR and Daily Calorie Target using Mifflin-St Jeor equation
 */
export function calculateCalorieTarget(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: 'male' | 'female' | 'other',
  activityMultiplier: number = 1.375 // Lightly active default
): { bmr: number; tdee: number; target: number } {
  // Mifflin-St Jeor Equation:
  // Male: 10 * weight (kg) + 6.25 * height (cm) - 5 * age + 5
  // Female: 10 * weight (kg) + 6.25 * height (cm) - 5 * age - 161
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  bmr = Math.max(1000, Math.round(bmr));
  const tdee = Math.round(bmr * activityMultiplier);
  // Default target for maintenance/healthy body composition
  return { bmr, tdee, target: tdee };
}
