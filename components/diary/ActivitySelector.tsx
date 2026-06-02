'use client';
import React from 'react';
import { clsx } from 'clsx';
import { ActivityType } from '@/types/diary';
import Input from '@/components/ui/Input';

const ACTIVITIES: { type: ActivityType; emoji: string; label: string }[] = [
  { type: 'cycling', emoji: '🚴', label: '骑行' },
  { type: 'running', emoji: '🏃', label: '跑步' },
  { type: 'dancing', emoji: '💃', label: '跳舞' },
  { type: 'custom', emoji: '✨', label: '自定义' },
];

interface ActivitySelectorProps {
  value: ActivityType;
  customName: string;
  onChange: (type: ActivityType) => void;
  onCustomNameChange: (name: string) => void;
}

export default function ActivitySelector({ value, customName, onChange, onCustomNameChange }: ActivitySelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {ACTIVITIES.map(act => (
          <button
            key={act.type}
            type="button"
            onClick={() => onChange(act.type)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-150',
              value === act.type
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] scale-105'
                : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
            )}
          >
            <span className="text-lg">{act.emoji}</span>
            <span>{act.label}</span>
          </button>
        ))}
      </div>
      {value === 'custom' && (
        <Input
          placeholder="输入活动名称，如：游泳"
          value={customName}
          onChange={e => onCustomNameChange(e.target.value)}
        />
      )}
    </div>
  );
}
