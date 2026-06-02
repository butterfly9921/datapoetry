import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';

/** 按日期分组获取日记天数的有序列表 */
function getDiaryDates(db: ReturnType<typeof getDb>): string[] {
  const rows = db.prepare(`
    SELECT DISTINCT date(created_at) as d
    FROM diaries
    ORDER BY d DESC
  `).all() as { d: string }[];
  return rows.map(r => r.d);
}

/** 计算连续记录天数（从今天往回数） */
function calcCurrentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // 今天或昨天必须有记录才算连续
  const latestDate = dates[0];
  if (latestDate !== todayStr && latestDate !== yesterdayStr) return 0;

  let streak = 1;
  let checkDate = new Date(latestDate);

  for (let i = 1; i < dates.length; i++) {
    checkDate.setDate(checkDate.getDate() - 1);
    const expected = checkDate.toISOString().slice(0, 10);
    if (dates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/** 计算历史最长连续天数 */
function calcLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

    if (Math.abs(diffDays - 1) < 0.01) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export async function GET() {
  try {
    const db = getDb();

    // Diary dates (DESC order) for streak calculation
    const dates = getDiaryDates(db);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const weekStartISO = weekStart.toISOString().slice(0, 10) + 'T00:00:00.000Z';

    // Counts
    const totalRow = db.prepare(`SELECT COUNT(*) as total FROM diaries`).get() as any;
    const weekRow = db.prepare(`SELECT COUNT(*) as total FROM diaries WHERE created_at >= ?`).get(weekStartISO) as any;
    const monthRow = db.prepare(`SELECT COUNT(*) as total FROM diaries WHERE created_at >= ?`).get(monthStart) as any;

    // Top tags this week
    const topTags = db.prepare(`
      SELECT t.name, COUNT(*) as count
      FROM tags t
      JOIN diary_tags dt ON t.id = dt.tag_id
      JOIN diaries d ON d.id = dt.diary_id
      WHERE d.created_at >= ?
      GROUP BY t.name
      ORDER BY count DESC
      LIMIT 5
    `).all(weekStartISO) as any[];

    // Source stats this week
    const topSources = db.prepare(`
      SELECT source_type as type, COUNT(*) as count
      FROM diary_references
      WHERE created_at >= ?
      GROUP BY source_type
      ORDER BY count DESC
    `).all(weekStartISO) as any[];

    return success({
      currentStreak: calcCurrentStreak(dates),
      longestStreak: calcLongestStreak(dates),
      thisWeekCount: weekRow?.total || 0,
      thisMonthCount: monthRow?.total || 0,
      totalCount: totalRow?.total || 0,
      topTags: topTags.map(t => ({ name: t.name, count: t.count })),
      topSources: topSources.map(s => ({ type: s.type, count: s.count })),
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
