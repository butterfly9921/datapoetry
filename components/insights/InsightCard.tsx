'use client';
import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, X } from 'lucide-react';
import { Insight } from '@/types/insight';

interface InsightCardProps {
  insights: Insight[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onDismiss: (insight: Insight) => void;
  onViewRelated: () => void;
}

export default function InsightCard({
  insights,
  currentIndex,
  onIndexChange,
  onDismiss,
  onViewRelated,
}: InsightCardProps) {
  if (insights.length === 0) return null;

  const insight = insights[currentIndex % insights.length];

  const goPrev = () => {
    const prev = currentIndex - 1;
    onIndexChange(prev < 0 ? insights.length - 1 : prev);
  };

  const goNext = () => {
    onIndexChange((currentIndex + 1) % insights.length);
  };

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--color-primary-light)] bg-gradient-to-r from-[var(--color-primary-lighter)] via-white to-white p-5 shadow-[var(--shadow-hero)] hover:shadow-[var(--shadow-hero-hover)] transition-shadow duration-300">
      {/* Background decoration */}
      <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full opacity-8"
        style={{ background: 'var(--color-primary)' }} />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}>
              <Sparkles size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold text-[var(--color-primary-dark)] uppercase tracking-widest">每日洞察</span>
            {insights.length > 1 && (
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {currentIndex + 1} / {insights.length}
              </span>
            )}
          </div>
          <button
            onClick={() => onDismiss(insight)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-black/5 transition-colors"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>

        <p className="text-[13.5px] text-[var(--color-text)] leading-relaxed mb-3 font-medium">
          {insight.message}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewRelated}
            className="flex items-center gap-1 text-[12px] text-[var(--color-primary-dark)] font-medium hover:underline"
          >
            查看相关日记 <ArrowRight size={12} />
          </button>

          {insights.length > 1 && (
            <div className="flex items-center gap-0.5 ml-auto">
              <button
                onClick={goPrev}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/8 transition-colors"
              >
                <ChevronLeft size={15} className="text-[var(--color-primary-dark)]" />
              </button>
              <button
                onClick={goNext}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/8 transition-colors"
              >
                <ChevronRight size={15} className="text-[var(--color-primary-dark)]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
