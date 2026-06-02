import { NextRequest } from 'next/server';
import { success, error } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';
import { getNowISO } from '@/lib/utils/date';
import { getDb } from '@/lib/db';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return error('VALIDATION_ERROR', '请选择上传文件');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return error('VALIDATION_ERROR', '仅支持 JPG、PNG、WebP 格式');
    }

    if (file.size > MAX_SIZE) {
      return error('VALIDATION_ERROR', '文件大小不能超过 5MB');
    }

    // Ensure upload dir exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = file.type === 'image/jpeg' ? '.jpg' : file.type === 'image/png' ? '.png' : '.webp';
    const filename = `${uuidv4()}_${Date.now()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Save to database
    const db = getDb();
    const id = uuidv4();
    const now = getNowISO();

    db.prepare(`
      INSERT INTO diary_photos (id, diary_id, filename, original_name, mime_type, size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, '', filename, file.name, file.type, file.size, now);

    return success({
      id,
      filename,
      url: `/uploads/${filename}`,
      original_name: file.name,
      size: file.size,
    });
  } catch (e: any) {
    return error('INTERNAL_ERROR', e.message, 500);
  }
}
