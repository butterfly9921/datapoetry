'use client';
import React from 'react';
import { clsx } from 'clsx';
import { DiaryEntry } from '@/types/diary';
import DiaryCard from './DiaryCard';

const FILTER_OPTIONS: { key: string; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '✦' },
  { key: 'text', label: '日记', emoji: '📝' },
  { key: 'mood', label: '心情', emoji: '😊' },
  { key: 'checkin', label: '打卡', emoji: '✅' },
];

interface DiaryListProps {
  diaries: DiaryEntry[];
  loading?: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onEdit: (diary: DiaryEntry) => void;
  onDelete: (diary: DiaryEntry) => void;
  onTagClick: (tag: string) => void;
}

export default function DiaryList({
  diaries,
  loading,
  activeFilter,
  onFilterChange,
  onEdit,
  onDelete,
  onTagClick,
}: DiaryListProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => onFilterChange(opt.key)}
            className={clsx(
              'flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150',
              activeFilter === opt.key
                ? 'bg-[var(--color-primary)] text-white shadow-sm scale-[1.02]'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            )}
          >
            <span className="text-xs">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
        {diaries.length > 0 && !loading && (
          <span className="ml-auto text-[11px] text-[var(--color-text-muted)]">
            共 {diaries.length} 条
          </span>
        )}
      </div>

      {/* Diary cards */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl skeleton" />
          ))}
        </div>
      ) : diaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
          <span className="text-5xl mb-4 opacity-50">✨</span>
          <p className="text-[14px] font-medium mb-1">还没有记录</p>
          <p className="text-[12px] opacity-60">写下今天的第一条日记吧</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {diaries.map(diary => (
            <DiaryCard
              key={diary.id}
              diary={diary}
              onEdit={onEdit}
              onDelete={onDelete}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
