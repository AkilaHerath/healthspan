import { HealthSpanStore } from './types';

export const SEED_DEMO_STORE: HealthSpanStore = {
  version: '1.0.0',
  tenantId: 'tenant-enterprise-01',
  userId: 'usr_admin_01',
  account: {
    email: 'admin@healthspan.com',
    passwordHash: 'admin123',
    twoFactorEnabled: false,
    createdAt: '2026-01-10T09:00:00Z',
    lastLoginAt: '2026-08-22T08:30:00Z'
  },
  profile: {
    fullName: 'Alexander Wright, M.D.',
    dob: '1982-04-15',
    gender: 'male',
    ethnicity: 'Caucasian / Mixed',
    baselineBiometrics: {
      initialHeightCm: 178,
      initialWeightKg: 76.0,
      baselineBloodPressure: '120/80'
    }
  },
  timeSeries: {
    bodyMetrics: [
      {
        id: 'bm-001',
        timestamp: '2026-03-01T08:15:00Z',
        weightKg: 76.0,
        heightCm: 178,
        bmi: 24.0,
        waistCircumferenceCm: 92,
        bloodPressure: { systolic: 120, diastolic: 80, pulse: 68 },
        heartRateBpm: 68,
        notes: 'Baseline spring check-in. Normal vitals.',
        status: 'normal'
      },
      {
        id: 'bm-002',
        timestamp: '2026-04-12T07:45:00Z',
        weightKg: 77.2,
        heightCm: 178,
        bmi: 24.4,
        waistCircumferenceCm: 94,
        bloodPressure: { systolic: 124, diastolic: 82, pulse: 70 },
        heartRateBpm: 70,
        notes: 'Slight weight uptick post travel.',
        status: 'normal'
      },
      {
        id: 'bm-003',
        timestamp: '2026-05-20T08:30:00Z',
        weightKg: 78.5,
        heightCm: 178,
        bmi: 24.8,
        waistCircumferenceCm: 96,
        bloodPressure: { systolic: 128, diastolic: 84, pulse: 72 },
        heartRateBpm: 72,
        notes: 'Blood pressure slightly elevated in clinic.',
        status: 'normal'
      },
      {
        id: 'bm-004',
        timestamp: '2026-06-28T09:00:00Z',
        weightKg: 79.8,
        heightCm: 178,
        bmi: 25.2,
        waistCircumferenceCm: 99,
        bloodPressure: { systolic: 134, diastolic: 86, pulse: 74 },
        heartRateBpm: 74,
        notes: 'BMI crossed 25.0 threshold into overweight.',
        status: 'warning'
      },
      {
        id: 'bm-005',
        timestamp: '2026-07-04T12:46:00Z',
        weightKg: 80.5,
        heightCm: 178,
        bmi: 25.4,
        waistCircumferenceCm: 100,
        bloodPressure: { systolic: 136, diastolic: 88, pulse: 76 },
        heartRateBpm: 76,
        notes: 'Recorded at home after lunch. Systolic trending higher.',
        status: 'warning'
      },
      {
        id: 'bm-006',
        timestamp: '2026-08-18T08:00:00Z',
        weightKg: 81.2,
        heightCm: 178,
        bmi: 25.6,
        waistCircumferenceCm: 101,
        bloodPressure: { systolic: 138, diastolic: 88, pulse: 78 },
        heartRateBpm: 78,
        notes: 'Latest morning measurement. Upward trend sustained.',
        status: 'warning'
      }
    ],
    lifestyle: {
      sleep: [
        { id: 'sl-001', timestamp: '2026-08-16T06:30:00Z', durationHours: 6.2, qualityScore: 72, bedtime: '23:30', wakeTime: '06:00', notes: 'Woke up once during night.' },
        { id: 'sl-002', timestamp: '2026-08-17T06:45:00Z', durationHours: 6.5, qualityScore: 75, bedtime: '23:45', wakeTime: '06:30', notes: 'Normal sleep.' },
        { id: 'sl-003', timestamp: '2026-08-18T06:15:00Z', durationHours: 5.8, qualityScore: 64, bedtime: '00:15', wakeTime: '06:05', notes: 'Restless due to late screen time.' },
        { id: 'sl-004', timestamp: '2026-08-19T07:00:00Z', durationHours: 7.2, qualityScore: 88, bedtime: '23:15', wakeTime: '06:45', notes: 'Good deep sleep cycle.' },
        { id: 'sl-005', timestamp: '2026-08-20T06:30:00Z', durationHours: 6.0, qualityScore: 70, bedtime: '00:00', wakeTime: '06:00', notes: 'Early morning meeting.' },
        { id: 'sl-006', timestamp: '2026-08-21T06:45:00Z', durationHours: 6.3, qualityScore: 73, bedtime: '23:45', wakeTime: '06:15', notes: 'Mild morning fatigue.' }
      ],
      exercise: [
        { id: 'ex-001', timestamp: '2026-08-15T18:00:00Z', activityType: 'Cardio', durationMinutes: 35, intensity: 'Moderate', caloriesBurned: 280, notes: 'Treadmill jogging at 8.5 km/h' },
        { id: 'ex-002', timestamp: '2026-08-17T18:30:00Z', activityType: 'Strength', durationMinutes: 25, intensity: 'High', caloriesBurned: 190, notes: 'Upper body resistance training' },
        { id: 'ex-003', timestamp: '2026-08-19T19:00:00Z', activityType: 'Walking', durationMinutes: 20, intensity: 'Low', caloriesBurned: 95, notes: 'Evening brisk neighborhood walk' },
        { id: 'ex-004', timestamp: '2026-08-21T18:15:00Z', activityType: 'Cardio', durationMinutes: 20, intensity: 'Moderate', caloriesBurned: 160, notes: 'Stationary spin bike' }
      ],
      diet: [
        { id: 'dt-001', timestamp: '2026-08-21T08:30:00Z', mealType: 'Breakfast', description: 'Greek yogurt with rolled oats, chia seeds, and blueberries', calories: 420, proteinGrams: 28, carbsGrams: 48, fatGrams: 12, alcoholUnits: 0, cigarettesCount: 0 },
        { id: 'dt-002', timestamp: '2026-08-21T13:00:00Z', mealType: 'Lunch', description: 'Grilled chicken breast with quinoa, avocado, and mixed greens', calories: 650, proteinGrams: 45, carbsGrams: 55, fatGrams: 22, alcoholUnits: 0, cigarettesCount: 0 },
        { id: 'dt-003', timestamp: '2026-08-21T19:30:00Z', mealType: 'Dinner', description: 'Pan-seared Atlantic salmon with steamed broccoli and brown rice', calories: 720, proteinGrams: 48, carbsGrams: 60, fatGrams: 26, alcoholUnits: 1, cigarettesCount: 0 },
        { id: 'dt-004', timestamp: '2026-08-21T16:00:00Z', mealType: 'Snack', description: 'Handful of raw almonds and green tea', calories: 180, proteinGrams: 6, carbsGrams: 8, fatGrams: 15, alcoholUnits: 0, cigarettesCount: 0 }
      ],
      medications: [
        {
          id: 'med-001',
          condition: 'Hypertension',
          drugName: 'Amlodipine Besylate',
          dosage: '5 mg',
          frequency: 'Once daily in the morning',
          scheduleTime: ['08:00'],
          startDate: '2026-02-15',
          active: true,
          lastTakenTimestamp: '2026-08-22T08:05:00Z'
        },
        {
          id: 'med-002',
          condition: 'Type 2 Diabetes Prevention (Prediabetes)',
          drugName: 'Metformin HCl',
          dosage: '500 mg',
          frequency: 'Twice daily with meals',
          scheduleTime: ['08:00', '20:00'],
          startDate: '2026-05-10',
          active: true,
          lastTakenTimestamp: '2026-08-22T08:10:00Z' // Evening 20:00 dose is pending!
        },
        {
          id: 'med-003',
          condition: 'Dyslipidemia (Elevated LDL)',
          drugName: 'Atorvastatin Calcium',
          dosage: '10 mg',
          frequency: 'Once daily at bedtime',
          scheduleTime: ['21:30'],
          startDate: '2026-05-10',
          active: true,
          lastTakenTimestamp: '2026-08-21T21:40:00Z'
        }
      ]
    },
    labResults: [
      // March 2026 Panel (Baseline)
      { id: 'lab-001', timestamp: '2026-03-05T09:00:00Z', panel: 'Blood Sugar', testName: 'Fasting Blood Sugar', value: 92, unit: 'mg/dL', referenceRange: { min: 70, max: 99, optimal: '70-99 mg/dL' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-002', timestamp: '2026-03-05T09:00:00Z', panel: 'Blood Sugar', testName: 'HbA1c', value: 5.4, unit: '%', referenceRange: { min: 4.0, max: 5.6, optimal: '< 5.7 %' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-003', timestamp: '2026-03-05T09:00:00Z', panel: 'Lipid Panel', testName: 'Total Cholesterol', value: 188, unit: 'mg/dL', referenceRange: { min: 125, max: 200, optimal: '< 200 mg/dL' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-004', timestamp: '2026-03-05T09:00:00Z', panel: 'Lipid Panel', testName: 'LDL Cholesterol', value: 98, unit: 'mg/dL', referenceRange: { min: 50, max: 100, optimal: '< 100 mg/dL' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-005', timestamp: '2026-03-05T09:00:00Z', panel: 'Lipid Panel', testName: 'HDL Cholesterol', value: 48, unit: 'mg/dL', referenceRange: { min: 40, max: 90, optimal: '> 40 mg/dL' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-006', timestamp: '2026-03-05T09:00:00Z', panel: 'Lipid Panel', testName: 'Triglycerides', value: 135, unit: 'mg/dL', referenceRange: { min: 50, max: 150, optimal: '< 150 mg/dL' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-007', timestamp: '2026-03-05T09:00:00Z', panel: 'Renal Function', testName: 'Serum Creatinine (S/Cr)', value: 1.05, unit: 'mg/dL', referenceRange: { min: 0.74, max: 1.35, optimal: '0.74-1.35 mg/dL' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-008', timestamp: '2026-03-05T09:00:00Z', panel: 'Renal Function', testName: 'eGFR', value: 98, unit: 'mL/min/1.73m²', referenceRange: { min: 90, max: 120, optimal: '> 90 mL/min' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-009', timestamp: '2026-03-05T09:00:00Z', panel: 'Liver Function', testName: 'AST (SGOT)', value: 24, unit: 'U/L', referenceRange: { min: 10, max: 40, optimal: '10-40 U/L' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-010', timestamp: '2026-03-05T09:00:00Z', panel: 'Liver Function', testName: 'ALT (SGPT)', value: 28, unit: 'U/L', referenceRange: { min: 7, max: 56, optimal: '7-56 U/L' }, status: 'normal', source: 'manual', reviewedByPatient: true },
      { id: 'lab-011', timestamp: '2026-03-05T09:00:00Z', panel: 'Hemoglobin', testName: 'Hemoglobin', value: 15.2, unit: 'g/dL', referenceRange: { min: 13.8, max: 17.2, optimal: '13.8-17.2 g/dL' }, status: 'normal', source: 'manual', reviewedByPatient: true },

      // August 2026 Comprehensive Follow-up Panel (Showing Rising Glycemic & Lipid markers)
      { id: 'lab-012', timestamp: '2026-08-10T08:30:00Z', panel: 'Blood Sugar', testName: 'Fasting Blood Sugar', value: 114, unit: 'mg/dL', referenceRange: { min: 70, max: 99, optimal: '70-99 mg/dL' }, status: 'borderline', source: 'ocr_upload', ocrConfidence: 97, reviewedByPatient: true },
      { id: 'lab-013', timestamp: '2026-08-10T08:30:00Z', panel: 'Blood Sugar', testName: 'HbA1c', value: 5.9, unit: '%', referenceRange: { min: 4.0, max: 5.6, optimal: '< 5.7 %' }, status: 'borderline', source: 'ocr_upload', ocrConfidence: 95, reviewedByPatient: true },
      { id: 'lab-014', timestamp: '2026-08-10T08:30:00Z', panel: 'Lipid Panel', testName: 'Total Cholesterol', value: 218, unit: 'mg/dL', referenceRange: { min: 125, max: 200, optimal: '< 200 mg/dL' }, status: 'borderline', source: 'ocr_upload', ocrConfidence: 98, reviewedByPatient: true },
      { id: 'lab-015', timestamp: '2026-08-10T08:30:00Z', panel: 'Lipid Panel', testName: 'LDL Cholesterol', value: 136, unit: 'mg/dL', referenceRange: { min: 50, max: 100, optimal: '< 100 mg/dL' }, status: 'borderline', source: 'ocr_upload', ocrConfidence: 94, reviewedByPatient: true },
      { id: 'lab-016', timestamp: '2026-08-10T08:30:00Z', panel: 'Lipid Panel', testName: 'HDL Cholesterol', value: 41, unit: 'mg/dL', referenceRange: { min: 40, max: 90, optimal: '> 40 mg/dL' }, status: 'normal', source: 'ocr_upload', ocrConfidence: 96, reviewedByPatient: true },
      { id: 'lab-017', timestamp: '2026-08-10T08:30:00Z', panel: 'Lipid Panel', testName: 'Triglycerides', value: 172, unit: 'mg/dL', referenceRange: { min: 50, max: 150, optimal: '< 150 mg/dL' }, status: 'borderline', source: 'ocr_upload', ocrConfidence: 92, reviewedByPatient: true },
      { id: 'lab-018', timestamp: '2026-08-10T08:30:00Z', panel: 'Renal Function', testName: 'Serum Creatinine (S/Cr)', value: 1.18, unit: 'mg/dL', referenceRange: { min: 0.74, max: 1.35, optimal: '0.74-1.35 mg/dL' }, status: 'normal', source: 'ocr_upload', ocrConfidence: 99, reviewedByPatient: true },
      { id: 'lab-019', timestamp: '2026-08-10T08:30:00Z', panel: 'Liver Function', testName: 'ALT (SGPT)', value: 48, unit: 'U/L', referenceRange: { min: 7, max: 56, optimal: '7-56 U/L' }, status: 'normal', source: 'ocr_upload', ocrConfidence: 91, reviewedByPatient: true },
      { id: 'lab-020', timestamp: '2026-08-10T08:30:00Z', panel: 'Liver Function', testName: 'AST (SGOT)', value: 36, unit: 'U/L', referenceRange: { min: 10, max: 40, optimal: '10-40 U/L' }, status: 'normal', source: 'ocr_upload', ocrConfidence: 93, reviewedByPatient: true },
      { id: 'lab-021', timestamp: '2026-08-10T08:30:00Z', panel: 'Hemoglobin', testName: 'Hemoglobin', value: 15.0, unit: 'g/dL', referenceRange: { min: 13.8, max: 17.2, optimal: '13.8-17.2 g/dL' }, status: 'normal', source: 'ocr_upload', ocrConfidence: 98, reviewedByPatient: true }
    ]
  },
  auditTrail: [
    {
      id: 'aud-001',
      timestamp: '2026-03-01T08:15:00Z',
      action: 'CREATE',
      entityType: 'bodyMetrics',
      recordId: 'bm-001',
      summary: 'Initial baseline body metrics logged: Weight 76.0kg, BP 120/80 mmHg',
      newValue: { weightKg: 76.0, bloodPressure: '120/80' },
      reason: 'Baseline intake'
    },
    {
      id: 'aud-002',
      timestamp: '2026-05-20T08:45:00Z',
      action: 'UPDATE',
      entityType: 'bodyMetrics',
      recordId: 'bm-003',
      summary: 'Corrected blood pressure reading from 122/80 to 128/84 mmHg',
      previousValue: { bloodPressure: { systolic: 122, diastolic: 80 } },
      newValue: { bloodPressure: { systolic: 128, diastolic: 84 } },
      reason: 'Second consecutive measurement on left arm recorded'
    },
    {
      id: 'aud-003',
      timestamp: '2026-08-10T09:15:00Z',
      action: 'CREATE',
      entityType: 'labResults',
      recordId: 'lab-012',
      summary: 'OCR Ingestion confirmed: Fasting Blood Sugar 114 mg/dL',
      newValue: { testName: 'Fasting Blood Sugar', value: 114, unit: 'mg/dL' },
      reason: 'Lab report uploaded via OCR scanner'
    }
  ],
  preferences: {
    digestFrequency: 'weekly',
    inAppNotifications: true,
    pushNotifications: true
  },
  notifications: [
    {
      id: 'notif-001',
      timestamp: '2026-08-22T08:00:00Z',
      title: 'Medication Due: Metformin 500mg',
      message: 'Your evening dose of Metformin 500mg is scheduled for 20:00. Remember to take it with dinner.',
      type: 'reminder',
      read: false
    },
    {
      id: 'notif-002',
      timestamp: '2026-08-20T10:00:00Z',
      title: 'Type 2 Diabetes Risk Prediction Triggered',
      message: 'Multi-metric analysis flagged rising FBS (114 mg/dL) and upward weight trajectory. View suggested lifestyle modifications.',
      type: 'warning',
      read: false
    },
    {
      id: 'notif-003',
      timestamp: '2026-08-15T09:00:00Z',
      title: 'Weekly HealthSpan Digest Ready',
      message: 'Your overall Health Score is 78/100 (Fair). Check out your progress over the last 7 days.',
      type: 'info',
      read: true
    }
  ]
};
