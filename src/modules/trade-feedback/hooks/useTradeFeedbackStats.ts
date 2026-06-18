'use client';

import { useQuery } from '@tanstack/react-query';
import { getTradeFeedbackStats } from '@/modules/trade-feedback/services/tradeFeedback.service';

// Overall trade-feedback stats for the RA (total / positive / neutral / negative).
export function useTradeFeedbackStats() {
  return useQuery({
    queryKey: ['trade-feedback-stats'],
    queryFn: getTradeFeedbackStats,
    // No sockets: refetch the stat cards on every navigation to the tab.
    refetchOnMount: 'always',
  });
}
