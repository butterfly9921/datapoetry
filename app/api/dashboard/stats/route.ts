import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { getWeekRange, getMonthRange } from '@/lib/utils/date';
import { getMoodValue, avgMoodValue, valueToMood } from '@/lib/utils/mood';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'week';

    const range = period === 'month' ? getMonthRange() : getWeekRange();

    const diaryCount = (db.prepare(
      `SELECT COUNT(*) as count FROM diaries WHERE created_at >= ? AND created_at <= ?`
    ).get(range.start + 'T00:00:00.000Z', range.end + 'T23:59:59.999Z') as any).count;

    const checkinCount = (db.prepare(
      `SELECT COUNT(*) as count FROM diaries WHERE type = 'checkin' AND created_at >= ? AND created_at <= ?`
    ).get(range.start + 'T00:00:00.000Z', range.end + 'T23:59:59.999Z') as any).count;

    const moods = db.prepare(
      `SELECT mood FROM diaries WHERE mood IS NOT NULL AND created_at >= ? AND created_at <= ?`
    ).all(range.start + 'T00:00:00.000Z', range.end + 'T23:59:59.999Z') as any[];

    const moodValues = moods.map((m: any) => getMoodValue(m.mood)).filter((v: number) => v > 0);
    const avgVal = avgMoodValue(moodValues);
    const avgMood = avgVal ? valueToMood(avgVal) : null;

    return success({
      diaryCount,
      checkinCount,
      avgMood,
      avgMoodValue: avgVal ? parseFloat(avgVal.toFixed(1)) : null,
      period,
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
