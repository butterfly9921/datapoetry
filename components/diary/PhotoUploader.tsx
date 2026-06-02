'use client';
import React, { useState, useCallback, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface PhotoFile {
  id: string;
  file?: File;
  url: string;
  name: string;
}

interface PhotoUploaderProps {
  photos: PhotoFile[];
  onChange: (photos: PhotoFile[]) => void;
  maxPhotos?: number;
}

export default function PhotoUploader({ photos, onChange, maxPhotos = 9 }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((files: FileList | File[]) => {
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) return;

    const newPhotos: PhotoFile[] = Array.from(files).slice(0, remaining).map(file => ({
      id: `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    onChange([...photos, ...newPhotos]);
  }, [photos, onChange, maxPhotos]);

  const removePhoto = useCallback((id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo?.url && photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url);
    }
    onChange(photos.filter(p => p.id !== id));
  }, [photos, onChange]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden bg-[var(--color-bg-secondary)] group">
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      {photos.length < maxPhotos && (
        <div
          className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-150 ${
            isDragging
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-muted)]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg,image/png,image/webp';
            input.multiple = true;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files) addFiles(target.files);
            };
            input.click();
          }}
        >
          <ImageIcon size={24} className="text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">
            拖拽照片到这里，或点击上传
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            JPG/PNG/WebP · 最多{maxPhotos}张 · 每张≤5MB
          </p>
        </div>
      )}
    </div>
  );
}

export type { PhotoFile };
