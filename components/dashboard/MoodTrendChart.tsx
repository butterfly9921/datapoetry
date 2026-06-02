'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { MoodTrendPoint } from '@/types/dashboard';
import { getMoodEmoji, getMoodLabel } from '@/lib/utils/mood';

const Y_LABELS = [
  { value: 1, label: '😢 沮丧' },
  { value: 2, label: '😔 低落' },
  { value: 3, label: '😰 焦虑' },
  { value: 4, label: '😌 平静' },
  { value: 5, label: '😊 开心' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-md p-3 text-sm">
        <p className="font-medium text-[var(--color-text)]">{data.date}</p>
        {data.value ? (
          <>
            <p className="text-[var(--color-text-secondary)]">
              {getMoodEmoji(data.mood)} {getMoodLabel(data.mood)} ({data.value}分)
            </p>
            {data.summary && <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[200px] truncate">{data.summary}</p>}
          </>
        ) : (
          <p className="text-[var(--color-text-muted)]">无记录</p>
        )}
      </div>
    );
  }
  return null;
};

export default function MoodTrendChart() {
  const [data, setData] = useState<MoodTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/mood-trend?days=30')
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
        <h3 className="text-[14px] font-semibold text-[var(--color-text)] mb-4 tracking-tight">心情趋势</h3>
        <div className="h-48 skeleton rounded-xl" />
      </div>
    );
  }

  // Filter out null values for the line, keep dates
  const chartData = data.map(d => ({
    ...d,
    displayValue: d.value || undefined,
  }));

  return (
    <div className="card-base">
      <h3 className="text-[14px] font-semibold text-[var(--color-text)] mb-4 tracking-tight">心情趋势</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickFormatter={(val: string) => val.slice(5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 6]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickFormatter={(val: number) => {
              const label = Y_LABELS.find(l => l.value === val);
              return label ? label.label.slice(0, 2) : '';
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="displayValue"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#moodGradient)"
            connectNulls={false}
            dot={{ r: 2, fill: 'var(--color-primary)' }}
            activeDot={{ r: 4, fill: 'var(--color-primary)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
