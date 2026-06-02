'use client';
import React from 'react';
import { clsx } from 'clsx';
import { MoodType } from '@/types/diary';
import { MOOD_LIST, getMoodEmoji, getMoodLabel } from '@/lib/utils/mood';

interface MoodSelectorProps {
  value: MoodType | null;
  onChange: (mood: MoodType) => void;
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MOOD_LIST.map(mood => (
        <button
          key={mood}
          type="button"
          onClick={() => onChange(mood)}
          className={clsx(
            'flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-150',
            value === mood
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] scale-105'
              : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'
          )}
        >
          <span className="text-lg">{getMoodEmoji(mood)}</span>
          <span>{getMoodLabel(mood)}</span>
        </button>
      ))}
    </div>
  );
}
