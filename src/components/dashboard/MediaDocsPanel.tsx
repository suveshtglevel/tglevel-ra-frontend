'use client';

import React from 'react';
import { X, Search, FileText, FileSpreadsheet, File, Play, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import type { ChatMessage } from '@/redux/slices/messageSlice';

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

// Open an attachment from the device: Word/Excel/PowerPoint files launch in their
// desktop app; PDFs/images/video open in a new browser tab (the browser's native
// viewer) instead of showing a download dialog. The tab is opened synchronously
// to survive the popup blocker, then pointed at a blob: URL once the file fetches.
const openAttachment = async (name: string, url: string) => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';

  const officeScheme = OFFICE_SCHEME_BY_EXT[ext];
  if (officeScheme) {
    const absoluteUrl = /^https?:\/\//i.test(url)
      ? url
      : new URL(url, window.location.origin).href;
    // Only the Office scheme can reach an http(s) document; for a local
    // data:/blob: url fall through to the in-browser open below.
    if (/^https?:\/\//i.test(absoluteUrl)) {
      window.location.href = `${officeScheme}:ofe|u|${absoluteUrl}`;
      return;
    }
  }

  const win = window.open('', '_blank');
  try {
    let blob = await (await fetch(url)).blob();
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
    if (win) win.location.href = url;
    else window.location.href = url;
  }
};

interface MediaDocsPanelProps {
  title: string;
  messages: ChatMessage[];
  onClose: () => void;
}

const TABS = ['Media', 'Docs', 'Links'] as const;
type Tab = (typeof TABS)[number];

const DOC_FILTERS = ['All', 'PDF', 'Excel', 'Docs'] as const;
type DocFilter = (typeof DOC_FILTERS)[number];

interface MediaEntry { id: string; name: string; size: string; url: string; fileType: 'image' | 'video'; }
interface DocEntry { id: string; name: string; size: string; url: string; fileType: 'pdf' | 'doc' | 'excel' | 'file'; }
interface LinkEntry { id: string; url: string; text: string; }

// Pull every <a href> out of a message's HTML content.
const LINK_REGEX = /<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
const extractLinks = (messages: ChatMessage[]): LinkEntry[] => {
  const links: LinkEntry[] = [];
  messages.forEach((m) => {
    if (!m.content) return;
    LINK_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = LINK_REGEX.exec(m.content)) !== null) {
      const url = match[1];
      const text = match[2].replace(/<[^>]*>/g, '').trim() || url;
      links.push({ id: `${m.id}-${links.length}`, url, text });
    }
  });
  return links;
};

const DocIcon = ({ fileType }: { fileType: DocEntry['fileType'] }) => {
  if (fileType === 'pdf') {
    return (
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-red-500" />
      </div>
    );
  }
  if (fileType === 'excel') {
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
      <File className="w-5 h-5 text-blue-500" />
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <div className="py-12 text-center text-slate-400 text-sm">{text}</div>
);

const MediaDocsPanel = ({ title, messages, onClose }: MediaDocsPanelProps) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('Media');
  const [docFilter, setDocFilter] = React.useState<DocFilter>('All');
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);
  const q = debouncedSearch.trim().toLowerCase();

  // Derive media / docs / links from this chat's messages.
  const { media, docs, links } = React.useMemo(() => {
    const media: MediaEntry[] = [];
    const docs: DocEntry[] = [];
    messages.forEach((m) => {
      const a = m.attachment;
      if (!a) return;
      if (a.fileType === 'image' || a.fileType === 'video') {
        media.push({ id: m.id, name: a.name, size: a.size, url: a.url, fileType: a.fileType });
      } else {
        docs.push({ id: m.id, name: a.name, size: a.size, url: a.url, fileType: a.fileType });
      }
    });
    return { media, docs, links: extractLinks(messages) };
  }, [messages]);

  const filteredMedia = media.filter((m) => (q ? m.name.toLowerCase().includes(q) : true));
  const filteredDocs = docs
    .filter((d) => {
      if (docFilter === 'PDF') return d.fileType === 'pdf';
      if (docFilter === 'Excel') return d.fileType === 'excel';
      if (docFilter === 'Docs') return d.fileType === 'doc' || d.fileType === 'file';
      return true;
    })
    .filter((d) => (q ? d.name.toLowerCase().includes(q) : true));
  const filteredLinks = links.filter((l) =>
    q ? l.text.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) : true
  );

  const searchPlaceholder =
    activeTab === 'Media' ? 'Search media' : activeTab === 'Docs' ? 'Search documents' : 'Search links';

  return (
    <div className="w-[90vw] max-w-[380px] max-h-[520px] bg-white border border-slate-200 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0">
            <h2 className="font-bold text-[16px] text-slate-800 truncate">{title}</h2>
            <p className="text-[12px] text-slate-400 font-medium">Media, links, and docs</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-transparent border-none cursor-pointer rounded-full hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 shrink-0">
        {TABS.map((tab) => {
          const count = tab === 'Media' ? media.length : tab === 'Docs' ? docs.length : links.length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 text-[13px] font-medium bg-transparent border-none cursor-pointer transition-colors",
                activeTab === tab
                  ? "text-emerald-600 border-b-2 border-emerald-500"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}{count > 0 && <span className="ml-1 text-[11px]">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Search (debounced) */}
      <div className="px-5 pt-4 pb-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white border-slate-200 rounded-full text-sm"
          />
        </div>
      </div>

      {/* Doc filters (Docs tab only) */}
      {activeTab === 'Docs' && (
        <div className="px-5 pb-3 flex flex-wrap gap-2 shrink-0">
          {DOC_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setDocFilter(filter)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[12px] font-medium border cursor-pointer transition-colors",
                docFilter === filter
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0 px-5">
        {activeTab === 'Media' && (
          filteredMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 pb-4">
              {filteredMedia.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  title={m.name}
                  onClick={() => openAttachment(m.name, m.url)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:opacity-90 transition-opacity cursor-pointer p-0"
                >
                  {m.fileType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic user-uploaded media URL (may be blob:), not optimizable via next/image
                    <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <video src={m.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="No media shared yet" />
          )
        )}

        {activeTab === 'Docs' && (
          filteredDocs.length > 0 ? (
            <div className="flex flex-col gap-3 pb-4">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openAttachment(doc.name, doc.url)}
                  className="flex items-center gap-3 p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-300 transition-colors text-left w-full"
                >
                  <DocIcon fileType={doc.fileType} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {doc.fileType.toUpperCase()} &bull; {doc.size}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState text="No documents shared yet" />
          )
        )}

        {activeTab === 'Links' && (
          filteredLinks.length > 0 ? (
            <div className="flex flex-col gap-2 pb-4">
              {filteredLinks.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <LinkIcon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{l.text}</p>
                    <p className="text-[11px] text-indigo-500 font-medium truncate">{l.url}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <EmptyState text="No links shared" />
          )
        )}
      </ScrollArea>
    </div>
  );
};

export default MediaDocsPanel;
