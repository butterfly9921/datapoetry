'use client';
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/ThemeProvider';
import ThemeSelector from '@/components/settings/ThemeSelector';
import ColorPicker from '@/components/settings/ColorPicker';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';
import { MOOD_LIST, getMoodEmoji, getMoodLabel } from '@/lib/utils/mood';
import { MoodType } from '@/types/diary';
import { MoodColors, ThemeName } from '@/types/settings';

export default function SettingsPage() {
  const { settings, setTheme, setCustomColor, setMoodColorsFollowTheme, setMoodColor, saveSettings } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await saveSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">🎨 主题设置</h1>

      {/* Preset themes */}
      <section>
        <h2 className="text-sm font-medium text-[var(--color-text)] mb-3">预设主题</h2>
        <ThemeSelector
          current={settings.theme}
          onChange={(theme: ThemeName) => setTheme(theme)}
        />
      </section>

      {/* Custom color */}
      <section className="border-t border-[var(--color-border)] pt-6">
        <h2 className="text-sm font-medium text-[var(--color-text)] mb-3">自定义主色</h2>
        <ColorPicker
          color={settings.customPrimaryColor || settings.moodColors.happy}
          onChange={setCustomColor}
          label="选择主色调"
        />
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          选择一个颜色后，会自动生成配套的浅色、深色和强调色
        </p>
      </section>

      {/* Mood colors */}
      <section className="border-t border-[var(--color-border)] pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-[var(--color-text)]">心情颜色</h2>
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={settings.moodColorsFollowTheme}
              onChange={e => setMoodColorsFollowTheme(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
            />
            跟随主题
          </label>
        </div>
        {!settings.moodColorsFollowTheme && (
          <div className="grid grid-cols-1 gap-3">
            {MOOD_LIST.map(mood => (
              <div key={mood} className="flex items-center gap-3">
                <span className="w-20 text-sm font-medium text-[var(--color-text)]">
                  {getMoodEmoji(mood)} {getMoodLabel(mood)}
                </span>
                <ColorPicker
                  color={settings.moodColors[mood as keyof MoodColors]}
                  onChange={color => setMoodColor(mood as keyof MoodColors, color)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="primary" size="md" onClick={handleSave}>
          保存设置
        </Button>
        {saved && (
          <span className="text-sm text-green-500 animate-fade-in">已保存 ✓</span>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
