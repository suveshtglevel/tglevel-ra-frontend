'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

const ResearchCard = ({ analysis }: ResearchCardProps) => {
  return (
    <Card className="w-full max-w-xl bg-[#E6F9F3] border-[#C2EDDF] p-6 rounded-3xl shadow-none">
      <div className="space-y-4 text-slate-800">
        <div className="font-bold flex items-center gap-2 text-[15px]">
          ✅'RESEARCH ANALYSIS✅
        </div>
        <div className="font-black text-lg lg:text-xl tracking-tight">{analysis.title}</div>
        <div className="space-y-1.5 font-bold text-sm lg:text-[15px]">
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
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]">
            {analysis.time}
            <div className="flex">
              <Zap className="w-3 h-3 fill-current" />
              <Zap className="w-3 h-3 fill-current -ml-1" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResearchCard;
