'use client';

import React from 'react';
import { X, Search, Eye, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewedByPanelProps {
  totalViews: string;
  onClose: () => void;
}

interface ViewerItem {
  id: number;
  name: string;
  avatar: string;
  viewedAt: string;
}

const MOCK_VIEWERS: ViewerItem[] = [
  { id: 1, name: 'Sarah Jenkins', avatar: 'SJ', viewedAt: '02:45 PM' },
  { id: 2, name: 'Michael Chen', avatar: 'MC', viewedAt: '02:30 PM' },
  { id: 3, name: 'Priya Patel', avatar: 'PP', viewedAt: '01:15 PM' },
  { id: 4, name: 'Alex Mercer', avatar: 'AM', viewedAt: '12:40 PM' },
  { id: 5, name: 'Maria Garcia', avatar: 'MG', viewedAt: '11:20 AM' },
  { id: 6, name: 'David Kim', avatar: 'DK', viewedAt: '10:05 AM' },
  { id: 7, name: 'Emma Thompson', avatar: 'ET', viewedAt: '09:30 AM' },
];

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-700',
  'bg-rose-200 text-rose-700',
  'bg-amber-200 text-amber-700',
  'bg-teal-200 text-teal-700',
  'bg-blue-200 text-blue-700',
  'bg-pink-200 text-pink-700',
  'bg-emerald-200 text-emerald-700',
];

const ViewedByPanel = ({ totalViews, onClose }: ViewedByPanelProps) => {
  const [search, setSearch] = React.useState('');

  const filteredViewers = MOCK_VIEWERS.filter((viewer) =>
    search ? viewer.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="w-[340px] h-[450px] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-lg">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-[16px] text-slate-800">Viewed by Users</h2>
          <span className="text-[12px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {totalViews} views
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
          className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shrink-0"
          onClick={() => {
            const csv = ['Name,Viewed At', ...filteredViewers.map((v) => `${v.name},${v.viewedAt}`)].join('\n');
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
        <div className="flex flex-col">
          {filteredViewers.map((viewer, index) => (
            <div
              key={viewer.id}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 last:border-none"
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
              >
                {viewer.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800">{viewer.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-400">
                    Viewed at {viewer.viewedAt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ViewedByPanel;
