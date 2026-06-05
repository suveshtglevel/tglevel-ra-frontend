'use client';

import React from 'react';
import Image from 'next/image';
import { X, Search, Eye, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useMessageStats } from '@/modules/dashboard/hooks/useMessageStats';
import type { MessageViewer } from '@/modules/dashboard/services/messageStats.service';

interface ViewedByPanelProps {
  messageId: string;
  onClose: () => void;
}

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-700',
  'bg-rose-200 text-rose-700',
  'bg-amber-200 text-amber-700',
  'bg-teal-200 text-teal-700',
  'bg-blue-200 text-blue-700',
  'bg-pink-200 text-pink-700',
  'bg-emerald-200 text-emerald-700',
];

// First two initials of a viewer's name, for the avatar fallback.
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

// "1 Jun 2025, 12:00 AM" style label for a seen-at timestamp.
const formatSeenAt = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const ViewedByPanel = ({ messageId, onClose }: ViewedByPanelProps) => {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useMessageStats(messageId);

  const viewers: MessageViewer[] = data?.seen_by ?? [];
  const totalSeen = data?.total_seen ?? 0;

  const filteredViewers = viewers.filter((viewer) =>
    debouncedSearch
      ? viewer.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true
  );

  return (
    <div className="w-[90vw] max-w-[340px] h-[70vh] max-h-[450px] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-lg">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-[16px] text-slate-800">Viewed by Users</h2>
          <span className="text-[12px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {totalSeen} {totalSeen === 1 ? 'view' : 'views'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 bg-transparent border-none cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-slate-100 mx-5" />

      {/* Search + Download */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white border-slate-200 rounded-full text-sm"
          />
        </div>
        <button
          type="button"
          disabled={filteredViewers.length === 0}
          className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            const csv = [
              'Name,Email,Seen At',
              ...filteredViewers.map((v) => `${v.name},${v.email},${formatSeenAt(v.seen_at)}`),
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'viewed_by_users.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Viewers List */}
      <ScrollArea className="flex-1 min-h-0">
        {isLoading ? (
          <p className="px-5 py-8 text-center text-[13px] text-slate-400">Loading…</p>
        ) : isError ? (
          <p className="px-5 py-8 text-center text-[13px] text-red-400">
            Couldn&apos;t load viewers.
          </p>
        ) : filteredViewers.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-slate-400">
            {viewers.length === 0 ? 'No one has seen this message yet.' : 'No matching users.'}
          </p>
        ) : (
          <div className="flex flex-col">
            {filteredViewers.map((viewer, index) => (
              <div
                key={viewer.user_id}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 last:border-none"
              >
                {/* Avatar — profile image when present, initials otherwise. */}
                {viewer.profile_image ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative bg-slate-100">
                    <Image
                      src={viewer.profile_image}
                      alt={viewer.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                  >
                    {initialsOf(viewer.name)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{viewer.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-400 truncate">
                      Viewed {formatSeenAt(viewer.seen_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ViewedByPanel;
