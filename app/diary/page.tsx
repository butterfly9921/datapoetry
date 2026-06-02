'use client';
import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import DiaryList from '@/components/diary/DiaryList';
import DiaryForm from '@/components/diary/DiaryForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';
import { DiaryEntry } from '@/types/diary';

function DiaryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('tag') ? 'all' : 'all');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || '');
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);
  const [deletingDiary, setDeletingDiary] = useState<DiaryEntry | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  const fetchDiaries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('type', activeFilter);
      if (tagFilter) params.set('tag', tagFilter);
      const res = await fetch(`/api/diaries?${params}`);
      const data = await res.json();
      if (data.success) {
        setDiaries(data.data.items);
      }
    } catch (e) {
      console.error('Failed to fetch diaries:', e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, tagFilter]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/tag-cloud?limit=50');
      const data = await res.json();
      if (data.success) {
        setExistingTags(data.data.map((t: any) => t.name));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchDiaries(); }, [fetchDiaries]);
  useEffect(() => { fetchTags(); }, [fetchTags]);

  // Handle tag filter from URL
  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) {
      setTagFilter(tag);
    }
  }, [searchParams]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter !== 'all') setTagFilter('');
    router.push('/diary');
  };

  const handleTagClick = (tag: string) => {
    setTagFilter(tag);
    setActiveFilter('all');
    router.push(`/diary?tag=${encodeURIComponent(tag)}`);
  };

  const handleCreate = async (formData: any) => {
    const res = await fetch('/api/diaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success) {
      setShowNewForm(false);
      fetchDiaries();
      fetchTags();
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingDiary) return;
    const res = await fetch(`/api/diaries/${editingDiary.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success) {
      setEditingDiary(null);
      fetchDiaries();
      fetchTags();
    }
  };

  const handleDelete = async () => {
    if (!deletingDiary) return;
    const res = await fetch(`/api/diaries/${deletingDiary.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setDeletingDiary(null);
      fetchDiaries();
      fetchTags();
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[20px] font-bold text-[var(--color-text)] tracking-tight">日记</h1>
          {tagFilter && (
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)] rounded-full text-[12px] font-medium border border-[var(--color-primary-light)]">
                #{tagFilter}
              </span>
              <button
                onClick={() => { setTagFilter(''); router.push('/diary'); }}
                className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <Button variant="pill" size="md" onClick={() => setShowNewForm(true)}>
          <Plus size={16} strokeWidth={2.5} /> 写日记
        </Button>
      </div>

      <DiaryList
        diaries={diaries}
        loading={loading}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onEdit={setEditingDiary}
        onDelete={setDeletingDiary}
        onTagClick={handleTagClick}
      />

      {/* New Diary Modal */}
      <Modal isOpen={showNewForm} onClose={() => setShowNewForm(false)} title="新建日记">
        <DiaryForm
          onSubmit={handleCreate}
          onCancel={() => setShowNewForm(false)}
          existingTags={existingTags}
        />
      </Modal>

      {/* Edit Diary Modal */}
      <Modal isOpen={!!editingDiary} onClose={() => setEditingDiary(null)} title="编辑日记">
        {editingDiary && (
          <DiaryForm
            initialData={editingDiary}
            onSubmit={handleUpdate}
            onCancel={() => setEditingDiary(null)}
            existingTags={existingTags}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingDiary}
        onClose={() => setDeletingDiary(null)}
        onConfirm={handleDelete}
        title="删除日记"
        message="确定要删除这条日记吗？此操作不可撤销。"
        confirmText="删除"
        variant="danger"
      />
    </div>
    </PageTransition>
  );
}

export default function DiaryPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-[var(--color-bg-secondary)] rounded-2xl animate-pulse" />}>
      <DiaryPageContent />
    </Suspense>
  );
}