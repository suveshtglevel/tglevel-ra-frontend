'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { X, FileText, FileSpreadsheet } from 'lucide-react';
import type { FileAttachment } from '@/store/slices/messageSlice';

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

  // For PDFs, fetch the file and hand the iframe a blob: URL tagged as
  // application/pdf. Pointing the iframe straight at the S3 url downloads the
  // file instead of rendering it, because S3 serves it with
  // `Content-Disposition: attachment` (and sometimes a generic content-type).
  // A re-tagged blob always previews inline.
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (attachment.fileType !== 'pdf') return;
    let cancelled = false;
    let objectUrl: string | null = null;
    (async () => {
      try {
        const blob = await (await fetch(attachment.url)).blob();
        const pdf =
          blob.type === 'application/pdf'
            ? blob
            : new Blob([blob], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(pdf);
        if (!cancelled) setPdfUrl(objectUrl);
      } catch {
        // Network/CORS failure — fall back to the raw url (may download).
        if (!cancelled) setPdfUrl(attachment.url);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.url, attachment.fileType]);

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // A network/CORS failure here would otherwise surface as an unhandled
    // promise rejection (async click handler) and the download would silently
    // do nothing. Catch it and tell the user instead.
    let objectUrl: string | null = null;
    try {
      const blob = await (await fetch(attachment.url)).blob();
      objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = attachment.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error('Could not download the file. Please try again.');
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  if (!mounted) return null;

  const content = (
    // Backdrop click is a supplementary mouse affordance; keyboard users close
    // via Escape (handled above) or the labelled X button.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
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
          pdfUrl ? (
            <iframe src={pdfUrl} className="w-[90vw] sm:w-[80vw] h-[85vh] rounded-lg bg-white" title={attachment.name} />
          ) : (
            <div className="w-[90vw] sm:w-[80vw] h-[85vh] rounded-lg bg-white flex items-center justify-center">
              <p className="text-sm text-slate-500">Loading preview…</p>
            </div>
          )
        )}
        {(attachment.fileType === 'doc' || attachment.fileType === 'excel' || attachment.fileType === 'file') && (
          <div className="bg-white rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-4 text-center mx-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              {attachment.fileType === 'excel' ? <FileSpreadsheet className="w-8 h-8 text-emerald-600" /> : <FileText className="w-8 h-8 text-blue-500" />}
            </div>
            <p className="text-lg font-bold text-slate-800 break-all">{attachment.name}</p>
            <p className="text-sm text-slate-500">{attachment.fileType.toUpperCase()} &bull; {attachment.size}</p>
            <button onClick={(e) => handleDownload(e)} className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 cursor-pointer transition-colors">
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
