'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeName, AppSettings, MoodColors } from '@/types/settings';
import { THEMES, DEFAULT_MOOD_COLORS, generateColorVariants, ThemeDefinition } from '@/lib/constants/themes';

interface ThemeContextType {
  settings: AppSettings;
  setTheme: (theme: ThemeName) => void;
  setCustomColor: (color: string) => void;
  setMoodColorsFollowTheme: (follow: boolean) => void;
  setMoodColor: (mood: keyof MoodColors, color: string) => void;
  saveSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'mint',
  customPrimaryColor: null,
  moodColorsFollowTheme: true,
  moodColors: { ...DEFAULT_MOOD_COLORS },
};

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  setTheme: () => {},
  setCustomColor: () => {},
  setMoodColorsFollowTheme: () => {},
  setMoodColor: () => {},
  saveSettings: async () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyThemeToDOM(settings: AppSettings) {
  const root = document.documentElement;

  // Apply theme CSS variables
  const themeDef: ThemeDefinition | null =
    settings.theme === 'custom' && settings.customPrimaryColor
      ? { name: 'custom', label: '自定义', ...generateColorVariants(settings.customPrimaryColor), text: '#1F2937', textSecondary: '#6B7280', background: '#FFFFFF', card: '#F9FAFB' }
      : THEMES[settings.theme as Exclude<ThemeName, 'custom'>] || THEMES.mint;

  if (themeDef) {
    root.style.setProperty('--color-primary', themeDef.primary);
    root.style.setProperty('--color-primary-light', themeDef.primaryLight);
    root.style.setProperty('--color-primary-dark', themeDef.primaryDark);
    root.style.setProperty('--color-accent', themeDef.accent);
    root.style.setProperty('--color-text', themeDef.text);
    root.style.setProperty('--color-text-secondary', themeDef.textSecondary);
    root.style.setProperty('--color-bg', themeDef.background);
    root.style.setProperty('--color-bg-secondary', themeDef.card);
    const rgb = themeDef.primary.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (rgb) {
      root.style.setProperty('--color-primary-rgb', `${parseInt(rgb[1], 16)}, ${parseInt(rgb[2], 16)}, ${parseInt(rgb[3], 16)}`);
    }
  }

  // Set data-theme attribute for CSS selector-based theming
  root.setAttribute('data-theme', settings.theme);

  // Apply mood colors
  const moodColors = settings.moodColorsFollowTheme && themeDef
    ? {
        happy: themeDef.primary,
        calm: '#3B82F6',
        anxious: '#FBBF24',
        down: '#F97316',
        sad: '#8B5CF6',
      }
    : settings.moodColors;

  root.style.setProperty('--color-mood-happy', moodColors.happy);
  root.style.setProperty('--color-mood-calm', moodColors.calm);
  root.style.setProperty('--color-mood-anxious', moodColors.anxious);
  root.style.setProperty('--color-mood-down', moodColors.down);
  root.style.setProperty('--color-mood-sad', moodColors.sad);

  // Update light backgrounds
  const lighten = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const fn = (v: number) => Math.min(255, v + Math.round((255 - v) * 0.7));
    return `#${fn(r).toString(16).padStart(2,'0')}${fn(g).toString(16).padStart(2,'0')}${fn(b).toString(16).padStart(2,'0')}`;
  };

  root.style.setProperty('--color-mood-happy-light', lighten(moodColors.happy));
  root.style.setProperty('--color-mood-calm-light', lighten(moodColors.calm));
  root.style.setProperty('--color-mood-anxious-light', lighten(moodColors.anxious));
  root.style.setProperty('--color-mood-down-light', lighten(moodColors.down));
  root.style.setProperty('--color-mood-sad-light', lighten(moodColors.sad));
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('datapoetry_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const s = data.data as AppSettings;
          setSettings(s);
          localStorage.setItem('datapoetry_settings', JSON.stringify(s));
        }
      })
      .catch(() => {});
  }, []);

  // Apply theme whenever settings change
  useEffect(() => {
    if (loaded) {
      applyThemeToDOM(settings);
      localStorage.setItem('datapoetry_settings', JSON.stringify(settings));
    }
  }, [settings, loaded]);

  const saveSettings = useCallback(async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch { /* ignore */ }
  }, [settings]);

  const setTheme = useCallback((theme: ThemeName) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setCustomColor = useCallback((color: string) => {
    setSettings(prev => ({ ...prev, theme: 'custom', customPrimaryColor: color }));
  }, []);

  const setMoodColorsFollowTheme = useCallback((follow: boolean) => {
    setSettings(prev => ({ ...prev, moodColorsFollowTheme: follow }));
  }, []);

  const setMoodColor = useCallback((mood: keyof MoodColors, color: string) => {
    setSettings(prev => ({
      ...prev,
      moodColors: { ...prev.moodColors, [mood]: color },
      moodColorsFollowTheme: false,
    }));
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, setTheme, setCustomColor, setMoodColorsFollowTheme, setMoodColor, saveSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}
