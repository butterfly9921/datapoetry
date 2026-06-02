'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import DiaryForm from '@/components/diary/DiaryForm';
import { DiaryEntry } from '@/types/diary';

export default function DiaryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [diary, setDiary] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/diaries/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setDiary(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/dashboard/tag-cloud?limit=50')
      .then(r => r.json())
      .then(data => {
        if (data.success) setExistingTags(data.data.map((t: any) => t.name));
      })
      .catch(() => {});
  }, [params.id]);

  const handleUpdate = async (formData: any) => {
    const res = await fetch(`/api/diaries/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success) {
      router.push('/diary');
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="h-64 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-[var(--color-text-muted)]">日记不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> 返回
      </button>
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-6">编辑日记</h1>
      <DiaryForm
        initialData={diary}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
        existingTags={existingTags}
      />
    </div>
  );
}
