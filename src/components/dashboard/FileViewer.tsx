'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import type { FileAttachment } from '@/redux/slices/messageSlice';

// Full-screen viewer for an attachment. Rendered through a portal so it sits
// above everything regardless of where it's mounted (chat feed, media panel).
const FileViewer = ({ attachment, onClose }: { attachment: FileAttachment; onClose: () => void }) => {
  // True only after client-side mount (document.body exists for the portal),
  // without calling setState inside an effect.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  if (!mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
          <Download className="w-5 h-5 text-white" />
        </button>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="absolute top-4 left-4 z-10 max-w-[60vw]">
        <p className="text-white text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-white/60 text-xs">{attachment.size}</p>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] flex items-center justify-center">
        {attachment.fileType === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic user-uploaded attachment URL (may be blob:), not optimizable via next/image
          <img src={attachment.url} alt={attachment.name} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
        )}
        {attachment.fileType === 'video' && (
          <video src={attachment.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg" />
        )}
        {attachment.fileType === 'pdf' && (
          <iframe src={attachment.url} className="w-[90vw] sm:w-[80vw] h-[85vh] rounded-lg bg-white" title={attachment.name} />
        )}
        {(attachment.fileType === 'doc' || attachment.fileType === 'excel' || attachment.fileType === 'file') && (
          <div className="bg-white rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-4 text-center mx-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              {attachment.fileType === 'excel' ? <FileSpreadsheet className="w-8 h-8 text-emerald-600" /> : <FileText className="w-8 h-8 text-blue-500" />}
            </div>
            <p className="text-lg font-bold text-slate-800 break-all">{attachment.name}</p>
            <p className="text-sm text-slate-500">{attachment.fileType.toUpperCase()} &bull; {attachment.size}</p>
            <button onClick={handleDownload} className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 cursor-pointer transition-colors">
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default FileViewer;
