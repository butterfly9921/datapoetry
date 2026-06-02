'use client';
import React from 'react';
import { clsx } from 'clsx';
import { ThemeName } from '@/types/settings';
import { THEMES, ThemeDefinition } from '@/lib/constants/themes';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  current: ThemeName;
  onChange: (theme: ThemeName) => void;
}

export default function ThemeSelector({ current, onChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(Object.values(THEMES) as ThemeDefinition[]).map(theme => (
        <button
          key={theme.name}
          onClick={() => onChange(theme.name as ThemeName)}
          className={clsx(
            'relative flex flex-col rounded-xl border-2 p-3 transition-all duration-150 text-left',
            current === theme.name
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-[var(--color-border)] bg-white hover:border-[var(--color-text-muted)]'
          )}
        >
          {current === theme.name && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: theme.primary }}
            />
            <span className="text-sm font-medium text-[var(--color-text)]">{theme.label}</span>
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }} />
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primaryLight }} />
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.text }} />
          </div>
        </button>
      ))}
    </div>
  );
}
