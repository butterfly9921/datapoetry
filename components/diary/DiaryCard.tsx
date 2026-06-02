'use client';
import React, { useState } from 'react';
import { clsx } from 'clsx';
import { MoreHorizontal, Edit3, Trash2, Calendar } from 'lucide-react';
import { DiaryEntry } from '@/types/diary';
import { getMoodEmoji, getMoodLabel, getMoodColor, getMoodLightColor } from '@/lib/utils/mood';
import { formatDate } from '@/lib/utils/date';

interface DiaryCardProps {
  diary: DiaryEntry;
  onEdit?: (diary: DiaryEntry) => void;
  onDelete?: (diary: DiaryEntry) => void;
  onTagClick?: (tag: string) => void;
}

const ACTIVITY_EMOJI: Record<string, string> = {
  cycling: '🚴',
  running: '🏃',
  dancing: '💃',
  custom: '✨',
};

const ACTIVITY_LABEL: Record<string, string> = {
  cycling: '骑行',
  running: '跑步',
  dancing: '跳舞',
};

export default function DiaryCard({ diary, onEdit, onDelete, onTagClick }: DiaryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Card accent color by type
  const accentStyle = (() => {
    switch (diary.type) {
      case 'mood':
        return {
          accent: diary.mood ? getMoodColor(diary.mood) : 'var(--color-border-strong)',
        };
      case 'checkin':
        return { accent: '#F59E0B' };
      default:
        return { accent: 'var(--color-border-strong)' };
    }
  })();

  const dateStr = formatDate(diary.created_at, 'MM-dd HH:mm');
  const typeEmoji = diary.type === 'mood' ? '💭' : diary.type === 'checkin' ? '✅' : '📝';
  const typeLabel = diary.type === 'mood' ? '心情' : diary.type === 'checkin' ? '打卡' : '日记';

  return (
    <article
      className="relative rounded-[16px] overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-[16px]"
        style={{ background: accentStyle.accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between pl-5 pr-3 pt-3 pb-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{
              background: `${accentStyle.accent}18`,
              color: accentStyle.accent === 'var(--color-border-strong)' ? 'var(--color-text-muted)' : accentStyle.accent,
            }}
          >
            {typeEmoji} {typeLabel}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
            <Calendar size={10} />
            {dateStr}
          </span>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/6 transition-colors"
          >
            <MoreHorizontal size={15} className="text-[var(--color-text-muted)]" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-32 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-lg)] py-1 overflow-hidden"
                style={{ animation: 'scaleIn 120ms var(--ease-spring)' }}>
                <button
                  onClick={() => { onEdit?.(diary); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <Edit3 size={13} strokeWidth={2} /> 编辑
                </button>
                <div className="my-0.5 mx-2 h-px bg-[var(--color-border-light)]" />
                <button
                  onClick={() => { onDelete?.(diary); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} strokeWidth={2} /> 删除
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pl-5 pr-4 pt-2 pb-3.5">
        {/* Mood highlight */}
        {diary.type === 'mood' && diary.mood && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[22px] leading-none">{getMoodEmoji(diary.mood)}</span>
            <span className="text-[15px] font-semibold" style={{ color: getMoodColor(diary.mood) }}>
              {getMoodLabel(diary.mood)}
            </span>
          </div>
        )}

        {/* Checkin activity */}
        {diary.type === 'checkin' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[20px] leading-none">
              {diary.activity_type ? ACTIVITY_EMOJI[diary.activity_type] || '✨' : '✨'}
            </span>
            <span className="text-[14px] font-semibold text-[var(--color-text)]">
              {diary.activity_type === 'custom'
                ? diary.activity_name || '自定义活动'
                : ACTIVITY_LABEL[diary.activity_type || ''] || '打卡'}
            </span>
          </div>
        )}

        {/* Photos */}
        {diary.photos && diary.photos.length > 0 && (
          <div className={clsx(
            'grid gap-1.5 mb-2.5',
            diary.photos.length === 1 ? 'grid-cols-1' : diary.photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          )}>
            {diary.photos.slice(0, 3).map((photo, idx) => (
              <div
                key={photo.id || idx}
                className={clsx(
                  'rounded-[12px] overflow-hidden bg-[var(--color-bg-secondary)]',
                  diary.photos!.length === 1 ? 'aspect-video' : 'aspect-square'
                )}
              >
                <img
                  src={photo.url || `/uploads/${photo.filename}`}
                  alt={photo.original_name || ''}
                  className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                  onClick={e => {
                    e.stopPropagation();
                    window.open(photo.url || `/uploads/${photo.filename}`, '_blank');
                  }}
                />
              </div>
            ))}
            {diary.photos.length > 3 && (
              <div className="aspect-square rounded-[12px] bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[13px] font-medium text-[var(--color-text-muted)]">
                +{diary.photos.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        <p className="text-[13.5px] text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
          {diary.content}
        </p>

        {/* References */}
        {diary.references && diary.references.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {diary.references.map(ref => (
              <div
                key={ref.id}
                className="flex items-start gap-1.5 p-2 bg-[var(--color-bg-secondary)] rounded-lg text-[11px]"
              >
                <span className="flex-shrink-0 mt-[1px]">
                  {ref.source_type === 'news' ? '📰' : ref.source_type === 'book' ? '📚' : '🎬'}
                </span>
                <span className="text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                  {ref.source_content}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {diary.tags && diary.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {diary.tags.map(tag => (
              <button
                key={tag}
                onClick={e => { e.stopPropagation(); onTagClick?.(tag); }}
                className="px-2 py-0.5 bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] rounded-lg text-[11px] font-medium hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)] transition-all duration-120 cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
