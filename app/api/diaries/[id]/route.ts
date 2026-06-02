import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { success, error } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';
import { getNowISO } from '@/lib/utils/date';
import { extractTags } from '@/lib/utils/tag';

// GET /api/diaries/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const diary = db.prepare(`SELECT * FROM diaries WHERE id = ?`).get(params.id) as any;

    if (!diary) {
      return error('DIARY_NOT_FOUND', '日记不存在', 404);
    }

    const tags = db.prepare(`
      SELECT t.* FROM tags t JOIN diary_tags dt ON t.id = dt.tag_id WHERE dt.diary_id = ?
    `).all(params.id) as any[];

    const photos = db.prepare(`SELECT * FROM diary_photos WHERE diary_id = ?`).all(params.id) as any[];

    const references = db.prepare(`SELECT * FROM diary_references WHERE diary_id = ? ORDER BY created_at ASC`).all(params.id) as any[];

    return success({
      ...diary,
      tags: tags.map(t => t.name),
      photos: photos.map(p => ({
        ...p,
        url: `/uploads/${p.filename}`,
      })),
      references,
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}

// PUT /api/diaries/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const existing = db.prepare(`SELECT * FROM diaries WHERE id = ?`).get(params.id) as any;
    if (!existing) {
      return error('DIARY_NOT_FOUND', '日记不存在', 404);
    }

    const body = await req.json();
    const { content, mood, activity_type, activity_name, tags: tagInput, references } = body;
    const now = getNowISO();

    db.prepare(`
      UPDATE diaries SET
        content = COALESCE(?, content),
        mood = ?,
        activity_type = ?,
        activity_name = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      content || existing.content,
      mood !== undefined ? mood : existing.mood,
      activity_type !== undefined ? activity_type : existing.activity_type,
      activity_name !== undefined ? activity_name : existing.activity_name,
      now,
      params.id
    );

    // Update tags if provided
    if (tagInput) {
      // Remove old tag associations
      db.prepare(`DELETE FROM diary_tags WHERE diary_id = ?`).run(params.id);
      // Update tag counts
      db.prepare(`UPDATE tags SET count = (SELECT COUNT(*) FROM diary_tags WHERE tag_id = tags.id)`).run();

      // Add new tags
      const contentTags = extractTags(content || existing.content);
      const allTags = Array.from(new Set([...contentTags, ...tagInput]));
      const insertDiaryTag = db.prepare(`INSERT OR IGNORE INTO diary_tags (diary_id, tag_id) VALUES (?, ?)`);
      const getTag = db.prepare(`SELECT id FROM tags WHERE name = ?`);
      const insertTag = db.prepare(`INSERT OR IGNORE INTO tags (id, name, count, created_at) VALUES (?, ?, 1, ?)`);

      for (const name of allTags) {
        const cleanName = name.startsWith('#') ? name.slice(1) : name;
        let tag = getTag.get(cleanName) as any;
        if (!tag) {
          const tagId = uuidv4();
          insertTag.run(tagId, cleanName, now);
          tag = { id: tagId };
        }
        insertDiaryTag.run(params.id, tag.id);
      }
      // Update all counts
      db.prepare(`UPDATE tags SET count = (SELECT COUNT(*) FROM diary_tags WHERE tag_id = tags.id)`).run();
    }

    // Update references if provided
    if (references !== undefined) {
      db.prepare(`DELETE FROM diary_references WHERE diary_id = ?`).run(params.id);
      if (Array.isArray(references) && references.length > 0) {
        const insertRef = db.prepare(
          `INSERT INTO diary_references (id, diary_id, source_type, source_content, source_date, created_at) VALUES (?, ?, ?, ?, ?, ?)`
        );
        for (const ref of references) {
          insertRef.run(uuidv4(), params.id, ref.source_type, ref.source_content, ref.source_date || null, now);
        }
      }
    }

    return success({ id: params.id, updated_at: now });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}

// DELETE /api/diaries/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const existing = db.prepare(`SELECT * FROM diaries WHERE id = ?`).get(params.id) as any;
    if (!existing) {
      return error('DIARY_NOT_FOUND', '日记不存在', 404);
    }

    db.prepare(`DELETE FROM diaries WHERE id = ?`).run(params.id);

    // Update tag counts after deletion
    db.prepare(`UPDATE tags SET count = (SELECT COUNT(*) FROM diary_tags WHERE tag_id = tags.id)`).run();

    return success(null);
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
