'use client';

import React from 'react';
import { X, Search, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MediaDocsPanelProps {
  title: string;
  onClose: () => void;
}

const TABS = ['Media', 'Docs', 'Links'] as const;
type Tab = (typeof TABS)[number];

const FILTERS = ['All', 'PDF', 'Excel', 'Docs'] as const;
type Filter = (typeof FILTERS)[number];

interface DocItem {
  id: number;
  name: string;
  type: 'PDF' | 'Excel' | 'Word';
  size: string;
  date: string;
}

const MOCK_DOCS: DocItem[] = [
  { id: 1, name: 'Weekly Market Analysis_Oct.pdf', type: 'PDF', size: '2.4 MB', date: '24 Oct, 2023' },
  { id: 2, name: 'Portfolio_Tracker_Q3.xlsx', type: 'Excel', size: '1.1 MB', date: '22 Oct, 2023' },
  { id: 3, name: 'Trading_Rules_Guidelines.docx', type: 'Word', size: '845 KB', date: '15 Oct, 2023' },
];

const DocIcon = ({ type }: { type: DocItem['type'] }) => {
  if (type === 'PDF') {
    return (
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-red-500" />
      </div>
    );
  }
  if (type === 'Excel') {
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

const MediaDocsPanel = ({ title, onClose }: MediaDocsPanelProps) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('Docs');
  const [activeFilter, setActiveFilter] = React.useState<Filter>('All');
  const [search, setSearch] = React.useState('');

  const filteredDocs = MOCK_DOCS.filter((doc) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'PDF') return doc.type === 'PDF';
    if (activeFilter === 'Excel') return doc.type === 'Excel';
    if (activeFilter === 'Docs') return doc.type === 'Word';
    return true;
  }).filter((doc) =>
    search ? doc.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="w-[380px] max-h-[520px] bg-white border border-slate-200 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-bold text-[16px] text-slate-800">{title}</h2>
            <p className="text-[12px] text-slate-400 font-medium">Media, links, and docs</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-transparent border-none cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => (
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
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'Docs' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="px-5 pt-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search Documents"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-white border-slate-200 rounded-full text-sm"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="px-5 pb-3 flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[12px] font-medium border cursor-pointer transition-colors",
                  activeFilter === filter
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Doc List */}
          <ScrollArea className="flex-1 px-5">
            <div className="flex flex-col gap-3 pb-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-300 transition-colors"
                >
                  <DocIcon type={doc.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {doc.type} &bull; {doc.size} &bull; {doc.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {activeTab === 'Media' && (
        <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
          No media files
        </div>
      )}

      {activeTab === 'Links' && (
        <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
          No links shared
        </div>
      )}
    </div>
  );
};

export default MediaDocsPanel;
