import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const activity = searchParams.get('activity') || 'all';
    const monthParam = searchParams.get('month'); // yyyy-MM

    const now = new Date();
    const targetMonth = monthParam ? new Date(monthParam + '-01') : now;
    const monthStart = startOfMonth(targetMonth);
    const monthEnd = endOfMonth(targetMonth);
    const monthStr = format(targetMonth, 'yyyy-MM');

    let whereClause = "type = 'checkin' AND created_at >= ? AND created_at <= ?";
    const params: any[] = [
      format(monthStart, "yyyy-MM-dd") + 'T00:00:00.000Z',
      format(monthEnd, "yyyy-MM-dd") + 'T23:59:59.999Z',
    ];

    if (activity !== 'all') {
      whereClause += ' AND activity_type = ?';
      params.push(activity);
    }

    const rows = db.prepare(
      `SELECT created_at, activity_type FROM diaries WHERE ${whereClause} ORDER BY created_at`
    ).all(...params) as any[];

    const checkedDates = new Set(rows.map(r => r.created_at.slice(0, 10)));

    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const days = allDays.map(d => ({
      date: format(d, 'yyyy-MM-dd'),
      checked: checkedDates.has(format(d, 'yyyy-MM-dd')),
    }));

    // Calculate streak (from today/last day backwards)
    let streak = 0;
    const sortedDays = [...days].reverse();
    for (const day of sortedDays) {
      if (day.checked) {
        streak++;
      } else {
        break;
      }
    }

    return success({
      activity: activity,
      month: monthStr,
      days,
      streak,
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
