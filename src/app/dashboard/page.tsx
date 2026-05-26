'use client';

import React from 'react';
import { 
  MessageSquare, 
  MonitorPlay, 
  Settings, 
  Search, 
  MoreVertical, 
  TrendingUp, 
  Users, 
  Eye, 
  FileSpreadsheet, 
  Pin, 
  ChevronDown,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Type,
  Smile,
  AlignLeft,
  List,
  Image as ImageIcon,
  Paperclip,
  Video,
  BarChart2,
  Zap,
  Undo2,
  Redo2,
  Send,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const communities = [
    { id: 1, name: 'Nifty & Bank Nifty', members: '12.4k', time: '10:42 AM', active: true },
    { id: 2, name: 'Equity Options', members: '8.2k', time: '10:42 AM', active: false },
    { id: 3, name: 'Commodities', members: '5.1k', time: '10:42 AM', active: false },
    { id: 4, name: 'Swing Trades', members: '15k', time: '10:42 AM', active: false },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar - Far Left */}
      <aside className="w-16 flex flex-col items-center py-6 bg-white border-r border-slate-200 gap-8">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
          <MessageSquare className="w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-6 flex-1">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
            <MonitorPlay className="w-6 h-6" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs cursor-pointer">
            TJ
          </div>
        </nav>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
          <Settings className="w-6 h-6" />
        </Button>
      </aside>

      {/* Community Sidebar */}
      <section className="w-80 flex flex-col bg-white border-r border-slate-200">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              TG
            </div>
            <h2 className="font-bold text-slate-800">TG Levels</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search For Community" 
              className="pl-9 h-10 bg-slate-50 border-none rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="px-4 flex gap-2 mb-6">
          <Badge className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-lg border-none">ALL</Badge>
          <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 px-4 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">Free</Badge>
          <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 px-4 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">Premium</Badge>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-3 pb-4">
            {communities.map((comm) => (
              <Card 
                key={comm.id} 
                className={cn(
                  "p-4 border-slate-100 shadow-none rounded-2xl cursor-pointer transition-all hover:border-emerald-200",
                  comm.active && "border-emerald-200 bg-emerald-50/30"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-emerald-500 border border-slate-100">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{comm.name}</h3>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Users className="w-3 h-3" />
                        <span className="text-[11px] font-medium">{comm.members}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{comm.time}</span>
                </div>
                <div className="flex justify-end mt-2">
                  <ChevronDown className="w-4 h-4 text-slate-300" />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </section>

      {/* Main Feed Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Nifty & Bank Nifty</h1>
              <p className="text-xs text-slate-400 font-medium">12,402 members</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-600">Views: 24.5k</span>
            </div>
            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 gap-2 font-bold h-9">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
        </header>

        {/* Pinned Info */}
        <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center justify-between text-sm shrink-0">
          <div className="flex items-center gap-3 text-slate-700 font-bold overflow-hidden">
            <Pin className="w-4 h-4 text-emerald-500 rotate-45 shrink-0" />
            <span className="truncate">Bank Nifty 44200 CE Buy Above 250</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Feed Scroll Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto py-8 px-6 flex flex-col items-center">
            <div className="mb-8 flex items-center gap-4 w-full">
              <div className="flex-1 h-[1px] bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</span>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>

            {/* Research Card */}
            <Card className="w-full max-w-xl bg-[#E6F9F3] border-[#C2EDDF] p-6 rounded-3xl shadow-none">
              <div className="space-y-4 text-slate-800">
                <div className="font-bold flex items-center gap-2">
                  ✅'RESEARCH ANALYSIS✅
                </div>
                <div className="font-black text-lg">BUY NIFTY 12 MAY 24100 PE</div>
                <div className="space-y-1 font-bold">
                  <p>Entry Above = 180</p>
                  <p>SL = 165</p>
                  <p>Target 1 = 195</p>
                  <p>Target 2 = 210</p>
                </div>
                
                <div className="pt-4 border-t border-emerald-200/50">
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
                    Disclaimer: Investments in the market are subject to market risk. Please read all related documents carefully before investing. Registration granted by SEBI, Enlistment as RA with Exchange and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.
                  </p>
                </div>

                <div className="space-y-1 text-sm font-bold">
                  <p>Our Customer Care:- 77380 63455</p>
                  <p>Rationale=<a href="#" className="text-emerald-600 underline">https://bit.ly/4tBVOrE</a></p>
                </div>

                <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100">
                  <p className="text-[11px] text-slate-500 font-bold uppercase mb-1">Confidence Level Trade</p>
                  <p className="font-bold flex items-center gap-2">🟡 Medium probability</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">#123</span>
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5 rounded-md px-2">Nifty</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]">
                    10:45 AM
                    <div className="flex">
                      <Zap className="w-3 h-3 fill-current" />
                      <Zap className="w-3 h-3 fill-current -ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* Message Input Section */}
        <div className="p-6 bg-[#F8FAFC] shrink-0">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
              {/* Tool Options */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-600 gap-2 font-bold px-4">
                    Select Group <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-600 gap-2 font-bold px-4">
                    Select Message Type <ChevronDown className="w-4 h-4" />
                  </Button>
                  <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                  <div className="flex items-center gap-3">
                    <Switch />
                    <span className="text-sm font-bold text-slate-500">Notify Users</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-emerald-600 font-bold bg-emerald-50 rounded-lg px-4 h-9">
                    + Bundle
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 font-bold h-10 gap-2 shadow-lg shadow-emerald-500/20">
                    Send <Send className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              </div>

              {/* Rich Text Toolbar */}
              <div className="px-6 py-3 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Bold className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Italic className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Strikethrough className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Underline className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Type className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Smile className="h-4 w-4" /></Button>
                  <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><AlignLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><List className="h-4 w-4" /></Button>
                  <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><ImageIcon className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Paperclip className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Video className="h-4 w-4" /></Button>
                  <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><BarChart2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Zap className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Undo2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Redo2 className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Text Area */}
              <div className="px-6 py-4 min-h-[120px]">
                <textarea 
                  placeholder="Type your message here..."
                  className="w-full bg-transparent border-none outline-none resize-none text-slate-600 placeholder:text-slate-300 font-medium"
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
