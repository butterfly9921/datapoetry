import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { getLastNMonthsRange } from '@/lib/utils/date';
import { getMoodValue } from '@/lib/utils/mood';
import type { MoodType } from '@/types/diary';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get('months') || '3');

    const range = getLastNMonthsRange(months);

    // Get all moods in range
    const rows = db.prepare(
      `SELECT created_at, mood FROM diaries WHERE mood IS NOT NULL AND created_at >= ? AND created_at <= ? ORDER BY created_at`
    ).all(range.start + 'T00:00:00.000Z', range.end + 'T23:59:59.999Z') as any[];

    // Build lookup by date
    const moodByDate: Record<string, { mood: MoodType; value: number }> = {};
    for (const row of rows) {
      const date = row.created_at.slice(0, 10);
      // Take the latest mood for each day
      moodByDate[date] = { mood: row.mood, value: getMoodValue(row.mood) };
    }

    const days = range.days.map(date => ({
      date,
      mood: moodByDate[date]?.mood || null,
      value: moodByDate[date]?.value || null,
    }));

    return success({
      startDate: range.start,
      endDate: range.end,
      days,
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
