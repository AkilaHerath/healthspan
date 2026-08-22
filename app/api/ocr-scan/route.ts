import { NextRequest, NextResponse } from 'next/server';
import { ExtractedOcrField } from '@/lib/types';
import { CLINICAL_REFERENCE_RANGES, classifyLabResult } from '@/lib/referenceRanges';

// Pre-configured mock extraction profiles for different lab report types
const SAMPLE_EXTRACTION_PROFILES: Record<string, Array<{ testName: string; value: number; confidence: number }>> = {
  metabolic_panel: [
    { testName: 'Fasting Blood Sugar', value: 118, confidence: 96 },
    { testName: 'HbA1c', value: 6.1, confidence: 94 },
    { testName: 'Total Cholesterol', value: 224, confidence: 98 },
    { testName: 'LDL Cholesterol', value: 142, confidence: 78 }, // Low confidence trigger (<85%)
    { testName: 'HDL Cholesterol', value: 39, confidence: 92 },
    { testName: 'Triglycerides', value: 185, confidence: 95 }
  ],
  renal_liver_panel: [
    { testName: 'Serum Creatinine (S/Cr)', value: 1.22, confidence: 97 },
    { testName: 'eGFR', value: 86, confidence: 79 }, // Low confidence trigger (<85%)
    { testName: 'Blood Urea Nitrogen (BUN)', value: 18, confidence: 93 },
    { testName: 'ALT (SGPT)', value: 52, confidence: 96 },
    { testName: 'AST (SGOT)', value: 41, confidence: 81 } // Low confidence trigger (<85%)
  ],
  hematology_panel: [
    { testName: 'Hemoglobin', value: 14.8, confidence: 98 },
    { testName: 'Hematocrit', value: 43.5, confidence: 95 },
    { testName: 'Red Blood Cell (RBC)', value: 4.85, confidence: 82 } // Low confidence trigger (<85%)
  ]
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('documentType') as string) || 'metabolic_panel';

    const filename = file ? file.name : 'Scanned_Lab_Report.pdf';
    const profile = SAMPLE_EXTRACTION_PROFILES[documentType] || SAMPLE_EXTRACTION_PROFILES['metabolic_panel'];

    const extractedFields: ExtractedOcrField[] = profile.map(item => {
      const ref = CLINICAL_REFERENCE_RANGES[item.testName] || {
        min: 0,
        max: 100,
        unit: '',
        panel: 'Blood Sugar' as const
      };

      const classification = classifyLabResult(item.testName, item.value);

      return {
        testName: item.testName,
        panel: ref.panel,
        extractedValue: item.value,
        unit: ref.unit,
        confidence: item.confidence,
        isLowConfidence: item.confidence < 85,
        referenceMin: ref.min,
        referenceMax: ref.max,
        status: classification.status,
        verified: item.confidence >= 85
      };
    });

    return NextResponse.json({
      success: true,
      filename,
      extractedCount: extractedFields.length,
      lowConfidenceCount: extractedFields.filter(f => f.isLowConfidence).length,
      fields: extractedFields,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in OCR scan API:', error);
    return NextResponse.json({ success: false, error: 'OCR Extraction Failed' }, { status: 500 });
  }
}
