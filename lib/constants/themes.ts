import { ThemeName, MoodColors } from '@/types/settings';

export interface ThemeDefinition {
  name: string;
  label: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  text: string;
  textSecondary: string;
  background: string;
  card: string;
}

export const THEMES: Record<Exclude<ThemeName, 'custom'>, ThemeDefinition> = {
  mint: {
    name: 'mint',
    label: '薄荷绿',
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    primaryDark: '#059669',
    accent: '#34D399',
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    card: '#F9FAFB',
  },
  ocean: {
    name: 'ocean',
    label: '海雾蓝',
    primary: '#0EA5E9',
    primaryLight: '#E0F2FE',
    primaryDark: '#0284C7',
    accent: '#38BDF8',
    text: '#1E293B',
    textSecondary: '#64748B',
    background: '#FFFFFF',
    card: '#F8FAFC',
  },
  twilight: {
    name: 'twilight',
    label: '暮光紫',
    primary: '#8B5CF6',
    primaryLight: '#EDE9FE',
    primaryDark: '#7C3AED',
    accent: '#A78BFA',
    text: '#1E1B4B',
    textSecondary: '#6B7280',
    background: '#FAFAFA',
    card: '#F5F3FF',
  },
  warm: {
    name: 'warm',
    label: '暖橘棕',
    primary: '#F59E0B',
    primaryLight: '#FEF3C7',
    primaryDark: '#D97706',
    accent: '#FBBF24',
    text: '#292524',
    textSecondary: '#78716C',
    background: '#FFFBEB',
    card: '#FEF7ED',
  },
};

export const DEFAULT_MOOD_COLORS: MoodColors = {
  happy: '#10B981',
  calm: '#3B82F6',
  anxious: '#FBBF24',
  down: '#F97316',
  sad: '#8B5CF6',
};

export function generateColorVariants(hex: string) {
  // Simple light/dark generation
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const lighten = (v: number) => Math.min(255, v + Math.round((255 - v) * 0.7));
  const darken = (v: number) => Math.max(0, v - Math.round(v * 0.3));
  const accentFn = (v: number) => Math.min(255, v + Math.round((255 - v) * 0.4));

  return {
    primary: hex,
    primaryLight: `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`,
    primaryDark: `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`,
    accent: `#${accentFn(r).toString(16).padStart(2, '0')}${accentFn(g).toString(16).padStart(2, '0')}${accentFn(b).toString(16).padStart(2, '0')}`,
  };
}
