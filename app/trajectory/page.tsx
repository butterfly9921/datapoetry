'use client';
import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Hash, Newspaper, BookOpen, Film, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import PageTransition from '@/components/ui/PageTransition';
import Button from '@/components/ui/Button';
import { StreakData, DiaryEntry } from '@/types/diary';
import { formatDate } from '@/lib/utils/date';

export default function TrajectoryPage() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [recentDiaries, setRecentDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [streakRes, diaryRes] = await Promise.all([
        fetch('/api/dashboard/streak'),
        fetch('/api/diaries?pageSize=30'),
      ]);
      const [streakJson, diaryJson] = await Promise.all([
        streakRes.json(),
        diaryRes.json(),
      ]);
      if (streakJson.success) setStreak(streakJson.data);
      if (diaryJson.success) setRecentDiaries(diaryJson.data.items || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateRetrospective = async () => {
    setGenerating(true);
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const startDate = weekStart.toISOString().slice(0, 10);
      const endDate = now.toISOString().slice(0, 10);

      await fetch('/api/retrospectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: 'weekly', start_date: startDate, end_date: endDate }),
      });
      // Refetch to show new data
      fetchData();
    } catch {}
    setGenerating(false);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <div className="h-6 skeleton rounded-md w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
          </div>
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </PageTransition>
    );
  }

  // Diaries with references
  const diariesWithRefs = recentDiaries.filter(d => d.references && d.references.length > 0);

  // Source distribution
  const sourceDist: Record<string, number> = {};
  diariesWithRefs.forEach(d => {
    d.references?.forEach(ref => {
      sourceDist[ref.source_type] = (sourceDist[ref.source_type] || 0) + 1;
    });
  });

  const sourceIcons: Record<string, { icon: React.ReactNode; label: string }> = {
    news: { icon: <Newspaper size={15} />, label: '新闻' },
    book: { icon: <BookOpen size={15} />, label: '书籍' },
    movie: { icon: <Film size={15} />, label: '电影' },
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-text)] tracking-tight flex items-center gap-2">
            <span className="text-[24px]">🧭</span>
            思想轨迹
          </h1>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
            看见你在想什么、关注什么——以及它们之间的连接
          </p>
        </div>

        {/* Stats Cards */}
        {streak && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={14} className="text-orange-500" />
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">连续记录</span>
              </div>
              <p className="text-[26px] font-bold text-[var(--color-text)]">{streak.currentStreak}<span className="text-[13px] font-normal text-[var(--color-text-muted)] ml-1">天</span></p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-[var(--color-primary)]" />
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">本周日记</span>
              </div>
              <p className="text-[26px] font-bold text-[var(--color-text)]">{streak.thisWeekCount}<span className="text-[13px] font-normal text-[var(--color-text-muted)] ml-1">篇</span></p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={14} className="text-purple-500" />
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">关联思考</span>
              </div>
              <p className="text-[26px] font-bold text-[var(--color-text)]">{diariesWithRefs.length}<span className="text-[13px] font-normal text-[var(--color-text-muted)] ml-1">篇</span></p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">累计日记</span>
              </div>
              <p className="text-[26px] font-bold text-[var(--color-text)]">{streak.totalCount}<span className="text-[13px] font-normal text-[var(--color-text-muted)] ml-1">篇</span></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Sources & Tags */}
          <div className="lg:col-span-1 space-y-5">
            {/* Source Distribution */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
              <h3 className="text-[13px] font-semibold text-[var(--color-text)] mb-3">灵感来源</h3>
              {Object.keys(sourceDist).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(sourceDist).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-text-muted)]">
                          {sourceIcons[type]?.icon || '📌'}
                        </span>
                        <span className="text-[13px] text-[var(--color-text-secondary)]">
                          {sourceIcons[type]?.label || type}
                        </span>
                      </div>
                      <span className="text-[14px] font-semibold text-[var(--color-text)]">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed">
                  在新闻卡片中点击「💭 思考」按钮，写日记时关联外部内容，你的灵感会出现在这里。
                </p>
              )}
            </div>

            {/* Top Tags */}
            {streak && streak.topTags.length > 0 && (
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
                <h3 className="text-[13px] font-semibold text-[var(--color-text)] mb-3">本周关键词</h3>
                <div className="flex flex-wrap gap-1.5">
                  {streak.topTags.map(tag => (
                    <span
                      key={tag.name}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)] rounded-lg text-[12px] font-medium"
                    >
                      #{tag.name}
                      <span className="text-[10px] opacity-60">{tag.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Recent connected diaries + Retrospective */}
          <div className="lg:col-span-2 space-y-5">
            {/* Generate Retrospective */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-semibold text-[var(--color-text)]">生成本周回顾</h3>
                  <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                    基于你本周的日记和引用，自动总结思想轨迹
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateRetrospective}
                  disabled={generating || (streak?.thisWeekCount || 0) === 0}
                >
                  {generating ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                  <span className="ml-1.5">{generating ? '生成中...' : '生成回顾'}</span>
                </Button>
              </div>
            </div>

            {/* Recent Diaries with References */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border-light)]">
                <h3 className="text-[13px] font-semibold text-[var(--color-text)]">
                  {diariesWithRefs.length > 0 ? '最近的关联思考' : '你的思想轨迹'}
                </h3>
              </div>

              {diariesWithRefs.length > 0 ? (
                <div className="divide-y divide-[var(--color-border-light)]">
                  {diariesWithRefs.slice(0, 15).map(diary => (
                    <div key={diary.id} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {formatDate(diary.created_at, 'MM-dd HH:mm')}
                        </span>
                        {diary.tags?.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded-md text-[var(--color-text-muted)]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-[13px] text-[var(--color-text)] leading-relaxed line-clamp-3 mb-2">
                        {diary.content}
                      </p>
                      {diary.references?.map(ref => (
                        <div
                          key={ref.id}
                          className="flex items-start gap-1.5 mt-1 ml-1 pl-2 border-l-2 border-[var(--color-primary-lighter)]"
                        >
                          <span className="text-[11px] flex-shrink-0 mt-[1px]">
                            {ref.source_type === 'news' ? '📰' : ref.source_type === 'book' ? '📚' : '🎬'}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                            {ref.source_content}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <span className="text-3xl">🌱</span>
                  <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
                    还没有关联思考的记录
                  </p>
                  <p className="text-[12px] text-[var(--color-text-muted)] mt-1">
                    在首页新闻卡片中点击「💭 思考」，写下你被触动的想法
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
