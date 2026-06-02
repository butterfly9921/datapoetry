import { MoodType } from '@/types/diary';

export const MOOD_CONFIG: Record<MoodType, { emoji: string; label: string; color: string; lightColor: string; value: number }> = {
  happy:   { emoji: '😊', label: '开心', color: '#10B981', lightColor: '#ECFDF5', value: 5 },
  calm:    { emoji: '😌', label: '平静', color: '#3B82F6', lightColor: '#EFF6FF', value: 4 },
  anxious: { emoji: '😰', label: '焦虑', color: '#FBBF24', lightColor: '#FFFBEB', value: 3 },
  down:    { emoji: '😔', label: '低落', color: '#F97316', lightColor: '#FFF7ED', value: 2 },
  sad:     { emoji: '😢', label: '沮丧', color: '#8B5CF6', lightColor: '#F5F3FF', value: 1 },
};

export const MOOD_LIST: MoodType[] = ['happy', 'calm', 'anxious', 'down', 'sad'];

export function getMoodValue(mood: MoodType | null | undefined): number {
  if (!mood) return 0;
  return MOOD_CONFIG[mood]?.value ?? 0;
}

export function getMoodEmoji(mood: MoodType | null | undefined): string {
  if (!mood) return '❓';
  return MOOD_CONFIG[mood]?.emoji ?? '❓';
}

export function getMoodLabel(mood: MoodType | null | undefined): string {
  if (!mood) return '未知';
  return MOOD_CONFIG[mood]?.label ?? '未知';
}

export function getMoodColor(mood: MoodType | null | undefined): string {
  if (!mood) return '#EBEDF0';
  return MOOD_CONFIG[mood]?.color ?? '#EBEDF0';
}

export function getMoodLightColor(mood: MoodType | null | undefined): string {
  if (!mood) return '#F9FAFB';
  return MOOD_CONFIG[mood]?.lightColor ?? '#F9FAFB';
}

export function avgMoodValue(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function valueToMood(value: number): MoodType | null {
  const rounded = Math.round(value);
  if (rounded >= 5) return 'happy';
  if (rounded >= 4) return 'calm';
  if (rounded >= 3) return 'anxious';
  if (rounded >= 2) return 'down';
  if (rounded >= 1) return 'sad';
  return null;
}
