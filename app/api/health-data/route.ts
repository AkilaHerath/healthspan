import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SEED_DEMO_STORE } from '@/lib/seedData';
import { HealthSpanStore } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data', 'users');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getUserFilePath(userId: string): string {
  ensureDataDir();
  return path.join(DATA_DIR, `${userId.replace(/[^a-zA-Z0-9_-]/g, '')}.json`);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_admin_01';
    const filePath = getUserFilePath(userId);

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }

    // Default to seed data
    fs.writeFileSync(filePath, JSON.stringify(SEED_DEMO_STORE, null, 2), 'utf-8');
    return NextResponse.json(SEED_DEMO_STORE);
  } catch (error) {
    console.error('API Error in GET /api/health-data:', error);
    return NextResponse.json(SEED_DEMO_STORE);
  }
}

export async function POST(request: NextRequest) {
  try {
    const store: HealthSpanStore = await request.json();
    const userId = store.userId || 'usr_admin_01';
    const filePath = getUserFilePath(userId);

    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Saved successfully' });
  } catch (error) {
    console.error('API Error in POST /api/health-data:', error);
    return NextResponse.json({ success: false, error: 'Failed to save health data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_admin_01';
    const filePath = getUserFilePath(userId);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return NextResponse.json({ success: true, message: 'Account and health records deleted permanently' });
  } catch (error) {
    console.error('API Error in DELETE /api/health-data:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
