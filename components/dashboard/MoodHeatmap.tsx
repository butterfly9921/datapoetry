'use client';
import React, { useState, useEffect } from 'react';
import { getMoodColor, getMoodLabel } from '@/lib/utils/mood';
import { HeatmapDay } from '@/types/dashboard';

interface MoodHeatmapProps {
  onDayClick?: (date: string) => void;
}

function getISOWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return String(d.getUTCFullYear()) + '-' + String(Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7));
}

export default function MoodHeatmap({ onDayClick }: MoodHeatmapProps) {
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/heatmap?months=3')
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data.days);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-base">
        <h3 className="text-[14px] font-semibold text-[var(--color-text)] mb-4 tracking-tight">心情热力图</h3>
        <div className="h-24 skeleton rounded-xl" />
      </div>
    );
  }

  // Group by week
  const weeks: Record<string, HeatmapDay[]> = {};
  for (const day of data) {
    const week = getISOWeek(day.date);
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(day);
  }

  const weekKeys = Object.keys(weeks).sort();

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="card-base">
      <h3 className="text-[14px] font-semibold text-[var(--color-text)] mb-4 tracking-tight">心情热力图</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-fit">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {dayLabels.map((l, i) => (
              <div key={i} className="w-5 h-3 flex items-center text-[10px] text-[var(--color-text-muted)]">
                {i % 2 === 0 ? l : ''}
              </div>
            ))}
          </div>
          {/* Weeks */}
          {weekKeys.map(week => {
            const weekDays = weeks[week];
            // Fill to 7 days
            const padded = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(weekDays[0]?.date || '');
              d.setDate(d.getDate() - d.getDay() + i + 1);
              const dateStr = d.toISOString().slice(0, 10);
              return weekDays.find(w => w.date === dateStr) || { date: dateStr, mood: null, value: null };
            });
            return (
              <div key={week} className="flex flex-col gap-[3px]">
                {padded.map((day, i) => (
                  <div
                    key={i}
                    className="w-[12px] h-[12px] rounded-[4px] cursor-pointer transition-transform hover:scale-125"
                    style={{ backgroundColor: day.mood ? getMoodColor(day.mood) : '#EBEDF0' }}
                    title={`${day.date} · ${day.mood ? getMoodLabel(day.mood) : '无记录'}`}
                    onClick={() => day.mood && onDayClick?.(day.date)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-[var(--color-text-muted)]">
        <span>图例：</span>
        {(['happy', 'calm', 'anxious', 'down', 'sad'] as const).map(mood => (
          <span key={mood} className="flex items-center gap-1">
            <span className="w-[12px] h-[12px] rounded-[4px]" style={{ backgroundColor: getMoodColor(mood) }} />
            {getMoodLabel(mood)}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="w-[12px] h-[12px] rounded-[4px]" style={{ backgroundColor: '#EBEDF0' }} /> 无
        </span>
      </div>
    </div>
  );
}
