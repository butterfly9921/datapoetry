import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const tags = db.prepare(
      `SELECT name, count FROM tags WHERE count > 0 ORDER BY count DESC LIMIT ?`
    ).all(limit) as any[];

    return success(tags.map(t => ({ name: t.name, count: t.count })));
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
