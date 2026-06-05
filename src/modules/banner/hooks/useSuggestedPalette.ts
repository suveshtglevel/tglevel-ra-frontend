'use client';

import { useQuery } from '@tanstack/react-query';
import { getSuggestedPalette } from '@/modules/banner/services/banners.service';

// The most-used CTA / text / background colors across all banners, suggested as
// a starting palette. Cached for a few minutes — it changes rarely.
export function useSuggestedPalette() {
  return useQuery({
    queryKey: ['suggested-palette'],
    queryFn: getSuggestedPalette,
    staleTime: 5 * 60 * 1000,
  });
}
