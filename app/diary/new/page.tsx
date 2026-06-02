'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import DiaryForm from '@/components/diary/DiaryForm';

export default function NewDiaryPage() {
  const router = useRouter();
  const [existingTags, setExistingTags] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/dashboard/tag-cloud?limit=50')
      .then(r => r.json())
      .then(data => {
        if (data.success) setExistingTags(data.data.map((t: any) => t.name));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (formData: any) => {
    // Upload photos first
    const photoUrls: string[] = [];
    if (formData.photos && formData.photos.length > 0) {
      for (const file of formData.photos) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/photos', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          photoUrls.push(data.data.filename);
        }
      }
    }

    const res = await fetch('/api/diaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        photos: photoUrls,
      }),
    });
    const data = await res.json();
    if (data.success) {
      router.push('/diary');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> 返回
      </button>
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-6">✏️ 新建日记</h1>
      <DiaryForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        existingTags={existingTags}
      />
    </div>
  );
}
