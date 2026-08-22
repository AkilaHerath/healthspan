import { NextRequest, NextResponse } from 'next/server';
import { HealthSpanStore } from '@/lib/types';
import { generateExportData } from '@/lib/storage';
import { SEED_DEMO_STORE } from '@/lib/seedData';

export async function POST(request: NextRequest) {
  try {
    const { format, store }: { format: 'json' | 'csv'; store?: HealthSpanStore } = await request.json();
    const activeStore = store || SEED_DEMO_STORE;
    const { content, filename, mimeType } = generateExportData(activeStore, format || 'json');

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
