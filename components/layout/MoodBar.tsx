'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, PenLine, Smile } from 'lucide-react';

interface MoodBarProps {
  streak?: number;
  monthlyEntries?: number;
  lastEntry?: {
    content: string;
    time: string;
  } | null;
}

export default function MoodBar({
  streak = 0,
  monthlyEntries = 0,
  lastEntry = null,
}: MoodBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg)] border-t border-[var(--color-border-light)] sm:bottom-0 bottom-[56px]">
      <div className="h-[56px] sm:h-[72px] max-w-5xl mx-auto px-4 sm:px-8 flex items-center gap-4">
        {/* Left: Last entry preview */}
        <div className="flex-1 min-w-0 hidden sm:flex items-center gap-3">
          {lastEntry ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />
              <p className="text-[13px] text-[var(--color-text-secondary)] truncate max-w-[320px]">
                {lastEntry.content}
              </p>
              <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">
                {lastEntry.time}
              </span>
            </>
          ) : (
            <p className="text-[13px] text-[var(--color-text-muted)]">
              今天还没记录心情哦～
            </p>
          )}
        </div>

        {/* Center: Stats */}
        <div className="flex items-center gap-5 sm:gap-6 text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <Flame size={16} className="text-orange-500" strokeWidth={2} />
            <span className="text-[13px] font-medium">{streak}天</span>
          </div>
          <div className="w-px h-4 bg-[var(--color-border-light)] hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5">
            <Smile size={16} className="text-[var(--color-text-muted)]" strokeWidth={2} />
            <span className="text-[13px] font-medium">{monthlyEntries}篇</span>
          </div>
        </div>

        {/* Right: Quick action */}
        <div className="shrink-0">
          <Link
            href="/diary?new=true"
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-[var(--color-primary)] text-white text-[13px] sm:text-[14px] font-medium rounded-[28px] no-underline hover:brightness-110 active:brightness-90 transition-all duration-150 shadow-sm"
          >
            <PenLine size={15} strokeWidth={2.5} className="sm:hidden" />
            <span className="hidden sm:inline">写日记</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
