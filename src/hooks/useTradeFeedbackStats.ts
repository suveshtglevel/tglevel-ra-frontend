'use client';

import { useQuery } from '@tanstack/react-query';
import { getTradeFeedbackStats } from '@/lib/api/tradeFeedback';

// Overall trade-feedback stats for the RA (total / positive / neutral / negative).
export function useTradeFeedbackStats() {
  return useQuery({
    queryKey: ['trade-feedback-stats'],
    queryFn: getTradeFeedbackStats,
  });
}
