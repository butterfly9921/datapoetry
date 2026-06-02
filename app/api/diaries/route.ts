import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';
import { getNowISO } from '@/lib/utils/date';
import { extractTags } from '@/lib/utils/tag';

function getDiaryById(db: ReturnType<typeof getDb>, id: string) {
  return db.prepare(`SELECT * FROM diaries WHERE id = ?`).get(id) as any;
}

function getTagsForDiary(db: ReturnType<typeof getDb>, diaryId: string) {
  return db.prepare(`
    SELECT t.* FROM tags t
    JOIN diary_tags dt ON t.id = dt.tag_id
    WHERE dt.diary_id = ?
  `).all(diaryId) as any[];
}

function getPhotosForDiary(db: ReturnType<typeof getDb>, diaryId: string) {
  return db.prepare(`SELECT * FROM diary_photos WHERE diary_id = ?`).all(diaryId) as any[];
}

function getReferencesForDiary(db: ReturnType<typeof getDb>, diaryId: string) {
  return db.prepare(`SELECT * FROM diary_references WHERE diary_id = ? ORDER BY created_at ASC`).all(diaryId) as any[];
}

function upsertTags(db: ReturnType<typeof getDb>, tagNames: string[], diaryId: string) {
  const now = getNowISO();
  const insertTag = db.prepare(`INSERT OR IGNORE INTO tags (id, name, count, created_at) VALUES (?, ?, 1, ?)`);
  const updateCount = db.prepare(`UPDATE tags SET count = (SELECT COUNT(*) FROM diary_tags WHERE tag_id = ?) WHERE id = ?`);
  const getTag = db.prepare(`SELECT id FROM tags WHERE name = ?`);
  const insertDiaryTag = db.prepare(`INSERT OR IGNORE INTO diary_tags (diary_id, tag_id) VALUES (?, ?)`);

  for (const name of tagNames) {
    const cleanName = name.startsWith('#') ? name.slice(1) : name;
    if (!cleanName) continue;
    let tag = getTag.get(cleanName) as any;
    if (!tag) {
      const tagId = uuidv4();
      insertTag.run(tagId, cleanName, now);
      tag = { id: tagId };
    }
    insertDiaryTag.run(diaryId, tag.id);
    updateCount.run(tag.id, tag.id);
  }
}

// GET /api/diaries
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (type && type !== 'all') {
      whereClause += ' AND d.type = ?';
      params.push(type);
    }
    if (startDate) {
      whereClause += ' AND d.created_at >= ?';
      params.push(startDate + 'T00:00:00.000Z');
    }
    if (endDate) {
      whereClause += ' AND d.created_at <= ?';
      params.push(endDate + 'T23:59:59.999Z');
    }
    if (tag) {
      whereClause += ` AND d.id IN (SELECT diary_id FROM diary_tags dt JOIN tags t ON dt.tag_id = t.id WHERE t.name = ?)`;
      params.push(tag);
    }

    // Count
    const countRow = db.prepare(`SELECT COUNT(*) as total FROM diaries d ${whereClause}`).get(...params) as any;
    const total = countRow?.total || 0;

    // Query
    const offset = (page - 1) * pageSize;
    const rows = db.prepare(
      `SELECT d.* FROM diaries d ${whereClause} ORDER BY d.created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, pageSize, offset) as any[];

    const items = rows.map(row => {
      const tags = getTagsForDiary(db, row.id);
      const photos = getPhotosForDiary(db, row.id);
      const references = getReferencesForDiary(db, row.id);
      return {
        ...row,
        tags: tags.map(t => t.name),
        photos: photos.map(p => ({
          ...p,
          url: `/uploads/${p.filename}`,
        })),
        references,
      };
    });

    return success({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}

// POST /api/diaries
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { type, content, mood, activity_type, activity_name, tags: tagInput, references } = body;

    if (!type || !content) {
      return error('VALIDATION_ERROR', 'type 和 content 为必填字段');
    }

    const now = getNowISO();
    const id = uuidv4();

    // Extract tags from content
    const contentTags = extractTags(content);
    const inputTags = tagInput || [];
    const allTags = Array.from(new Set([...contentTags, ...inputTags]));

    db.prepare(`
      INSERT INTO diaries (id, type, content, mood, activity_type, activity_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, type, content, mood || null, activity_type || null, activity_name || null, now, now);

    // Handle tags
    upsertTags(db, allTags, id);

    // Handle references
    if (references && Array.isArray(references)) {
      const insertRef = db.prepare(
        `INSERT INTO diary_references (id, diary_id, source_type, source_content, source_date, created_at) VALUES (?, ?, ?, ?, ?, ?)`
      );
      for (const ref of references) {
        insertRef.run(uuidv4(), id, ref.source_type, ref.source_content, ref.source_date || null, now);
      }
    }

    return success({ id, type, content, created_at: now });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
