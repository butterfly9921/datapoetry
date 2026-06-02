import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. 日记表
export const diaries = sqliteTable('diaries', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['text', 'mood', 'checkin'] }).notNull(),
  content: text('content').notNull(),
  mood: text('mood', { enum: ['happy', 'calm', 'anxious', 'down', 'sad'] }),
  activity_type: text('activity_type', { enum: ['cycling', 'running', 'dancing', 'custom'] }),
  activity_name: text('activity_name'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// 2. 标签表
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
  count: integer('count').default(0),
  created_at: text('created_at').notNull(),
});

// 3. 日记-标签关联表
export const diaryTags = sqliteTable('diary_tags', {
  diary_id: text('diary_id').notNull().references(() => diaries.id, { onDelete: 'cascade' }),
  tag_id: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.diary_id, table.tag_id] }),
}));

// 4. 日记照片表
export const diaryPhotos = sqliteTable('diary_photos', {
  id: text('id').primaryKey(),
  diary_id: text('diary_id').notNull().references(() => diaries.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  original_name: text('original_name').notNull(),
  mime_type: text('mime_type').notNull(),
  size: integer('size').notNull(),
  created_at: text('created_at').notNull(),
});

// 5. 洞察记录表
export const insightsLog = sqliteTable('insights_log', {
  id: text('id').primaryKey(),
  rule_id: text('rule_id').notNull(),
  message: text('message').notNull(),
  shown_at: text('shown_at').notNull(),
  dismissed: integer('dismissed').default(0),
});

// 6. 设置表
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// 7. 日记引用表 — 日记关联的外部来源（新闻/书籍/电影等）
export const diaryReferences = sqliteTable('diary_references', {
  id: text('id').primaryKey(),
  diary_id: text('diary_id').notNull().references(() => diaries.id, { onDelete: 'cascade' }),
  source_type: text('source_type', { enum: ['news', 'book', 'movie'] }).notNull(),
  source_content: text('source_content').notNull(),
  source_date: text('source_date'),
  created_at: text('created_at').notNull(),
});

// 8. 回顾表 — 周期性的思想轨迹总结
export const retrospectives = sqliteTable('retrospectives', {
  id: text('id').primaryKey(),
  period: text('period', { enum: ['weekly', 'monthly'] }).notNull(),
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  diary_ids: text('diary_ids'),  // JSON array
  created_at: text('created_at').notNull(),
});
