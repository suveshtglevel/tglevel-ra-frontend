'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { updateBanner, deleteBanner, type UpdateBannerInput } from '@/modules/banner/services/banners.service';
import { getApiErrorMessage } from '@/lib/errors/api-error';

// Update a banner; refreshes the list on success. Success/error toasts are left
// to the caller (the form needs a status-aware message).
export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBannerInput }) => updateBanner(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  });
}

// Soft-delete a banner; refreshes the list and toasts the result.
export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
