'use client';

import React from 'react';
import { X, Send, FileText, FileSpreadsheet, File as FileIcon, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FilePreviewData } from './MessageComposer';

interface FilePreviewScreenProps {
  file: FilePreviewData;
  onSend: (file: FilePreviewData, caption?: string) => void;
  onCancel: () => void;
}

const FilePreviewScreen = ({ file, onSend, onCancel }: FilePreviewScreenProps) => {
  const [caption, setCaption] = React.useState('');

  const handleSend = () => {
    onSend(file, caption || undefined);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      {/* Header with close */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-slate-800 truncate">{file.name}</p>
            <p className="text-[11px] text-slate-400">{file.fileType.toUpperCase()} &bull; {file.size}</p>
          </div>
        </div>
      </div>

      {/* Preview Area - takes up all available space */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        {file.fileType === 'image' && (
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
          />
        )}
        {file.fileType === 'video' && (
          <div className="relative max-w-full max-h-full">
            <video
              src={file.url}
              controls
              className="max-w-full max-h-[60vh] rounded-xl shadow-lg"
            />
          </div>
        )}
        {file.fileType === 'pdf' && (
          <iframe
            src={file.url}
            className="w-full h-full rounded-xl shadow-lg bg-white border border-slate-200"
            title={file.name}
          />
        )}
        {(file.fileType === 'doc' || file.fileType === 'excel' || file.fileType === 'file') && (
          <div className="bg-white rounded-2xl p-12 flex flex-col items-center gap-4 shadow-lg border border-slate-200">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
              {file.fileType === 'excel' ? (
                <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
              ) : file.fileType === 'doc' ? (
                <FileIcon className="w-10 h-10 text-blue-500" />
              ) : (
                <FileIcon className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <p className="text-lg font-bold text-slate-800">{file.name}</p>
            <p className="text-sm text-slate-400">{file.fileType.toUpperCase()} &bull; {file.size}</p>
          </div>
        )}
      </div>

      {/* Bottom: Caption input + Send */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-[991px] mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            autoFocus
            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/10 bg-[#F8FAFC]"
          />
          <Button
            onClick={handleSend}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 px-6 font-bold text-[13px] gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            Send <Send className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewScreen;
