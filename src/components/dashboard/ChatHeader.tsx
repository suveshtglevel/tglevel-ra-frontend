'use client';

import React from 'react';
import { TrendingUp, FileSpreadsheet, MoreVertical, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import MediaDocsPanel from './MediaDocsPanel';
import type { ChatMessage } from '@/redux/slices/messageSlice';

interface ChatHeaderProps {
  title: string;
  members: string;
  messages?: ChatMessage[];
  onMenuClick?: () => void;
}

const ChatHeader = ({ title, members, messages = [], onMenuClick }: ChatHeaderProps) => {
  const [showPanel, setShowPanel] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!showPanel) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPanel]);

  const handleExcelExport = () => {
    // Generate CSV content from dummy data
    const csvContent = [
      ['Community', 'Members', 'Status'],
      [title, members, 'Active'],
      ['', '', ''],
      ['Trade History', '', '', ''],
      ['Date', 'Type', 'Symbol', 'Entry', 'SL', 'Target 1', 'Target 2', 'Status'],
      ['2023-10-24', 'BUY', 'NIFTY 24100 PE', '180', '165', '195', '210', 'Target 1 Hit'],
      ['2023-10-23', 'BUY', 'BANKNIFTY 44200 CE', '250', '220', '280', '310', 'SL Hit'],
      ['2023-10-22', 'SELL', 'NIFTY 24300 CE', '150', '170', '130', '110', 'Target 2 Hit'],
      ['2023-10-21', 'BUY', 'NIFTY 24000 PE', '200', '180', '220', '240', 'Active'],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Excel exported successfully!');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-slate-800 text-sm sm:text-base truncate">{title}</h1>
          <p className="text-xs text-slate-400 font-medium truncate">{members}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 gap-2 font-bold h-9 px-2.5 sm:px-3 cursor-pointer"
          onClick={handleExcelExport}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden sm:inline">Excel</span>
        </Button>
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={() => setShowPanel((prev) => !prev)}
          >
            <MoreVertical className="h-5 w-5 text-slate-400" />
          </Button>

          {showPanel && (
            <div className="absolute top-12 right-0 z-50 shadow-xl rounded-2xl overflow-hidden">
              <MediaDocsPanel
                title={title}
                messages={messages}
                onClose={() => setShowPanel(false)}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
