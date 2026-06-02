export type DiaryType = 'text' | 'mood' | 'checkin';
export type MoodType = 'happy' | 'calm' | 'anxious' | 'down' | 'sad';
export type ActivityType = 'cycling' | 'running' | 'dancing' | 'custom';

export interface DiaryEntry {
  id: string;
  type: DiaryType;
  content: string;
  created_at: string;
  updated_at: string;
  // 心情专属
  mood?: MoodType;
  // 打卡专属
  activity_type?: ActivityType;
  activity_name?: string;
  // 标签
  tags: string[];
  // 照片
  photos?: DiaryPhoto[];
  // 引用来源
  references?: DiaryReference[];
}

export interface DiaryPhoto {
  id: string;
  diary_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  url?: string;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
  created_at: string;
}

export interface DiaryListParams {
  type?: DiaryType;
  tag?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 日记引用来源
export type SourceType = 'news' | 'book' | 'movie';

export interface DiaryReference {
  id: string;
  diary_id: string;
  source_type: SourceType;
  source_content: string;
  source_date?: string;
  created_at: string;
}

// 周期性回顾
export interface Retrospective {
  id: string;
  period: 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  title: string;
  summary?: string;
  diary_ids?: string;  // JSON array of diary IDs
  created_at: string;
}

// 连续记录统计
export interface StreakData {
  currentStreak: number;      // 当前连续天数
  longestStreak: number;      // 最长连续天数
  thisWeekCount: number;      // 本周日记数
  thisMonthCount: number;     // 本月日记数
  totalCount: number;         // 总日记数
  topTags: { name: string; count: number }[];  // 本周热门标签
  topSources: { type: SourceType; count: number }[];  // 引用来源统计
}
