import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { DEFAULT_MOOD_COLORS } from '@/lib/constants/themes';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`SELECT key, value FROM settings`).all() as any[];
    const settingsMap: Record<string, string> = {};
    for (const row of rows) {
      settingsMap[row.key] = row.value;
    }

    return success({
      theme: settingsMap.theme || 'mint',
      customPrimaryColor: settingsMap.customPrimaryColor || null,
      moodColorsFollowTheme: settingsMap.moodColorsFollowTheme === 'true',
      moodColors: settingsMap.moodColors
        ? JSON.parse(settingsMap.moodColors)
        : DEFAULT_MOOD_COLORS,
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const upsert = db.prepare(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`
    );

    if (body.theme !== undefined) upsert.run('theme', body.theme);
    if (body.customPrimaryColor !== undefined) upsert.run('customPrimaryColor', body.customPrimaryColor);
    if (body.moodColorsFollowTheme !== undefined) upsert.run('moodColorsFollowTheme', String(body.moodColorsFollowTheme));
    if (body.moodColors) upsert.run('moodColors', JSON.stringify(body.moodColors));

    return success({ updated: true });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
