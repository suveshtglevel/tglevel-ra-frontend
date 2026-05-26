'use client';

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type MessageStatus = 'sent' | 'delivered' | 'read';

interface ResearchCardProps {
  analysis: {
    title: string;
    entry: string;
    sl: string;
    target1: string;
    target2: string;
    disclaimer: string;
    customerCare: string;
    rationale: string;
    confidence: string;
    id: string;
    tag: string;
    time: string;
  };
  status?: MessageStatus;
}

const StatusTick = ({ status }: { status: MessageStatus }) => {
  if (status === 'sent') {
    return <Check className="w-4 h-4 text-[#94A3B8]" />;
  }
  if (status === 'delivered') {
    return <CheckCheck className="w-4 h-4 text-[#94A3B8]" />;
  }
  return <CheckCheck className="w-4 h-4 text-[#3B82F6]" />;
};

const ResearchCard = ({ analysis, status = 'read' }: ResearchCardProps) => {
  return (
    <Card className="w-[448px] bg-[#E6F9F3] border-[#C2EDDF] p-6 rounded-3xl shadow-none">
      <div className="space-y-4 text-slate-800">
        <div className="font-bold flex items-center gap-2 text-[15px]">
          ✅*RESEARCH ANALYSIS✅
        </div>
        <div className="font-bold text-[13px] leading-[18.57px] tracking-[0px]" style={{ fontFamily: 'Inter' }}>
          {analysis.title}
        </div>
        <div className="space-y-1.5 font-medium text-[13px] leading-[18.57px] tracking-[0px]" style={{ fontFamily: 'Inter' }}>
          <p>Entry Above = {analysis.entry}</p>
          <p>SL = {analysis.sl}</p>
          <p>Target 1 = {analysis.target1}</p>
          <p>Target 2 = {analysis.target2}</p>
        </div>
        
        <div className="pt-4 border-t border-emerald-200/50">
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
            {analysis.disclaimer}
          </p>
        </div>

        <div className="space-y-1.5 text-[13px] font-bold">
          <p>Our Customer Care:- {analysis.customerCare}</p>
          <p>Rationale=<a href={analysis.rationale} className="text-emerald-600 underline" target="_blank" rel="noopener noreferrer">{analysis.rationale}</a></p>
        </div>

        <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100">
          <p className="text-[11px] text-slate-500 font-bold uppercase mb-1.5 tracking-wider">Confidence Level Trade</p>
          <p className="font-bold flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            {analysis.confidence}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">#{analysis.id}</span>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5 rounded-md px-2 border-none">
              {analysis.tag}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[10px] text-slate-500">
            {analysis.time}
            <StatusTick status={status} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResearchCard;
