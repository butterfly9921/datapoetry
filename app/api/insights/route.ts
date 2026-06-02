import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';
import { getNowISO, daysSince } from '@/lib/utils/date';
import { getMoodValue } from '@/lib/utils/mood';
import type { Insight } from '@/types/insight';

function getDiariesForInsights(db: ReturnType<typeof getDb>) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return db.prepare(
    `SELECT * FROM diaries WHERE created_at >= ? ORDER BY created_at DESC`
  ).all(thirtyDaysAgo) as any[];
}

function getCheckins(db: ReturnType<typeof getDb>) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return db.prepare(
    `SELECT * FROM diaries WHERE type = 'checkin' AND created_at >= ? ORDER BY created_at DESC`
  ).all(thirtyDaysAgo) as any[];
}

export async function GET() {
  try {
    const db = getDb();
    const diaries = getDiariesForInsights(db);
    const checkins = getCheckins(db);
    const insights: Insight[] = [];
    const now = new Date();

    // R001: 连续3天心情低落 (低落或沮丧)
    const recentMoods = diaries.filter(d => d.mood && d.created_at >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    const moodDates = recentMoods.map(d => d.created_at.slice(0, 10));
    const uniqueMoodDates = Array.from(new Set(moodDates)).sort().reverse();

    let consecutiveDown = 0;
    for (let i = 0; i < uniqueMoodDates.length; i++) {
      const date = uniqueMoodDates[i];
      const dayMoods = recentMoods.filter(d => d.created_at.slice(0, 10) === date);
      const isDown = dayMoods.some(d => d.mood === 'down' || d.mood === 'sad');
      if (isDown) {
        consecutiveDown++;
        if (consecutiveDown >= 3) break;
      } else {
        consecutiveDown = 0;
      }
    }
    if (consecutiveDown >= 3) {
      insights.push({ id: uuidv4(), ruleId: 'R001', message: '最近三天都是低落的心情，也许出去走走会有帮助 🌿', priority: 1 });
    }

    // R002: 打卡后第二天心情变好
    const moodEntries = diaries.filter(d => d.mood).sort((a, b) => a.created_at.localeCompare(b.created_at));
    for (const ck of checkins.slice(0, 5)) {
      const ckDate = ck.created_at.slice(0, 10);
      const nextDay = new Date(ck.created_at);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDateStr = nextDay.toISOString().slice(0, 10);
      const nextMoods = moodEntries.filter(m => m.created_at.slice(0, 10) === nextDateStr);
      if (nextMoods.length > 0) {
        const ckMood = ck.mood ? getMoodValue(ck.mood) : 3;
        const nextMoodVal = Math.max(...nextMoods.map(m => getMoodValue(m.mood)));
        if (nextMoodVal > ckMood + 1) {
          insights.push({ id: uuidv4(), ruleId: 'R002', message: '运动真的对你有用呢，继续保持 💪', priority: 2 });
          break;
        }
      }
    }

    // R003: 打卡连续5天+
    const ckDates = Array.from(new Set(checkins.map(c => c.created_at.slice(0, 10)))).sort().reverse();
    let streak = 0;
    const today = now.toISOString().slice(0, 10);
    // Check from today backwards
    const checkDate = (dateStr: string) => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    };
    let current = today;
    // Also consider yesterday
    if (!ckDates.includes(today)) {
      const yesterday = checkDate(today);
      if (ckDates.includes(yesterday)) {
        current = yesterday;
      }
    }
    while (ckDates.includes(current)) {
      streak++;
      current = checkDate(current);
    }
    if (streak >= 5) {
      insights.push({ id: uuidv4(), ruleId: 'R003', message: `你已经连续打卡${streak}天了，坚持的力量 🌟`, priority: 3 });
    }

    // R004: 一周没写日记
    const lastEntry = diaries[0];
    const daysSinceLast = lastEntry ? daysSince(lastEntry.created_at) : 999;
    if (daysSinceLast >= 7) {
      insights.push({ id: uuidv4(), ruleId: 'R004', message: `已经${daysSinceLast}天没写日记了，今天想记点什么吗？ 📝`, priority: 4 });
    }

    // R005: 当天第一条日记
    const todayEntries = diaries.filter(d => d.created_at.slice(0, 10) === today);
    if (todayEntries.length > 0) {
      insights.push({ id: uuidv4(), ruleId: 'R005', message: '记录本身就是一种力量，今天的你值得被记住 🌸', priority: 5 });
    }

    // R006: 心情从低落变开心
    if (uniqueMoodDates.length >= 2) {
      const todayMoods = recentMoods.filter(d => d.created_at.slice(0, 10) === uniqueMoodDates[0]);
      const yesterdayMoods = recentMoods.filter(d => d.created_at.slice(0, 10) === uniqueMoodDates[1]);
      if (todayMoods.length > 0 && yesterdayMoods.length > 0) {
        const todayVal = Math.max(...todayMoods.map(m => getMoodValue(m.mood)));
        const yesterdayVal = Math.min(...yesterdayMoods.map(m => getMoodValue(m.mood)));
        if (yesterdayVal <= 2 && todayVal >= 4) {
          insights.push({ id: uuidv4(), ruleId: 'R006', message: '从阴霾到阳光，你正在变好 ☀️', priority: 6 });
        }
      }
    }

    // Sort by priority, take top 2
    const sorted = insights.sort((a, b) => a.priority - b.priority).slice(0, 2);

    // Check 24h dedup
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentLogs = db.prepare(
      `SELECT rule_id FROM insights_log WHERE dismissed = 0 AND shown_at > ?`
    ).all(twentyFourHoursAgo) as any[];
    const shownRuleIds = new Set(recentLogs.map(l => l.rule_id));

    const filteredInsights = sorted.filter(i => !shownRuleIds.has(i.ruleId));

    // Log shown insights
    const insertLog = db.prepare(
      `INSERT INTO insights_log (id, rule_id, message, shown_at, dismissed) VALUES (?, ?, ?, ?, 0)`
    );
    for (const ins of filteredInsights) {
      insertLog.run(uuidv4(), ins.ruleId, ins.message, getNowISO());
    }

    return success({ insights: filteredInsights });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}

// POST /api/insights/:id/dismiss
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { id } = body;
    if (!id) return error('VALIDATION_ERROR', '缺少 id');

    db.prepare(`UPDATE insights_log SET dismissed = 1 WHERE id = ?`).run(id);
    return success(null);
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
