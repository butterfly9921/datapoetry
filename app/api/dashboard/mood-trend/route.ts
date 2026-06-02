import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { getLastNDays } from '@/lib/utils/date';
import { getMoodValue } from '@/lib/utils/mood';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const lastDays = getLastNDays(days);
    const startDate = format(lastDays[0], 'yyyy-MM-dd');
    const endDate = format(lastDays[lastDays.length - 1], 'yyyy-MM-dd');

    const rows = db.prepare(
      `SELECT created_at, mood, content FROM diaries WHERE mood IS NOT NULL AND created_at >= ? AND created_at <= ? ORDER BY created_at`
    ).all(startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z') as any[];

    // Build lookup by date
    const moodByDate: Record<string, { mood: string; value: number; summary: string }> = {};
    for (const row of rows) {
      const date = row.created_at.slice(0, 10);
      moodByDate[date] = {
        mood: row.mood,
        value: getMoodValue(row.mood),
        summary: row.content?.slice(0, 50) || '',
      };
    }

    const trendDays = lastDays.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const m = moodByDate[dateStr];
      return {
        date: dateStr,
        mood: m?.mood || null,
        value: m?.value || null,
        summary: m?.summary || null,
      };
    });

    return success({ days: trendDays });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
