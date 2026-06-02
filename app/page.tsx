'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DailyNewsCard from '@/components/dashboard/DailyNewsCard';
import PageTransition from '@/components/ui/PageTransition';
import { StreakData } from '@/types/diary';

export default function DashboardPage() {
  const router = useRouter();
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/streak')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setStreak(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? '早安' : h < 18 ? '午安' : '晚安';
  })();

  return (
    <PageTransition>
      <div className="flex flex-col gap-5">
        {/* Greeting */}
        <div className="mb-1">
          <h1 className="text-[22px] font-bold text-[var(--color-text)] tracking-tight">
            {greeting}，Felicia
          </h1>
        </div>

        {/* 日记入口 — 用户主动触发 */}
        <button
          onClick={() => router.push('/diary')}
          className="text-left w-full bg-[var(--color-bg)] border border-dashed border-[var(--color-border-strong)] rounded-2xl p-5 cursor-pointer group hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]/30 transition-all duration-200 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✍️</span>
            <span className="text-[15px] text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">
              今天有什么想写的？
            </span>
          </div>
        </button>

        {/* 看世界 — 每日新闻 */}
        <DailyNewsCard />

        {/* 消费点卡片组 */}
        {streak && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 连续记录 */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  连续记录
                </span>
                <span className="text-lg">🔥</span>
              </div>
              <p className="text-[28px] font-bold text-[var(--color-text)] leading-none">
                {streak.currentStreak}
                <span className="text-[14px] font-normal text-[var(--color-text-muted)] ml-1">天</span>
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                最长连续 {streak.longestStreak} 天
              </p>
            </div>

            {/* 本周统计 */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  本周记录
                </span>
                <span className="text-lg">📝</span>
              </div>
              <p className="text-[28px] font-bold text-[var(--color-text)] leading-none">
                {streak.thisWeekCount}
                <span className="text-[14px] font-normal text-[var(--color-text-muted)] ml-1">篇</span>
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                共有 {streak.totalCount} 篇日记
              </p>
            </div>

            {/* 思想轨迹入口 */}
            <button
              onClick={() => router.push('/trajectory')}
              className="text-left bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-primary-light)] transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  思想轨迹
                </span>
                <span className="text-lg group-hover:translate-x-0.5 transition-transform">🧭</span>
              </div>
              <p className="text-[13px] text-[var(--color-text)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                查看本周思想轨迹
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
                {streak.topTags.length > 0
                  ? `关键词：${streak.topTags.slice(0, 3).map(t => `#${t.name}`).join(' ')}`
                  : '写日记并关联新闻，开始追踪思想轨迹'}
              </p>
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
