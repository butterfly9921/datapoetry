import { MoodType, ActivityType } from './diary';

export interface DashboardStats {
  diaryCount: number;
  checkinCount: number;
  avgMood: MoodType | null;
  avgMoodValue: number | null;
  period: 'week' | 'month';
}

export interface HeatmapDay {
  date: string;
  mood: MoodType | null;
  value: number | null;
}

export interface HeatmapData {
  startDate: string;
  endDate: string;
  days: HeatmapDay[];
}

export interface MoodTrendPoint {
  date: string;
  mood: MoodType | null;
  value: number | null;
  summary?: string;
}

export interface MoodTrendData {
  days: MoodTrendPoint[];
}

export interface CheckinDay {
  date: string;
  checked: boolean;
}

export interface CheckinCalendarData {
  activity: ActivityType | 'all';
  month: string;
  days: CheckinDay[];
  streak: number;
}

export interface TagCloudItem {
  name: string;
  count: number;
}
