'use client';
import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { DiaryType, MoodType, ActivityType, DiaryEntry } from '@/types/diary';
import MoodSelector from './MoodSelector';
import ActivitySelector from './ActivitySelector';
import PhotoUploader, { PhotoFile } from './PhotoUploader';
import TagInput from './TagInput';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const TYPE_OPTIONS: { type: DiaryType; emoji: string; label: string; desc: string }[] = [
  { type: 'text', emoji: '📝', label: '日记', desc: '自由书写' },
  { type: 'mood', emoji: '😊', label: '心情', desc: '记录情绪' },
  { type: 'checkin', emoji: '✅', label: '打卡', desc: '运动活动' },
];

interface DiaryFormProps {
  initialData?: DiaryEntry | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  existingTags?: string[];
}

export default function DiaryForm({ initialData, onSubmit, onCancel, existingTags = [] }: DiaryFormProps) {
  const [type, setType] = useState<DiaryType>(initialData?.type || 'text');
  const [content, setContent] = useState(initialData?.content || '');
  const [mood, setMood] = useState<MoodType | null>(initialData?.mood || null);
  const [activityType, setActivityType] = useState<ActivityType>(initialData?.activity_type || 'cycling');
  const [activityName, setActivityName] = useState(initialData?.activity_name || '');
  const [photos, setPhotos] = useState<PhotoFile[]>(
    initialData?.photos?.map(p => ({
      id: p.id,
      url: p.url || `/uploads/${p.filename}`,
      name: p.original_name || p.filename,
    })) || []
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        content,
        mood: type === 'mood' ? mood : undefined,
        activity_type: type === 'checkin' ? activityType : undefined,
        activity_name: type === 'checkin' && activityType === 'custom' ? activityName : undefined,
        tags,
        photos: photos.filter(p => p.file).map(p => p.file),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Type selector */}
      <div>
        <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2.5 block">
          类型
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setType(opt.type)}
              className={clsx(
                'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all duration-150',
                type === opt.type
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)] scale-[1.02]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-tertiary)]'
              )}
            >
              <span className="text-xl leading-none">{opt.emoji}</span>
              <span className="text-[12px] font-semibold">{opt.label}</span>
              <span className="text-[10px] opacity-60">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood selector */}
      {type === 'mood' && (
        <div>
          <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2.5 block">
            心情状态
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>
      )}

      {/* Activity selector */}
      {type === 'checkin' && (
        <div>
          <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2.5 block">
            活动类型
          </label>
          <ActivitySelector
            value={activityType}
            customName={activityName}
            onChange={setActivityType}
            onCustomNameChange={setActivityName}
          />
        </div>
      )}

      {/* Photo uploader */}
      {type === 'checkin' && (
        <div>
          <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2.5 block">
            照片 <span className="text-[var(--color-error)] normal-case font-normal">（至少1张）</span>
          </label>
          <PhotoUploader photos={photos} onChange={setPhotos} />
        </div>
      )}

      {/* Content */}
      <div>
        <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2.5 block">
          {type === 'checkin' ? '记录一句话' : type === 'mood' ? '一句话描述' : '写下今天的...'}
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={
            type === 'mood' ? '今天的心情是...' :
            type === 'checkin' ? '记录这次活动的感受...' :
            '写下今天的所见所想...'
          }
          maxLength={type === 'mood' ? 200 : undefined}
          rows={4}
          className="w-full px-3.5 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-2 border-[var(--color-border)] rounded-xl text-[13.5px] leading-relaxed outline-none resize-none focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-elevated)] focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.12)] placeholder:text-[var(--color-text-placeholder)] transition-all duration-150"
        />
        {type === 'mood' && (
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1 text-right">{content.length}/200</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2.5 block">
          标签 <span className="normal-case font-normal">（可选）</span>
        </label>
        <TagInput tags={tags} onChange={setTags} suggestions={existingTags} />
      </div>

      {/* References — 只读展示，不可编辑 */}
      {initialData?.references && initialData.references.length > 0 && (
        <div>
          <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2.5 block">
            引用来源
          </label>
          <div className="flex flex-col gap-1.5">
            {initialData.references.map(ref => (
              <div
                key={ref.id}
                className="flex items-start gap-2 p-2.5 bg-[var(--color-bg-secondary)] rounded-xl border-l-[3px] border-[var(--color-primary-light)]"
              >
                <span className="text-sm mt-[1px]">
                  {ref.source_type === 'news' ? '📰' : ref.source_type === 'book' ? '📚' : '🎬'}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                    {ref.source_content}
                  </p>
                  {ref.source_date && (
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{ref.source_date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[var(--color-border-light)]" />

      {/* Actions */}
      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" size="md" onClick={onCancel}>取消</Button>
        <Button variant="primary" size="md" onClick={handleSubmit} disabled={submitting || !content.trim()}>
          {submitting ? '保存中...' : (initialData ? '更新日记' : '保存日记')}
        </Button>
      </div>
    </div>
  );
}
