import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';
import { getNowISO } from '@/lib/utils/date';

// GET /api/retrospectives — 列出所有回顾
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period'); // weekly | monthly
    const limit = parseInt(searchParams.get('limit') || '10');

    let where = '1=1';
    const params: any[] = [];
    if (period) {
      where = 'period = ?';
      params.push(period);
    }

    const rows = db.prepare(
      `SELECT * FROM retrospectives WHERE ${where} ORDER BY end_date DESC LIMIT ?`
    ).all(...params, limit) as any[];

    return success(rows);
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}

// POST /api/retrospectives — 生成回顾
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { period, start_date, end_date } = body; // 'weekly' | 'monthly'

    if (!period || !start_date || !end_date) {
      return error('VALIDATION_ERROR', 'period, start_date, end_date 为必填');
    }

    // 找到时间范围内的所有日记
    const diaries = db.prepare(`
      SELECT d.* FROM diaries d
      WHERE d.created_at >= ? AND d.created_at <= ?
      ORDER BY d.created_at ASC
    `).all(start_date + 'T00:00:00.000Z', end_date + 'T23:59:59.999Z') as any[];

    if (diaries.length === 0) {
      return error('NO_DATA', '该时间段没有日记记录');
    }

    // 收集标签
    const tagRow = db.prepare(`
      SELECT t.name, COUNT(*) as count
      FROM tags t
      JOIN diary_tags dt ON t.id = dt.tag_id
      JOIN diaries d ON d.id = dt.diary_id
      WHERE d.created_at >= ? AND d.created_at <= ?
      GROUP BY t.name
      ORDER BY count DESC
      LIMIT 5
    `).all(start_date + 'T00:00:00.000Z', end_date + 'T23:59:59.999Z') as any[];

    // 收集引用来源
    const sourceRow = db.prepare(`
      SELECT source_type, COUNT(*) as count
      FROM diary_references
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY source_type
      ORDER BY count DESC
    `).all(start_date + 'T00:00:00.000Z', end_date + 'T23:59:59.999Z') as any[];

    const diaryIds = diaries.map(d => d.id);

    const periodLabel = period === 'weekly' ? '周' : '月';
    const title = `${start_date} ~ ${end_date} ${periodLabel}回顾`;

    // 生成摘要
    const tagSummary = tagRow.length > 0
      ? `关键词：${tagRow.map(t => `#${t.name}`).join('、')}`
      : '';
    const sourceSummary = sourceRow.length > 0
      ? `你从${sourceRow.map(s => `${s.count}条${s.source_type === 'news' ? '新闻' : s.source_type === 'book' ? '书' : '电影'}`).join('、')}中获得灵感`
      : '';
    const summary = [
      `本周写了 ${diaries.length} 篇日记`,
      tagSummary,
      sourceSummary,
      diaries.length >= 1 ? '继续保持思考和记录的习惯吧 ✨' : '',
    ].filter(Boolean).join('。');

    const now = getNowISO();
    const id = uuidv4();

    db.prepare(`
      INSERT INTO retrospectives (id, period, start_date, end_date, title, summary, diary_ids, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, period, start_date, end_date, title, summary, JSON.stringify(diaryIds), now);

    return success({
      id, period, start_date, end_date, title, summary,
      diary_count: diaries.length, diary_ids: diaryIds,
      top_tags: tagRow,
      top_sources: sourceRow,
      created_at: now,
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
