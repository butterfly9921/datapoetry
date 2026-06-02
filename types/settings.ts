export type ThemeName = 'mint' | 'ocean' | 'twilight' | 'warm' | 'custom';

export interface MoodColors {
  happy: string;
  calm: string;
  anxious: string;
  down: string;
  sad: string;
}

export interface AppSettings {
  theme: ThemeName;
  customPrimaryColor: string | null;
  moodColorsFollowTheme: boolean;
  moodColors: MoodColors;
}
