'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerUploadProps {
  image: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const BannerUpload = ({ image, onUpload, onRemove }: BannerUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onUpload(file);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
      <h2 className="text-[15px] font-semibold text-slate-800 mb-4">Upload Banner Image</h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !image && inputRef.current?.click()}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-colors min-h-[260px] flex items-center justify-center',
          dragging ? 'border-emerald-400 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/60',
          !image && 'cursor-pointer hover:border-slate-300'
        )}
      >
        {image ? (
          <div className="relative w-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden">
              <Image src={image} alt="Banner" fill className="object-cover" unoptimized />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white shadow-sm cursor-pointer"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Upload className="w-9 h-9 text-slate-700" strokeWidth={2.2} />
            <p className="text-sm">Drag & drop or click to upload</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
    </section>
  );
};

export default BannerUpload;
