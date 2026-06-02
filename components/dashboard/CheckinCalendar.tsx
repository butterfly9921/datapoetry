'use client';
import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { ActivityType } from '@/types/diary';
import { CheckinCalendarData } from '@/types/dashboard';
import { Flame } from 'lucide-react';

const ACTIVITY_TABS = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'cycling', label: '骑行', emoji: '🚴' },
  { key: 'running', label: '跑步', emoji: '🏃' },
  { key: 'dancing', label: '跳舞', emoji: '💃' },
  { key: 'custom', label: '自定义', emoji: '✨' },
];

export default function CheckinCalendar() {
  const [data, setData] = useState<CheckinCalendarData | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = (activity: string) => {
    setLoading(true);
    const month = new Date().toISOString().slice(0, 7);
    fetch(`/api/dashboard/checkin-calendar?activity=${activity}&month=${month}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  // Calculate week rows
  const getWeeks = () => {
    if (!data?.days.length) return [];
    const weeks: typeof data.days[] = [];
    let currentWeek: typeof data.days = [];

    // Prepend empty cells so first day aligns with correct weekday
    const firstDate = new Date(data.days[0].date + 'T12:00:00Z');
    const firstDayOfWeek = firstDate.getUTCDay() || 7;
    for (let i = 1; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', checked: false });
    }

    for (const day of data.days) {
      currentWeek.push(day);
      const d = new Date(day.date + 'T12:00:00Z');
      if (d.getUTCDay() === 0 || day === data.days[data.days.length - 1]) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  };

  const weeks = getWeeks();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="card-base">
      <h3 className="text-[14px] font-semibold text-[var(--color-text)] mb-4 tracking-tight">打卡日历</h3>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-3">
        {ACTIVITY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150',
              activeTab === tab.key
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-24 skeleton rounded-xl" />
      ) : data ? (
        <>
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayLabels.map(l => (
              <div key={l} className="text-center text-[10px] text-[var(--color-text-muted)]">{l}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="flex flex-col gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={clsx(
                      'aspect-square rounded-full flex items-center justify-center text-xs transition-all',
                      !day.date ? 'invisible' :
                      day.date === today ? 'ring-2 ring-[var(--color-primary)]' : '',
                      day.checked
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
                    )}
                    title={day.date}
                  >
                    {day.date ? new Date(day.date + 'T12:00:00Z').getUTCDate() : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Streak */}
          {data.streak > 0 && (
            <div className="flex items-center gap-1.5 mt-3 text-sm">
              <Flame size={16} className="text-orange-500" />
              <span className="text-[var(--color-text)] font-medium">连续打卡 {data.streak} 天</span>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
