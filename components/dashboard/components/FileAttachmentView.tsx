'use client';

import React from 'react';
import Image from 'next/image';
import { FileText, FileSpreadsheet, File, Play, Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage, FileAttachment } from '@/store/slices/messageSlice';

// Inline-viewable MIME types keyed by extension. Used to re-tag the fetched blob
// so the browser opens the file in its viewer instead of downloading it when the
// source type is missing or generic.
const INLINE_MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  txt: 'text/plain',
  csv: 'text/csv',
};

// Office documents open straight in their desktop app via the Office URI scheme
// (ms-word:/ms-excel:/ms-powerpoint:). The app fetches the document itself, so it
// needs a reachable http(s) url (a data:/blob: url won't work).
const OFFICE_SCHEME_BY_EXT: Record<string, string> = {
  doc: 'ms-word',
  docx: 'ms-word',
  xls: 'ms-excel',
  xlsx: 'ms-excel',
  ppt: 'ms-powerpoint',
  pptx: 'ms-powerpoint',
};

// "Open" a document: Word/Excel/PowerPoint files launch in their desktop app;
// PDFs/images/video open in a new browser tab (the browser's native viewer)
// instead of downloading. The tab is opened synchronously to survive the popup
// blocker, then pointed at a blob: URL (tagged by extension) once it's fetched.
export const openAttachment = async (attachment: FileAttachment) => {
  const ext = attachment.name.split('.').pop()?.toLowerCase() ?? '';

  const officeScheme = OFFICE_SCHEME_BY_EXT[ext];
  if (officeScheme) {
    const absoluteUrl = /^https?:\/\//i.test(attachment.url)
      ? attachment.url
      : new URL(attachment.url, window.location.origin).href;
    // Only the Office scheme can reach an http(s) document; for a local
    // data:/blob: url fall through to the in-browser open below.
    if (/^https?:\/\//i.test(absoluteUrl)) {
      window.location.href = `${officeScheme}:ofe|u|${absoluteUrl}`;
      return;
    }
  }

  const win = window.open('', '_blank');
  try {
    let blob = await (await fetch(attachment.url)).blob();
    const inlineMime = INLINE_MIME_BY_EXT[ext];
    if (inlineMime && blob.type !== inlineMime) {
      blob = new Blob([blob], { type: inlineMime });
    }
    const objectUrl = URL.createObjectURL(blob);
    if (win) win.location.href = objectUrl;
    else window.location.href = objectUrl;
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch {
    // Network/CORS failure — fall back to opening the original url directly.
    if (win) win.location.href = attachment.url;
    else window.location.href = attachment.url;
  }
};

// "Save as" for a document: prefer the File System Access API so the RA gets a
// native save dialog and can pick any folder (WhatsApp-style). Falls back to a
// regular download (default downloads folder) where the API isn't available.
export const saveAttachmentAs = async (attachment: FileAttachment) => {
  const picker = (window as unknown as {
    showSaveFilePicker?: (opts: { suggestedName?: string }) => Promise<{
      createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }>;
    }>;
  }).showSaveFilePicker;

  try {
    const blob = await (await fetch(attachment.url)).blob();
    if (picker) {
      const handle = await picker({ suggestedName: attachment.name });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = attachment.name;
    link.click();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    // Swallow the cancellation when the RA dismisses the save dialog.
    if ((err as DOMException)?.name === 'AbortError') return;
    // Last-resort fallback: a direct anchor download from the original url.
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  }
};

// Renders a message attachment (image / video / document). `isSent` switches the
// document card to the green "sent" styling; `onOpen` previews images/videos.
const FileAttachmentView = ({ attachment, isSent, onOpen }: { attachment: NonNullable<ChatMessage['attachment']>; isSent: boolean; onOpen: () => void }) => {

  if (attachment.fileType === 'image') {
    return (
      <div className="mb-1 cursor-pointer" onClick={onOpen}>
        <div
          className={cn(
            "inline-flex rounded-xl overflow-hidden border w-fit",
            isSent ? "border-white/20" : "border-slate-200"
          )}
        >
          <Image
            src={attachment.url}
            alt={attachment.name}
            width={260}
            height={220}
            className="max-w-[260px] max-h-[220px] w-auto h-auto object-contain hover:opacity-90 transition-opacity"
            unoptimized
          />
        </div>
        <p className={cn("text-[11px] mt-1.5 font-medium", isSent ? "text-white/70" : "text-slate-400")}>
          {attachment.name} &bull; {attachment.size}
        </p>
      </div>
    );
  }

  if (attachment.fileType === 'video') {
    return (
      <div className="rounded-lg overflow-hidden mb-1 cursor-pointer" onClick={onOpen}>
        <div className="relative max-w-[260px]">
          <video
            src={attachment.url}
            className="max-w-[260px] max-h-[180px] rounded-lg object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg hover:bg-black/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-slate-700 ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>
        <p className={cn("text-[11px] mt-1 font-medium", isSent ? "text-white/70" : "text-slate-400")}>
          {attachment.name} &bull; {attachment.size}
        </p>
      </div>
    );
  }

  // PDF, Doc, Excel, generic file
  const iconMap = {
    pdf: { icon: <FileText className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' },
    doc: { icon: <File className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
    excel: { icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
    file: { icon: <File className="w-5 h-5 text-slate-500" />, bg: 'bg-slate-100' },
  };
  const { icon, bg } = iconMap[attachment.fileType] || iconMap.file;

  return (
    <div
      className={cn(
        "rounded-xl mb-1 min-w-[240px] overflow-hidden",
        isSent ? "bg-emerald-600/30" : "bg-slate-50 border border-slate-200"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", isSent ? "bg-white/20" : bg)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-[12px] font-bold truncate", isSent ? "text-white" : "text-slate-800")}>
            {attachment.name}
          </p>
          <p className={cn("text-[10px] font-medium", isSent ? "text-white/60" : "text-slate-400")}>
            {attachment.fileType.toUpperCase()} &bull; {attachment.size}
          </p>
        </div>
      </div>
      {/* Open / Download actions shown directly below the card so the RA can act
          without an extra click. */}
      <div className={cn("flex border-t", isSent ? "border-white/20" : "border-slate-200")}>
        <button
          type="button"
          onClick={() => openAttachment(attachment)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-semibold cursor-pointer transition-colors",
            isSent ? "text-white hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          Open
        </button>
        <div className={cn("w-[1px]", isSent ? "bg-white/20" : "bg-slate-200")} />
        <button
          type="button"
          onClick={() => saveAttachmentAs(attachment)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-semibold cursor-pointer transition-colors",
            isSent ? "text-white hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
};

export default FileAttachmentView;
