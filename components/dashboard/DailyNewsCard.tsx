'use client';
import React, { useState, useEffect } from 'react';
import QuickDiaryModal from '@/components/diary/QuickDiaryModal';

interface NewsItem {
  text: string;
  sourceUrl: string;
}

interface TopicGroup {
  id: string;
  name: string;
  news: NewsItem[];
}

interface DailyNewsData {
  date: string;
  news: NewsItem[];
  cover: string;
  coverCopyright?: string;
  topics: TopicGroup[];
}

interface NewsApiResponse {
  success: boolean;
  data?: DailyNewsData;
  error?: string;
  message?: string;
}

type TabId = 'all' | 'yaowen' | 'wenyu';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'all', label: '全部', icon: '📰' },
  { id: 'yaowen', label: '要闻', icon: '🏛️' },
  { id: 'wenyu', label: '文娱', icon: '🎬' },
];

/** 根据当前 Tab 筛选要显示的新闻 */
function getDisplayedNews(data: DailyNewsData, tab: TabId): NewsItem[] {
  if (tab === 'all') return data.news;
  return data.topics.find((t) => t.id === tab)?.news || [];
}

export default function DailyNewsCard() {
  const [data, setData] = useState<DailyNewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [quickDiaryOpen, setQuickDiaryOpen] = useState(false);
  const [quickDiaryRef, setQuickDiaryRef] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/external/daily-news')
      .then((r) => r.json())
      .then((json: NewsApiResponse) => {
        if (cancelled) return;
        if (json.success && json.data) {
          setData(json.data);
          setError(null);
        } else {
          setError(json.message || '暂无法获取新闻');
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('网络请求失败');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-0 overflow-hidden shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-[180px] h-[120px] sm:h-auto skeleton rounded-none" />
          <div className="flex-1 p-4 space-y-3">
            <div className="h-4 skeleton rounded-md w-2/3" />
            <div className="h-3 skeleton rounded-md w-full" />
            <div className="h-3 skeleton rounded-md w-5/6" />
            <div className="h-3 skeleton rounded-md w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error || !data) {
    return (
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📰</span>
          <div>
            <p className="text-[13px] font-semibold text-[var(--color-text)]">60秒读世界</p>
            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
              {error || '暂无新闻数据'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Loaded ---- */
  const displayedNews = getDisplayedNews(data!, activeTab);
  const allCount = data!.news.length;

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-strong)] transition-all duration-200">
      <div className="flex flex-col sm:flex-row">
        {/* Cover image — Bing 每日壁纸 */}
        <div className="sm:w-[180px] sm:min-h-full h-[140px] flex-shrink-0 relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data!.cover}
            alt={data!.coverCopyright || 'Bing 每日壁纸'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* 渐变蒙版 — 让文字区衔接自然 */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/30 to-transparent" />
          {/* 图片版权 — 右下角半透明 */}
          {data!.coverCopyright && (
            <span className="absolute bottom-1.5 right-2 text-[9px] text-white/70 leading-tight max-w-[160px] truncate hidden sm:block">
              {data!.coverCopyright}
            </span>
          )}
        </div>

        {/* News list */}
        <div className="flex-1 p-4 sm:p-5 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg leading-none">📰</span>
            <h3 className="text-[13px] font-semibold text-[var(--color-text)]">60秒读世界</h3>
            <span className="text-[11px] text-[var(--color-text-muted)] ml-auto">
              {data!.date}
            </span>
          </div>

          {/* Tabs — 微博风格 */}
          <div className="flex items-center gap-1 mb-3 pb-2 border-b border-[var(--color-border)]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tab.id === 'all'
                ? allCount
                : data!.topics.find((t) => t.id === tab.id)?.news.length || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-3 py-1.5 text-[12px] rounded-md font-medium
                    transition-all duration-200 cursor-pointer select-none
                    ${isActive
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary-lighter)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                    }
                  `}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                  <span className={`ml-1 text-[10px] ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* News items */}
          {displayedNews.length > 0 ? (
            <ul className="space-y-1.5">
              {displayedNews.slice(0, 10).map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[13px] leading-[1.6] text-[var(--color-text-secondary)] group/item"
                >
                  <span className="flex-shrink-0 w-4 h-4 mt-[2px] rounded-full bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)] text-[10px] font-bold flex items-center justify-center leading-none">
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0 group-hover/item:text-[var(--color-text)] transition-colors duration-150">
                    {item.text}
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 opacity-0 group-hover/item:opacity-100 text-[10px] text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] bg-[var(--color-primary-lighter)]/50 hover:bg-[var(--color-primary-lighter)] px-1.5 py-0.5 rounded-md font-medium transition-all duration-150 cursor-pointer whitespace-nowrap no-underline"
                    title="搜索原文"
                  >
                    🔗 原文
                  </a>
                  <button
                    onClick={() => { setQuickDiaryRef(item.text); setQuickDiaryOpen(true); }}
                    className="flex-shrink-0 opacity-0 group-hover/item:opacity-100 text-[10px] text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] bg-[var(--color-primary-lighter)]/50 hover:bg-[var(--color-primary-lighter)] px-1.5 py-0.5 rounded-md font-medium transition-all duration-150 cursor-pointer whitespace-nowrap"
                    title="写下你的思考"
                  >
                    💭 思考
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-[var(--color-text-muted)] py-4 text-center">
              该分类暂无新闻
            </p>
          )}

          {displayedNews.length > 10 && (
            <p className="text-[11px] text-[var(--color-text-muted)] mt-2 pl-6">
              还有 {displayedNews.length - 10} 条新闻
            </p>
          )}
        </div>
      </div>

      {/* Quick Diary Modal */}
      <QuickDiaryModal
        open={quickDiaryOpen}
        onClose={() => { setQuickDiaryOpen(false); setQuickDiaryRef(''); }}
        newsContent={quickDiaryRef}
      />
    </div>
  );
}
