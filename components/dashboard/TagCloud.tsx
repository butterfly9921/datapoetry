'use client';
import React, { useState, useEffect } from 'react';
import { TagCloudItem } from '@/types/dashboard';

const TAG_COLORS = [
  'var(--color-mood-happy)',
  'var(--color-mood-calm)',
  'var(--color-mood-anxious)',
  'var(--color-mood-down)',
  'var(--color-mood-sad)',
  'var(--color-primary)',
  'var(--color-accent)',
];

interface TagCloudProps {
  onTagClick?: (tag: string) => void;
}

export default function TagCloud({ onTagClick }: TagCloudProps) {
  const [tags, setTags] = useState<TagCloudItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/tag-cloud?limit=10')
      .then(r => r.json())
      .then(d => {
        if (d.success) setTags(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-base">
        <h3 className="text-[14px] font-semibold text-[var(--color-text)] mb-4 tracking-tight">标签词云</h3>
        <div className="h-20 skeleton rounded-xl" />
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="card-base">
        <h3 className="text-[14px] font-semibold text-[var(--color-text)] mb-4 tracking-tight">标签词云</h3>
        <p className="text-sm text-[var(--color-text-muted)] text-center py-4">还没有标签数据</p>
      </div>
    );
  }

  const maxCount = Math.max(...tags.map(t => t.count));
  const minCount = Math.min(...tags.map(t => t.count));

  const getSize = (count: number) => {
    if (maxCount === minCount) return 20;
    return 14 + ((count - minCount) / (maxCount - minCount)) * 18;
  };

  return (
    <div className="card-base">
      <h3 className="text-[14px] font-semibold text-[var(--color-text)] mb-4 tracking-tight">标签词云</h3>
      <div className="flex flex-wrap gap-2 justify-center items-center min-h-[60px] py-2">
        {tags.map((tag, i) => (
          <button
            key={tag.name}
            onClick={() => onTagClick?.(tag.name)}
            className="px-3 py-1 rounded-full font-medium hover:opacity-80 transition-all hover:scale-110 cursor-pointer"
            style={{
              fontSize: `${getSize(tag.count)}px`,
              backgroundColor: TAG_COLORS[i % TAG_COLORS.length] + '20',
              color: TAG_COLORS[i % TAG_COLORS.length],
              border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}40`,
            }}
            title={`${tag.name} (${tag.count}次)`}
          >
            #{tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
